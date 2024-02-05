import Renderer from './renderer';
import Router from './router';
import { useNavigate } from './custom-hooks/use-navigate';
import { useLocationPath } from './custom-hooks/use-location-path';
import { useParams } from './custom-hooks/use-params';
import type { Event, EventHandler, Routes, ExtraComponents } from './router.types';

export {
  Renderer as RouterRenderer,
  Router,
  useNavigate,
  useLocationPath,
  useParams,
  Routes,
  Event,
  EventHandler,
  ExtraComponents
};
