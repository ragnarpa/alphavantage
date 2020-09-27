import crypto from 'crypto';
import moment from 'moment';
import alphavantage from 'alphavantage';
import { Lock, NoLock } from '../locking';
import SimpleTimestamper, { Timestamper } from '../timestamper';
import * as plan from './plan';

export class AlphaVantage {
  plan: plan.Plan;
  lock: Lock;
  apiKeyHash: string;
  keyLock: string;
  createdAt: number;
  timestamper: Timestamper;
  forex: alphavantage.Forex;
  stock: alphavantage.Data;
  util: alphavantage.Util;

  constructor(
    apiKey: string,
    plan: () => plan.Plan,
    lock: () => Lock,
    timestamper: () => Timestamper
  ) {
    const client: alphavantage.AlphaVantageClient = alphavantage({
      key: apiKey,
    });

    this.apiKeyHash = crypto.createHash('md5').update(apiKey).digest('hex');
    this.keyLock = 'alphavantage:' + this.apiKeyHash + ':lock';

    this.plan = plan();
    this.lock = lock();
    this.timestamper = timestamper();

    this.forex = this.patchForex(client);
    this.stock = this.patchStock(client);
    this.util = client.util;

    this.createdAt = +moment();
  }

  patch(fn: Function): Function {
    return async (...args: Array<unknown>): Promise<unknown> => {
      return this.lock.lock(this.keyLock, async () => {
        const getTimestamps = async (count: number): Promise<number[]> =>
          this.timestamper.get(this.apiKeyHash, count);
        await this.plan.throttle(getTimestamps);
        const result = fn(...args);
        this.timestamper.record(this.apiKeyHash);
        return result;
      });
    };
  }

  patchForex(alpha: alphavantage.AlphaVantageClient): alphavantage.Forex {
    return {
      rate: this.patch(alpha.forex.rate.bind(alpha)),
      daily: this.patch(alpha.forex.daily.bind(alpha)),
    };
  }

  patchStock(alpha: alphavantage.AlphaVantageClient): alphavantage.Data {
    return {
      daily: this.patch(alpha.data.daily.bind(alpha)),
      quote: this.patch(alpha.data.quote.bind(alpha)),
    };
  }
}

export default function (apiKey: string): AlphaVantage {
  return new AlphaVantage(
    apiKey,
    () => new plan.Free(),
    () => new NoLock(),
    () => new SimpleTimestamper('alphavantage-timestamper.json')
  );
}
