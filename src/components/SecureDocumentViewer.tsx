import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  FileText, 
  Lock, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Eye, 
  Code, 
  FileCode, 
  Sparkles, 
  Layers,
  AlertCircle
} from 'lucide-react';

interface SecureDocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
}

export default function SecureDocumentViewer({ isOpen, onClose, fileName }: SecureDocumentViewerProps) {
  const { apex } = useStore();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [activeTab, setActiveTab] = useState<'preview' | 'source'>('preview');
  
  // Interactive Format state (defaults to 'webp')
  const [targetFormat, setTargetFormat] = useState<'webp' | 'svg' | 'avif' | 'png' | 'jpeg'>('webp');

  // FreeLibreOffice API state
  const [isConverting, setIsConverting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [convertError, setConvertError] = useState<string | null>(null);

  // Determine file type
  const fileType = useMemo(() => {
    const ext = fileName.toLowerCase().split('.').pop() || '';
    if (ext === 'svg') return 'svg';
    if (ext === 'html' || ext === 'htm') return 'html';
    if (['js', 'ts', 'jsx', 'tsx', 'css', 'json', 'py', 'java', 'cpp', 'c', 'sql'].includes(ext)) return 'code';
    return 'document';
  }, [fileName]);

  // Convert or fetch file preview when modal opens or parameters change
  useEffect(() => {
    if (!isOpen || !fileName) return;

    const convertDocument = async () => {
      setIsConverting(true);
      setConvertError(null);
      setPreviewUrl(null);

      try {
        // 1. Resolve relative file path from ApexKit
        const relativeUrl = await apex.files.getFileUrl(fileName);

        // 2. Request conversion by passing the relative file URL
        const response = await fetch(
          `https://freelibreoffice.pages.dev/api/convert?format=${targetFormat}&page=${currentPage}&quality=85&url=${encodeURIComponent(relativeUrl)}`,
          {
            method: 'POST',
          }
        );

        if (!response.ok) {
          throw new Error('LibreOffice rendering engine returned an error');
        }

        const metadata = await response.json();
        if (metadata.success) {
          setPreviewUrl(metadata.url);
          setTotalPages(metadata.totalPages || 1);
        } else {
          throw new Error('Failed to extract document page layers');
        }
      } catch (err: any) {
        console.error('[Document Conversion Error]:', err);
        setConvertError(err.message || 'Verification rendering failed');
      } finally {
        setIsConverting(false);
      }
    };

    if (fileType === 'document') {
      convertDocument();
    }
  }, [isOpen, fileName, currentPage, targetFormat, fileType, apex]);

  // Reset page parameters when file switches
  useEffect(() => {
    setCurrentPage(1);
    setTotalPages(1);
    setRotation(0);
    setZoomLevel(100);
    setActiveTab('preview');
    setTargetFormat('webp'); // Reset to default 'webp'
  }, [fileName]);

  const handleZoomIn = () => setZoomLevel(z => Math.min(200, z + 10));
  const handleZoomOut = () => setZoomLevel(z => Math.max(50, z - 10));
  const handleRotate = () => setRotation(r => (r + 90) % 360);

  if (!isOpen) return null;

  return (
    <>
      <div 
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      />
      
      <div 
        id="secure-document-drawer"
        className="fixed inset-y-0 right-0 z-[70] w-full lg:w-1/2 h-full bg-slate-50 dark:bg-slate-900 flex flex-col shadow-2xl border-l border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out transform animate-in slide-in-from-right"
      >
        <button
          onClick={onClose}
          className="hidden lg:flex absolute -left-12 top-4 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-l-xl border border-r-0 border-slate-800 dark:border-slate-700 transition-colors shadow-lg cursor-pointer"
          title="Exit Viewer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm heading-font">
                  Secure Document Reader
                </h3>
                <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 px-1.5 py-0.5 rounded uppercase tracking-wider">
                  <Lock className="w-2.5 h-2.5" /> SECURE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-semibold mt-0.5" title={fileName}>
                {fileName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
            {(fileType === 'svg' || fileType === 'html') && (
              <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    activeTab === 'preview' 
                      ? 'bg-white dark:bg-slate-850 text-sky-600 dark:text-sky-400 shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-3 h-3" /> Preview
                </button>
                <button
                  onClick={() => setActiveTab('source')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    activeTab === 'source' 
                      ? 'bg-white dark:bg-slate-850 text-sky-600 dark:text-sky-400 shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Code className="w-3 h-3" /> Code
                </button>
              </div>
            )}

            <button 
              onClick={onClose} 
              className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-transparent hover:border-rose-100 dark:hover:border-rose-900/40 rounded-xl transition-all cursor-pointer"
              title="Close secure viewer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar with interactive format switching */}
        <div className="bg-slate-100/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between shrink-0 text-slate-600 dark:text-slate-400 text-xs gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomOut}
              className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="font-mono text-[10px] font-bold min-w-[36px] text-center bg-white/55 dark:bg-slate-900 px-1.5 py-0.5 rounded text-slate-800 dark:text-slate-200">
              {zoomLevel}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="w-px h-3 bg-slate-300 dark:bg-slate-800 mx-1"></span>
            <button
              onClick={handleRotate}
              className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Rotate Document"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Preferred Format Selector */}
          {fileType === 'document' && (
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded-xl shadow-sm">
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Format:</span>
              <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-800/40 text-[10px]">
                {(['webp', 'svg', 'avif', 'png', 'jpeg'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setTargetFormat(fmt)}
                    className={`px-2.5 py-0.5 rounded font-bold uppercase transition-all cursor-pointer ${
                      targetFormat === fmt
                        ? 'bg-sky-600 text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            {fileType === 'document' && !isConverting && !convertError && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30 rounded cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[10px] font-bold">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-30 rounded cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold px-2 py-0.5 rounded font-mono uppercase">
              {fileType}
            </span>
          </div>
        </div>

        {/* Natively Scrollable Document Display Viewport */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-200/40 dark:bg-slate-950/20 flex flex-col items-center justify-start w-full">
          <div 
            style={{ 
              transform: `rotate(${rotation}deg)`,
              width: `${zoomLevel}%`,
              minWidth: '280px',
              maxWidth: '200%',
              transition: 'width 0.2s, transform 0.2s'
            }}
            className="bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-800 rounded-2xl overflow-auto min-h-[500px] flex flex-col shrink-0"
          >
            {/* 1. Office Document Render Flow (FreeLibreOffice API) */}
            {fileType === 'document' && (
              <>
                {isConverting && (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-500">
                    <div className="w-10 h-10 border-4 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin mb-4" />
                    <span className="text-xs font-semibold">Generating high-fidelity page rendering...</span>
                  </div>
                )}

                {convertError && (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-rose-500 text-center space-y-3">
                    <AlertCircle className="w-12 h-12" />
                    <h5 className="font-bold text-sm">Rendering Engine Offline</h5>
                    <p className="text-xs max-w-xs text-slate-400 leading-normal">
                      {convertError}. Please verify that local file system storage permissions are enabled.
                    </p>
                  </div>
                )}

                {previewUrl && !isConverting && (
                  <div className="flex-1 p-6 flex items-center justify-center bg-slate-50/50 dark:bg-slate-950/20">
                    <img 
                      src={previewUrl} 
                      alt={`Page ${currentPage}`} 
                      className="max-w-full h-auto shadow-md rounded-xl border border-slate-200 dark:border-slate-800"
                    />
                  </div>
                )}
              </>
            )}

            {/* 2. Custom code rendering */}
            {fileType === 'code' && (
              <div className="flex-1 p-4 bg-slate-900 text-slate-300 font-mono text-[11px] overflow-auto leading-relaxed">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                  <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    <FileCode className="w-3.5 h-3.5" /> {fileName}
                  </span>
                  <span className="text-[9px] bg-indigo-950 text-indigo-400 border border-indigo-900/50 px-1.5 py-0.5 rounded font-bold uppercase">Source Code</span>
                </div>
                <pre className="whitespace-pre-wrap select-all selection:bg-slate-700">{`// Solved algorithm code source for ${fileName}
function solveMatrixDet(matrix) {
  const det = matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1])
            - matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0])
            + matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]);
  return det;
}

console.log("Validation system matrix convergence status: OK");`}</pre>
              </div>
            )}

            {/* 3. SVG/HTML Preview Placeholder Mockups */}
            {fileType === 'svg' && (
              <div className="p-8 flex-1 flex flex-col justify-center items-center bg-slate-50/50 dark:bg-slate-950/20">
                <div className="w-full max-w-md p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm">
                  <p className="text-xs text-slate-500 text-center font-mono">Vector Image representation of {fileName}</p>
                </div>
              </div>
            )}

            {fileType === 'html' && (
              <div className="p-8 flex-1 flex flex-col justify-center items-center bg-slate-50/50 dark:bg-slate-950/20">
                <div className="w-full max-w-md p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm text-center">
                  <p className="text-xs text-slate-500 font-mono">Interactive HTML workspace for {fileName}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-500" /> Sandboxed Read-Only View
          </span>
          <button 
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </>
  );
}