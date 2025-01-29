import Renderer from './renderer';
import Router from './router';
import { useNavigate } from './custom-hooks/use-navigate';
import { useLocationPath } from './custom-hooks/use-location-path';
import { useParams } from './custom-hooks/use-params';
import { useFragment } from './custom-hooks/use-fragment';
import { useSplat } from './custom-hooks/use-splat';
import type { Event, EventHandler, Routes, ExtraComponents, NavigateFunction } from './router.types';
import { TemporaryRedirect } from './temporary-redirect';
import Link from './link';
import { RouterContext } from './router-context';
import type { RouterContextType } from './router-context';

export {
  Renderer as RouterRenderer,
  Router,
  useNavigate,
  useLocationPath,
  useParams,
  useFragment,
  useSplat,
  Routes,
  Event,
  EventHandler,
  ExtraComponents,
  NavigateFunction,
  TemporaryRedirect,
  Link,
  RouterContext,
  RouterContextType
};
