import { useLocationPath, useNavigate } from './index';
import { Ref, useMemo, AnchorHTMLAttributes, forwardRef } from "react";

type Params = {
  to?: string;
  disabled?: boolean;
  exact?: boolean;
  pattern?: string | RegExp;
  stopPropagation?: true;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

const Link = forwardRef(({
  to, disabled = false, onClick, children, className, exact, pattern, stopPropagation, ...rest
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
    if(!e.ctrlKey && !e.metaKey) {
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

  const cssClasses = useMemo(() => `${className}${active ? ' active' : ''}${disabled ? ' disabled' : ''}`, [className, active, disabled]);

  return <a href={to} className={cssClasses} onClick={clickHandler} ref={ref} { ...rest }>{ children }</a>
});

export default Link;
