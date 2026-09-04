import React, { useState, useEffect } from 'react';
import {
  TabId,
  AnoCiclo,
  MesCiclo,
  Irmao,
  Lancamento,
  Parcelamento,
  Nominata,
  MESES_CICLO,
} from './types';
import {
  INITIAL_IRMAOS,
  INITIAL_LANCAMENTOS,
  INITIAL_PARCELAMENTOS,
  INITIAL_NOMINATA,
  INITIAL_RUBRICAS_ENTRADA,
  INITIAL_RUBRICAS_SAIDA,
  INITIAL_SALDO_INICIAL_CC,
} from './data/initialData';
import { loadFromLocalStorage, saveToLocalStorage } from './utils/helpers';
import { Header } from './components/Header';
import { TabInicio } from './components/TabInicio';
import { TabMensalidades } from './components/TabMensalidades';
import { TabEntradasSaidas } from './components/TabEntradasSaidas';
import { TabHistorico } from './components/TabHistorico';
import { TabFluxoCaixa } from './components/TabFluxoCaixa';
import { TabParcelamentos } from './components/TabParcelamentos';
import { TabDemonstrativo } from './components/TabDemonstrativo';
import { TabNominata } from './components/TabNominata';
import { TabIndicadores } from './components/TabIndicadores';
import { ModalNotificacao } from './components/ModalNotificacao';
import { ModalNovoIrmao } from './components/ModalNovoIrmao';

