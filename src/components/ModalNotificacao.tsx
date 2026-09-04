import React, { useState, useRef } from 'react';
import { Irmao, Nominata } from '../types';
import { LodgeLogo } from './LodgeLogo';
import html2canvas from 'html2canvas';
import { Printer, Download, MessageCircle, X, ShieldAlert } from 'lucide-react';

interface ModalNotificacaoProps {
  irmao: Irmao | null;
  mesesAtraso: string[];
  nominata: Nominata;
  onClose: () => void;
}

export const ModalNotificacao: React.FC<ModalNotificacaoProps> = ({
  irmao,
  mesesAtraso,
  nominata,
  onClose,
}) => {
  if (!irmao) return null;

  const dataAtual = new Date();
  const [dia, setDia] = useState<string>(String(dataAtual.getDate()).padStart(2, '0'));
  const [mesExtenso, setMesExtenso] = useState<string>(
    dataAtual.toLocaleString('pt-BR', { month: 'long' })
  );
  const [ano, setAno] = useState<number>(dataAtual.getFullYear());
  const [grauIrmao, setGrauIrmao] = useState<string>(irmao.grau || "M.'. M.'.");
  const [nomeTesoureiro, setNomeTesoureiro] = useState<string>(
    nominata?.tes || 'ANDERSON TAKESHI SAWAMURA'
  );
  const [isExporting, setIsExporting] = useState(false);

  const printRef = useRef<HTMLDivElement>(null);

  // Anos até 2040 conforme solicitado
  const anosDisponiveis: number[] = [];
  for (let a = 2024; a <= 2040; a++) {
    anosDisponiveis.push(a);
  }

  const mesesDoAno = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

  const handleImprimir = () => {
    window.print();
  };

  const handleDownloadImagem = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        backgroundColor: '#FFFFFF',
        logging: false,
        useCORS: true,
      });

      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `Notificacao_${irmao.nome.replace(/\s+/g, '_')}.png`;
      link.click();
    } catch (err) {
      console.error('Erro ao gerar imagem da notificação:', err);
      alert('Erro ao exportar a notificação como imagem.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleEnviarWhatsApp = () => {
    const textoMsg = `*A∴ R∴ L∴ S∴ ACÁCIA DO LESTE Nº 424*\n*COMUNICADO OFICIAL DA TESOURARIA*\n\nOr.'. de São Paulo, aos ${dia} do mês de ${mesExtenso} de ${ano}.\n\nRespeitável Irmão *${irmao.nome}*, ${grauIrmao}\n\nCaro Irmão,\n\nVimos, através deste, comunicar que o Respeitável Irmão deixou de recolher, durante três meses consecutivos, as contribuições pecuniárias que lhe foram legalmente atribuídas (${mesesAtraso.join(', ')}).\n\nFavor entrar em contato a fim de saldar o seu débito ou apresentar justificativas, no prazo máximo de 30 (trinta) dias a partir do recebimento desta.\n\nNo aguardo de vosso breve contato,\n\nFraternalmente,\nIr.'. *${nomeTesoureiro}*, M.'. M.'.\nTesoureiro`;

    const phone = irmao.telefone ? irmao.telefone.replace(/\D/g, '') : '';
    const encoded = encodeURIComponent(textoMsg);
    const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-auto animate-scaleUp">
        {/* Modal Top Controls (No-Print) */}
        <div className="no-print bg-slate-900 text-white p-4 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#CFA73E]">
              Notificação Oficial de Obreiro Inadimplente
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleImprimir}
              className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Imprimir
            </button>
            <button
              onClick={handleDownloadImagem}
              disabled={isExporting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              {isExporting ? 'Gerando...' : 'Baixar Imagem'}
            </button>
            <button
              onClick={handleEnviarWhatsApp}
              className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configurações Editáveis dos Parâmetros da Notificação (No-Print) */}
        <div className="no-print bg-amber-50/70 border-b border-amber-200 p-4 text-xs space-y-2">
          <p className="font-bold text-amber-950 uppercase tracking-wider text-[10px]">
            Parâmetros da Notificação (Editáveis):
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div>
              <label className="block text-[10px] text-slate-600 font-bold">Dia:</label>
              <input
                type="text"
                value={dia}
                onChange={(e) => setDia(e.target.value)}
                className="w-full border rounded px-2 py-1 bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] text-slate-600 font-bold">Mês:</label>
              <select
                value={mesExtenso}
                onChange={(e) => setMesExtenso(e.target.value)}
                className="w-full border rounded px-2 py-1 bg-white capitalize"
              >
                {mesesDoAno.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-600 font-bold">Ano (até 2040):</label>
              <select
                value={ano}
                onChange={(e) => setAno(parseInt(e.target.value))}
                className="w-full border rounded px-2 py-1 bg-white"
              >
                {anosDisponiveis.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] text-slate-600 font-bold">Grau do Irmão:</label>
              <select
                value={grauIrmao}
                onChange={(e) => setGrauIrmao(e.target.value)}
                className="w-full border rounded px-2 py-1 bg-white"
              >
                <option value="M.'. M.'.">M.'. M.'. (Mestre)</option>
                <option value="Comp.'.">Comp.'. (Companheiro)</option>
                <option value="Ap.'.">Ap.'. (Aprendiz)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-slate-600 font-bold">
              Nome do Tesoureiro (Vinculado à Nominata):
            </label>
            <input
              type="text"
              value={nomeTesoureiro}
              onChange={(e) => setNomeTesoureiro(e.target.value)}
              className="w-full border rounded px-2 py-1 bg-white font-semibold text-slate-800"
            />
          </div>
        </div>

        {/* ======================================================== */}
        {/* DOCUMENTO OFICIAL RITUALÍSTICO (PRINTABLE & CAPTURABLE)   */}
        {/* ======================================================== */}
        <div
          ref={printRef}
          className="p-8 md:p-12 text-slate-900 bg-white leading-relaxed space-y-6 select-text"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {/* Cabeçalho Oficial com Brasão da Loja */}
          <div className="text-center space-y-2 border-b-2 border-[#CFA73E] pb-5">
            <div className="flex justify-center mb-2">
              <LodgeLogo size={90} className="shadow-lg" />
            </div>
            <h2 className="text-base sm:text-lg font-black tracking-widest text-[#081838] uppercase">
              A∴ R∴ L∴ S∴ ACÁCIA DO LESTE Nº 424
            </h2>
            <p className="text-xs text-slate-600 tracking-wider uppercase font-sans">
              Rito de York • Fundada em 20/01/2020 • Or.'. de São Paulo - SP • GOP - Grande Oriente Paulista
            </p>
            <p className="text-[11px] font-bold text-amber-800 tracking-widest uppercase font-sans">
              G.'. A.'. D.'. U.'. — À GLÓRIA DO GRANDE ARQUITETO DO UNIVERSO
            </p>
          </div>

          {/* Data e Localidade */}
          <div className="text-right text-xs md:text-sm text-slate-700 italic">
            Or.'. de São Paulo, aos <strong>{dia}</strong> do mês de{' '}
            <strong>{mesExtenso}</strong> de <strong>{ano}</strong>.
          </div>

          {/* Destinatário */}
          <div className="text-xs md:text-sm text-slate-800 space-y-1">
            <p>
              Ao Respeitável Irmão <strong>{irmao.nome}</strong>, {grauIrmao}
            </p>
            <p className="text-xs text-slate-500 font-sans">CIM: {irmao.cim}</p>
          </div>

          {/* Corpo Oficial Verbatim da Notificação */}
          <div className="text-justify text-xs md:text-sm space-y-4 text-slate-800 leading-relaxed">
            <p className="font-bold">Caro Irmão,</p>

            <p>
              Vimos, através deste, comunicar que o Respeitável Irmão deixou de recolher, durante três meses
              consecutivos, as contribuições pecuniárias que lhe foram legalmente atribuídas.
            </p>

            <p>
              Favor entrar em contato a fim de saldar o seu débito ou apresentar justificativas, no prazo
              máximo de <strong>30 (trinta) dias</strong> a partir do recebimento desta.
            </p>

            <p>No aguardo de vosso breve contato,</p>

            <p className="pt-2">Fraternalmente,</p>
          </div>

          {/* Assinatura Oficial do Tesoureiro Vinculado à Nominata */}
          <div className="pt-10 text-center flex flex-col items-center space-y-1">
            <div className="w-72 border-b border-slate-700 mb-2"></div>
            <p className="font-bold text-xs md:text-sm text-[#081838]">
              Ir.'. {nomeTesoureiro}, M.'. M.'.
            </p>
            <p className="text-xs font-semibold text-[#CFA73E] uppercase tracking-wider font-sans">
              Tesoureiro
            </p>
            <p className="text-[10px] text-slate-400 font-sans">
              A∴ R∴ L∴ S∴ Acácia do Leste nº 424
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
