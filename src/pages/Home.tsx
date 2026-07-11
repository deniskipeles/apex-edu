import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { GraduationCap, ShieldCheck, MessageSquare, FileText, ArrowRight, Star, Sparkles, CheckCircle, Flame, Users, BookOpen } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, tutors } = useStore();

  const features = [
    {
      title: 'Milestone Escrow Protection',
      desc: 'Deposit funds securely in escrow. Budget is only released to the tutor once you formally review and approve the finalized assignment solution drafts.',
      icon: ShieldCheck,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400'
    },
    {
      title: 'Built-in Workspace Chat',
      desc: 'Communicate specs directly with your tutor in live chatrooms. Coordinate requirements, send questions, and get direct clarification on any steps.',
      icon: MessageSquare,
      color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/30 dark:text-sky-400'
    },
    {
      title: 'Dynamic File Management',
      desc: 'Attach worksheets, homework outlines, or readings directly to help requests or in the chatrooms. Download completed solutions easily.',
      icon: FileText,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 dark:text-indigo-400'
    }
  ];

  const valueProps = [
    'Direct bidding system for lowest prices',
    'Pre-vetted tutors from top Ivy Leagues',
    '256-bit encrypted secure bank checkout',
    'Support across 40+ subjects & course codes',
    '100% refund guarantee if deadline is missed'
  ];

  return (
    <div className="bg-slate-50/50 dark:bg-slate-900/50 min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-200" id="landing_page">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 bg-white dark:bg-slate-950 border-b border-slate-100 dark:border-slate-900">
        <div className="absolute inset-0 bg-radial-gradient from-sky-50/30 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-1.5 bg-sky-50 dark:bg-sky-950/40 border border-sky-100/80 dark:border-sky-900/50 px-3.5 py-1.5 rounded-full text-sky-700 dark:text-sky-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Trusted by 10,000+ university students
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white heading-font leading-tight">
              Get Expert Homework Help <br />
              With <span className="text-sky-600 dark:text-sky-400">Secure Escrow Payments</span>
            </h1>
            
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
              EduSolve is a secure marketplace connecting students with expert university tutors. Post your assignment requirements, receive competitive bids, discuss specs in live chat, and only release payment upon success.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center items-center">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold px-7 py-3.5 rounded-2xl shadow-lg shadow-sky-500/15 cursor-pointer transition-colors"
                >
                  Enter Student Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                     to="/auth?register=true"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 text-white font-bold px-7 py-3.5 rounded-2xl shadow-lg shadow-sky-500/15 cursor-pointer transition-colors"
                  >
                    Post an Assignment Free
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/auth"
                    className="w-full sm:w-auto bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold px-7 py-3.5 rounded-2xl transition-colors text-center"
                  >
                    Explore Tutor Profiles
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Visual Features Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white heading-font tracking-tight">
            How EduSolve Protects Your Studies
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 max-w-md mx-auto">
            Our multi-layer system ensures a seamless, reliable experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col items-start gap-4"
              >
                <div className={`p-3 rounded-2xl ${feat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base heading-font">{feat.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust & Escrow explanation layout */}
      <section className="py-16 bg-white dark:bg-slate-950 border-y border-slate-100 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* List of protections */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 font-semibold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Escrow Guaranteed
            </div>
            
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white heading-font tracking-tight leading-tight">
              No Risk. Pay Only For <span className="text-emerald-600 dark:text-emerald-400">Approved Solutions</span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Other help sites require immediate upfront payments with no security. With EduSolve, you award the bid, and your payment is locked in our secure sandbox gateway. The tutor gets to work immediately, and funds are only transferred when the solutions meet your specific requirements.
            </p>

            <ul className="space-y-2.5">
              {valueProps.map((prop, idx) => (
                <li key={idx} className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  {prop}
                </li>
              ))}
            </ul>

            <div className="pt-3">
              <Link
                to="/auth?register=true"
                className="inline-flex items-center gap-1 bg-slate-950 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs px-5 py-3 rounded-xl hover:bg-slate-800 shadow-md cursor-pointer transition-colors"
              >
                Sign Up as Student <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>

          {/* Visual representations (Bento mockup grids) */}
          <div className="bg-slate-50 dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800 grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/80 shadow-sm space-y-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span className="text-xl font-bold text-slate-800 dark:text-slate-100 heading-font block">45 min</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block tracking-wider">Average Tutor Bid Time</span>
            </div>
            <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/40 dark:border-slate-800/80 shadow-sm space-y-2">
              <Users className="w-5 h-5 text-sky-500" />
              <span className="text-xl font-bold text-slate-800 dark:text-slate-100 heading-font block">150+</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block tracking-wider">Active PhD Tutors</span>
            </div>
            <div className="col-span-2 bg-slate-950 text-white p-5 rounded-2xl border border-slate-800 shadow-md space-y-2.5">
              <BookOpen className="w-5 h-5 text-sky-400" />
              <span className="text-xs font-bold uppercase tracking-wider block text-sky-400">Escrow Secure Checkouts</span>
              <p className="text-[11px] text-slate-400 leading-normal">
                All platform transactions are routed through fully regulated gateway ledgers. We guarantee dispute assistance and full transparency in tutoring milestones.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Tutors Slider */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white heading-font tracking-tight">
            Meet Our Top-Rated Tutors
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 max-w-md mx-auto">
            Directly negotiate with subject experts specializing in your specific university course.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tutors.slice(0, 4).map((tutor) => (
            <div
              key={tutor.id}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl text-center flex flex-col items-center gap-3.5 shadow-sm"
            >
              <img
                src={tutor.avatar}
                alt={tutor.name}
                className="w-16 h-16 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm"
              />
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm heading-font leading-none">{tutor.name}</h4>
                <p className="text-[10px] bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider w-max mx-auto mt-2">
                  ${tutor.hourlyRate}/hr
                </p>
              </div>

              <div className="flex items-center gap-1.5 justify-center">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span className="font-bold text-xs text-slate-700 dark:text-slate-300">{tutor.rating}</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">{tutor.completedTasks} tasks</span>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal line-clamp-3">
                {tutor.bio}
              </p>

              <div className="flex flex-wrap gap-1 justify-center pt-1.5">
                {tutor.expertise?.slice(0, 3).map((exp, i) => (
                  <span
                    key={i}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[9px] font-bold px-2 py-0.5 rounded-md"
                  >
                    {exp}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Block */}
      <section className="py-16 bg-slate-950 text-white relative">
        <div className="absolute inset-0 bg-gradient-to-tr from-sky-950/20 via-transparent to-indigo-950/30 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6 relative z-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold heading-font tracking-tight">
            Stop Stressing Over Deadlines
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Join thousands of university engineering, science, and humanities students who use EduSolve to excel in homework. Get quality results, on time, with full payment protection.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              to="/auth?register=true"
              className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-bold px-8 py-3 rounded-xl shadow-md transition-colors text-xs cursor-pointer"
            >
              Get Started for Free
            </Link>
            <Link
              to="/tutors"
              className="w-full sm:w-auto border border-slate-700 hover:bg-slate-900 text-slate-300 font-bold px-8 py-3 rounded-xl transition-colors text-xs"
            >
              Meet Tutors
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
