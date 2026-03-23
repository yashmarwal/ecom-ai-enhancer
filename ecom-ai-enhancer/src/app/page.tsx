'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Sparkles, Copy, Check, Download, RefreshCw, ImageIcon, Camera, Users, Globe } from 'lucide-react';

interface AnalysisResult {
  caption: string;
  title: string;
  description: string;
  imagePrompts: {
    professional: string;
    modelTryOn: string;
    lifestyle: string;
  };
  productDetails: string;
}

interface GeneratedImages {
  professional: string;
  modelTryOn: string;
  lifestyle: string;
}

type Step = 'idle' | 'analyzing' | 'analyzed' | 'generating' | 'done' | 'error';

const IMAGE_TYPES = [
  {
    key: 'professional' as const,
    label: 'Studio Shot',
    sublabel: 'Professional product photography',
    icon: Camera,
    color: '#6c63ff',
  },
  {
    key: 'modelTryOn' as const,
    label: 'Model Try-On',
    sublabel: 'Fashion editorial style',
    icon: Users,
    color: '#ff6584',
  },
  {
    key: 'lifestyle' as const,
    label: 'Lifestyle',
    sublabel: 'Real-world aspirational use',
    icon: Globe,
    color: '#43e8b0',
  },
];

export default function HomePage() {
  const [step, setStep] = useState<Step>('idle');
  const [dragOver, setDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [images, setImages] = useState<GeneratedImages | null>(null);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<'title' | 'desc' | null>(null);
  const [statusMsg, setStatusMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WebP)');
      return;
    }
    setUploadedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setStep('idle');
    setAnalysis(null);
    setImages(null);
    setError('');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;
    setStep('analyzing');
    setError('');
    setStatusMsg('Analyzing your product with AI vision...');

    try {
      const formData = new FormData();
      formData.append('image', uploadedFile);

      const res = await fetch('/api/analyze', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Analysis failed');

      setAnalysis(data);
      setStep('analyzed');
      setStatusMsg('Analysis complete! Generating images...');

      // Auto-generate images
      await handleGenerateImages(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStep('error');
    }
  };

  const handleGenerateImages = async (analysisData: AnalysisResult) => {
    setStep('generating');
    setStatusMsg('Generating 3 product images — this takes ~30 seconds...');

    try {
      const res = await fetch('/api/generate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompts: analysisData.imagePrompts,
          productDetails: analysisData.productDetails,
        }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Image generation failed');

      setImages(data.images);
      setStep('done');
      setStatusMsg('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Image generation failed');
      setStep('error');
    }
  };

  const copy = async (text: string, type: 'title' | 'desc') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadImage = (dataUrl: string, name: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${name}.png`;
    a.click();
  };

  const reset = () => {
    setStep('idle');
    setUploadedFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    setImages(null);
    setError('');
    setStatusMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isLoading = step === 'analyzing' || step === 'generating';

  return (
    <div className="min-h-screen grid-bg relative">
      {/* Header */}
      <header className="border-b border-[#1a1f2e] bg-[#080a0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6c63ff] to-[#ff6584] flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
              Visual<span className="gradient-text">Commerce</span> AI
            </span>
          </div>
          <span className="tag-chip">Beta</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-14 fade-up">
          <div className="tag-chip inline-block mb-4">AI-Powered E-Commerce</div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            Turn any photo into a<br />
            <span className="gradient-text">complete product listing</span>
          </h1>
          <p className="text-[#8892a4] text-lg max-w-xl mx-auto">
            Upload your product image. Get an SEO title, description, and 3 professional AI-generated images — instantly.
          </p>
        </div>

        {/* Upload Zone */}
        {!previewUrl && (
          <div
            className={`upload-zone rounded-2xl p-16 text-center cursor-pointer transition-all duration-300 fade-up fade-up-delay-1 ${dragOver ? 'dragging' : ''}`}
            style={{ background: 'var(--surface)' }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 rounded-2xl bg-[#6c63ff]/10 border border-[#6c63ff]/20 flex items-center justify-center mx-auto mb-4">
              <Upload size={28} className="text-[#6c63ff]" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Drop your product photo here</h3>
            <p className="text-[#8892a4] text-sm mb-4">JPG, PNG, WebP — up to 10MB</p>
            <button className="btn-primary px-6 py-2.5 rounded-xl text-white font-medium text-sm relative z-10">
              Browse File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>
        )}

        {/* Preview + Analyze */}
        {previewUrl && step !== 'done' && (
          <div className="grid md:grid-cols-2 gap-8 fade-up">
            {/* Image Preview */}
            <div className="rounded-2xl overflow-hidden border border-[#1a1f2e]" style={{ background: 'var(--surface)' }}>
              <div className="p-4 border-b border-[#1a1f2e] flex items-center justify-between">
                <span className="text-sm font-medium text-[#8892a4]">Original Product</span>
                <button onClick={reset} className="text-xs text-[#8892a4] hover:text-white transition-colors flex items-center gap-1">
                  <RefreshCw size={12} /> Change
                </button>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Product preview" className="w-full object-contain max-h-80" style={{ background: '#f8f8f8' }} />
            </div>

            {/* Action Panel */}
            <div className="flex flex-col justify-center gap-6">
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Ready to enhance
                </h2>
                <p className="text-[#8892a4] text-sm leading-relaxed">
                  Our AI will analyze your product, generate an SEO-optimized title and description, then create 3 professional images — studio shot, model try-on, and lifestyle.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { icon: '🔍', text: 'AI vision analysis of your product' },
                  { icon: '✍️', text: 'SEO title & description (exact product)' },
                  { icon: '📸', text: '3 generated images (studio, model, lifestyle)' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-[#8892a4]">
                    <span>{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              {error && (
                <div className="rounded-xl p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  ⚠️ {error}
                </div>
              )}

              {isLoading ? (
                <div className="rounded-2xl p-6 border border-[#1a1f2e]" style={{ background: 'var(--surface2)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-4 h-4 rounded-full bg-[#6c63ff] animate-pulse" />
                    <span className="text-sm font-medium">{statusMsg}</span>
                  </div>
                  <div className="h-1 rounded-full bg-[#1a1f2e] overflow-hidden">
                    <div className="h-full progress-bar rounded-full" />
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="btn-primary w-full py-4 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2 relative"
                >
                  <Sparkles size={18} />
                  Analyze & Enhance Product
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {step === 'done' && analysis && (
          <div className="space-y-8">
            {/* Top bar */}
            <div className="flex items-center justify-between fade-up">
              <div>
                <h2 className="text-2xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Product Enhanced ✨</h2>
                <p className="text-[#8892a4] text-sm mt-1">Your SEO content and images are ready</p>
              </div>
              <button onClick={reset} className="flex items-center gap-2 text-sm text-[#8892a4] hover:text-white transition-colors border border-[#1a1f2e] rounded-xl px-4 py-2 hover:border-[#6c63ff]/40">
                <RefreshCw size={14} />
                New Product
              </button>
            </div>

            {/* Original + SEO side by side */}
            <div className="grid md:grid-cols-2 gap-6 fade-up fade-up-delay-1">
              {/* Original image */}
              <div className="rounded-2xl overflow-hidden border border-[#1a1f2e]" style={{ background: 'var(--surface)' }}>
                <div className="p-4 border-b border-[#1a1f2e]">
                  <span className="text-sm font-medium text-[#8892a4]">Original Upload</span>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl!} alt="Original" className="w-full object-contain max-h-64" style={{ background: '#f8f8f8' }} />
              </div>

              {/* SEO Content */}
              <div className="rounded-2xl border border-[#1a1f2e] flex flex-col" style={{ background: 'var(--surface)' }}>
                <div className="p-4 border-b border-[#1a1f2e]">
                  <span className="text-sm font-medium text-[#8892a4]">SEO Content</span>
                </div>
                <div className="p-5 space-y-5 flex-1">
                  {/* Title */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="tag-chip">Title</span>
                      <button
                        onClick={() => copy(analysis.title, 'title')}
                        className="flex items-center gap-1 text-xs text-[#8892a4] hover:text-[#6c63ff] transition-colors"
                      >
                        {copied === 'title' ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                        {copied === 'title' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-white font-semibold leading-snug">{analysis.title}</p>
                  </div>

                  <div className="border-t border-[#1a1f2e]" />

                  {/* Description */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="tag-chip">Description</span>
                      <button
                        onClick={() => copy(analysis.description, 'desc')}
                        className="flex items-center gap-1 text-xs text-[#8892a4] hover:text-[#6c63ff] transition-colors"
                      >
                        {copied === 'desc' ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                        {copied === 'desc' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-[#a0aec0] text-sm leading-relaxed">{analysis.description}</p>
                  </div>

                  <div className="border-t border-[#1a1f2e]" />

                  {/* Caption */}
                  <div>
                    <span className="tag-chip mb-2 inline-block">AI Caption</span>
                    <p className="text-[#8892a4] text-xs leading-relaxed italic">{analysis.caption}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Generated Images */}
            {images && (
              <div className="fade-up fade-up-delay-2">
                <div className="flex items-center gap-3 mb-6">
                  <ImageIcon size={18} className="text-[#6c63ff]" />
                  <h3 className="text-xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>AI-Generated Product Images</h3>
                  <span className="tag-chip">Exact Product Preserved</span>
                </div>
                <div className="grid md:grid-cols-3 gap-5">
                  {IMAGE_TYPES.map(({ key, label, sublabel, icon: Icon, color }) => (
                    <div
                      key={key}
                      className="rounded-2xl overflow-hidden border border-[#1a1f2e] card-hover group"
                      style={{ background: 'var(--surface)' }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={images[key]}
                        alt={label}
                        className="w-full aspect-square object-cover"
                      />
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Icon size={14} style={{ color }} />
                            <span className="font-semibold text-sm">{label}</span>
                          </div>
                          <button
                            onClick={() => downloadImage(images[key], `product-${key}`)}
                            className="p-1.5 rounded-lg bg-[#1a1f2e] hover:bg-[#6c63ff]/20 transition-colors"
                            title="Download"
                          >
                            <Download size={12} className="text-[#8892a4] hover:text-[#6c63ff]" />
                          </button>
                        </div>
                        <p className="text-[#8892a4] text-xs">{sublabel}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Image prompts (for transparency) */}
            <details className="rounded-2xl border border-[#1a1f2e] fade-up fade-up-delay-3" style={{ background: 'var(--surface)' }}>
              <summary className="p-4 cursor-pointer text-sm text-[#8892a4] hover:text-white transition-colors select-none">
                View image generation prompts
              </summary>
              <div className="px-4 pb-4 grid gap-3">
                {IMAGE_TYPES.map(({ key, label }) => (
                  <div key={key} className="rounded-xl p-3 border border-[#1a1f2e]" style={{ background: 'var(--surface2)' }}>
                    <span className="tag-chip mb-1 inline-block">{label}</span>
                    <p className="text-[#8892a4] text-xs leading-relaxed">{analysis.imagePrompts[key]}</p>
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a1f2e] mt-20 py-8 text-center text-[#4a5568] text-sm">
        <p>Built with Next.js · Hugging Face AI · Open Source on GitHub</p>
      </footer>
    </div>
  );
}
