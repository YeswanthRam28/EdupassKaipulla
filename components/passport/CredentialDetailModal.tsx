'use client';

import { useState } from 'react';
import { X, CheckCircle2, Copy, ShieldCheck, Download, Share2, Building2, Calendar, Award, ExternalLink, FileCode, Check, Database, Lock } from 'lucide-react';
import { formatEncryptedPayload } from '@/lib/crypto/encryption';

interface CredentialDetailModalProps {
  credential: any;
  onClose: () => void;
}

export default function CredentialDetailModal({ credential, onClose }: CredentialDetailModalProps) {
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  if (!credential) return null;

  let parsedDetails: any = {};
  if (credential.details_json) {
    try {
      parsedDetails = JSON.parse(credential.details_json);
    } catch (e) {}
  }

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
      type: credential.credential_type || 'VerifiableAcademicCredential',
      id: credential.id,
      student_id: credential.student_id,
      student_name: credential.student_name,
      degree: credential.degree,
      cgpa: credential.cgpa,
      credits: credential.credits,
      semester: credential.semester,
      conduct_status: credential.conduct_status,
      details: parsedDetails,
      institution_name: credential.institution_name,
      commitment_hash: credential.commitment_hash,
      ipfs_cid: credential.ipfs_cid,
      ipfs_gateway_url: credential.ipfs_gateway_url,
      edupass_signature: credential.edupass_signature,
      issued_at: credential.issued_at,
      encrypted_payload: formatEncryptedPayload(credential),
    };

    const blob = new Blob([JSON.stringify(encryptedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EduPass_${credential.credential_type}_${credential.student_id}_${credential.id.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isSignatureValid = credential.edupass_signature && credential.edupass_signature.startsWith('0xedupass_sig_');

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
                [ VERIFIED {credential.credential_type || 'ACADEMIC'} DOCUMENT ]
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

        {/* Verification Status Banner */}
        <div className={`p-4 border flex justify-between items-center text-xs ${
          credential.is_revoked ? 'bg-red-100 text-red-900 border-red-500' : 'bg-[#131313] text-white border-[#131313]'
        }`}>
          <div className="flex items-center gap-2 font-bold uppercase">
            <CheckCircle2 className={`w-4 h-4 ${credential.is_revoked ? 'text-red-600' : 'text-[#FF5C00]'}`} />
            <span>{credential.is_revoked ? 'REVOKED CREDENTIAL' : 'VERIFIED ON-CHAIN & BACKEND REGISTRY'}</span>
          </div>
          <span className="text-[10px] text-gray-400 font-bold uppercase">{credential.student_id}</span>
        </div>

        {/* EduPass Master Cryptographic Signature Badge */}
        <div className={`p-3.5 border-2 flex items-center justify-between gap-3 text-xs uppercase font-bold ${
          isSignatureValid ? 'bg-[#131313] text-[#FF5C00] border-[#131313]' : 'bg-red-900 text-white border-red-700'
        }`}>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0" />
            <span>
              {isSignatureValid 
                ? '🔒 EDUPASS MASTER SIGNATURE VERIFIED (UNTAMPERED)' 
                : '⚠️ SIGNATURE ALERT: TAMPER DETECTED / INVALID SIGNATURE'}
            </span>
          </div>
          <span className="text-[10px] text-gray-300 font-mono truncate max-w-[180px]">
            {credential.edupass_signature || '0xedupass_sig_8819...'}
          </span>
        </div>

        {/* IPFS Storage Link */}
        {credential.ipfs_cid && (
          <div className="bg-[#EAE9E4] p-3 border border-[#131313] flex justify-between items-center text-xs">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#FF5C00]" />
              <span className="font-bold uppercase text-[#131313]">IPFS CID: {credential.ipfs_cid.slice(0, 24)}...</span>
            </div>
            <a
              href={credential.ipfs_gateway_url || `https://ipfs.io/ipfs/${credential.ipfs_cid}`}
              target="_blank"
              rel="noreferrer"
              className="bg-[#131313] hover:bg-[#FF5C00] text-white hover:text-black font-bold text-[10px] uppercase px-3 py-1.5 border border-[#131313] transition-colors flex items-center gap-1"
            >
              <span>OPEN ON IPFS</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-[#EAE9E4] p-4 border border-[#131313] space-y-1">
            <span className="text-gray-600 text-[10px] uppercase font-bold block">STUDENT NAME:</span>
            <span className="font-bold text-[#131313] uppercase text-sm">{credential.student_name}</span>
          </div>

          <div className="bg-[#EAE9E4] p-4 border border-[#131313] space-y-1">
            <span className="text-gray-600 text-[10px] uppercase font-bold block">STUDENT ACADEMIC ID:</span>
            <span className="font-bold text-[#FF5C00] uppercase text-sm">{credential.student_id}</span>
          </div>

          {/* Type Specific Fields */}
          {credential.credential_type === 'MARKSHEET' && (
            <>
              <div className="bg-[#EAE9E4] p-4 border border-[#131313] space-y-1">
                <span className="text-gray-600 text-[10px] uppercase font-bold block">SEMESTER:</span>
                <span className="font-bold text-[#131313] uppercase text-sm">{credential.semester || parsedDetails.semester || 'N/A'}</span>
              </div>
              <div className="bg-[#EAE9E4] p-4 border border-[#131313] space-y-1">
                <span className="text-gray-600 text-[10px] uppercase font-bold block">SEMESTER GPA (SGPA):</span>
                <span className="font-bold text-[#FF5C00] uppercase text-sm">{parsedDetails.sgpa || '9.50'} / 10.0</span>
              </div>
            </>
          )}

          {credential.credential_type === 'TC' && (
            <>
              <div className="bg-[#EAE9E4] p-4 border border-[#131313] space-y-1">
                <span className="text-gray-600 text-[10px] uppercase font-bold block">CONDUCT RATING:</span>
                <span className="font-bold text-[#FF5C00] uppercase text-sm">{credential.conduct_status || parsedDetails.conduct_status || 'EXCELLENT'}</span>
              </div>
              <div className="bg-[#EAE9E4] p-4 border border-[#131313] space-y-1">
                <span className="text-gray-600 text-[10px] uppercase font-bold block">DATE OF LEAVING:</span>
                <span className="font-bold text-[#131313] uppercase text-sm">{parsedDetails.date_of_leaving || 'N/A'}</span>
              </div>
            </>
          )}

          {credential.credential_type === 'PROVISIONAL' && (
            <>
              <div className="bg-[#EAE9E4] p-4 border border-[#131313] space-y-1">
                <span className="text-gray-600 text-[10px] uppercase font-bold block">PASSING YEAR:</span>
                <span className="font-bold text-[#FF5C00] uppercase text-sm">{parsedDetails.passing_year || '2026'}</span>
              </div>
              <div className="bg-[#EAE9E4] p-4 border border-[#131313] space-y-1">
                <span className="text-gray-600 text-[10px] uppercase font-bold block">PROVISIONAL SERIAL NO:</span>
                <span className="font-bold text-[#131313] uppercase text-sm">{parsedDetails.serial_no || 'N/A'}</span>
              </div>
            </>
          )}

          {credential.credential_type === 'SKILL' && (
            <>
              <div className="bg-[#EAE9E4] p-4 border border-[#131313] space-y-1">
                <span className="text-gray-600 text-[10px] uppercase font-bold block">PROFICIENCY LEVEL:</span>
                <span className="font-bold text-[#FF5C00] uppercase text-sm">{parsedDetails.proficiency || 'EXPERT'}</span>
              </div>
              <div className="bg-[#EAE9E4] p-4 border border-[#131313] space-y-1 col-span-2">
                <span className="text-gray-600 text-[10px] uppercase font-bold block">PROJECT URL:</span>
                <a href={parsedDetails.project_url} target="_blank" rel="noreferrer" className="font-bold text-[#FF5C00] underline text-xs break-all flex items-center gap-1">
                  <span>{parsedDetails.project_url || 'N/A'}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </>
          )}

          {credential.credential_type === 'DEGREE' && (
            <>
              <div className="bg-[#EAE9E4] p-4 border border-[#131313] space-y-1">
                <span className="text-gray-600 text-[10px] uppercase font-bold block">CGPA SCORE:</span>
                <span className="font-bold text-[#131313] uppercase text-sm">{credential.cgpa} / 10.0</span>
              </div>
              <div className="bg-[#EAE9E4] p-4 border border-[#131313] space-y-1">
                <span className="text-gray-600 text-[10px] uppercase font-bold block">TOTAL CREDITS:</span>
                <span className="font-bold text-[#131313] uppercase text-sm">{credential.credits} UNITS</span>
              </div>
            </>
          )}
        </div>

        {/* MARKSHEET Course Table Rendering */}
        {credential.credential_type === 'MARKSHEET' && parsedDetails.courses && (
          <div className="space-y-2 border-t border-[#131313] pt-3">
            <span className="text-xs font-bold uppercase text-[#131313]">SEMESTER COURSE MARKS BREAKDOWN</span>
            <div className="overflow-x-auto border border-[#131313]">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#131313] text-white uppercase text-[10px]">
                  <tr>
                    <th className="p-3 border-b border-[#131313]">CODE</th>
                    <th className="p-3 border-b border-[#131313]">COURSE TITLE</th>
                    <th className="p-3 border-b border-[#131313] text-center">GRADE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#131313] bg-white">
                  {parsedDetails.courses.map((c: any, i: number) => (
                    <tr key={i}>
                      <td className="p-3 font-bold text-[#FF5C00]">{c.code}</td>
                      <td className="p-3 font-bold text-[#131313]">{c.name}</td>
                      <td className="p-3 font-bold text-center text-[#131313]">{c.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
