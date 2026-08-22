'use client';

import { useState } from 'react';
import { X, CheckCircle2, Copy, ShieldCheck, Download, Share2, Building2, Calendar, Award } from 'lucide-react';
import { formatEncryptedPayload } from '@/lib/crypto/encryption';

interface CredentialDetailModalProps {
  credential: any;
  onClose: () => void;
}

export default function CredentialDetailModal({ credential, onClose }: CredentialDetailModalProps) {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  if (!credential) return null;

  const copyHash = () => {
    navigator.clipboard.writeText(credential.commitment_hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/verify?hash=${encodeURIComponent(credential.commitment_hash)}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const downloadEncryptedJson = () => {
    const encryptedData = {
      version: '1.0.0',
      type: 'VerifiableAcademicCredential',
      id: credential.id,
      student_id: credential.student_id,
      student_name: credential.student_name,
      degree: credential.degree,
      cgpa: credential.cgpa,
      credits: credential.credits,
      institution_name: credential.institution_name,
      commitment_hash: credential.commitment_hash,
      issued_at: credential.issued_at,
      encrypted_payload: formatEncryptedPayload(credential),
    };

    const blob = new Blob([JSON.stringify(encryptedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EduPass_Credential_${credential.student_id}_${credential.id.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 font-mono">
      <div className="bg-[#E2E2E2] border-2 border-[#131313] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b border-[#131313] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FF5C00] border border-[#131313] flex items-center justify-center text-[#131313]">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#FF5C00] uppercase tracking-widest block">
                [ VERIFIED PASSPORT RECORD ]
              </span>
              <h2 className="font-anton text-2xl uppercase text-[#131313]">
                {credential.degree}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[#131313] hover:text-[#FF5C00] transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Verification Badge */}
        <div className="bg-[#131313] text-white p-4 border border-[#131313] flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#FF5C00]" />
            <span className="font-bold uppercase text-[#FF5C00]">VERIFIED ON-CHAIN & BACKEND REGISTRY</span>
          </div>
          <span className="text-[10px] text-gray-400 font-bold uppercase">{credential.student_id}</span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-[#EAE9E4] p-4 border border-[#131313] space-y-1">
            <span className="text-gray-600 text-[10px] uppercase font-bold block">STUDENT NAME:</span>
            <span className="font-bold text-[#131313] uppercase text-sm">{credential.student_name}</span>
          </div>

          <div className="bg-[#EAE9E4] p-4 border border-[#131313] space-y-1">
            <span className="text-gray-600 text-[10px] uppercase font-bold block">STUDENT ID:</span>
            <span className="font-bold text-[#FF5C00] uppercase text-sm">{credential.student_id}</span>
          </div>

          <div className="bg-[#EAE9E4] p-4 border border-[#131313] space-y-1">
            <span className="text-gray-600 text-[10px] uppercase font-bold block">CGPA PERFORMANCE:</span>
            <span className="font-bold text-[#131313] uppercase text-sm">{credential.cgpa} / 10.0</span>
          </div>

          <div className="bg-[#EAE9E4] p-4 border border-[#131313] space-y-1">
            <span className="text-gray-600 text-[10px] uppercase font-bold block">TOTAL CREDITS EARNED:</span>
            <span className="font-bold text-[#131313] uppercase text-sm">{credential.credits} ACADEMIC UNITS</span>
          </div>
        </div>

        {/* Issuing Institution & Date */}
        <div className="bg-[#EAE9E4] p-4 border border-[#131313] space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#FF5C00]" />
            <span><strong>ISSUING INSTITUTION:</strong> {credential.institution_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-600" />
            <span><strong>ISSUANCE TIMESTAMP:</strong> {new Date(credential.issued_at).toLocaleString()}</span>
          </div>
        </div>

        {/* Commitment Hash Box */}
        <div className="bg-[#131313] text-white p-4 border border-[#131313] space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-[#FF5C00] font-bold uppercase text-[10px]">CRYPTOGRAPHIC COMMITMENT HASH (SHA-256):</span>
            <button
              onClick={copyHash}
              className="text-[10px] text-white hover:text-[#FF5C00] flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedHash ? 'COPIED!' : 'COPY'}</span>
            </button>
          </div>
          <p className="font-mono text-[11px] text-[#FF5C00] break-all font-bold">{credential.commitment_hash}</p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={downloadEncryptedJson}
            className="bg-[#131313] hover:bg-[#FF5C00] text-white hover:text-black font-mono font-bold text-xs uppercase py-3 border border-[#131313] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT ENCRYPTED JSON</span>
          </button>

          <button
            onClick={copyShareLink}
            className="bg-[#FF5C00] hover:bg-[#131313] text-[#131313] hover:text-white font-mono font-bold text-xs uppercase py-3 border border-[#131313] transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>{copiedShare ? 'VERIFICATION LINK COPIED!' : 'SHARE VERIFY LINK'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
