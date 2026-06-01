import { useState, useEffect } from 'react';
import { Gift } from '../types';
import { subscribeToGifts, chooseGift } from '../api/gifts';
import { GiftModal } from './GiftModal';
import { Gift as GiftIcon, CheckCircle2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function GiftGrid() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToGifts((data) => {
      setGifts(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleConfirm = async (guestName: string) => {
    if (selectedGift) {
      await chooseGift(selectedGift.id, guestName);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-white rounded-xl h-72 border border-slate-100 shadow-sm"></div>
        ))}
      </div>
    );
  }

  if (gifts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="bg-white w-24 h-24 mx-auto rounded-full flex items-center justify-center text-slate-300 shadow-sm border border-slate-100 mb-4">
          <GiftIcon className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-medium text-slate-700">A lista de presentes está vazia</h3>
        <p className="text-slate-500 mt-2">Nenhum presente foi cadastrado ainda.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {gifts.map(gift => {
          const isChosen = gift.status === 'chosen';
          return (
            <div 
              key={gift.id} 
              className={twMerge(
                "relative overflow-hidden transition-all duration-300 flex flex-col cursor-pointer group",
                isChosen 
                  ? "bg-slate-50/80 rounded-[20px] sm:rounded-[32px] p-3 sm:p-5 border border-slate-200 grayscale-[30%] opacity-80" 
                  : "bg-white rounded-[20px] sm:rounded-[32px] p-3 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-sky-100/50 hover:shadow-[0_20px_40px_-15px_rgba(56,189,248,0.2)] hover:-translate-y-2 hover:border-sky-200"
              )}
              onClick={() => !isChosen && setSelectedGift(gift)}
            >
              {isChosen && (
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                  <span className="bg-slate-700/90 backdrop-blur-sm text-white px-2 sm:px-5 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold transform -rotate-6 shadow-xl max-w-[90%] text-center tracking-wider uppercase border border-slate-600/50 leading-tight">
                    Escolhido por<br/>{gift.chosenBy}
                  </span>
                </div>
              )}

              <div className={twMerge("aspect-square rounded-xl sm:rounded-[24px] mb-3 sm:mb-5 flex items-center justify-center text-4xl overflow-hidden relative group-hover:scale-[1.02] transition-transform duration-500", isChosen ? "bg-slate-100" : "bg-gradient-to-br from-sky-50 to-teal-50")}>
                {gift.photoUrl ? (
                  <img 
                    src={gift.photoUrl} 
                    alt={gift.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                ) : (
                  <GiftIcon className={twMerge("w-10 h-10 sm:w-16 sm:h-16 transition-colors", isChosen ? "text-slate-300" : "text-blue-300 group-hover:text-blue-400")} />
                )}
              </div>
              
              <div className="flex-1 flex flex-col">
                <h3 className="font-extrabold text-sm sm:text-xl mb-1 sm:mb-1.5 text-slate-800 line-clamp-1">{gift.name}</h3>
                <p className="text-[11px] sm:text-sm font-semibold text-slate-500 mb-3 sm:mb-5 line-clamp-2 flex-1 leading-relaxed">{gift.description}</p>
                
                {isChosen ? (
                  <div className="w-full py-2 sm:py-4 bg-slate-200/50 text-slate-500 text-center font-bold rounded-xl sm:rounded-2xl text-[10px] sm:text-sm border border-slate-200/50 uppercase tracking-wide">
                    Indisponível
                  </div>
                ) : (
                  <div className="w-full py-2 sm:py-4 bg-gradient-to-r from-blue-500 to-sky-400 hover:from-blue-600 hover:to-sky-500 shadow-lg shadow-blue-500/25 text-white text-center font-bold rounded-xl sm:rounded-2xl transition-all text-[10px] sm:text-sm uppercase tracking-wide">
                    Quero Presentear
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedGift && (
        <GiftModal 
          gift={selectedGift} 
          onClose={() => setSelectedGift(null)} 
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}
