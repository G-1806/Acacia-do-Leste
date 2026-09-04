import React, { useState } from 'react';
import { Lancamento, Irmao, Parcelamento, MesCiclo, MESES_CICLO, MESES_NOMES } from '../types';
import { formatarMoeda } from '../utils/helpers';
import { LodgeLogo } from './LodgeLogo';
import {
  TrendingUp,
  Wallet,
  Clock,
  PiggyBank,
  Search,
  CheckCircle,
  AlertTriangle,
  Filter,
} from 'lucide-react';

interface TabFluxoCaixaProps {
  lancamentos: Lancamento[];
  irmaos: Irmao[];
  parcelamentos: Parcelamento[];
  saldoInicialCC: number;
  onUpdateSaldoInicial: (novoSaldo: number) => void;
  mesVigente: MesCiclo;
}

export const TabFluxoCaixa: React.FC<TabFluxoCaixaProps> = ({
  lancamentos,
  irmaos,
  parcelamentos,
  saldoInicialCC,
  onUpdateSaldoInicial,
  mesVigente,
}) => {
  const [buscaAtrasados, setBuscaAtrasados] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'atrasados' | 'vencer' | 'todos'>('todos');
  const [filtroIrmao, setFiltroIrmao] = useState<string>('todos');
  const [filtroMesSelect, setFiltroMesSelect] = useState<string>('todos');

  // Helper para normalizar o mês do lançamento
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

  // Cálculo de entradas e saídas por mês do ciclo
  const entradasMes: Record<MesCiclo, number> = {
    'ago/26': 0, 'set/26': 0, 'out/26': 0, 'nov/26': 0, 'dez/26': 0,
    'jan/27': 0, 'fev/27': 0, 'mar/27': 0, 'abr/27': 0, 'mai/27': 0,
    'jun/27': 0, 'jul/27': 0,
  };
  const saidasMes: Record<MesCiclo, number> = {
    'ago/26': 0, 'set/26': 0, 'out/26': 0, 'nov/26': 0, 'dez/26': 0,
    'jan/27': 0, 'fev/27': 0, 'mar/27': 0, 'abr/27': 0, 'mai/27': 0,
    'jun/27': 0, 'jul/27': 0,
  };

  lancamentos.forEach((l) => {
    const mK = normalizarMes(l.mes);
    if (mK) {
      if (l.tipo.includes('Entrada')) {
        entradasMes[mK] += l.valor;
      } else {
        saidasMes[mK] += l.valor;
      }
    }
  });

  // Saldo acumulado na C/C mês a mês
  let saldoCorrente = saldoInicialCC;
  const saldosAcumulados: Record<MesCiclo, number> = {} as any;
  MESES_CICLO.forEach((m) => {
    saldoCorrente += entradasMes[m] - saidasMes[m];
    saldosAcumulados[m] = saldoCorrente;
  });

  // Saldo atual real na conta corrente até o mês vigente
  let saldoAteVigente = saldoInicialCC;
  for (const m of MESES_CICLO) {
    saldoAteVigente += entradasMes[m] - saidasMes[m];
    if (m === mesVigente) break;
  }

  // Cálculo de Mensalidades Projetadas vs Realizadas
  const getValorProjetado = (ir: Irmao, mes: MesCiclo): number => {
    if (ir.valoresMeses && ir.valoresMeses[mes] !== undefined) return ir.valoresMeses[mes]!;
    return ir.valorBase || 0;
  };

  const getPagamentoReal = (nomeIrmao: string, mes: MesCiclo): number => {
    let total = 0;
    const nomeFmt = nomeIrmao.trim().toLowerCase();
    lancamentos.forEach((l) => {
      if (
        l.tipo.includes('Entrada') &&
        l.conta.toLowerCase().includes('mensalidade') &&
        l.desc.trim().toLowerCase() === nomeFmt
      ) {
        const mK = normalizarMes(l.mes);
        if (mK === mes) {
          total += l.valor;
        }
      }
    });
    return total;
  };

  // Identificação de Mensalidades Atrasadas e A Vencer
  interface ItemMensalidadeStatus {
    id: string;
    nome: string;
    cim: string;
    mes: MesCiclo;
    mesNome: string;
    valorDevido: number;
    valorPago: number;
    diferenca: number;
    status: 'Atrasado' | 'A Vencer' | 'Quitado';
  }

  const indexMesVigente = MESES_CICLO.indexOf(mesVigente);
  const listaStatusMensalidades: ItemMensalidadeStatus[] = [];

  let totalPrevistoReceberMensalidades = 0;
  let totalAtrasadoPassado = 0;
  let totalAVencerFuturo = 0;

  irmaos.forEach((ir) => {
    if (ir.valorBase <= 0) return; // Irmão isento / não pagante

    MESES_CICLO.forEach((m, idx) => {
      const devido = getValorProjetado(ir, m);
      if (devido <= 0) return;

      const pago = getPagamentoReal(ir.nome, m);
      const diff = devido - pago;

      let status: 'Atrasado' | 'A Vencer' | 'Quitado';
      if (diff <= 0) {
        status = 'Quitado';
      } else {
        if (idx <= indexMesVigente) {
          status = 'Atrasado';
          totalAtrasadoPassado += diff;
          totalPrevistoReceberMensalidades += diff;
        } else {
          status = 'A Vencer';
          totalAVencerFuturo += diff;
          totalPrevistoReceberMensalidades += diff;
        }
      }

      if (status !== 'Quitado') {
        listaStatusMensalidades.push({
          id: `${ir.id}-${m}`,
          nome: ir.nome,
          cim: ir.cim,
          mes: m,
          mesNome: MESES_NOMES[m],
          valorDevido: devido,
          valorPago: pago,
          diferenca: diff,
          status,
        });
      }
    });
  });

  // Parcelamentos pendentes a receber
  const totalParcelamentosPendentes = parcelamentos
    .filter((p) => p.situacao === 'Pendente de Pagamento')
    .reduce((acc, curr) => acc + (curr.valor - (curr.pago || 0)), 0);

  // Total consolidado de "Valores Previstos a Receber"
  const totalGeralPrevistoReceber = totalPrevistoReceberMensalidades + totalParcelamentosPendentes;
  const patrimonioTotalPrevisto = saldoAteVigente + totalGeralPrevistoReceber;

  // Filtragem da tabela contínua de atrasados/a vencer
  const listaFiltrada = listaStatusMensalidades.filter((item) => {
    // Filtro por seleção de Irmão
    if (filtroIrmao !== 'todos') {
      if (item.nome.trim().toLowerCase() !== filtroIrmao.trim().toLowerCase()) {
        return false;
      }
    }

    // Filtro por Mês via dropdown
    if (filtroMesSelect !== 'todos') {
      if (item.mes !== filtroMesSelect) {
        return false;
      }
    }

    // Filtro de Status / Período rápido
    if (filtroStatus === 'atrasados') {
      if (item.status !== 'Atrasado') return false;
    } else if (filtroStatus === 'vencer') {
      if (item.status !== 'A Vencer') return false;
    }

    // Busca textual
    if (buscaAtrasados) {
      const matchBusca =
        item.nome.toLowerCase().includes(buscaAtrasados.toLowerCase()) ||
        item.cim.includes(buscaAtrasados) ||
        item.mesNome.toLowerCase().includes(buscaAtrasados.toLowerCase());
      if (!matchBusca) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ======================================================== */}
      {/* TIMBRE OFICIAL DA LOJA E CABEÇALHO DE FLUXO DE CAIXA    */}
      {/* ======================================================== */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center space-x-4">
          <LodgeLogo size={58} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#CFA73E] bg-[#081838] px-2 py-0.5 rounded">
                GOP - Grande Oriente Paulista • COMAB
              </span>
              <span className="text-[11px] text-slate-500 font-semibold">Rito de York • Or.'. de São Paulo</span>
            </div>
            <h2 className="text-base md:text-lg font-black text-[#081838] uppercase tracking-wider mt-0.5">
              A∴ R∴ L∴ S∴ ACÁCIA DO LESTE Nº 424 — FLUXO DE CAIXA
            </h2>
            <p className="text-xs text-slate-500">
              Controle de Conta Corrente, Conciliação Financeira e Valores Previstos a Receber
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg">
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-slate-400">Mês de Referência Vigente</p>
            <p className="text-xs font-black text-[#081838]">{MESES_NOMES[mesVigente]}</p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* CARDS DESTACADOS DE FLUXO E VALORES PREVISTOS A RECEBER */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Saldo Disponível C/C */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 border-l-4 border-l-blue-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Disponível C/C (Mês Vigente)
              </p>
              <h3 className="text-2xl font-black text-[#081838] font-mono mt-1">
                {formatarMoeda(saldoAteVigente)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 border-t pt-2">
            <span>Saldo Inicial C/C:</span>
            <input
              type="number"
              value={saldoInicialCC}
              onChange={(e) => onUpdateSaldoInicial(parseFloat(e.target.value) || 0)}
              className="w-24 text-right font-mono font-bold text-slate-700 border border-slate-300 rounded px-1.5 py-0.5 bg-slate-50"
            />
          </div>
        </div>

        {/* Card 2: Destaque Solicitado - "Valores Previstos a Receber" */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/60 rounded-xl shadow-sm border-2 border-amber-400 p-4 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <span className="bg-amber-400 text-amber-950 font-black text-[9px] uppercase px-2 py-0.5 rounded tracking-widest">
                Destaque Tesouraria
              </span>
              <p className="text-xs font-bold uppercase text-amber-900 tracking-wider mt-1">
                Valores Previstos a Receber
              </p>
              <h3 className="text-2xl font-black text-amber-900 font-mono mt-0.5">
                {formatarMoeda(totalGeralPrevistoReceber)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-300 text-amber-950 flex items-center justify-center shadow-xs">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2 text-[11px] text-amber-900/80 space-y-0.5 font-medium border-t border-amber-200 pt-1.5">
            <div className="flex justify-between">
              <span>Mensalidades em Atraso (passadas):</span>
              <span className="font-mono font-bold text-red-700">{formatarMoeda(totalAtrasadoPassado)}</span>
            </div>
            <div className="flex justify-between">
              <span>Mensalidades a Vencer (futuras):</span>
              <span className="font-mono font-bold text-slate-700">{formatarMoeda(totalAVencerFuturo)}</span>
            </div>
            <div className="flex justify-between">
              <span>Parcelamentos e Acordos Pendentes:</span>
              <span className="font-mono font-bold text-slate-700">{formatarMoeda(totalParcelamentosPendentes)}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Patrimônio Financeiro Previsto */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 border-l-4 border-l-emerald-600">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Patrimônio Total Previsto
              </p>
              <h3 className="text-2xl font-black text-emerald-800 font-mono mt-1">
                {formatarMoeda(patrimonioTotalPrevisto)}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[11px] text-slate-500 mt-3 border-t pt-2">
            Soma do disponível atual em conta corrente + total de créditos e mensalidades previstos.
          </p>
        </div>
      </div>

      {/* ======================================================== */}
      {/* TABELA DE FLUXO DE CAIXA MÊS A MÊS                       */}
      {/* ======================================================== */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <div>
            <h2 className="text-base font-black text-[#081838] uppercase tracking-wider">
              Fluxo Financeiro e Saldo Acumulado C/C
            </h2>
            <p className="text-xs text-slate-500">
              Evolução mês a mês das receitas, despesas e saldo final de conta corrente.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto custom-scroll border rounded-lg">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#081838] text-white uppercase text-[10px]">
              <tr>
                <th className="p-2.5 border-r border-slate-700 min-w-[150px]">Indicador</th>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              <tr>
                <td className="p-2.5 border-r border-slate-200 font-sans font-bold text-emerald-800 bg-emerald-50/40">
                  (+) Total Entradas
                </td>
                {MESES_CICLO.map((m) => (
                  <td key={m} className="p-2 text-center text-emerald-700 border-r border-slate-200">
                    {entradasMes[m] > 0 ? formatarMoeda(entradasMes[m]) : '—'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-2.5 border-r border-slate-200 font-sans font-bold text-rose-800 bg-rose-50/40">
                  (-) Total Saídas
                </td>
                {MESES_CICLO.map((m) => (
                  <td key={m} className="p-2 text-center text-rose-700 border-r border-slate-200">
                    {saidasMes[m] > 0 ? formatarMoeda(saidasMes[m]) : '—'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-2.5 border-r border-slate-200 font-sans font-bold text-slate-800 bg-slate-100">
                  (=) Saldo Operacional
                </td>
                {MESES_CICLO.map((m) => {
                  const sOp = entradasMes[m] - saidasMes[m];
                  return (
                    <td
                      key={m}
                      className={`p-2 text-center font-bold border-r border-slate-200 ${
                        sOp > 0 ? 'text-emerald-700' : sOp < 0 ? 'text-rose-700' : 'text-slate-400'
                      }`}
                    >
                      {formatarMoeda(sOp)}
                    </td>
                  );
                })}
              </tr>
              <tr className="bg-slate-900 text-white font-bold">
                <td className="p-2.5 border-r border-slate-700 font-sans uppercase text-[#CFA73E]">
                  Saldo Acumulado C/C
                </td>
                {MESES_CICLO.map((m) => (
                  <td
                    key={m}
                    className={`p-2 text-center border-r border-slate-700 ${
                      m === mesVigente ? 'text-amber-300 font-black' : 'text-white'
                    }`}
                  >
                    {formatarMoeda(saldosAcumulados[m])}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* QUADRO: MENSALIDADES ATRASADAS / A VENCER (CONTÍNUA)    */}
      {/* ======================================================== */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-4 border-b pb-4">
          <div className="flex items-center space-x-3.5">
            <LodgeLogo size={48} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-[#CFA73E] bg-[#081838] px-2 py-0.5 rounded">
                  A∴ R∴ L∴ S∴ Acácia do Leste nº 424
                </span>
              </div>
              <h2 className="text-base font-black text-[#081838] uppercase tracking-wider flex items-center gap-2 mt-0.5">
                <Clock className="w-5 h-5 text-amber-600" />
                Quadro de Mensalidades Atrasadas e A Vencer
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <p className="text-xs text-slate-500">
                  Acompanhamento contínuo dos pagamentos em aberto mês a mês com filtros específicos.
                </p>
                <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs">
                  <Clock className="w-3 h-3 text-amber-700" />
                  Mês em Referência Destacado:{' '}
                  <strong className="text-[#081838] underline decoration-amber-400 font-extrabold">
                    {filtroMesSelect !== 'todos'
                      ? MESES_NOMES[filtroMesSelect as MesCiclo]
                      : filtroStatus === 'atrasados'
                      ? 'Meses Anteriores (Atrasados)'
                      : filtroStatus === 'vencer'
                      ? 'Meses Futuros (A Vencer)'
                      : 'Todos os Meses do Ciclo'}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Filtros da Tabela */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Botões Rápidos */}
            <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => {
                  setFiltroStatus('atrasados');
                  setFiltroMesSelect('todos');
                }}
                className={`px-3 py-1.5 rounded font-bold transition cursor-pointer ${
                  filtroStatus === 'atrasados' && filtroMesSelect === 'todos'
                    ? 'bg-red-700 text-white shadow'
                    : 'text-red-700 hover:bg-red-50'
                }`}
              >
                Apenas Atrasados
              </button>
              <button
                onClick={() => {
                  setFiltroStatus('vencer');
                  setFiltroMesSelect('todos');
                }}
                className={`px-3 py-1.5 rounded font-bold transition cursor-pointer ${
                  filtroStatus === 'vencer' && filtroMesSelect === 'todos'
                    ? 'bg-blue-700 text-white shadow'
                    : 'text-blue-700 hover:bg-blue-50'
                }`}
              >
                Apenas A Vencer
              </button>
              <button
                onClick={() => {
                  setFiltroStatus('todos');
                }}
                className={`px-2.5 py-1.5 rounded font-semibold transition cursor-pointer ${
                  filtroStatus === 'todos'
                    ? 'bg-white text-slate-900 shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Todos os Meses
              </button>
            </div>

            {/* Filtro Seleção do Irmão */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
              <label className="font-bold text-slate-700 uppercase text-[10px]">Irmão:</label>
              <select
                value={filtroIrmao}
                onChange={(e) => setFiltroIrmao(e.target.value)}
                className="border border-slate-300 rounded px-2 py-0.5 text-xs bg-white text-slate-800 font-semibold focus:outline-none focus:border-[#CFA73E] max-w-[200px]"
              >
                <option value="todos">Todos os Irmãos</option>
                {irmaos
                  .filter((ir) => ir.valorBase > 0)
                  .map((ir) => (
                    <option key={ir.id} value={ir.nome}>
                      {ir.nome} (CIM: {ir.cim})
                    </option>
                  ))}
              </select>
            </div>

            {/* Filtro Seleção do Mês */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
              <label className="font-bold text-slate-700 uppercase text-[10px]">Mês:</label>
              <select
                value={filtroMesSelect}
                onChange={(e) => {
                  setFiltroMesSelect(e.target.value);
                  if (e.target.value !== 'todos') {
                    setFiltroStatus('todos');
                  }
                }}
                className="border border-slate-300 rounded px-2 py-0.5 text-xs bg-white text-slate-800 font-semibold focus:outline-none focus:border-[#CFA73E]"
              >
                <option value="todos">Todos os Meses</option>
                {MESES_CICLO.map((m) => (
                  <option key={m} value={m}>
                    {MESES_NOMES[m]}
                  </option>
                ))}
              </select>
            </div>

            {/* Busca Textual */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nome/CIM..."
                value={buscaAtrasados}
                onChange={(e) => setBuscaAtrasados(e.target.value)}
                className="border border-slate-300 rounded pl-7 pr-2.5 py-1 text-xs w-44 focus:outline-none focus:border-[#CFA73E]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1.5" />
            </div>
          </div>
        </div>

        {/* Barra de resumo dos itens filtrados */}
        <div className="flex flex-wrap justify-between items-center text-xs bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
          <div className="flex items-center gap-3">
            <span className="text-slate-600">
              Registros exibidos: <strong className="text-slate-900">{listaFiltrada.length}</strong>
            </span>
            <span className="text-red-700 font-semibold">
              Total devido no filtro:{' '}
              <strong className="font-mono">
                {formatarMoeda(listaFiltrada.reduce((acc, curr) => acc + curr.diferenca, 0))}
              </strong>
            </span>
          </div>
          {(filtroIrmao !== 'todos' || filtroMesSelect !== 'todos' || filtroStatus !== 'todos' || buscaAtrasados) && (
            <button
              onClick={() => {
                setFiltroStatus('todos');
                setFiltroIrmao('todos');
                setFiltroMesSelect('todos');
                setBuscaAtrasados('');
              }}
              className="text-slate-500 hover:text-slate-800 text-[11px] font-bold underline cursor-pointer"
            >
              Limpar Filtros
            </button>
          )}
        </div>

        {/* Tabela Contínua */}
        <div className="overflow-x-auto custom-scroll border rounded-lg max-h-96">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#081838] text-white uppercase text-[10px] sticky top-0">
              <tr>
                <th className="p-2.5 border-r border-slate-700 min-w-[200px]">Nome do Irmão</th>
                <th className="p-2 border-r border-slate-700 text-center w-20">CIM</th>
                <th className="p-2 border-r border-slate-700 text-center w-28">Mês Referência</th>
                <th className="p-2 border-r border-slate-700 text-right w-28">Valor Devido</th>
                <th className="p-2 border-r border-slate-700 text-right w-28">Valor Pago</th>
                <th className="p-2 border-r border-slate-700 text-right w-28 font-bold">Saldo Devedor</th>
                <th className="p-2 text-center w-28">Situação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {listaFiltrada.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400 font-sans">
                    Nenhum registro de mensalidade pendente encontrado com os filtros atuais.
                  </td>
                </tr>
              ) : (
                listaFiltrada.map((item) => {
                  const mesDestaqueTabela =
                    filtroMesSelect !== 'todos'
                      ? filtroMesSelect
                      : null;
                  const isMesDestaque = item.mes === mesDestaqueTabela;

                  return (
                    <tr
                      key={item.id}
                      className={
                        isMesDestaque
                          ? 'bg-amber-50/60 hover:bg-amber-100/60 transition'
                          : 'hover:bg-slate-50 transition'
                      }
                    >
                      <td className="p-2 border-r border-slate-200 font-sans font-medium text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#081838] font-serif">Ir∴</span>
                          <span>{item.nome}</span>
                        </div>
                      </td>
                      <td className="p-2 border-r border-slate-200 text-center text-slate-600">
                        {item.cim}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-center font-sans font-semibold">
                        {isMesDestaque ? (
                          <span className="inline-block bg-[#081838] text-[#CFA73E] px-2.5 py-0.5 rounded font-black shadow-xs ring-1 ring-[#CFA73E]/60 text-[11px]">
                            {item.mesNome}
                          </span>
                        ) : (
                          <span className="text-slate-700">{item.mesNome}</span>
                        )}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-right text-slate-700">
                        {formatarMoeda(item.valorDevido)}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-right text-emerald-700">
                        {formatarMoeda(item.valorPago)}
                      </td>
                      <td className="p-2 border-r border-slate-200 text-right font-bold text-red-700">
                        {formatarMoeda(item.diferenca)}
                      </td>
                      <td className="p-2 text-center font-sans">
                        {item.status === 'Atrasado' ? (
                          <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            <AlertTriangle className="w-3 h-3 text-red-600" /> Atrasado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">
                            <Clock className="w-3 h-3 text-blue-600" /> A Vencer
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
