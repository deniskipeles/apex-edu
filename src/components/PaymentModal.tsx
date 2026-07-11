import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { X, CreditCard, ShieldCheck, CheckCircle2, Lock, Sparkles, HelpCircle } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  const { depositFunds, isLoading } = useStore();
  const [amount, setAmount] = useState('50');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format card input with spaces: XXXX XXXX XXXX XXXX
    const value = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Format MM/YY
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (value.length >= 2) {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setExpiry(value);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvv(e.target.value.replace(/\D/g, '').substring(0, 3));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 5) {
      setLocalError('Minimum deposit is $5.00');
      return;
    }

    if (cardNumber.replace(/\s/g, '').length < 16) {
      setLocalError('Please enter a valid 16-digit credit card number');
      return;
    }

    if (!expiry.includes('/') || expiry.length < 5) {
      setLocalError('Enter card expiry in MM/YY format');
      return;
    }

    if (cvv.length < 3) {
      setLocalError('Enter the 3-digit security code (CVV) on the back of your card');
      return;
    }

    if (!nameOnCard.trim()) {
      setLocalError('Cardholder name is required');
      return;
    }

    try {
      await depositFunds(numericAmount);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        // Reset states
        setCardNumber('');
        setExpiry('');
        setCvv('');
        setNameOnCard('');
        setAmount('50');
      }, 2500);
    } catch (err: any) {
      setLocalError(err.message || 'Payment processing failed. Please verify credentials.');
    }
  };

  const presetAmounts = ['25', '50', '100', '250'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Decorative ambient header */}
        <div className="bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-5 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] bg-sky-500/30 text-sky-100 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
              Payment Gateway
            </span>
            <h3 className="text-lg font-bold tracking-tight heading-font mt-1">Escrow Funding Portal</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center text-center p-8 min-h-[300px]">
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-450 rounded-full flex items-center justify-center mb-4 border border-emerald-100 dark:border-emerald-900/60 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100 heading-font mb-2">Deposit Successful!</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-1">
              Your secure transfer of <span className="font-semibold text-slate-800 dark:text-slate-200">${amount}</span> has been processed.
            </p>
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">ID: TX_SECURE_{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
            {localError && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/60 rounded-2xl text-xs text-rose-700 dark:text-rose-400 font-medium">
                {localError}
              </div>
            )}

            {/* Amount picker */}
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-2">
                1. Select Deposit Amount (USD)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {presetAmounts.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                      amount === preset
                        ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>

              {/* Custom input */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-semibold">$</span>
                <input
                  type="number"
                  min="5"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-100 font-semibold pl-8 pr-4 py-2.5 rounded-2xl outline-none transition-all text-sm"
                  placeholder="Custom amount"
                  required
                />
              </div>
            </div>

            {/* Card Information */}
            <div className="space-y-3.5 pt-2 border-t border-slate-100 dark:border-slate-850">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block">
                2. Credit Card details
              </label>

              {/* Card holder */}
              <div>
                <input
                  type="text"
                  value={nameOnCard}
                  onChange={(e) => setNameOnCard(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3.5 py-2.5 rounded-xl outline-none text-sm text-slate-800 dark:text-slate-100"
                  placeholder="Cardholder Name"
                  required
                />
              </div>

              {/* Card Number */}
              <div className="relative">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-sky-500 pl-10 pr-4 py-2.5 rounded-xl outline-none text-sm text-slate-800 dark:text-slate-100"
                  placeholder="0000 0000 0000 0000"
                  required
                />
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Double columns (Expiry + CVV) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    value={expiry}
                    onChange={handleExpiryChange}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3.5 py-2.5 rounded-xl outline-none text-sm text-slate-800 dark:text-slate-100 text-center"
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    maxLength={3}
                    value={cvv}
                    onChange={handleCvvChange}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-sky-500 px-3.5 py-2.5 rounded-xl outline-none text-sm text-slate-800 dark:text-slate-100 text-center"
                    placeholder="CVV"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Escrow Guarantee Statement */}
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-850 p-3.5 rounded-2xl flex gap-2.5 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 block">EduSolve Protection Guarantee</span>
                Your assignment homework funds are locked safely in escrow and are only released to the tutor once you formally approve the completed solution files.
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white font-semibold rounded-2xl shadow-lg shadow-sky-500/10 cursor-pointer transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Encrypting...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Secure Deposit of ${amount}
                </>
              )}
            </button>

            {/* Security Footprints */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 text-center font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
              256-bit SSL encrypted. Regulated by FinCEN.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
