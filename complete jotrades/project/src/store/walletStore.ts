import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface Wallet {
  id: string;
  user_id: string;
  currency: string;
  balance: number;
  type: 'fiat' | 'crypto';
}

interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

interface WalletState {
  wallets: Wallet[];
  transactions: Transaction[];
  isLoading: boolean;
  deposit: (amount: number, currency: string, type: 'fiat' | 'crypto') => Promise<void>;
  withdraw: (amount: number, currency: string, type: 'fiat' | 'crypto') => Promise<void>;
  fetchWallets: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  wallets: [],
  transactions: [],
  isLoading: false,

  deposit: async (amount: number, currency: string, type: 'fiat' | 'crypto') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (amount < 1) throw new Error('Minimum deposit amount is $1');

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'deposit',
          amount,
          currency,
          status: 'pending',
          payment_type: type
        })
        .select()
        .single();

      if (error) throw error;

      const { transactions } = get();
      set({ transactions: [...transactions, data] });
    } catch (error) {
      console.error('Deposit error:', error);
      throw error;
    }
  },

  withdraw: async (amount: number, currency: string, type: 'fiat' | 'crypto') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (amount < 5) throw new Error('Minimum withdrawal amount is $5');

      const wallet = get().wallets.find(w => w.currency === currency && w.type === type);
      if (!wallet || wallet.balance < amount) {
        throw new Error('Insufficient balance');
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'withdrawal',
          amount,
          currency,
          status: 'pending',
          payment_type: type
        })
        .select()
        .single();

      if (error) throw error;

      const { transactions } = get();
      set({ transactions: [...transactions, data] });
    } catch (error) {
      console.error('Withdrawal error:', error);
      throw error;
    }
  },

  fetchWallets: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      set({ wallets: data });
    } catch (error) {
      console.error('Fetch wallets error:', error);
    }
  },

  fetchTransactions: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ transactions: data });
    } catch (error) {
      console.error('Fetch transactions error:', error);
    }
  }
}));