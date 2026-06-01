import { useState, useEffect } from 'react';
import { GiftGrid } from './components/GiftGrid';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';
import { Baby, Lock } from 'lucide-react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { subscribeToEventInfo } from './api/settings';
import { EventInfo } from './types';

export default function App() {
  const [view, setView] = useState<'guest' | 'admin'>('guest');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [eventInfo, setEventInfo] = useState<EventInfo | null>(null);

  useEffect(() => {
    setIsAuthReady(true);
    const unsubscribe = subscribeToEventInfo((info) => {
      setEventInfo(info);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkAdmin = () => {
      if (localStorage.getItem('admin_auth') === 'true') {
        setView('admin');
      } else {
        setView('guest');
      }
    };
    checkAdmin();
    window.addEventListener('storage', checkAdmin);
    window.addEventListener('admin_auth_changed', checkAdmin);
    return () => {
      window.removeEventListener('storage', checkAdmin);
      window.removeEventListener('admin_auth_changed', checkAdmin);
    };
  }, []);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400 flex flex-col items-center">
          <Baby className="w-12 h-12 mb-4 text-blue-300" />
          <p className="text-xl font-medium">Carregando a lista do Liam...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-700">
      <div className="max-w-7xl mx-auto flex flex-col p-4 md:p-6 gap-6 relative">
      {/* Discreet Admin Lock */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-50">
        {view === 'guest' ? (
           <button 
             onClick={() => setShowAdminLogin(true)}
             className="p-2 md:p-3 text-slate-300 hover:text-sky-500 bg-transparent hover:bg-white/60 backdrop-blur-sm rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-sky-200"
             aria-label="Admin Login"
           >
             <Lock className="w-4 h-4 md:w-5 md:h-5 text-current" />
           </button>
        ) : (
          <button 
             onClick={() => {
               localStorage.removeItem('admin_auth');
               window.dispatchEvent(new Event('admin_auth_changed'));
             }}
             className="bg-red-50/80 backdrop-blur-sm hover:bg-red-100 transition-colors px-4 py-2 rounded-2xl flex items-center gap-2 text-[10px] sm:text-xs font-bold text-red-600 hover:text-red-700 tracking-wide uppercase shadow-sm"
          >
            Sair do Painel
          </button>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full mt-2 relative z-10">
        {view === 'guest' ? (
          <>
            <div className="text-center mb-10 mt-4">
                <div className="inline-flex items-center justify-center p-3 bg-white rounded-full shadow-sm border border-blue-100 mb-6 baby-shadow">
                   <span className="text-4xl leading-none">🧸</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-4">
                  Bem-vindo ao Chá do <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-400">Liam</span>
                </h2>
                <p className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-semibold leading-relaxed">
                  Estamos muito felizes em compartilhar esse momento! Escolha abaixo um presentinho com carinho para a chegada do nosso menino.
                </p>
            </div>
            <GiftGrid />
          </>
        ) : (
          <AdminPanel />
        )}
      </main>

      <footer className='bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-6 border border-sky-100 shadow-sm mt-8 relative z-10'>
        <div className='flex items-center gap-3 bg-sky-50 px-5 py-3 rounded-2xl'>
          <span className='text-2xl'>📍</span>
          <p className='text-sm font-bold text-sky-800 tracking-wide leading-tight'>
            {eventInfo?.date || 'Carregando...'} <br className="sm:hidden" />
            <span className="opacity-70 font-medium">— {eventInfo?.location || 'Carregando...'}</span>
          </p>
        </div>
        <p className='text-[10px] sm:text-xs text-sky-600/70 uppercase tracking-widest font-extrabold flex items-center gap-2'>
          Feito com <span className="text-pink-400 text-base">♥</span> para o Liam
        </p>
      </footer>
      </div>

      {showAdminLogin && (
        <AdminLoginModal onClose={() => setShowAdminLogin(false)} />
      )}
    </div>
  );
}
