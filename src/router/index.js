import Vue from 'vue';
import Router from 'vue-router';
import { authRoutes } from './auth';
import { publicRoutes } from './public';
import { protectedRoutes } from './protected';

Vue.use(Router);

const routes = [
  ...authRoutes,
  ...publicRoutes,
  ...protectedRoutes,
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('app/pages/Errors/NotFound'),
  },
];

const router = new Router({
  mode: 'history',
  linkActiveClass: 'open',
  routes,
  scrollBehavior() {
    return { x: 0, y: 0 };
  },
});

export default router;
