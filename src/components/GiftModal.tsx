import React, { useState } from 'react';
import { X, Gift as GiftIcon } from 'lucide-react';
import { Gift } from '../types';

interface GiftModalProps {
  gift: Gift;
  onClose: () => void;
  onConfirm: (guestName: string) => Promise<void>;
}

export function GiftModal({ gift, onClose, onConfirm }: GiftModalProps) {
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setError('Por favor, informe seu nome.');
      return;
    }
    
    setLoading(true);
    try {
      await onConfirm(guestName.trim());
      onClose();
    } catch (err) {
      setError('Ocorreu um erro ao reservar o presente.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 z-50">
      <div 
        className="bg-white rounded-[32px] w-full max-w-[450px] p-8 baby-shadow relative"
        role="dialog"
        aria-modal="true"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-200 rounded-xl"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4 overflow-hidden relative">
            {gift.photoUrl ? (
              <img src={gift.photoUrl} alt={gift.name} className="w-full h-full object-cover" />
            ) : (
              <GiftIcon className="w-8 h-8 text-blue-300" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Confirmar Presente</h2>
          <p className="text-slate-500 text-sm mt-1">
            Você escolheu o <strong className="text-slate-700">{gift.name}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-2xl font-medium">
              {error}
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1 block">Seu Nome Completo</label>
            <input 
              type="text" 
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-300 focus:outline-none transition-all"
              placeholder="Ex: Maria Oliveira"
              autoFocus
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !guestName.trim()}
            className="w-full py-5 bg-blue-600 text-white font-bold text-lg rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Confirmando...' : 'Quero dar este presente'}
          </button>
          
          <p className="text-center text-[10px] text-slate-400 font-medium px-8 leading-tight">
            Ao confirmar, este item será reservado exclusivamente para você na lista do Liam.
          </p>
        </form>
      </div>
    </div>
  );
}
