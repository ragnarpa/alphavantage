import { Free } from './plan';
import sinon from 'sinon';

const sandbox = sinon.createSandbox();

describe('Free', () => {
  afterEach(() => sandbox.restore());

  describe('throttle', () => {
    it('calls throttlePerUnit for day and minute', async () => {
      const plan = new Free();
      const throttlePerUnitStub = sandbox
        .stub(plan, 'throttlePerUnit')
        .resolves();

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      await plan.throttle((count) => Promise.resolve([1, 2, 3]));

      throttlePerUnitStub.calledTwice.should.be.true();
      throttlePerUnitStub
        .calledWith('minute', 5, sinon.match.func)
        .should.be.true();
      throttlePerUnitStub
        .calledWith('day', 500, sinon.match.func)
        .should.be.true();
    });
  });
});
