'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/auth/context';
import { Globe, Award, ShieldCheck, CheckCircle2, Download, Copy, ExternalLink, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const COUNTRIES = [
  { code: 'UNITED STATES', name: 'UNITED STATES (US GPA 4.0 SCALE)', flag: '🇺🇸', system: 'WES / US Semester Credits' },
  { code: 'GERMANY', name: 'GERMANY (DE BAVARIAN 1.0–5.0 SCALE)', flag: '🇩🇪', system: 'ANABIN / ECTS System' },
  { code: 'UNITED KINGDOM', name: 'UNITED KINGDOM (UK HONORS CLASSIFICATION)', flag: '🇬🇧', system: 'ENIC / NARIC / CATS' },
  { code: 'CANADA', name: 'CANADA (CA 4.0 GPA & ECA)', flag: '🇨🇦', system: 'WES Canada / ECA' },
  { code: 'AUSTRALIA', name: 'AUSTRALIA (AQF DEGREE LEVEL 7)', flag: '🇦🇺', system: 'NOOSR / AQF Framework' },
];

function MobilityContent() {
  const { user, token } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState('UNITED STATES');
  const [mobilityData, setMobilityData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportedCert, setExportedCert] = useState<any | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const fetchEquivalence = async (countryCode: string) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/mobility/evaluate?country=${encodeURIComponent(countryCode)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMobilityData(data);
      }
    } catch (err) {
      console.error('Error fetching mobility evaluation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEquivalence(selectedCountry);
  }, [token, selectedCountry]);

  const handleExportCertificate = async () => {
    if (!token) return;
    setIsExporting(true);
    try {
      const res = await fetch(`${API_BASE}/mobility/export-certificate?country=${encodeURIComponent(selectedCountry)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setExportedCert(data);

        // Download JSON certificate
        const blob = new Blob([JSON.stringify(data.certificate_payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `EduPass_Equivalence_${selectedCountry.replace(/ /g, '_')}_${data.certificate_hash.slice(0, 8)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error exporting equivalence certificate:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const copyCertHash = () => {
    if (!exportedCert) return;
    navigator.clipboard.writeText(exportedCert.certificate_hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#E5E4DF] text-[#131313] font-mono selection:bg-[#FF5C00] selection:text-black">
      <Header />

      <main className="max-w-[1280px] mx-auto px-6 md:px-10 py-16 space-y-10">
        
        {/* Banner Header */}
        <div className="bg-[#131313] text-white border-2 border-[#131313] p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="bg-[#FF5C00] text-[#131313] text-[10px] font-bold px-3 py-1 uppercase">
                CROSS-BORDER EQUIVALENCE ENGINE
              </span>
              <span className="text-xs uppercase text-gray-300">STUDENT ID: {user?.student_id || 'ACTIVE'}</span>
            </div>

            <h1 className="font-anton text-3xl md:text-5xl uppercase tracking-tight text-white">
              GLOBAL ACADEMIC MOBILITY HUB
            </h1>
            <p className="text-xs uppercase text-gray-300 max-w-2xl">
              Convert CGPA, course credit units, and degree qualifications across US, European ECTS, German Bavarian, and UK Naric frameworks with cryptographic proof.
            </p>
          </div>

          <button
            onClick={handleExportCertificate}
            disabled={isExporting || isLoading}
            className="bg-[#FF5C00] hover:bg-white text-[#131313] font-mono font-bold text-xs uppercase px-6 py-4 border border-[#131313] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'EXPORTING...' : 'EXPORT VERIFIABLE EQUIVALENCE CERTIFICATE'}</span>
          </button>
        </div>

        {/* Target Country Selector Bar */}
        <div className="bg-[#E2E1DC] border-2 border-[#131313] p-6 space-y-4">
          <label className="block text-xs font-bold uppercase text-[#131313]">
            SELECT TARGET DESTINATION COUNTRY / ADMISSION JURISDICTION *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {COUNTRIES.map((c) => (
              <button
                key={c.code}
                onClick={() => setSelectedCountry(c.code)}
                className={`p-4 border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  selectedCountry === c.code 
                    ? 'bg-[#131313] text-white border-[#131313]' 
                    : 'bg-[#EAE9E4] text-[#131313] border-[#131313] hover:border-[#FF5C00]'
                }`}
              >
                <div className="space-y-1">
                  <span className="text-xl block">{c.flag}</span>
                  <h3 className="font-bold text-xs uppercase">{c.code}</h3>
                </div>
                <span className="text-[9px] opacity-70 block uppercase mt-2">{c.system}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Evaluation Output Section */}
        {isLoading ? (
          <div className="p-12 text-center text-xs font-bold uppercase animate-pulse">
            EVALUATING CROSS-BORDER DEGREE EQUIVALENCY & GRADE NORMALIZATION...
          </div>
        ) : mobilityData && (
          <div className="space-y-8">
            
            {/* Verdict & Eligibility Card */}
            <div className="bg-[#131313] text-white border-2 border-[#131313] p-8 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-6">
                <div>
                  <span className="text-[#FF5C00] font-bold text-xs uppercase tracking-widest block mb-1">
                    [ EQUIVALENCE VERDICT ]
                  </span>
                  <h2 className="font-anton text-2xl md:text-3xl uppercase text-white">
                    {mobilityData.evaluation.equivalence_verdict}
                  </h2>
                </div>

                <div className="bg-[#1A1A1A] p-4 border border-gray-800 text-center shrink-0">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase">TRANSFERABILITY SCORE</span>
                  <span className="font-anton text-3xl text-[#FF5C00]">{mobilityData.evaluation.transferability_score}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                <div className="bg-[#1A1A1A] p-5 border border-gray-800 space-y-1">
                  <span className="text-gray-400 text-[10px] block uppercase font-bold">TARGET NORMALIZED GPA / GRADE</span>
                  <span className="text-xl font-bold text-[#FF5C00]">{mobilityData.evaluation.normalized_gpa}</span>
                </div>

                <div className="bg-[#1A1A1A] p-5 border border-gray-800 space-y-1">
                  <span className="text-gray-400 text-[10px] block uppercase font-bold">CREDIT HOUR EQUIVALENT</span>
                  <span className="text-xl font-bold text-white">{mobilityData.evaluation.ects_equivalent_credits} UNITS / ECTS</span>
                </div>

                <div className="bg-[#1A1A1A] p-5 border border-gray-800 space-y-1">
                  <span className="text-gray-400 text-[10px] block uppercase font-bold">QUALIFICATION FRAMEWORK</span>
                  <span className="text-sm font-bold text-white uppercase">{mobilityData.evaluation.qualification_level}</span>
                </div>
              </div>
            </div>

            {/* Detailed Grade Normalization Grid */}
            <div className="bg-[#E2E1DC] border-2 border-[#131313] p-6 md:p-8 space-y-6">
              <div className="border-b border-[#131313] pb-4 flex justify-between items-center">
                <h2 className="font-anton text-2xl uppercase text-[#131313]">
                  INTERNATIONAL GRADE NORMALIZATION SCALES (MODULE 42)
                </h2>
                <span className="text-xs uppercase font-bold text-[#FF5C00]">ORIGINAL CGPA: {mobilityData.evaluation.original_cgpa} / 10.0</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="bg-[#EAE9E4] p-5 border border-[#131313] space-y-2">
                  <span className="text-gray-600 text-[10px] block uppercase font-bold">🇺🇸 US 4.0 GPA SCALE</span>
                  <span className="text-2xl font-bold text-[#131313]">{mobilityData.evaluation.grade_breakdown.us_gpa} / 4.0</span>
                  <p className="text-[10px] text-gray-500">Converted for US Universities & WES Evaluation.</p>
                </div>

                <div className="bg-[#EAE9E4] p-5 border border-[#131313] space-y-2">
                  <span className="text-gray-600 text-[10px] block uppercase font-bold">🇩🇪 GERMAN BAVARIAN SCALE</span>
                  <span className="text-2xl font-bold text-[#FF5C00]">{mobilityData.evaluation.grade_breakdown.german_grade}</span>
                  <p className="text-[10px] text-gray-500">Bavarian Formula (1.0 = Max, 5.0 = Fail).</p>
                </div>

                <div className="bg-[#EAE9E4] p-5 border border-[#131313] space-y-2">
                  <span className="text-gray-600 text-[10px] block uppercase font-bold">🇪🇺 EUROPEAN ECTS GRADE</span>
                  <span className="text-base font-bold text-[#131313]">{mobilityData.evaluation.grade_breakdown.ects_grade}</span>
                  <p className="text-[10px] text-gray-500">European Credit Transfer System.</p>
                </div>

                <div className="bg-[#EAE9E4] p-5 border border-[#131313] space-y-2">
                  <span className="text-gray-600 text-[10px] block uppercase font-bold">🇬🇧 UK HONORS CLASSIFICATION</span>
                  <span className="text-base font-bold text-[#131313]">{mobilityData.evaluation.grade_breakdown.uk_classification}</span>
                  <p className="text-[10px] text-gray-500">ENIC UK Academic Equivalent.</p>
                </div>
              </div>
            </div>

            {/* Exported Certificate Card if generated */}
            {exportedCert && (
              <div className="bg-[#131313] text-white p-6 border-2 border-[#131313] space-y-4">
                <div className="flex justify-between items-center border-b border-gray-700 pb-3">
                  <span className="text-[#FF5C00] font-bold text-xs uppercase flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#FF5C00]" />
                    <span>INTERNATIONAL EQUIVALENCE CERTIFICATE EXPORTED</span>
                  </span>
                  <button
                    onClick={copyCertHash}
                    className="text-[10px] text-white hover:text-[#FF5C00] flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedHash ? 'COPIED!' : 'COPY HASH'}</span>
                  </button>
                </div>

                <p className="text-xs text-gray-300">
                  Certificate successfully downloaded to your device as a JSON payload backed by cryptographic SHA-256 hash.
                </p>

                <div className="bg-[#1A1A1A] p-3 border border-gray-800 text-[11px] font-mono text-[#FF5C00] break-all font-bold">
                  {exportedCert.certificate_hash}
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}

export default function MobilityPage() {
  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <MobilityContent />
    </ProtectedRoute>
  );
}
