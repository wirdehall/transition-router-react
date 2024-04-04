import { useLocationPath, useNavigate } from './index';
import { Ref, useMemo, AnchorHTMLAttributes, forwardRef } from "react";

type Params = {
  to?: string;
  disabled?: boolean;
  exact?: boolean;
  pattern?: string | RegExp;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

const Link = forwardRef(({
  to, disabled = false, onClick, children, className, exact, pattern, ...rest
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
    }
  }

  const cssClasses = useMemo(() => `${className}${active && ' active'}`, [className, active]);

  return <a href={to} className={cssClasses} onClick={clickHandler} ref={ref} { ...rest }>{ children }</a>
});

export default Link;
