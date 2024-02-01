# Transition-router-react
Transition-router-react is a small powerful router leveraging react transitions for a more interactive UX.

## Motivation
I was building a react frontend where I needed transitions instead of suspended navigation. To add to this it had to work
with reacts new SSR implementation. I was originally running React-Router but found it cumbersome and not playing very well
with reacts new features so I buildt my own.  
Goals for this was a small event based router which would be easy to subscribe to with very similar router definitions to react-routers
data api.
A plus would be if the repo would add zero dependencies to any project using this. Dependency bloat and dependency hell is a real thing.

## Requirements
* React >= 18

## How to install
```bash
$ npm i transition-router-react
```

## How to use

### Simple example
```ts
// index.ts
import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterRenderer, Router } from 'transition-router-react';
import { getRoutes } from './routing/routes.tsx';

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
// routing/routes.tsx
import type { Routes } from 'transition-router-react/router.types';
export const getRoutes = (): Routes => {
  return [
    {
      component: CoreDefaultLayout,
      children: [
        {
          path: '',
          component: React.lazy(import("./pages/start")),
        },
        {
          path: 'contact',
          component: React.lazy(import("./pages/contact")),
        },
        {
          path: 'blog/:search/:page',
          component: React.lazy(import("./pages/show/tire-show-page.loader")),
        },
      ]
    },
    {
      path: '*',
      component: React.lazy(import("./pages/404"))
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