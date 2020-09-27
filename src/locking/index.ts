import AsyncLock from 'async-lock';
import Redlock from 'redlock';

type LockLike = Redlock.Lock | SimpleLock;

export interface LockOpts {
  timeout?: number;
  maxPending?: number;
}

export interface DistLockOpts {
  ttl?: number;
}

export interface Lock {
  lock<T>(
    key: string | string[],
    fn: (lock?: LockLike) => T | PromiseLike<T>,
    opts?: LockOpts | DistLockOpts
  ): PromiseLike<T>;
}

export class NoLock implements Lock {
  lock<T>(key: string, fn: () => T | PromiseLike<T>): Promise<T> {
    return Promise.resolve(fn());
  }
}

export class SimpleLock implements Lock {
  readonly L: AsyncLock;

  constructor() {
    this.L = new AsyncLock();
  }

  lock<T>(
    key: string | string[],
    fn: () => T | PromiseLike<T>,
    opts?: LockOpts
  ): Promise<T> {
    return this.L.acquire(key, fn, opts);
  }
}

export class RedisLock implements Lock {
  readonly L: Redlock;

  constructor(
    clients: Redlock.CompatibleRedisClient[],
    opts?: Redlock.Options
  ) {
    this.L = new Redlock(clients, opts);
  }

  async lock<T>(
    key: string,
    fn: (lock: Redlock.Lock) => T | PromiseLike<T>,
    opts?: DistLockOpts
  ): Promise<T> {
    const ttl = opts && opts.ttl ? opts.ttl : 1000;
    const L = await this.L.acquire(key, ttl);
    return fn(L);
  }
}
