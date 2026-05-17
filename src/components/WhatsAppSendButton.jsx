import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { MessageCircle, Loader2, Check, X, ExternalLink, Send, AlertCircle, Edit3 } from 'lucide-react';
import {
  handleWhatsAppCommunication,
  openWhatsAppManually,
  buildOutreachMessage,
  formatPhoneForDisplay
} from '../utils/leadUtils';

const WhatsAppSendButton = ({ phone, businessName, category, onSent, disabled = false }) => {
  const [showModal, setShowModal] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [editingMessage, setEditingMessage] = useState(false);
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const defaultMessage = buildOutreachMessage(businessName);
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
  }, [editingMessage]);

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

  const buttonIcon = () => {
    if (sending) return <Loader2 className="w-5 h-5 animate-spin" />;
    if (result?.success) return <Check className="w-5 h-5" />;
    return <MessageCircle className="w-5 h-5" />;
  };

  const modal = showModal && createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={() => !sending && setShowModal(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="glass-card max-w-lg w-full p-6 space-y-5 border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">Send WhatsApp Message</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Confirm before sending</p>
          </div>
          <button
            type="button"
            onClick={() => !sending && setShowModal(false)}
            disabled={sending}
            aria-label="Close"
            className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 flex items-center justify-center border border-white/5 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Recipient details */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-bold">To</span>
            <span className="font-bold text-white truncate ml-3 text-right">{businessName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-bold">Phone</span>
            <span className="font-mono text-white text-sm">{phoneDisplay}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-bold">Category</span>
            <span className="font-bold text-blue-400">{category}</span>
          </div>
        </div>

        {/* Message preview / edit */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Message</p>
            {!editingMessage ? (
              <button
                type="button"
                onClick={() => setEditingMessage(true)}
                disabled={sending || result?.success}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-400 transition-colors disabled:opacity-40"
              >
                <Edit3 className="w-3 h-3" />
                Edit
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setMessage(defaultMessage); setEditingMessage(false); }}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-400 transition-colors"
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
              rows={5}
              className="w-full bg-slate-900 rounded-xl px-3 py-2.5 text-sm text-white outline-none border border-white/10 focus:border-blue-500/40 resize-none leading-relaxed"
            />
          ) : (
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{message}</p>
          )}

          <p className="text-[10px] font-bold text-slate-600 mt-3 italic">
            A category-matching sample image will be attached automatically.
          </p>
        </div>

        {/* Result feedback */}
        {result && !result.success && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="text-red-400 font-bold">{result.errorMessage || 'Send failed'}</p>
              <p className="text-red-400/70 text-xs mt-1">Try "Open manually" to send via WhatsApp Web instead.</p>
            </div>
          </div>
        )}
        {result?.success && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-3">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <p className="text-sm text-emerald-300 font-bold">
              Message sent
              {result.imageSent === false && (
                <span className="text-emerald-400/70 font-normal"> (text only — image step failed)</span>
              )}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={handleManual}
            disabled={sending}
            className="h-12 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-white/10 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Open manually
          </button>
          <button
            type="button"
            onClick={handleSendApi}
            disabled={sending || result?.success || !message.trim()}
            className="h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl border border-emerald-500/30 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {sending ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Sending...</>
            ) : result?.success ? (
              <><Check className="w-4 h-4" />Sent</>
            ) : (
              <><Send className="w-4 h-4" />Send via API</>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled || sending}
        aria-label="Send WhatsApp message"
        title="Send WhatsApp message"
        className={`h-14 w-full text-white rounded-2xl transition-all border-2 active:scale-95 flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed ${
          result?.success
            ? 'bg-emerald-500 border-emerald-400/40'
            : 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500/30'
        }`}
      >
        {buttonIcon()}
      </button>
      {modal}
    </>
  );
};

export default WhatsAppSendButton;
