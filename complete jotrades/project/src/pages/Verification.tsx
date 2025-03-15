import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Shield, Upload, CheckCircle } from 'lucide-react';

const Verification = () => {
  const { profile, updateProfile } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone_number: profile?.phone_number || '',
    country: profile?.country || '',
    id_type: '',
    address: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({
        full_name: formData.full_name,
        phone_number: formData.phone_number,
        country: formData.country,
        verification_status: 'pending',
        kyc_submitted: true
      });
      setStep(step + 1);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center mb-8">
          <Shield className="w-8 h-8 text-royal-blue mr-3" />
          <h1 className="text-2xl font-bold">Account Verification</h1>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3].map((number) => (
            <div
              key={number}
              className={`flex items-center ${
                step >= number ? 'text-royal-blue' : 'text-gray-400'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 
                ${step >= number ? 'border-royal-blue bg-royal-blue/10' : 'border-gray-300'}`}
              >
                {step > number ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  number
                )}
              </div>
              <div className="ml-2 text-sm">
                {number === 1 ? 'Personal Info' : number === 2 ? 'Documents' : 'Verification'}
              </div>
            </div>
          ))}
        </div>

        {step === 1 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-royal-blue focus:ring focus:ring-royal-blue/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                value={formData.phone_number}
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-royal-blue focus:ring focus:ring-royal-blue/20"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-royal-blue focus:ring focus:ring-royal-blue/20"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-royal-blue hover:bg-royal-blue/90">
              Continue
            </Button>
          </form>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Upload ID Document</h3>
              <p className="text-sm text-gray-500 mb-4">
                Supported formats: JPG, PNG, PDF (max 5MB)
              </p>
              <Button
                onClick={() => setStep(3)}
                className="bg-royal-blue hover:bg-royal-blue/90"
              >
                Upload Document
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Verification Submitted</h2>
            <p className="text-gray-600 mb-6">
              Your documents are being reviewed. This process typically takes 1-2 business days.
            </p>
            <Button
              onClick={() => navigate('/dashboard')}
              className="bg-royal-blue hover:bg-royal-blue/90"
            >
              Return to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Verification;