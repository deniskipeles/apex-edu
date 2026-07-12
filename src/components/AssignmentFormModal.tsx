import React, { useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { X, UploadCloud, FileText, Calendar, DollarSign, HelpCircle, CheckCircle, Eye } from 'lucide-react';
import SecureDocumentViewer from './SecureDocumentViewer';

interface AssignmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AssignmentFormModal({ isOpen, onClose }: AssignmentFormModalProps) {
  const { courses, createAssignment, isLoading } = useStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseId, setCourseId] = useState('');
  const [budget, setBudget] = useState('30');
  const [deadline, setDeadline] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag-and-drop Handlers
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
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...droppedFiles]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!courseId) {
      setLocalError('Please select a corresponding course/subject');
      return;
    }

    const numericBudget = Number(budget);
    if (isNaN(numericBudget) || numericBudget <= 0) {
      setLocalError('Please enter a valid budget above $0');
      return;
    }

    if (!deadline) {
      setLocalError('Please set an assignment submission deadline');
      return;
    }

    const targetDeadline = new Date(deadline);
    if (targetDeadline <= new Date()) {
      setLocalError('Deadline must be in the future');
      return;
    }

    try {
      await createAssignment(title, description, courseId, numericBudget, deadline, files);
      
      // Clean form on success
      setTitle('');
      setDescription('');
      setCourseId('');
      setBudget('30');
      setDeadline('');
      setFiles([]);
      onClose();
    } catch (err: any) {
      setLocalError(err.message || 'Failed to submit assignment details');
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
            
            {/* Custom Header */}
            <div className="bg-slate-950 px-6 py-5 text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                  Student Request Board
                </span>
                <h3 className="text-lg font-bold tracking-tight heading-font mt-1">Post Assignment Task</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
              {localError && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/60 rounded-2xl text-xs text-rose-700 dark:text-rose-400 font-medium">
                  {localError}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Assignment Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 px-4 py-2.5 rounded-xl outline-none text-sm text-slate-800 dark:text-slate-100 transition-all"
                  placeholder="e.g. Binary Search Tree Implementation"
                />
              </div>

              {/* Grid: Course + Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Course Picker */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Course / Subject
                  </label>
                  <select
                    required
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 px-3.5 py-2.5 rounded-xl outline-none text-sm text-slate-800 dark:text-slate-100 transition-all"
                  >
                    <option value="" className="dark:bg-slate-900">Select Category</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id} className="dark:bg-slate-900">
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Budget */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5 flex justify-between items-center">
                    <span>Offered Budget (USD)</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">Escrow protected</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-semibold text-sm">$</span>
                    <input
                      type="number"
                      min="5"
                      required
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 pl-8 pr-4 py-2.5 rounded-xl outline-none text-sm text-slate-800 dark:text-slate-100 transition-all font-semibold"
                      placeholder="Budget"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Assignment Description & Requirements
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 px-4 py-2.5 rounded-xl outline-none text-sm text-slate-800 dark:text-slate-100 transition-all resize-none leading-relaxed"
                  placeholder="Outline the detailed guidelines, homework problems, programming conditions, or grading rubrics to help tutors make precise bids..."
                />
              </div>

              {/* Deadline */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Submission Deadline
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    required
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 pl-10 pr-4 py-2.5 rounded-xl outline-none text-sm text-slate-800 dark:text-slate-100 transition-all"
                  />
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Interactive File Dropzone */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Attach Support Files (Homework Briefs, Code Sheets, Readings)
                </label>
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                    isDragOver
                      ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-slate-50/50 dark:bg-slate-950/40'
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <UploadCloud className="w-8 h-8 text-sky-500 mb-2" />
                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Drag and drop files here, or <span className="text-sky-600 dark:text-sky-400 font-semibold">browse computer</span>
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">PDF, DOC, ZIP, PNG up to 15MB</p>
                </div>

                {/* Displaying File List */}
                {files.length > 0 && (
                  <div className="mt-3 space-y-2 max-h-[140px] overflow-y-auto">
                    {files.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-2.5 rounded-xl text-xs"
                      >
                        <FileText className="w-4 h-4 text-sky-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-700 dark:text-slate-300 truncate">{file.name}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFileName(file.name);
                              setViewerOpen(true);
                            }}
                            className="text-sky-500 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-950/40 p-1 rounded-lg cursor-pointer transition-colors"
                            title="Secure Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(idx)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    'Publish Request'
                  )}
                </button>
              </div>
            </form>
          </div>

          <SecureDocumentViewer
            isOpen={viewerOpen}
            onClose={() => setViewerOpen(false)}
            fileName={selectedFileName}
          />
        </div>
      )}
    </>
  );
}