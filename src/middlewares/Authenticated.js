import UserService from 'app/services/UserService';

/**
 * Define a middleware that only allow access to
 * the provided route to `authenticated` users.
 */
export async function AuthenticatedMiddleware(to, from, next) {
  const currentUser = await UserService.getCurrentUser();

  // Not Authenticated, redirect to login
  if (!currentUser) {
    next({ name: 'login', replace: true });
  } else {
    next();
  }
}
