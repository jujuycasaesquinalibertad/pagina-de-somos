import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  X,
  Download,
  Share2,
  MessageCircle,
  CheckCircle,
  Sparkles,
  UserCheck,
  Shield,
  Loader2,
} from 'lucide-react';
import { soundscape } from '../../audio/soundscape';
import { CAMPAIGN_COPY } from '../../data/campaignCopy';

interface CarnetModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMunicipio?: string;
}

export const CarnetModal: React.FC<CarnetModalProps> = ({
  isOpen,
  onClose,
  defaultMunicipio = 'San Salvador de Jujuy',
}) => {
  const [nombre, setNombre] = useState('');
  const [municipio, setMunicipio] = useState(defaultMunicipio);
  const [areaAccion, setAreaAccion] = useState(CAMPAIGN_COPY.actionAreas[0].id);
  const [telefono, setTelefono] = useState('');
  const [afiliadoId, setAfiliadoId] = useState('SOMOS-JUJ-0101');
  const [fechaRegistro, setFechaRegistro] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/afiliaciones/stats')
        .then((res) => res.json())
        .then((data) => {
          if (data.ultimoNumero && !isGenerated) {
            const parts = data.ultimoNumero.split('-');
            const nextNum = Number(parts[2] || 100) + 1;
            setAfiliadoId(`SOMOS-JUJ-${String(nextNum).padStart(4, '0')}`);
          }
        })
        .catch(() => {
          setAfiliadoId('SOMOS-JUJ-0101');
        });
    }
  }, [isOpen, isGenerated]);

  const currentAreaObj =
    CAMPAIGN_COPY.actionAreas.find((a) => a.id === areaAccion) || CAMPAIGN_COPY.actionAreas[0];

  useEffect(() => {
    if (!afiliadoId) return;
    const payload = `https://somosjujuy.org/validar/${afiliadoId} | SOMOS Jujuy | Afiliado: ${
      nombre || CAMPAIGN_COPY.carnetModal.cardDesign.defaultTitular
    } | Municipio: ${municipio} | ID Oficial: ${afiliadoId}`;

    QRCode.toDataURL(payload, {
      width: 180,
      margin: 1,
      color: {
        dark: '#0C2340',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error QR', err));
  }, [afiliadoId, nombre, municipio, areaAccion]);

  if (!isOpen) return null;

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    setIsSubmitting(true);
    soundscape.playClick();

    try {
      const response = await fetch('/api/afiliaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          municipio,
          areaAccion: currentAreaObj.label,
          telefono: telefono.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.afiliado) {
        setAfiliadoId(data.afiliado.numeroAfiliado);
        setFechaRegistro(new Date(data.afiliado.fechaRegistro).toLocaleDateString('es-AR'));
        setIsGenerated(true);
        soundscape.playCarnetIssued();
      } else {
        setIsGenerated(true);
        soundscape.playCarnetIssued();
      }
    } catch {
      setIsGenerated(true);
      soundscape.playCarnetIssued();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppJoin = () => {
    soundscape.playClick();
    const msg = CAMPAIGN_COPY.carnetModal.actions.whatsappMessageTemplate(
      municipio,
      afiliadoId,
      nombre,
      currentAreaObj.label
    );
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleShareLink = () => {
    soundscape.playClick();
    const shareText = CAMPAIGN_COPY.carnetModal.actions.shareMessageText(
      afiliadoId,
      window.location.origin
    );
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleDownloadCarnet = async () => {
    setIsDownloading(true);
    soundscape.playClick();

    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 760;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setIsDownloading(false);
      return;
    }

    // Fondo Azul Profundo SOMOS (#0C2340)
    ctx.fillStyle = '#0C2340';
    ctx.fillRect(0, 0, 1200, 760);

    // Patrón geométrico
    ctx.strokeStyle = 'rgba(0, 174, 239, 0.2)';
    ctx.lineWidth = 2;
    for (let x = -200; x < 1400; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 300, 760);
      ctx.stroke();
    }

    // Franjas de marca
    ctx.fillStyle = '#EE007C';
    ctx.fillRect(60, 40, 1080, 12);
    ctx.fillStyle = '#00AEEF';
    ctx.fillRect(60, 56, 1080, 8);

    // Borde
    ctx.strokeStyle = '#00AEEF';
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 40, 1080, 680);

    // Encabezado SOMOS
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 64px Montserrat, sans-serif';
    ctx.fillText('SOM', 100, 150);

    // Corazón Patrio
    ctx.fillStyle = '#00AEEF';
    ctx.beginPath();
    ctx.arc(285, 120, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(285, 120, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F8C300';
    ctx.beginPath();
    ctx.arc(285, 120, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('S', 320, 150);

    ctx.fillStyle = '#00AEEF';
    ctx.font = 'bold 24px Montserrat, sans-serif';
    ctx.fillText(CAMPAIGN_COPY.brand.province, 100, 185);

    // Título de la Credencial
    ctx.fillStyle = '#F8C300';
    ctx.font = 'bold 26px Inter, sans-serif';
    ctx.fillText(CAMPAIGN_COPY.carnetModal.cardDesign.statusBadge.toUpperCase(), 620, 140);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '18px Inter, sans-serif';
    ctx.fillText(CAMPAIGN_COPY.carnetModal.cardDesign.movementFooter, 620, 170);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.moveTo(100, 220);
    ctx.lineTo(1100, 220);
    ctx.stroke();

    // Datos del Titular
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText(CAMPAIGN_COPY.carnetModal.cardDesign.titularLabel, 100, 270);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 38px Montserrat, sans-serif';
    ctx.fillText(
      (nombre || CAMPAIGN_COPY.carnetModal.cardDesign.defaultTitular).toUpperCase(),
      100,
      320
    );

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText(CAMPAIGN_COPY.carnetModal.cardDesign.territorioLabel, 100, 390);

    ctx.fillStyle = '#00AEEF';
    ctx.font = 'bold 30px Inter, sans-serif';
    ctx.fillText(municipio.toUpperCase(), 100, 435);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText(CAMPAIGN_COPY.carnetModal.cardDesign.accionLabel, 100, 500);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.fillText(currentAreaObj.label, 100, 540);

    // Número oficial de padrón
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '16px Inter, sans-serif';
    ctx.fillText(CAMPAIGN_COPY.carnetModal.cardDesign.numeroPadronLabel, 100, 610);

    ctx.fillStyle = '#EE007C';
    ctx.font = 'bold 30px monospace';
    ctx.fillText(afiliadoId, 100, 650);

    if (qrDataUrl) {
      const qrImg = new Image();
      qrImg.crossOrigin = 'anonymous';
      qrImg.onload = () => {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(820, 280, 240, 240);
        ctx.drawImage(qrImg, 830, 290, 220, 220);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '14px Inter, sans-serif';
        ctx.fillText(CAMPAIGN_COPY.carnetModal.cardDesign.qrVerificationLabel, 840, 555);

        ctx.fillStyle = '#00AEEF';
        ctx.font = 'bold 16px Inter, sans-serif';
        ctx.fillText(CAMPAIGN_COPY.carnetModal.cardDesign.partySubFooter, 860, 580);

        const downloadLink = document.createElement('a');
        downloadLink.download = `Carnet_SOMOS_${afiliadoId}_${nombre.replace(/\s+/g, '_') || 'Afiliado'}.png`;
        downloadLink.href = canvas.toDataURL('image/png');
        downloadLink.click();
        setIsDownloading(false);
      };
      qrImg.src = qrDataUrl;
    } else {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0C2340] border border-[#00AEEF]/50 rounded-2xl shadow-2xl overflow-hidden my-6">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0C2340]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#EE007C] flex items-center justify-center text-white">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-montserrat text-white">
                {CAMPAIGN_COPY.carnetModal.title}
              </h2>
              <p className="text-xs text-slate-400">
                {CAMPAIGN_COPY.carnetModal.description}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundscape.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario y Carnet */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          <div className="lg:col-span-5 flex flex-col justify-between">
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  {CAMPAIGN_COPY.carnetModal.form.nombreLabel}
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder={CAMPAIGN_COPY.carnetModal.form.nombrePlaceholder}
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#00AEEF] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  {CAMPAIGN_COPY.carnetModal.form.municipioLabel}
                </label>
                <select
                  value={municipio}
                  onChange={(e) => setMunicipio(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#00AEEF] text-sm"
                >
                  {CAMPAIGN_COPY.municipalities.map((m) => (
                    <option key={m} value={m} className="bg-slate-900 text-white">
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  {CAMPAIGN_COPY.carnetModal.form.areaLabel}
                </label>
                <select
                  value={areaAccion}
                  onChange={(e) => setAreaAccion(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-[#00AEEF] text-sm"
                >
                  {CAMPAIGN_COPY.actionAreas.map((a) => (
                    <option key={a.id} value={a.id} className="bg-slate-900 text-white">
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  {CAMPAIGN_COPY.carnetModal.form.telefonoLabel}
                </label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder={CAMPAIGN_COPY.carnetModal.form.telefonoPlaceholder}
                  className="w-full px-3.5 py-2.5 bg-slate-900/80 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-[#00AEEF] text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-[#EE007C] hover:bg-[#d4006e] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{CAMPAIGN_COPY.carnetModal.form.submittingButton}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{CAMPAIGN_COPY.carnetModal.form.submitButton}</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 p-3 bg-slate-900/50 border border-white/5 rounded-xl text-[11px] text-slate-400 flex items-start gap-2">
              <Shield className="w-4 h-4 text-[#00AEEF] shrink-0 mt-0.5" />
              <span>{CAMPAIGN_COPY.carnetModal.form.disclaimer}</span>
            </div>
          </div>

          {/* Previsualización del Carnet Oficial */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <div className="w-full max-w-md bg-gradient-to-br from-[#0C2340] via-[#091b33] to-[#040f1c] border-2 border-[#00AEEF] rounded-2xl p-5 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#EE007C]" />
              <div className="absolute top-1.5 left-0 right-0 h-1 bg-[#00AEEF]" />

              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center font-black font-montserrat text-2xl text-white tracking-wider">
                    <span>SOM</span>
                    <span className="inline-block w-5 h-5 mx-0.5 rounded-full bg-[#00AEEF] border border-white flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-[#F8C300]" />
                    </span>
                    <span>S</span>
                  </div>
                  <p className="text-[10px] font-bold tracking-[0.25em] text-[#00AEEF] uppercase">
                    {CAMPAIGN_COPY.carnetModal.cardDesign.headerCategory}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 bg-[#F8C300]/10 border border-[#F8C300]/40 rounded text-[10px] font-bold text-[#F8C300] uppercase">
                    {CAMPAIGN_COPY.carnetModal.cardDesign.statusBadge}
                  </span>
                  <p className="text-xs text-white font-mono font-bold mt-1 tracking-wider">
                    {afiliadoId}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-12 gap-3 items-center">
                <div className="col-span-8 space-y-2">
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-400">
                      {CAMPAIGN_COPY.carnetModal.cardDesign.titularLabel}
                    </p>
                    <p className="text-base font-bold text-white font-montserrat truncate">
                      {(nombre.trim() || CAMPAIGN_COPY.carnetModal.cardDesign.defaultTitular).toUpperCase()}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-400">
                      {CAMPAIGN_COPY.carnetModal.cardDesign.territorioLabel}
                    </p>
                    <p className="text-xs font-semibold text-[#00AEEF]">{municipio}</p>
                  </div>

                  <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-400">
                      {CAMPAIGN_COPY.carnetModal.cardDesign.accionLabel}
                    </p>
                    <p className="text-[11px] text-slate-200 line-clamp-1">{currentAreaObj.label}</p>
                  </div>
                </div>

                <div className="col-span-4 flex flex-col items-center justify-center">
                  <div className="p-1.5 bg-white rounded-lg shadow-md">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="Código QR de verificación"
                        className="w-20 h-20 object-contain"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-slate-200 animate-pulse" />
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1">Escaneable</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  {CAMPAIGN_COPY.carnetModal.cardDesign.movementFooter}
                </span>
                <span className="text-white/60 font-mono">
                  {fechaRegistro || new Date().toLocaleDateString('es-AR')}
                </span>
              </div>
            </div>

            <div className="w-full max-w-md mt-4 space-y-2">
              <button
                type="button"
                onClick={handleWhatsAppJoin}
                className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20b858] text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-slate-950" />
                <span>{CAMPAIGN_COPY.carnetModal.actions.whatsappButtonText(afiliadoId)}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isDownloading}
                  onClick={handleDownloadCarnet}
                  className="py-2 px-3 bg-white/10 hover:bg-white/15 text-white font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#00AEEF]" />
                  <span>
                    {isDownloading
                      ? CAMPAIGN_COPY.carnetModal.actions.downloadingButton
                      : CAMPAIGN_COPY.carnetModal.actions.downloadButton}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleShareLink}
                  className="py-2 px-3 bg-white/10 hover:bg-white/15 text-white font-medium rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">
                        {CAMPAIGN_COPY.carnetModal.actions.copiedButton}
                      </span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5 text-[#F8C300]" />
                      <span>{CAMPAIGN_COPY.carnetModal.actions.shareButton}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
