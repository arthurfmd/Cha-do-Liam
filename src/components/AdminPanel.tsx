import React, { useState, useEffect } from 'react';
import { Gift } from '../types';
import { subscribeToGifts, addGift, deleteGift, unchooseGift, updateGiftsOrder } from '../api/gifts';
import { subscribeToEventInfo, updateEventInfo } from '../api/settings';
import { Plus, Trash2, Unlock, Image as ImageIcon, LayoutGrid, List, Settings, ArrowUp, ArrowDown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export function AdminPanel() {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create form state
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'chosen' | 'settings'>('all');
  const [confirmingAction, setConfirmingAction] = useState<{id: string, type: 'delete' | 'unchoose'} | null>(null);

  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    let unsubscribeGifts = () => {};
    let unsubscribeSettings = () => {};

    unsubscribeGifts = subscribeToGifts((data) => {
      setGifts(data);
      setLoading(false);
    });

    unsubscribeSettings = subscribeToEventInfo((info) => {
      setEventDate(info.date);
      setEventLocation(info.location);
      setEventTitle(info.title || '');
      setEventDescription(info.description || '');
    });

    return () => {
      unsubscribeGifts();
      unsubscribeSettings();
    };
  }, []);

  const handleMoveGift = async (index: number, direction: 'up' | 'down') => {
    if (activeTab !== 'all') return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === filteredGifts.length - 1) return;

    setIsReordering(true);
    try {
      // Create a copy of the current list
      const newList = [...filteredGifts];
      // Swap the elements
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const temp = newList[index];
      newList[index] = newList[targetIndex];
      newList[targetIndex] = temp;

      // Assign an order value to all elements to ensure consistency
      const updates = newList.map((gift, idx) => ({
        id: gift.id,
        order: idx
      }));

      await updateGiftsOrder(updates);
    } catch (err) {
      alert("Erro ao reordenar.");
    } finally {
      setIsReordering(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      await updateEventInfo({ 
        date: eventDate, 
        location: eventLocation,
        title: eventTitle,
        description: eventDescription
      });
      alert('Configurações salvas com sucesso!');
    } catch (err) {
      alert('Erro ao salvar configurações.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDesc.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addGift(newName.trim(), newDesc.trim(), newUrl.trim());
      setNewName('');
      setNewDesc('');
      setNewUrl('');
      setIsCreating(false);
    } catch (err) {
      alert("Erro ao criar presente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const chosenGiftsCount = gifts.filter(g => g.status === 'chosen').length;
  const filteredGifts = activeTab === 'chosen' ? gifts.filter(g => g.status === 'chosen') : gifts;

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Carregando painel...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">Painel Administrativo</h2>
          <p className="text-slate-500">Gerencie a lista e veja os presentes reservados.</p>
        </div>
        
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Adicionar Presente
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-slate-500 text-sm font-medium mb-1">Total de Presentes</div>
          <div className="text-3xl font-semibold text-slate-800">{gifts.length}</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
           <div className="text-slate-500 text-sm font-medium mb-1">Reservados</div>
           <div className="text-3xl font-semibold text-blue-600">{chosenGiftsCount}</div>
        </div>
        <div className="bg-emerald-50 md:col-auto col-span-2 p-5 rounded-2xl border border-emerald-100 shadow-sm">
           <div className="text-emerald-600 text-sm font-medium mb-1">Disponíveis</div>
           <div className="text-3xl font-semibold text-emerald-700">{gifts.length - chosenGiftsCount}</div>
        </div>
      </div>

      {/* Create Modal */}
      {isCreating && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="font-semibold text-lg text-slate-800 mb-4 border-b border-slate-100 pb-4">Novo Presente</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Nome do presente *</label>
                <input 
                  required
                  type="text" 
                  value={newName} onChange={e => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Ex: Pacote de Fraldas RN"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">URL da Imagem (opcional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <input 
                    type="url" 
                    value={newUrl} onChange={e => setNewUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-300"
                    placeholder="https://..."
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-600 mb-1">Descrição *</label>
                <textarea 
                  required
                  rows={2}
                  value={newDesc} onChange={e => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Detalhes ou tamanho..."
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
               <button 
                type="button" 
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                disabled={isSubmitting}
              >Cancelar</button>
              <button 
                type="submit" 
                disabled={isSubmitting || !newName.trim() || !newDesc.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Presente'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 overflow-x-auto pb-1">
        <button 
          onClick={() => setActiveTab('all')}
          className={twMerge("pb-3 px-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap", activeTab === 'all' ? "border-blue-500 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700")}
        >
          <LayoutGrid className="w-4 h-4" />
          Todos os Presentes
        </button>
        <button 
          onClick={() => setActiveTab('chosen')}
          className={twMerge("pb-3 px-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap", activeTab === 'chosen' ? "border-blue-500 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700")}
        >
          <List className="w-4 h-4" />
          Lista de Reservados
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={twMerge("pb-3 px-4 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap", activeTab === 'settings' ? "border-blue-500 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700")}
        >
          <Settings className="w-4 h-4" />
          Configurações da Festa
        </button>
      </div>

      {/* List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {activeTab === 'settings' ? (
          <div className="p-6 sm:p-8">
            <h3 className="font-semibold text-lg text-slate-800 mb-6">Informações do Evento</h3>
            <form onSubmit={handleSaveSettings} className="space-y-5 max-w-lg">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Título da Página Inicial</label>
                <input 
                  type="text" 
                  value={eventTitle} onChange={e => setEventTitle(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Ex: Bem-vindo ao Chá do Liam"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Descrição da Página Inicial</label>
                <textarea 
                  rows={3}
                  value={eventDescription} onChange={e => setEventDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Mensagem de boas-vindas..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Data e Hora</label>
                <input 
                  type="text" 
                  required
                  value={eventDate} onChange={e => setEventDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Ex: 25 de Agosto às 15h"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1.5">Local / Endereço</label>
                <input 
                  type="text" 
                  required
                  value={eventLocation} onChange={e => setEventLocation(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Ex: Rua das Flores, 123"
                />
              </div>
              <div className="pt-2 flex justify-end">
                <button 
                  type="submit" 
                  disabled={isSavingSettings}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
                >
                  {isSavingSettings ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>
        ) : filteredGifts.length === 0 ? (
           <div className="p-8 text-center text-slate-500">Nenhum presente encontrado.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredGifts.map((gift, index) => {
              const isChosen = gift.status === 'chosen';
              return (
                <li key={gift.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className="w-16 h-16 shrink-0 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden flex items-center justify-center">
                    {gift.photoUrl ? (
                      <img src={gift.photoUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-800 text-base truncate">{gift.name}</h4>
                    <p className="text-sm text-slate-500 truncate mb-1">{gift.description}</p>
                    {isChosen ? (
                      <div className="text-xs font-medium text-emerald-600 bg-emerald-50 inline-flex items-center px-2 py-1 rounded-md border border-emerald-100">
                        Reservado por: {gift.chosenBy}
                      </div>
                    ) : (
                       <div className="text-xs font-medium text-slate-400">Disponível</div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-3 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-slate-100 pl-0 sm:pl-4">
                    {confirmingAction?.id === gift.id ? (
                      <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <span className="text-xs font-medium text-slate-600">Tem certeza?</span>
                        <button
                          onClick={() => {
                            if (confirmingAction.type === 'delete') deleteGift(gift.id);
                            if (confirmingAction.type === 'unchoose') unchooseGift(gift.id);
                            setConfirmingAction(null);
                          }}
                          className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600 transition-colors"
                        >
                          Sim
                        </button>
                        <button
                          onClick={() => setConfirmingAction(null)}
                          className="px-2 py-1 bg-slate-200 text-slate-600 text-xs font-medium rounded hover:bg-slate-300 transition-colors"
                        >
                          Não
                        </button>
                      </div>
                    ) : (
                      <>
                        {activeTab === 'all' && (
                          <div className="flex flex-col gap-1 mr-2 border-r border-slate-200 pr-4">
                            <button 
                              onClick={() => handleMoveGift(index, 'up')}
                              disabled={index === 0 || isReordering}
                              title="Mover para cima"
                              className="p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded disabled:opacity-30 transition-colors"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleMoveGift(index, 'down')}
                              disabled={index === filteredGifts.length - 1 || isReordering}
                              title="Mover para baixo"
                              className="p-1 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded disabled:opacity-30 transition-colors"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        {isChosen && (
                          <button 
                             onClick={() => setConfirmingAction({ id: gift.id, type: 'unchoose' })}
                             title="Desbloquear presente"
                             className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors focus:ring-2 focus:ring-blue-200 outline-none"
                          >
                             <Unlock className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                           onClick={() => setConfirmingAction({ id: gift.id, type: 'delete' })}
                           title="Apagar presente"
                           className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors focus:ring-2 focus:ring-red-200 outline-none"
                        >
                           <Trash2 className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
