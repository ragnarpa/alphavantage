import crypto from 'crypto';
import { proxy } from 'proxyrequire';
import should from 'should';
import sinon from 'sinon';
import { AlphaVantage } from './';
import * as plan from './plan';
import { Lock, NoLock } from '../locking';
import SimpleTimestamper, { Timestamper } from '../timestamper';

function sut(
  apiKey = 'test',
  avplan: plan.Plan = new plan.Free(),
  lock: Lock = new NoLock(),
  timestamper: Timestamper = new SimpleTimestamper()
): AlphaVantage {
  const alphavantageStub = {
    forex: { rate: sinon.stub(), daily: sinon.stub() },
    data: { daily: sinon.stub(), quote: sinon.stub() },
  };
  const alpha = proxy(() => require('../../src/alpha-vantage'), {
    alphavantage: (): unknown => alphavantageStub,
  });

  return new alpha.AlphaVantage(
    apiKey,
    () => avplan,
    () => lock,
    () => timestamper
  );
}

const sandbox = sinon.createSandbox();

describe('AlphaVantage', () => {
  afterEach(() => sandbox.restore());

  describe('constructor', () => {
    it('stores api key hash', () => {
      const apiKey = 'test';
      const av = sut(apiKey);
      const hash = crypto.createHash('md5').update(apiKey).digest('hex');

      av.apiKeyHash.should.be.equal(hash);
    });

    it('stores plan Free', () => {
      const av = sut();

      av.plan.constructor.name.should.be.equal(plan.Free.name);
    });

    it('stores lock NoLock', () => {
      const av = sut();

      av.lock.constructor.name.should.be.equal(NoLock.name);
    });

    it('stores timestamper SimpleTimestamper', () => {
      const av = sut();

      av.timestamper.constructor.name.should.be.equal(SimpleTimestamper.name);
    });
  });

  async function assertPatched(
    fn: (av: AlphaVantage) => Promise<void>
  ): Promise<void> {
    const avplan = new plan.Free();
    const lock = new NoLock();
    const ts = new SimpleTimestamper();
    const throttleStub = sandbox.stub(avplan, 'throttle');
    const recordStub = sandbox.stub(ts, 'record');
    const av = sut('test', avplan, lock, ts);

    await fn(av);

    should(throttleStub.calledOnce).be.true();
    should(recordStub.calledOnce).be.true();
  }

  describe('patchForex', () => {
    it('patches forex.rate', async () => {
      await assertPatched((alpha) => alpha.forex.rate());
    });

    it('patches forex.daily', async () => {
      await assertPatched((alpha) => alpha.forex.daily());
    });
  });

  describe('patchStock', () => {
    it('patches stock.daily', async () => {
      await assertPatched((alpha) => alpha.stock.daily());
    });

    it('patches stock.quote', async () => {
      await assertPatched((alpha) => alpha.stock.quote());
    });
  });
});
