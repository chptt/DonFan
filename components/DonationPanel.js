'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseEther } from '@/lib/contract';

export default function DonationPanel({ tokenId, contract, signer, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('idle');
  const [txHash, setTxHash] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleDonate = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!signer) {
      alert('Please connect your wallet');
      return;
    }

    try {
      setStatus('signing');
      const contractWithSigner = contract.connect(signer);
      const tx = await contractWithSigner.donate(tokenId, {
        value: parseEther(amount)
      });

      setStatus('pending');
      setTxHash(tx.hash);

      await tx.wait();
      setStatus('confirmed');
      setShowModal(true);
      setAmount('');
      onSuccess?.();

      setTimeout(() => {
        setStatus('idle');
        setShowModal(false);
      }, 5000);
    } catch (error) {
      console.error('Donation error:', error);
      setStatus('failed');
      alert(error.reason || 'Transaction failed');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'signing': return 'Waiting for signature...';
      case 'pending': return 'Transaction pending...';
      case 'confirmed': return 'Donation successful! 🎉';
      case 'failed': return 'Transaction failed';
      default: return '';
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-200 p-6 space-y-4 hover:shadow-lg transition-all">
      <h3 className="text-xl font-semibold text-gray-900">Make a Donation</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Amount (ETH)
        </label>
        <input
          type="number"
          step="0.001"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.01"
          disabled={status !== 'idle'}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100 transition-all hover:border-emerald-300 min-h-[44px]"
        />
      </div>

      <button
        onClick={handleDonate}
        disabled={!signer || status !== 'idle'}
        className="w-full px-6 py-4 bg-emerald-600 text-white rounded-lg font-bold text-lg hover:bg-emerald-700 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[44px]"
      >
        {status === 'idle' ? 'Donate Now' : getStatusMessage()}
      </button>

      {txHash && (
        <a
          href={`https://sepolia.etherscan.io/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-sm text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
        >
          View on Etherscan →
        </a>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <div className="bg-white rounded-2xl p-8 max-w-md text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h3>
              <p className="text-gray-600">Your donation has been received successfully</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

