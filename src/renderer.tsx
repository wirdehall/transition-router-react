import { ReactNode, memo, useState } from 'react';
import { MatchedRoute, RouterReturnType } from './router.types';
import TransitionManager from './transition-manager';
import { RouterContext, RouterContextType } from './router-context';
import RouteRenderer from './route-renderer';

export type RendererParams = Readonly<{
  notFound?: ReactNode;
  fallback?: React.ReactNode;
}>;

const Renderer = memo(({ notFound, fallback, navigate, initalParams, initalLocationPath, ...props }: RouterReturnType & RendererParams) => {
  const [matchedRoute, setMatchedRoute] = useState<MatchedRoute | undefined>(props.initalMatchedRoute);
  const [routerContext, setRouterContext] = useState<RouterContextType>({
    navigate,
    params: initalParams,
    locationPath: initalLocationPath,
  });

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
      <RouteRenderer notFound={notFound} matchedRoute={matchedRoute} fallback={fallback} />
    </RouterContext.Provider>
  </>);
});

export default Renderer;
