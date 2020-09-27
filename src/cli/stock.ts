import commander, { Command } from 'commander';
import { AlphaVantage } from '../alpha-vantage';
import print from './print';
import handle from './handle';

export default function (alpha: AlphaVantage): commander.Command {
  const stock = new Command('stock').alias('data');
  stock
    .command('daily')
    .arguments('<symbol> [date]')
    .action(
      handle(async (symbol, date) => {
        const timeSeries = await alpha.stock.daily(symbol);

        await print(() => alpha.util.polish(timeSeries), String(date));
      })
    );
  stock
    .command('quote')
    .arguments('<symbol>')
    .action(
      handle(async (symbol) => {
        const quote = await alpha.stock.quote(symbol);

        await print(() => alpha.util.polish(quote));
      })
    );
  return stock;
}
