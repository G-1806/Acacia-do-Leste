import React, { useState } from 'react';
import { Lancamento, Irmao, MesCiclo, MESES_CICLO, MESES_NOMES, AnoCiclo } from '../types';
import { formatarMoeda } from '../utils/helpers';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Percent,
  CheckCircle,
  AlertCircle,
  Filter,
} from 'lucide-react';

interface TabIndicadoresProps {
  lancamentos: Lancamento[];
  irmaos: Irmao[];
  anoCiclo: AnoCiclo;
  mesVigente: MesCiclo;
}

export const TabIndicadores: React.FC<TabIndicadoresProps> = ({
  lancamentos,
  irmaos,
  anoCiclo,
  mesVigente,
}) => {
  const [filtroPeriodo, setFiltroPeriodo] = useState<'completo' | 'semestre1' | 'semestre2'>('completo');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');

  const normalizarMes = (mesStr: string): MesCiclo | null => {
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

  // Determina quais meses entram no filtro
  const mesesFiltrados: MesCiclo[] = MESES_CICLO.filter((m, idx) => {
    if (filtroPeriodo === 'semestre1') return idx <= 5; // ago a jan
    if (filtroPeriodo === 'semestre2') return idx > 5;  // fev a jul
    return true;
  });

  // Filtragem dos lançamentos
  const lancamentosFiltrados = lancamentos.filter((l) => {
    const mK = normalizarMes(l.mes);
    if (!mK || !mesesFiltrados.includes(mK)) return false;

    if (filtroCategoria !== 'todas') {
      if (filtroCategoria === 'mensalidades' && !l.conta.toLowerCase().includes('mensalidade')) return false;
      if (filtroCategoria === 'joias' && !l.conta.toLowerCase().includes('joia') && !l.conta.toLowerCase().includes('taxa')) return false;
      if (filtroCategoria === 'templo' && !l.conta.toLowerCase().includes('templo') && !l.conta.toLowerCase().includes('aluguel') && !l.conta.toLowerCase().includes('segurança') && !l.conta.toLowerCase().includes('limpeza')) return false;
    }

    return true;
  });

  const totalEntradas = lancamentosFiltrados
    .filter((l) => l.tipo.includes('Entrada'))
    .reduce((acc, curr) => acc + curr.valor, 0);

  const totalSaidas = lancamentosFiltrados
    .filter((l) => l.tipo.includes('Saída'))
    .reduce((acc, curr) => acc + curr.valor, 0);

  const saldoLiquido = totalEntradas - totalSaidas;

  // Evolução mês a mês para gráfico de barras
  const dadosMensais = mesesFiltrados.map((m) => {
    let ent = 0;
    let sai = 0;

    lancamentos.forEach((l) => {
      const mK = normalizarMes(l.mes);
      if (mK === m) {
        if (l.tipo.includes('Entrada')) ent += l.valor;
        else sai += l.valor;
      }
    });

    return {
      mes: m,
      mesNome: MESES_NOMES[m],
      entradas: ent,
      saidas: sai,
    };
  });

  const maxValorGrafico = Math.max(
    ...dadosMensais.map((d) => Math.max(d.entradas, d.saidas)),
    1000
  );

  // Distribuição por Rubricas de Entrada
  const rubricasEntradaMap: Record<string, number> = {};
  lancamentosFiltrados
    .filter((l) => l.tipo.includes('Entrada'))
    .forEach((l) => {
      rubricasEntradaMap[l.conta] = (rubricasEntradaMap[l.conta] || 0) + l.valor;
    });

  // Distribuição por Rubricas de Saída
  const rubricasSaidaMap: Record<string, number> = {};
  lancamentosFiltrados
    .filter((l) => l.tipo.includes('Saída'))
    .forEach((l) => {
      rubricasSaidaMap[l.conta] = (rubricasSaidaMap[l.conta] || 0) + l.valor;
    });

  // Cálculo da Taxa de Adimplência dos Irmãos Ativos
  let irmaosAdimplentesCount = 0;
  const irmaosAtivos = irmaos.filter((ir) => ir.valorBase > 0);
  const indexMesVigente = MESES_CICLO.indexOf(mesVigente);

  irmaosAtivos.forEach((ir) => {
    let atrasado = false;
    for (let i = 0; i <= indexMesVigente; i++) {
      const m = MESES_CICLO[i];
      const devido = (ir.valoresMeses && ir.valoresMeses[m] !== undefined) ? ir.valoresMeses[m]! : ir.valorBase;
      let pago = 0;
      const nomeFmt = ir.nome.trim().toLowerCase();
      lancamentos.forEach((l) => {
        if (
          l.tipo.includes('Entrada') &&
          l.conta.toLowerCase().includes('mensalidade') &&
          l.desc.trim().toLowerCase() === nomeFmt
        ) {
          const mK = normalizarMes(l.mes);
          if (mK === m) pago += l.valor;
        }
      });
      if (devido > pago) {
        atrasado = true;
        break;
      }
    }
    if (!atrasado) irmaosAdimplentesCount++;
  });

  const taxaAdimplencia = irmaosAtivos.length > 0
    ? Math.round((irmaosAdimplentesCount / irmaosAtivos.length) * 100)
    : 100;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3 border-b pb-3">
          <div>
            <h2 className="text-base font-black text-[#081838] uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#CFA73E]" />
              Indicadores Financeiros e Gráficos Gerenciais
            </h2>
            <p className="text-xs text-slate-500">
              Métricas executivas de liquidez, arrecadação e adimplência da A∴ R∴ L∴ S∴ Acácia do Leste nº 424.
            </p>
          </div>
        </div>

        {/* Controles de Filtros Solicitados */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-slate-500" /> Período do Ciclo:
            </span>
            <select
              value={filtroPeriodo}
              onChange={(e) => setFiltroPeriodo(e.target.value as any)}
              className="border border-slate-300 rounded px-2.5 py-1 bg-white font-semibold text-slate-800 focus:outline-none focus:border-[#CFA73E]"
            >
              <option value="completo">Ciclo Completo (12 meses: Ago a Jul)</option>
              <option value="semestre1">1º Semestre (Ago a Jan)</option>
              <option value="semestre2">2º Semestre (Fev a Jul)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Filtro de Categoria:</span>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="border border-slate-300 rounded px-2.5 py-1 bg-white font-semibold text-slate-800 focus:outline-none focus:border-[#CFA73E]"
            >
              <option value="todas">Todas as Categorias</option>
              <option value="mensalidades">Apenas Mensalidades</option>
              <option value="joias">Apenas Joias e Taxas Rituais</option>
              <option value="templo">Apenas Despesas de Templo</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-xs font-bold uppercase text-slate-400">Total Arrecadado</p>
          <h3 className="text-xl font-black text-emerald-700 font-mono mt-1">{formatarMoeda(totalEntradas)}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Receitas no período filtrado</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-xs font-bold uppercase text-slate-400">Total Desembolsado</p>
          <h3 className="text-xl font-black text-rose-700 font-mono mt-1">{formatarMoeda(totalSaidas)}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Despesas no período filtrado</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-xs font-bold uppercase text-slate-400">Superávit / Déficit</p>
          <h3 className={`text-xl font-black font-mono mt-1 ${saldoLiquido >= 0 ? 'text-blue-900' : 'text-red-600'}`}>
            {formatarMoeda(saldoLiquido)}
          </h3>
          <p className="text-[11px] text-slate-500 mt-1">Saldo operacional líquido</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-xs font-bold uppercase text-slate-400">Taxa de Adimplência</p>
          <h3 className="text-xl font-black text-amber-900 font-mono mt-1">{taxaAdimplencia}%</h3>
          <p className="text-[11px] text-slate-500 mt-1">{irmaosAdimplentesCount} de {irmaosAtivos.length} Irmãos em dia</p>
        </div>
      </div>

      {/* Gráfico de Barras: Comparativo Entradas vs Saídas */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 space-y-4">
        <h3 className="text-sm font-black text-[#081838] uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#CFA73E]" />
          Comparativo Mensal: Entradas (Verde) vs Saídas (Vermelho)
        </h3>

        <div className="space-y-3 pt-2">
          {dadosMensais.map((d) => {
            const pctEntrada = Math.min(100, Math.round((d.entradas / maxValorGrafico) * 100));
            const pctSaida = Math.min(100, Math.round((d.saidas / maxValorGrafico) * 100));

            return (
              <div key={d.mes} className="space-y-1 text-xs">
                <div className="flex justify-between items-center font-medium text-slate-700">
                  <span className="font-bold w-20">{d.mes}</span>
                  <div className="flex gap-4 font-mono text-[11px]">
                    <span className="text-emerald-700">Entrada: {formatarMoeda(d.entradas)}</span>
                    <span className="text-rose-700">Saída: {formatarMoeda(d.saidas)}</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-3 flex overflow-hidden gap-0.5">
                  <div
                    style={{ width: `${pctEntrada}%` }}
                    className="bg-emerald-500 h-full rounded-l-full transition-all duration-300"
                    title={`Entrada: ${formatarMoeda(d.entradas)}`}
                  />
                  <div
                    style={{ width: `${pctSaida}%` }}
                    className="bg-rose-500 h-full rounded-r-full transition-all duration-300"
                    title={`Saída: ${formatarMoeda(d.saidas)}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Distribuição por Rubricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Entradas */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 space-y-3">
          <h3 className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-emerald-600" />
            Composição das Receitas Arrecadadas
          </h3>
          <div className="space-y-2 text-xs">
            {Object.entries(rubricasEntradaMap).map(([rubrica, valor]) => {
              const pct = totalEntradas > 0 ? Math.round((valor / totalEntradas) * 100) : 0;
              return (
                <div key={rubrica} className="space-y-1">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="font-medium truncate max-w-[200px]">{rubrica}</span>
                    <span className="font-mono font-bold text-emerald-800">
                      {formatarMoeda(valor)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="bg-emerald-600 h-full rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Saídas */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 space-y-3">
          <h3 className="text-xs font-black text-rose-800 uppercase tracking-wider flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-rose-600" />
            Composição das Despesas Pagas
          </h3>
          <div className="space-y-2 text-xs">
            {Object.entries(rubricasSaidaMap).map(([rubrica, valor]) => {
              const pct = totalSaidas > 0 ? Math.round((valor / totalSaidas) * 100) : 0;
              return (
                <div key={rubrica} className="space-y-1">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="font-medium truncate max-w-[200px]">{rubrica}</span>
                    <span className="font-mono font-bold text-rose-800">
                      {formatarMoeda(valor)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="bg-rose-600 h-full rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
