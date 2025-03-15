import axios from 'axios';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

const COIN_IDS = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  LTC: 'litecoin',
  DOGE: 'dogecoin',
  ADA: 'cardano',
  SUI: 'sui',
  TRX: 'tron',
  BNB: 'binancecoin'
};

export const getPrice = async (symbol: string): Promise<number> => {
  try {
    const coinId = COIN_IDS[symbol as keyof typeof COIN_IDS];
    if (!coinId) throw new Error('Unsupported cryptocurrency');

    const response = await axios.get(`${COINGECKO_API}/simple/price`, {
      params: {
        ids: coinId,
        vs_currencies: 'usd'
      }
    });

    const price = response.data[coinId].usd;
    // Add 1% markup to the price
    return price * 1.01;
  } catch (error) {
    console.error('Error fetching price:', error);
    throw error;
  }
};