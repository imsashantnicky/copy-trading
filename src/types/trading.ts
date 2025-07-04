export interface Position {
  instrument_key: string;
  quantity: number;
  average_price: number;
  last_price: number;
  close_price: number;
  pnl: number;
  day_change: number;
  day_change_percentage: number;
  product: string;
  exchange: string;
  trading_symbol: string;
}

export interface Order {
  order_id: string;
  instrument_key: string;
  trading_symbol: string;
  quantity: number;
  price: number;
  order_type: string;
  transaction_type: string;
  product: string;
  status: string;
  timestamp: string;
  filled_quantity: number;
  pending_quantity: number;
  average_price: number;
}

export interface Trade {
  trade_id: string;
  order_id: string;
  instrument_key: string;
  trading_symbol: string;
  quantity: number;
  price: number;
  transaction_type: string;
  timestamp: string;
  parent_trade_id?: string;
  copied_to?: string[];
}

export interface MarketData {
  instrument_key: string;
  last_price: number;
  close_price: number;
  day_change: number;
  day_change_percentage: number;
  volume: number;
  timestamp: string;
}