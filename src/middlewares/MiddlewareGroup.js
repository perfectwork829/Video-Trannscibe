/**
 * IMPORTANT NOTES
 *
 * Guards are executed serially in the order they are supplied, respecting asynchronous ones.
 *
 * Guard execution will stop when all passed guards are executed OR when any guard calls next() with an argument other than undefined.
 *
 * When a guard calls next() with an argument other than undefined, that argument will be passed to VueRouter.
 */

class MiddlewareGroup {
  _isUndefined(value) {
    return value === undefined;
  }

  _evaluate(guards, to, from, next) {
    const guardsLeft = guards.slice(0); // clone the array so we do not accidentally modify it
    const nextGuard = guardsLeft.shift();

    if (this._isUndefined(nextGuard)) {
      next();
      return;
    }

    nextGuard(to, from, (nextArg) => {
      if (this._isUndefined(nextArg)) {
        this._evaluate(guardsLeft, to, from, next);
        return;
      }

      next(nextArg);
    });
  }

  chain(guards) {
    if (!Array.isArray(guards)) {
      throw new Error('You must specify an array of guards');
    }

    return (to, from, next) => {
      return this._evaluate(guards, to, from, next);
    };
  }
}

export default new MiddlewareGroup();
