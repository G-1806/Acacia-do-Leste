import React, { ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Erro na aplicação capturado pelo ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetData = () => {
    if (window.confirm('Deseja limpar os dados locais do navegador e reiniciar o sistema?')) {
      try {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('acacia_tesouraria_')) {
            localStorage.removeItem(key);
          }
        });
      } catch (e) {
        console.error(e);
      }
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#081838] flex items-center justify-center p-4 text-white font-sans">
          <div className="max-w-md w-full bg-[#0c2044] border-2 border-[#CFA73E] rounded-2xl p-6 md:p-8 text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 text-[#CFA73E] flex items-center justify-center font-serif text-2xl font-black border border-[#CFA73E]/60">
              ∴
            </div>
            <h1 className="text-lg md:text-xl font-black text-[#CFA73E] uppercase tracking-wide">
              A∴ R∴ L∴ S∴ Acácia do Leste nº 424
            </h1>
            <p className="text-xs text-slate-300">
              Ocorreu uma instabilidade inesperada ao carregar o aplicativo.
            </p>
            {this.state.error && (
              <div className="bg-slate-900/80 p-3 rounded-lg text-left text-[11px] text-amber-200/90 font-mono overflow-x-auto border border-amber-400/20">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={this.handleReload}
                className="w-full bg-[#CFA73E] hover:bg-amber-400 text-[#081838] font-bold text-xs py-2.5 px-4 rounded-lg transition cursor-pointer"
              >
                Recarregar Página
              </button>
              <button
                onClick={this.handleResetData}
                className="w-full bg-white/10 hover:bg-white/20 text-slate-200 font-medium text-xs py-2 px-4 rounded-lg transition cursor-pointer"
              >
                Restaurar Dados Padrão da Loja
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
