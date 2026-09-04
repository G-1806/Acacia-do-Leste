import React, { useState } from 'react';
import { Nominata, AnoCiclo, Irmao } from '../types';
import { LodgeLogo } from './LodgeLogo';
import { Save, Users, ShieldCheck, CheckCircle } from 'lucide-react';

interface TabNominataProps {
  nominatas: Record<AnoCiclo, Nominata>;
  onUpdateNominata: (ano: AnoCiclo, novaNominata: Nominata) => void;
  anoCiclo: AnoCiclo;
  irmaos: Irmao[];
}

export const TabNominata: React.FC<TabNominataProps> = ({
  nominatas,
  onUpdateNominata,
  anoCiclo,
  irmaos,
}) => {
  const currentNominata = nominatas[anoCiclo] || {
    vm: '',
    pv: '',
    sv: '',
    sec: '',
    rmp: '',
    cap: '',
    tes: '',
  };

  const [formState, setFormState] = useState<Nominata>(currentNominata);
  const [salvoFeedback, setSalvoFeedback] = useState(false);

  // Sincroniza se o ciclo mudar no cabeçalho
  React.useEffect(() => {
    if (nominatas[anoCiclo]) {
      setFormState(nominatas[anoCiclo]);
    }
  }, [anoCiclo, nominatas]);

  const handleChange = (campo: keyof Nominata, valor: string) => {
    setFormState((prev) => ({
      ...prev,
      [campo]: valor,
    }));
    setSalvoFeedback(false);
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateNominata(anoCiclo, formState);
    setSalvoFeedback(true);
    setTimeout(() => setSalvoFeedback(false), 3000);
  };

  const cargos: { key: keyof Nominata; cargo: string; desc: string; iconBadge: string }[] = [
    { key: 'vm', cargo: 'Venerável Mestre', desc: 'Dirigente e Primeira Luz da Oficina', iconBadge: 'VM' },
    { key: 'pv', cargo: 'Primeiro Vigilante', desc: 'Segunda Luz e responsável pela Coluna do Ocidente', iconBadge: '1º V' },
    { key: 'sv', cargo: 'Segundo Vigilante', desc: 'Terceira Luz e responsável pela Coluna do Sul', iconBadge: '2º V' },
    { key: 'sec', cargo: 'Secretário', desc: 'Guarda dos Selos e registros dos Livros da Loja', iconBadge: 'SEC' },
    { key: 'rmp', cargo: 'Representante Ministério Público (Orador)', desc: 'Guarda da Lei e da Justiça Maçônica', iconBadge: 'RMP' },
    { key: 'cap', cargo: 'Capelão', desc: 'Guarda do Livro Sagrado e Orações Ritualísticas', iconBadge: 'CAP' },
    { key: 'tes', cargo: 'Tesoureiro', desc: 'Guarda das Finanças e emissor oficial das notificações', iconBadge: 'TES' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto relative">
      {/* Toast flutuante de confirmação na tela */}
      {salvoFeedback && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-700 text-white font-bold text-sm px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-400 animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-emerald-200 shrink-0" />
          <div>
            <p className="font-extrabold text-sm">Alteração salva com sucesso!</p>
            <p className="text-xs text-emerald-100 font-normal">
              A Nominata do ciclo {anoCiclo} foi atualizada na Tesouraria.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center space-x-4">
            <LodgeLogo size={60} />
            <div>
              <h2 className="text-lg md:text-xl font-black text-[#081838] uppercase tracking-wider">
                Nominata e Oficiais da Loja
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Ano Maçônico em Exercício: <strong className="text-[#CFA73E] font-bold">{anoCiclo}</strong>
              </p>
            </div>
          </div>

          {salvoFeedback && (
            <div className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 animate-fadeIn border border-emerald-300">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              Alteração salva com sucesso!
            </div>
          )}
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Selecione os Irmãos que exercem cada cargo ritualístico no ciclo maçônico corrente. O Irmão designado no cargo de{' '}
          <strong className="text-[#081838]">Tesoureiro</strong> será automaticamente vinculado como signatário legal das
          Notificações e Recibos gerados pelo sistema.
        </p>

        <form onSubmit={handleSalvar} className="space-y-4">
          <div className="divide-y divide-slate-100">
            {cargos.map(({ key, cargo, desc, iconBadge }) => (
              <div
                key={key}
                className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/70 px-3 rounded-lg transition"
              >
                <div className="flex items-center space-x-3 min-w-[260px]">
                  <span className="w-10 h-10 rounded-full bg-[#081838] text-[#CFA73E] font-black text-xs flex items-center justify-center border border-[#CFA73E]/40 shrink-0">
                    {iconBadge}
                  </span>
                  <div>
                    <h4 className="text-xs md:text-sm font-bold text-slate-900">{cargo}</h4>
                    <p className="text-[11px] text-slate-400">{desc}</p>
                  </div>
                </div>

                <div className="w-full md:w-80">
                  <select
                    value={formState[key] || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className={`w-full border rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none ${
                      key === 'tes'
                        ? 'border-amber-400 bg-amber-50/50 text-[#081838] ring-1 ring-amber-400/50'
                        : 'border-slate-300 bg-white text-slate-800 focus:border-[#081838]'
                    }`}
                  >
                    <option value="">Selecione o Irmão...</option>
                    {irmaos.map((ir) => (
                      <option key={ir.id} value={ir.nome}>
                        {ir.nome} (CIM: {ir.cim})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              {salvoFeedback ? (
                <div className="text-emerald-700 bg-emerald-50 border border-emerald-300 font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-2 animate-fadeIn">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Alteração salva com sucesso!</span>
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">
                  * As alterações serão salvas para o ciclo {anoCiclo}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="bg-[#081838] hover:bg-[#162C5A] text-white font-bold text-xs px-6 py-2.5 rounded-lg shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4 text-[#CFA73E]" />
              Salvar Nominata ({anoCiclo})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
