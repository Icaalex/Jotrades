import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { Button } from '@/components/ui/button';
import { Wallet, ArrowUpDown, RefreshCw } from 'lucide-react';
import { getPrice } from '@/lib/api';

const CRYPTOCURRENCIES = ['BTC', 'ETH', 'LTC', 'DOGE', 'ADA', 'SUI', 'TRX', 'BNB'];
const TRANSACTION_FEE = 0.06; // 6% fee

const Trade = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { wallets } = useWalletStore();
  const [selectedCrypto, setSelectedCrypto] = useState('BTC');
  const [action, setAction] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [usdAmount, setUsdAmount] = useState('');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchPrice();
    // Refresh price every 30 seconds
    const interval = setInterval(fetchPrice, 30000);
    return () => clearInterval(interval);
  }, [selectedCrypto]);

  const fetchPrice = async () => {
    try {
      setIsLoading(true);
      const price = await getPrice(selectedCrypto);
      setCurrentPrice(price);
    } catch (error) {
      console.error('Error fetching price:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateFee = (value: number) => {
    return value * TRANSACTION_FEE;
  };

  const handleAmountChange = (value: string, type: 'crypto' | 'usd') => {
    if (!currentPrice) return;

    const numValue = parseFloat(value);
    if (type === 'crypto') {
      setAmount(value);
      const usdValue = isNaN(numValue) ? '' : (numValue * currentPrice).toFixed(2);
      setUsdAmount(usdValue);
    } else {
      setUsdAmount(value);
      const cryptoValue = isNaN(numValue) ? '' : (numValue / currentPrice).toFixed(8);
      setAmount(cryptoValue);
    }
  };

  const getWalletBalance = (currency: string) => {
    const wallet = wallets.find(w => w.currency === currency);
    return wallet ? wallet.balance : 0;
  };

  const handleTransaction = async () => {
    if (!currentPrice || !amount || !usdAmount) return;

    const numAmount = parseFloat(amount);
    const numUsdAmount = parseFloat(usdAmount);
    const fee = calculateFee(numUsdAmount);
    const total = action === 'buy' ? numUsdAmount + fee : numUsdAmount - fee;

    // Check balance
    if (action === 'buy') {
      const usdBalance = getWalletBalance('USD');
      if (total > usdBalance) {
        alert('Insufficient USD balance');
        return;
      }
    } else {
      const cryptoBalance = getWalletBalance(selectedCrypto);
      if (numAmount > cryptoBalance) {
        alert(`Insufficient ${selectedCrypto} balance`);
        return;
      }
    }

    try {
      // Implement transaction logic here
      console.log('Transaction:', {
        type: action,
        crypto: selectedCrypto,
        amount: numAmount,
        usdAmount: numUsdAmount,
        fee,
        total
      });
    } catch (error) {
      console.error('Transaction error:', error);
      alert('Transaction failed. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Buy/Sell Crypto</h1>
          <div className="flex space-x-2">
            <Button
              onClick={() => setAction('buy')}
              variant={action === 'buy' ? 'default' : 'outline'}
              className={action === 'buy' ? 'bg-green-500 hover:bg-green-600' : ''}
            >
              Buy
            </Button>
            <Button
              onClick={() => setAction('sell')}
              variant={action === 'sell' ? 'default' : 'outline'}
              className={action === 'sell' ? 'bg-red-500 hover:bg-red-600' : ''}
            >
              Sell
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Cryptocurrency
            </label>
            <select
              value={selectedCrypto}
              onChange={(e) => setSelectedCrypto(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            >
              {CRYPTOCURRENCIES.map((crypto) => (
                <option key={crypto} value={crypto}>
                  {crypto}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">Current Price</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchPrice}
                disabled={isLoading}
                className="text-gray-500 hover:text-gray-700"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <div className="text-2xl font-bold">
              ${currentPrice ? currentPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              }) : '---'}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Price includes 1% markup
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount in {selectedCrypto}
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value, 'crypto')}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              placeholder={`Enter ${selectedCrypto} amount`}
              step="0.00000001"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-t border-gray-300 w-full"></div>
              <div className="bg-white px-2">
                <ArrowUpDown className="w-6 h-6 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount in USD
            </label>
            <input
              type="number"
              value={usdAmount}
              onChange={(e) => handleAmountChange(e.target.value, 'usd')}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              placeholder="Enter USD amount"
              step="0.01"
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Available {action === 'buy' ? 'USD' : selectedCrypto}</span>
              <span className="font-medium">
                {action === 'buy' 
                  ? `$${getWalletBalance('USD').toFixed(2)}`
                  : `${getWalletBalance(selectedCrypto).toFixed(8)} ${selectedCrypto}`
                }
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Transaction Fee (6%)</span>
              <span>${usdAmount ? calculateFee(parseFloat(usdAmount)).toFixed(2) : '0.00'}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between font-medium">
              <span>Total {action === 'buy' ? 'Cost' : 'Received'}</span>
              <span>${usdAmount ? (
                action === 'buy'
                  ? (parseFloat(usdAmount) + calculateFee(parseFloat(usdAmount))).toFixed(2)
                  : (parseFloat(usdAmount) - calculateFee(parseFloat(usdAmount))).toFixed(2)
              ) : '0.00'}</span>
            </div>
          </div>

          <Button
            onClick={handleTransaction}
            disabled={!currentPrice || !amount || !usdAmount}
            className={`w-full ${
              action === 'buy'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {action === 'buy' ? 'Buy' : 'Sell'} {selectedCrypto}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Trade;

export default Trade