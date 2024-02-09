# Route Guards <!-- omit in toc -->

## Table of content <!-- omit in toc -->
- [Simple example of route definition and implementation](#simple-example-of-route-definition-and-implementation)
  - [Breakdown](#breakdown)
- [Example of rendering error page instead of redirect](#example-of-rendering-error-page-instead-of-redirect)
- [Multiple guards](#multiple-guards)
  - [Nested guards](#nested-guards)
- [SSR with a redirecting guard](#ssr-with-a-redirecting-guard)

## Simple example of route definition and implementation
```ts
import AuthGuard from '@src/guards/auth-guard.tsx';
//...
{
  path: 'path/to/your/route',
  guards: [AuthGuard],
  component: React.lazy(() => import("./pages/guarded-page.tsx"))
},
//...
```
My example of an AuthGuard uses RTK, you could easily substitute fetching your user from where ever you store it. 
AuthGuard looks like this:
```ts
import { useAppDispatch, useAppSelector } from "@data/hooks";
import { PropsWithChildren } from "react";
import { useNavigate } from "transition-router-react";
import { addError } from "@data/notification/notification.slice";

const AuthGuard = ({ children }: PropsWithChildren) => {
  const user = useAppSelector((state) => state.user.loggedInUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  if(!user) {
    throw navigate('/login', { async: true }).then((success) => {
      if(success) {
        dispatch(addError({ notification: 'You must be logged in to view this page!', autoDismissInMs: 8000 }));
      }
    });
  }
  return children;
};

export default AuthGuard;
```

### Breakdown
Let's break this down a bit. In this specific Guard we will redirect to the login page if we try to visit "guarded-page" while not being logged in.  

Reacts Suspense will trigger if you throw a promise. The navigate function is fortunately returning a promise of when the navigation is done which is perfect for our purposes. So we throw a `navigate('/login')`.  

But we need to add the option `async: true` to our navigation since we are not navigating inside a `useEffect` or in response to a user-triggered event. Otherwise react will kick us for updateing state in other components while rendering our AuthGuard.  
Make sure you don't misuse this async in your app. It's primarly there for when you want to redirect with a suspense during render of a component.
Otherwise you will want to use your navigations inside useEffect or in response to a user-triggered event in which case you **should not** use the async option.  

As a bonus we are also listening to the navigation promise with `then` so we can do additional logic once the navigation is done like send a toast notification to the user that they have been redirected and why.  
This is of course optional but if you are going to do it, make sure you check for the success response since we don't know if this guard will be run multiple times in which there might be more then one navigation but only one will be successfull.


**Why are you not using `useEffect`?**  
To allow for this to work on both SSR and on the client as well as not showing any flickering view we will have to throw a promise of the navigation which we do straight in the component and not in a `useEffect` which would usually be where we handle such side-effects. But since `useEffect`issn't run on the server we can't put our navigation in there AND we can't use a `useEffect` on client side either since it won't be run when we suspend the component, it only runs once we return something to render which will cause flickering.

## Example of rendering error page instead of redirect

```ts
import { useAppSelector } from "@data/hooks";
import NotAuthorized from "@pages/not-authorized.tsx";

const AuthGuard = ({ children }: PropsWithChildren) => {
  const user = useAppSelector((state) => state.user.loggedInUser);
  if(!user) {
    return <NotAuthorized />;
  }
  return children;
};

export default AuthGuard;
```
This guard is much simpler, it renderes NotAuthorized instead of the guarded component.

## Multiple guards

```ts
import AuthGuard from '@src/guards/auth-guard.tsx';
import MaintenanceGuard from '@src/guards/maintenance-guard.tsx';
import PermissionGuard from '@src/guards/permission-guard.tsx';
//...
  {
    path: 'path/to/your/route',
    guards: [MaintenanceGuard, AuthGuard, PermissionGuard],
    component: React.lazy(() => import("./pages/guarded-page.tsx"))
  },
//...
```
Guards are executed in order from left to right. So in this case, MaintenanceGuard will validate first, if it passes it will pass to AuthGuard which will validate and then pass to PermissionGuard.  
They are executed in sequence so you can be sure that the previous guard has passed before the next one executes. You can think of them as middlewares if that helps.

### Nested guards
```ts
import AuthGuard from '@src/guards/auth-guard.tsx';
import MaintenanceGuard from '@src/guards/maintenance-guard.tsx';
import PermissionGuard from '@src/guards/permission-guard.tsx';
//...
  {
    component: DefaultLayout,
    guards: [MaintenanceGuard],
    children: [
      {
        path: 'path/to/your/route',
        guards: [AuthGuard, PermissionGuard],
        component: React.lazy(() => import("./pages/guarded-page.tsx"))
      },
      {
        path: 'path/to/your/other/route',
        component: React.lazy(() => import("./pages/other-page.tsx"))
      },
    ]
  }
//...
```
This is also valid, MaintenanceGuard will guard the DefaultLayout component and by proxy all children to that component. And the children can either choose to have guards or not.

## SSR with a redirecting guard
Let's say we are server-side rendering the first guard example at the top of this page [Simple example of route definition and implementation](#simple-example-of-route-definition-and-implementation).  

Since our navigate relise on events which is subscribed to inside a `useEffect` regular navigation is not possible on the server.
Fortunately that's not what we want either way. We want the actuall url to change as well, not just the content to change. And in express that means that we need to use the `response.redirect` function.

So how do we do that?  
Well only our entry-point will have access to the response object from express. So we want to get there, best way of doing that is to throw an error. Our router will be throwing a `TemporaryRedirect` error which will be picked up by `renderToPipeableStream`s `onError` function.  
In there it's easy for us to abort the current rendering, tell `onAllReady` to not do the usual jazz by setting a variable `redirect=true` and then use the `response.redirect()` method. You can pick which 300 http status you want to send. I'm using 307 here by default (as indicated by the error that the router throws) but you can manually set it to whatever you want express to use.
```ts
import { RouterRenderer, Router, TemporaryRedirect } from 'transition-router-react';
//...
  let redirect = false;

  const { pipe, abort } = ReactDOM.renderToPipeableStream(
    (
      <React.StrictMode>
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <CoreNavigationTransitionIndicator />
            <Suspense fallback={<Fallback getError={getErrorBoundaryTriggeredError} />}>
              <RouterRenderer { ...router } />
            </Suspense>
          </ThemeProvider>
        </Provider>
      </React.StrictMode>
    ),
    {
      ...bootstrapScripts,
      onAllReady() {
        if(redirected) {
          console.log(`All ready ${currentRenderCount} but redirected!`);
          return;
        }
        //...
      },
      onError(error) {
        if(error instanceof TemporaryRedirect && error.getIsTrustedError()) {
          redirected = true;
          abort(`307 Redirect to ${error.getNewLocation()}`);
          finishedRenderingResolve();
          response.redirect(307, error.getNewLocation());
        }
      }
    }
  );
```