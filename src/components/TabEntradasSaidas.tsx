import React from 'react';
import { Lancamento, MesCiclo, MESES_CICLO } from '../types';
import { formatarMoeda } from '../utils/helpers';
import { ArrowDownRight, ArrowUpRight, Scale } from 'lucide-react';

interface TabEntradasSaidasProps {
  lancamentos: Lancamento[];
  mesVigente: MesCiclo;
}

export const TabEntradasSaidas: React.FC<TabEntradasSaidasProps> = ({ lancamentos, mesVigente }) => {
  // Helper para normalizar o mês do lançamento para chave do ciclo
  const normalizarMesLancamento = (mesStr: string): MesCiclo | null => {
    const m = mesStr.toLowerCase();
    if (m.startsWith('ago')) return 'ago/26';
    if (m.startsWith('set')) return 'set/26';
    if (m.startsWith('out')) return 'out/26';
    if (m.startsWith('nov')) return 'nov/26';
    if (m.startsWith('dez')) return 'dez/26';
    if (m.startsWith('jan')) return 'jan/27';
    if (m.startsWith('fev')) return 'fev/27';
    if (m.startsWith('mar')) return 'mar/27';
    if (m.startsWith('abr')) return 'abr/27';
    if (m.startsWith('mai')) return 'mai/27';
    if (m.startsWith('jun')) return 'jun/27';
    if (m.startsWith('jul')) return 'jul/27';
    return null;
  };

  // Coleta todas as contas de entrada e saída
  const contasEntradaSet = new Set<string>();
  const contasSaidaSet = new Set<string>();

  lancamentos.forEach((l) => {
    if (l.tipo.includes('Entrada')) {
      contasEntradaSet.add(l.conta);
    } else {
      contasSaidaSet.add(l.conta);
    }
  });

  // Garantir rubricas padrões mesmo se vazias
  [
    'Mensalidades',
    'Mensalidades atrasadas',
    'Mensalidades antecipadas',
    'Joia Iniciação - Iniciação',
    'Joia Exaltação - Companheiro',
    'Joia Elevação - Mestre',
    'Joia Filiação / Desligamento',
  ].forEach((c) => contasEntradaSet.add(c));

  [
    'Mútua',
    'Captação',
    'Aluguel Templo',
    'Limpeza Templo',
    'Segurança Templo',
    'Site Da Loja',
  ].forEach((c) => contasSaidaSet.add(c));

  const listaContasEntrada = Array.from(contasEntradaSet).sort();
  const listaContasSaida = Array.from(contasSaidaSet).sort();

  // Matriz de valores: conta -> mes -> total
  const matrizEntradas: Record<string, Record<MesCiclo, number>> = {};
  listaContasEntrada.forEach((conta) => {
    matrizEntradas[conta] = {
      'ago/26': 0, 'set/26': 0, 'out/26': 0, 'nov/26': 0, 'dez/26': 0,
      'jan/27': 0, 'fev/27': 0, 'mar/27': 0, 'abr/27': 0, 'mai/27': 0,
      'jun/27': 0, 'jul/27': 0,
    };
  });

  const matrizSaidas: Record<string, Record<MesCiclo, number>> = {};
  listaContasSaida.forEach((conta) => {
    matrizSaidas[conta] = {
      'ago/26': 0, 'set/26': 0, 'out/26': 0, 'nov/26': 0, 'dez/26': 0,
      'jan/27': 0, 'fev/27': 0, 'mar/27': 0, 'abr/27': 0, 'mai/27': 0,
      'jun/27': 0, 'jul/27': 0,
    };
  });

  // Totais por mês
  const totalEntradasMes: Record<MesCiclo, number> = {
    'ago/26': 0, 'set/26': 0, 'out/26': 0, 'nov/26': 0, 'dez/26': 0,
    'jan/27': 0, 'fev/27': 0, 'mar/27': 0, 'abr/27': 0, 'mai/27': 0,
    'jun/27': 0, 'jul/27': 0,
  };
  const totalSaidasMes: Record<MesCiclo, number> = {
    'ago/26': 0, 'set/26': 0, 'out/26': 0, 'nov/26': 0, 'dez/26': 0,
    'jan/27': 0, 'fev/27': 0, 'mar/27': 0, 'abr/27': 0, 'mai/27': 0,
    'jun/27': 0, 'jul/27': 0,
  };

  lancamentos.forEach((l) => {
    const mesK = normalizarMesLancamento(l.mes);
    if (mesK) {
      if (l.tipo.includes('Entrada')) {
        if (!matrizEntradas[l.conta]) {
          matrizEntradas[l.conta] = {
            'ago/26': 0, 'set/26': 0, 'out/26': 0, 'nov/26': 0, 'dez/26': 0,
            'jan/27': 0, 'fev/27': 0, 'mar/27': 0, 'abr/27': 0, 'mai/27': 0,
            'jun/27': 0, 'jul/27': 0,
          };
        }
        matrizEntradas[l.conta][mesK] += l.valor;
        totalEntradasMes[mesK] += l.valor;
      } else {
        if (!matrizSaidas[l.conta]) {
          matrizSaidas[l.conta] = {
            'ago/26': 0, 'set/26': 0, 'out/26': 0, 'nov/26': 0, 'dez/26': 0,
            'jan/27': 0, 'fev/27': 0, 'mar/27': 0, 'abr/27': 0, 'mai/27': 0,
            'jun/27': 0, 'jul/27': 0,
          };
        }
        matrizSaidas[l.conta][mesK] += l.valor;
        totalSaidasMes[mesK] += l.valor;
      }
    }
  });

  const somaGeralEntradas = Object.values(totalEntradasMes).reduce((a, b) => a + b, 0);
  const somaGeralSaidas = Object.values(totalSaidasMes).reduce((a, b) => a + b, 0);
  const saldoOperacionalGeral = somaGeralEntradas - somaGeralSaidas;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Resumo Rápido do Ciclo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-emerald-800 tracking-wider">Total de Entradas</p>
            <h3 className="text-xl font-black text-emerald-900 font-mono mt-1">{formatarMoeda(somaGeralEntradas)}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center">
            <ArrowDownRight className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase text-rose-800 tracking-wider">Total de Saídas</p>
            <h3 className="text-xl font-black text-rose-900 font-mono mt-1">{formatarMoeda(somaGeralSaidas)}</h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>

        <div className={`border rounded-xl p-4 flex items-center justify-between ${
          saldoOperacionalGeral >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'
        }`}>
          <div>
            <p className="text-xs font-bold uppercase text-slate-700 tracking-wider">Resultado Operacional</p>
            <h3 className={`text-xl font-black font-mono mt-1 ${
              saldoOperacionalGeral >= 0 ? 'text-[#081838]' : 'text-red-700'
            }`}>
              {formatarMoeda(saldoOperacionalGeral)}
            </h3>
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center">
            <Scale className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabela de Entradas e Saídas Mês a Mês */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 space-y-6">
        <div>
          <h2 className="text-base font-black text-[#081838] uppercase tracking-wider">
            Demonstrativo de Entradas e Saídas por Rubrica
          </h2>
          <p className="text-xs text-slate-500">
            Valores computados diretamente do Livro Caixa da Loja no ciclo maçônico.
          </p>
        </div>

        {/* ===================== TABELA DE ENTRADAS ===================== */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase">
            <ArrowDownRight className="w-4 h-4 text-emerald-600" />
            <span>Entradas / Receitas</span>
          </div>

          <div className="overflow-x-auto custom-scroll border rounded-lg">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#081838] text-white uppercase text-[10px]">
                <tr>
                  <th className="p-2.5 border-r border-slate-700 min-w-[220px]">Rubrica de Entrada</th>
                  {MESES_CICLO.map((m) => (
                    <th
                      key={m}
                      className={`p-2 border-r border-slate-700 text-center w-20 ${
                        m === mesVigente ? 'bg-[#162C5A] text-amber-300 font-bold' : ''
                      }`}
                    >
                      {m}
                    </th>
                  ))}
                  <th className="p-2.5 text-right bg-slate-900 text-[#CFA73E] font-bold min-w-[95px]">
                    Total Rubrica
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {listaContasEntrada.map((conta) => {
                  let totalConta = 0;
                  MESES_CICLO.forEach((m) => {
                    totalConta += matrizEntradas[conta]?.[m] || 0;
                  });

                  return (
                    <tr key={conta} className="hover:bg-slate-50">
                      <td className="p-2 border-r border-slate-200 font-sans font-medium text-slate-800">
                        {conta}
                      </td>
                      {MESES_CICLO.map((m) => {
                        const val = matrizEntradas[conta]?.[m] || 0;
                        return (
                          <td
                            key={m}
                            className={`p-2 border-r border-slate-200 text-center ${
                              val > 0 ? 'text-emerald-700 font-semibold bg-emerald-50/20' : 'text-slate-300'
                            }`}
                          >
                            {val > 0 ? formatarMoeda(val) : '—'}
                          </td>
                        );
                      })}
                      <td className="p-2 text-right font-bold text-emerald-800 bg-slate-50">
                        {formatarMoeda(totalConta)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-emerald-50 font-bold text-xs border-t-2 border-emerald-800 text-emerald-950 font-mono">
                <tr>
                  <td className="p-2.5 text-left font-sans uppercase">Total Entradas</td>
                  {MESES_CICLO.map((m) => (
                    <td key={m} className="p-2 text-center text-[11px]">
                      {formatarMoeda(totalEntradasMes[m])}
                    </td>
                  ))}
                  <td className="p-2.5 text-right font-black text-xs bg-emerald-100">
                    {formatarMoeda(somaGeralEntradas)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ===================== TABELA DE SAÍDAS ===================== */}
        <div className="space-y-2 pt-4">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase">
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
            <span>Saídas / Despesas</span>
          </div>

          <div className="overflow-x-auto custom-scroll border rounded-lg">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#081838] text-white uppercase text-[10px]">
                <tr>
                  <th className="p-2.5 border-r border-slate-700 min-w-[220px]">Rubrica de Saída</th>
                  {MESES_CICLO.map((m) => (
                    <th
                      key={m}
                      className={`p-2 border-r border-slate-700 text-center w-20 ${
                        m === mesVigente ? 'bg-[#162C5A] text-amber-300 font-bold' : ''
                      }`}
                    >
                      {m}
                    </th>
                  ))}
                  <th className="p-2.5 text-right bg-slate-900 text-[#CFA73E] font-bold min-w-[95px]">
                    Total Rubrica
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {listaContasSaida.map((conta) => {
                  let totalConta = 0;
                  MESES_CICLO.forEach((m) => {
                    totalConta += matrizSaidas[conta]?.[m] || 0;
                  });

                  return (
                    <tr key={conta} className="hover:bg-slate-50">
                      <td className="p-2 border-r border-slate-200 font-sans font-medium text-slate-800">
                        {conta}
                      </td>
                      {MESES_CICLO.map((m) => {
                        const val = matrizSaidas[conta]?.[m] || 0;
                        return (
                          <td
                            key={m}
                            className={`p-2 border-r border-slate-200 text-center ${
                              val > 0 ? 'text-rose-700 font-semibold bg-rose-50/20' : 'text-slate-300'
                            }`}
                          >
                            {val > 0 ? formatarMoeda(val) : '—'}
                          </td>
                        );
                      })}
                      <td className="p-2 text-right font-bold text-rose-800 bg-slate-50">
                        {formatarMoeda(totalConta)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-rose-50 font-bold text-xs border-t-2 border-rose-800 text-rose-950 font-mono">
                <tr>
                  <td className="p-2.5 text-left font-sans uppercase">Total Saídas</td>
                  {MESES_CICLO.map((m) => (
                    <td key={m} className="p-2 text-center text-[11px]">
                      {formatarMoeda(totalSaidasMes[m])}
                    </td>
                  ))}
                  <td className="p-2.5 text-right font-black text-xs bg-rose-100">
                    {formatarMoeda(somaGeralSaidas)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* ===================== RESULTADO OPERACIONAL ===================== */}
        <div className="border border-slate-300 rounded-lg overflow-x-auto custom-scroll bg-slate-900 text-white font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <tbody>
              <tr className="font-bold">
                <td className="p-3 border-r border-slate-700 min-w-[220px] font-sans uppercase text-[#CFA73E]">
                  Saldo Operacional Mensal
                </td>
                {MESES_CICLO.map((m) => {
                  const saldoMes = totalEntradasMes[m] - totalSaidasMes[m];
                  return (
                    <td
                      key={m}
                      className={`p-2 text-center border-r border-slate-700 w-20 ${
                        saldoMes > 0
                          ? 'text-emerald-400'
                          : saldoMes < 0
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {formatarMoeda(saldoMes)}
                    </td>
                  );
                })}
                <td
                  className={`p-3 text-right font-black min-w-[95px] text-sm ${
                    saldoOperacionalGeral >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatarMoeda(saldoOperacionalGeral)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
