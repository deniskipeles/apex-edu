import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import AssignmentCard from '../components/AssignmentCard';
import { BookOpen, Code, Calculator, Atom, FlaskConical, ChevronRight, HelpCircle, ArrowUpRight, PlusCircle, Bookmark, BookmarkCheck, Check, Sparkles, GraduationCap, Pencil, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CoursesProps {
  onOpenNewAssignment: () => void;
}

export default function Courses({ onOpenNewAssignment }: CoursesProps) {
  const { 
    courses, 
    assignments, 
    isAuthenticated, 
    currentUser, 
    updateProfile,
    createCourse,
    updateCourse,
    deleteCourse
  } = useStore();

  const [selectedCourseId, setSelectedCourseId] = useState<string>('c1'); // Defaults to first course (CS 101)
  const [sidebarFilter, setSidebarFilter] = useState<'all' | 'active'>('all');

  // Course Form States for CRUD
  const [courseFormCode, setCourseFormCode] = useState('');
  const [courseFormName, setCourseFormName] = useState('');
  const [courseFormCategory, setCourseFormCategory] = useState('Computer Science');
  const [courseFormIcon, setCourseFormIcon] = useState('Code');
  const [courseFormDescription, setCourseFormDescription] = useState('');
  const [isFormEditing, setIsFormEditing] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // Form submit handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseFormCode.trim() || !courseFormName.trim()) {
      alert("Please fill in the Course Code and Name.");
      return;
    }

    try {
      if (isFormEditing) {
        await updateCourse(editingCourseId, {
          code: courseFormCode.toUpperCase(),
          name: courseFormName,
          category: courseFormCategory,
          iconName: courseFormIcon,
          description: courseFormDescription,
        });
      } else {
        const exists = courses.some(c => c.code.toLowerCase() === courseFormCode.toLowerCase());
        if (exists) {
          alert("A course with this code already exists.");
          return;
        }

        await createCourse(
          courseFormCode.toUpperCase(),
          courseFormName,
          courseFormCategory,
          courseFormIcon,
          courseFormDescription
        );

        // Auto-select the newly created course!
        const updatedCourses = useStore.getState().courses;
        const newCourse = updatedCourses.find(c => c.code.toUpperCase() === courseFormCode.toUpperCase());
        if (newCourse) {
          setSelectedCourseId(newCourse.id);
        }
      }
      setIsFormModalOpen(false);
    } catch (err: any) {
      alert(err.message || "An error occurred while saving the course.");
    }
  };

  // Delete course handler
  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return;
    }

    try {
      // Find next available course to select
      const remainingCourses = courses.filter(c => c.id !== courseId);
      if (remainingCourses.length > 0) {
        setSelectedCourseId(remainingCourses[0].id);
      } else {
        setSelectedCourseId('');
      }

      await deleteCourse(courseId);
    } catch (err: any) {
      alert(err.message || "Failed to delete course.");
    }
  };

  // Open Create Form modal
  const openCreateModal = () => {
    setIsFormEditing(false);
    setCourseFormCode('');
    setCourseFormName('');
    setCourseFormCategory('Computer Science');
    setCourseFormIcon('Code');
    setCourseFormDescription('');
    setIsFormModalOpen(true);
  };

  // Open Edit Form modal
  const openEditModal = (course: any) => {
    setIsFormEditing(true);
    setEditingCourseId(course.id);
    setCourseFormCode(course.code);
    setCourseFormName(course.name);
    setCourseFormCategory(course.category);
    setCourseFormIcon(course.iconName);
    setCourseFormDescription(course.description);
    setIsFormModalOpen(true);
  };

  // Map icon strings to Lucide elements
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code':
        return <Code className="w-5 h-5 text-sky-600" />;
      case 'Calculator':
        return <Calculator className="w-5 h-5 text-amber-500" />;
      case 'Atom':
        return <Atom className="w-5 h-5 text-violet-500" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-indigo-500" />;
      case 'FlaskConical':
        return <FlaskConical className="w-5 h-5 text-emerald-500" />;
      default:
        return <BookOpen className="w-5 h-5 text-slate-500" />;
    }
  };

  // Helper to determine if a course is active/pinned for the user
  const isCourseActive = (courseId: string, courseCode: string) => {
    if (!currentUser) return false;
    if (currentUser.role === 'student') {
      return currentUser.enrolledCourseIds?.includes(courseId) || false;
    } else {
      return currentUser.expertise?.includes(courseCode) || false;
    }
  };

  // Toggle active class / expertise state
  const handleToggleActiveClass = async (courseId: string, courseCode: string) => {
    if (!currentUser) return;
    
    if (currentUser.role === 'student') {
      const currentList = currentUser.enrolledCourseIds || [];
      const isEnrolled = currentList.includes(courseId);
      const newList = isEnrolled 
        ? currentList.filter(id => id !== courseId)
        : [...currentList, courseId];
      
      await updateProfile({ enrolledCourseIds: newList });
    } else {
      const currentList = currentUser.expertise || [];
      const isExpert = currentList.includes(courseCode);
      const newList = isExpert
        ? currentList.filter(code => code !== courseCode)
        : [...currentList, courseCode];
        
      await updateProfile({ expertise: newList });
    }
  };

  // Filter courses listed in the sidebar
  const displayedCourses = courses.filter(course => {
    if (sidebarFilter === 'all') return true;
    return isCourseActive(course.id, course.code);
  });

  // Count active courses for the badge
  const activeCoursesCount = courses.filter(course => isCourseActive(course.id, course.code)).length;

  const activeCourse = courses.find((c) => c.id === selectedCourseId) || courses[0];
  const courseAssignments = assignments.filter((a) => a.courseId === selectedCourseId && a.status === 'open');

  // Auto-adjust selected course if the currently selected one is not in the filtered list
  const isSelectedVisible = displayedCourses.some(c => c.id === selectedCourseId);
  const handleSelectCourse = (id: string) => {
    setSelectedCourseId(id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="courses_department_page">
      
      {/* 1. Page Header */}
      <div className="text-center md:text-left space-y-2 mb-8">
        <span className="text-[10px] bg-slate-900 dark:bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-block">
          University Curriculum Departments
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white heading-font tracking-tight">
          Browse Subject Course Pages
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl">
          Organize homework help by specific university syllabus criteria. Pin your classes to curate your custom active study dashboard.
        </p>
      </div>

      {/* 2. Double Pane Directory Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Course Directory list */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
              Syllabus Catalog
            </span>
            {isAuthenticated && (
              <button
                onClick={openCreateModal}
                className="text-[11px] text-sky-600 hover:text-sky-700 font-bold flex items-center gap-1 transition-colors cursor-pointer bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900 px-2 py-1 rounded-lg"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Subject</span>
              </button>
            )}
          </div>
            
          {/* Sidebar filter toggle */}
          {isAuthenticated && (
            <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] self-start sm:self-auto">
              <button
                onClick={() => setSidebarFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                  sidebarFilter === 'all'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                All Subjects
              </button>
              <button
                onClick={() => setSidebarFilter('active')}
                className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  sidebarFilter === 'active'
                    ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                My Active Classes
                {activeCoursesCount > 0 && (
                  <span className="bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                    {activeCoursesCount}
                  </span>
                )}
              </button>
            </div>
          )}

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {displayedCourses.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center"
                >
                  <GraduationCap className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                  <h5 className="font-bold text-slate-700 dark:text-slate-300 text-xs heading-font">No Active Classes</h5>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-[200px] mx-auto leading-relaxed">
                    Toggle "All Subjects" and pin classes from your syllabus to build your private dashboard!
                  </p>
                </motion.div>
              ) : (
                displayedCourses.map((course, idx) => {
                  const isActive = course.id === selectedCourseId;
                  const matchingCount = assignments.filter((a) => a.courseId === course.id && a.status === 'open').length;
                  const isPinned = isCourseActive(course.id, course.code);
                  
                  return (
                    <motion.button
                      layoutId={`course_card_${course.id}`}
                      key={course.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.04 } }}
                      onClick={() => handleSelectCourse(course.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                        isActive
                          ? 'bg-white dark:bg-slate-900 border-sky-500 dark:border-sky-500 shadow-md ring-2 ring-sky-500/10 dark:ring-sky-500/20'
                          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 rounded-xl relative">
                          {getIcon(course.iconName)}
                          {isPinned && (
                            <span className="absolute -top-1 -right-1 bg-sky-500 text-white p-0.5 rounded-full border-2 border-white dark:border-slate-900">
                              <Check className="w-2 h-2 stroke-[3]" />
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs heading-font leading-none">{course.code}</h4>
                            {isPinned && (
                              <span className="text-[8px] bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 font-bold border border-sky-100 dark:border-sky-900 px-1 py-0.5 rounded uppercase tracking-wide">
                                Active
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block mt-1">{course.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {matchingCount > 0 && (
                          <span className="bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-bold text-[10px] px-2 py-0.5 rounded-full">
                            {matchingCount}
                          </span>
                        )}
                        <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isActive ? 'text-sky-600 translate-x-0.5' : 'text-slate-300'}`} />
                      </div>
                    </motion.button>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Selected Course Assignment Feed */}
        <div className="lg:col-span-8 space-y-6">
          {activeCourse && (
            <div key={activeCourse.id}>
              {/* Syllabus metadata banner */}
              <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-950/20 to-transparent pointer-events-none" />
                
                <div className="space-y-2 relative z-10">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider font-mono">
                      {activeCourse.code}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{activeCourse.category}</span>
                    {isCourseActive(activeCourse.id, activeCourse.code) && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        My Active Class
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black heading-font tracking-tight">{activeCourse.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xl">{activeCourse.description}</p>
                </div>

                {/* Pin button + Action button bundle */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto mt-2 md:mt-0 relative z-10">
                  {isAuthenticated && (
                    <button
                      onClick={() => handleToggleActiveClass(activeCourse.id, activeCourse.code)}
                      className={`flex items-center justify-center gap-1.5 text-xs px-3.5 py-2.5 rounded-xl font-bold cursor-pointer transition-all border ${
                        isCourseActive(activeCourse.id, activeCourse.code)
                          ? 'bg-slate-800 border-slate-700 text-sky-400 hover:bg-slate-750'
                          : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                      }`}
                      title={isCourseActive(activeCourse.id, activeCourse.code) ? "Remove from my classes" : "Add to my classes"}
                    >
                      {isCourseActive(activeCourse.id, activeCourse.code) ? (
                        <>
                          <BookmarkCheck className="w-4 h-4 fill-sky-500/20 text-sky-400" />
                          <span>Active Class</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4" />
                          <span>Pin to Active</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Course Admin / Editing controls */}
                  {isAuthenticated && (
                    <div className="flex gap-1 bg-white/5 border border-white/10 p-1 rounded-xl">
                      <button
                        onClick={() => openEditModal(activeCourse)}
                        className="p-2.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all cursor-pointer flex items-center justify-center"
                        title="Edit Subject details"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(activeCourse.id)}
                        className="p-2.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white transition-all cursor-pointer flex items-center justify-center"
                        title="Delete Course Subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Quick submit trigger */}
                  {isAuthenticated && currentUser?.role === 'student' && (
                    <button
                      onClick={onOpenNewAssignment}
                      className="flex-1 md:flex-none bg-sky-600 hover:bg-sky-700 text-white text-xs px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-lg shadow-sky-600/10"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Request Help</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Assignment requests under this course */}
              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">
                    Active Open Requests ({courseAssignments.length})
                  </span>
                  
                  {isCourseActive(activeCourse.id, activeCourse.code) && (
                    <div className="flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 font-semibold bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900 px-2.5 py-1 rounded-lg">
                      <Sparkles className="w-3.5 h-3.5" />
                      Pinned Class Sync Active
                    </div>
                  )}
                </div>

                {courseAssignments.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                    <HelpCircle className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm heading-font">No Open Assignment Requests</h4>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                      There are currently no active help requests listed for {activeCourse.code}. Be the first to start a discussion!
                    </p>
                    {isAuthenticated && currentUser?.role === 'student' && (
                      <button
                        onClick={onOpenNewAssignment}
                        className="bg-slate-950 dark:bg-slate-800 text-white text-xs px-4 py-2.5 rounded-xl mt-4 font-bold inline-flex items-center gap-1.5 hover:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer transition-colors shadow"
                      >
                        <PlusCircle className="w-4 h-4" /> Create Help Request
                      </button>
                    )}
                  </div>
                ) : (
                  courseAssignments.map((item) => (
                    <AssignmentCard key={item.id} assignment={item} />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Course Form Modal (Create / Edit) */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" id="course_form_modal_overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              id="course_form_modal_card"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base heading-font">
                    {isFormEditing ? "Edit Subject Course" : "Create New Subject"}
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Define curriculum criteria and help requests routing</p>
                </div>
                <button
                  onClick={() => setIsFormModalOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Code & Name Row */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Course Code *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. CS 301"
                      required
                      value={courseFormCode}
                      onChange={(e) => setCourseFormCode(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-3.5 py-2.5 rounded-xl outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 transition-all uppercase"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                      Course Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Advanced Database Systems"
                      required
                      value={courseFormName}
                      onChange={(e) => setCourseFormName(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-3.5 py-2.5 rounded-xl outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                    />
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Category Group
                  </label>
                  <select
                    value={courseFormCategory}
                    onChange={(e) => setCourseFormCategory(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-3.5 py-2.5 rounded-xl outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 transition-all cursor-pointer"
                  >
                    <option value="Computer Science" className="dark:bg-slate-900">Computer Science</option>
                    <option value="Mathematics" className="dark:bg-slate-900">Mathematics</option>
                    <option value="Science" className="dark:bg-slate-900">Science</option>
                    <option value="Engineering" className="dark:bg-slate-900">Engineering</option>
                    <option value="Business" className="dark:bg-slate-900">Business</option>
                    <option value="Humanities" className="dark:bg-slate-900">Humanities</option>
                  </select>
                </div>

                {/* Icon Picker Grid */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Visual Subject Icon
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      { name: 'Code', icon: <Code className="w-4 h-4" /> },
                      { name: 'Calculator', icon: <Calculator className="w-4 h-4" /> },
                      { name: 'Atom', icon: <Atom className="w-4 h-4" /> },
                      { name: 'FlaskConical', icon: <FlaskConical className="w-4 h-4" /> },
                      { name: 'BookOpen', icon: <BookOpen className="w-4 h-4" /> },
                      { name: 'HelpCircle', icon: <HelpCircle className="w-4 h-4" /> },
                    ].map((item) => {
                      const isSelected = courseFormIcon === item.name;
                      return (
                        <button
                          key={item.name}
                          type="button"
                          onClick={() => setCourseFormIcon(item.name)}
                          className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-400 dark:border-sky-500 text-sky-600 dark:text-sky-400 shadow-sm ring-1 ring-sky-400'
                              : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          {item.icon}
                          <span className="text-[9px] font-semibold truncate max-w-full block leading-none">{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    Subject Syllabus Description
                  </label>
                  <textarea
                    placeholder="Provide a short breakdown of topics, typical homework challenges, or course textbooks to guide expert tutors."
                    rows={4}
                    value={courseFormDescription}
                    onChange={(e) => setCourseFormDescription(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 px-3.5 py-2.5 rounded-xl outline-none focus:border-sky-500 focus:bg-white dark:focus:bg-slate-900 transition-all resize-none leading-relaxed"
                  />
                </div>

                {/* Form Action Footer */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 bg-white dark:bg-slate-900">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-sky-600 hover:bg-sky-700 transition-colors shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    {isFormEditing ? "Save Changes" : "Create Subject"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

