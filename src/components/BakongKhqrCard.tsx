'use client';

import { useEffect, useState } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

type PaymentState = 'pending' | 'paid' | 'error' | 'expired';

interface BakongKhqrCardProps {
  amountText: string;
  merchantName: string;
  qrCode: string;
  language?: 'km' | 'en';
  paymentStatus: PaymentState;
  paymentMessage?: string;
  expiresAt?: string | null;
  orderNumber?: string | null;
  busy?: boolean;
  onRefreshQr?: () => void;
  title?: string;
  subtitle?: string;
  refreshQrLabel: string;
  countdownLabel: string;
}

const KHQR_HEADER_LOGO_SRC = '/images/seasonal/logo/KHQR%20Logo.png';
const BAKONG_CIRCLE_LOGO_SRC = 'https://bakong.nbc.gov.kh/images/favicon.png';

const getCountdownText = (expiresAt?: string | null) => {
  if (!expiresAt) {
    return { text: '--:--', expired: false };
  }

  const remainingMs = new Date(expiresAt).getTime() - Date.now();
  if (remainingMs <= 0) {
    return { text: '00:00', expired: true };
  }

  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return {
    text: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    expired: false
  };
};

export default function BakongKhqrCard({
  amountText,
  merchantName,
  qrCode,
  language = 'en',
  paymentStatus,
  paymentMessage,
  expiresAt,
  orderNumber,
  busy = false,
  onRefreshQr,
  title,
  subtitle,
  refreshQrLabel,
  countdownLabel,
}: BakongKhqrCardProps) {
  const [countdown, setCountdown] = useState(() => getCountdownText(expiresAt));
  const [showPaidModal, setShowPaidModal] = useState(false);

  useEffect(() => {
    setCountdown(getCountdownText(expiresAt));

    if (!expiresAt) {
      return;
    }

    const timer = window.setInterval(() => {
      setCountdown(getCountdownText(expiresAt));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [expiresAt]);

  useEffect(() => {
    if (paymentStatus === 'paid') {
      setShowPaidModal(true);
    }
  }, [paymentStatus]);

  const isPaid = paymentStatus === 'paid';
  const isExpired = !isPaid && (paymentStatus === 'expired' || countdown.expired);
  const showRefresh = Boolean(onRefreshQr) && isExpired;
  const textClass = language === 'km' ? 'khmer-text' : 'english-text';
  const loadingLabel = language === 'km' ? 'កំពុងដំណើរការ...' : 'Loading...';
  const successHeading = language === 'km' ? 'បានទូទាត់ជោគជ័យ' : 'Payment confirmed';
  const successBody = paymentMessage || (language === 'km'
    ? 'ប្រតិបត្តិការបង់ប្រាក់ត្រូវបានបញ្ចាក់រួចរាល់។'
    : 'Your payment has been verified successfully.');
  const closeLabel = language === 'km' ? 'បិទ' : 'Close';

  return (
    <>
      {showPaidModal ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/35" onClick={() => setShowPaidModal(false)} />
          <div className="relative w-full max-w-[340px] rounded-[30px] bg-white p-6 text-center shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircleIcon className="h-10 w-10 text-emerald-600" />
            </div>
            <p className={`${textClass} mt-4 text-xl font-semibold text-neutral-950`}>
              {successHeading}
            </p>
            <p className={`${textClass} mt-2 text-sm leading-6 text-neutral-600`}>
              {successBody}
            </p>
            <button
              type="button"
              onClick={() => setShowPaidModal(false)}
              className={`mt-5 w-full rounded-full bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 ${textClass}`}
            >
              {closeLabel}
            </button>
          </div>
        </div>
      ) : null}

      <div className="mx-auto w-full max-w-[380px] rounded-[34px] bg-[#f3f4f6] p-2 shadow-[0_28px_70px_rgba(0,0,0,0.18)]">
        <div className="overflow-hidden rounded-[30px]">
        <div className="flex h-[70px] items-center justify-center rounded-t-[30px] bg-[#E1232E] px-6">
          <img
            src={KHQR_HEADER_LOGO_SRC}
            alt="KHQR"
            className="h-8 w-auto object-contain"
          />
        </div>

        <div className="relative bg-white px-5 pb-4 pt-5 sm:px-6 sm:pb-5">
          <div
            aria-hidden="true"
            className="absolute right-0 top-0 h-[64px] w-[68px] bg-[#E1232E]"
            style={{ clipPath: 'polygon(100% 0, 100% 100%, 24% 0)' }}
          />

          <div className="relative z-10 text-center">
            {title ? (
              <p className={`${textClass} text-xs font-semibold uppercase tracking-[0.24em] text-neutral-500`}>{title}</p>
            ) : null}
            {subtitle ? (
              <p className={`${textClass} mt-1 text-sm text-neutral-500`}>{subtitle}</p>
            ) : null}

            <h2 className={`${textClass} ${title || subtitle ? 'mt-4' : 'mt-1'} text-[1.2rem] font-semibold text-black`}>{merchantName}</h2>
            <p className="english-text mt-2 text-[2rem] font-black leading-none tracking-tight text-black">{amountText}</p>

            {!isPaid ? (
              <div className="mt-4 flex items-center justify-center">
                <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold tabular-nums ${
                  isExpired ? 'bg-[#fff0f1] text-[#E1232E]' : 'bg-neutral-100 text-neutral-700'
                }`}>
                  <span className={textClass}>{countdownLabel}</span>
                  <span className="english-text">{countdown.text}</span>
                </div>
              </div>
            ) : null}

            <div className="mt-4 rounded-[26px] border border-neutral-200 bg-[#fafafa] px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              <div className="relative mx-auto aspect-square w-full max-w-[232px] rounded-[22px] bg-white p-2.5 shadow-[0_12px_28px_rgba(0,0,0,0.08)]">
                <img
                  src={qrCode}
                  alt="Bakong QR"
                  className="h-full w-full rounded-[18px] object-contain"
                />
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="h-9 w-9 overflow-hidden rounded-full bg-white p-1 shadow-[0_8px_18px_rgba(0,0,0,0.16)] ring-4 ring-white">
                    <img
                      src={BAKONG_CIRCLE_LOGO_SRC}
                      alt="Bakong"
                      className="h-full w-full rounded-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {!isPaid && paymentMessage ? (
              <p className={`${textClass} mt-4 text-sm ${
                isExpired ? 'text-[#E1232E]' : 'text-neutral-500'
              }`}>
                {paymentMessage}
              </p>
            ) : null}

            {showRefresh ? (
              <div className="mt-5">
                <button
                  type="button"
                  onClick={onRefreshQr}
                  disabled={busy}
                  className={`w-full rounded-full bg-[#E1232E] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#c81d27] disabled:cursor-not-allowed disabled:opacity-60 ${textClass}`}
                >
                  {busy ? loadingLabel : refreshQrLabel}
                </button>
              </div>
            ) : null}

            {orderNumber ? (
              <p className="english-text mt-4 text-xs tracking-[0.16em] text-neutral-400">{orderNumber}</p>
            ) : null}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
