# Link component <!-- omit in toc -->

## Table of content <!-- omit in toc -->
- [How to use](#how-to-use)
  - [How 'exact' works](#how-exact-works)
  - [How 'pattern' works](#how-pattern-works)

## How to use
Most simple usage:
```ts
  <Link to="/path">
```

Acceptable parameters:
Any parameter you could use with an `<a>`-tag will be passed through to the a-tag with the following exceptions:

```ts
{
  to?: string;
  disabled?: boolean;
  exact?: boolean;
  pattern?: string | RegExp;
}
```
* `to` where the link should link to. (Url)
* `disabled`if the link should be disabled. It will not navigate if this is set to true.
* `exact` then the entire url needs to match exactly given in `to` or in `pattern` if pattern is given as a string.
* `pattern`: If this is given it will ignore `to` when matching if the link should have active class or not.
  * If it's a regex it will do a simple regex test to see if it matches.
  * If it's a string it will just see if the current url starts with the same as the pattern given.
* `href` can't be used, use `to` instead.
  
### How 'exact' works
If we vist `/users/1` link 2 and 3 will be shown as active while the first one will not since it's looking for an exact match.  
The second link will be matched because it's `to` is the same as the start of the url.
```ts
  <Link to="/users" exact>Användare</Link>
  <Link to="/users">Användare</Link>
  <Link to={`/users/${userId}`}>Min sida</Link>
```

### How 'pattern' works
If we vist `/users` both links will be active as we provided pattern on the second link that is more inclusive.
```ts
  <Link to="/users">Användare</Link>
  <Link to={`/users/${userId}`} pattern="/users">Min sida</Link>
```

Using a regex that specifies a url that starts with either `/users` or `/admin`.  
If we vist `/users` or `/admins` or `/admins/search` and so on, the link will be have the active class.
```ts
  <Link to="/users" pattern={/^(\/users|\/admins)/}>Användare</Link>
```

Using a regex that specifies a url that only exactly constains  `/users` or `/admin`.  
If we vist `/users` or `/admins`, the link will be have the active class.  
But not for `/admins/search` and so on.
```ts
  <Link to="/users" pattern={/^(\/users|\/admins)$/}>Användare</Link>
```
