import React, { useState, useRef } from 'react';
import { Irmao, Lancamento, MesCiclo, MESES_CICLO, MESES_NOMES, AnoCiclo } from '../types';
import { formatarMoeda } from '../utils/helpers';
import lodgeSealImg from '../assets/images/acacia_leste_seal_1788563973733.jpg';
import html2canvas from 'html2canvas';
import {
  Share2,
  Download,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Search,
  FileText,
  MessageCircle,
} from 'lucide-react';

interface TabDemonstrativoProps {
  irmaos: Irmao[];
  lancamentos: Lancamento[];
  mesVigente: MesCiclo;
  anoCiclo: AnoCiclo;
  onOpenNotificacao: (irmao: Irmao, mesesAtraso: string[]) => void;
}

export const TabDemonstrativo: React.FC<TabDemonstrativoProps> = ({
  irmaos,
  lancamentos,
  mesVigente,
  anoCiclo,
  onOpenNotificacao,
}) => {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'todos' | 'em-prumo' | 'inadimplentes'>('todos');
  const [exportandoId, setExportandoId] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  // Helper para buscar valor projetado
  const getValorProjetado = (ir: Irmao, mes: MesCiclo): number => {
    if (ir.valoresMeses && ir.valoresMeses[mes] !== undefined) return ir.valoresMeses[mes]!;
    return ir.valorBase || 0;
  };

  // Helper para buscar pagamentos realizados
  const getPagamentoReal = (nomeIrmao: string, mes: MesCiclo): number => {
    let total = 0;
    const nomeFmt = nomeIrmao.trim().toLowerCase();

    lancamentos.forEach((l) => {
      if (
        l.tipo.includes('Entrada') &&
        (l.conta.toLowerCase().includes('mensalidade') || l.conta.toLowerCase().includes('mensalidades')) &&
        l.desc.trim().toLowerCase() === nomeFmt
      ) {
        const lMes = l.mes.toLowerCase();
        let mK: MesCiclo | null = null;
        if (lMes.startsWith('ago')) mK = 'ago/26';
        else if (lMes.startsWith('set')) mK = 'set/26';
        else if (lMes.startsWith('out')) mK = 'out/26';
        else if (lMes.startsWith('nov')) mK = 'nov/26';
        else if (lMes.startsWith('dez')) mK = 'dez/26';
        else if (lMes.startsWith('jan')) mK = 'jan/27';
        else if (lMes.startsWith('fev')) mK = 'fev/27';
        else if (lMes.startsWith('mar')) mK = 'mar/27';
        else if (lMes.startsWith('abr')) mK = 'abr/27';
        else if (lMes.startsWith('mai')) mK = 'mai/27';
        else if (lMes.startsWith('jun')) mK = 'jun/27';
        else if (lMes.startsWith('jul')) mK = 'jul/27';

        if (mK === mes) {
          total += l.valor;
        }
      }
    });

    return total;
  };

  const indexMesVigente = MESES_CICLO.indexOf(mesVigente);

  // Análise detalhada por irmão
  const demonstrativoIrmaos = irmaos.map((ir) => {
    let totalDevidoAno = 0;
    let totalPagoAno = 0;
    let mesesAtrasadosPassados: string[] = [];
    let consecutivoAtrasos = 0;
    let maxConsecutivoAtrasos = 0;

    const mesesStatus = MESES_CICLO.map((m, idx) => {
      const devido = getValorProjetado(ir, m);
      const pago = getPagamentoReal(ir.nome, m);
      totalDevidoAno += devido;
      totalPagoAno += pago;

      const isPassadoOuAtual = idx <= indexMesVigente;
      const pendente = devido > pago;

      let status: 'Em Prumo' | 'Pendente' | 'Em Aberto / A Vencer';
      if (!isPassadoOuAtual) {
        status = 'Em Aberto / A Vencer';
      } else {
        if (devido === 0 || pago >= devido) {
          status = 'Em Prumo';
          consecutivoAtrasos = 0;
        } else {
          status = 'Pendente';
          mesesAtrasadosPassados.push(MESES_NOMES[m]);
          consecutivoAtrasos += 1;
          if (consecutivoAtrasos > maxConsecutivoAtrasos) {
            maxConsecutivoAtrasos = consecutivoAtrasos;
          }
        }
      }

      return {
        mes: m,
        mesNome: MESES_NOMES[m],
        devido,
        pago,
        status,
        isPassadoOuAtual,
      };
    });

    // Inadimplente: 3 ou mais meses consecutivos de atraso no período já decorrido
    const isInadimplente3Meses = maxConsecutivoAtrasos >= 3;
    const isTotalEmPrumo = mesesAtrasadosPassados.length === 0;

    return {
      irmao: ir,
      mesesStatus,
      totalDevidoAno,
      totalPagoAno,
      saldoDevedorTotal: Math.max(0, totalDevidoAno - totalPagoAno),
      mesesAtrasadosPassados,
      isInadimplente3Meses,
      isTotalEmPrumo,
    };
  });

  // Filtragem
  const filtrados = demonstrativoIrmaos.filter((item) => {
    const matchBusca =
      item.irmao.nome.toLowerCase().includes(busca.toLowerCase()) ||
      item.irmao.cim.includes(busca);
    if (!matchBusca) return false;

    if (filtroStatus === 'em-prumo' && !item.isTotalEmPrumo) return false;
    if (filtroStatus === 'inadimplentes' && !item.isInadimplente3Meses) return false;

    return true;
  });

  // Renderizador direto de alta resolução via Canvas 2D
  const gerarDemonstrativoPNG = async (
    item: (typeof demonstrativoIrmaos)[0]
  ): Promise<Blob | null> => {
    const canvas = document.createElement('canvas');
    const width = 820;
    const height = 980;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Fundo Branco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Moldura Externa Azul e Dourada
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#081838';
    ctx.strokeRect(12, 12, width - 24, height - 24);

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#CFA73E';
    ctx.strokeRect(18, 18, width - 36, height - 36);

    // Cabeçalho Navy Blue
    ctx.fillStyle = '#081838';
    ctx.fillRect(22, 22, width - 44, 110);

    // Linha de acabamento dourada
    ctx.fillStyle = '#CFA73E';
    ctx.fillRect(22, 132, width - 44, 4);

    // Desenha o Brasão da Loja
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = lodgeSealImg;
      await new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
        setTimeout(resolve, 400);
      });
      if (img.complete && img.naturalWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(80, 77, 40, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 40, 37, 80, 80);
        ctx.restore();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#CFA73E';
        ctx.beginPath();
        ctx.arc(80, 77, 40, 0, Math.PI * 2);
        ctx.stroke();
      }
    } catch {
      // Prossegue mesmo se a imagem não carregar no canvas
    }

    // Textos do Cabeçalho
    ctx.fillStyle = '#CFA73E';
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.fillText('A∴ R∴ L∴ S∴ ACÁCIA DO LESTE Nº 424', 135, 60);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.fillText("Rito de York • GOP - Grande Oriente Paulista • Or.∴ de São Paulo", 135, 82);

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '11px system-ui, -apple-system, sans-serif';
    ctx.fillText(`DEMONSTRATIVO FINANCEIRO INDIVIDUAL • ANO MAÇÔNICO: ${anoCiclo}`, 135, 102);

    // Caixa de Identificação do Irmão
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(32, 150, width - 64, 90);
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.strokeRect(32, 150, width - 64, 90);

    ctx.fillStyle = '#081838';
    ctx.font = 'bold 17px system-ui, -apple-system, sans-serif';
    ctx.fillText(`Ir∴ ${item.irmao.nome}`, 48, 180);

    ctx.fillStyle = '#475569';
    ctx.font = '12px system-ui, -apple-system, sans-serif';
    ctx.fillText(
      `CIM: ${item.irmao.cim}   |   Grau: ${item.irmao.grau || "M.'. M.'."}   |   Mútua: ${item.irmao.mutua || 'Não'}   |   Captação: ${item.irmao.captacao || 'Não'}`,
      48,
      205
    );

    // Badge de Situação
    const badgeX = width - 275;
    if (item.isTotalEmPrumo) {
      ctx.fillStyle = '#DCFCE7';
      ctx.fillRect(badgeX, 165, 230, 32);
      ctx.strokeStyle = '#16A34A';
      ctx.strokeRect(badgeX, 165, 230, 32);
      ctx.fillStyle = '#15803D';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.fillText('✓ EM PRUMO COM A TESOURARIA', badgeX + 14, 186);
    } else {
      ctx.fillStyle = '#FEE2E2';
      ctx.fillRect(badgeX, 165, 230, 32);
      ctx.strokeStyle = '#DC2626';
      ctx.strokeRect(badgeX, 165, 230, 32);
      ctx.fillStyle = '#B91C1C';
      ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
      ctx.fillText('⚠ MENSALIDADES PENDENTES', badgeX + 18, 186);
    }

    // Tabela dos Meses
    const tableY = 255;
    ctx.fillStyle = '#081838';
    ctx.fillRect(32, tableY, width - 64, 30);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText('MÊS DO CICLO', 48, tableY + 20);
    ctx.fillText('PREVISTO (R$)', 260, tableY + 20);
    ctx.fillText('PAGO (R$)', 450, tableY + 20);
    ctx.fillText('SITUAÇÃO', 640, tableY + 20);

    let curY = tableY + 30;
    const rowHeight = 28;
    item.mesesStatus.forEach((m, idx) => {
      ctx.fillStyle = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
      ctx.fillRect(32, curY, width - 64, rowHeight);
      ctx.strokeStyle = '#E2E8F0';
      ctx.strokeRect(32, curY, width - 64, rowHeight);

      // Nome do Mês
      ctx.fillStyle = m.mes === mesVigente ? '#081838' : '#334155';
      ctx.font =
        m.mes === mesVigente
          ? 'bold 11px system-ui, -apple-system, sans-serif'
          : '11px system-ui, -apple-system, sans-serif';
      ctx.fillText(m.mesNome + (m.mes === mesVigente ? ' (Mês Atual)' : ''), 48, curY + 18);

      // Previsto
      ctx.fillText(formatarMoeda(m.devido), 260, curY + 18);

      // Pago
      ctx.fillStyle = m.pago > 0 ? '#15803D' : '#64748B';
      ctx.fillText(formatarMoeda(m.pago), 450, curY + 18);

      // Situação
      if (m.status === 'Em Prumo') {
        ctx.fillStyle = '#15803D';
        ctx.fillText('✓ Quitado', 640, curY + 18);
      } else if (m.status === 'Pendente') {
        ctx.fillStyle = '#B91C1C';
        ctx.fillText('✕ Pendente', 640, curY + 18);
      } else {
        ctx.fillStyle = '#64748B';
        ctx.fillText('A Vencer', 640, curY + 18);
      }

      curY += rowHeight;
    });

    // Linha de Totais da Tabela
    ctx.fillStyle = '#081838';
    ctx.fillRect(32, curY, width - 64, 36);
    ctx.fillStyle = '#CFA73E';
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.fillText('TOTAL NO CICLO:', 48, curY + 23);
    ctx.fillText(formatarMoeda(item.totalDevidoAno), 260, curY + 23);
    ctx.fillStyle = '#4ADE80';
    ctx.fillText(formatarMoeda(item.totalPagoAno), 450, curY + 23);
    ctx.fillStyle = item.saldoDevedorTotal > 0 ? '#F87171' : '#FFFFFF';
    ctx.fillText(
      item.saldoDevedorTotal > 0 ? `Saldo: ${formatarMoeda(item.saldoDevedorTotal)}` : 'Liquidado',
      640,
      curY + 23
    );

    // Rodapé de Autenticidade e Assinatura
    const footerY = curY + 60;
    ctx.fillStyle = '#64748B';
    ctx.font = '10px system-ui, -apple-system, sans-serif';
    const agora = new Date();
    ctx.fillText(
      `Comprovante gerado pela Tesouraria da A∴ R∴ L∴ S∴ Acácia do Leste nº 424 em ${agora.toLocaleDateString(
        'pt-BR'
      )} às ${agora.toLocaleTimeString('pt-BR')}.`,
      48,
      footerY
    );
    ctx.fillText(
      'Demonstrativo eletrônico emitido para acompanhamento contínuo e prestação de contas.',
      48,
      footerY + 16
    );

    // Linha de Assinatura
    ctx.strokeStyle = '#94A3B8';
    ctx.beginPath();
    ctx.moveTo(width - 290, footerY + 8);
    ctx.lineTo(width - 50, footerY + 8);
    ctx.stroke();

    ctx.fillStyle = '#081838';
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.fillText('Tesouraria da Loja', width - 215, footerY + 24);

    return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  };

  // Função para exportar cartão individual como imagem (PNG) para WhatsApp
  const handleExportarImagem = async (
    irmaoId: string,
    irmaoNome: string,
    item: (typeof demonstrativoIrmaos)[0]
  ) => {
    setExportandoId(irmaoId);
    try {
      let imageBlob: Blob | null = null;
      const cardElement = document.getElementById(`demonstrativo-card-${irmaoId}`);

      // Tenta html2canvas primeiro
      if (cardElement) {
        const actionButtons = cardElement.querySelector('.card-actions') as HTMLElement;
        if (actionButtons) actionButtons.style.display = 'none';

        try {
          const canvas = await html2canvas(cardElement, {
            scale: 2,
            backgroundColor: '#FFFFFF',
            logging: false,
            useCORS: true,
            allowTaint: true,
          });
          imageBlob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob(resolve, 'image/png')
          );
        } catch (errCapture) {
          console.warn('html2canvas não completou, usando gerador Canvas direto:', errCapture);
        } finally {
          if (actionButtons) actionButtons.style.display = 'flex';
        }
      }

      // Se html2canvas falhou ou blob nulo, usa gerador Canvas direto de alta resolução
      if (!imageBlob) {
        imageBlob = await gerarDemonstrativoPNG(item);
      }

      if (imageBlob) {
        // Download direto do arquivo PNG
        const url = URL.createObjectURL(imageBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Demonstrativo_${irmaoNome.replace(/\s+/g, '_')}_Acacia424.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setMensagemSucesso(`Imagem do demonstrativo do Ir.'. ${irmaoNome} baixada com sucesso!`);
        setTimeout(() => setMensagemSucesso(null), 4000);
      } else {
        throw new Error('Não foi possível gerar os dados da imagem.');
      }
    } catch (err) {
      console.error('Erro ao gerar imagem:', err);
      alert('Não foi possível gerar a imagem do demonstrativo. Tente novamente.');
    } finally {
      setExportandoId(null);
    }
  };

  // Abrir WhatsApp com texto formatado do resumo
  const handleEnviarTextoWhatsApp = (item: (typeof demonstrativoIrmaos)[0]) => {
    const ir = item.irmao;
    const saudacao = `*A∴ R∴ L∴ S∴ ACÁCIA DO LESTE Nº 424*\n*TESOURARIA - DEMONSTRATIVO FINANCEIRO*\nAno Maçônico: ${anoCiclo}\n\nIr.'. *${ir.nome}* (CIM: ${ir.cim})\nGrau: ${ir.grau || "M.'. M.'."}\n\n`;
    
    let corpo = `*Situação Financeira:*\n`;
    if (item.isTotalEmPrumo) {
      corpo += `✅ *Em Prumo com a Tesouraria!*\nTodos os pagamentos até ${MESES_NOMES[mesVigente]} encontram-se quitados.\n`;
    } else {
      corpo += `⚠️ *Mensalidades em Aberto:* ${item.mesesAtrasadosPassados.join(', ')}\nSaldo Devedor: ${formatarMoeda(item.saldoDevedorTotal)}\n`;
    }

    corpo += `\nTotal Previsto no Ciclo: ${formatarMoeda(item.totalDevidoAno)}\nTotal Efetivamente Pago: ${formatarMoeda(item.totalPagoAno)}\n\n_Mensagem automática gerada pela Tesouraria da Loja._`;

    const encoded = encodeURIComponent(saudacao + corpo);
    const phone = ir.telefone ? ir.telefone.replace(/\D/g, '') : '';
    const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 animate-fadeIn relative">
      {/* Toast de Sucesso ao Baixar Imagem */}
      {mensagemSucesso && (
        <div className="fixed top-20 right-6 z-50 bg-[#081838] text-white border-2 border-[#CFA73E] px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-slideInRight">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs font-semibold">{mensagemSucesso}</div>
        </div>
      )}

      {/* Top Header and Filters */}
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3 border-b pb-3">
          <div>
            <h2 className="text-base font-black text-[#081838] uppercase tracking-wider">
              Demonstrativo Financeiro Individual por Irmão
            </h2>
            <p className="text-xs text-slate-500">
              Confronto entre valores projetados e efetivamente recolhidos no Livro Caixa, com identificação de inadimplência (+3 meses consecutivos) e geração de demonstrativos em imagem para WhatsApp.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-3 text-xs">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por Irmão ou CIM..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="border border-slate-300 rounded pl-8 pr-3 py-1.5 w-64 focus:outline-none focus:border-[#CFA73E] bg-slate-50"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setFiltroStatus('todos')}
              className={`px-3 py-1 rounded font-bold cursor-pointer ${
                filtroStatus === 'todos' ? 'bg-white shadow text-[#081838]' : 'text-slate-600'
              }`}
            >
              Todos ({demonstrativoIrmaos.length})
            </button>
            <button
              onClick={() => setFiltroStatus('em-prumo')}
              className={`px-3 py-1 rounded font-bold cursor-pointer ${
                filtroStatus === 'em-prumo' ? 'bg-emerald-600 text-white shadow' : 'text-emerald-700'
              }`}
            >
              Em Prumo
            </button>
            <button
              onClick={() => setFiltroStatus('inadimplentes')}
              className={`px-3 py-1 rounded font-bold cursor-pointer ${
                filtroStatus === 'inadimplentes' ? 'bg-red-600 text-white shadow' : 'text-red-700'
              }`}
            >
              Inadimplentes (+3 Meses)
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Cartões Demonstrativos Individuais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtrados.map((item) => {
          const { irmao, mesesStatus, totalDevidoAno, totalPagoAno, isInadimplente3Meses, isTotalEmPrumo } = item;

          return (
            <div
              key={irmao.id}
              id={`demonstrativo-card-${irmao.id}`}
              className={`rounded-2xl shadow-md p-5 border transition duration-200 bg-white relative ${
                isInadimplente3Meses
                  ? 'border-red-400 bg-red-50/40 ring-2 ring-red-300/60'
                  : 'border-slate-200'
              }`}
            >
              {/* Header do Cartão com Identificação */}
              <div className="flex items-center justify-between border-b pb-3 mb-3">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-[#081838] uppercase flex items-center gap-1.5">
                    <span className="text-[#CFA73E] font-serif font-bold">Ir∴</span>
                    <span>{irmao.nome}</span>
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5">
                    <span>CIM: <strong className="text-slate-700">{irmao.cim}</strong></span>
                    <span>•</span>
                    <span>Grau: <strong className="text-slate-700">{irmao.grau || "M.'. M.'."}</strong></span>
                    <span>•</span>
                    <span>Ciclo: <strong className="text-slate-700">{anoCiclo}</strong></span>
                  </div>
                </div>

                {/* Badge de Status */}
                <div>
                  {isInadimplente3Meses ? (
                    <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase shadow-xs">
                      <AlertOctagon className="w-3.5 h-3.5" /> Inadimplente (+3m)
                    </span>
                  ) : isTotalEmPrumo ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Em Prumo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      <Clock className="w-3 h-3 text-amber-600" /> Pendência Pontual
                    </span>
                  )}
                </div>
              </div>

              {/* Tabela Mês a Mês do Irmão */}
              <div className="overflow-x-auto custom-scroll border rounded-lg mb-3">
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead className="bg-[#081838] text-white uppercase text-[9px]">
                    <tr>
                      <th className="p-1.5 border-r border-slate-700">Mês</th>
                      <th className="p-1.5 border-r border-slate-700 text-right">Projetado</th>
                      <th className="p-1.5 border-r border-slate-700 text-right">Pago</th>
                      <th className="p-1.5 text-center">Situação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {mesesStatus.map((mItem) => {
                      let badgeClass = 'bg-slate-100 text-slate-500';
                      if (mItem.status === 'Em Prumo') {
                        badgeClass = 'bg-emerald-100 text-emerald-800 font-bold';
                      } else if (mItem.status === 'Pendente') {
                        badgeClass = 'bg-red-100 text-red-800 font-bold';
                      } else {
                        badgeClass = 'bg-blue-50 text-blue-700';
                      }

                      return (
                        <tr
                          key={mItem.mes}
                          className={`hover:bg-slate-50/80 ${
                            mItem.mes === mesVigente ? 'bg-amber-50/40 font-semibold' : ''
                          }`}
                        >
                          <td className="p-1 border-r border-slate-200 font-sans text-slate-700">
                            {mItem.mesNome}
                          </td>
                          <td className="p-1 border-r border-slate-200 text-right text-slate-700">
                            {formatarMoeda(mItem.devido)}
                          </td>
                          <td className="p-1 border-r border-slate-200 text-right text-emerald-700 font-bold">
                            {mItem.pago > 0 ? formatarMoeda(mItem.pago) : '—'}
                          </td>
                          <td className="p-1 text-center font-sans text-[10px]">
                            <span className={`px-2 py-0.5 rounded-full ${badgeClass}`}>
                              {mItem.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-slate-100 font-bold text-[11px] border-t border-slate-300 font-mono">
                    <tr>
                      <td className="p-1.5 font-sans uppercase">Total</td>
                      <td className="p-1.5 text-right text-slate-800">{formatarMoeda(totalDevidoAno)}</td>
                      <td className="p-1.5 text-right text-emerald-800">{formatarMoeda(totalPagoAno)}</td>
                      <td className="p-1.5 text-center font-sans text-[10px] text-slate-600">
                        {totalPagoAno >= totalDevidoAno ? 'Liquidado' : `Saldo: ${formatarMoeda(totalDevidoAno - totalPagoAno)}`}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Ações do Demonstrativo: Imagem WhatsApp e Notificação */}
              <div className="card-actions flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/80 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleExportarImagem(irmao.id, irmao.nome, item)}
                    disabled={exportandoId === irmao.id}
                    title="Baixar imagem em alta resolução (PNG) para WhatsApp e comprovante"
                    className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-3 py-1.5 rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {exportandoId === irmao.id ? 'Gerando Imagem...' : 'Baixar Imagem'}
                  </button>

                  <button
                    onClick={() => handleEnviarTextoWhatsApp(item)}
                    title="Enviar resumo formatado por WhatsApp"
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold p-1.5 rounded-lg transition cursor-pointer border border-slate-300"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                  </button>
                </div>

                {/* Botão de Notificação Oficial se Inadimplente */}
                {isInadimplente3Meses && (
                  <button
                    onClick={() => onOpenNotificacao(irmao, item.mesesAtrasadosPassados)}
                    className="bg-red-600 hover:bg-red-700 text-white font-black px-3 py-1.5 rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer text-[11px]"
                  >
                    <FileText className="w-3.5 h-3.5" /> Gerar Notificação
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
