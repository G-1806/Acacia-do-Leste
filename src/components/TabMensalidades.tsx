import React, { useState } from 'react';
import { Irmao, Lancamento, MesCiclo, MESES_CICLO, MESES_NOMES } from '../types';
import { formatarMoeda } from '../utils/helpers';
import {
  Users,
  Copy,
  UserPlus,
  Trash2,
  Receipt,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface TabMensalidadesProps {
  irmaos: Irmao[];
  lancamentos: Lancamento[];
  onUpdateIrmao: (irmaoId: string, updated: Partial<Irmao>) => void;
  onRemoveIrmao: (irmaoId: string) => void;
  onOpenNovoIrmaoModal: () => void;
  mesVigente: MesCiclo;
}

export const TabMensalidades: React.FC<TabMensalidadesProps> = ({
  irmaos,
  lancamentos,
  onUpdateIrmao,
  onRemoveIrmao,
  onOpenNovoIrmaoModal,
  mesVigente,
}) => {
  const [visualizacaoRealizada, setVisualizacaoRealizada] = useState<'consolidado' | MesCiclo>('consolidado');
  const [buscaNome, setBuscaNome] = useState('');

  // Helper para buscar valor projetado de um irmão em determinado mês
  const getValorProjetado = (ir: Irmao, mes: MesCiclo): number => {
    if (ir.valoresMeses && ir.valoresMeses[mes] !== undefined) {
      return ir.valoresMeses[mes]!;
    }
    return ir.valorBase || 0;
  };

  // Helper para buscar pagamentos reais consolidados a partir do livro caixa
  const getPagamentosReais = (nomeIrmao: string): Record<MesCiclo, number> => {
    const pagos: Record<MesCiclo, number> = {
      'ago/26': 0,
      'set/26': 0,
      'out/26': 0,
      'nov/26': 0,
      'dez/26': 0,
      'jan/27': 0,
      'fev/27': 0,
      'mar/27': 0,
      'abr/27': 0,
      'mai/27': 0,
      'jun/27': 0,
      'jul/27': 0,
    };

    const nomeFormatado = nomeIrmao.trim().toLowerCase();

    lancamentos.forEach((l) => {
      if (
        l.tipo.includes('Entrada') &&
        (l.conta.toLowerCase().includes('mensalidade') || l.conta.toLowerCase().includes('mensalidades')) &&
        l.desc.trim().toLowerCase() === nomeFormatado
      ) {
        let mesKey: MesCiclo | null = null;
        const mesLanc = l.mes.toLowerCase();

        if (mesLanc.startsWith('ago')) mesKey = 'ago/26';
        else if (mesLanc.startsWith('set')) mesKey = 'set/26';
        else if (mesLanc.startsWith('out')) mesKey = 'out/26';
        else if (mesLanc.startsWith('nov')) mesKey = 'nov/26';
        else if (mesLanc.startsWith('dez')) mesKey = 'dez/26';
        else if (mesLanc.startsWith('jan')) mesKey = 'jan/27';
        else if (mesLanc.startsWith('fev')) mesKey = 'fev/27';
        else if (mesLanc.startsWith('mar')) mesKey = 'mar/27';
        else if (mesLanc.startsWith('abr')) mesKey = 'abr/27';
        else if (mesLanc.startsWith('mai')) mesKey = 'mai/27';
        else if (mesLanc.startsWith('jun')) mesKey = 'jun/27';
        else if (mesLanc.startsWith('jul')) mesKey = 'jul/27';

        if (mesKey && pagos[mesKey] !== undefined) {
          pagos[mesKey] += l.valor;
        }
      }
    });

    return pagos;
  };

  // Replicar valor padrão (R$ 220) para todos os irmãos ativos
  const replicarPadraoTodos = () => {
    if (window.confirm('Deseja replicar o valor padrão de R$ 220,00 para todos os irmãos com contribuição ativa?')) {
      irmaos.forEach((ir) => {
        if (ir.valorBase > 0) {
          const novosMeses: Partial<Record<MesCiclo, number>> = {};
          MESES_CICLO.forEach((m) => {
            novosMeses[m] = 220;
          });
          onUpdateIrmao(ir.id, { valorBase: 220, valoresMeses: novosMeses });
        }
      });
    }
  };

  // Replicar valor de um irmão para todos os seus 12 meses
  const replicarLinhaIrmao = (ir: Irmao, valor: number) => {
    const novosMeses: Partial<Record<MesCiclo, number>> = {};
    MESES_CICLO.forEach((m) => {
      novosMeses[m] = valor;
    });
    onUpdateIrmao(ir.id, { valorBase: valor, valoresMeses: novosMeses });
  };

  const irmaosFiltrados = irmaos.filter((ir) =>
    ir.nome.toLowerCase().includes(buscaNome.toLowerCase()) || ir.cim.includes(buscaNome)
  );

  // Totais Quadro 1: Projetada
  const totaisProjetadaMes: Record<MesCiclo, number> = {
    'ago/26': 0,
    'set/26': 0,
    'out/26': 0,
    'nov/26': 0,
    'dez/26': 0,
    'jan/27': 0,
    'fev/27': 0,
    'mar/27': 0,
    'abr/27': 0,
    'mai/27': 0,
    'jun/27': 0,
    'jul/27': 0,
  };
  let totalGeralProjetado = 0;

  irmaos.forEach((ir) => {
    MESES_CICLO.forEach((m) => {
      const v = getValorProjetado(ir, m);
      totaisProjetadaMes[m] += v;
      totalGeralProjetado += v;
    });
  });

  // Totais Quadro 2: Realizada
  const totaisRealizadaMes: Record<MesCiclo, number> = {
    'ago/26': 0,
    'set/26': 0,
    'out/26': 0,
    'nov/26': 0,
    'dez/26': 0,
    'jan/27': 0,
    'fev/27': 0,
    'mar/27': 0,
    'abr/27': 0,
    'mai/27': 0,
    'jun/27': 0,
    'jul/27': 0,
  };
  let totalGeralRealizado = 0;

  irmaos.forEach((ir) => {
    const pagos = getPagamentosReais(ir.nome);
    MESES_CICLO.forEach((m) => {
      totaisRealizadaMes[m] += pagos[m];
      totalGeralRealizado += pagos[m];
    });
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Action Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Buscar Irmão por nome ou CIM..."
            value={buscaNome}
            onChange={(e) => setBuscaNome(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 w-64 focus:outline-none focus:border-[#CFA73E] bg-slate-50"
          />
          {buscaNome && (
            <button
              onClick={() => setBuscaNome('')}
              className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
            >
              Limpar
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenNovoIrmaoModal}
            className="bg-[#CFA73E] hover:bg-[#b89432] text-[#081838] text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Novo Irmão
          </button>
          <button
            onClick={replicarPadraoTodos}
            className="bg-[#162C5A] hover:bg-[#081838] text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer"
          >
            <Copy className="w-4 h-4 text-amber-300" /> Replicar R$ 220 Padrão
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1º QUADRO: MENSALIDADES PROJETADA                        */}
      {/* ======================================================== */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-sm md:text-base font-black text-[#081838] uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#CFA73E]" />
              1º Quadro: Mensalidades Projetadas (Planejamento da Receita)
            </h2>
            <p className="text-xs text-slate-500">
              Planejamento mês a mês com edição livre e replicação. Total previsto no ciclo:{' '}
              <strong className="text-[#081838] font-mono">{formatarMoeda(totalGeralProjetado)}</strong>
            </p>
          </div>
        </div>

        <div className="overflow-x-auto custom-scroll border rounded-lg">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#081838] text-white uppercase text-[10px] sticky top-0">
              <tr>
                <th className="p-2.5 border-r border-slate-700 min-w-[210px]">Nome do Irmão</th>
                <th className="p-2 border-r border-slate-700 text-center w-16">CIM</th>
                <th className="p-2 border-r border-slate-700 text-center w-14">Mútua</th>
                <th className="p-2 border-r border-slate-700 text-center w-16">Captação</th>
                {MESES_CICLO.map((m) => (
                  <th
                    key={m}
                    className={`p-2 border-r border-slate-700 text-center w-18 ${
                      m === mesVigente ? 'bg-[#162C5A] text-amber-300 font-bold ring-1 ring-amber-400/50' : ''
                    }`}
                  >
                    {m}
                  </th>
                ))}
                <th className="p-2.5 border-r border-slate-700 text-right bg-slate-900 text-[#CFA73E] font-bold min-w-[90px]">
                  Total Ano
                </th>
                <th className="p-2 text-center no-print w-24">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {irmaosFiltrados.map((ir) => {
                let totalAnoIrmao = 0;
                MESES_CICLO.forEach((m) => {
                  totalAnoIrmao += getValorProjetado(ir, m);
                });

                return (
                  <tr key={ir.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-2 border-r border-slate-200 font-sans font-medium text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#081838] font-serif">Ir∴</span>
                        <span>{ir.nome}</span>
                      </div>
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center text-slate-600 font-medium">
                      {ir.cim}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          ir.mutua === 'Sim' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {ir.mutua}
                      </span>
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          ir.captacao === 'Sim' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {ir.captacao}
                      </span>
                    </td>
                    {MESES_CICLO.map((m) => {
                      const v = getValorProjetado(ir, m);
                      return (
                        <td
                          key={m}
                          className={`p-1 border-r border-slate-200 text-center ${
                            m === mesVigente ? 'bg-amber-50/40' : ''
                          }`}
                        >
                          <input
                            type="number"
                            step="10"
                            value={v}
                            onChange={(e) => {
                              const valNum = parseFloat(e.target.value) || 0;
                              const novosMeses = { ...(ir.valoresMeses || {}) };
                              novosMeses[m] = valNum;
                              onUpdateIrmao(ir.id, { valoresMeses: novosMeses });
                            }}
                            className="w-16 text-center bg-transparent hover:bg-white focus:bg-white border border-transparent hover:border-slate-300 focus:border-[#CFA73E] rounded px-1 py-0.5 font-mono text-[11px] focus:outline-none"
                          />
                        </td>
                      );
                    })}
                    <td className="p-2 border-r border-slate-200 text-right font-bold bg-slate-50 text-[#081838]">
                      {formatarMoeda(totalAnoIrmao)}
                    </td>
                    <td className="p-2 text-center no-print">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => replicarLinhaIrmao(ir, ir.valorBase || 220)}
                          title="Replicar valor base para todos os 12 meses deste irmão"
                          className="text-slate-400 hover:text-amber-600 p-1 cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Deseja realmente remover o Irmão ${ir.nome}?`)) {
                              onRemoveIrmao(ir.id);
                            }
                          }}
                          title="Remover irmão"
                          className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-100 font-bold text-xs border-t-2 border-[#081838]">
              <tr>
                <td colSpan={4} className="p-2.5 text-center uppercase tracking-wider text-slate-700">
                  TOTAL PROJETADO
                </td>
                {MESES_CICLO.map((m) => (
                  <td key={m} className="p-2 text-center font-mono text-[11px] text-slate-800">
                    {formatarMoeda(totaisProjetadaMes[m])}
                  </td>
                ))}
                <td className="p-2.5 text-right font-mono text-[#081838] text-xs font-black bg-amber-50/50">
                  {formatarMoeda(totalGeralProjetado)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2º QUADRO: MENSALIDADES REALIZADA (ALIMENTADA VIA LIVRO) */}
      {/* ======================================================== */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm md:text-base font-black text-emerald-800 uppercase tracking-wider flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                2º Quadro: Mensalidades Realizadas (Efetivamente Pagas)
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Integrado ao Livro Caixa
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Total efetivamente arrecadado no ciclo:{' '}
              <strong className="text-emerald-700 font-mono">{formatarMoeda(totalGeralRealizado)}</strong>
            </p>
          </div>

          {/* Seletor de Visualização: Consolidado ou Mês a Mês */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600 font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Visualização:
            </span>
            <select
              value={visualizacaoRealizada}
              onChange={(e) => setVisualizacaoRealizada(e.target.value as 'consolidado' | MesCiclo)}
              className="border border-slate-300 rounded px-2.5 py-1 text-xs bg-slate-50 font-semibold text-slate-800 focus:outline-none focus:border-emerald-600"
            >
              <option value="consolidado">Todos os Meses (Consolidado)</option>
              {MESES_CICLO.map((m) => (
                <option key={m} value={m}>
                  Apenas {MESES_NOMES[m]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto custom-scroll border rounded-lg">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-800 text-white uppercase text-[10px] sticky top-0">
              <tr>
                <th className="p-2.5 border-r border-slate-700 min-w-[210px]">Nome do Irmão</th>
                <th className="p-2 border-r border-slate-700 text-center w-16">CIM</th>
                {visualizacaoRealizada === 'consolidado' ? (
                  MESES_CICLO.map((m) => (
                    <th
                      key={m}
                      className={`p-2 border-r border-slate-700 text-center w-18 ${
                        m === mesVigente ? 'bg-emerald-900 text-emerald-300 font-bold' : ''
                      }`}
                    >
                      {m}
                    </th>
                  ))
                ) : (
                  <th className="p-2 border-r border-slate-700 text-center bg-emerald-900 text-white font-bold">
                    {MESES_NOMES[visualizacaoRealizada]}
                  </th>
                )}
                <th className="p-2.5 text-right bg-emerald-950 text-emerald-300 font-bold min-w-[95px]">
                  Total Pago
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {irmaosFiltrados.map((ir) => {
                const pagamentos = getPagamentosReais(ir.nome);
                let totalIrmaoPago = 0;
                MESES_CICLO.forEach((m) => {
                  totalIrmaoPago += pagamentos[m];
                });

                return (
                  <tr key={ir.id} className="hover:bg-slate-50 transition">
                    <td className="p-2 border-r border-slate-200 font-sans font-medium text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#081838] font-serif">Ir∴</span>
                        <span>{ir.nome}</span>
                      </div>
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center text-slate-600 font-medium">
                      {ir.cim}
                    </td>
                    {visualizacaoRealizada === 'consolidado' ? (
                      MESES_CICLO.map((m) => {
                        const vlr = pagamentos[m];
                        return (
                          <td
                            key={m}
                            className={`p-2 border-r border-slate-200 text-center ${
                              vlr > 0 ? 'font-bold text-emerald-700 bg-emerald-50/40' : 'text-slate-300'
                            }`}
                          >
                            {vlr > 0 ? formatarMoeda(vlr) : '—'}
                          </td>
                        );
                      })
                    ) : (
                      <td
                        className={`p-2 border-r border-slate-200 text-center ${
                          pagamentos[visualizacaoRealizada] > 0
                            ? 'font-bold text-emerald-700 bg-emerald-50/50'
                            : 'text-slate-300'
                        }`}
                      >
                        {pagamentos[visualizacaoRealizada] > 0
                          ? formatarMoeda(pagamentos[visualizacaoRealizada])
                          : '—'}
                      </td>
                    )}
                    <td className="p-2 text-right font-bold text-emerald-800 bg-emerald-50/70">
                      {formatarMoeda(totalIrmaoPago)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-emerald-50 font-bold text-xs border-t-2 border-emerald-800 text-emerald-950">
              <tr>
                <td colSpan={2} className="p-2.5 text-center uppercase tracking-wider">
                  TOTAL REALIZADO (LIVRO CAIXA)
                </td>
                {visualizacaoRealizada === 'consolidado' ? (
                  MESES_CICLO.map((m) => (
                    <td key={m} className="p-2 text-center font-mono text-[11px] text-emerald-900">
                      {formatarMoeda(totaisRealizadaMes[m])}
                    </td>
                  ))
                ) : (
                  <td className="p-2 text-center font-mono text-emerald-900">
                    {formatarMoeda(totaisRealizadaMes[visualizacaoRealizada])}
                  </td>
                )}
                <td className="p-2.5 text-right font-mono text-emerald-950 font-black">
                  {formatarMoeda(totalGeralRealizado)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
