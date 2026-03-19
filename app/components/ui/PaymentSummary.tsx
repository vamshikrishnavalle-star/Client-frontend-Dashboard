'use client';

import type { Order, PaymentType } from '@/types';

interface Props {
  order:               Order;
  selectedPaymentType: PaymentType;
  onSelect?:           (type: PaymentType) => void;
}

function formatINR(n: number) {
  return `₹${Number(n).toLocaleString('en-IN')}`;
}

function Row({
  label, value, bold, orange, small,
}: {
  label: string; value: string; bold?: boolean; orange?: boolean; small?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`${small ? 'text-[11px]' : 'text-sm'} text-gray-500`}>{label}</span>
      <span className={[
        small ? 'text-[11px]' : 'text-sm',
        bold ? 'font-extrabold' : 'font-semibold',
        orange ? 'text-orange-600' : 'text-gray-900',
      ].join(' ')}>
        {value}
      </span>
    </div>
  );
}

export function PaymentSummary({ order, selectedPaymentType, onSelect }: Props) {
  const dueNow =
    selectedPaymentType === 'advance' ? order.advance_amount :
    selectedPaymentType === 'balance' ? order.balance_amount :
    order.final_price_inr;

  const options: { type: PaymentType; label: string; amount: number; desc: string }[] = [
    {
      type:   'advance',
      label:  `Pay Advance (${order.advance_percent}%)`,
      amount: order.advance_amount,
      desc:   'Start work now, pay balance on delivery.',
    },
    {
      type:   'full',
      label:  'Pay in Full',
      amount: order.final_price_inr,
      desc:   'Complete payment — work starts immediately.',
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-4">
      <h3 className="font-extrabold text-gray-900 text-sm">Payment Summary</h3>

      {/* Price breakdown */}
      <div className="space-y-2">
        <Row label="Service Price" value={formatINR(order.base_price_inr)} />
        {order.discount_inr > 0 && (
          <Row label="Discount Applied" value={`−${formatINR(order.discount_inr)}`} />
        )}
        <Row label="Total" value={formatINR(order.final_price_inr)} bold />
        <div className="border-t border-gray-50 pt-2 space-y-1.5">
          <Row label={`Advance (${order.advance_percent}%)`} value={formatINR(order.advance_amount)} small />
          <Row label="Balance (on delivery)" value={formatINR(order.balance_amount)} small />
        </div>
      </div>

      {/* Payment options */}
      {onSelect && (
        <div className="space-y-2 pt-1">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Choose Payment</p>
          {options.map((opt) => (
            <button
              key={opt.type}
              type="button"
              onClick={() => onSelect(opt.type)}
              className={[
                'w-full text-left rounded-xl border p-3 transition-all',
                selectedPaymentType === opt.type
                  ? 'border-orange-400 bg-orange-50 ring-1 ring-orange-300'
                  : 'border-gray-100 hover:border-gray-200',
              ].join(' ')}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">{opt.label}</span>
                <span className={`text-sm font-extrabold ${
                  selectedPaymentType === opt.type ? 'text-orange-600' : 'text-gray-900'
                }`}>
                  {formatINR(opt.amount)}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      )}

      {/* Due now highlight */}
      <div className="border-t border-orange-100 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-700">Due Now</span>
          <span className="text-lg font-extrabold text-orange-600">{formatINR(dueNow)}</span>
        </div>
      </div>
    </div>
  );
}
