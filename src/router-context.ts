import { createContext } from "react";
import { NavigateFunction, Params } from "./router.types";

export type RouterContextType = Readonly<{
  locationPath: string;
  params: Params;
  navigate: NavigateFunction;
}>;

export const RouterContext = createContext<RouterContextType | undefined>(undefined);
