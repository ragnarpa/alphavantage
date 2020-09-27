import commander, { Command } from 'commander';
import { AlphaVantage } from '../alpha-vantage';
import print from './print';
import handle from './handle';

export default function (alpha: AlphaVantage): commander.Command {
  const forex = new Command('forex').alias('fx');
  forex
    .command('rate')
    .arguments('<from> <to>')
    .action(
      handle(async (from, to) => {
        const rate = await alpha.forex.rate(from, to);

        await print(() => alpha.util.polish(rate));
      })
    );
  forex
    .command('daily')
    .arguments('<from> <to> [date]')
    .action(
      handle(async (from, to, date) => {
        const timeSeries = await alpha.forex.daily(from, to);
        const polished = alpha.util.polish(timeSeries);

        if (!polished.data) {
          polished.data = polished['Time Series FX (Daily)'];
        }

        await print(() => polished, String(date));
      })
    );
  return forex;
}
