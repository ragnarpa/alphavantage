# alphavantage

A small library and CLI for Alpha Vantage Stock and Forex API.

## Installation

```
npm install @ragnarpa/alphavantage
```

## Usage

### CLI

Claim your free API key at https://www.alphavantage.co/support/#api-key.

Store your key in `~/.env` file.

Example contents of `~/.env` file

```
ALPHAVANTAGE_KEY=demo
```

```
cd ~
av --help
```

#### Stock

```
av stock quote tsla
```

#### Forex

```
av forex rate usd eur
```

## Features

- throttling for Free plan
- locking for API key sharing between multiple processes
