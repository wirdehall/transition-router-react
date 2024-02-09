import { useEffect, useState, useTransition } from 'react';
import { MatchedRoute, RouterReturnType } from './router.types';
import { RouterContextType } from './router-context';

type Props = Readonly<{
  setMatchedRoute: (matchedRoute: MatchedRoute | undefined) => void;
  setRouterContext: (routerContext: RouterContextType) => void;
}>;

function TransitionManager({
  subscribe,
  publish,
  initalMatchedRoute,
  navigate,
  initalParams,
  initalLocationPath,
  setMatchedRoute,
  setRouterContext
}: RouterReturnType & Props) {
  const [matchedRoute, setMatchedRouteLocal] = useState<MatchedRoute | undefined>(initalMatchedRoute);
  const [routerContext, setRouterContextLocal] = useState<RouterContextType>({
    navigate,
    params: initalParams,
    locationPath: initalLocationPath
  });
  const [doneNavigatingCallback, setDoneNavigatingCallback] = useState<null | (() => void)>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    publish({ eventName: 'transition', data: { isTransitioning: isPending }});
  }, [publish, isPending]);

  useEffect(() => {
    const unsubscribe = subscribe(({ eventName, data }) => {
      if(eventName === 'navigation') {
        setRouterContextLocal({
          navigate,
          params: data.params,
          locationPath: data.locationPath,
        });
        setMatchedRouteLocal(data.matchedRoute);
        setDoneNavigatingCallback(() => () => data.doneCallback());
      }
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    startTransition(() => {
      setRouterContext(routerContext);
      setMatchedRoute(matchedRoute);
      if(doneNavigatingCallback !== null && doneNavigatingCallback !== undefined) {
        doneNavigatingCallback();
        setDoneNavigatingCallback(null);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedRoute])
  return null;
}


export default TransitionManager;
