"use client";

import { useState, useTransition } from "react";

interface Props {
  onSubmit: (data: ClientData) => void;
  isSubmitting?: boolean;
}

export type ClientData = {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientIdNumber: string;
  agreedToTerms: boolean;
};

export function ClientDetailsStep({ onSubmit, isSubmitting }: Props) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [agreed, setAgreed] = useState(false);

  const isValid = name.trim().length >= 2 && phone.trim().length >= 9 && agreed;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    onSubmit({
      clientName: name,
      clientPhone: phone,
      clientEmail: email,
      clientIdNumber: idNumber,
      agreedToTerms: agreed,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-2xl font-bold text-white">Your Details</h2>
      <p className="text-sm text-white/50">
        We'll send your booking confirmation and magic tracking link to these contacts.
      </p>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-white/60 uppercase tracking-wide">
          Full Name *
        </span>
        <input
          type="text"
          required
          placeholder="As on your ID / Passport"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-white/60 uppercase tracking-wide">
          Phone Number *
        </span>
        <input
          type="tel"
          required
          placeholder="+254 7XX XXX XXX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="input-field"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-white/60 uppercase tracking-wide">
          Email Address
        </span>
        <input
          type="email"
          placeholder="optional — for receipt"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-white/60 uppercase tracking-wide">
          ID / Passport Number
        </span>
        <input
          type="text"
          placeholder="National ID or Passport No."
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          className="input-field"
        />
      </label>

      <label className="flex items-start gap-3 cursor-pointer mt-2">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-white/30 bg-white/10 text-amber-400 focus:ring-amber-400/50"
        />
        <span className="text-sm text-white/60 leading-relaxed">
          I agree to CT Drive'{" "}
          <a href="/terms" className="text-amber-400 hover:underline" target="_blank">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-amber-400 hover:underline" target="_blank">
            Privacy Policy
          </a>
          . I understand this platform facilitates third-party transport services.
        </span>
      </label>

      <button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <span className="h-4 w-4 animate-spin rounded border-2 border-white/30 border-t-white" />
            Confirming Booking…
          </>
        ) : (
          "Confirm Booking →"
        )}
      </button>
    </form>
  );
}
