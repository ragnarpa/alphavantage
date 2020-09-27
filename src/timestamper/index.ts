import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';
import moment from 'moment';

const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

export interface Timestamper {
  get(key: string, count: number): Promise<Array<number>>;
  record(key: string): Promise<number>;
}

export interface TimestampCollection {
  key: string;
  moments: Array<number>;
}

export default class SimpleTimestamper implements Timestamper {
  readonly filePath: string;

  constructor(filename = 'simpleTimestamps.json') {
    this.filePath = path.resolve(os.tmpdir(), filename);
  }

  get moments(): Promise<Array<TimestampCollection>> {
    return readFile(this.filePath)
      .then((tsCollections) => JSON.parse(tsCollections.toString()))
      .catch(() => []);
  }

  async find(
    key: string,
    moments?: Array<TimestampCollection>
  ): Promise<TimestampCollection | undefined> {
    if (moments) {
      return moments.find((t) => t.key === key);
    }

    return ((await this.moments) || []).find((tsc) => tsc.key === key);
  }

  async get(key: string, count: number): Promise<Array<number>> {
    const tsCollection = await this.find(key);

    return tsCollection ? tsCollection.moments.reverse().slice(0, count) : [];
  }

  async record(key: string, m = +moment()): Promise<number> {
    const tsCollections = await this.moments;
    const tsCollection = await this.find(key, tsCollections);

    let count = 0;

    if (tsCollection) {
      count = tsCollection.moments.push(m);
    } else {
      count = tsCollections.push({ key, moments: [m] });
    }

    await writeFile(this.filePath, JSON.stringify(tsCollections));

    return count;
  }
}
