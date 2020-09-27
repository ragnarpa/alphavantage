import moment from 'moment';

export type LimitUnit = 'day' | 'minute';

export class LimitError extends Error {
  unit: LimitUnit;
  limit: number;
  tryAgain: number;

  constructor(unit: LimitUnit, limit: number, tryAgain: number) {
    super(
      `Limit ${limit} for one ${unit} reached. Try again at ${moment(
        tryAgain
      )}.`
    );
    Object.setPrototypeOf(this, new.target.prototype);

    this.unit = unit;
    this.limit = limit;
    this.tryAgain = tryAgain;
  }
}

export interface Plan {
  throttle(
    getTimestamps: (count: number) => Promise<Array<number>>
  ): Promise<void>;
}

export class Free implements Plan {
  perDay: number;
  perMinute: number;

  constructor(perDay = 500, perMinute = 5) {
    this.perDay = perDay;
    this.perMinute = perMinute;
  }

  async throttle(
    getTimestamps: (count: number) => Promise<Array<number>>
  ): Promise<void> {
    const perDay = this.throttlePerUnit('day', this.perDay, getTimestamps);
    const perMinute = this.throttlePerUnit(
      'minute',
      this.perMinute,
      getTimestamps
    );

    await Promise.all([perMinute, perDay]);
  }

  async throttlePerUnit(
    unit: LimitUnit,
    limit: number,
    getTimestamps: (count: number) => Promise<Array<number>>
  ): Promise<void> {
    const unitStart = +moment().startOf(unit);
    const reqTimestampsOverLastUnit = (await getTimestamps(limit)).filter(
      (ts) => ts >= unitStart
    );

    if (reqTimestampsOverLastUnit.length >= limit) {
      const tryAgain = +moment(
        reqTimestampsOverLastUnit[reqTimestampsOverLastUnit.length - 1]
      ).endOf(unit);

      throw new LimitError(unit, limit, tryAgain);
    }
  }
}
