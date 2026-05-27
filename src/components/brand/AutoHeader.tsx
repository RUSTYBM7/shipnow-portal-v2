/**
 * AirPak Express - Auto Header Component
 * Automatically injects AirPak branding into all page headers
 */

import React from 'react';
import { AirPakLogoWithIcon, AirPakMiniLogo, BrandColors } from '../../lib/brand-engine';
import { ScriptLogo } from './ScriptLogo';

interface AutoHeaderProps {
  variant?: 'full' | 'compact' | 'minimal' | 'script';
  showSlogan?: boolean;
  className?: string;
}

export const AutoHeader: React.FC<AutoHeaderProps> = ({
  variant = 'full',
  showSlogan = false,
  className = '',
}) => {
  // Script logo variant with Pacifico style
  if (variant === 'script') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <ScriptLogo size="md" showTrademark />
      </div>
    );
  }

  const logoSvg = variant === 'minimal' ? AirPakMiniLogo : AirPakLogoWithIcon;
  const logoDataUrl = `data:image/svg+xml,${encodeURIComponent(logoSvg)}`;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src={logoDataUrl}
        alt="AirPak Express"
        className={`
          ${variant === 'full' ? 'h-10 w-auto' : variant === 'compact' ? 'h-8 w-auto' : 'h-7 w-auto'}
          transition-all duration-300
        `}
      />
      {showSlogan && variant === 'full' && (
        <div className="hidden md:flex flex-col">
          <span className="text-[10px] text-slate-400 tracking-wider uppercase">
            Global Logistics
          </span>
          <span className="text-[9px] text-slate-500">
            Excellence in Motion
          </span>
        </div>
      )}
    </div>
  );
};

// Branded Document Header
interface DocumentHeaderProps {
  title: string;
  subtitle?: string;
  documentNumber?: string;
  date?: string;
  logoUrl?: string;
}

export const DocumentHeader: React.FC<DocumentHeaderProps> = ({
  title,
  subtitle,
  documentNumber,
  date,
}) => {
  const logoSvg = AirPakLogoWithIcon;
  const logoDataUrl = `data:image/svg+xml,${encodeURIComponent(logoSvg)}`;

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-t-xl p-6 border-b border-slate-700">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {logoDataUrl && (
            <img src={logoDataUrl} alt="AirPak Express" className="h-12 w-auto" />
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {subtitle && (
              <p className="text-slate-400 text-sm mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          {documentNumber && (
            <div className="text-sm text-slate-300">
              <span className="text-slate-500">Ref:</span> {documentNumber}
            </div>
          )}
          {date && (
            <div className="text-sm text-slate-400 mt-1">
              {new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Branded Invoice Header
interface InvoiceHeaderProps {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
}

export const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({
  invoiceNumber,
  invoiceDate,
  dueDate,
}) => {
  const logoSvg = AirPakLogoWithIcon;
  const logoDataUrl = `data:image/svg+xml,${encodeURIComponent(logoSvg)}`;

  return (
    <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-red-600">
      <div className="flex items-center gap-4">
        {logoDataUrl && (
          <img src={logoDataUrl} alt="AirPak Express" className="h-14 w-auto" />
        )}
        <div>
          <h2 className="text-2xl font-bold text-slate-900">INVOICE</h2>
          <p className="text-slate-500 text-sm">AirPak Express Global Logistics</p>
        </div>
      </div>
      <div className="text-right space-y-1">
        <div className="text-sm">
          <span className="text-slate-500">Invoice #:</span>{' '}
          <span className="font-semibold text-slate-800">{invoiceNumber}</span>
        </div>
        <div className="text-sm">
          <span className="text-slate-500">Date:</span>{' '}
          <span className="text-slate-700">{invoiceDate}</span>
        </div>
        {dueDate && (
          <div className="text-sm">
            <span className="text-slate-500">Due:</span>{' '}
            <span className="font-semibold text-red-600">{dueDate}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Branded Email Header
interface EmailHeaderProps {
  recipientEmail?: string;
}

export const EmailHeader: React.FC<EmailHeaderProps> = ({ recipientEmail }) => {
  const logoSvg = AirPakLogoWithIcon;
  const logoDataUrl = `data:image/svg+xml,${encodeURIComponent(logoSvg)}`;

  return (
    <div
      style={{ backgroundColor: BrandColors.secondary }}
      className="px-6 py-4"
    >
      <div className="flex items-center justify-between">
        {logoDataUrl && (
          <img src={logoDataUrl} alt="AirPak Express" className="h-10 w-auto" />
        )}
        <div className="text-right text-slate-400 text-sm">
          {recipientEmail ? (
            <span>Sent to: {recipientEmail}</span>
          ) : (
            <span>AirPak Express Support</span>
          )}
        </div>
      </div>
    </div>
  );
};

// Branded Card Header
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  icon,
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${BrandColors.primary}15` }}
          >
            {icon}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
          {subtitle && (
            <p className="text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export default AutoHeader;
