import React, { useState } from 'react';
import { Irmao } from '../types';
import { UserPlus, X } from 'lucide-react';

interface ModalNovoIrmaoProps {
  onAddIrmao: (novoIrmao: Omit<Irmao, 'id'>) => void;
  onClose: () => void;
}

export const ModalNovoIrmao: React.FC<ModalNovoIrmaoProps> = ({ onAddIrmao, onClose }) => {
  const [nome, setNome] = useState('');
  const [cim, setCim] = useState('');
  const [mutua, setMutua] = useState<'Sim' | 'Não'>('Sim');
  const [captacao, setCaptacao] = useState<'Sim' | 'Não'>('Sim');
  const [grau, setGrau] = useState<'Ap.' | 'Comp.' | "M.'. M.'.">("M.'. M.'.");
  const [telefone, setTelefone] = useState('');
  const [valorBase, setValorBase] = useState('220.00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert('Por favor, informe o nome do Irmão.');
      return;
    }
    const valNum = parseFloat(valorBase.replace(',', '.')) || 0;

    onAddIrmao({
      nome: nome.trim().toUpperCase(),
      cim: cim.trim() || 'Neofito',
      mutua,
      captacao,
      grau,
      telefone: telefone.trim(),
      valorBase: valNum,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4 animate-scaleUp">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-base font-bold text-[#081838] uppercase tracking-wider flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#CFA73E]" />
            Cadastrar Novo Irmão no Quadro
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nome Completo do Irmão</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: FRANCISCO DE SOUZA"
              className="w-full border rounded px-3 py-2 uppercase focus:outline-none focus:border-[#CFA73E]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">CIM</label>
              <input
                type="text"
                value={cim}
                onChange={(e) => setCim(e.target.value)}
                placeholder="Ex: 31.450 ou Neofito"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#CFA73E]"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Grau Maçônico</label>
              <select
                value={grau}
                onChange={(e) => setGrau(e.target.value as any)}
                className="w-full border rounded px-3 py-2 bg-slate-50 focus:outline-none focus:border-[#CFA73E]"
              >
                <option value="M.'. M.'.">M.'. M.'. (Mestre)</option>
                <option value="Comp.'.">Comp.'. (Companheiro)</option>
                <option value="Ap.'.">Ap.'. (Aprendiz)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mútua</label>
              <select
                value={mutua}
                onChange={(e) => setMutua(e.target.value as any)}
                className="w-full border rounded px-3 py-2 bg-slate-50 focus:outline-none focus:border-[#CFA73E]"
              >
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Captação GOP</label>
              <select
                value={captacao}
                onChange={(e) => setCaptacao(e.target.value as any)}
                className="w-full border rounded px-3 py-2 bg-slate-50 focus:outline-none focus:border-[#CFA73E]"
              >
                <option value="Sim">Sim</option>
                <option value="Não">Não</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Mensalidade Base (R$)</label>
              <input
                type="text"
                value={valorBase}
                onChange={(e) => setValorBase(e.target.value)}
                placeholder="220.00"
                className="w-full border rounded px-3 py-2 font-mono font-bold text-[#081838] focus:outline-none focus:border-[#CFA73E]"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Telefone WhatsApp</label>
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="5511999998888"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#CFA73E]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-slate-600 hover:bg-slate-100 font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded bg-[#081838] text-white hover:bg-[#162C5A] font-bold shadow"
            >
              Cadastrar Irmão
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
