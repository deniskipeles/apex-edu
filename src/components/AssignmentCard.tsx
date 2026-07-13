import React, { useState } from 'react';
import { Assignment, Bid } from '../types';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Calendar, DollarSign, FileText, Download, Users, Star, MessageSquare, ShieldCheck, ArrowRight, Eye, UploadCloud, X } from 'lucide-react';
import SecureDocumentViewer from './SecureDocumentViewer';

interface AssignmentCardProps {
  assignment: Assignment;
  onPlaceBid?: () => void;
  onAcceptBid?: (bidId: string) => void;
  onComplete?: () => void;
  onPayTutor?: () => void;
  key?: string | number;
}

export default function AssignmentCard({
  assignment,
  onPlaceBid,
  onAcceptBid,
  onComplete,
  onPayTutor,
}: AssignmentCardProps) {
  const { currentUser, bids, startChat, markAssignmentCompleted } = useStore();
  const navigate = useNavigate();
  const [showBidsPanel, setShowBidsPanel] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');

  // Delivery Upload Modal states
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [solutionFiles, setSolutionFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  // Delivery handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setSolutionFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSolutionFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSolutionFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (solutionFiles.length === 0) return;

    const solutionUrls = solutionFiles.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size,
    }));

    await markAssignmentCompleted(assignment.id, solutionUrls);
    setDeliveryModalOpen(false);
    setSolutionFiles([]);
  };

  // Filter bids for this specific assignment using safe-casted ID comparison
  const assignmentBids = bids.filter((b) => String(b.assignmentId) === String(assignment.id));

  // Status mapping styled pill
  const getStatusBadge = () => {
    switch (assignment.status) {
      case 'open':
        return <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Open</span>;
      case 'bidded':
        return <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-emerald-900 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Bids In ({assignmentBids.length})</span>;
      case 'active':
        return <span className="bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-900 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">In Progress</span>;
      case 'completed':
        return <span className="bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-350 border border-purple-200 dark:border-purple-900 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Completed</span>;
      case 'paid':
        return <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Paid & Closed</span>;
      case 'cancelled':
        return <span className="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">Cancelled</span>;
      default:
        return null;
    }
  };

  // Humanize deadline dates
  const formatDeadline = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const isStudentOwner = String(currentUser?.id) === String(assignment.studentId);
  const isTutorCandidate = currentUser?.role === 'tutor';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300" id={`assignment_card_${assignment.id}`}>
      {/* Card Body */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* Course + Status Row */}
        <div className="flex items-center justify-between">
          <span className="mono-font bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-350 font-bold px-3 py-1 rounded-xl text-xs tracking-wide border border-sky-100/10 dark:border-sky-900/40">
            {assignment.courseCode}
          </span>
          {getStatusBadge()}
        </div>

        {/* Title & Description */}
        <div>
          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base heading-font tracking-tight group-hover:text-sky-600 transition-colors">
            {assignment.title}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed whitespace-pre-line">
            {assignment.description}
          </p>
        </div>

        {/* Deliverables lists */}
        {assignment.fileUrls && assignment.fileUrls.length > 0 && (
          <div className="pt-2">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide block mb-2">Attached briefings</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {assignment.fileUrls.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2 rounded-xl text-[11px]"
                >
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <FileText className="w-4 h-4 text-sky-500 shrink-0" />
                    <span className="text-slate-600 dark:text-slate-300 truncate font-medium">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setSelectedFileName(file.name);
                        setViewerOpen(true);
                      }}
                      className="p-1 hover:bg-sky-100 dark:hover:bg-sky-950 text-sky-600 dark:text-sky-400 rounded-lg shrink-0 transition-colors"
                      title="Read Securely"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={file.url}
                      download={file.name}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg shrink-0 transition-colors"
                      title="Download briefing"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Secure Document Viewer Modal */}
        <SecureDocumentViewer
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          fileName={selectedFileName}
        />

        {/* Delivered Solutions Section */}
        {assignment.solutionUrls && assignment.solutionUrls.length > 0 && (
          <div className="pt-2">
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wide flex items-center gap-1 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Delivered Solutions & Works
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-emerald-50/40 dark:bg-emerald-950/10 p-3 border border-emerald-100 dark:border-emerald-900/60 rounded-2xl">
              {assignment.solutionUrls.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 rounded-xl text-[11px] shadow-sm animate-in fade-in"
                >
                  <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <FileText className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300 truncate font-medium">{file.name}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setSelectedFileName(file.name);
                        setViewerOpen(true);
                      }}
                      className="p-1 hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0 transition-colors cursor-pointer"
                      title="Read Securely"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={file.url}
                      download={file.name}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg shrink-0 transition-colors"
                      title="Download solution"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deliver Finished Solution Modal */}
        {deliveryModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4 shrink-0">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm heading-font">Upload Finished Solutions & Deliver</h4>
                </div>
                <button
                  onClick={() => {
                    setDeliveryModalOpen(false);
                    setSolutionFiles([]);
                  }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitDelivery} className="space-y-4 flex-1 overflow-y-auto pr-1">
                <div className="bg-sky-50/50 dark:bg-sky-950/20 text-sky-800 dark:text-sky-300 p-3 rounded-2xl text-[11px] border border-sky-100/50 dark:border-sky-900/40 leading-relaxed">
                  Deliver high-fidelity documents (such as final code sheets, SVG diagrams, or HTML guides). EduSolve converted representations will generate single-page secure elements at the edge for tutor work protection.
                </div>

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    isDragOver
                      ? 'border-emerald-500 bg-emerald-50/30'
                      : 'border-slate-200 dark:border-slate-800 hover:border-sky-500 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-sky-50/10 dark:hover:bg-sky-950'
                  }`}
                  onClick={() => document.getElementById(`solution_file_upload_${assignment.id}`)?.click()}
                >
                  <input
                    type="file"
                    id={`solution_file_upload_${assignment.id}`}
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <UploadCloud className={`w-8 h-8 mx-auto mb-2 transition-colors ${isDragOver ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Drag & drop files here</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">or click to browse local files</span>
                </div>

                {/* File List */}
                {solutionFiles.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide block">Selected Deliverable Files</span>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {solutionFiles.map((file, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800 p-2.5 rounded-xl text-xs"
                        >
                          <div className="flex items-center gap-2 overflow-hidden flex-1">
                            <FileText className="w-4 h-4 text-sky-500 shrink-0" />
                            <div>
                              <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block max-w-[200px]">{file.name}</span>
                              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">{(file.size / 1024).toFixed(1)} KB</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(idx)}
                            className="text-slate-400 hover:text-rose-500 p-1 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 flex gap-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryModalOpen(false);
                      setSolutionFiles([]);
                    }}
                    className="flex-1 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={solutionFiles.length === 0}
                    className="flex-1 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Deliver & Complete Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Meta Stats Panel */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Budget */}
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-450 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-none font-medium">Offered Budget</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">${assignment.budget}</span>
            </div>
          </div>

          {/* Deadline */}
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-450 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-none font-medium">Deadline Date</span>
              <span className="font-semibold text-slate-700 dark:text-slate-350">{formatDeadline(assignment.deadline)}</span>
            </div>
          </div>

          {/* Student or Assigned Tutor Name */}
          <div className="flex items-center gap-1.5">
            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-450 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-none font-medium">
                {assignment.tutorName ? 'Assigned Tutor' : 'Posted By'}
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-350">
                {assignment.tutorName || assignment.studentName}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button Strip */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          {/* View Bids Counter for Owners */}
          {isStudentOwner && (assignment.status === 'open' || assignment.status === 'bidded') && (
            <button
              type="button"
              onClick={() => setShowBidsPanel(!showBidsPanel)}
              className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs px-3.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold cursor-pointer transition-colors"
            >
              <Users className="w-4 h-4" />
              Candidates ({assignmentBids.length})
            </button>
          )}

          {/* Place Bid Button for Tutors */}
          {isTutorCandidate && assignment.status === 'open' && (
            <button
              onClick={onPlaceBid}
              className="w-full sm:w-auto ml-auto bg-sky-600 hover:bg-sky-700 text-white text-xs px-4 py-2.5 rounded-xl shadow-sm font-semibold cursor-pointer transition-colors"
            >
              Propose Solution & Quote
            </button>
          )}

          {/* Chat room buttons for Contract Participants */}
          {assignment.status === 'active' && (String(currentUser?.id) === String(assignment.studentId) || String(currentUser?.id) === String(assignment.tutorId)) && (
            <button
              onClick={() => {
                startChat(isStudentOwner ? assignment.tutorId! : assignment.studentId!);
                navigate('/dashboard?tab=messages');
              }}
              className="flex items-center gap-1.5 bg-slate-950 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-750 text-xs px-4 py-2.5 rounded-xl font-semibold cursor-pointer transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Direct Workspace Chat
            </button>
          )}

          {/* Mark Completed Button for Tutor in Active Contract */}
          {assignment.status === 'active' && String(currentUser?.id) === String(assignment.tutorId) && (
            <button
              onClick={() => setDeliveryModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2.5 rounded-xl shadow-sm font-bold cursor-pointer transition-colors"
            >
              Deliver Finished Files
            </button>
          )}

          {/* Student Release Escrow Button */}
          {assignment.status === 'completed' && isStudentOwner && onPayTutor && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Solutions Uploaded!
              </span>
              <button
                onClick={onPayTutor}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2.5 rounded-xl shadow-sm font-bold cursor-pointer transition-all"
              >
                Approve & Release Funds (${assignment.budget})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sub-Panel: Bid lists for Student to inspect & award */}
      {showBidsPanel && isStudentOwner && (
        <div className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 p-4 space-y-3.5">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
            Award Contract to Tutor
          </span>
          {assignmentBids.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">Waiting for tutors to place bids on this task...</p>
          ) : (
            <div className="space-y-3">
              {assignmentBids.map((bid) => (
                <div
                  key={bid.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl flex flex-col sm:flex-row gap-3 items-start justify-between"
                >
                  <div className="flex gap-2.5 items-start">
                    <img
                      src={bid.tutorAvatar || 'https://api.dicebear.com/7.x/pixel-art/svg'}
                      alt={bid.tutorName}
                      className="w-9 h-9 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm mt-0.5 object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs heading-font">{bid.tutorName}</span>
                        <div className="flex items-center gap-0.5 text-amber-500 font-bold text-[10px]">
                          <Star className="w-3.5 h-3.5 fill-amber-500" /> {bid.tutorRating}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{bid.proposal}</p>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto shrink-0 flex items-center justify-between sm:flex-col sm:items-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 block leading-none font-semibold uppercase tracking-wider">Tutor Bid</span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 leading-normal block">${bid.amount}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          startChat(bid.tutorId, assignment.id);
                          navigate('/dashboard?tab=messages');
                        }}
                        className="text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 p-1.5 rounded-lg text-xs"
                        title="Chat to negotiate"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onAcceptBid && onAcceptBid(bid.id)}
                        className="bg-sky-600 text-white hover:bg-sky-700 text-xs px-3.5 py-1.5 rounded-lg shadow-sm font-bold cursor-pointer flex items-center gap-1 transition-all"
                      >
                        Accept Bid <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
