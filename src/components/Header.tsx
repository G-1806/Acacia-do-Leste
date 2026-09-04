import React, { useState, useEffect } from 'react';
import { TabId, AnoCiclo, MesCiclo, MESES_CICLO, MESES_NOMES } from '../types';
import { LodgeLogo } from './LodgeLogo';
import {
  Landmark,
  CalendarCheck,
  TableCellsSplit,
  BookOpenCheck,
  TrendingUp,
  FileSpreadsheet,
  Contact2,
  Users2,
  PieChart,
  Menu,
  X,
  ChevronRight,
  Check,
} from 'lucide-react';

interface HeaderProps {
  activeTab: TabId;
  onSelectTab: (tab: TabId) => void;
  anoCiclo: AnoCiclo;
  onChangeAnoCiclo: (ano: AnoCiclo) => void;
  mesVigente: MesCiclo;
  onChangeMesVigente: (mes: MesCiclo) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  anoCiclo,
  onChangeAnoCiclo,
  mesVigente,
  onChangeMesVigente,
}) => {
  const [menuAberto, setMenuAberto] = useState(false);

  const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'inicio', label: 'Início', icon: Landmark },
    { id: 'mensalidades', label: 'Mensalidades', icon: CalendarCheck },
    { id: 'entradas-saidas', label: 'Entradas & Saídas', icon: TableCellsSplit },
    { id: 'historico', label: 'Lançamentos / Histórico', icon: BookOpenCheck },
    { id: 'fluxo-caixa', label: 'Fluxo de Caixa', icon: TrendingUp },
    { id: 'parcelamentos', label: 'Parcelamentos / Negociações', icon: FileSpreadsheet },
    { id: 'demonstrativo', label: 'Demonstrativo por Irmão', icon: Contact2 },
    { id: 'nominata', label: 'Nominata', icon: Users2 },
    { id: 'indicadores', label: 'Indicadores & Gráficos', icon: PieChart },
  ];

  const currentTabObj = tabs.find((t) => t.id === activeTab) || tabs[0];
  const CurrentIcon = currentTabObj.icon;

  // Fecha o menu com a tecla ESC e trava o scroll quando aberto
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuAberto(false);
      }
    };
    if (menuAberto) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [menuAberto]);

  const handleSelectTab = (tabId: TabId) => {
    onSelectTab(tabId);
    setMenuAberto(false);
  };

  return (
    <header className="bg-[#081838] text-white border-b-4 border-[#CFA73E] shadow-xl sticky top-0 z-40">
      {/* Barra Superior com Logo, Título, Controles Globais e Botão Sanduíche */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 sm:gap-3">
        {/* Identificação da Loja */}
        <div className="flex items-center space-x-2.5 sm:space-x-3.5 min-w-0">
          <LodgeLogo size={46} className="shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-base md:text-xl font-black tracking-wide text-[#CFA73E] uppercase truncate">
                A∴ R∴ L∴ S∴ Acácia do Leste nº 424
              </h1>
              <span className="hidden md:inline-block bg-[#162C5A] text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-400/40 shrink-0">
                Rito de York
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300 font-medium truncate">
              Or.'. de São Paulo • GOP - Grande Oriente Paulista • Tesouraria e Finanças
            </p>
          </div>
        </div>

        {/* Lado Direito: Seletores Globais + Botão Sanduíche */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Seletores Globais em telas médias/grandes */}
          <div className="hidden lg:flex items-center gap-2 bg-[#162C5A]/80 px-3 py-1.5 rounded-lg border border-[#CFA73E]/40 text-xs shadow-inner">
            <div className="flex items-center gap-1.5">
              <span className="text-[#CFA73E] font-bold uppercase tracking-wider text-[11px]">Ano Maçônico:</span>
              <select
                id="header-select-ciclo"
                value={anoCiclo}
                onChange={(e) => onChangeAnoCiclo(e.target.value as AnoCiclo)}
                className="bg-[#081838] text-white text-xs px-2 py-1 rounded border border-[#CFA73E]/50 focus:outline-none font-semibold cursor-pointer"
              >
                <option value="2025/2026">2025 / 2026</option>
                <option value="2026/2027">2026 / 2027</option>
                <option value="2027/2028">2027 / 2028</option>
                <option value="2029/2030">2029 / 2030</option>
              </select>
            </div>

            <div className="h-4 w-px bg-slate-600" />

            <div className="flex items-center gap-1.5">
              <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">Mês Vigente:</span>
              <select
                id="header-select-mes-vigente"
                value={mesVigente}
                onChange={(e) => onChangeMesVigente(e.target.value as MesCiclo)}
                className="bg-[#081838] text-[#CFA73E] font-bold text-xs px-2 py-1 rounded border border-[#CFA73E]/50 focus:outline-none cursor-pointer"
              >
                {MESES_CICLO.map((m) => (
                  <option key={m} value={m}>
                    {MESES_NOMES[m]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botão Sanduíche Responsivo (Disponível em mobile/tablet e telas compactas) */}
          <button
            id="header-hamburger-btn"
            type="button"
            onClick={() => setMenuAberto(!menuAberto)}
            aria-label={menuAberto ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            aria-expanded={menuAberto}
            className="flex items-center gap-1.5 bg-[#162C5A] hover:bg-[#1E3A7A] active:scale-95 text-[#CFA73E] border border-[#CFA73E]/60 px-3 py-2 rounded-lg font-bold text-xs tracking-wider transition-all duration-150 cursor-pointer shadow-md focus:outline-none focus:ring-2 focus:ring-[#CFA73E]"
          >
            {menuAberto ? (
              <>
                <X className="w-5 h-5 text-amber-300" />
                <span className="hidden sm:inline font-bold uppercase text-[11px]">Fechar</span>
              </>
            ) : (
              <>
                <Menu className="w-5 h-5 text-[#CFA73E]" />
                <span className="hidden sm:inline font-bold uppercase text-[11px]">Menu</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sub-barra Compacta em Telas Menores (Mostra a aba ativa e atalho para o menu sanduíche) */}
      <div className="lg:hidden bg-[#0c2044] border-t border-slate-700/60 px-3 sm:px-4 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-200">
          <CurrentIcon className="w-4 h-4 text-[#CFA73E] shrink-0" />
          <span className="text-[11px] text-slate-300">Aba Ativa:</span>
          <span className="font-bold text-[#CFA73E] truncate max-w-[200px] sm:max-w-xs">{currentTabObj.label}</span>
        </div>
        <button
          onClick={() => setMenuAberto(true)}
          className="text-[11px] font-bold text-amber-300 hover:text-white flex items-center gap-1 cursor-pointer underline decoration-amber-400/50"
        >
          <span>Trocar aba</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Barra de Navegação Horizontal Tradicional (Desktop) */}
      <nav className="hidden lg:flex max-w-7xl mx-auto px-4 space-x-1 overflow-x-auto custom-scroll text-xs border-t border-slate-800/80">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => handleSelectTab(tab.id)}
              className={`py-2.5 px-3.5 font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'border-[#CFA73E] text-[#CFA73E] bg-white/5'
                  : 'border-transparent text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#CFA73E]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Menu Sanduíche Drawer Lateral / Modal Responsivo para qualquer navegador */}
      {menuAberto && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop escuro com clique para fechar */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={() => setMenuAberto(false)}
            aria-hidden="true"
          />

          {/* Conteúdo do Menu Sanduíche */}
          <div
            id="mobile-drawer-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu principal de navegação"
            className="relative z-10 w-full sm:w-96 max-w-full bg-[#081838] border-l-2 border-[#CFA73E] shadow-2xl h-full flex flex-col justify-between overflow-y-auto animate-slideInRight text-white"
          >
            {/* Topo do Menu Sanduíche */}
            <div>
              <div className="p-4 bg-[#0c2044] border-b border-[#CFA73E]/40 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <LodgeLogo size={42} />
                  <div>
                    <h2 className="text-sm font-black text-[#CFA73E] uppercase tracking-wide">
                      A∴ R∴ L∴ S∴ Acácia do Leste nº 424
                    </h2>
                    <p className="text-[11px] text-slate-300">Menu da Tesouraria • Rito de York</p>
                  </div>
                </div>
                <button
                  id="close-hamburger-menu-btn"
                  type="button"
                  onClick={() => setMenuAberto(false)}
                  aria-label="Fechar menu"
                  className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition cursor-pointer"
                >
                  <X className="w-6 h-6 text-amber-300" />
                </button>
              </div>

              {/* Controles de Ciclo e Mês Vigente dentro do Menu Sanduíche */}
              <div className="p-4 bg-[#122752] border-b border-slate-700/80 space-y-2.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#CFA73E]">
                  Configurações Rápidas do Período
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-300 font-semibold mb-1">
                      Ano Maçônico:
                    </label>
                    <select
                      id="drawer-select-ciclo"
                      value={anoCiclo}
                      onChange={(e) => onChangeAnoCiclo(e.target.value as AnoCiclo)}
                      className="w-full bg-[#081838] text-white text-xs px-2.5 py-2 rounded-lg border border-[#CFA73E]/50 focus:outline-none font-semibold cursor-pointer"
                    >
                      <option value="2025/2026">2025 / 2026</option>
                      <option value="2026/2027">2026 / 2027</option>
                      <option value="2027/2028">2027 / 2028</option>
                      <option value="2029/2030">2029 / 2030</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-300 font-semibold mb-1">
                      Mês Vigente:
                    </label>
                    <select
                      id="drawer-select-mes-vigente"
                      value={mesVigente}
                      onChange={(e) => onChangeMesVigente(e.target.value as MesCiclo)}
                      className="w-full bg-[#081838] text-[#CFA73E] font-bold text-xs px-2.5 py-2 rounded-lg border border-[#CFA73E]/50 focus:outline-none cursor-pointer"
                    >
                      {MESES_CICLO.map((m) => (
                        <option key={m} value={m}>
                          {MESES_NOMES[m]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Lista das 9 Abas com Ícones e Design Touch-friendly */}
              <div className="p-3 space-y-1">
                <p className="px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Navegação de Módulos
                </p>
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      id={`drawer-tab-${tab.id}`}
                      onClick={() => handleSelectTab(tab.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                        isActive
                          ? 'bg-[#162C5A] text-[#CFA73E] font-extrabold border border-[#CFA73E]/60 shadow-md'
                          : 'text-slate-200 hover:text-white hover:bg-white/5 font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            isActive
                              ? 'bg-[#081838] text-[#CFA73E] border border-[#CFA73E]/50'
                              : 'bg-white/5 text-slate-400'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs sm:text-sm">{tab.label}</span>
                      </div>
                      {isActive ? (
                        <span className="flex items-center gap-1 bg-amber-400/20 text-[#CFA73E] px-2 py-0.5 rounded text-[10px] font-bold border border-[#CFA73E]/40">
                          <Check className="w-3 h-3" />
                          <span>Ativo</span>
                        </span>
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rodapé Maçônico do Menu */}
            <div className="p-4 bg-[#0c2044] border-t border-[#CFA73E]/30 text-center space-y-1">
              <p className="text-[10px] font-black text-[#CFA73E] tracking-widest uppercase">
                G∴ A∴ D∴ U∴
              </p>
              <p className="text-[10px] text-slate-400">
                À Glória do Grande Arquiteto do Universo
              </p>
              <p className="text-[9px] text-slate-500 pt-1">
                A∴ R∴ L∴ S∴ Acácia do Leste nº 424 • GOP
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