export default function App() {
  // Navigation & Ciclo
  const [activeTab, setActiveTab] = useState<TabId>(() =>
    loadFromLocalStorage<TabId>('active_tab', 'inicio')
  );
  const [anoCiclo, setAnoCiclo] = useState<AnoCiclo>(() =>
    loadFromLocalStorage<AnoCiclo>('ano_ciclo', '2026/2027')
  );
  const [mesVigente, setMesVigente] = useState<MesCiclo>(() =>
    loadFromLocalStorage<MesCiclo>('mes_vigente', 'ago/26')
  );

  // Core Data
  const [irmaos, setIrmaos] = useState<Irmao[]>(() =>
    loadFromLocalStorage<Irmao[]>('irmaos', INITIAL_IRMAOS)
  );
  const [lancamentos, setLancamentos] = useState<Lancamento[]>(() =>
    loadFromLocalStorage<Lancamento[]>('lancamentos', INITIAL_LANCAMENTOS)
  );
  const [parcelamentos, setParcelamentos] = useState<Parcelamento[]>(() =>
    loadFromLocalStorage<Parcelamento[]>('parcelamentos', INITIAL_PARCELAMENTOS)
  );
  const [nominatas, setNominatas] = useState<Record<AnoCiclo, Nominata>>(() =>
    loadFromLocalStorage<Record<AnoCiclo, Nominata>>('nominatas', INITIAL_NOMINATA)
  );
  const [rubricasEntrada, setRubricasEntrada] = useState<string[]>(() =>
    loadFromLocalStorage<string[]>('rubricas_entrada', INITIAL_RUBRICAS_ENTRADA)
  );
  const [rubricasSaida, setRubricasSaida] = useState<string[]>(() =>
    loadFromLocalStorage<string[]>('rubricas_saida', INITIAL_RUBRICAS_SAIDA)
  );
  const [saldoInicialCC, setSaldoInicialCC] = useState<number>(() =>
    loadFromLocalStorage<number>('saldo_inicial_cc', INITIAL_SALDO_INICIAL_CC)
  );

  // Modals state
  const [notificacaoIrmao, setNotificacaoIrmao] = useState<Irmao | null>(null);
  const [notificacaoMesesAtraso, setNotificacaoMesesAtraso] = useState<string[]>([]);
  const [isNovoIrmaoModalOpen, setIsNovoIrmaoModalOpen] = useState(false);

  // LocalStorage sync
  useEffect(() => {
    saveToLocalStorage('active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    saveToLocalStorage('ano_ciclo', anoCiclo);
  }, [anoCiclo]);

  useEffect(() => {
    saveToLocalStorage('mes_vigente', mesVigente);
  }, [mesVigente]);

  useEffect(() => {
    saveToLocalStorage('irmaos', irmaos);
  }, [irmaos]);

  useEffect(() => {
    saveToLocalStorage('lancamentos', lancamentos);
  }, [lancamentos]);

  useEffect(() => {
    saveToLocalStorage('parcelamentos', parcelamentos);
  }, [parcelamentos]);

  useEffect(() => {
    saveToLocalStorage('nominatas', nominatas);
  }, [nominatas]);

  useEffect(() => {
    saveToLocalStorage('rubricas_entrada', rubricasEntrada);
  }, [rubricasEntrada]);

  useEffect(() => {
    saveToLocalStorage('rubricas_saida', rubricasSaida);
  }, [rubricasSaida]);

  useEffect(() => {
    saveToLocalStorage('saldo_inicial_cc', saldoInicialCC);
  }, [saldoInicialCC]);

  // Handlers para Irmãos
  const handleUpdateIrmao = (irmaoId: string, updated: Partial<Irmao>) => {
    setIrmaos((prev) =>
      prev.map((ir) => (ir.id === irmaoId ? { ...ir, ...updated } : ir))
    );
  };

  const handleRemoveIrmao = (irmaoId: string) => {
    setIrmaos((prev) => prev.filter((ir) => ir.id !== irmaoId));
  };

  const handleAddIrmao = (novo: Omit<Irmao, 'id'>) => {
    const newId = `ir-${Date.now()}`;
    const novosMeses: Partial<Record<MesCiclo, number>> = {};
    MESES_CICLO.forEach((m) => {
      novosMeses[m] = novo.valorBase;
    });

    const irmaoCriado: Irmao = {
      ...novo,
      id: newId,
      valoresMeses: novosMeses,
    };

    setIrmaos((prev) => [...prev, irmaoCriado]);
  };

  // Handlers para Lançamentos (Livro Caixa)
  const handleAddLancamento = (novo: Omit<Lancamento, 'id'>) => {
    const newLancamento: Lancamento = {
      ...novo,
      id: `lan-${Date.now()}`,
      dataRegistro: new Date().toISOString(),
    };
    setLancamentos((prev) => [newLancamento, ...prev]);
  };

  const handleRemoveLancamento = (id: string) => {
    setLancamentos((prev) => prev.filter((l) => l.id !== id));
  };

  // Handlers para Rubricas
  const handleAddRubrica = (tipo: 'Entrada' | 'Saída', nome: string) => {
    if (tipo === 'Entrada') {
      if (!rubricasEntrada.includes(nome)) {
        setRubricasEntrada((prev) => [...prev, nome]);
      }
    } else {
      if (!rubricasSaida.includes(nome)) {
        setRubricasSaida((prev) => [...prev, nome]);
      }
    }
  };

  // Handlers para Parcelamentos
  const handleAddParcelamento = (novo: Omit<Parcelamento, 'id'>) => {
    const newParc: Parcelamento = {
      ...novo,
      id: `parc-${Date.now()}`,
    };
    setParcelamentos((prev) => [newParc, ...prev]);
  };

  const handleUpdateParcelamento = (id: string, updated: Partial<Parcelamento>) => {
    setParcelamentos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  const handleRemoveParcelamento = (id: string) => {
    setParcelamentos((prev) => prev.filter((p) => p.id !== id));
  };

  // Handlers para Nominata
  const handleUpdateNominata = (ano: AnoCiclo, novaNominata: Nominata) => {
    setNominatas((prev) => ({
      ...prev,
      [ano]: novaNominata,
    }));
  };

  // Trigger Notificação
  const handleOpenNotificacao = (irmao: Irmao, mesesAtraso: string[]) => {
    setNotificacaoIrmao(irmao);
    setNotificacaoMesesAtraso(mesesAtraso);
  };

  const currentNominata = nominatas[anoCiclo] || INITIAL_NOMINATA['2026/2027'];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Header com Navegação sem números */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        anoCiclo={anoCiclo}
        onChangeAnoCiclo={setAnoCiclo}
        mesVigente={mesVigente}
        onChangeMesVigente={setMesVigente}
      />

      {/* Conteúdo Principal da Aba Selecionada */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'inicio' && <TabInicio />}

        {activeTab === 'mensalidades' && (
          <TabMensalidades
            irmaos={irmaos}
            lancamentos={lancamentos}
            onUpdateIrmao={handleUpdateIrmao}
            onRemoveIrmao={handleRemoveIrmao}
            onOpenNovoIrmaoModal={() => setIsNovoIrmaoModalOpen(true)}
            mesVigente={mesVigente}
          />
        )}

        {activeTab === 'entradas-saidas' && (
          <TabEntradasSaidas lancamentos={lancamentos} mesVigente={mesVigente} />
        )}

        {activeTab === 'historico' && (
          <TabHistorico
            lancamentos={lancamentos}
            onAddLancamento={handleAddLancamento}
            onRemoveLancamento={handleRemoveLancamento}
            rubricasEntrada={rubricasEntrada}
            rubricasSaida={rubricasSaida}
            onAddRubrica={handleAddRubrica}
            irmaos={irmaos}
            mesVigente={mesVigente}
          />
        )}

        {activeTab === 'fluxo-caixa' && (
          <TabFluxoCaixa
            lancamentos={lancamentos}
            irmaos={irmaos}
            parcelamentos={parcelamentos}
            saldoInicialCC={saldoInicialCC}
            onUpdateSaldoInicial={setSaldoInicialCC}
            mesVigente={mesVigente}
          />
        )}

        {activeTab === 'parcelamentos' && (
          <TabParcelamentos
            parcelamentos={parcelamentos}
            onAddParcelamento={handleAddParcelamento}
            onUpdateParcelamento={handleUpdateParcelamento}
            onRemoveParcelamento={handleRemoveParcelamento}
            irmaos={irmaos}
          />
        )}

        {activeTab === 'demonstrativo' && (
          <TabDemonstrativo
            irmaos={irmaos}
            lancamentos={lancamentos}
            mesVigente={mesVigente}
            anoCiclo={anoCiclo}
            onOpenNotificacao={handleOpenNotificacao}
          />
        )}

        {activeTab === 'nominata' && (
          <TabNominata
            nominatas={nominatas}
            onUpdateNominata={handleUpdateNominata}
            anoCiclo={anoCiclo}
            irmaos={irmaos}
          />
        )}

        {activeTab === 'indicadores' && (
          <TabIndicadores
            lancamentos={lancamentos}
            irmaos={irmaos}
            anoCiclo={anoCiclo}
            mesVigente={mesVigente}
          />
        )}
      </main>

      {/* Footer Maçônico */}
      <footer className="no-print bg-[#081838] border-t-2 border-[#CFA73E] text-slate-400 text-xs py-5 px-4 text-center mt-12">
        <div className="max-w-7xl mx-auto space-y-1.5">
          <p className="text-white font-bold tracking-wider uppercase text-[11px]">
            A∴ R∴ L∴ S∴ Acácia do Leste nº 424 • Rito de York
          </p>
          <p className="text-amber-400 font-semibold text-[10px] tracking-widest uppercase">
            Liberdade • Igualdade • Fraternidade
          </p>
          <p className="text-slate-500 text-[10px]">
            Sistema de Gestão Financeira e Contábil da Tesouraria • Or.'. de São Paulo - SP
          </p>
        </div>
      </footer>

      {/* Modal Notificação Oficial Inadimplente */}
      {notificacaoIrmao && (
        <ModalNotificacao
          irmao={notificacaoIrmao}
          mesesAtraso={notificacaoMesesAtraso}
          nominata={currentNominata}
          onClose={() => setNotificacaoIrmao(null)}
        />
      )}

      {/* Modal Cadastrar Novo Irmão */}
      {isNovoIrmaoModalOpen && (
        <ModalNovoIrmao
          onAddIrmao={handleAddIrmao}
          onClose={() => setIsNovoIrmaoModalOpen(false)}
        />
      )}
    </div>
  );
}
