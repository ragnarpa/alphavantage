export default function (
  action: (...args1: Array<unknown>) => PromiseLike<void> | void
) {
  return async function (...args2: Array<unknown>): Promise<void> {
    try {
      // Resolve here to catch errors.
      await action(...args2);
    } catch (error) {
      if (error.message) {
        console.error(error.message);
      } else {
        console.error(error);
      }

      process.exitCode = 1;
    }
  };
}
