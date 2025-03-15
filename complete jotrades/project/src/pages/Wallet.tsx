import React, { useState, useEffect } from 'react';
import { useWalletStore } from '@/store/walletStore';
import { Button } from '@/components/ui/button';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const FIAT_CURRENCIES = ['NGN', 'USD', 'GBP'];
const CRYPTO_CURRENCIES = ['BTC', 'ETH', 'LTC', 'DOGE', 'ADA', 'SUI', 'TRX', 'USDT', 'BNB', 'TON'];

const Wallet = () => {
  const { wallets, transactions, deposit, withdraw, fetchWallets, fetchTransactions } = useWalletStore();
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [paymentType, setPaymentType] = useState<'fiat' | 'crypto'>('fiat');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWallets();
    fetchTransactions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        setError('Please enter a valid amount');
        return;
      }

      if (activeTab === 'deposit') {
        if (numAmount < 1) {
          setError('Minimum deposit amount is $1');
          return;
        }
        await deposit(numAmount, currency, paymentType);
      } else {
        if (numAmount < 5) {
          setError('Minimum withdrawal amount is $5');
          return;
        }
        await withdraw(numAmount, currency, paymentType);
      }

      setAmount('');
      fetchWallets();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'NGN': return '₦';
      case 'USD': return '$';
      case 'GBP': return '£';
      default: return '';
    }
  };

  const formatBalance = (balance: number, currency: string) => {
    if (FIAT_CURRENCIES.includes(currency)) {
      return `${getCurrencySymbol(currency)}${balance.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    }
    return balance.toFixed(8);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Wallet Balances */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Your Wallets</h2>
          <div className="space-y-4">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center">
                  <WalletIcon className="w-6 h-6 text-gray-500 mr-3" />
                  <div>
                    <p className="font-medium">{wallet.currency}</p>
                    <p className="text-sm text-gray-500 capitalize">{wallet.type}</p>
                  </div>
                </div>
                <p className="font-semibold">{formatBalance(wallet.balance, wallet.currency)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Deposit/Withdraw Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex space-x-4 mb-6">
            <Button
              onClick={() => setActiveTab('deposit')}
              variant={activeTab === 'deposit' ? 'default' : 'outline'}
              className="flex-1"
            >
              <ArrowUpRight className="w-5 h-5 mr-2" />
              Deposit
            </Button>
            <Button
              onClick={() => setActiveTab('withdraw')}
              variant={activeTab === 'withdraw' ? 'default' : 'outline'}
              className="flex-1"
            >
              <ArrowDownRight className="w-5 h-5 mr-2" />
              Withdraw
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Type
              </label>
              <div className="flex space-x-4">
                <Button
                  type="button"
                  onClick={() => {
                    setPaymentType('fiat');
                    setCurrency('USD');
                  }}
                  variant={paymentType === 'fiat' ? 'default' : 'outline'}
                  className="flex-1"
                >
                  Fiat
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setPaymentType('crypto');
                    setCurrency('BTC');
                  }}
                  variant={paymentType === 'crypto' ? 'default' : 'outline'}
                  className="flex-1"
                >
                  Crypto
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              >
                {(paymentType === 'fiat' ? FIAT_CURRENCIES : CRYPTO_CURRENCIES).map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <div className="relative">
                {paymentType === 'fiat' && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {getCurrencySymbol(currency)}
                  </span>
                )}
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 ${
                    paymentType === 'fiat' ? 'pl-7' : ''
                  }`}
                  placeholder={`Minimum ${activeTab === 'deposit' ? '$1' : '$5'}`}
                  step="0.00000001"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full"
            >
              {activeTab === 'deposit' ? 'Deposit' : 'Withdraw'} {currency}
            </Button>
          </form>
        </div>
      </div>

      {/* Transaction History */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-3">Type</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Currency</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b">
                  <td className="py-3 capitalize">{tx.type}</td>
                  <td className="py-3">{formatBalance(tx.amount, tx.currency)}</td>
                  <td className="py-3">{tx.currency}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        tx.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : tx.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Wallet;