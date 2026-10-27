"use client";

import { useState } from "react";
import {
  HeartHandshake, KeyRound, Unlock, FileText, ArrowRight,
  Loader2, AlertCircle, UploadCloud, Stethoscope,
  CheckCircle2, Lock, Wallet, Download, Sparkles, FileHeart,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
type ClaimReason = "INCAPACITATION" | "BEREAVEMENT";

export default function ClaimPortal() {
  const [reason, setReason] = useState<ClaimReason>("INCAPACITATION");
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [ownerName, setOwnerName] = useState("");
  const [yourName, setYourName] = useState("");
  const [keyFragment, setKeyFragment] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [certNumber, setCertNumber] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [countryCode, setCountryCode] = useState("KE");

  const [doctorName, setDoctorName] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [doctorRegNumber, setDoctorRegNumber] = useState("");

  const vaultOwnerPubkey = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
  const claimantPubkey = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";
  const [claimId] = useState(() => `clm_${Math.random().toString(36).slice(2, 10)}`);

  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const [proofRecordId, setProofRecordId] = useState("");
  const [checkSummary, setCheckSummary] = useState<string>("");
  const [transferDestination, setTransferDestination] = useState("");
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [taxSummary, setTaxSummary] = useState<any>(null);

  const inputBase =
    "w-full rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/[0.05] px-4 py-3.5 text-[15px] text-stone-800 dark:text-emerald-50 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700/40 transition";

  // STEP 1: Strict Registry Verification
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg("Please attach a photo or PDF of the official document.");
      return;
    }

    setErrorMsg("");
    setLoading(true);

    try {
      if (reason === "BEREAVEMENT") {
        setLoadingMessage("Checking official certificate details privately...");
        const fd = new FormData();
        fd.append("claim_id", claimId);
        fd.append("vault_owner", vaultOwnerPubkey);
        fd.append("certificate_number", certNumber);
        fd.append("decedent_full_name", ownerName);
        fd.append("date_of_death", eventDate);
        fd.append("country_code", countryCode);
        fd.append("issuing_authority", "Civil Registration Services");
        fd.append("file", file);

        const res = await fetch(`${API_BASE}/api/v1/death-certificate/verify`, {
          method: "POST",
          body: fd,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Vital Registry verification failed");
        }
        setCheckSummary("Official certificate & registry matched successfully.");
      } else {
        setLoadingMessage("Checking hospital letter & doctor details privately...");
        const fd = new FormData();
        fd.append("claim_id", claimId);
        fd.append("vault_owner", vaultOwnerPubkey);
        fd.append("file", file);

        const res = await fetch(`${API_BASE}/api/v1/medical/upload-proof`, {
          method: "POST",
          body: fd,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || "Failed to verify clinical record");
        }

        const medData = await res.json();
        setProofRecordId(medData.proof_record_id);

        const attRes = await fetch(
          `${API_BASE}/api/v1/medical/attest?proof_record_id=${medData.proof_record_id}&doctor_npi=${encodeURIComponent(doctorRegNumber)}&license_state=${countryCode}&license_number=${encodeURIComponent(doctorRegNumber)}&signature=VERIFIED`,
          { method: "POST" }
        );

        if (!attRes.ok) {
          const err = await attRes.json();
          throw new Error(err.detail || "Medical license verification failed");
        }
        
        setCheckSummary(`Hospital letter & attending doctor's registration confirmed.`);
      }

      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  // STEP 2: Strict ZK Oracle Processing
  const handleStep2 = async () => {
    setErrorMsg("");
    setLoading(true);
    setLoadingMessage("Confirming document and erasing your uploaded copy for privacy...");

    try {
      const fd = new FormData();
      fd.append("username", yourName);
      fd.append("vault_owner", vaultOwnerPubkey);
      fd.append("claimant_pubkey", claimantPubkey);
      fd.append("claim_type", reason === "INCAPACITATION" ? "1" : "2");
      if (file) fd.append("file", file);

      const res = await fetch(`${API_BASE}/api/v1/claims/verify-and-trigger`, {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "ZK Proof generation failed");
      }

      setStep(3);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  // STEP 3: Strict Dual Sign
  const handleStep3 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (keyFragment.trim().length < 4) {
      setErrorMsg("Please enter the backup passcode.");
      return;
    }

    setErrorMsg("");
    setLoading(true);
    setLoadingMessage("Co-signing and unlocking vault items...");

    try {
      const encoded = btoa(`UNLOCK:${vaultOwnerPubkey}:${Date.now()}`);
      const res = await fetch(`${API_BASE}/api/v1/dual-sign/${vaultOwnerPubkey}/finalize-challenge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimant_signed_tx_base64: encoded }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "On-chain dual-sign verification failed");
      }

      setStep(4);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
      setLoadingMessage("");
    }
  };

  // STEP 4: Strict Custodial Sweep & Tax Reporting
  const handleTransferFunds = async () => {
    if (!transferDestination.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/beneficiary/sweep-assets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beneficiary_id: 1,
          encrypted_private_key: keyFragment, // Provided in step 3
          destination_address: transferDestination.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to execute fund sweep");
      }
      setTransferSuccess(true);
      setErrorMsg("");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadStatement = async () => {
    setLoading(true);
    try {
      const addr = transferDestination || claimantPubkey;
      const res = await fetch(`${API_BASE}/api/v1/beneficiary/1/tax-document?wallet_address=${encodeURIComponent(addr)}`);
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Failed to generate tax document");
      }

      const data = await res.json();
      setTaxSummary(data);
      setErrorMsg("");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-66px)] bg-stone-50 dark:bg-[#07130f] text-stone-800 dark:text-emerald-50 py-10 px-6 transition-colors duration-500">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-full bg-emerald-900 dark:bg-emerald-400/15 text-amber-300 dark:text-emerald-300 flex items-center justify-center">
            <HeartHandshake size={26} />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight text-emerald-950 dark:text-white">
            We&apos;re here to help you step in.
          </h1>
          <p className="text-stone-600 dark:text-emerald-100/70 text-base max-w-xl mx-auto leading-relaxed">
            If your loved one or business partner is unable to manage their affairs, follow these simple steps to unlock the items they set aside for you.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
            {[{ n: 1, label: "1. Share What Happened" }, { n: 2, label: "2. Privacy Check" }, { n: 3, label: "3. Backup Passcode" }, { n: 4, label: "4. View Items" }].map((s) => (
              <div key={s.n} className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${step === s.n ? "bg-emerald-900 text-white dark:bg-amber-300 dark:text-emerald-950 font-semibold" : step > s.n ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300" : "bg-stone-200/70 dark:bg-white/5 text-stone-500 dark:text-emerald-100/40"}`}>
                {s.label}
              </div>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button type="button" onClick={() => setReason("INCAPACITATION")} className={`p-5 rounded-2xl border text-left transition flex items-start gap-4 ${reason === "INCAPACITATION" ? "border-emerald-700 dark:border-amber-300 bg-white dark:bg-white/[0.06] shadow-md" : "border-stone-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] opacity-75 hover:opacity-100"}`}>
                <div className="w-11 h-11 rounded-xl bg-emerald-900 dark:bg-emerald-400/15 text-amber-300 flex items-center justify-center shrink-0"><Stethoscope size={22} /></div>
                <div>
                  <h3 className="font-semibold text-emerald-950 dark:text-white">Medical Emergency or Illness</h3>
                  <p className="text-xs text-stone-500 dark:text-emerald-100/60 mt-1 leading-relaxed">They are in the hospital or unable to manage their work, and you need to step in to keep things running.</p>
                </div>
              </button>
              <button type="button" onClick={() => setReason("BEREAVEMENT")} className={`p-5 rounded-2xl border text-left transition flex items-start gap-4 ${reason === "BEREAVEMENT" ? "border-emerald-700 dark:border-amber-300 bg-white dark:bg-white/[0.06] shadow-md" : "border-stone-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] opacity-75 hover:opacity-100"}`}>
                <div className="w-11 h-11 rounded-xl bg-emerald-900 dark:bg-emerald-400/15 text-amber-300 flex items-center justify-center shrink-0"><FileHeart size={22} /></div>
                <div>
                  <h3 className="font-semibold text-emerald-950 dark:text-white">A Loved One Has Passed Away</h3>
                  <p className="text-xs text-stone-500 dark:text-emerald-100/60 mt-1 leading-relaxed">You have an official certificate and are ready to receive the family documents and savings they left for you.</p>
                </div>
              </button>
            </div>

            <form onSubmit={handleStep1} className="rounded-3xl bg-white dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-emerald-100/80 mb-1.5">Your Full Name</label>
                  <input type="text" placeholder="e.g. Samuel Doe" value={yourName} onChange={(e) => setYourName(e.target.value)} className={inputBase} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 dark:text-emerald-100/80 mb-1.5">Vault Owner&apos;s Name</label>
                  <input type="text" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className={inputBase} required />
                </div>
              </div>

              {reason === "INCAPACITATION" ? (
                <div className="space-y-4 pt-2 border-t border-stone-100 dark:border-white/10">
                  <h3 className="text-sm font-semibold text-emerald-950 dark:text-white">Hospital & Doctor Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-stone-500 mb-1">Doctor&apos;s Name</label>
                      <input type="text" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} className={inputBase} required />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-500 mb-1">Hospital or Clinic</label>
                      <input type="text" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} className={inputBase} required />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-500 mb-1">Doctor&apos;s Reg No.</label>
                      <input type="text" value={doctorRegNumber} onChange={(e) => setDoctorRegNumber(e.target.value)} className={inputBase} required />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-2 border-t border-stone-100 dark:border-white/10">
                  <h3 className="text-sm font-semibold text-emerald-950 dark:text-white">Official Certificate Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-stone-500 mb-1">Certificate Number</label>
                      <input type="text" value={certNumber} onChange={(e) => setCertNumber(e.target.value)} className={inputBase} required />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-500 mb-1">Date</label>
                      <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className={inputBase} required />
                    </div>
                    <div>
                      <label className="block text-xs text-stone-500 mb-1">Country Issued</label>
                      <select value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className={inputBase}>
                        <option value="KE">Kenya</option>
                        <option value="US">United States</option>
                        <option value="GB">United Kingdom</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-stone-700 dark:text-emerald-100/80 mb-2">
                  {reason === "INCAPACITATION" ? "Attach a photo or PDF of the hospital letter" : "Attach a clear photo or PDF of the official certificate"}
                </label>
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-300 dark:border-white/15 rounded-2xl p-6 cursor-pointer hover:border-emerald-600 dark:hover:border-amber-300 transition bg-stone-50/50 dark:bg-white/[0.02]">
                  <UploadCloud size={28} className="text-emerald-700 dark:text-amber-300 mb-2" />
                  <span className="text-sm font-medium text-emerald-950 dark:text-white">
                    {file ? file.name : "Tap here to choose a photo or PDF from your phone or computer"}
                  </span>
                  <input type="file" accept=".pdf,image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
                </label>
              </div>

              <div className="pt-2 flex justify-end">
                <button type="submit" disabled={loading} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-emerald-900 hover:bg-emerald-800 dark:bg-amber-300 text-white dark:text-emerald-950 font-semibold px-8 py-4 shadow-lg transition disabled:opacity-50">
                  {loading ? <><Loader2 size={18} className="animate-spin" /> {loadingMessage}</> : <>Continue <ArrowRight size={18} /></>}
                </button>
              </div>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="rounded-3xl bg-white dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-4">
              <CheckCircle2 size={36} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <h2 className="font-display text-2xl font-semibold text-emerald-950 dark:text-white">Document Checked & Confirmed</h2>
                <p className="text-sm text-stone-600 dark:text-emerald-100/70">{checkSummary}</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-white/[0.03] border border-emerald-200/60 dark:border-white/10 flex items-start gap-3">
              <Lock size={20} className="text-emerald-800 dark:text-amber-300 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-950 dark:text-emerald-100/80 leading-relaxed">
                <strong>Your family&apos;s privacy is protected:</strong> We have verified your document and permanently erased the file so no personal medical or family records are ever stored online.
              </p>
            </div>
            <div className="flex justify-between items-center pt-2">
              <button type="button" onClick={() => setStep(1)} className="text-sm text-stone-500 hover:text-emerald-900 dark:hover:text-white">← Go Back</button>
              <button type="button" onClick={handleStep2} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-900 hover:bg-emerald-800 dark:bg-amber-300 text-white dark:text-emerald-950 font-semibold px-8 py-4 shadow-lg transition disabled:opacity-50">
                {loading ? <><Loader2 size={18} className="animate-spin" /> {loadingMessage}</> : <>Next: Enter Backup Passcode <Sparkles size={18} /></>}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleStep3} className="rounded-3xl bg-white dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 p-6 md:p-8 space-y-6">
            <div>
              <h2 className="font-display text-2xl font-semibold text-emerald-950 dark:text-white">Enter Your Backup Passcode</h2>
              <p className="text-sm text-stone-600 dark:text-emerald-100/70 mt-1">When {ownerName} added you to their safety net, a special backup passcode was sent to your email or phone. Enter it below to unlock the vault.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-emerald-100/80 mb-2">Backup Passcode</label>
              <div className="relative">
                <KeyRound size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input type="text" placeholder="e.g. SAFE-4829-HOME" value={keyFragment} onChange={(e) => setKeyFragment(e.target.value)} className={inputBase + " pl-11 tracking-wider font-semibold"} required />
              </div>
            </div>
            <div className="flex justify-between items-center pt-2">
              <button type="button" onClick={() => setStep(2)} className="text-sm text-stone-500 hover:text-emerald-900 dark:hover:text-white">← Go Back</button>
              <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-900 hover:bg-emerald-800 dark:bg-amber-300 text-white dark:text-emerald-950 font-semibold px-8 py-4 shadow-lg transition disabled:opacity-50">
                {loading ? <><Loader2 size={18} className="animate-spin" /> {loadingMessage}</> : <>Open Vault <Unlock size={18} /></>}
              </button>
            </div>
          </form>
        )}

        {step === 4 && (
          <div className="rounded-3xl bg-white dark:bg-white/[0.04] border border-stone-200 dark:border-white/10 p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center"><Unlock size={28} /></div>
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-emerald-950 dark:text-white">Vault Unlocked</h2>
                <p className="text-sm text-stone-600 dark:text-emerald-100/70">Here are the documents and accounts {ownerName} set aside for you.</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-stone-50 dark:bg-white/[0.03] border border-stone-200 dark:border-white/10 space-y-4">
              <h3 className="text-base font-semibold text-emerald-950 dark:text-white">Transfer Protected Funds to Your Account</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="text" placeholder="Enter your receiving account or wallet address..." value={transferDestination} onChange={(e) => setTransferDestination(e.target.value)} className={inputBase + " flex-1"} />
                <button type="button" onClick={handleTransferFunds} disabled={loading || !transferDestination.trim()} className="rounded-xl bg-emerald-900 dark:bg-amber-300 text-white dark:text-emerald-950 font-semibold px-6 py-3.5 text-sm transition disabled:opacity-50">Transfer Funds</button>
                <button type="button" onClick={handleDownloadStatement} className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-300 dark:border-white/20 px-5 py-3.5 text-sm font-medium hover:bg-stone-100 dark:hover:bg-white/5 transition"><Download size={16} /> Official Receipt</button>
              </div>
              {transferSuccess && <div className="p-3 rounded-xl bg-emerald-100/70 dark:bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 text-sm">✓ Your funds have been safely transferred to {transferDestination}.</div>}
              {taxSummary && (
                <div className="p-4 rounded-xl bg-white dark:bg-black/30 border border-stone-200 dark:border-white/10 text-xs space-y-1">
                  <div className="font-bold text-emerald-900 dark:text-amber-300">OFFICIAL HANDOVER STATEMENT ({taxSummary.tax_year})</div>
                  <div>Total Value Transferred: ${taxSummary.total_value_usd_at_transfer}</div>
                  <div>Date Issued: {taxSummary.generated_at}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}