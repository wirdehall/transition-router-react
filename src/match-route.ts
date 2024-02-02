import { trimString } from "./helpers/string";
import { InternalRoutes, MatchedRoute, MatchedRouteFragment, Params } from "./router.types";

export const matchRoute = (path: string, routes: InternalRoutes): MatchedRoute | undefined => {
  const fragment = matchRouteFragment(trimString(path, '/').split('/'), routes);
  return fragment === undefined ? undefined : { fragment, path };
}

export const matchRouteFragment = (pathFragments: ReadonlyArray<string>, routes: InternalRoutes): MatchedRouteFragment | undefined => {
  for (const route of routes) {
    let params: Params = {};
    let stillAMatch = true;
    if(route.pathFragments.length === 0) {
      if(route.children) {
        const child = matchRouteFragment(pathFragments, route.children);
        if(child != undefined) {
          return { component: route.component, child, params, extraComponents: route.extraComponents };
        }
        continue;
      } else {
        throw new Error("Empty path without children not allowed, if you want a catchall use splash (*)");
      }
    } else {
      if(!route.containsSplat && route.children === undefined && route.pathFragments.length !== pathFragments.length) {
        continue;
      }
      let i = 0;
      for (const routeFragment of route.pathFragments) {
        // Too short url path
        if(i > pathFragments.length) {
          stillAMatch = false;
          break;
        }
        if(routeFragment.splat) {
          return { component: route.component, params, extraComponents: route.extraComponents };
        }
        if(routeFragment.wildcard) {
          params = { ...params, [routeFragment.fragment]: pathFragments[i] };
        } else if (routeFragment.fragment !== pathFragments[i]) {
          stillAMatch = false;
          break;
        }
        i++;
      }
    }

    if(stillAMatch) {
      const remainingFragments = pathFragments.slice(route.pathFragments.length, pathFragments.length + 1);
      if(route.children) {
        const child = matchRouteFragment(remainingFragments, route.children);
        if(child != undefined) {
          return { component: route.component, child, params, extraComponents: route.extraComponents };
        }
      } else if(remainingFragments.length === 0) {
        return { component: route.component, params, extraComponents: route.extraComponents };
      }
    }
  }
  return undefined;
}
