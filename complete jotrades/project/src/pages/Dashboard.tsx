import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useWalletStore } from '@/store/walletStore';
import { Button } from '@/components/ui/button';
import {
  Wallet,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const { wallets, transactions, fetchWallets, fetchTransactions } = useWalletStore();
  const [totalBalance, setTotalBalance] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchWallets();
    fetchTransactions();

    // Refresh data every 30 seconds
    const interval = setInterval(() => {
      fetchWallets();
      fetchTransactions();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    // Calculate total balance in USD
    const total = wallets.reduce((acc, wallet) => {
      // For simplicity, using 1:1 conversion. In production, use real exchange rates
      return acc + wallet.balance;
    }, 0);
    setTotalBalance(total);
  }, [wallets]);

  const copyReferralCode = async () => {
    if (profile?.referral_code) {
      await navigator.clipboard.writeText(profile.referral_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-royal-blue to-navy-blue rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Total Balance</h2>
            <RefreshCw className="w-5 h-5" />
          </div>
          <p className="text-3xl font-bold mt-2">${totalBalance.toLocaleString()}</p>
          <p className="text-sm opacity-80 mt-1">Across all wallets</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Referral Earnings</h2>
            <Users className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-3xl font-bold mt-2 text-gray-900">
            ${profile?.referral_earnings?.toLocaleString() || '0'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {profile?.referral_count || 0} referrals
          </p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Your Referral Code</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={copyReferralCode}
              className="text-royal-blue hover:text-royal-blue/80"
            >
              {copied ? 'Copied!' : <Copy className="w-5 h-5" />}
            </Button>
          </div>
          <p className="text-xl font-mono mt-2 text-gray-900">
            {profile?.referral_code || 'Loading...'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Earn 7% on referral deposits
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button
          onClick={() => navigate('/wallet')}
          className="bg-white text-royal-blue border-2 border-royal-blue hover:bg-royal-blue hover:text-white transition-colors p-4 h-auto"
        >
          <Wallet className="w-5 h-5 mr-2" />
          <span>Deposit</span>
        </Button>
        <Button
          onClick={() => navigate('/wallet')}
          className="bg-white text-royal-blue border-2 border-royal-blue hover:bg-royal-blue hover:text-white transition-colors p-4 h-auto"
        >
          <ArrowUpRight className="w-5 h-5 mr-2" />
          <span>Withdraw</span>
        </Button>
        <Button
          onClick={() => navigate('/trade')}
          className="bg-white text-royal-blue border-2 border-royal-blue hover:bg-royal-blue hover:text-white transition-colors p-4 h-auto"
        >
          <TrendingUp className="w-5 h-5 mr-2" />
          <span>Trade</span>
        </Button>
        <Button
          onClick={() => navigate('/verification')}
          className="bg-white text-royal-blue border-2 border-royal-blue hover:bg-royal-blue hover:text-white transition-colors p-4 h-auto"
        >
          <Users className="w-5 h-5 mr-2" />
          <span>Verify Account</span>
        </Button>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
        <div className="space-y-4">
          {recentTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center">
                {tx.type === 'deposit' ? (
                  <ArrowDownRight className="w-5 h-5 text-green-500 mr-3" />
                ) : (
                  <ArrowUpRight className="w-5 h-5 text-red-500 mr-3" />
                )}
                <div>
                  <p className="font-medium capitalize">{tx.type}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {tx.type === 'deposit' ? '+' : '-'}{tx.amount} {tx.currency}
                </p>
                <p className={`text-sm ${
                  tx.status === 'completed' ? 'text-green-500' :
                  tx.status === 'pending' ? 'text-orange-500' : 'text-red-500'
                }`}>
                  {tx.status}
                </p>
              </div>
            </div>
          ))}
        </div>
        {recentTransactions.length === 0 && (
          <p className="text-center text-gray-500 py-4">
            No recent transactions
          </p>
        )}
        <Button
          onClick={() => navigate('/wallet')}
          variant="outline"
          className="w-full mt-4"
        >
          View All Transactions
        </Button>
      </div>
    </div>
  );
}

export default Dashboard;

export default Dashboard