export interface CryptoData {
  id: 'bitcoin' | 'ethereum' | 'dogecoin';
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

  export interface ChartDataPoint {
    timestamp?: number;
    date: string; 
    price: number;
  }