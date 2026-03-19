'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { useServices } from '@/app/hooks/useServices';
import { useUpload } from '@/app/hooks/useUpload';
import { usePayment } from '@/app/hooks/usePayment';
import { orderApi } from '@/app/api';
import { ServiceCard } from '@/app/components/ui/ServiceCard';
import { PaymentSummary } from '@/app/components/ui/PaymentSummary';
import { FileUploadField } from '@/app/components/ui/FileUploadField';
import type { Service, Order, OrderBrief, PaymentType, OrderFile, FileCategory } from '@/types';

// ─── Step indicator ───────────────────────────────────────────────────────────
const STEPS = ['Select Service', 'Fill Brief', 'Upload Files', 'Payment'];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((label, idx) => (
        <div key={label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={[
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold transition-colors',
              idx < current  ? 'bg-orange-500 text-white' :
              idx === current ? 'bg-orange-500 text-white ring-4 ring-orange-100' :
                               'bg-gray-100 text-gray-400',
            ].join(' ')}>
              {idx < current ? <Check size={14} /> : idx + 1}
            </div>
            <span className={`text-[10px] mt-1 font-semibold whitespace-nowrap ${
              idx === current ? 'text-orange-600' : 'text-gray-400'
            }`}>
              {label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`w-12 sm:w-20 h-0.5 mb-4 mx-1 ${idx < current ? 'bg-orange-300' : 'bg-gray-100'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Brief forms per service ──────────────────────────────────────────────────
function AiAvatarForm({ value, onChange }: { value: Record<string, string>; onChange: (v: Record<string, string>) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Script *</label>
        <textarea
          value={value.script ?? ''}
          onChange={(e) => onChange({ ...value, script: e.target.value })}
          placeholder="Write the script for your AI avatar video..."
          rows={5}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
        />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tone</label>
          <select
            value={value.tone ?? 'professional'}
            onChange={(e) => onChange({ ...value, tone: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="energetic">Energetic</option>
            <option value="calm">Calm</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Language</label>
          <select
            value={value.language ?? 'en'}
            onChange={(e) => onChange({ ...value, language: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="te">Telugu</option>
            <option value="ta">Tamil</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function PhotoShootForm({ value, onChange }: { value: Record<string, string>; onChange: (v: Record<string, string>) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Name *</label>
        <input
          type="text"
          value={value.product_name ?? ''}
          onChange={(e) => onChange({ ...value, product_name: e.target.value })}
          placeholder="e.g. Premium Wireless Earbuds"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Number of Photos *
          <span className="ml-2 text-orange-500 font-bold">
            ₹{(parseInt(value.shot_count || '1') * 2000).toLocaleString('en-IN')} total
          </span>
        </label>
        <input
          type="number"
          min="1"
          max="100"
          value={value.shot_count ?? '1'}
          onChange={(e) => onChange({ ...value, shot_count: e.target.value })}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <p className="text-[11px] text-gray-400 mt-1">₹2,000 per photo</p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Shot Instructions</label>
        <textarea
          value={value.instructions ?? ''}
          onChange={(e) => onChange({ ...value, instructions: e.target.value })}
          placeholder="Describe the shots you need (angles, backgrounds, etc.)..."
          rows={3}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
        />
      </div>
    </div>
  );
}

function VideoShootForm({ value, onChange }: { value: Record<string, string>; onChange: (v: Record<string, string>) => void }) {
  const videoType  = value.video_type  || 'professional';
  const videoCount = parseInt(value.video_count || '1');
  const lengthMin  = parseFloat(value.length_min || '1');
  const basePrice  = videoType === 'professional' ? 5000 : 3000;
  const lengthFactor = lengthMin > 2 ? 1.5 : 1.0;
  const total      = Math.round(videoCount * basePrice * lengthFactor);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Video Type *</label>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { value: 'professional', label: 'Professional', price: '₹5,000/video', desc: 'High production cinematic video' },
            { value: 'storytelling', label: 'Storytelling',  price: '₹3,000/video', desc: 'Narrative-driven brand story' },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange({ ...value, video_type: opt.value })}
              className={[
                'text-left p-4 rounded-xl border-2 transition-all',
                videoType === opt.value
                  ? 'border-orange-400 bg-orange-50'
                  : 'border-gray-100 hover:border-gray-200',
              ].join(' ')}
            >
              <p className="text-sm font-bold text-gray-800">{opt.label}</p>
              <p className="text-xs font-extrabold text-orange-500">{opt.price}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Number of Videos *
            <span className="ml-2 text-orange-500 font-bold">₹{total.toLocaleString('en-IN')} total</span>
          </label>
          <input
            type="number" min="1" max="20"
            value={value.video_count ?? '1'}
            onChange={(e) => onChange({ ...value, video_count: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">
            Video Length (minutes)
            {lengthMin > 2 && <span className="ml-2 text-[10px] font-bold text-orange-400">+50% surcharge</span>}
          </label>
          <input
            type="number" min="0.5" max="10" step="0.5"
            value={value.length_min ?? '1'}
            onChange={(e) => onChange({ ...value, length_min: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Script / Storyboard</label>
        <textarea
          value={value.script ?? ''}
          onChange={(e) => onChange({ ...value, script: e.target.value })}
          placeholder="Describe the video concept or paste your script..."
          rows={3}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
        />
      </div>
    </div>
  );
}

function UgcAdForm({ value, onChange }: { value: Record<string, string>; onChange: (v: Record<string, string>) => void }) {
  const adCount = parseInt(value.ad_count || '1');
  const total   = adCount * 2500;
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Product Name *</label>
        <input
          type="text"
          value={value.product_name ?? ''}
          onChange={(e) => onChange({ ...value, product_name: e.target.value })}
          placeholder="e.g. Organic Face Serum"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">
          Number of Ads *
          <span className="ml-2 text-orange-500 font-bold">₹{total.toLocaleString('en-IN')} total</span>
        </label>
        <input
          type="number" min="1" max="50"
          value={value.ad_count ?? '1'}
          onChange={(e) => onChange({ ...value, ad_count: e.target.value })}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <p className="text-[11px] text-gray-400 mt-1">₹2,500 per ad</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Target Platform</label>
          <select
            value={value.platform ?? 'instagram'}
            onChange={(e) => onChange({ ...value, platform: e.target.value })}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="youtube">YouTube Shorts</option>
            <option value="tiktok">TikTok</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Call to Action</label>
          <input
            type="text"
            value={value.cta ?? ''}
            onChange={(e) => onChange({ ...value, cta: e.target.value })}
            placeholder="e.g. Shop Now, Learn More"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Script / Ad Brief</label>
        <textarea
          value={value.script ?? ''}
          onChange={(e) => onChange({ ...value, script: e.target.value })}
          placeholder="Describe the ad concept or paste your script..."
          rows={3}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
        />
      </div>
    </div>
  );
}

// ─── File upload step ─────────────────────────────────────────────────────────
function UploadStep({ order, onDone }: { order: Order; onDone: () => void }) {
  const upload1 = useUpload(order.id);
  const upload2 = useUpload(order.id);
  const [files, setFiles] = useState<Record<string, OrderFile>>({});

  const uploadFields: { key: string; label: string; category: FileCategory; accept: string; desc: string; required: boolean }[] =
    order.service_type === 'ai_avatar_video' ? [
      { key: 'voice',  label: 'Voice Sample *', category: 'voice_sample', accept: '.mp3,.wav,.m4a', desc: 'A 30–60 sec audio clip of your natural speaking voice.', required: true },
      { key: 'video',  label: 'Video Sample',   category: 'video_sample', accept: '.mp4,.mov',      desc: 'Optional: a reference video for avatar style.', required: false },
    ] : [
      { key: 'asset',  label: 'Product Photos / References *', category: 'raw_asset', accept: '.jpg,.jpeg,.png,.webp', desc: 'Upload your product images or reference photos.', required: true },
    ];

  const canProceed = uploadFields.filter((f) => f.required).every((f) => files[f.key]);

  return (
    <div className="space-y-5">
      {uploadFields.map((field, idx) => {
        const uploader = idx === 0 ? upload1 : upload2;
        return (
          <FileUploadField
            key={field.key}
            orderId={order.id}
            category={field.category}
            label={field.label}
            accept={field.accept}
            description={field.desc}
            onUploaded={(f) => setFiles((prev) => ({ ...prev, [field.key]: f }))}
            onUpload={uploader.upload}
            uploadState={uploader.state}
            progress={uploader.progress}
            speedBps={uploader.stats.speedBps}
            etaSec={uploader.stats.etaSec}
            error={uploader.error}
          />
        );
      })}
      <div className="flex items-center justify-between pt-2">
        <p className="text-[12px] text-gray-400">
          {canProceed ? 'Required files uploaded. You can proceed.' : 'Upload required files to continue.'}
        </p>
        <button
          type="button"
          onClick={onDone}
          disabled={!canProceed}
          className={[
            'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
            canProceed
              ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-200'
              : 'bg-gray-100 text-gray-300 cursor-not-allowed',
          ].join(' ')}
        >
          Continue <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Main wizard ──────────────────────────────────────────────────────────────
function NewOrderWizard() {
  const router       = useRouter();
  const params       = useSearchParams();
  const preselected  = params.get('service');

  const { services, loading: servicesLoading } = useServices();
  const { payWithRazorpay, loading: payLoading } = usePayment();

  const [step,          setStep]          = useState(preselected ? 1 : 0);
  const [selectedSvc,   setSelectedSvc]   = useState<Service | null>(null);
  const [briefData,     setBriefData]     = useState<Record<string, string>>({});
  const [clientNotes,   setClientNotes]   = useState('');
  const [createdOrder,  setCreatedOrder]  = useState<Order | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [paymentType,   setPaymentType]   = useState<PaymentType>('advance');

  // Auto-select service from URL param
  useEffect(() => {
    if (preselected && services.length > 0) {
      const svc = services.find((s) => s.id === preselected);
      if (svc) { setSelectedSvc(svc); setStep(1); }
    }
  }, [preselected, services]);

  const handleCreateOrder = async () => {
    if (!selectedSvc) return;
    setCreatingOrder(true);
    try {
      const { order } = await orderApi.create({
        service_id:   selectedSvc.id,
        brief:        briefData as unknown as OrderBrief,
        client_notes: clientNotes || undefined,
      });
      setCreatedOrder(order);
      setStep(2);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create order.');
    } finally {
      setCreatingOrder(false);
    }
  };

  const handlePay = async () => {
    if (!createdOrder) return;
    try {
      await payWithRazorpay(createdOrder.id, paymentType, {
        name:        'AI Agentic Verse',
        description: `${createdOrder.service_name} — ${createdOrder.order_number}`,
      });
      toast.success('Payment successful! Your order is confirmed.');
      router.push(`/order/${createdOrder.id}`);
    } catch (e) {
      if (e instanceof Error && e.message !== 'Payment cancelled.') {
        toast.error(e.message);
      }
    }
  };

  const validateBrief = () => {
    if (!selectedSvc) return false;
    const t = selectedSvc.service_type;
    if (t === 'ai_avatar_video')     return !!briefData.script?.trim();
    if (t === 'product_photo_shoot') return !!briefData.product_name?.trim() && parseInt(briefData.shot_count || '0') > 0;
    if (t === 'product_video_shoot') return !!briefData.video_type && parseInt(briefData.video_count || '0') > 0;
    if (t === 'ai_ugc_ad_creator')   return !!briefData.product_name?.trim() && parseInt(briefData.ad_count || '0') > 0;
    return false;
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => step > 0 ? setStep(step - 1) : router.push('/services')}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-[1.2rem] font-extrabold text-gray-900">New Order</h1>
          <p className="text-[12px] text-gray-400">
            {selectedSvc ? selectedSvc.display_name : 'Select a service to get started'}
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <StepIndicator current={step} />

      {/* Step 0 — Service selection */}
      {step === 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-600 mb-4">Choose a service:</p>
          {servicesLoading ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 animate-pulse h-40" />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {services.map((svc) => (
                <ServiceCard
                  key={svc.id}
                  service={svc}
                  selected={selectedSvc?.id === svc.id}
                  onClick={() => { setSelectedSvc(svc); setStep(1); setBriefData({}); }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 1 — Brief form */}
      {step === 1 && selectedSvc && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-5">
          <h2 className="font-extrabold text-gray-900">Project Brief</h2>
          <p className="text-[13px] text-gray-400 -mt-2">
            Tell us about your project so we can deliver exactly what you need.
          </p>

          {selectedSvc.service_type === 'ai_avatar_video'     && <AiAvatarForm   value={briefData} onChange={setBriefData} />}
          {selectedSvc.service_type === 'product_photo_shoot' && <PhotoShootForm  value={briefData} onChange={setBriefData} />}
          {selectedSvc.service_type === 'product_video_shoot' && <VideoShootForm  value={briefData} onChange={setBriefData} />}
          {selectedSvc.service_type === 'ai_ugc_ad_creator'   && <UgcAdForm       value={briefData} onChange={setBriefData} />}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Additional Notes</label>
            <textarea
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              placeholder="Anything else we should know..."
              rows={2}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleCreateOrder}
              disabled={!validateBrief() || creatingOrder}
              className={[
                'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all',
                validateBrief() && !creatingOrder
                  ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-200'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed',
              ].join(' ')}
            >
              {creatingOrder ? <Loader2 size={14} className="animate-spin" /> : null}
              {creatingOrder ? 'Creating Order...' : 'Continue'}
              {!creatingOrder && <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* Step 2 — File uploads */}
      {step === 2 && createdOrder && (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 space-y-4">
          <h2 className="font-extrabold text-gray-900">Upload Assets</h2>
          <p className="text-[13px] text-gray-400 -mt-2">
            Upload the files we need to get started on your project.
          </p>
          <UploadStep order={createdOrder} onDone={() => setStep(3)} />
        </div>
      )}

      {/* Step 3 — Payment */}
      {step === 3 && createdOrder && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="font-extrabold text-gray-900 mb-1">Review & Pay</h2>
            <p className="text-[13px] text-gray-400 mb-4">
              Order <span className="font-bold text-gray-700">{createdOrder.order_number}</span> — ready for payment.
            </p>
            <PaymentSummary
              order={createdOrder}
              selectedPaymentType={paymentType}
              onSelect={setPaymentType}
            />
          </div>

          <button
            type="button"
            onClick={handlePay}
            disabled={payLoading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-extrabold rounded-xl transition-all shadow-lg shadow-orange-200"
          >
            {payLoading ? (
              <><Loader2 size={16} className="animate-spin" /> Processing...</>
            ) : (
              <>Pay ₹{(paymentType === 'advance' ? createdOrder.advance_amount : createdOrder.final_price_inr).toLocaleString('en-IN')} via Razorpay</>
            )}
          </button>

          <p className="text-center text-[11px] text-gray-400">
            Secured by Razorpay · 256-bit SSL encryption
          </p>
        </div>
      )}
    </div>
  );
}

export default function NewOrderPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-9 h-9 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <NewOrderWizard />
    </Suspense>
  );
}
