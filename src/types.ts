export type MesCiclo =
  | 'ago/26'
  | 'set/26'
  | 'out/26'
  | 'nov/26'
  | 'dez/26'
  | 'jan/27'
  | 'fev/27'
  | 'mar/27'
  | 'abr/27'
  | 'mai/27'
  | 'jun/27'
  | 'jul/27';

export const MESES_CICLO: MesCiclo[] = [
  'ago/26',
  'set/26',
  'out/26',
  'nov/26',
  'dez/26',
  'jan/27',
  'fev/27',
  'mar/27',
  'abr/27',
  'mai/27',
  'jun/27',
  'jul/27',
];

export const MESES_NOMES: Record<MesCiclo, string> = {
  'ago/26': 'Agosto/2026',
  'set/26': 'Setembro/2026',
  'out/26': 'Outubro/2026',
  'nov/26': 'Novembro/2026',
  'dez/26': 'Dezembro/2026',
  'jan/27': 'Janeiro/2027',
  'fev/27': 'Fevereiro/2027',
  'mar/27': 'Março/2027',
  'abr/27': 'Abril/2027',
  'mai/27': 'Maio/2027',
  'jun/27': 'Junho/2027',
  'jul/27': 'Julho/2027',
};

export type AnoCiclo = '2025/2026' | '2026/2027' | '2027/2028' | '2029/2030';

export interface Irmao {
  id: string;
  nome: string;
  cim: string;
  mutua: 'Sim' | 'Não';
  captacao: 'Sim' | 'Não';
  grau?: 'Ap.' | 'Comp.' | "M.'. M.'.";
  telefone?: string;
  valorBase: number;
  valoresMeses?: Partial<Record<MesCiclo, number>>;
}

export type TipoLancamento = 'Entrada | Receita' | 'Saída | Despesa';

export interface Lancamento {
  id: string;
  mes: string; // e.g. "agosto/26" or "ago/26"
  tipo: TipoLancamento;
  conta: string;
  desc: string;
  valor: number;
  dataRegistro?: string;
}

export interface Parcelamento {
  id: string;
  nome: string;
  cim: string;
  mes: string;
  valor: number;
  pago: number;
  periodo: string; // e.g. "3/3", "5/6"
  obs: string;
  situacao: 'Pago' | 'Pendente de Pagamento';
}

export interface Nominata {
  vm: string; // Venerável Mestre
  pv: string; // Primeiro Vigilante
  sv: string; // Segundo Vigilante
  sec: string; // Secretário
  rmp: string; // Representante Ministério Público (Orador)
  cap: string; // Capelão
  tes: string; // Tesoureiro
}

export type TabId =
  | 'inicio'
  | 'mensalidades'
  | 'entradas-saidas'
  | 'historico'
  | 'fluxo-caixa'
  | 'parcelamentos'
  | 'demonstrativo'
  | 'nominata'
  | 'indicadores';
