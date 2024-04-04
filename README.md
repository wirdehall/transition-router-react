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
  - [Link Component API](#link-component-api)
- [How to use](#how-to-use)
  - [Defining a Route](#defining-a-route)
    - [How to define a path in your routes](#how-to-define-a-path-in-your-routes)
      - [Wildcard](#wildcard)
      - [Splat](#splat)
  - [RouterRenderer definitions](#routerrenderer-definitions)
    - [notFound](#notfound)
    - [ssrSuspenseFallback](#ssrsuspensefallback)
    - [clientWithoutSsr](#clientwithoutssr)
  - [Simple example](#simple-example)
  - [Example of transition and navigation stored in redux](#example-of-transition-and-navigation-stored-in-redux)
  - [Advanced example of SSR usage using express](#advanced-example-of-ssr-usage-using-express)
  - [Example of submenu as extraComponent](#example-of-submenu-as-extracomponent)
  - [How to use guards](#how-to-use-guards)
  - [Hooks for convinience](#hooks-for-convinience)
    - [useNavigate](#usenavigate)
    - [useLocationPath](#uselocationpath)
    - [useParams](#useparams)
- [Contributing](#contributing)


## Motivation
I was building a react frontend where I needed transitions instead of suspended navigation. To add to this it had to work
with reacts new SSR implementation. I was originally running React-Router but found it cumbersome and not playing very well
with reacts new features so I buildt my own.  
Goals for this was a small event based router which would be easy to subscribe to with very similar router definitions to react-routers
data api.
A plus would be if the repo would add zero dependencies to any project using this. Dependency bloat and dependency hell is a real thing.

### Benefits compared to competitors
| Comparison point | transition-router-react | react-router (dom) |
|------------------|------------------------ |------------------- |
| Dependencies | 0 | 2 |
| Size gziped + minified | 2.2kb [link](https://bundlephobia.com/package/transition-router-react) | 23.7kB  *(2024-02-09)* [link](https://bundlephobia.com/package/react-router-dom) |
| Native Transitions | Yes | No, needs to hack around, using hidden functions that can be changed at any point |
| Easy use with SSR | One router, works out of the box | Needs to use multiple routers |


### When not to use this router
TRR (transition-router-react) does not try to solve every obscure use-case, I'm aming for the unix approach instead, make it do one thing well.  
With that said I think this repo will be able to handle the majority of use-cases.  
Features not included on purpose:
* Data fetching before route loads. **Reason:** Many of the popular data-fetching libs been moving towards hooks and that does not work outside react components. Seams like bloat to implement a feature which will be unsed by most.
* Separete errorBoundry parameter. **Reason:** Just wrap your route with a parent errorBoundry no need to introduce more complexity. I found that most of the time I will even want multiple routes sharing errorBoundry so declaring for each route seams wastefull as well.
* Case-sensitve paths **Reason:** Don't see a use-case for this. I know the W3 definition of a url states that it should be case-sensitve but; I have never in my life seen a url which had upper-case characters and doesn't work with lower-case. I'm sure they exist but that's not good UX and not something that should be encuraged in my opinion. 

If one of these features are required for you, then this router is probably not for your current project.

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
| RouterRenderer | Takes `RouterReturnType` as param. <br><br>Optional params:<br>notFound?: ReactNode;<br>ssrSuspenseFallback?: ReactNode;<br>clientWithoutSsr?: true;                                            |

### Exported types API

| Type             | Description                                                       |
| ---------------- | ----------------------------------------------------------------- |
| Routes | ReadonlyArray\<Route\> |
| Route | Readonly<{<br>&nbsp;&nbsp;component: React.ComponentType<PropsWithChildren<{ [name: string]: ReactNode }>>;<br>&nbsp;&nbsp;path?: string;<br>&nbsp;&nbsp;children?: Routes;<br>&nbsp;&nbsp;extraComponents?: Readonly<{ [name: string]: React.ComponentType\<PropsWithChildren> }>;<br>&nbsp;&nbsp;guards?: ReadonlyArray<React.FunctionComponent\<PropsWithChildren>>;<br>}> |
| RouterParams     |  Readonly<{ routes: Routes, path?: string, ssr?: boolean }><br><br>If used in SSR context the `ssr` and `path` flag needs to be pressent.<br>`ssr` set to true and path flag set to requested path.<br> |
| RouterReturnType |Readonly<{<br>&nbsp;&nbsp;subscribe: (eventHandler: EventHandler) => void;<br>&nbsp;&nbsp;publish: (event: Event) => void;<br>&nbsp;&nbsp;navigate: NavigateFunction;<br>&nbsp;&nbsp;initalMatchedRoute: MatchedRoute \| undefined;<br>&nbsp;&nbsp;initalLocationPath: string;<br>&nbsp;&nbsp;initalParams: Params;<br>}><br><br>The entire return object should be passed to RouterRenderer but we can also make use of subscribe and publish for advanced use-cases. |

### Hook API

| Hook             | Description                                                       |
| ---------------- | ----------------------------------------------------------------- |
| useNavigate      | Returns a function for navigating. Is the only way you should navigate inside your applicaiton.<br>The only exception would be if you are navigating outside of react context, for example in redux or something like that. Then you can use the navigate function returned in `RouterReturnType`.  |
| useLocationPath  | Returns current urlPath works both in SSR context and in browser. |
| useParams        | Returns an object with url params defined in your routes. Not to be confused with get params in the url. |

### Link Component API
A small Link component to use instead of a-tags in your project.

For examples and documentation read the [link.md](./docs/link.md).

## How to use

### Defining a Route

  `component`: A Route needs to have a component to render. This will be the component that is rendered for this url.  
  If a Route has children the component will recieve the matched child component as a paramenter.  

  `path`: Determines if url is a match or not. More on paths below.

  `children`: Are just an array of more Routes. It can go recursivly as many steps as you want.

  `extraComponents`: An object with components that will be added as paramenters to the defined `component` of this Route regardless of which child is being rendered. Example of use-case is when a layout have different submenu depending on which route is being shown. Guards could also be a use-case.

  `guards`: Array of guards. Read more under [How to use guards](#how-to-use-guards).

#### How to define a path in your routes

Path is optional as long as your `Route` has children.  
A `Route` with children can still have a path, it will be prepended to all child routes.  
A path does not start with a slash or end trailing slash.

A path is otherwise just a string with the ability to use wildcards and splat.  

##### Wildcard
A wildcard starts with a colon.  
Example: `blog/:page` in this url page will be a wildcard and will match `blog/1` or `blog/this-is-a-title`.  
But it will not match `blog/1/more-stuff` or just `blog`.

##### Splat
A splat is denoted by `*`.  
Example: `blog/*` in this url page will be a wildcard and will match `blog/1`, `blog/this-is-a-title` or `blog/this-is-a-title/potato/tomato`.  
But it will not match just `blog`.

A splat has to be at the end of the path definition. It's not allowed if the `Route` has children or in the middle of the path definition.
Example of invalid splat useage: `*/blog` or `blog/*/tomato` you will have to use wildcards and be more precis in these use-cases.

### RouterRenderer definitions
The most simple usage of the RouterRenderer is just passing the return object from when you define your router into RouterRenderer.
```ts
const router = Router({ routes: getRoutes() });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterRenderer { ...router } />
  </React.StrictMode>,
);
```

But there are a few more optional options to know about.

#### notFound
If no route (including wildcards / splats) matched the path we will render this component.  
I would strongly recommend you make a ultimate wildcard instead but this is provided if that is not wanted.

#### ssrSuspenseFallback

On the client-side we don't ever want our suspense to fallback to rendering something else as we instead want a transition. Hense we will setup an error boundry as a route top-level component.
But on the server-side there is no point in having animated transitions so instead it's fine to have a fallback when we suspend with and error.  
In fact, using reacts `renderToPipeableStream` will catch all our errors that we throw and thus our regular error boundry defined as a route will not be catching anything. So a good way of achiveing the same thing is supplying the `Suspense` with a error fallback.  
See example in [Advanced example of SSR usage using express](#advanced-example-of-ssr-usage-using-express) further down.

#### clientWithoutSsr

If we have an application with SSR and a client we don't need to specify this.
But if we only have an SPA without SSR we need to set this to true to make guards work on initial load.

When we have an SSR app the guards will be handled server-side and won't need to be handled client-side on initial load.


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
    <RouterRenderer { ...router } />
  </React.StrictMode>,
);
```
```ts
// routing/routes.ts
import type { Routes } from 'transition-router-react';
import CoreDefaultLayout from "@modules/core/layouts/default/default.layout";

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

```ts
// @modules/core/layouts/default/default.layout.tsx
import CoreTopBar from '@modules/core/components/top-bar/top-bar';
import CoreTopMenu from '@modules/core/components/top-menu/top-menu';
import CoreFooter from '@modules/core/components/footer/footer';

import type { PropsWithChildren } from 'react';

// Children is passed by the router if there are nested routes.
export default function CoreDefaultLayout({ children }: PropsWithChildren) {
  return (
    <div className="layout-body">
      <CoreTopBar />
      <CoreTopMenu />
      <div className="page">
        { children }
      </div>
      <CoreFooter />
    </div>
  )
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
  ? new Error(errorMessage)
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
      <RouterRenderer { ...router } ssrSuspenseFallback={<Fallback getError={getErrorBoundaryTriggeredError} />} />
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

### Example of submenu as extraComponent
```ts
  {
    component: Layout,
    path: 'article',
    extraComponents: {
      submenu: ArticleSubmenu,
    },
    children: [
      {
        path: '',
        component: ArticleList,
      },
      {
        path: ':articleId',
        component: ShowArticle,
      }
    ]
  },
  {
    component: Layout,
    path: 'blog',
    extraComponents: {
      submenu: BlogSubmenu,
    },
    children: [
      {
        path: '',
        component: BlogList,
      },
      {
        path: ':blogId',
        component: ShowBlog,
      }
    ]
  },
```

```ts
  // Layout component
  import { PropsWithChildren } from 'react'
  import { ExtraComponents } from 'transition-router-react';
  import TopMenu from './top-menu';

  export default function App({ submenu, children }: PropsWithChildren<ExtraComponents>) {
  return (
    <div className="body">
      <div className="menu-wrapper">
        <TopMenu />
        { submenu }
      </div>
      <div className="page">
        { children }
      </div>
    </div>
  )
}
```

### How to use guards
The goal with guards were as follows:
 - An easy way to apply guards to routes that can be declared on any parent or child in the route tree.
 - Function with hooks as most data-fetching libraries depend on them nowadays.
 - Should not produce a flicker when suspending guard while waiting for async requests. (useTransition should do it's work).
 - Recognisible DX pattern. Should be like writing a regular react component. No need to learn new patterns.
 - Easy tools for redirecting away from guarded route on both client and server.

For examples and documentation read the [guards.md](./docs/guards.md).


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
**OBS!** This is just an example on how to use `useNavigate`, the library provides a Link component that we recommend you use unless it doesn't cover some specific use-case you need.

For examples and documentation of the Link component read the [link.md](./docs/link.md).

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


## Contributing

Anyone is free to open a PR and contribute to this project... just be civilized!  
Also, please join in on the [discussions](https://github.com/wirdehall/transition-router-react/discussions), feedback is appreciated.
