# Transition-router-react <!-- omit in toc -->
Transition-router-react is a small powerful router leveraging react transitions for a more interactive UX.

## Table of content <!-- omit in toc -->
- [Motivation](#motivation)
  - [Benefits compared to competitors](#benefits-compared-to-competitors)
  - [When not to use this router](#when-not-to-use-this-router)
- [Requirements](#requirements)
- [How to install](#how-to-install)
- [API](#api)
  - [Component API](#component-api)
  - [Exported types API](#exported-types-api)
  - [Hook API](#hook-api)
- [How to use](#how-to-use)
  - [How to define a path in your routes](#how-to-define-a-path-in-your-routes)
    - [Wildcard](#wildcard)
    - [Splat](#splat)
  - [Simple example](#simple-example)
  - [Example of transition and navigation stored in redux](#example-of-transition-and-navigation-stored-in-redux)
  - [Advanced example of SSR usage using express](#advanced-example-of-ssr-usage-using-express)
  - [Hooks for convinience](#hooks-for-convinience)
    - [useNavigate](#usenavigate)
    - [useLocationPath](#uselocationpath)
    - [useParams](#useparams)
- [Future features to implement](#future-features-to-implement)
- [Contributing](#contributing)


## Motivation
I was building a react frontend where I needed transitions instead of suspended navigation. To add to this it had to work
with reacts new SSR implementation. I was originally running React-Router but found it cumbersome and not playing very well
with reacts new features so I buildt my own.  
Goals for this was a small event based router which would be easy to subscribe to with very similar router definitions to react-routers
data api.
A plus would be if the repo would add zero dependencies to any project using this. Dependency bloat and dependency hell is a real thing.

### Benefits compared to competitors
| Comparison point | transition-router-react | react-router |
|------------------|------------------------ |------------- |
| Dependencies | 0 | 1 |
| Size gziped + minified | 2kb | 18.7kb *(2024-02-01)*|
| Size gziped + minified including deps | 2kb | 35.2kb *(2024-02-01)*|
| Native Transitions | Yes | No, needs to hack around, using hidden functions that can be changed at any point |
| Easy use with SSR | One router, works out of the box | Needs to use multiple routers |

### When not to use this router
TRR (transition-router-react) does not try to solve every obscure use-case, I'm aming for the unix approach instead, make it do one thing well.  
With that said I think this repo will be able to handle the majority of use-cases.  
Features not included on purpose:
* Data fetching before route loads. **Reason:** Many of the popular data-fetching libs been moving towards hooks and that does not work outside react components. Seams like bloat to implement a feature which will be unsed by most.
* Separete errorBoundry parameter. **Reason:** Just wrap your route with a parent errorBoundry no need to introduce more complexity. I found that most of the time I will even want multiple routes sharing errorBoundry so declaring for each route seams wastefull as well.
* Case-sensitve paths **Reason:** Don't see a use-case for this. I know the W3 definition of a url states that it should be case-sensitve but; I have never in my life seen a url which had upper-case characters and doesn't work with lower-case. I'm sure they exist but that's not good UX and not something that should be encuraged in my opinion. 

## Requirements
* React >= 18

## How to install
```bash
$ npm i transition-router-react
```

## API
### Component API
| Component      | Description                                                       |
| -------------- | ----------------------------------------------------------------- |
| Router         | Takes `RouterParams` object as param. Returns `RouterReturnType`. |
| RouterRenderer | Takes `RouterReturnType` as param.                                |

### Exported types API

| Type             | Description                                                       |
| ---------------- | ----------------------------------------------------------------- |
| Routes | ReadonlyArray\<Route\> |
| Route | Readonly<{<br>&nbsp;&nbsp;component: React.ComponentType<PropsWithChildren>;<br>&nbsp;&nbsp;path?: string;<br>&nbsp;&nbsp;children?: Routes;<br>}> |
| RouterParams     |  Readonly<{ routes: Routes, path?: string, ssr?: boolean }><br><br>If used in SSR context the `ssr` and `path` flag needs to be pressent.<br>`ssr` set to true and path flag set to requested path.<br> |
| RouterReturnType |Readonly<{<br>&nbsp;&nbsp;subscribe: (eventHandler: EventHandler) => void;<br>&nbsp;&nbsp;publish: (event: Event) => void;<br>&nbsp;&nbsp;navigate: NavigateFunction;<br>&nbsp;&nbsp;initalMatchedRoute: MatchedRoute \| undefined;<br>&nbsp;&nbsp;initalLocationPath: string;<br>&nbsp;&nbsp;initalParams: Params;<br>}><br><br>The entire return object should be passed to RouterRenderer but we can also make use of subscribe and publish for advanced use-cases. |

### Hook API

| Hook             | Description                                                       |
| ---------------- | ----------------------------------------------------------------- |
| useNavigate      | Returns a function for navigating. Is the only way you should navigate inside your applicaiton.<br>The only exception would be if you are navigating outside of react context, for example in redux or something like that. Then you can use the navigate function returned in `RouterReturnType`.  |
| useLocationPath  | Returns current urlPath works both in SSR context and in browser. |
| useParams        | Returns an object with url params defined in your routes. Not to be confused with get params in the url. |

## How to use

### How to define a path in your routes

Path is optional as long as your `Route` has children.  
A `Route` with children can still have a path, it will be prepended to all child routes.  
A path does not start with a slash or end trailing slash.

A path is otherwise just a string with the ability to use wildcards and splat.  

#### Wildcard
A wildcard starts with a colon.  
Example: `blog/:page` in this url page will be a wildcard and will match `blog/1` or `blog/this-is-a-title`.  
But it will not match `blog/1/more-stuff` or just `blog`.

#### Splat
A splat is denoted by `*`.  
Example: `blog/*` in this url page will be a wildcard and will match `blog/1`, `blog/this-is-a-title` or `blog/this-is-a-title/potato/tomato`.  
But it will not match just `blog`.

A splat has to be at the end of the path definition. It's not allowed if the `Route` has children or in the middle of the path definition.
Example of invalid splat useage: `*/blog` or `blog/*/tomato` you will have to use wildcards and be more precis in these use-cases.

### Simple example
```ts
// index.ts
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterRenderer, Router } from 'transition-router-react';
import { getRoutes } from './routing/routes.ts';

const router = Router({ routes: getRoutes() });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Suspense>
      <RouterRenderer { ...router } />
    </Suspense>
  </React.StrictMode>,
);
```
```ts
// routing/routes.ts
import type { Routes } from 'transition-router-react';
export const getRoutes = (): Routes => {
  return [
    {
      component: CoreDefaultLayout,
      children: [
        {
          path: '',
          component: React.lazy(() => import("./pages/start")),
        },
        {
          path: 'contact',
          component: React.lazy(() => import("./pages/contact")),
        },
        {
          path: 'blog/:search/:page',
          component: React.lazy(() => import("./pages/show/tire-show-page.loader")),
        },
      ]
    },
    {
      path: '*',
      component: React.lazy(() => import("./pages/404"))
    },
  ];
}
```
### Example of transition and navigation stored in redux
```ts
// index.ts
...

const router = Router({ routes: getRoutes() });

store.dispatch(setLocationAndParams({ location: router.initalLocationPath, params: router.initalParams }));
router.subscribe(({ eventName, data }) => {
  if(eventName === 'transition') {
    store.dispatch(setTransitionStatus(data.isTransitioning));
  } else if(eventName === 'navigation') {
    store.dispatch(setLocationAndParams({ location: data.locationPath, params: data.params }));
  }
});

...

```
I personaly subscribe to the `transition` event and use `isTransitioning` in redux to to show navigation transitions in my application.

### Advanced example of SSR usage using express
```ts
// Express input here...
// Including request, bootstrapScripts, errorMessage if we get one of those etc.
// ...

const origin = `${request.protocol}://${request.get("host")}`;
const url = new URL(request.originalUrl || request.url, origin);
const path = url.pathname;

const routes = getRoutes();
const router = Router({ routes, path, ssr: true });

const error = errorMessage
  ? new InternalServerError(errorMessage)
  : undefined;

let errorBoundaryTriggeredError: BaseError | undefined;
const receiveError = (error: BaseError) => {
  errorBoundaryTriggeredError = error;
}

const getErrorBoundaryTriggeredError = () => errorBoundaryTriggeredError;

let fallbackResolved = false;
let resolveFallbackPromise: (val?: boolean | undefined) => void;
const fallbackPromise = new Promise((resolve) => {
  resolveFallbackPromise = () => {
    fallbackResolved = true;
    resolve(true);
  };
})

const Fallback = ({ getError }: { getError: () => BaseError | undefined }) => {
  if(!fallbackResolved) {
    throw fallbackPromise;
  }
  const routerContext = {
    navigate: router.navigate,
    params: router.initalParams,
    locationPath: router.initalLocationPath,
  }

  return <RouterContext.Provider value={routerContext}><ErrorRenderer error={getError()} /></RouterContext.Provider>;
}

const { pipe, abort } = ReactDOM.renderToPipeableStream(
  (
    <React.StrictMode>
      <Suspense fallback={<Fallback getError={getErrorBoundaryTriggeredError} />}>
        <RouterRenderer { ...router } />
      </Suspense>
    </React.StrictMode>
  ),
  {
    ...bootstrapScripts,
    onAllReady() {
      // Render logic here...
    },
    onError(error) {
      receiveError(error);
      resolveFallbackPromise();
    }
  }
); 
```

### Hooks for convinience
The following hooks are exposed `useNavigate`, `useLocationPath`, `useParams` to be used in your components.

#### useNavigate
Example on how to do a Link component that can be used throughout the system.
```ts
import { useNavigate } from 'transition-router-react';
import React, { Ref } from "react";

type Params = {
  to?: string;
  disabled?: boolean;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

const Link = React.forwardRef(({to, disabled = false, children, ...rest}: Params, ref: Ref<HTMLAnchorElement> | undefined) => {
  const navigate = useNavigate();
  const clickHandler = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if(!disabled) {
      navigate(to);
    }
  }

  return <a href={to} onClick={clickHandler} ref={ref} { ...rest }>{ children }</a>
});

export default Link;
```

#### useLocationPath
```ts
const locationPath = useLocationPath();
console.log(locationPath);
```

#### useParams
Url parameters defined in your routes with prefix colon.  
Example: `path: 'blog/:search/:page'`
```ts
const urlParams = useParams();
console.log(urlParams.search, urlParams.page);
```

## Future features to implement
* **Route guards** might be something I'll be looking into. But I'm going to investigate the topic more before adding more features.  
If you would like to see Route guards or not please let me know and why. I will take it in to consideration while deciding.
* If you know something you think should be part of TRR that is currently missing, let me know. But know that I will be taking a conservative stance on adding features since I don't want this repo to be bloated. As I mentioned under [When not to use this router](#when-not-to-use-this-router), the aim is to do one thing well. Not everything.


## Contributing

Anyone is free to open a PR and contribute to this project... just be civilized!
