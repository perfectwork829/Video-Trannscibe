import Dashboard from 'app/components/layout/Dashboard';
import { AuthenticatedMiddleware } from 'app/middlewares';
import MiddlewareGroup from 'app/middlewares/MiddlewareGroup';

export const protectedRoutes = [
  // {
  //   path: '/dev',
  //   name: 'dev',
  //   component: () => import('app/pages/Dev'),
  //   beforeEnter: MiddlewareGroup.chain([AuthenticatedMiddleware]),
  // },

  {
    path: '/',
    redirect: '/dashboard',
    beforeEnter: MiddlewareGroup.chain([AuthenticatedMiddleware]),
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('app/pages/Dashboard/Index'),
    beforeEnter: MiddlewareGroup.chain([AuthenticatedMiddleware]),
  },
  {
    path: '/check-out',
    name: 'check-out',
    component: () => import('app/pages/CheckOut/CheckOut'),
    beforeEnter: MiddlewareGroup.chain([AuthenticatedMiddleware]),
  },
  {
    path: '/projects/:projectId',
    name: 'project-details',
    component: Dashboard,
    children: [
      {
        path: 'transcript',
        alias: '/',
        name: 'project-transcript',
        component: () => import('app/pages/Project/Item/Transcript'),
        beforeEnter: MiddlewareGroup.chain([AuthenticatedMiddleware]),
      },
      {
        path: 'paperedit',
        name: 'project-paperedit',
        component: () => import('app/pages/Project/Item/PaperEdit'),
        beforeEnter: AuthenticatedMiddleware,
      },
      {
        path: 'mediafiles',
        name: 'project-mediafiles',
        component: () => import('app/pages/Project/Item/MediaFiles'),
        beforeEnter: AuthenticatedMiddleware,
      },
      {
        path: 'search',
        name: 'project-search',
        component: () => import('app/pages/Project/Item/Search'),
        beforeEnter: AuthenticatedMiddleware,
      },
      {
        path: 'settings',
        name: 'project-settings',
        component: () => import('app/pages/Project/Item/Settings'),
        beforeEnter: AuthenticatedMiddleware,
      },
    ],
  },
];
