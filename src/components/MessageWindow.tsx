import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Message } from '../types';
import { Send, FileText, Download, Upload, X, ShieldAlert, Sparkles, Eye } from 'lucide-react';
import SecureDocumentViewer from './SecureDocumentViewer';

export default function MessageWindow() {
  const {
    currentUser,
    messages,
    activeChatRoomId,
    activeChatPartner,
    sendMessage,
    isLoading
  } = useStore();

  const [inputText, setInputText] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!activeChatRoomId || !activeChatPartner) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/80 rounded-3xl" id="empty_chat_view">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500">
          <Send className="w-8 h-8" />
        </div>
        <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 heading-font mb-1">Select a Tutoring Conversation</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-normal">
          Click on any open bids, tutor profiles, or active contracts to initiate direct real-time chat.
        </p>
      </div>
    );
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachedFile) return;

    const textToSend = inputText;
    const fileToSend = attachedFile;

    // Reset inputs
    setInputText('');
    setAttachedFile(null);

    try {
      await sendMessage(textToSend, fileToSend || undefined);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAttachedFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm" id="active_chat_window">
      {/* Chat Room Header */}
      <div className="px-5 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={activeChatPartner.avatar}
            alt={activeChatPartner.name}
            className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 object-cover"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-none heading-font">{activeChatPartner.name}</h4>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 capitalize">
              {activeChatPartner.role} • Active online
            </p>
          </div>
        </div>

        {activeChatPartner.role === 'tutor' && (
          <div className="text-right">
            <span className="text-xs text-slate-400 dark:text-slate-500 block leading-none">Hourly rate</span>
            <span className="text-sm font-bold text-sky-600 dark:text-sky-400 leading-normal block">
              ${activeChatPartner.hourlyRate}/hr
            </span>
          </div>
        )}
      </div>

      {/* Safety Banner */}
      <div className="bg-sky-50 dark:bg-sky-950/20 px-4 py-2 text-[11px] text-sky-800 dark:text-sky-300 font-medium flex items-center gap-1.5 border-b border-sky-100 dark:border-sky-950">
        <ShieldAlert className="w-3.5 h-3.5 text-sky-500 shrink-0" />
        <span>Tutor contracts are safe. Keep conversations inside EduSolve to ensure escrow payment protection.</span>
      </div>

      {/* Messages Scroll Panel */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/40 dark:bg-slate-950/10">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400 dark:text-slate-500">
            <Sparkles className="w-5 h-5 text-sky-500 mb-2" />
            <p className="text-xs font-medium">No messages yet. Send a greeting to kick off the tutoring session!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSelf = msg.senderId === currentUser?.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}
              >
                {/* Sender signature for peer */}
                {!isSelf && (
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-2 mb-1">
                    {msg.senderName}
                  </span>
                )}

                <div
                  className={`max-w-[75%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm flex flex-col gap-2 ${
                    isSelf
                      ? 'bg-sky-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/60 dark:border-slate-800'
                  }`}
                >
                  {/* Chat Text */}
                  {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}

                  {/* Render Message File attachment */}
                  {msg.file && (
                    <div
                      className={`flex items-center gap-2.5 p-2 rounded-xl text-xs border ${
                        isSelf
                          ? 'bg-sky-700/50 border-sky-500/30 text-white'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <FileText className="w-4.5 h-4.5 text-sky-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{msg.file.name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-none mt-1">
                          {(msg.file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedFileName(msg.file!.name);
                          setViewerOpen(true);
                        }}
                        className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                          isSelf
                            ? 'hover:bg-sky-500/30 text-white'
                            : 'hover:bg-sky-100 dark:hover:bg-sky-950/60 text-sky-600'
                        }`}
                        title="Read Securely"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <a
                        href={msg.file.url}
                        download={msg.file.name}
                        target="_blank"
                        rel="noreferrer"
                        className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                          isSelf
                            ? 'hover:bg-sky-500/30 text-white'
                            : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                        title="Download Attachment"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>

                <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 mx-2">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <SecureDocumentViewer
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        fileName={selectedFileName}
      />

      {/* Upload preview element */}
      {attachedFile && (
        <div className="px-5 py-2.5 bg-sky-50/80 dark:bg-sky-950/40 border-t border-sky-100 dark:border-sky-900 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-600" />
            <span className="truncate max-w-[240px]">{attachedFile.name}</span>
            <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">
              ({(attachedFile.size / 1024).toFixed(1)} KB)
            </span>
          </div>
          <button
            onClick={() => setAttachedFile(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Chat inputs footer */}
      <form onSubmit={handleSend} className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
        {/* Hidden inputs */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
        />

        {/* Attachment upload trigger */}
        <button
          type="button"
          onClick={triggerFileSelect}
          className="text-slate-400 hover:text-sky-600 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          title="Upload support files"
        >
          <Upload className="w-5 h-5" />
        </button>

        {/* Text Area */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={attachedFile ? "Add a file description..." : "Type dynamic query or homework specs..."}
          className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 px-4 py-2.5 rounded-2xl outline-none transition-all"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={!inputText.trim() && !attachedFile}
          className="bg-sky-600 text-white p-2.5 rounded-2xl hover:bg-sky-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 shadow-md shadow-sky-500/10 cursor-pointer transition-colors shrink-0"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </form>
    </div>
  );
}
