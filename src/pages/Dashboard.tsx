import React, { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';
import { Assignment, Bid, Message } from '../types';
import AssignmentCard from '../components/AssignmentCard';
import MessageWindow from '../components/MessageWindow';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Wallet,
  Coins,
  PlusCircle,
  Users,
  MessageSquare,
  ShieldCheck,
  Star,
  Clock,
  Sparkles,
  BookOpen,
  ArrowRight,
  User,
  CheckCircle,
  FileCheck,
  Send,
  X,
  Plus,
  Bookmark,
  ArrowUpRight,
  GraduationCap,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface DashboardProps {
  onOpenDeposit: () => void;
  onOpenNewAssignment: () => void;
}

export default function Dashboard({ onOpenDeposit, onOpenNewAssignment }: DashboardProps) {
  const {
    currentUser,
    courses,
    assignments,
    bids,
    tutors,
    payments,
    activeChatRoomId,
    activeChatPartner,
    startChat,
    fetchAssignments,
    submitBid,
    acceptBid,
    markAssignmentCompleted,
    releasePayment,
    submitReview,
    updateProfile
  } = useStore();

  // Selected sub-tabs in dashboard
  const [activeTab, setActiveTab] = useState<string>('active'); // active, open, completed, messages
  const [searchChatQuery, setSearchChatQuery] = useState('');
  
  // Modals inside dashboard
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [selectedAssignmentToBid, setSelectedAssignmentToBid] = useState<Assignment | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidProposal, setBidProposal] = useState('');

  // Review submission modals
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedTutorToReview, setSelectedTutorToReview] = useState<{ id: string; name: string; title: string } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Tutor profile editing inside dashboard
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tutorBio, setTutorBio] = useState(currentUser?.bio || '');
  const [tutorRate, setTutorRate] = useState(currentUser?.hourlyRate?.toString() || '35');

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleOpenBidModal = (assignment: Assignment) => {
    setSelectedAssignmentToBid(assignment);
    setBidAmount(assignment.budget.toString());
    setBidProposal('');
    setBidModalOpen(true);
  };

  const handleCloseBidModal = () => {
    setSelectedAssignmentToBid(null);
    setBidModalOpen(false);
  };

  const handlePostBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignmentToBid) return;

    try {
      await submitBid(selectedAssignmentToBid.id, Number(bidAmount), bidProposal);
      handleCloseBidModal();
    } catch (err: any) {
      alert(err.message || 'Failed to place bid');
    }
  };

  const handleOpenReviewModal = (tutorId: string, tutorName: string, assignmentTitle: string) => {
    setSelectedTutorToReview({ id: tutorId, name: tutorName, title: assignmentTitle });
    setReviewRating(5);
    setReviewComment('');
    setReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setSelectedTutorToReview(null);
    setReviewModalOpen(false);
  };

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTutorToReview) return;

    try {
      await submitReview(
        selectedTutorToReview.id,
        reviewRating,
        reviewComment,
        selectedTutorToReview.title
      );
      handleCloseReviewModal();
    } catch (err) {
      console.error('Failed to save review', err);
    }
  };

  const handleSaveTutorProfile = async () => {
    await updateProfile({
      bio: tutorBio,
      hourlyRate: Number(tutorRate)
    });
    setIsEditingBio(false);
  };

  // Memoize active course curriculum list
  const myActiveCourses = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'student') {
      const activeIds = currentUser.enrolledCourseIds || [];
      return courses.filter(c => activeIds.includes(c.id));
    } else {
      const expertiseCodes = currentUser.expertise || [];
      return courses.filter(c => expertiseCodes.includes(c.code));
    }
  }, [courses, currentUser]);

  // Student specific filters
  const studentAssignments = assignments.filter((a) => a.studentId === currentUser?.id);
  const studentActive = studentAssignments.filter((a) => a.status === 'active' || a.status === 'completed');
  const studentOpen = studentAssignments.filter((a) => a.status === 'open' || a.status === 'bidded');
  const studentCompleted = studentAssignments.filter((a) => a.status === 'paid');

  // Tutor specific filters
  const tutorBids = bids.filter((b) => b.tutorId === currentUser?.id);
  const tutorActive = assignments.filter((a) => a.tutorId === currentUser?.id && (a.status === 'active' || a.status === 'completed'));
  const tutorOpenMarket = assignments.filter((a) => a.status === 'open' && !tutorBids.some(b => b.assignmentId === a.id));
  const tutorProposals = assignments.filter((a) => tutorBids.some(b => b.assignmentId === a.id) && (a.status === 'open' || a.status === 'bidded'));
  const tutorCompleted = assignments.filter((a) => a.tutorId === currentUser?.id && a.status === 'paid');

  // Direct conversations list based on multiple contract/bid relationships
  const recentConversations = useMemo(() => {
    if (!currentUser) return [];

    const partnerIds = new Set<string>();

    // 1. From payments
    payments
      .filter(p => p.studentId === currentUser.id || p.tutorId === currentUser.id)
      .forEach(p => {
        partnerIds.add(currentUser.role === 'student' ? p.tutorId : p.studentId);
      });

    // 2. From assignments the user is involved in (assigned tutor or owner)
    assignments
      .filter(a => a.studentId === currentUser.id || a.tutorId === currentUser.id)
      .forEach(a => {
        if (currentUser.role === 'student' && a.tutorId) {
          partnerIds.add(a.tutorId);
        } else if (currentUser.role === 'tutor' && a.studentId) {
          partnerIds.add(a.studentId);
        }
      });

    // 3. From bids
    if (currentUser.role === 'student') {
      // Find all tutors who placed bids on the student's assignments
      const studentAssgnIds = assignments.filter(a => a.studentId === currentUser.id).map(a => a.id);
      bids
        .filter(b => studentAssgnIds.includes(b.assignmentId))
        .forEach(b => partnerIds.add(b.tutorId));
    } else {
      // Find all students whose assignments the tutor has bidded on
      const tutorBiddedAssgnIds = bids.filter(b => b.tutorId === currentUser.id).map(b => b.assignmentId);
      assignments
        .filter(a => tutorBiddedAssgnIds.includes(a.id))
        .forEach(a => partnerIds.add(a.studentId));
    }

    // 4. Active chat partner
    if (activeChatPartner) {
      partnerIds.add(activeChatPartner.id);
    }

    // Retrieve full profiles
    const profiles: any[] = JSON.parse(localStorage.getItem('users_profiles') || '[]');
    return Array.from(partnerIds)
      .map(id => profiles.find((p: any) => p.id === id))
      .filter((p): p is any => !!p && p.id !== currentUser.id);
  }, [currentUser, payments, assignments, bids, activeChatPartner]);

  const filteredChats = useMemo(() => {
    if (!searchChatQuery.trim()) return recentConversations;
    const query = searchChatQuery.toLowerCase();
    return recentConversations.filter(p => p.name.toLowerCase().includes(query) || p.role.toLowerCase().includes(query));
  }, [recentConversations, searchChatQuery]);

  // Generate chart data for last 30 days completed assignments
  const completedAssignmentsChartData = useMemo(() => {
    if (currentUser?.role !== 'student') return [];
    
    const data = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      data.push({
        dateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        timestamp: d.getTime(),
        count: 0
      });
    }

    studentCompleted.forEach(a => {
      const dateVal = (a as any).updated || a.createdAt;
      if (dateVal) {
        const d = new Date(dateVal);
        d.setHours(0, 0, 0, 0);
        const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const point = data.find(p => p.dateStr === formatted);
        if (point) {
          point.count += 1;
        }
      }
    });

    return data;
  }, [studentCompleted, currentUser]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="dashboard_panel">
      
      {/* 1. Header Hero section */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-gradient from-sky-950/20 to-transparent pointer-events-none" />
        
        {/* User Card */}
        <div className="flex items-center gap-4 relative z-10">
          <img
            src={currentUser?.avatar}
            alt={currentUser?.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-slate-800 shadow-md object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold heading-font leading-none">{currentUser?.name}</h2>
              <span className="text-[10px] bg-sky-600/30 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-md font-semibold uppercase tracking-wider">
                {currentUser?.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2">{currentUser?.email}</p>
            {currentUser?.role === 'tutor' && (
              <div className="flex items-center gap-3 mt-3">
                <span className="text-[11px] text-slate-300 font-medium bg-slate-800 px-2.5 py-1 rounded-lg">
                  ★ {currentUser?.rating || '5.0'} rating
                </span>
                <span className="text-[11px] text-slate-300 font-medium bg-slate-800 px-2.5 py-1 rounded-lg font-mono">
                  ${currentUser?.hourlyRate}/hr
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Financial Wallet Metrics */}
        <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/60 rounded-2xl p-5 w-full md:w-auto min-w-[240px] flex items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              {currentUser?.role === 'student' ? 'My Wallet Balance' : 'My Lifetime Earnings'}
            </span>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-500 shrink-0" />
              <span className="text-2xl font-black heading-font">${currentUser?.balance?.toLocaleString() || '0'}</span>
            </div>
          </div>
          {currentUser?.role === 'student' ? (
            <button
              onClick={onOpenDeposit}
              className="bg-sky-600 hover:bg-sky-700 text-white text-xs px-4 py-2.5 rounded-xl font-bold cursor-pointer transition-colors"
            >
              Deposit Funds
            </button>
          ) : (
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Completed</span>
              <span className="font-bold text-sky-400">{currentUser?.completedTasks || 0} jobs</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left column sidebar profiles & utilities */}
        <div className="lg:col-span-3 space-y-6">
          {/* Quick info pane for students */}
          {currentUser?.role === 'student' ? (
            <>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm heading-font">Student Operations</h4>
              <button
                onClick={onOpenNewAssignment}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold rounded-xl text-xs shadow cursor-pointer transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Post Homework Help
              </button>
              <div className="bg-sky-50/50 dark:bg-sky-950/20 p-3 rounded-xl border border-sky-100 dark:border-sky-900/60 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                Need exam preparation or homework review? Enter assignment guidelines and receive instant competitive bid quotes from vetted university tutors.
              </div>
            </div>
            
            {/* 30-Day Activity Chart */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm heading-font">30-Day Activity</h4>
                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded uppercase tracking-wide border border-emerald-100 dark:border-emerald-900">Completed</span>
              </div>
              <div className="h-40 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={completedAssignmentsChartData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="opacity-30" />
                    <XAxis 
                      dataKey="dateStr" 
                      tick={{ fontSize: 9, fill: '#94a3b8' }} 
                      tickLine={false} 
                      axisLine={false}
                      minTickGap={15}
                    />
                    <YAxis 
                      allowDecimals={false} 
                      tick={{ fontSize: 9, fill: '#94a3b8' }} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <Tooltip 
                      cursor={{ fill: '#f1f5f9' }}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 'bold', padding: '8px 12px', color: '#334155' }}
                      labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase' }}
                    />
                    <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            </>
          ) : (
            // Tutor Bio editor
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm heading-font">Tutor Qualifications</h4>
                <button
                  onClick={() => {
                    if (isEditingBio) handleSaveTutorProfile();
                    else setIsEditingBio(true);
                  }}
                  className="text-sky-600 hover:text-sky-700 dark:text-sky-450 text-xs font-semibold cursor-pointer"
                >
                  {isEditingBio ? 'Save' : 'Edit'}
                </button>
              </div>

              {isEditingBio ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Hourly tutoring rate</label>
                    <input
                      type="number"
                      value={tutorRate}
                      onChange={(e) => setTutorRate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Professional Bio</label>
                    <textarea
                      value={tutorBio}
                      onChange={(e) => setTutorBio(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded-xl text-xs text-slate-800 dark:text-slate-100 resize-none focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs text-slate-500">
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Tutoring rate: </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">${currentUser?.hourlyRate}/hour</span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Introductory statement:</span>
                    <p className="leading-relaxed bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl text-slate-600 dark:text-slate-400 italic">
                      "{currentUser?.bio || 'Professional tutoring specialist ready to help you earn top grades.'}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* My Active Classes / Pinned Syllabus Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-3" id="dashboard_active_classes_sidebar">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm heading-font flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-sky-500 fill-sky-500/10 animate-pulse" />
                My Active Classes
              </h4>
              <Link
                to="/courses"
                className="text-[10px] text-sky-600 hover:text-sky-700 dark:text-sky-400 font-bold uppercase tracking-wider flex items-center gap-0.5 transition-colors cursor-pointer"
              >
                Manage <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
            
            {myActiveCourses.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 p-4 rounded-xl text-center space-y-1">
                <GraduationCap className="w-6 h-6 text-slate-300 dark:text-slate-700 mx-auto" />
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                  No active syllabus classes pinned.
                </p>
                <Link
                  to="/courses"
                  className="text-[10px] text-sky-600 hover:underline dark:text-sky-400 font-bold block"
                >
                  Pin from Subject List →
                </Link>
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {myActiveCourses.map((course) => {
                  const matchingCount = assignments.filter((a) => a.courseId === course.id && a.status === 'open').length;
                  return (
                    <Link
                      key={course.id}
                      to="/courses"
                      className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-950 text-left transition-all block cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[9px] bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold border border-sky-200/50 dark:border-sky-900/40 px-1.5 py-0.5 rounded uppercase font-mono shrink-0 group-hover:bg-sky-200 transition-colors">
                          {course.code}
                        </span>
                        <span className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold truncate group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">
                          {course.name}
                        </span>
                      </div>
                      {matchingCount > 0 ? (
                        <span className="bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 font-bold text-[9px] px-1.5 py-0.5 rounded-full border border-sky-100 dark:border-sky-900 shrink-0">
                          {matchingCount} open
                        </span>
                      ) : (
                        <span className="text-[9px] text-slate-400 font-medium shrink-0 group-hover:translate-x-0.5 transition-transform">
                          →
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick chat workspace side widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-3">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm heading-font flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              Assigned Chats
            </h4>
            {recentConversations.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 py-3 text-center leading-normal">
                No active messaging contracts. Discuss queries inside bids to initiate chats.
              </p>
            ) : (
              <div className="space-y-2">
                {recentConversations.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      startChat(p.id);
                      setActiveTab('messages');
                    }}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all cursor-pointer ${
                      activeChatPartner?.id === p.id && activeTab === 'messages'
                        ? 'bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-850/50 border border-transparent'
                    }`}
                  >
                    <img
                      src={p.avatar}
                      alt={p.name}
                      className="w-8.5 h-8.5 rounded-full border border-slate-200 dark:border-slate-800 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate leading-none">{p.name}</h5>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 capitalize inline-block mt-1">{p.role}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column main content panel board */}
        <div className="lg:col-span-9 space-y-6">
          {/* Dynamic Switch Headers */}
          <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 overflow-x-auto pb-px">
            {currentUser?.role === 'student' ? (
              <>
                <button
                  onClick={() => setActiveTab('active')}
                  className={`pb-3 text-sm font-semibold tracking-tight cursor-pointer transition-all ${
                    activeTab === 'active'
                      ? 'border-b-2 border-sky-600 text-sky-600'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Ongoing Tutoring ({studentActive.length})
                </button>
                <button
                  onClick={() => setActiveTab('open')}
                  className={`pb-3 text-sm font-semibold tracking-tight cursor-pointer transition-all ${
                    activeTab === 'open'
                      ? 'border-b-2 border-sky-600 text-sky-600'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  My Help Requests ({studentOpen.length})
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`pb-3 text-sm font-semibold tracking-tight cursor-pointer transition-all ${
                    activeTab === 'completed'
                      ? 'border-b-2 border-sky-600 text-sky-600'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Completed Solutions ({studentCompleted.length})
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('active')}
                  className={`pb-3 text-sm font-semibold tracking-tight cursor-pointer transition-all ${
                    activeTab === 'active'
                      ? 'border-b-2 border-sky-600 text-sky-600'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  My Active Classes ({tutorActive.length})
                </button>
                <button
                  onClick={() => setActiveTab('open')}
                  className={`pb-3 text-sm font-semibold tracking-tight cursor-pointer transition-all ${
                    activeTab === 'open'
                      ? 'border-b-2 border-sky-600 text-sky-600'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Browse Open Markets ({tutorOpenMarket.length})
                </button>
                <button
                  onClick={() => setActiveTab('proposals')}
                  className={`pb-3 text-sm font-semibold tracking-tight cursor-pointer transition-all ${
                    activeTab === 'proposals'
                      ? 'border-b-2 border-sky-600 text-sky-600'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  My Placed Proposals ({tutorProposals.length})
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`pb-3 text-sm font-semibold tracking-tight cursor-pointer transition-all ${
                    activeTab === 'completed'
                      ? 'border-b-2 border-sky-600 text-sky-600'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Earned Commissions ({tutorCompleted.length})
                </button>
              </>
            )}
            
            {/* Messages tab as extra route toggle */}
            <button
              onClick={() => setActiveTab('messages')}
              className={`pb-3 text-sm font-semibold tracking-tight cursor-pointer transition-all ${
                activeTab === 'messages'
                  ? 'border-b-2 border-sky-600 text-sky-600'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Direct Chats Workspace
            </button>
          </div>

          {/* DYNAMIC RENDERS */}

          {/* 1. Chats Workspace view tab */}
          {activeTab === 'messages' ? (
            <div className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-hidden h-[600px] shadow-sm flex" id="dashboard_messages_container">
              {/* Chats Sidebar - Visible on desktop, or on mobile when no active partner is selected */}
              <div className={`w-full md:w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 ${
                activeChatPartner ? 'hidden md:flex' : 'flex'
              }`}>
                {/* Sidebar Header */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm heading-font flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-sky-500" />
                    Conversations
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Direct chat with active tutors and candidates</p>
                </div>
                
                {/* Chats Search/Filter */}
                <div className="p-3 border-b border-slate-150 dark:border-slate-800">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchChatQuery}
                      onChange={(e) => setSearchChatQuery(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 pl-9 pr-4 py-2 rounded-xl outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                    />
                  </div>
                </div>

                {/* Chats List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {filteredChats.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 px-4">
                      <p className="text-xs font-semibold dark:text-slate-300">No conversations found</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Discuss pre-contract queries on bids or start tutoring to message!</p>
                    </div>
                  ) : (
                    filteredChats.map((p) => {
                      const isActive = activeChatPartner?.id === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => startChat(p.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all cursor-pointer relative group ${
                            isActive
                              ? 'bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-850/40 border border-transparent'
                          }`}
                        >
                          <div className="relative shrink-0">
                            <img
                              src={p.avatar}
                              alt={p.name}
                              className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 object-cover"
                            />
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h5 className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate heading-font leading-tight group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                                {p.name}
                              </h5>
                              <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold px-1.5 py-0.5 rounded capitalize font-mono">
                                {p.role}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-1 leading-normal">
                              {p.bio || "No description provided"}
                            </p>
                          </div>
                          
                          {isActive && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-sky-500" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Chat Area - Visible on desktop, or on mobile when an active partner is selected */}
              <div className={`flex-1 h-full relative ${
                !activeChatPartner ? 'hidden md:flex' : 'flex'
              }`}>
                {activeChatPartner ? (
                  <div className="w-full h-full relative flex flex-col">
                    {/* Header injector with Back button for mobile */}
                    <div className="absolute top-4 left-4 z-50 md:hidden">
                      <button
                        type="button"
                        onClick={() => {
                          // Clear active chat to return to the sidebar on mobile
                          useStore.setState({ activeChatPartner: null, activeChatRoomId: null });
                        }}
                        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 p-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-md flex items-center justify-center transition-all cursor-pointer animate-pulse"
                        title="Back to conversations"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    </div>
                    <MessageWindow />
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 dark:bg-slate-900/20">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
                      <MessageSquare className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 heading-font mb-1">Select a Conversation</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-normal">
                      Choose a tutor or student from the conversations list to start your direct workspace study.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6" id="dashboard_assignment_listings">
              {/* STUDENT VIEWS */}
              {currentUser?.role === 'student' && (
                <>
                  {/* ONGOING TAB */}
                  {activeTab === 'active' && (
                    studentActive.length === 0 ? (
                      <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                        <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm heading-font">No Active Tutor Contracts</h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                          Accept tutor candidate proposals on your assignment requests to start direct workspace studies.
                        </p>
                      </div>
                    ) : (
                      studentActive.map((item) => (
                        <AssignmentCard
                          key={item.id}
                          assignment={item}
                          onPayTutor={() => handleOpenReviewModal(item.tutorId!, item.tutorName!, item.title)}
                        />
                      ))
                    )
                  )}

                  {/* OPEN REQUESTS TAB */}
                  {activeTab === 'open' && (
                    studentOpen.length === 0 ? (
                      <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                        <PlusCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm heading-font">No Active Help Requests</h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                          Click the 'Ask for Help' button above to request competitive bids on homework drafts.
                        </p>
                      </div>
                    ) : (
                      studentOpen.map((item) => (
                        <AssignmentCard
                          key={item.id}
                          assignment={item}
                          onAcceptBid={(bidId) => acceptBid(item.id, bidId)}
                        />
                      ))
                    )
                  )}

                  {/* COMPLETED TAB */}
                  {activeTab === 'completed' && (
                    studentCompleted.length === 0 ? (
                      <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                        <CheckCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm heading-font">No Completed Assignments</h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                          Solutions approved and paid will be listed here as secure archives.
                        </p>
                      </div>
                    ) : (
                      studentCompleted.map((item) => (
                        <AssignmentCard key={item.id} assignment={item} />
                      ))
                    )
                  )}
                </>
              )}

              {/* TUTOR VIEWS */}
              {currentUser?.role === 'tutor' && (
                <>
                  {/* TUTOR ACTIVE TAB */}
                  {activeTab === 'active' && (
                    tutorActive.length === 0 ? (
                      <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                        <Clock className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm heading-font">No Active Student Contracts</h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                          Browse the open markets below and send competitive bid proposals to secure teaching contracts.
                        </p>
                      </div>
                    ) : (
                      tutorActive.map((item) => (
                        <AssignmentCard
                          key={item.id}
                          assignment={item}
                          onComplete={() => markAssignmentCompleted(item.id)}
                        />
                      ))
                    )
                  )}

                  {/* TUTOR OPEN MARKET TAB */}
                  {activeTab === 'open' && (
                    tutorOpenMarket.length === 0 ? (
                      <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                        <Sparkles className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm heading-font">Assignment Market Is Dry</h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                          No active assignments found seeking support at this moment. Please check back shortly.
                        </p>
                      </div>
                    ) : (
                      tutorOpenMarket.map((item) => (
                        <AssignmentCard
                          key={item.id}
                          assignment={item}
                          onPlaceBid={() => handleOpenBidModal(item)}
                        />
                      ))
                    )
                  )}

                  {/* TUTOR PLACED PROPOSALS TAB */}
                  {activeTab === 'proposals' && (
                    tutorProposals.length === 0 ? (
                      <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                        <FileCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm heading-font">No Proposals Sent</h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                          Any bids you place on open assignment listings will show up here.
                        </p>
                      </div>
                    ) : (
                      tutorProposals.map((item) => (
                        <AssignmentCard key={item.id} assignment={item} />
                      ))
                    )
                  )}

                  {/* TUTOR COMPLETED TAB */}
                  {activeTab === 'completed' && (
                    tutorCompleted.length === 0 ? (
                      <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                        <Coins className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm heading-font">No Earnings Transferred Yet</h4>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                          Completed contracts that student has approved and released from escrow will compile here.
                        </p>
                      </div>
                    ) : (
                      tutorCompleted.map((item) => (
                        <AssignmentCard key={item.id} assignment={item} />
                      ))
                    )
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =========================================== */}
      {/* 3. MODALS AND WORKSPACES CORES */}
      {/* =========================================== */}

      {/* A. PLACE BID MODAL FOR TUTORS */}
      {bidModalOpen && selectedAssignmentToBid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm heading-font">Draft Bid Proposal</h4>
              <button onClick={handleCloseBidModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePostBid} className="space-y-4">
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block tracking-wider">Project Title</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 text-xs mt-1 block leading-relaxed">{selectedAssignmentToBid.title}</span>
              </div>

              {/* Quote budget */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  My Bid Price Quote (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-semibold text-xs">$</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-sky-500 dark:focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 pl-8 pr-4 py-2 rounded-xl outline-none text-xs text-slate-800 dark:text-slate-100 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Cover proposal message */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Describe your proposal approach
                </label>
                <textarea
                  required
                  rows={4}
                  value={bidProposal}
                  onChange={(e) => setBidProposal(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-sky-500 dark:focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 px-3 py-2 rounded-xl outline-none text-xs text-slate-800 dark:text-slate-100 transition-all resize-none leading-relaxed"
                  placeholder="Tell the student how you can assist them, your expertise in this field, and estimated completion time..."
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseBidModal}
                  className="flex-1 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-sky-600 text-white font-bold text-xs rounded-xl hover:bg-sky-700 shadow"
                >
                  Submit Proposal Bid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* B. STUDENT RELEASE ESCROW & RATE REVIEW MODAL */}
      {reviewModalOpen && selectedTutorToReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm heading-font">Approve Assignment Solutions</h4>
              <button onClick={handleCloseReviewModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                // Submit review details first
                await handlePostReview(e);
                // Release actual payment from escrow to tutor balance
                const targetAssignment = assignments.find(a => a.tutorId === selectedTutorToReview.id && a.status === 'completed');
                if (targetAssignment) {
                  await releasePayment(targetAssignment.id);
                }
              }}
              className="space-y-4"
            >
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-3.5 rounded-2xl flex gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold block">Approve & Release Payment</span>
                  By approving, you authorize EduSolve to instantly release the escrow contract budget to <span className="font-bold">{selectedTutorToReview.name}</span>.
                </div>
              </div>

              {/* Star Rating picker */}
              <div className="text-center pt-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">
                  Rate your tutoring experience with {selectedTutorToReview.name}
                </label>
                <div className="flex items-center justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review Comment */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Add a comment review
                </label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-sky-500 dark:focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 px-3 py-2 rounded-xl outline-none text-xs text-slate-800 dark:text-slate-100 transition-all resize-none leading-normal"
                  placeholder="What did you like about the solution explainers or draft code sheets?..."
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseReviewModal}
                  className="flex-1 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 shadow"
                >
                  Release Funds & Post Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
