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

const Renderer = memo(({ notFound, ssrSuspenseFallback, clientWithoutSsr, navigate, initialParams, initialLocationPath, initialFragment, initialSplat, ...props }: RouterReturnType & RendererParams) => {
  const [matchedRoute, setMatchedRoute] = useState<MatchedRoute | undefined>(props.initialMatchedRoute);
  const [routerContext, setRouterContext] = useState<RouterContextType>({
    navigate,
    params: initialParams,
    locationPath: initialLocationPath,
    fragment: initialFragment,
    splat: initialSplat,
  });

  return (<>
    <TransitionManager
      { ...props }
      navigate={navigate}
      setMatchedRoute={setMatchedRoute}
      setRouterContext={setRouterContext}
      initialParams={initialParams}
      initialLocationPath={initialLocationPath}
      initialFragment={initialFragment}
      initialSplat={initialSplat}
    />
    <RouterContext value={routerContext}>
      <RouteRenderer
        matchedRoute={matchedRoute}
        notFound={notFound}
        ssrSuspenseFallback={ssrSuspenseFallback}
        clientWithoutSsr={clientWithoutSsr}
      />
    </RouterContext>
  </>);
});

export default Renderer;
