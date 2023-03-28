import store from 'app/store';
import { ROLE } from 'app/constants';

/**
 * Define a middleware that only allow access to
 * the provided route to users with `owner` role.
 */
export async function OwnerRoleMiddleware(to, from, next) {
  const currentRole = store?.getters?.currentRole;

  if (currentRole === ROLE.OWNER) {
    next();
  } else {
    next({ name: 'NotFound' });
  }
}
