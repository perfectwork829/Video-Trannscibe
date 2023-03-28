import UserService from 'app/services/UserService';

/**
 * Define a middleware that only allow access
 * to the provided route to `guest` users.
 */
export async function GuestMiddleware(to, from, next) {
  const currentUser = await UserService.getCurrentUser();

  if (currentUser) {
    next(from);
  } else {
    next();
  }
}
