import { ReactNode, memo, useCallback, useMemo, useState } from 'react';
import { MatchedRoute, MatchedRouteFragment, RouterReturnType } from './router.types';
import TransitionManager from './transition-manager';
import { RouterContext, RouterContextType } from './router-context';

export type RendererParams = Readonly<{
  notFound?: ReactNode;
}>;

const Renderer = memo(({ notFound, navigate, initalParams, initalLocationPath, ...props }: RouterReturnType & RendererParams) => {

  const [matchedRoute, setMatchedRoute] = useState<MatchedRoute | undefined>(props.initalMatchedRoute);
  const [routerContext, setRouterContext] = useState<RouterContextType>({
    navigate,
    params: initalParams,
    locationPath: initalLocationPath,
  });


  const renderRecursive = useCallback((matchedRoute: MatchedRouteFragment) => {
    const Comp = matchedRoute.component;

    if(matchedRoute.child) {
      return <Comp>{ renderRecursive(matchedRoute.child) }</Comp>
    }

    return <Comp></Comp>
  }, []);

  const renderedRoutes = useMemo(() => {
    if(matchedRoute) {
      return renderRecursive(matchedRoute.fragment);
    }
  }, [matchedRoute, renderRecursive]);

  if(matchedRoute === undefined) {
    if(notFound !== undefined) {
      return notFound;
    }
    return <h3>No route matched!</h3>;
  }

  return (<>
    <TransitionManager
      { ...props }
      navigate={navigate}
      setMatchedRoute={setMatchedRoute}
      setRouterContext={setRouterContext}
      initalParams={initalParams}
      initalLocationPath={initalLocationPath}
    />
    <RouterContext.Provider value={routerContext}>
      { renderedRoutes }
    </RouterContext.Provider>
  </>);
});

export default Renderer;
