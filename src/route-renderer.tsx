import { ReactNode, memo, useMemo, useState, Suspense, useEffect } from 'react';
import { Guard, MatchedRoute, MatchedRouteFragment } from './router.types';
import { useFragment } from './custom-hooks/use-fragment';

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
  const fragment = useFragment();

  useEffect(() => {
    if(initialRenderDone === false) {
      setInitialRenderDone(true);
    }
  }, []);

  useEffect(() => { // Scroll down to anchor if fragment exists and the page is rendered.
    if(fragment !== undefined && fragment !== '' && fragment.startsWith('#')) {
      let element: HTMLElement | null;
      let i = 0;
      const checkElementInterval = setInterval(() => { // We have to wait for element to appear on page.
        element = document.getElementById(fragment.replace('#', ''));
        if(element) {
          clearInterval(checkElementInterval);
          location.href = fragment;
        }
        if(++i > 100) {
          clearInterval(checkElementInterval);
        }
      }, 10);

      return () => { clearInterval(checkElementInterval); };
    }
  }, [fragment]);

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
