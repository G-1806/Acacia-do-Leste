import React, { useState } from 'react';
import { Lancamento, MesCiclo, MESES_CICLO, MESES_NOMES, Irmao } from '../types';
import { formatarMoeda } from '../utils/helpers';
import { PlusCircle, Search, Trash2, ArrowDownRight, ArrowUpRight, FilterX } from 'lucide-react';

interface TabHistoricoProps {
  lancamentos: Lancamento[];
  onAddLancamento: (novo: Omit<Lancamento, 'id'>) => void;
  onRemoveLancamento: (id: string) => void;
  rubricasEntrada: string[];
  rubricasSaida: string[];
  onAddRubrica: (tipo: 'Entrada' | 'Saída', nome: string) => void;
  irmaos: Irmao[];
  mesVigente: MesCiclo;
}

export const TabHistorico: React.FC<TabHistoricoProps> = ({
  lancamentos,
  onAddLancamento,
  onRemoveLancamento,
  rubricasEntrada,
  rubricasSaida,
  onAddRubrica,
  irmaos,
  mesVigente,
}) => {
  // Filtros
  // Mês inicial padrão conforme solicitado: mês vigente (e.g. agosto/26)
  const [filtroMes, setFiltroMes] = useState<string>('agosto/26');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroConta, setFiltroConta] = useState<string>('todas');
  const [filtroBusca, setFiltroBusca] = useState<string>('');

  // Modal Novo Lançamento
  const [modalAberto, setModalAberto] = useState(false);
  const [novoMes, setNovoMes] = useState<string>('agosto/26');
  const [novoTipo, setNovoTipo] = useState<'Entrada | Receita' | 'Saída | Despesa'>('Entrada | Receita');
  const [novaConta, setNovaConta] = useState<string>('Mensalidades');
  const [novaDesc, setNovaDesc] = useState<string>('');
  const [novoValor, setNovoValor] = useState<string>('220.00');

  const abrirModalNovoLancamento = () => {
    const mesPadrao = MESES_NOMES[mesVigente].toLowerCase();
    setNovoMes(mesPadrao);
    setNovoTipo('Entrada | Receita');
    setNovaConta('Mensalidades');
    setNovaDesc('');
    setNovoValor('220.00');
    setModalAberto(true);
  };

  // Adicionar nova rubrica
  const [modalRubricaAberto, setModalRubricaAberto] = useState(false);
  const [tipoNovaRubrica, setTipoNovaRubrica] = useState<'Entrada' | 'Saída'>('Entrada');
  const [nomeNovaRubrica, setNomeNovaRubrica] = useState('');

  // Aplicar filtros
  const lancamentosFiltrados = lancamentos.filter((l) => {
    // Filtro de mês
    if (filtroMes !== 'todos') {
      const lMes = l.mes.toLowerCase();
      const fMes = filtroMes.toLowerCase();
      if (!lMes.includes(fMes.replace('/26', '').replace('/27', ''))) {
        return false;
      }
    }

    // Filtro de tipo
    if (filtroTipo !== 'todos') {
      if (filtroTipo === 'entrada' && !l.tipo.includes('Entrada')) return false;
      if (filtroTipo === 'saida' && !l.tipo.includes('Saída')) return false;
    }

    // Filtro de rubrica/conta
    if (filtroConta !== 'todas' && l.conta !== filtroConta) {
      return false;
    }

    // Busca por descrição / irmão
    if (filtroBusca) {
      const term = filtroBusca.toLowerCase();
      const matchDesc = l.desc.toLowerCase().includes(term);
      const matchConta = l.conta.toLowerCase().includes(term);
      if (!matchDesc && !matchConta) return false;
    }

    return true;
  });

  const totalEntradasFiltrado = lancamentosFiltrados
    .filter((l) => l.tipo.includes('Entrada'))
    .reduce((acc, curr) => acc + curr.valor, 0);

  const totalSaidasFiltrado = lancamentosFiltrados
    .filter((l) => l.tipo.includes('Saída'))
    .reduce((acc, curr) => acc + curr.valor, 0);

  const handleSalvarLancamento = (e: React.FormEvent) => {
    e.preventDefault();
    const valNum = parseFloat(novoValor.replace(',', '.'));
    if (!valNum || isNaN(valNum) || valNum <= 0) {
      alert('Por favor, informe um valor válido maior que zero.');
      return;
    }
    if (!novaDesc.trim()) {
      alert('Por favor, informe uma descrição ou selecione um Irmão.');
      return;
    }

    onAddLancamento({
      mes: novoMes,
      tipo: novoTipo,
      conta: novaConta,
      desc: novaDesc.trim(),
      valor: valNum,
    });

    setModalAberto(false);
    setNovaDesc('');
    setNovoValor('220.00');
  };

  const handleSalvarRubrica = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeNovaRubrica.trim()) return;
    onAddRubrica(tipoNovaRubrica, nomeNovaRubrica.trim());
    if (tipoNovaRubrica === 'Entrada') {
      setNovaConta(nomeNovaRubrica.trim());
    } else {
      setNovaConta(nomeNovaRubrica.trim());
    }
    setNomeNovaRubrica('');
    setModalRubricaAberto(false);
  };

  // Coleta lista unificada de contas existentes para o filtro
  const todasContas = Array.from(new Set(lancamentos.map((l) => l.conta))).sort();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Barra de Ações e Filtros Avançados */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base font-black text-[#081838] uppercase tracking-wider">
              Livro Caixa / Histórico de Lançamentos
            </h2>
            <p className="text-xs text-slate-500">
              Registros contábeis que alimentam em tempo real as Mensalidades Realizadas e o Demonstrativo de Entradas e Saídas.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setModalRubricaAberto(true)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3 py-2 rounded-lg transition border border-slate-300 cursor-pointer"
            >
              + Nova Rubrica
            </button>
            <button
              onClick={abrirModalNovoLancamento}
              className="bg-[#CFA73E] hover:bg-[#b89432] text-[#081838] text-xs font-bold px-3.5 py-2 rounded-lg shadow transition flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" /> Novo Lançamento
            </button>
          </div>
        </div>

        {/* Linha de Filtros Solicitada */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 text-xs">
          {/* 1. Filtro Mês */}
          <div>
            <label className="block text-slate-600 font-bold mb-1 uppercase text-[10px]">
              Mês (Padrão: Mês Vigente)
            </label>
            <select
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white font-medium focus:outline-none focus:border-[#CFA73E]"
            >
              <option value="todos">Todos os Meses</option>
              <option value="agosto/26">Agosto/2026</option>
              <option value="setembro/26">Setembro/2026</option>
              <option value="outubro/26">Outubro/2026</option>
              <option value="novembro/26">Novembro/2026</option>
              <option value="dezembro/26">Dezembro/2026</option>
              <option value="janeiro/27">Janeiro/2027</option>
              <option value="fevereiro/27">Fevereiro/2027</option>
              <option value="março/27">Março/2027</option>
              <option value="abril/27">Abril/2027</option>
              <option value="maio/27">Maio/2027</option>
              <option value="junho/27">Junho/2027</option>
              <option value="julho/27">Julho/2027</option>
            </select>
          </div>

          {/* 2. Filtro Tipo */}
          <div>
            <label className="block text-slate-600 font-bold mb-1 uppercase text-[10px]">Tipo</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white font-medium focus:outline-none focus:border-[#CFA73E]"
            >
              <option value="todos">Todos (Entradas e Saídas)</option>
              <option value="entrada">Apenas Entradas</option>
              <option value="saida">Apenas Saídas</option>
            </select>
          </div>

          {/* 3. Filtro Rubrica */}
          <div>
            <label className="block text-slate-600 font-bold mb-1 uppercase text-[10px]">Rubrica / Conta</label>
            <select
              value={filtroConta}
              onChange={(e) => setFiltroConta(e.target.value)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 bg-white font-medium focus:outline-none focus:border-[#CFA73E]"
            >
              <option value="todas">Todas as Rubricas</option>
              {todasContas.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Filtro Descrição / Irmão */}
          <div>
            <label className="block text-slate-600 font-bold mb-1 uppercase text-[10px]">
              Buscar Descrição / Irmão
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: Anderson, Aluguel..."
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                className="w-full border border-slate-300 rounded pl-8 pr-2.5 py-1.5 bg-white focus:outline-none focus:border-[#CFA73E]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>

        {/* Resumo do Filtro Ativo */}
        <div className="flex flex-wrap justify-between items-center gap-3 text-xs pt-1">
          <div className="flex items-center gap-4">
            <span className="text-slate-600">
              Registros exibidos: <strong className="text-slate-900">{lancamentosFiltrados.length}</strong>
            </span>
            <span className="text-emerald-700 font-semibold">
              Entradas no filtro: <strong className="font-mono">{formatarMoeda(totalEntradasFiltrado)}</strong>
            </span>
            <span className="text-rose-700 font-semibold">
              Saídas no filtro: <strong className="font-mono">{formatarMoeda(totalSaidasFiltrado)}</strong>
            </span>
          </div>

          {(filtroMes !== 'todos' || filtroTipo !== 'todos' || filtroConta !== 'todas' || filtroBusca) && (
            <button
              onClick={() => {
                setFiltroMes('todos');
                setFiltroTipo('todos');
                setFiltroConta('todas');
                setFiltroBusca('');
              }}
              className="text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <FilterX className="w-3.5 h-3.5" /> Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Tabela de Lançamentos */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto custom-scroll">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-[#081838] text-white uppercase text-[10px]">
              <tr>
                <th className="p-3 border-r border-slate-700 text-center w-12">#</th>
                <th className="p-3 border-r border-slate-700 w-28">Mês</th>
                <th className="p-3 border-r border-slate-700 w-32">Tipo</th>
                <th className="p-3 border-r border-slate-700 min-w-[200px]">Rubrica / Conta</th>
                <th className="p-3 border-r border-slate-700 min-w-[250px]">Descrição / Beneficiário</th>
                <th className="p-3 border-r border-slate-700 text-right w-32 font-bold">Valor (R$)</th>
                <th className="p-3 text-center w-20">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {lancamentosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Nenhum lançamento encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                lancamentosFiltrados.map((l, idx) => {
                  const isEntrada = l.tipo.includes('Entrada');
                  return (
                    <tr key={l.id} className="hover:bg-slate-50 transition">
                      <td className="p-2.5 text-center text-slate-400 font-mono text-[11px] border-r border-slate-200">
                        {idx + 1}
                      </td>
                      <td className="p-2.5 border-r border-slate-200 font-medium capitalize text-slate-700">
                        {l.mes}
                      </td>
                      <td className="p-2.5 border-r border-slate-200">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            isEntrada ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isEntrada ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {isEntrada ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className="p-2.5 border-r border-slate-200 font-semibold text-slate-800">
                        {l.conta}
                      </td>
                      <td className="p-2.5 border-r border-slate-200 text-slate-700 font-medium">
                        {l.desc}
                      </td>
                      <td
                        className={`p-2.5 border-r border-slate-200 text-right font-mono font-bold ${
                          isEntrada ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {formatarMoeda(l.valor)}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => {
                            if (window.confirm(`Deseja estornar o lançamento de ${formatarMoeda(l.valor)} (${l.desc})?`)) {
                              onRemoveLancamento(l.id);
                            }
                          }}
                          title="Estornar lançamento"
                          className="text-slate-400 hover:text-red-600 p-1 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: NOVO LANÇAMENTO */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-base font-bold text-[#081838] uppercase tracking-wider">
                Novo Lançamento no Livro Caixa
              </h3>
              <button
                onClick={() => setModalAberto(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSalvarLancamento} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mês de Referência</label>
                  <select
                    value={novoMes}
                    onChange={(e) => setNovoMes(e.target.value)}
                    className="w-full border rounded px-3 py-2 bg-slate-50 focus:outline-none focus:border-[#CFA73E] font-medium capitalize text-slate-800"
                    required
                  >
                    <option value="agosto/26">Agosto/2026 (ago/26)</option>
                    <option value="setembro/26">Setembro/2026 (set/26)</option>
                    <option value="outubro/26">Outubro/2026 (out/26)</option>
                    <option value="novembro/26">Novembro/2026 (nov/26)</option>
                    <option value="dezembro/26">Dezembro/2026 (dez/26)</option>
                    <option value="janeiro/27">Janeiro/2027 (jan/27)</option>
                    <option value="fevereiro/27">Fevereiro/2027 (fev/27)</option>
                    <option value="março/27">Março/2027 (mar/27)</option>
                    <option value="abril/27">Abril/2027 (abr/27)</option>
                    <option value="maio/27">Maio/2027 (mai/27)</option>
                    <option value="junho/27">Junho/2027 (jun/27)</option>
                    <option value="julho/27">Julho/2027 (jul/27)</option>
                    <option value="julho/26">Julho/2026 (jul/26 - Anterior)</option>
                    <option value="junho/26">Junho/2026 (jun/26 - Anterior)</option>
                    <option value="maio/26">Maio/2026 (mai/26 - Anterior)</option>
                    <option value="abril/26">Abril/2026 (abr/26 - Anterior)</option>
                    <option value="março/26">Março/2026 (mar/26 - Anterior)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Movimentação</label>
                  <select
                    value={novoTipo}
                    onChange={(e) => {
                      const t = e.target.value as 'Entrada | Receita' | 'Saída | Despesa';
                      setNovoTipo(t);
                      setNovaConta(t.includes('Entrada') ? rubricasEntrada[0] || 'Mensalidades' : rubricasSaida[0] || 'Aluguel Templo');
                      if (t.includes('Saída')) {
                        // Ao selecionar saída | despesa o box Valor (R$) não deverá ter referência de valor
                        setNovoValor('');
                      } else {
                        if (!novoValor || novoValor === '0' || novoValor === '0.00') {
                          setNovoValor('220.00');
                        }
                      }
                    }}
                    className="w-full border rounded px-3 py-2 bg-slate-50 focus:outline-none focus:border-[#CFA73E]"
                  >
                    <option value="Entrada | Receita">Entrada | Receita</option>
                    <option value="Saída | Despesa">Saída | Despesa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Rubrica / Conta</label>
                <select
                  value={novaConta}
                  onChange={(e) => setNovaConta(e.target.value)}
                  className="w-full border rounded px-3 py-2 bg-slate-50 focus:outline-none focus:border-[#CFA73E]"
                >
                  {(novoTipo.includes('Entrada') ? rubricasEntrada : rubricasSaida).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {novoTipo.includes('Entrada') && novaConta.toLowerCase().includes('mensalidade') ? (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Irmão Pagante (selecione ou digite)
                  </label>
                  <div className="space-y-1.5">
                    <select
                      onChange={(e) => {
                        if (e.target.value) setNovaDesc(e.target.value);
                      }}
                      className="w-full border rounded px-3 py-2 bg-slate-50 focus:outline-none focus:border-[#CFA73E]"
                    >
                      <option value="">Selecione um Irmão do quadro...</option>
                      {irmaos.map((ir) => (
                        <option key={ir.id} value={ir.nome}>
                          {ir.nome} (CIM: {ir.cim})
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Ou digite o nome completo do Irmão"
                      value={novaDesc}
                      onChange={(e) => setNovaDesc(e.target.value)}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#CFA73E]"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Descrição / Beneficiário</label>
                  <input
                    type="text"
                    placeholder="Ex: Pagamento referente a..."
                    value={novaDesc}
                    onChange={(e) => setNovaDesc(e.target.value)}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:border-[#CFA73E]"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Valor (R$) {novoTipo.includes('Saída') ? '' : ''}
                </label>
                <input
                  type="text"
                  value={novoValor}
                  onChange={(e) => setNovoValor(e.target.value)}
                  placeholder={novoTipo.includes('Saída') ? '0,00' : '220.00'}
                  className="w-full border rounded px-3 py-2 font-mono text-sm font-bold text-[#081838] focus:outline-none focus:border-[#CFA73E]"
                  required
                />
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
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVA RUBRICA */}
      {modalRubricaAberto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 space-y-4 animate-scaleUp">
            <h3 className="text-sm font-black text-[#081838] uppercase">Adicionar Nova Rubrica</h3>
            <form onSubmit={handleSalvarRubrica} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tipo da Rubrica</label>
                <select
                  value={tipoNovaRubrica}
                  onChange={(e) => setTipoNovaRubrica(e.target.value as 'Entrada' | 'Saída')}
                  className="w-full border rounded px-3 py-2 bg-slate-50"
                >
                  <option value="Entrada">Entrada (Receita)</option>
                  <option value="Saída">Saída (Despesa)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nome da Nova Rubrica</label>
                <input
                  type="text"
                  placeholder="Ex: Doação Especial Banquete"
                  value={nomeNovaRubrica}
                  onChange={(e) => setNomeNovaRubrica(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setModalRubricaAberto(false)}
                  className="px-3 py-1.5 rounded text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-[#081838] text-white font-bold"
                >
                  Salvar Rubrica
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
