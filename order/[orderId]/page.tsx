'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Download, RefreshCw, Loader2, FileText,
  Clock, CreditCard, CheckCircle2,
} from 'lucide-react';
import { useOrder } from '@/app/hooks/useOrder';
import { usePayment } from '@/app/hooks/usePayment';
import { uploadApi, orderApi } from '@/app/api';
import { StatusBadge } from '@/app/components/ui/StatusBadge';
import { StatusTimeline } from '@/app/components/ui/StatusTimeline';
import { PaymentSummary } from '@/app/components/ui/PaymentSummary';
import type { PaymentType } from '@/types';

function formatINR(n: number) {
  return `₹${Number(n).toLocaleString('en-IN')}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId }  = use(params);
  const router       = useRouter();
  const { order, loading, error, refetch } = useOrder(orderId);
  const { payWithRazorpay, loading: payLoading } = usePayment();

  const [paymentType,      setPaymentType]      = useState<PaymentType>('balance');
  const [downloadLoading,  setDownloadLoading]  = useState<Record<string, boolean>>({});
  const [cancelling,       setCancelling]       = useState(false);
  const [invoiceLoading,   setInvoiceLoading]   = useState(false);

  const handlePayBalance = async () => {
    if (!order) return;
    try {
      await payWithRazorpay(order.id, paymentType, {
        name:        'AI Agentic Verse',
        description: `${order.service_name} — ${order.order_number}`,
      });
      toast.success('Payment successful!');
      refetch();
    } catch (e) {
      if (e instanceof Error && e.message !== 'Payment cancelled.') {
        toast.error(e.message);
      }
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    setDownloadLoading((p) => ({ ...p, [fileId]: true }));
    try {
      await uploadApi.downloadFile(fileId, fileName);
    } catch {
      toast.error('Failed to get download link.');
    } finally {
      setDownloadLoading((p) => ({ ...p, [fileId]: false }));
    }
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;
    setInvoiceLoading(true);
    try {
      await orderApi.downloadInvoice(order.id, order.order_number);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to download invoice.');
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!order || !confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await orderApi.cancel(order.id, 'Cancelled by client.');
      toast.success('Order cancelled.');
      refetch();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-9 h-9 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !order) return (
    <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center">
      <p className="text-sm font-bold text-red-600">{error ?? 'Order not found.'}</p>
      <button onClick={() => router.push('/orders')} className="mt-3 text-sm text-orange-500 font-bold underline">
        Back to Orders
      </button>
    </div>
  );

  const deliverables  = (order.files ?? []).filter((f) => f.category === 'deliverable');
  const clientFiles   = (order.files ?? []).filter((f) => f.category !== 'deliverable');
  const capturedPaise = (order.payments ?? [])
    .filter((p) => p.status === 'captured')
    .reduce((s, p) => s + p.amount_paise, 0);
  const amountPaid    = capturedPaise / 100;

  const canPayBalance      = order.status === 'payment_partial' && order.balance_amount > 0;
  const canCancelOrder     = ['draft', 'pending_payment'].includes(order.status);
  const canDownloadInvoice = amountPaid > 0;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back + header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/orders')}
            aria-label="Back to Orders"
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[1.2rem] font-extrabold text-gray-900">{order.service_name}</h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-[12px] text-gray-400 mt-0.5">{order.order_number}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={refetch}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column — timeline + files */}
        <div className="lg:col-span-2 space-y-5">

          {/* Order timeline */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={16} className="text-orange-500" /> Order Progress
            </h2>
            <StatusTimeline
              currentStatus={order.status}
              history={order.status_history ?? []}
            />
          </div>

          {/* Deliverables */}
          {deliverables.length > 0 && (
            <div className="rounded-2xl border border-green-100 bg-green-50/50 p-6">
              <h2 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-green-500" /> Deliverables Ready
              </h2>
              <div className="space-y-2">
                {deliverables.map((f) => (
                  <div key={f.id} className="flex items-center justify-between bg-white rounded-xl border border-green-100 p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText size={16} className="text-green-500 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-700 truncate">{f.file_name}</p>
                        {f.file_size_bytes && (
                          <p className="text-[11px] text-gray-400">{formatBytes(f.file_size_bytes)}</p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownload(f.id, f.file_name)}
                      disabled={downloadLoading[f.id]}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-colors shrink-0"
                    >
                      {downloadLoading[f.id]
                        ? <Loader2 size={12} className="animate-spin" />
                        : <Download size={12} />}
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Uploaded assets */}
          {clientFiles.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-6">
              <h2 className="font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={16} className="text-gray-400" /> Your Uploads
              </h2>
              <div className="space-y-2">
                {clientFiles.map((f) => (
                  <div key={f.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText size={14} className="text-gray-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-700 truncate">{f.file_name}</p>
                        <p className="text-[10px] text-gray-400 capitalize">{f.category.replace('_', ' ')}</p>
                      </div>
                    </div>
                    {f.file_size_bytes && (
                      <span className="text-[11px] text-gray-400 shrink-0">{formatBytes(f.file_size_bytes)}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Brief details */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="font-extrabold text-gray-900 mb-3">Project Brief</h2>
            <div className="space-y-2">
              {Object.entries(order.brief || {}).map(([key, val]) => (
                <div key={key} className="flex gap-3">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide w-24 shrink-0 pt-0.5">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <span className="text-sm text-gray-700 whitespace-pre-wrap flex-1">{String(val)}</span>
                </div>
              ))}
              {order.client_notes && (
                <div className="flex gap-3 pt-2 border-t border-gray-50">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide w-24 shrink-0 pt-0.5">Notes</span>
                  <span className="text-sm text-gray-700">{order.client_notes}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column — pricing + payment */}
        <div className="space-y-5">

          {/* Price card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 space-y-3">
            <h3 className="font-extrabold text-gray-900 text-sm">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-gray-900">{formatINR(order.final_price_inr)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Paid</span>
                <span className="font-bold text-green-600">{formatINR(amountPaid)}</span>
              </div>
              {amountPaid < order.final_price_inr && (
                <div className="flex justify-between border-t border-orange-100 pt-2">
                  <span className="text-gray-500">Remaining</span>
                  <span className="font-extrabold text-orange-600">
                    {formatINR(order.final_price_inr - amountPaid)}
                  </span>
                </div>
              )}
            </div>
            {order.expected_delivery_at && (
              <div className="pt-2 border-t border-gray-50">
                <p className="text-[11px] text-gray-400">Expected delivery</p>
                <p className="text-xs font-bold text-gray-700 mt-0.5">
                  {formatDate(order.expected_delivery_at)}
                </p>
              </div>
            )}
          </div>

          {/* Pay balance */}
          {canPayBalance && (
            <div className="rounded-2xl border border-orange-100 bg-white p-5 space-y-3">
              <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
                <CreditCard size={14} className="text-orange-500" /> Pay Remaining Balance
              </h3>
              <PaymentSummary
                order={order}
                selectedPaymentType={paymentType}
                onSelect={setPaymentType}
              />
              <button
                type="button"
                onClick={handlePayBalance}
                disabled={payLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-orange-200"
              >
                {payLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                Pay {formatINR(order.balance_amount)}
              </button>
            </div>
          )}

          {/* Payment history */}
          {(order.payments ?? []).length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <h3 className="font-extrabold text-gray-900 text-sm mb-3">Payment History</h3>
              <div className="space-y-2">
                {(order.payments ?? []).map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-semibold text-gray-700 capitalize">{p.payment_type}</p>
                      {p.paid_at && (
                        <p className="text-[10px] text-gray-400">{formatDate(p.paid_at)}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatINR(p.amount_paise / 100)}</p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        p.status === 'captured' ? 'bg-green-50 text-green-600' :
                        p.status === 'failed'   ? 'bg-red-50 text-red-500' :
                                                  'bg-gray-50 text-gray-400'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Download Invoice */}
          {canDownloadInvoice && (
            <button
              type="button"
              onClick={handleDownloadInvoice}
              disabled={invoiceLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-bold rounded-xl transition-colors border border-gray-200 shadow-sm"
            >
              {invoiceLoading
                ? <Loader2 size={14} className="animate-spin" />
                : <FileText size={14} className="text-orange-500" />}
              {invoiceLoading ? 'Generating...' : 'Download Invoice'}
            </button>
          )}

          {/* Cancel button */}
          {canCancelOrder && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelling}
              className="w-full text-sm font-semibold text-red-400 hover:text-red-500 hover:bg-red-50 py-2.5 rounded-xl transition-colors border border-gray-100"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
