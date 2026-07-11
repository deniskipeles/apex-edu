import { UserProfile } from '../types';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { Star, MessageSquare, Award, BookOpen } from 'lucide-react';

interface TutorCardProps {
  tutor: UserProfile;
  key?: string | number;
}

export default function TutorCard({ tutor }: TutorCardProps) {
  const { startChat, currentUser } = useStore();
  const navigate = useNavigate();

  const handleContact = () => {
    startChat(tutor.id);
    navigate('/dashboard?tab=messages');
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col" id={`tutor_card_${tutor.id}`}>
      {/* Visual profile header */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col items-center text-center">
        <div className="relative">
          <img
            src={tutor.avatar || 'https://api.dicebear.com/7.x/pixel-art/svg'}
            alt={tutor.name}
            className="w-18 h-18 rounded-full border-2 border-slate-100 dark:border-slate-800 shadow-sm object-cover"
          />
          {tutor.completedTasks && tutor.completedTasks > 50 && (
            <div
              className="absolute -bottom-1 -right-1 bg-sky-600 text-white p-1 rounded-full border-2 border-white dark:border-slate-900 shadow-sm"
              title="Top Rated Tutor"
            >
              <Award className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Name & Rate */}
        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-3.5 heading-font leading-none">{tutor.name}</h4>
        <p className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold uppercase tracking-wider mt-1.5">${tutor.hourlyRate}/hour rate</p>

        {/* Rating and completed tasks count */}
        <div className="flex items-center gap-1.5 mt-2.5">
          <div className="flex items-center gap-0.5 text-amber-500 font-bold text-xs">
            <Star className="w-4 h-4 fill-amber-500" /> {tutor.rating || '5.0'}
          </div>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{tutor.completedTasks || 0} completed tasks</span>
        </div>

        {/* Bio */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mt-3 leading-relaxed">
          {tutor.bio || 'Professional academic coach specializing in advanced university engineering subjects.'}
        </p>

        {/* Subject badges */}
        {tutor.expertise && tutor.expertise.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mt-4">
            {tutor.expertise.map((exp, idx) => (
              <span
                key={idx}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold px-2.5 py-0.5 rounded-lg mono-font flex items-center gap-1"
              >
                <BookOpen className="w-2.5 h-2.5 text-slate-400 dark:text-slate-500" />
                {exp}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Hire/Message Footer */}
      {currentUser?.id !== tutor.id && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 shrink-0">
          <button
            onClick={handleContact}
            className="w-full flex items-center justify-center gap-1.5 py-2 border border-slate-200 dark:border-slate-800 hover:border-sky-500 dark:hover:border-sky-400 hover:bg-sky-50/50 dark:hover:bg-sky-950/40 text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 font-semibold rounded-xl text-xs cursor-pointer transition-all duration-200"
          >
            <MessageSquare className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-sky-500" />
            Discuss Assignment specs
          </button>
        </div>
      )}
    </div>
  );
}
