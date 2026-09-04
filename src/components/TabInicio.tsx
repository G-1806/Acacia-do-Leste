import React from 'react';
import { LodgeLogo } from './LodgeLogo';
import { ShieldCheck, Scale, HeartHandshake, Compass } from 'lucide-react';

export const TabInicio: React.FC = () => {
  return (
    <section className="space-y-6 animate-fadeIn">
      {/* Hero Banner with Official Lodge Seal */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-[#081838] via-[#162C5A] to-slate-900 p-8 md:p-12 text-white text-center relative">
          <div className="flex justify-center mb-4">
            <LodgeLogo size={120} className="shadow-2xl ring-4 ring-[#CFA73E]/60" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-wider text-[#CFA73E] mb-2 uppercase">
            A∴ R∴ L∴ S∴ Acácia do Leste nº 424
          </h2>
          <p className="text-xs md:text-sm text-slate-300 font-semibold tracking-widest uppercase">
            Or.'. de São Paulo • Jurisdicionada ao GOP - Grande Oriente Paulista • Rito de York
          </p>
          <div className="mt-4 flex flex-wrap justify-center items-center gap-3 text-xs">
            <span className="bg-[#CFA73E]/20 text-[#E8CA65] px-3 py-1 rounded-full border border-[#CFA73E]/40 font-bold">
              Fundada em 20 de Janeiro de 2020
            </span>
            <span className="bg-white/10 text-white px-3 py-1 rounded-full border border-white/20 font-medium">
              Gestão Financeira e Contábil da Tesouraria
            </span>
          </div>
        </div>

        {/* Pillars of Masonic Thought */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-slate-50/70 border-b border-slate-200 text-center py-4 px-6">
          <div className="flex items-center justify-center gap-3 p-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
              <Compass className="w-5 h-5 text-blue-800" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Liberdade</p>
              <p className="text-[11px] text-slate-500">De pensamento, busca constante da verdade</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 p-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <Scale className="w-5 h-5 text-amber-700" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Igualdade</p>
              <p className="text-[11px] text-slate-500">Todos filhos do Criador sob a reta justiça</p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 p-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
              <HeartHandshake className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Fraternidade</p>
              <p className="text-[11px] text-slate-500">Solidariedade e afeto fraterno universal</p>
            </div>
          </div>
        </div>

        {/* Verbatim Content: "Quem Somos" */}
        <div className="p-6 md:p-10 space-y-5 text-justify leading-relaxed text-slate-700 text-sm md:text-base">
          <div className="text-center pb-2">
            <h3 className="text-lg md:text-xl font-black text-[#081838] uppercase tracking-widest inline-flex items-center gap-2 border-b-2 border-[#CFA73E] pb-1">
              <ShieldCheck className="w-5 h-5 text-[#CFA73E]" />
              Quem Somos
            </h3>
          </div>

          <p>
            Temos por finalidade levar a filosofia, a educação e cultura maçônica a todos os homens, fazendo
            renascer em cada um os reais e sublimes valores, incentivando seus membros ao verdadeiro princípio
            da virtude, constituindo-se assim, como uma instituição essencialmente filosófica e solidária entre
            seus membros. Trabalhamos pelo aperfeiçoamento moral, intelectual e social da humanidade, pelo fiel
            cumprimento do dever e a constante busca da verdade, cultivando entre todos o conhecimento de que
            cada um é filho do Deus Criador e que as limitações geográficas devem servir apenas para facilitar
            a busca da felicidade pela correta aplicação da justiça. Nossos fins supremos são:{' '}
            <strong className="text-[#081838]">Liberdade, Igualdade e Fraternidade</strong>.
          </p>

          <p>
            Reunimos em um ambiente fraternal e propício para concentrar atenção e esforços para melhoraria de
            caráter e de desenvolvimento de sentimento de responsabilidade, que nos faz meditar tranquilamente
            sobre a nossa missão na vida, recordando constantemente os valores eternos cujo cultivo nos
            possibilitará acercar-se da verdade.
          </p>

          <p>
            Oportunizamos a convivência com pessoas que, por suas palavras, por suas obras, podem constituir-se
            em exemplos; encontrar afetos fraternais em qualquer lugar em que se esteja dentro ou fora do país.
            Consideramos possível o progresso na base de respeito à personalidade, à justiça social e a mais
            estreita solidariedade entre os homens.
          </p>
        </div>
      </div>
    </section>
  );
};
