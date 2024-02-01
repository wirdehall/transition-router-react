import type { PropsWithChildren } from "react";

export type Params = Readonly<{ [key: string]: string }>;

export type MatchedRouteFragment = {
  component: React.ComponentType<PropsWithChildren>;
  child?: MatchedRouteFragment;
  params: Params;
}

export type MatchedRoute = {
  fragment: MatchedRouteFragment;
  path: string;
}

export type Route = Readonly<{
  component: React.ComponentType<PropsWithChildren>;
  path?: string;
  children?: Routes;
}>;

export type PathFragment = {
  fragment: string;
  wildcard: boolean;
  splat: boolean;
};

export type PathFragments = ReadonlyArray<PathFragment>;

export type InternalRoute = Route & Readonly<{
  pathFragments: PathFragments;
  children?: InternalRoutes;
  containsSplat: boolean;
}>;

export type Routes = ReadonlyArray<Route>;
export type InternalRoutes = ReadonlyArray<InternalRoute>;

export type NavigationEvent = {
  eventName: 'navigation',
  data: { matchedRoute: MatchedRoute, params: Params, locationPath: string }
}

export type TransitionEvent = {
  eventName: 'transition',
  data: { isTransitioning: boolean }
}

export type Event = NavigationEvent | TransitionEvent;

export type EventHandler = ({ eventName, data }: Event) => void;

export type NavigateFunction = (url: string | undefined, force?: boolean, updateHistory?: boolean) => void;

export type RouterReturnType = Readonly<{
  subscribe: (eventHandler: EventHandler) => void;
  publish: (event: Event) => void;
  navigate: NavigateFunction;
  initalMatchedRoute: MatchedRoute | undefined;
  initalLocationPath: string;
  initalParams: Params;
}>;
