import { useContext } from "react";
import { RouterContext } from "../router-context";

export const useLocationPath = () => {
  const context = useContext(RouterContext);
  if(context === undefined) {
    throw new Error('Router context not provided!');
  }
  return context.locationPath;
}
