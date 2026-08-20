"use client";

import { useState, useTransition, useEffect } from "react";
import { notFound, useParams } from "next/navigation";
import { PhotoCapture } from "./_components/PhotoCapture";
import { FuelPicker } from "./_components/FuelPicker";
import { SignaturePad } from "./_components/SignaturePad";
import type { PhotoSlot } from "./_components/PhotoCapture";
import type { FuelLevel } from "./_components/FuelPicker";
import { submitHandover } from "@/app/actions/handovers";

type HandoverData = {
  bookingId: string;
  tripLegId: string;
  handoverType: "DELIVERY" | "COLLECTION";
  clientName: string;
  vehiclePlate: string;
  makeModel: string;
};

export default function HandoverPage() {
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [handoverData, setHandoverData] = useState<HandoverData | null>(null);
  const [notFound2, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [photos, setPhotos] = useState<Partial<Record<PhotoSlot, string>>>({});
  const [photoFiles, setPhotoFiles] = useState<Partial<Record<PhotoSlot, string>>>({});
  const [uploadingSlot, setUploadingSlot] = useState<PhotoSlot | null>(null);
  const [fuelLevel, setFuelLevel] = useState<FuelLevel>("1/2");
  const [odometer, setOdometer] = useState("");
  const [runnerName, setRunnerName] = useState("");
  const [runnerPhone, setRunnerPhone] = useState("");
  const [damageNotes, setDamageNotes] = useState("");
  const [signatureDataUrl, setSignatureDataUrl] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function fetchHandover() {
      try {
        const res = await fetch(`/api/handover-data?token=${token}`);
        if (!res.ok) { setNotFound(true); return; }
        const data = await res.json();
        setHandoverData(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchHandover();
  }, [token]);

  async function handlePhotoCapture(slot: PhotoSlot, file: File) {
    if (!handoverData) return;
    setUploadingSlot(slot);
    // Preview immediately
    const previewUrl = URL.createObjectURL(file);
    setPhotos((prev) => ({ ...prev, [slot]: previewUrl }));

    try {
      // Get signed upload params
      const sigRes = await fetch("/api/uploads/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          handoverToken: token,
          bookingId: handoverData.bookingId,
          handoverType: handoverData.handoverType,
        }),
      });
      const { signature, timestamp, cloudName, apiKey, folder } = await sigRes.json();

      // Upload directly to Cloudinary
      const fd = new FormData();
      fd.append("file", file);
      fd.append("signature", signature);
      fd.append("timestamp", timestamp);
      fd.append("api_key", apiKey);
      fd.append("folder", folder);
      fd.append("allowed_formats", "jpg,jpeg,webp,png");

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: fd,
      });
      const uploadData = await uploadRes.json();

      if (uploadData.secure_url) {
        setPhotoFiles((prev) => ({ ...prev, [slot]: uploadData.secure_url }));
        setPhotos((prev) => ({ ...prev, [slot]: uploadData.secure_url }));
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploadingSlot(null);
    }
  }

  const allPhotosUploaded =
    photoFiles.front && photoFiles.rear && photoFiles.leftSide && photoFiles.rightSide && photoFiles.interior;
  const canSubmit =
    allPhotosUploaded && odometer && runnerName && runnerPhone && signatureDataUrl && agreed && !uploadingSlot;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || !handoverData) return;

    // Upload signature to Cloudinary as well
    const sigBlob = await fetch(signatureDataUrl).then((r) => r.blob());
    const sigFile = new File([sigBlob], "signature.png", { type: "image/png" });

    const sigRes = await fetch("/api/uploads/sign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handoverToken: token, bookingId: handoverData.bookingId, handoverType: "DELIVERY" }),
    });
    const { signature, timestamp, cloudName, apiKey, folder } = await sigRes.json();

    const fd2 = new FormData();
    fd2.append("file", sigFile);
    fd2.append("signature", signature);
    fd2.append("timestamp", timestamp);
    fd2.append("api_key", apiKey);
    fd2.append("folder", `${folder}/signatures`);

    const sigUpload = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: fd2 });
    const sigData = await sigUpload.json();
    const signatureUrl = sigData.secure_url;

    const fd = new FormData();
    fd.set("tripLegId", handoverData.tripLegId);
    fd.set("bookingId", handoverData.bookingId);
    fd.set("handoverType", handoverData.handoverType);
    fd.set("runnerName", runnerName);
    fd.set("runnerPhone", runnerPhone);
    fd.set("odometerReading", odometer);
    fd.set("fuelLevel", fuelLevel);
    fd.set("photoUrlFront", photoFiles.front!);
    fd.set("photoUrlRear", photoFiles.rear!);
    fd.set("photoUrlLeftSide", photoFiles.leftSide!);
    fd.set("photoUrlRightSide", photoFiles.rightSide!);
    fd.set("photoUrlInterior", photoFiles.interior!);
    fd.set("clientSignatureUrl", signatureUrl);
    fd.set("damageNotes", damageNotes);

    startTransition(async () => {
      const result = await submitHandover(fd);
      if (result.success) setSuccess(true);
    });
  }

  if (loading) return (
    <div className="min-h-dvh flex items-center justify-center">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-amber-400" />
    </div>
  );

  if (notFound2) return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="text-5xl">🔗</span>
      <h1 className="text-2xl font-bold text-white">Invalid Handover Link</h1>
      <p className="text-white/50 text-sm">This link may have expired or already been used.</p>
    </div>
  );

  if (success) return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="h-20 w-20 rounded-full bg-green-400/20 flex items-center justify-center text-4xl">✅</div>
      <h1 className="text-3xl font-bold text-white">Handover Complete!</h1>
      <p className="text-white/50">The inspection has been recorded and the client&apos;s signature captured.</p>
      <p className="text-white/30 text-sm">You may close this page.</p>
    </div>
  );

  return (
    <div className="min-h-dvh pb-16">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-0 right-0 h-64 w-64 bg-amber-500/10 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 pb-2">
          <div className="h-8 w-8 rounded-lg bg-amber-400 flex items-center justify-center flex-shrink-0">
            <span className="text-black font-black text-xs">CT</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">
              Vehicle {handoverData?.handoverType === "DELIVERY" ? "Delivery" : "Collection"} Inspection
            </h1>
            <p className="text-xs text-white/40">{handoverData?.clientName} · {handoverData?.vehiclePlate}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Runner details */}
          <div className="glass-card p-5 space-y-4">
            <p className="section-label">Runner Details</p>
            <label className="block">
              <span className="mb-1 block text-xs text-white/50">Your Name</span>
              <input type="text" value={runnerName} onChange={(e) => setRunnerName(e.target.value)} placeholder="Full name" className="input-field" required />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-white/50">Your Phone</span>
              <input type="tel" value={runnerPhone} onChange={(e) => setRunnerPhone(e.target.value)} placeholder="+254 7XX XXX XXX" className="input-field" required />
            </label>
          </div>

          {/* Photos */}
          <div className="glass-card p-5">
            <PhotoCapture photos={photos} onCapture={handlePhotoCapture} uploading={uploadingSlot} />
          </div>

          {/* Vehicle condition */}
          <div className="glass-card p-5 space-y-5">
            <p className="section-label">Vehicle Condition</p>
            <FuelPicker value={fuelLevel} onChange={setFuelLevel} />
            <label className="block">
              <span className="mb-1 block text-xs text-white/50">Odometer Reading (km) *</span>
              <input type="number" value={odometer} onChange={(e) => setOdometer(e.target.value)} placeholder="e.g. 45230" className="input-field" required min={0} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-white/50">Pre-existing Damage Notes (optional)</span>
              <textarea value={damageNotes} onChange={(e) => setDamageNotes(e.target.value)} placeholder="Note any existing scratches, dents, or damage..." rows={3} className="input-field resize-none" />
            </label>
          </div>

          {/* Signature */}
          <div className="glass-card p-5">
            <SignaturePad onCapture={setSignatureDataUrl} hasSignature={!!signatureDataUrl} />
          </div>

          {/* T&C */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-white/30 bg-white/10 text-amber-400" />
            <span className="text-sm text-white/50 leading-relaxed">
              I confirm the photos, fuel level, and odometer reading accurately reflect the vehicle condition at the time of this handover. The client signature above constitutes acceptance of these terms.
            </span>
          </label>

          <button type="submit" disabled={!canSubmit || isPending} className="btn-primary w-full flex items-center justify-center gap-2">
            {isPending ? (
              <><span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" /> Submitting…</>
            ) : (
              "Complete Handover ✓"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}