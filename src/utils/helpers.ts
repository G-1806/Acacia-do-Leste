export function formatarMoeda(val: number | undefined | null): string {
  return Number(val || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function formatarMoedaSemSimbolo(val: number | undefined | null): string {
  return Number(val || 0).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(`acacia_tesouraria_${key}`);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error(`Erro ao carregar do localStorage (${key}):`, err);
  }
  return defaultValue;
}

export function saveToLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`acacia_tesouraria_${key}`, JSON.stringify(value));
  } catch (err) {
    console.error(`Erro ao salvar no localStorage (${key}):`, err);
  }
}
