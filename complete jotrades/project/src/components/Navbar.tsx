import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from './ui/button';
import { Wallet, LineChart, LayoutDashboard, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, signOut } = useAuthStore();

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Wallet className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold">CryptoTrade</span>
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                <Link to="/trade" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
                  <LineChart className="w-5 h-5" />
                  <span>Trade</span>
                </Link>
                <Link to="/wallet" className="flex items-center space-x-1 text-gray-700 hover:text-blue-600">
                  <Wallet className="w-5 h-5" />
                  <span>Wallet</span>
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => signOut()}
                  className="flex items-center space-x-1"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign Out</span>
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;