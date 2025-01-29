import { useLocationPath, useNavigate } from './index';
import { Ref, useMemo, AnchorHTMLAttributes, forwardRef } from 'react';

type Params = {
  to?: string;
  disabled?: boolean;
  exact?: boolean;
  pattern?: string | RegExp;
  stopPropagation?: boolean;
  external?: boolean;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

const fragmentRegex = /#[^/]*$/;

const Link = forwardRef(({
  to, disabled = false, onClick, children, className, exact, pattern, stopPropagation, external, ...rest
}: Params, ref: Ref<HTMLAnchorElement> | undefined) => {
  const navigate = useNavigate();
  const path = useLocationPath();

  const active = useMemo(() => {
    if(pattern instanceof RegExp) {
      return pattern.test(path);
    }
    const matchString = (pattern ? pattern : to);
    if(matchString === undefined) {
      return false;
    } else if(exact) {
      return path === matchString;
    }
    return path.startsWith(matchString);
  }, [path, to, exact, pattern]);

  const clickHandler = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if(!e.ctrlKey && !e.metaKey && external !== true) {
      if(to !== undefined) {
        const [ match ] = to.match(fragmentRegex) ?? [];
        if(match && to === match) { // if the whole link is an anchor.
          return false;
        }
      }

      e.preventDefault();
      if(onClick) {
        onClick(e);
      }
      if(!disabled) {
        navigate(to);
      }
      if(stopPropagation) {
        e.stopPropagation();
      }
    }
  }

  const cssClasses = useMemo(() => {
    const cssClasses = `${className ? className : ''}${active ? ' active' : ''}${disabled ? ' disabled' : ''}`;
    return cssClasses > '' ? cssClasses : undefined;
  }, [className, active, disabled]);

  return <a href={to} className={cssClasses} onClick={clickHandler} ref={ref} { ...rest }>{ children }</a>
});

export default Link;
