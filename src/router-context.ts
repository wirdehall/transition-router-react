import { createContext } from 'react';
import { NavigateFunction, Params } from "./router.types";

export type RouterContextType = Readonly<{
  locationPath: string;
  params: Params;
  navigate: NavigateFunction;
  fragment?: string;
  splat?: string;
}>;

export const RouterContext = createContext<RouterContextType | undefined>(undefined);
