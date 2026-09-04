import React, { useState } from 'react';
import { Parcelamento, Irmao } from '../types';
import { formatarMoeda } from '../utils/helpers';
import { PlusCircle, Search, Trash2, CheckCircle2, Clock, Check, X } from 'lucide-react';

interface TabParcelamentosProps {
  parcelamentos: Parcelamento[];
  onAddParcelamento: (novo: Omit<Parcelamento, 'id'>) => void;
  onUpdateParcelamento: (id: string, updated: Partial<Parcelamento>) => void;
  onRemoveParcelamento: (id: string) => void;
  irmaos: Irmao[];
}

export const TabParcelamentos: React.FC<TabParcelamentosProps> = ({
  parcelamentos,
  onAddParcelamento,
  onUpdateParcelamento,
  onRemoveParcelamento,
  irmaos,
}) => {
  const [busca, setBusca] = useState('');
  const [filtroSituacao, setFiltroSituacao] = useState<'todas' | 'Pago' | 'Pendente de Pagamento'>('todas');
  const [modalAberto, setModalAberto] = useState(false);

  // Form states
  const [nome, setNome] = useState('');
  const [cim, setCim] = useState('');
  const [mes, setMes] = useState('agosto/26');
  const [valor, setValor] = useState('270.00');
  const [pago, setPago] = useState('0.00');
  const [periodo, setPeriodo] = useState('1/6');
  const [obs, setObs] = useState('Parcelamento joia Elevação a Mestre');
  const [situacao, setSituacao] = useState<'Pago' | 'Pendente de Pagamento'>('Pendente de Pagamento');

  const parcelamentosFiltrados = parcelamentos.filter((p) => {
    const matchBusca =
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.cim.includes(busca) ||
      p.obs.toLowerCase().includes(busca.toLowerCase());
    if (!matchBusca) return false;

    if (filtroSituacao !== 'todas' && p.situacao !== filtroSituacao) return false;

    return true;
  });

  const totalValorGeral = parcelamentosFiltrados.reduce((acc, curr) => acc + curr.valor, 0);
  const totalPagoGeral = parcelamentosFiltrados.reduce((acc, curr) => acc + (curr.pago || 0), 0);
  const totalPendenteGeral = totalValorGeral - totalPagoGeral;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vNum = parseFloat(valor.replace(',', '.'));
    const pNum = parseFloat(pago.replace(',', '.')) || 0;

    if (!vNum || isNaN(vNum) || vNum <= 0) {
      alert('Informe um valor válido.');
      return;
    }
    if (!nome.trim()) {
      alert('Informe o nome do Irmão.');
      return;
    }

    onAddParcelamento({
      nome: nome.trim(),
      cim: cim.trim() || '—',
      mes: mes.trim(),
      valor: vNum,
      pago: pNum,
      periodo: periodo.trim(),
      obs: obs.trim(),
      situacao: situacao,
    });

    setModalAberto(false);
    setNome('');
    setCim('');
    setValor('270.00');
    setPago('0.00');
  };

  const handleSelectIrmao = (irNome: string) => {
    setNome(irNome);
    const ir = irmaos.find((i) => i.nome === irNome);
    if (ir) {
      setCim(ir.cim);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Resumo dos Parcelamentos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 border-l-4 border-l-slate-700">
          <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Total Negociado</p>
          <h3 className="text-2xl font-black text-[#081838] font-mono mt-1">
            {formatarMoeda(totalValorGeral)}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Soma de todas as parcelas e acordos</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 border-l-4 border-l-emerald-600">
          <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Total Liquidado (Pago)</p>
          <h3 className="text-2xl font-black text-emerald-800 font-mono mt-1">
            {formatarMoeda(totalPagoGeral)}
          </h3>
          <p className="text-[11px] text-emerald-600 mt-1">Parcelas devidamente quitadas</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 border-l-4 border-l-amber-500">
          <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Total a Receber (Pendente)</p>
          <h3 className="text-2xl font-black text-amber-900 font-mono mt-1">
            {formatarMoeda(totalPendenteGeral)}
          </h3>
          <p className="text-[11px] text-amber-700 mt-1">Saldo em aberto a ser integralizado</p>
        </div>
      </div>

      {/* Barra de Filtros e Adicionar */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3 border-b pb-3">
          <div>
            <h2 className="text-base font-black text-[#081838] uppercase tracking-wider">
              Histórico de Parcelamentos & Negociações
            </h2>
            <p className="text-xs text-slate-500">
              Controle de joias de Iniciação, Elevação a Mestre, Passagem a Companheiro e Filiações parceladas.
            </p>
          </div>
          <button
            onClick={() => setModalAberto(true)}
            className="bg-[#CFA73E] hover:bg-[#b89432] text-[#081838] text-xs font-bold px-3.5 py-2 rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Nova Parcela / Negociação
          </button>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por Irmão, CIM ou Joia..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="border border-slate-300 rounded pl-8 pr-3 py-1.5 w-64 focus:outline-none focus:border-[#CFA73E] bg-slate-50"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
            {busca && (
              <button onClick={() => setBusca('')} className="text-slate-400 hover:text-slate-600 font-semibold">
                Limpar
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setFiltroSituacao('todas')}
              className={`px-3 py-1 rounded font-bold cursor-pointer ${
                filtroSituacao === 'todas' ? 'bg-white shadow text-[#081838]' : 'text-slate-600'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFiltroSituacao('Pago')}
              className={`px-3 py-1 rounded font-bold cursor-pointer ${
                filtroSituacao === 'Pago' ? 'bg-emerald-600 text-white shadow' : 'text-emerald-700'
              }`}
            >
              Pagas
            </button>
            <button
              onClick={() => setFiltroSituacao('Pendente de Pagamento')}
              className={`px-3 py-1 rounded font-bold cursor-pointer ${
                filtroSituacao === 'Pendente de Pagamento' ? 'bg-amber-600 text-white shadow' : 'text-amber-800'
              }`}
            >
              Pendentes
            </button>
          </div>
        </div>
      </div>

      {/* Tabela de Parcelamentos */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto custom-scroll">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#081838] text-white uppercase text-[10px]">
              <tr>
                <th className="p-3 border-r border-slate-700 min-w-[210px]">Nome do Irmão</th>
                <th className="p-3 border-r border-slate-700 text-center w-20">CIM</th>
                <th className="p-3 border-r border-slate-700 text-center w-28">Mês Previsto</th>
                <th className="p-3 border-r border-slate-700 text-center w-20">Parcela</th>
                <th className="p-3 border-r border-slate-700 min-w-[240px]">Descrição / Acordo</th>
                <th className="p-3 border-r border-slate-700 text-right w-28">Valor Total</th>
                <th className="p-3 border-r border-slate-700 text-right w-28">Valor Pago</th>
                <th className="p-3 border-r border-slate-700 text-center w-36">Situação</th>
                <th className="p-3 text-center w-24">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {parcelamentosFiltrados.map((p) => {
                const isPago = p.situacao === 'Pago';
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="p-2.5 border-r border-slate-200 font-sans font-medium text-slate-900">
                      {p.nome}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 text-center text-slate-600 font-medium">
                      {p.cim}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 text-center font-sans capitalize text-slate-700">
                      {p.mes}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 text-center font-bold text-slate-800">
                      {p.periodo}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 font-sans text-slate-700">
                      {p.obs}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 text-right font-bold text-slate-900">
                      {formatarMoeda(p.valor)}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 text-right font-bold text-emerald-700">
                      {formatarMoeda(p.pago)}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 text-center font-sans">
                      <button
                        onClick={() => {
                          const novaSit = isPago ? 'Pendente de Pagamento' : 'Pago';
                          const novoPago = isPago ? 0 : p.valor;
                          onUpdateParcelamento(p.id, { situacao: novaSit, pago: novoPago });
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                          isPago
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                        }`}
                        title="Clique para alternar entre Pago e Pendente"
                      >
                        {isPago ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Pago
                          </>
                        ) : (
                          <>
                            <Clock className="w-3.5 h-3.5 text-amber-700" /> Pendente
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => {
                          if (window.confirm(`Deseja excluir a parcela de ${p.nome}?`)) {
                            onRemoveParcelamento(p.id);
                          }
                        }}
                        title="Excluir parcela"
                        className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: NOVO PARCELAMENTO */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-[#081838] uppercase tracking-wider">
                Nova Parcela / Negociação
              </h3>
              <button
                onClick={() => setModalAberto(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Selecionar Irmão do Quadro</label>
                <select
                  onChange={(e) => handleSelectIrmao(e.target.value)}
                  className="w-full border rounded px-3 py-2 bg-slate-50 focus:outline-none focus:border-[#CFA73E]"
                >
                  <option value="">Selecione...</option>
                  {irmaos.map((ir) => (
                    <option key={ir.id} value={ir.nome}>
                      {ir.nome} (CIM: {ir.cim})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome do Irmão</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome completo"
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#CFA73E]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">CIM</label>
                  <input
                    type="text"
                    value={cim}
                    onChange={(e) => setCim(e.target.value)}
                    placeholder="Ex: 27.684"
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#CFA73E]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mês Previsto</label>
                  <input
                    type="text"
                    value={mes}
                    onChange={(e) => setMes(e.target.value)}
                    placeholder="Ex: agosto/26"
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#CFA73E]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Parcela (ex: 1/6, 3/3)</label>
                  <input
                    type="text"
                    value={periodo}
                    onChange={(e) => setPeriodo(e.target.value)}
                    placeholder="Ex: 1/6"
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#CFA73E]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descrição / Objeto do Acordo</label>
                <input
                  type="text"
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                  placeholder="Ex: Parcelamento joia Elevação a Mestre"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#CFA73E]"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valor da Parcela</label>
                  <input
                    type="text"
                    value={valor}
                    onChange={(e) => setValor(e.target.value)}
                    placeholder="270.00"
                    className="w-full border rounded px-3 py-2 font-mono font-bold focus:outline-none focus:border-[#CFA73E]"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Valor Já Pago</label>
                  <input
                    type="text"
                    value={pago}
                    onChange={(e) => setPago(e.target.value)}
                    placeholder="0.00"
                    className="w-full border rounded px-3 py-2 font-mono font-bold focus:outline-none focus:border-[#CFA73E]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Situação</label>
                  <select
                    value={situacao}
                    onChange={(e) => setSituacao(e.target.value as any)}
                    className="w-full border rounded px-3 py-2 bg-slate-50 focus:outline-none focus:border-[#CFA73E]"
                  >
                    <option value="Pendente de Pagamento">Pendente</option>
                    <option value="Pago">Pago</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 rounded text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-[#081838] text-white hover:bg-[#162C5A] font-bold shadow"
                >
                  Salvar Parcela
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
