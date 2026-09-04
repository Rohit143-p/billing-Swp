import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  Share2,
  PlusSquare,
  ExternalLink,
  Copy,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  Layers,
  ArrowRight
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface MobileInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileInstallModal: React.FC<MobileInstallModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk' | 'ios'>('pwa');

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleCopyUrl = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleTriggerInstall = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Install RevenueFlow on Mobile</h2>
              <p className="text-xs text-slate-500">Android APK & iOS Home Screen Application</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-white px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'pwa'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Direct Mobile Install
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'apk'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Download Android .APK
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'ios'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Apple iPhone (iOS)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-600">
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-xs">Full Standalone Mobile Experience</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Installs directly to your home screen with high-res icon, offline asset caching, and zero browser URL bars.
                  </p>
                </div>
              </div>

              {isInstalled ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <div className="inline-flex p-2 rounded-full bg-emerald-100 text-emerald-600">
                    <Check className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-900">Application Already Installed!</h4>
                  <p className="text-xs text-slate-600">
                    You are already using RevenueFlow in standalone mobile app mode.
                  </p>
                </div>
              ) : isInstallable ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600">
                    Click below to install RevenueFlow directly onto this device:
                  </p>
                  <button
                    onClick={handleTriggerInstall}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Install RevenueFlow App Now
                  </button>
                </div>
              ) : isIOS ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                    <Share2 className="w-4 h-4 text-blue-600" />
                    How to install on iOS Safari:
                  </h4>
                  <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside">
                    <li>Open this URL in <strong>Apple Safari</strong> on your iPhone.</li>
                    <li>Tap the <strong>Share</strong> icon in the bottom menu bar.</li>
                    <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                    <li>Tap <strong>Add</strong> to enjoy full-screen RevenueFlow.</li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <h4 className="font-semibold text-slate-900 text-xs">On Mobile Chrome or Android:</h4>
                    <p className="text-xs text-slate-600">
                      Open this URL in Google Chrome on your phone, then tap the three dots menu <strong>(⋮)</strong> and select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                    <input
                      type="text"
                      readOnly
                      value={currentUrl}
                      className="text-xs font-mono text-slate-700 bg-transparent flex-1 outline-none truncate"
                    />
                    <button
                      onClick={handleCopyUrl}
                      className="px-3 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'apk' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-xs">Generate Ready-to-Install Android APK</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    PWABuilder turns this live web app into a signed Android <code>.apk</code> and Google Play Store package in under 2 minutes.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-xs space-y-2">
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span>Step 1: Copy your live app URL</span>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50">
                    <input
                      type="text"
                      readOnly
                      value={currentUrl}
                      className="text-xs font-mono text-slate-700 bg-transparent flex-1 outline-none truncate"
                    />
                    <button
                      onClick={handleCopyUrl}
                      className="px-3 py-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="text-xs space-y-2">
                  <span className="font-semibold text-slate-800">Step 2: Generate APK on PWABuilder</span>
                  <p className="text-slate-600">
                    Paste the URL on PWABuilder, click <strong>Build My PWA</strong>, and download your <strong>Android APK</strong> package.
                  </p>
                  <a
                    href="https://www.pwabuilder.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
                  >
                    <span>Open PWABuilder.com</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
                  <strong>Alternative for Developers:</strong> Export this project to GitHub via <em>Settings → Export to GitHub</em>, then run <code>npx cap add android</code> to build directly inside Android Studio.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100 flex items-start gap-3">
                <Layers className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-slate-900 text-xs">Apple iOS Setup Note</h4>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Apple iOS does not allow raw APK files. Instead, iOS supports full home-screen web applications and Apple TestFlight / App Store <code>.ipa</code> packages.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-900">To use as an app on iPhone:</h4>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                      1
                    </div>
                    <span className="text-xs text-slate-700">Open this website in <strong>Safari</strong> on iPhone</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                      2
                    </div>
                    <span className="text-xs text-slate-700">Tap the <strong>Share</strong> button at bottom center</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                      3
                    </div>
                    <span className="text-xs text-slate-700">Select <strong>"Add to Home Screen"</strong></span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
                  For App Store <code>.ipa</code> distribution, export code to GitHub and open in <strong>Apple Xcode</strong> with Capacitor.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <span className="text-[11px] font-mono-tag text-slate-400">PWA Manifest v2.0 • Standalone</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
