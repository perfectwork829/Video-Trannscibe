import { GuestMiddleware } from 'app/middlewares';

export const authRoutes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('app/pages/Auth/Login'),
    beforeEnter: GuestMiddleware,
  },
  {
    path: '/signup',
    name: 'signup',
    component: () => import('app/pages/Auth/Signup'),
    beforeEnter: GuestMiddleware,
  },
  {
    path: '/email-verification-failed',
    name: 'email-verification-failed',
    component: () => import('app/pages/Auth/EmailNotVerified'),
    beforeEnter: GuestMiddleware,
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('app/pages/Auth/ForgotPassword'),
    beforeEnter: GuestMiddleware,
  },
];
