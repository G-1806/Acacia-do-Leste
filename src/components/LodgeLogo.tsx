import React, { useState } from 'react';
import lodgeSealImg from '../assets/images/acacia_leste_seal_1788563973733.jpg';

interface LodgeLogoProps {
  className?: string;
  size?: number;
}

export const LodgeLogo: React.FC<LodgeLogoProps> = ({ className = '', size = 56 }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-white shadow-md border-2 border-amber-400 overflow-hidden shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {!imgError ? (
        <img
          src={lodgeSealImg}
          alt="A∴ R∴ L∴ S∴ Acácia do Leste nº 424"
          className="w-full h-full object-cover rounded-full"
          onError={() => setImgError(true)}
        />
      ) : (
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Anel Externo Azul Maçônico */}
          <circle cx="100" cy="100" r="96" fill="#0A1C3C" stroke="#CFA73E" strokeWidth="5" />

          {/* Anel Dourado Intermediário */}
          <circle cx="100" cy="100" r="77" fill="#FFFFFF" stroke="#CFA73E" strokeWidth="2.5" />

          {/* Texto Curvado Superior */}
          <path id="curveTopLodge" d="M 23 100 A 77 77 0 0 1 177 100" fill="none" />
          <text
            fontSize="11.5"
            fontWeight="900"
            fill="#FFFFFF"
            letterSpacing="0.8"
            fontFamily="system-ui, sans-serif"
          >
            <textPath href="#curveTopLodge" startOffset="50%" textAnchor="middle">
              A∴ R∴ L∴ S∴ ACÁCIA DO LESTE Nº 424
            </textPath>
          </text>

          {/* Texto Curvado Inferior */}
          <path id="curveBottomLodge" d="M 177 100 A 77 77 0 0 1 23 100" fill="none" />
          <text
            fontSize="10"
            fontWeight="800"
            fill="#FFFFFF"
            letterSpacing="1"
            fontFamily="system-ui, sans-serif"
          >
            <textPath href="#curveBottomLodge" startOffset="50%" textAnchor="middle">
              RITO DE YORK • 20/01/2020
            </textPath>
          </text>

        {/* Fundo do Núcleo com Pavimento Mosaico e Sol */}
        <circle cx="100" cy="100" r="67" fill="#F8FAFC" />

        {/* Raios do Sol Dourado */}
        <circle cx="100" cy="94" r="18" fill="#FDE68A" opacity="0.6" />
        <circle cx="100" cy="94" r="11" fill="#F59E0B" opacity="0.3" />

        {/* Pavimento Mosaico na Base */}
        <polygon
          points="58,140 142,140 130,118 70,118"
          fill="#E2E8F0"
          stroke="#94A3B8"
          strokeWidth="1"
        />
        <line x1="75" y1="118" x2="68" y2="140" stroke="#CBD5E1" strokeWidth="1" />
        <line x1="88" y1="118" x2="84" y2="140" stroke="#CBD5E1" strokeWidth="1" />
        <line x1="100" y1="118" x2="100" y2="140" stroke="#CBD5E1" strokeWidth="1" />
        <line x1="112" y1="118" x2="116" y2="140" stroke="#CBD5E1" strokeWidth="1" />
        <line x1="125" y1="118" x2="132" y2="140" stroke="#CBD5E1" strokeWidth="1" />

        {/* Ramos de Acácia laterais estilizados */}
        <path
          d="M 54 116 Q 48 88 64 68"
          fill="none"
          stroke="#059669"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 146 116 Q 152 88 136 68"
          fill="none"
          stroke="#059669"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Compasso Maçônico Dourado */}
        <path
          d="M 100 42 L 68 126 L 77 126 L 100 68 L 123 126 L 132 126 Z"
          fill="#9A6E18"
          stroke="#78350F"
          strokeWidth="0.8"
        />

        {/* Esquadro Maçônico */}
        <path
          d="M 64 96 L 136 96 L 129 107 L 71 107 Z"
          fill="#CFA73E"
          stroke="#92400E"
          strokeWidth="0.8"
        />

        {/* Letra 'G' Iluminada no Centro */}
        <circle cx="100" cy="88" r="9.5" fill="#0A1C3C" stroke="#CFA73E" strokeWidth="1.5" />
        <text
          x="100"
          y="92.5"
          fontSize="11"
          fontWeight="900"
          fill="#FFFFFF"
          textAnchor="middle"
          fontFamily="serif"
        >
          G
        </text>
      </svg>
      )}
    </div>
  );
};
