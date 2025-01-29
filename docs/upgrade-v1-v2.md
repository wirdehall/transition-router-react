# How to upgrade from v1 to v2 <!-- omit in toc -->

## Table of content <!-- omit in toc -->
- [What changed](#what-changed)
  - [React 19 compatible](#react-19-compatible)
  - [New hooks for retriving url parts that was previously missing.](#new-hooks-for-retriving-url-parts-that-was-previously-missing)
  - [Typos in variables fixed](#typos-in-variables-fixed)
  - [Native support for fragments and deep-linking](#native-support-for-fragments-and-deep-linking)
- [How to upgrade](#how-to-upgrade)

## What changed

### React 19 compatible
  This was just a matter of upgrading peerDependency, we where already react 19 compatible.
  We did fix some small things that was becoming deprecated in react 19 such as context.Provider no longer being used.

### New hooks for retriving url parts that was previously missing.
  We introduced two new hooks, `useFragment` and `useSplat`.
  Previously we could retrive params and locationPath, but it made sense to expose fragment and splat as well.

### Typos in variables fixed
  I noticed that all variables with `initial` in the name was spelled `inital`(I was to quick on the keyboard apparently).  
  This especially affected the return values from when initiating the router, if you used `initalMatchedRoute`, `initalLocationPath` or `initalParams`
  they are now renamed to: `initialMatchedRoute`, `initialLocationPath` or `initialParams`.

  **This is a breaking change and the reason for 2.0.0 release**

### Native support for fragments and deep-linking
1. The Link component now handles deep-linking using fragments on the same page by not triggering a navigation if we are just moving on the same page.
2. The router will use best effor to scroll down to element with correct id after navigating if a fragment is pressent.

## How to upgrade

1. Upgrade your application to react 19.
2. If you use the return value of the initiating `Router` function for anything besides passing it to the `RouterRenderer` make sure to rename `initalMatchedRoute`, `initalLocationPath` and `initalParams`
  to `initialMatchedRoute`, `initialLocationPath` and `initialParams` if you use them.
3. If your error boundry uses the RouterContext, change from <RouterContext.Provider> to <RouterContext> when rendering the error boundry.
4. Make sure your url's don't contain `#` unless you want to use it as deep-linking (native behaviour for browsers). 