import { ReactNode, memo, useMemo, useState } from 'react';
import { Guard, MatchedRoute, MatchedRouteFragment } from './router.types';
import { Suspense } from 'react';
import { useEffect } from 'react';

export type RendererParams = Readonly<{
  matchedRoute: MatchedRoute | undefined;
  notFound?: ReactNode;
  ssrSuspenseFallback?: ReactNode;
  clientWithoutSsr?: true;
}>;

type MutableGuards = Array<Guard>;

const renderGuardsRecursivly = (guards: MutableGuards, renderedComponent: ReactNode): ReactNode => {
  if(guards.length === 0) {
    return renderedComponent;
  }
  const GuardComponent: Guard = guards.pop() as Guard;
  return renderGuardsRecursivly(guards, <GuardComponent>{ renderedComponent }</GuardComponent>);
}

const renderGuards = (matchedRoute: MatchedRouteFragment, renderedComponent: ReactNode) => {
  if(matchedRoute.guards !== undefined) {
    return renderGuardsRecursivly(matchedRoute.guards.slice() as MutableGuards, renderedComponent);
  }
  return renderedComponent;
}

const renderRecursive = (matchedRoute: MatchedRouteFragment) => {
  const Comp = matchedRoute.component;

  let extraComponents;
  if(matchedRoute.extraComponents) {
    extraComponents = Object.entries(matchedRoute.extraComponents).reduce((acc, [name, Component]) => ({
      ...acc, [name]: <Component></Component>
    }), {});
  }

  if(matchedRoute.child) {
    if (extraComponents) {
      return renderGuards(matchedRoute, <Comp { ...extraComponents }>{ renderRecursive(matchedRoute.child) }</Comp>);
    }

    return renderGuards(matchedRoute, <Comp>{ renderRecursive(matchedRoute.child) }</Comp>);
  }

  if (extraComponents) {
    return renderGuards(matchedRoute, <Comp { ...extraComponents }></Comp>);
  }

  return renderGuards(matchedRoute, <Comp></Comp>);
}

const RouteRenderer = memo(({ notFound, ssrSuspenseFallback, matchedRoute, clientWithoutSsr }: RendererParams) => {
  const [ initialRenderDone, setInitialRenderDone ] = useState(clientWithoutSsr ? false : true);

  useEffect(() => {
    if(initialRenderDone === false) {
      setInitialRenderDone(true);
    }
  }, []);

  const renderedRoutes = useMemo(() => {
    if(matchedRoute) {
      return renderRecursive(matchedRoute.fragment);
    }
  }, [matchedRoute]);

  if(matchedRoute === undefined) {
    if(notFound !== undefined) {
      return notFound;
    }
    return <h3>No route matched!</h3>;
  }

  if(!initialRenderDone) {
    return null;
  }

  return <Suspense fallback={ssrSuspenseFallback}>{renderedRoutes}</Suspense>;
});

export default RouteRenderer;
