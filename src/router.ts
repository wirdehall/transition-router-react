import {
  EventHandler, Event, RouterReturnType, Routes, InternalRoutes, MatchedRoute,
  Params, MatchedRouteFragment, NavigateFunction, InternalRoute, Route
} from './router.types';
import { matchRoute } from './match-route';
import { trimString } from './helpers/string';
import { TemporaryRedirect } from './temporary-redirect';

const fragmentRegex = /#[^/]*$/;

const getInternalRoute = (path: string, route: Route): InternalRoute => {
  let containsSplat = false;
  return {
    ...route,
    path,
    pathFragments: trimString(path, '/').split('/').map((fragment, index, array) => {
      if(fragment === '*') {
        if(array.length !== index + 1) {
          throw new Error("Route splat (*) can only be at the end of path, maybe you wanted to use a wildcard (:name) instead?");
        }
        containsSplat = true;
        return { fragment, wildcard: false, splat: true };
      } else if(fragment.startsWith(':')) {
        return { fragment: fragment.replace(':', ''), wildcard: true, splat: false };
      } else {
        return { fragment, wildcard: false, splat: false };
      }
    }),
    children: route.children === undefined ? undefined : splitRoutes(route.children),
    containsSplat,
  }
}

const splitRoutes = (routes: Routes): InternalRoutes => {
  return routes.reduce((acc: Array<InternalRoute>, route) => {
    if(route.path === undefined) {
      acc.push({
        ...route,
        path: undefined,
        pathFragments: [],
        children: route.children === undefined ? undefined : splitRoutes(route.children),
        containsSplat: false,
      });
    } else if(typeof route.path === 'string') {
      acc.push(getInternalRoute(route.path, route));
    } else {
      route.path.map((path) => acc.push(getInternalRoute(path, route)));
    }
    return acc;
  }, []);
}

const flattenParams = (matchedRoute: MatchedRouteFragment): Params => {
  if(matchedRoute.child === undefined) {
    return matchedRoute.params;
  }
  return { ...matchedRoute.params, ...flattenParams(matchedRoute.child) }
}

const findSplatRecursive = (matchedRoute: MatchedRouteFragment): string | undefined => {
  if(matchedRoute.child === undefined) {
    return matchedRoute.splat;
  }
  return findSplatRecursive(matchedRoute.child)
}

type RouterParams = Readonly<{
  routes: Routes,
  path?: string,
  ssr?: boolean,
}>;

function Router(routerParams: RouterParams): RouterReturnType {
  const isServer = routerParams.ssr ?? false;
  const routes: InternalRoutes = splitRoutes(routerParams.routes);

  let history: History;
  let locationPath: string;
  let subscriptions: Array<{ id: number, eventHandler: EventHandler}> = [];
  let currentlyMatchedRoute: MatchedRoute;
  let currentParams: Params = {};
  let currentSplat: string | undefined;
  let backCallbackResolve: undefined | ((value: boolean | PromiseLike<boolean>) => void);

  const navigate: NavigateFunction = (url: string | undefined, { force = false, updateHistory = true, async = false, replace = false } = {}) => {
    if(isServer) {
      if(url === undefined) {
        return new Promise((resolve) => resolve(false));
      }
      throw new TemporaryRedirect(url);
    }

    return new Promise<boolean>((resolve) => {
      if(url === undefined || (url === locationPath && !force)) {
        resolve(false);
        return;
      }

      if(url === 'back') {
        history.back();
        backCallbackResolve = resolve;
      } else {
        const [ fragment ] = url.match(fragmentRegex) ?? [];
        const urlPath = fragment ? url.replace(fragment, '') : url;
        const matchedRoute = matchRoute(urlPath, routes);
        if(matchedRoute) {
          if(updateHistory) {
            if(replace) {
              history.replaceState({}, '', url);
            } else {
              history.pushState({}, '', url);
            }
          }
          currentlyMatchedRoute = matchedRoute;
          currentParams = flattenParams(currentlyMatchedRoute.fragment);
          currentSplat = findSplatRecursive(currentlyMatchedRoute.fragment);
          locationPath = urlPath;
          const doNavigation = () => {
            publish({
              eventName: 'navigation',
              data: {
                matchedRoute: currentlyMatchedRoute,
                params: currentParams,
                locationPath,
                fragment,
                splat: currentSplat,
                doneCallback: () => resolve(true)
              }
            });
          };
          if(async) {
            setTimeout(() => doNavigation());
          } else {
            doNavigation();
          }
        } else {
          console.error(`Tried to navigate to ${url}, no route was matched!`);
          resolve(false);
        }
      }
    });
  }

  let subscriptionIdIncrament = 0;
  const subscribe = (eventHandler: EventHandler) => {
    const id = ++subscriptionIdIncrament;
    // Unsubscribing should be done more seldome than pusing events so use array instead of object.
    subscriptions.push({ id, eventHandler });
    return () => subscriptions = subscriptions.filter(sub => sub.id !== id);
  }

  const publish = (event: Event) => {
    subscriptions.map((sub) => sub.eventHandler(event));
  }

  let fragment: string | undefined;
  // SSR / Not in the browser
  if(isServer) {
    if(routerParams.path === undefined) {
      throw new Error("While running in node you need to provide path");
    }
    locationPath = routerParams.path;
  } else {
    locationPath = routerParams.path === undefined ? window.location.pathname : routerParams.path;
    history = window.history;
    fragment = window.location.hash;
  }

  const initialMatchedRoute = matchRoute(locationPath, routes);
  if(initialMatchedRoute === undefined) {
    console.error(`Tried to navigate to ${locationPath}, no route was matched!`);
  } else {
    currentlyMatchedRoute = initialMatchedRoute;
    currentParams = flattenParams(currentlyMatchedRoute.fragment);
    currentSplat = findSplatRecursive(currentlyMatchedRoute.fragment);
  }

  // If we're in the browser / Not SSR
  if(!isServer) {
    window.addEventListener("popstate", () => {
      navigate(window.location.pathname, { updateHistory: false }).then((result) => {
        if(backCallbackResolve !== undefined) {
          backCallbackResolve(result);
          backCallbackResolve = undefined;
        }
      });
    });
  }

  return {
    subscribe,
    publish,
    navigate,
    initialMatchedRoute,
    initialLocationPath: locationPath,
    initialParams: currentParams,
    initialFragment: fragment,
    initialSplat: currentSplat,
  };
}

export default Router;
