#!/usr/bin/env node

import assert from 'assert';
import dotenv from 'dotenv';
import { program } from 'commander';
import alpha from '../alpha-vantage';
import stock from './stock';
import forex from './forex';

dotenv.config();

const alphaApiKey = process.env.ALPHAVANTAGE_KEY || '';

assert.ok(alphaApiKey, 'Please export ALPHAVANTAGE_KEY in environment.');

const av = alpha(alphaApiKey);

program.addCommand(stock(av));
program.addCommand(forex(av));

async function main(): Promise<void> {
  await program.parseAsync(process.argv);
}

main();
