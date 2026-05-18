import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Check, X, ExternalLink, Send, AlertCircle, Edit3 } from 'lucide-react';
import {
  handleWhatsAppCommunication,
  openWhatsAppManually,
  buildOutreachMessage,
  formatPhoneForDisplay
} from '../utils/leadUtils';
import WhatsAppLogo from './icons/WhatsAppLogo';

const WhatsAppSendButton = ({
  phone,
  businessName,
  category,
  rating,
  ratingCount,
  onSent,
  disabled = false,
  variant = 'full', // 'full' (with label) or 'icon' (icon-only)
}) => {
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [editingMessage, setEditingMessage] = useState(false);
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const defaultMessage = buildOutreachMessage(businessName, rating, ratingCount);
  const phoneDisplay = formatPhoneForDisplay(phone) || 'No phone';

  useEffect(() => {
    if (showModal) {
      setMessage(defaultMessage);
      setEditingMessage(false);
    }
  }, [showModal, defaultMessage]);

  useEffect(() => {
    if (!result?.success) return undefined;
    const t = setTimeout(() => setShowModal(false), 1400);
    return () => clearTimeout(t);
  }, [result]);

  useEffect(() => {
    if (showModal) return undefined;
    const t = setTimeout(() => setResult(null), 500);
    return () => clearTimeout(t);
  }, [showModal]);

  useEffect(() => {
    if (editingMessage && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(message.length, message.length);
    }
  }, [editingMessage]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpen = () => {
    if (disabled || sending) return;
    setShowModal(true);
  };

  const handleSendApi = async () => {
    setSending(true);
    setResult(null);
    const r = await handleWhatsAppCommunication(phone, businessName, category, message);
    setSending(false);
    setResult(r);
    if (r.success) {
      try { onSent?.(r); } catch (err) { console.error('[whatsapp] onSent callback threw:', err); }
    }
  };

  const handleManual = () => {
    openWhatsAppManually(phone, businessName);
    setShowModal(false);
  };

  const triggerIcon = () => {
    if (sending) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (result?.success) return <Check className="w-4 h-4" />;
    return <WhatsAppLogo className="w-4 h-4" />;
  };

  const modal = showModal && createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in"
      style={{ background: 'rgba(0,0,0,0.65)' }}
      onClick={() => !sending && setShowModal(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="surface rounded-xl w-full max-w-lg p-5 space-y-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'var(--whatsapp)' }}
            >
              <WhatsAppLogo className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold tracking-tight">Send WhatsApp message</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                Confirm before sending
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => !sending && setShowModal(false)}
            disabled={sending}
            aria-label="Close"
            className="w-8 h-8 rounded-md btn-ghost flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Recipient */}
        <div className="surface-elevated rounded-lg px-4 py-3 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--text-muted)' }}>To</span>
            <span className="font-medium truncate ml-3 text-right">{businessName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Phone</span>
            <span className="font-mono text-[13px]">{phoneDisplay}</span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Category</span>
            <span style={{ color: 'var(--primary)' }} className="font-medium">{category}</span>
          </div>
        </div>

        {/* Message preview / edit */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              Message
            </p>
            {!editingMessage ? (
              <button
                type="button"
                onClick={() => setEditingMessage(true)}
                disabled={sending || result?.success}
                className="flex items-center gap-1.5 text-[11px] font-medium hover:text-white transition-colors disabled:opacity-40"
                style={{ color: 'var(--text-muted)' }}
              >
                <Edit3 className="w-3 h-3" />
                Edit
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setMessage(defaultMessage); setEditingMessage(false); }}
                className="flex items-center gap-1.5 text-[11px] font-medium hover:text-white transition-colors"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="w-3 h-3" />
                Reset
              </button>
            )}
          </div>

          {editingMessage ? (
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="input w-full px-3 py-2.5 text-sm resize-none leading-relaxed"
            />
          ) : (
            <div className="surface-elevated rounded-lg px-4 py-3 max-h-64 overflow-auto">
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                {message}
              </p>
            </div>
          )}

          <p className="text-[11px] mt-2 italic" style={{ color: 'var(--text-muted)' }}>
            A category-matching sample image will be attached automatically.
          </p>
        </div>

        {/* Result */}
        {result && !result.success && (
          <div className="flex items-start gap-3 rounded-lg p-3" style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--danger)' }} />
            <div className="text-sm">
              <p className="font-medium" style={{ color: 'var(--danger)' }}>{result.errorMessage || 'Send failed'}</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(248, 113, 113, 0.70)' }}>
                Try "Open manually" to send via WhatsApp Web instead.
              </p>
            </div>
          </div>
        )}
        {result?.success && (
          <div className="flex items-center gap-3 rounded-lg p-3" style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <Check className="w-4 h-4 shrink-0" style={{ color: 'var(--success)' }} />
            <p className="text-sm font-medium" style={{ color: 'var(--success)' }}>
              Message sent
              {result.imageSent === false && (
                <span className="font-normal" style={{ color: 'rgba(16,185,129,0.7)' }}>
                  {' '}(text only — image step failed)
                </span>
              )}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleManual}
            disabled={sending}
            className="btn-ghost h-10 rounded-md text-sm font-medium flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Open manually
          </button>
          <button
            type="button"
            onClick={handleSendApi}
            disabled={sending || result?.success || !message.trim()}
            className="btn-whatsapp h-10 rounded-md text-sm font-medium flex items-center justify-center gap-2"
          >
            {sending ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Sending…</>
            ) : result?.success ? (
              <><Check className="w-4 h-4" />Sent</>
            ) : (
              <><Send className="w-4 h-4" />Send</>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );

  // Variant: icon-only (compact for table view etc.)
  if (variant === 'icon') {
    return (
      <>
        <button
          type="button"
          onClick={handleOpen}
          disabled={disabled || sending}
          aria-label="Send WhatsApp message"
          title="Send WhatsApp message"
          className="btn-whatsapp w-9 h-9 rounded-md flex items-center justify-center"
        >
          {triggerIcon()}
        </button>
        {modal}
      </>
    );
  }

  // Default: full button with logo + label
  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled || sending}
        aria-label="Send WhatsApp message"
        title="Send WhatsApp message"
        className="btn-whatsapp h-10 px-3.5 rounded-md flex items-center justify-center gap-2 text-sm font-medium flex-1 min-w-0"
      >
        {triggerIcon()}
        <span className="truncate">
          {sending ? 'Sending…' : result?.success ? 'Sent' : 'WhatsApp'}
        </span>
      </button>
      {modal}
    </>
  );
};

export default WhatsAppSendButton;
