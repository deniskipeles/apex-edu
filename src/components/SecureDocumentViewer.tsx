import React, { useState, useMemo } from 'react';
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
  Maximize2, 
  Compass, 
  Layers 
} from 'lucide-react';

interface SecureDocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
}

export default function SecureDocumentViewer({ isOpen, onClose, fileName }: SecureDocumentViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [activeTab, setActiveTab] = useState<'preview' | 'source'>('preview');
  
  const totalPages = 3;

  // Determine file type from file name
  const fileType = useMemo(() => {
    const ext = fileName.toLowerCase().split('.').pop() || '';
    if (ext === 'svg') return 'svg';
    if (ext === 'html' || ext === 'htm') return 'html';
    if (['js', 'ts', 'jsx', 'tsx', 'css', 'json', 'py', 'java', 'cpp', 'c'].includes(ext)) return 'code';
    return 'document';
  }, [fileName]);

  // Generate interactive mock SVG source
  const mockSvgSource = useMemo(() => {
    return `<?xml version="1.0" encoding="utf-8"?>
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 350" width="100%" height="100%">
  <defs>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0ea5e9" />
      <stop offset="100%" stop-color="#2563eb" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10b981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>
  </defs>
  
  <!-- Grid Background -->
  <rect width="500" height="350" fill="#f8fafc" rx="16"/>
  <g stroke="#e2e8f0" stroke-width="0.5">
    <path d="M 0,50 L 500,50 M 0,100 L 500,100 M 0,150 L 500,150 M 0,200 L 500,200 M 0,250 L 500,250 M 0,300 L 500,300" />
    <path d="M 50,0 L 50,350 M 100,0 L 100,350 M 150,0 L 150,350 M 200,0 L 200,350 M 250,0 L 250,350 M 300,0 L 300,350 M 350,0 L 350,350 M 400,0 L 400,350 M 450,0 L 450,350" />
  </g>

  <!-- Flow Diagrams / Architecture -->
  <g transform="translate(40, 60)">
    <!-- Node 1: Input -->
    <rect x="10" y="70" width="90" height="45" rx="8" fill="url(#skyGrad)" stroke="#1d4ed8" stroke-width="1.5" />
    <text x="55" y="97" fill="#ffffff" font-family="Inter, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Input Dataset</text>

    <!-- Connector 1 -->
    <path d="M 100,92.5 L 140,92.5" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4 2" />
    <polygon points="140,95.5 146,92.5 140,89.5" fill="#94a3b8" />

    <!-- Node 2: Core Engine -->
    <rect x="146" y="55" width="120" height="75" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.05))" />
    <text x="206" y="80" fill="#1e293b" font-family="Inter, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">Processing Kernel</text>
    <text x="206" y="96" fill="#64748b" font-family="Inter, sans-serif" font-size="9" text-anchor="middle">Compute Unit 4.0</text>
    <circle cx="206" cy="115" r="4" fill="#3b82f6" />
    <circle cx="194" cy="115" r="4" fill="#10b981" />
    <circle cx="218" cy="115" r="4" fill="#f59e0b" />

    <!-- Connector 2 (Top Branch) -->
    <path d="M 266,80 L 300,80 L 300,45 L 320,45" fill="none" stroke="#64748b" stroke-width="1.5" />
    <polygon points="320,47.5 325,45 320,42.5" fill="#64748b" />

    <!-- Connector 2 (Bottom Branch) -->
    <path d="M 266,105 L 300,105 L 300,140 L 320,140" fill="none" stroke="#64748b" stroke-width="1.5" />
    <polygon points="320,142.5 325,140 320,137.5" fill="#64748b" />

    <!-- Node 3: Analytics Output -->
    <rect x="325" y="20" width="100" height="50" rx="8" fill="url(#accentGrad)" stroke="#047857" stroke-width="1.5" />
    <text x="375" y="45" fill="#ffffff" font-family="Inter, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">Visualization</text>
    <text x="375" y="58" fill="#a7f3d0" font-family="Inter, sans-serif" font-size="8" text-anchor="middle">D3.js Component</text>

    <!-- Node 4: Export -->
    <rect x="325" y="115" width="100" height="50" rx="8" fill="#1e293b" stroke="#0f172a" stroke-width="1.5" />
    <text x="375" y="140" fill="#ffffff" font-family="Inter, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">Secure JSON</text>
    <text x="375" y="153" fill="#94a3b8" font-family="Inter, sans-serif" font-size="8" text-anchor="middle">Stored Securely</text>
  </g>
  
  <!-- Floating Labels -->
  <text x="25" y="25" fill="#0f172a" font-family="Inter, sans-serif" font-size="12" font-weight="bold">System Architecture Diagram</text>
  <text x="25" y="40" fill="#94a3b8" font-family="Inter, sans-serif" font-size="9">Delivered by EduSolve Tutor Network</text>
  <rect x="410" y="12" width="65" height="18" rx="4" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="0.5" />
  <text x="442" y="24" fill="#475569" font-family="monospace" font-size="8" font-weight="bold" text-anchor="middle">v2.1.0-SEC</text>
</svg>`;
  }, []);

  // Generate interactive mock HTML source
  const mockHtmlSource = useMemo(() => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Delivered Workspace Report</title>
  <style>
    body { font-family: 'Inter', system-ui, sans-serif; background-color: #f8fafc; color: #1e293b; padding: 24px; }
    .card { background: white; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05); }
    h1 { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 0; }
    p { font-size: 13px; line-height: 1.6; color: #475569; }
    .badge { display: inline-flex; align-items: center; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; background: #ecfdf5; color: #059669; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    th { text-align: left; background: #f1f5f9; padding: 10px; font-size: 11px; font-weight: bold; color: #475569; border-bottom: 2px solid #e2e8f0; }
    td { padding: 10px; font-size: 12px; border-bottom: 1px solid #e2e8f0; color: #334155; }
    .alert { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px; border-radius: 8px; margin-top: 16px; font-size: 12px; color: #1e3a8a; }
  </style>
</head>
<body>
  <div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <span class="badge">Verified Solution</span>
      <span style="font-size: 11px; color: #94a3b8;">Ref ID: #67923</span>
    </div>
    <h1>Calculus & Linear Algebra Module Deliverable</h1>
    <p>This document presents the finalized systems of linear equations solved dynamically using a custom pivot matrix algorithm. All boundaries, derivatives, and numerical checks conform to the tutor guidelines and guidelines provided in the assignment description.</p>
    
    <div class="alert">
      <strong>Security Notice:</strong> This HTML is dynamically rendered inside the sandbox. Raw source script execution is strictly isolated.
    </div>

    <table>
      <thead>
        <tr>
          <th>Equation Parameter</th>
          <th>Calculated Boundary</th>
          <th>Validation Factor</th>
          <th>Result Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Matrix Det (A)</td>
          <td>&Delta; = 14.821</td>
          <td>&alpha; &gt; 0.992</td>
          <td style="color: #059669; font-weight: bold;">PASS</td>
        </tr>
        <tr>
          <td>Row Vector [x1, x2]</td>
          <td>[-2.051, 8.411]</td>
          <td>&epsilon; &lt; 10^-5</td>
          <td style="color: #059669; font-weight: bold;">PASS</td>
        </tr>
        <tr>
          <td>Gradient Convergence</td>
          <td>t = 124 ms</td>
          <td>Iter: 14</td>
          <td style="color: #059669; font-weight: bold;">PASS</td>
        </tr>
      </tbody>
    </table>
  </div>
</body>
</html>`;
  }, []);

  const handleZoomIn = () => setZoomLevel(z => Math.min(200, z + 10));
  const handleZoomOut = () => setZoomLevel(z => Math.max(50, z - 10));
  const handleRotate = () => setRotation(r => (r + 90) % 360);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
      />
      
      {/* Sliding Drawer Panel */}
      <div 
        id="secure-document-drawer"
        className="fixed inset-y-0 right-0 z-[70] w-full lg:w-1/2 h-full bg-slate-50 dark:bg-slate-900 flex flex-col shadow-2xl border-l border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out transform animate-in slide-in-from-right"
      >
        {/* Floating Quick Close Overlay Button for desktop (just outside the drawer) */}
        <button
          onClick={onClose}
          className="hidden lg:flex absolute -left-12 top-4 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-l-xl border border-r-0 border-slate-800 dark:border-slate-700 transition-colors shadow-lg cursor-pointer"
          title="Exit Viewer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Drawer Header */}
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
            {/* Tab selection for SVG/HTML */}
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

            {/* Main Header Close Icon */}
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

        {/* Dynamic Interactive Reading Toolbar */}
        <div className="bg-slate-100/80 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between shrink-0 text-slate-600 dark:text-slate-400 text-xs gap-3">
          <div className="flex items-center gap-1.5">
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

          <div className="flex items-center gap-1.5">
            {fileType === 'document' && (
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

        {/* Reader Display Panel */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-200/40 dark:bg-slate-950/20 flex flex-col items-center">
          <div 
            style={{ 
              transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            className="w-full max-w-2xl bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden min-h-[500px] flex flex-col"
          >
            {/* SVG Viewer File Type */}
            {fileType === 'svg' && (
              activeTab === 'preview' ? (
                <div className="p-8 flex-1 flex flex-col justify-center items-center bg-slate-50/50 dark:bg-slate-950/20">
                  <div className="w-full max-w-md p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-850 shadow-sm">
                    <div dangerouslySetInnerHTML={{ __html: mockSvgSource }} />
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[10px] font-semibold bg-white dark:bg-slate-950 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-850">
                    <Compass className="w-3.5 h-3.5 text-sky-500 animate-spin" /> Interactive Vector SVG Display (High Fidelity)
                  </div>
                </div>
              ) : (
                <div className="flex-1 p-4 bg-slate-900 text-slate-300 font-mono text-[11px] overflow-auto leading-relaxed">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                      <FileCode className="w-3.5 h-3.5" /> {fileName}
                    </span>
                    <span className="text-[9px] bg-sky-950 text-sky-400 border border-sky-900/50 px-1.5 py-0.5 rounded font-bold uppercase">XML / SVG</span>
                  </div>
                  <pre className="whitespace-pre-wrap select-all selection:bg-slate-700">{mockSvgSource}</pre>
                </div>
              )
            )}

            {/* HTML Viewer File Type */}
            {fileType === 'html' && (
              activeTab === 'preview' ? (
                <div className="p-6 flex-1 flex flex-col bg-slate-100/30 dark:bg-slate-950/20">
                  <div className="flex-1 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                    <iframe 
                      title="HTML Preview Sandboxed"
                      srcDoc={mockHtmlSource}
                      sandbox="allow-same-origin"
                      className="w-full h-full min-h-[450px] bg-white dark:bg-slate-900 border-0"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 p-4 bg-slate-900 text-slate-300 font-mono text-[11px] overflow-auto leading-relaxed">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                      <FileCode className="w-3.5 h-3.5" /> {fileName}
                    </span>
                    <span className="text-[9px] bg-amber-950 text-amber-400 border border-amber-900/50 px-1.5 py-0.5 rounded font-bold uppercase">HTML5 Source</span>
                  </div>
                  <pre className="whitespace-pre-wrap select-all selection:bg-slate-700">{mockHtmlSource}</pre>
                </div>
              )
            )}

            {/* Simple raw code rendering */}
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

            {/* Standard generic PDF / Document Multi-Page mockup */}
            {fileType === 'document' && (
              <div className="p-8 flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                <FileText className="w-16 h-16 mb-4 text-slate-200 dark:text-slate-800" />
                <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Multi-page Solution Document (Page {currentPage} of {totalPages})</h4>
                
                <div className="w-full mt-6 space-y-3 max-w-md bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800 rounded-xl leading-relaxed">
                  <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded"></div>
                  <div className="h-2 w-full bg-slate-200/70 dark:bg-slate-800/70 rounded"></div>
                  <div className="h-2 w-full bg-slate-200/70 dark:bg-slate-800/70 rounded"></div>
                  <div className="h-2 w-2/3 bg-slate-200/70 dark:bg-slate-800/70 rounded"></div>
                </div>

                <div className="text-[11px] mt-6 text-slate-400 dark:text-slate-500 max-w-md text-center px-6 leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 border border-slate-100 dark:border-slate-800 rounded-xl">
                  <p className="mb-2"><strong className="text-slate-600 dark:text-slate-400">EduSolve Guard active.</strong></p>
                  Documents are safely prepared at the cloud edge. Dynamic page conversion prevents local file downloading and guarantees that content is viewed only within the secure container.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer Safe Label */}
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
