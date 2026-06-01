import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AdminLoginModalProps {
  onClose: () => void;
}

export function AdminLoginModal({ onClose }: AdminLoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username !== 'Liam' || password !== 'nico124legal') {
      setError('Credenciais inválidas.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      localStorage.setItem('admin_auth', 'true');
      window.dispatchEvent(new Event('admin_auth_changed'));
      onClose();
    } catch (err: any) {
      setError('Erro ao fazer login: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-[32px] w-full max-w-sm p-8 baby-shadow relative"
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
          <h2 className="text-2xl font-bold text-slate-800">Acesso Restrito</h2>
          <p className="text-slate-500 text-sm mt-1">Painel Administrativo</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-2xl font-medium">
              {error}
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1 block">Usuário</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-300 focus:outline-none transition-all"
              placeholder="Ex: Liam"
              autoFocus
            />
          </div>
          
          <div className="space-y-1 pb-2">
            <label className="text-xs font-bold text-slate-400 uppercase ml-1 block">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 focus:border-blue-300 focus:outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-5 bg-blue-600 text-white font-bold text-lg rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
