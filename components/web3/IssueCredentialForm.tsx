'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { stringToBytes, keccak256 } from 'viem';
import { CREDENTIAL_REGISTRY_ADDRESS, CREDENTIAL_REGISTRY_ABI } from '@/web3/contracts';
import { Award, ShieldCheck, CheckCircle2, AlertCircle, Copy, FileText, Plus, Trash2, Calendar, FileCode, Check, Zap } from 'lucide-react';
import ConnectWallet from './ConnectWallet';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function IssueCredentialForm() {
  const { isConnected } = useAccount();
  const [formType, setFormType] = useState<'DEGREE' | 'MARKSHEET' | 'TC' | 'PROVISIONAL' | 'SKILL'>('DEGREE');
  const [enableOnChain, setEnableOnChain] = useState(false);

  // Common fields
  const [studentId, setStudentId] = useState('EDU-2026-0687');
  const [studentName, setStudentName] = useState('Yeswanth Ram JP');
  const [studentWallet, setStudentWallet] = useState('');

  // Degree specific
  const [degree, setDegree] = useState('B.Tech Computer Science');
  const [cgpa, setCgpa] = useState('9.37');
  const [credits, setCredits] = useState('142');

  // Marksheet specific
  const [semester, setSemester] = useState('SEMESTER 5');
  const [sgpa, setSgpa] = useState('9.50');
  const [courses, setCourses] = useState([
    { code: 'CS301', name: 'Data Structures & Algorithms', grade: 'A+' },
    { code: 'CS302', name: 'Database Management Systems', grade: 'A' },
    { code: 'CS303', name: 'Computer Networks', grade: 'A+' },
  ]);

  // TC specific
  const [conductStatus, setConductStatus] = useState('EXCELLENT');
  const [dateOfLeaving, setDateOfLeaving] = useState('2026-05-15');
  const [feeClearance, setFeeClearance] = useState('FULL_NO_DUES');

  // Provisional specific
  const [passingYear, setPassingYear] = useState('2026');
  const [serialNo, setSerialNo] = useState('PROV-2026-88192');

  // Skill specific
  const [skillName, setSkillName] = useState('Zero-Knowledge Cryptography & Rust');
  const [proficiency, setProficiency] = useState('ADVANCED / EXPERT');
  const [projectUrl, setProjectUrl] = useState('https://github.com/YeswanthRam28/EdupassKaipulla');

  // Result state
  const [issuedCred, setIssuedCred] = useState<any | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: txHash, isPending: isTxPending, writeContract: registerOnChain } = useWriteContract();
  const { isSuccess: isTxConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  const addCourseRow = () => {
    setCourses([...courses, { code: '', name: '', grade: 'A' }]);
  };

  const removeCourseRow = (idx: number) => {
    setCourses(courses.filter((_, i) => i !== idx));
  };

  const handleCourseChange = (idx: number, field: string, val: string) => {
    const updated = [...courses];
    (updated[idx] as any)[field] = val;
    setCourses(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIssuedCred(null);

    if (!studentId.trim() || !studentName.trim()) {
      setError('Please provide student ID and student name.');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('edupass_auth_token');
      let detailsPayload: any = {};

      if (formType === 'MARKSHEET') {
        detailsPayload = { semester, sgpa, courses };
      } else if (formType === 'TC') {
        detailsPayload = { conduct_status: conductStatus, date_of_leaving: dateOfLeaving, fee_clearance: feeClearance };
      } else if (formType === 'PROVISIONAL') {
        detailsPayload = { passing_year: passingYear, serial_no: serialNo };
      } else if (formType === 'SKILL') {
        detailsPayload = { skill_name: skillName, proficiency, project_url: projectUrl };
      }

      const res = await fetch(`${API_BASE}/credentials/issue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          student_id: studentId.trim().toUpperCase(),
          student_name: studentName.trim(),
          student_wallet: studentWallet.trim() || undefined,
          credential_type: formType,
          degree: formType === 'SKILL' ? skillName : degree.trim(),
          cgpa: parseFloat(cgpa || '0'),
          credits: parseInt(credits || '0', 10),
          semester: formType === 'MARKSHEET' ? semester : undefined,
          conduct_status: formType === 'TC' ? conductStatus : undefined,
          details_json: JSON.stringify(detailsPayload),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Issuance failed.');
      }

      const data = await res.json();
      setIssuedCred(data);

      // On-chain broadcast only if explicitly checked AND wallet connected
      if (enableOnChain && isConnected && data.commitment_hash) {
        try {
          const credIdBytes32 = keccak256(stringToBytes(data.id));
          const commitmentBytes32 = data.commitment_hash as `0x${string}`;
          registerOnChain({
            address: CREDENTIAL_REGISTRY_ADDRESS,
            abi: CREDENTIAL_REGISTRY_ABI,
            functionName: 'registerCredential',
            args: [credIdBytes32, commitmentBytes32],
            gas: BigInt(100000), // Hard-cap max gas limit to prevent astronomical gas estimates (~0.0001 SHM)
          });
        } catch (contractErr) {
          console.log('On-chain registration skipped/bypassed:', contractErr);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error issuing credential.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCommitmentHash = () => {
    if (!issuedCred) return;
    navigator.clipboard.writeText(issuedCred.commitment_hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#E2E1DC] border-2 border-[#131313] p-6 md:p-10 space-y-8 font-mono">
      {/* Header */}
      <div className="border-b border-[#131313] pb-6 flex justify-between items-start gap-4">
        <div>
          <span className="text-xs font-bold text-[#FF5C00] uppercase tracking-widest block">
            [ INSTITUTION ISSUANCE SUITE ]
          </span>
          <h2 className="font-anton text-2xl md:text-4xl uppercase text-[#131313] mt-1">
            REGISTER & ISSUE ACADEMIC CREDENTIAL
          </h2>
        </div>
        <ConnectWallet />
      </div>

      {/* Internal Sub-Tabs for Form Kinds */}
      <div className="flex flex-wrap border-2 border-[#131313] bg-[#EAE9E4]">
        <button
          type="button"
          onClick={() => setFormType('DEGREE')}
          className={`flex-1 min-w-[120px] py-3 text-xs font-bold uppercase transition-colors border-r border-[#131313] cursor-pointer ${
            formType === 'DEGREE' ? 'bg-[#131313] text-[#FF5C00]' : 'text-[#131313] hover:text-[#FF5C00]'
          }`}
        >
          🎓 DEGREE
        </button>

        <button
          type="button"
          onClick={() => setFormType('MARKSHEET')}
          className={`flex-1 min-w-[120px] py-3 text-xs font-bold uppercase transition-colors border-r border-[#131313] cursor-pointer ${
            formType === 'MARKSHEET' ? 'bg-[#131313] text-[#FF5C00]' : 'text-[#131313] hover:text-[#FF5C00]'
          }`}
        >
          📊 MARKSHEET
        </button>

        <button
          type="button"
          onClick={() => setFormType('TC')}
          className={`flex-1 min-w-[120px] py-3 text-xs font-bold uppercase transition-colors border-r border-[#131313] cursor-pointer ${
            formType === 'TC' ? 'bg-[#131313] text-[#FF5C00]' : 'text-[#131313] hover:text-[#FF5C00]'
          }`}
        >
          📜 TRANSFER CERT (TC)
        </button>

        <button
          type="button"
          onClick={() => setFormType('PROVISIONAL')}
          className={`flex-1 min-w-[120px] py-3 text-xs font-bold uppercase transition-colors border-r border-[#131313] cursor-pointer ${
            formType === 'PROVISIONAL' ? 'bg-[#131313] text-[#FF5C00]' : 'text-[#131313] hover:text-[#FF5C00]'
          }`}
        >
          🎓 PROVISIONAL
        </button>

        <button
          type="button"
          onClick={() => setFormType('SKILL')}
          className={`flex-1 min-w-[120px] py-3 text-xs font-bold uppercase transition-colors cursor-pointer ${
            formType === 'SKILL' ? 'bg-[#131313] text-[#FF5C00]' : 'text-[#131313] hover:text-[#FF5C00]'
          }`}
        >
          🏆 SKILL BADGE
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-500 text-red-900 p-4 text-xs font-bold uppercase flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Common Student Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase text-[#131313]">
              STUDENT ACADEMIC ID *
            </label>
            <input
              type="text"
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g. EDU-2026-0687"
              className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] font-mono text-xs uppercase font-bold focus:outline-none focus:border-[#FF5C00]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase text-[#131313]">
              STUDENT FULL NAME *
            </label>
            <input
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Yeswanth Ram JP"
              className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] font-mono text-xs uppercase font-bold focus:outline-none focus:border-[#FF5C00]"
            />
          </div>
        </div>

        {/* Dynamic Fields for DEGREE */}
        {formType === 'DEGREE' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[#131313]">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-[#131313]">DEGREE TITLE *</label>
              <input
                type="text"
                required
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="B.Tech Computer Science"
                className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] text-xs uppercase focus:outline-none focus:border-[#FF5C00]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-[#131313]">CGPA SCORE *</label>
              <input
                type="number"
                step="0.01"
                required
                value={cgpa}
                onChange={(e) => setCgpa(e.target.value)}
                placeholder="9.37"
                className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] text-xs uppercase focus:outline-none focus:border-[#FF5C00]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-[#131313]">TOTAL CREDITS *</label>
              <input
                type="number"
                required
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                placeholder="142"
                className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] text-xs uppercase focus:outline-none focus:border-[#FF5C00]"
              />
            </div>
          </div>
        )}

        {/* Dynamic Fields for MARKSHEET */}
        {formType === 'MARKSHEET' && (
          <div className="space-y-4 pt-2 border-t border-[#131313]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-[#131313]">DEGREE PROGRAM *</label>
                <input
                  type="text"
                  required
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="B.Tech Computer Science"
                  className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] text-xs uppercase"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-[#131313]">SEMESTER NUMBER *</label>
                <input
                  type="text"
                  required
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  placeholder="SEMESTER 5"
                  className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] text-xs uppercase font-bold text-[#FF5C00]"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-[#131313]">SEMESTER GPA (SGPA) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={sgpa}
                  onChange={(e) => setSgpa(e.target.value)}
                  placeholder="9.50"
                  className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] text-xs uppercase"
                />
              </div>
            </div>

            {/* Course Breakdown Table */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase text-[#131313]">DETAILED COURSE MARKS BREAKDOWN</span>
                <button
                  type="button"
                  onClick={addCourseRow}
                  className="text-xs font-bold text-[#FF5C00] bg-[#131313] px-3 py-1 uppercase flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD COURSE</span>
                </button>
              </div>

              <div className="space-y-2">
                {courses.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-[#EAE9E4] p-2 border border-[#131313]">
                    <input
                      type="text"
                      placeholder="CODE (CS301)"
                      value={c.code}
                      onChange={(e) => handleCourseChange(idx, 'code', e.target.value)}
                      className="w-28 bg-white p-2 border border-[#131313] text-xs uppercase"
                    />
                    <input
                      type="text"
                      placeholder="COURSE TITLE"
                      value={c.name}
                      onChange={(e) => handleCourseChange(idx, 'name', e.target.value)}
                      className="flex-1 bg-white p-2 border border-[#131313] text-xs uppercase"
                    />
                    <input
                      type="text"
                      placeholder="GRADE (A+)"
                      value={c.grade}
                      onChange={(e) => handleCourseChange(idx, 'grade', e.target.value)}
                      className="w-20 bg-white p-2 border border-[#131313] text-xs uppercase font-bold text-center"
                    />
                    <button
                      type="button"
                      onClick={() => removeCourseRow(idx)}
                      className="p-2 text-red-600 hover:text-black cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Fields for TC */}
        {formType === 'TC' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[#131313]">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-[#131313]">DATE OF LEAVING *</label>
              <input
                type="date"
                required
                value={dateOfLeaving}
                onChange={(e) => setDateOfLeaving(e.target.value)}
                className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] text-xs uppercase font-bold text-[#FF5C00]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-[#131313]">CONDUCT RATING *</label>
              <select
                value={conductStatus}
                onChange={(e) => setConductStatus(e.target.value)}
                className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] text-xs font-bold uppercase"
              >
                <option value="EXCELLENT">EXCELLENT</option>
                <option value="GOOD">GOOD</option>
                <option value="SATISFACTORY">SATISFACTORY</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-[#131313]">FEE CLEARANCE STATUS *</label>
              <select
                value={feeClearance}
                onChange={(e) => setFeeClearance(e.target.value)}
                className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] text-xs font-bold uppercase"
              >
                <option value="FULL_NO_DUES">ALL DUES CLEARED</option>
                <option value="SCHOLARSHIP_HOLD">SCHOLARSHIP HOLD</option>
              </select>
            </div>
          </div>
        )}

        {/* Dynamic Fields for PROVISIONAL */}
        {formType === 'PROVISIONAL' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[#131313]">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-[#131313]">DEGREE TITLE *</label>
              <input
                type="text"
                required
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="B.Tech Computer Science"
                className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] text-xs uppercase"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-[#131313]">PASSING YEAR *</label>
              <input
                type="text"
                required
                value={passingYear}
                onChange={(e) => setPassingYear(e.target.value)}
                placeholder="2026"
                className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] text-xs uppercase font-bold text-[#FF5C00]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-[#131313]">PROVISIONAL SERIAL NO *</label>
              <input
                type="text"
                required
                value={serialNo}
                onChange={(e) => setSerialNo(e.target.value)}
                placeholder="PROV-2026-88192"
                className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] text-xs uppercase"
              />
            </div>
          </div>
        )}

        {/* Dynamic Fields for SKILL BADGE */}
        {formType === 'SKILL' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-[#131313]">
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-[#131313]">SKILL NAME *</label>
              <input
                type="text"
                required
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="Zero-Knowledge Cryptography & Rust"
                className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] text-xs uppercase font-bold text-[#FF5C00]"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-[#131313]">PROFICIENCY RATING *</label>
              <input
                type="text"
                required
                value={proficiency}
                onChange={(e) => setProficiency(e.target.value)}
                placeholder="ADVANCED / EXPERT"
                className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] text-xs uppercase"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-[#131313]">PROJECT / REPO URL *</label>
              <input
                type="url"
                required
                value={projectUrl}
                onChange={(e) => setProjectUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full bg-[#EAE9E4] px-4 py-3 border border-[#131313] text-xs"
              />
            </div>
          </div>
        )}

        {/* Shardeum / EVM Gas Optimization Checkbox */}
        <div className="bg-[#EAE9E4] p-4 border border-[#131313] flex items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-xs font-bold uppercase text-[#131313] cursor-pointer">
            <input
              type="checkbox"
              checked={enableOnChain}
              onChange={(e) => setEnableOnChain(e.target.checked)}
              className="w-4 h-4 accent-[#FF5C00] cursor-pointer"
            />
            <span>BROADCAST COMMITMENT ON SHARDEUM EVM BLOCKCHAIN</span>
          </label>
          <span className="text-[10px] text-gray-600 font-mono">
            {enableOnChain ? '⚡ GAS CAPPED AT 100K GAS (~0.0001 SHM)' : 'OFF-CHAIN DB ONLY (0 GAS)'}
          </span>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#131313] hover:bg-[#FF5C00] text-white hover:text-black font-mono font-bold text-xs uppercase py-4 border border-[#131313] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Award className="w-4 h-4 text-[#FF5C00]" />
          <span>{isSubmitting ? 'ISSUING CREDENTIAL...' : `ISSUE VERIFIABLE ${formType} CREDENTIAL`}</span>
        </button>

      </form>

      {/* Result Card */}
      {issuedCred && (
        <div className="bg-[#131313] text-white p-6 border-2 border-[#131313] space-y-4 font-mono">
          <div className="flex justify-between items-center border-b border-gray-700 pb-3">
            <span className="text-[#FF5C00] font-bold text-xs uppercase flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FF5C00]" />
              <span>{issuedCred.credential_type} ISSUED & REGISTERED</span>
            </span>
            <span className="text-[10px] text-gray-400 font-bold uppercase">ID: {issuedCred.id.slice(0, 8)}</span>
          </div>

          <div className="text-xs space-y-1">
            <p><strong>STUDENT:</strong> {issuedCred.student_name} ({issuedCred.student_id})</p>
            <p><strong>QUALIFICATION:</strong> {issuedCred.degree}</p>
            <p><strong>ISSUER:</strong> {issuedCred.institution_name}</p>
          </div>

          <div className="bg-[#1A1A1A] p-3 border border-gray-800 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-[10px] block uppercase font-bold">COMMITMENT HASH (SHA-256):</span>
              <button
                onClick={copyCommitmentHash}
                className="text-[10px] text-white hover:text-[#FF5C00] flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedHash ? 'COPIED!' : 'COPY'}</span>
              </button>
            </div>
            <p className="text-[10px] text-[#FF5C00] font-mono break-all font-bold">{issuedCred.commitment_hash}</p>
          </div>
        </div>
      )}
    </div>
  );
}
