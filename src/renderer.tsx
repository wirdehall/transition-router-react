import { ReactNode, memo, useState } from 'react';
import { MatchedRoute, RouterReturnType } from './router.types';
import TransitionManager from './transition-manager';
import { RouterContext, RouterContextType } from './router-context';
import RouteRenderer from './route-renderer';

export type RendererParams = Readonly<{
  notFound?: ReactNode;
  ssrSuspenseFallback?: React.ReactNode;
  clientWithoutSsr?: true;
}>;

const Renderer = memo(({ notFound, ssrSuspenseFallback, clientWithoutSsr, navigate, initalParams, initalLocationPath, ...props }: RouterReturnType & RendererParams) => {
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
      <RouteRenderer
        matchedRoute={matchedRoute}
        notFound={notFound}
        ssrSuspenseFallback={ssrSuspenseFallback}
        clientWithoutSsr={clientWithoutSsr}
      />
    </RouterContext.Provider>
  </>);
});

export default Renderer;
