declare function alphavantage(config: object): alphavantage.AlphaVantageClient;

declare namespace alphavantage {
  export type AlphaVantageClient = {
    util: alphavantage.Util;
    data: alphavantage.Data;
    forex: alphavantage.Forex;
  };

  export interface Util {
    polish: Function;
  }

  export interface Data {
    daily: Function;
    quote: Function;
  }

  export interface Forex {
    rate: Function;
    daily: Function;
  }
}

export = alphavantage;
