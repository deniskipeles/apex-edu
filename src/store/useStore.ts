import { create } from 'zustand';
import { ApexKit, ApexKitRealtimeWSClient } from '../lib/apexClient';
import { UserProfile, Assignment, Bid, Message, Course, Review, PaymentTransaction } from '../types';

// Instantiate the production-ready ApexKit client
let apex: ApexKit = new ApexKit("https://kipeles-vs--5000.hf.space").tenant('apex-assignment-help') as ApexKit;

interface AppState {
  apex: ApexKit;
  wsClient: ApexKitRealtimeWSClient | null;
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Tenant / Collection state trackers
  tenantId: string;
  isTenantFallback: boolean;
  missingCollections: string[];

  // Data collections
  courses: Course[];
  assignments: Assignment[];
  bids: Bid[];
  messages: Message[];
  tutors: UserProfile[];
  reviews: Review[];
  payments: PaymentTransaction[];

  // Navigation / active states
  activeChatRoomId: string | null;
  activeChatPartner: UserProfile | null;

  // Actions
  init: () => Promise<void>;
  switchTenant: (tenantId: string) => Promise<void>;
  simulateMissingCollection: (collectionName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, role: 'student' | 'tutor', extra?: any) => Promise<boolean>;
  logout: () => void;
  updateProfile: (metadata: Partial<UserProfile>) => Promise<void>;
  depositFunds: (amount: number) => Promise<void>;

  // Assignment Actions
  fetchAssignments: () => Promise<void>;
  createAssignment: (title: string, description: string, courseId: string, budget: number, deadline: string, files: File[]) => Promise<void>;
  cancelAssignment: (assignmentId: string) => Promise<void>;

  // Tutor Bidding Actions
  submitBid: (assignmentId: string, amount: number, proposal: string) => Promise<void>;
  acceptBid: (assignmentId: string, bidId: string) => Promise<void>;

  // Contract Workflow
  markAssignmentCompleted: (assignmentId: string, solutionUrls?: { name: string; url: string; size: number }[]) => Promise<void>;
  releasePayment: (assignmentId: string) => Promise<void>;

  // Chat Actions
  startChat: (tutorId: string, assignmentId?: string) => Promise<void>;
  fetchMessages: (chatRoomId: string) => Promise<void>;
  sendMessage: (text: string, file?: File) => Promise<void>;

  // Review Actions
  submitReview: (tutorId: string, rating: number, comment: string, assignmentTitle: string) => Promise<void>;

  // Course CRUD Actions
  createCourse: (code: string, name: string, category: string, iconName: string, description: string) => Promise<void>;
  updateCourse: (courseId: string, updates: Partial<Omit<Course, 'id'>>) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;

  // Theme Management
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  apex,
  wsClient: null,
  currentUser: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  tenantId: 'apex-assignment-help',
  isTenantFallback: false,
  missingCollections: [],

  courses: [],
  assignments: [],
  bids: [],
  messages: [],
  tutors: [],
  reviews: [],
  payments: [],

  activeChatRoomId: null,
  activeChatPartner: null,

  theme: (typeof window !== 'undefined' ? localStorage.getItem('theme') as 'light' | 'dark' : 'light') || 'light',
  toggleTheme: () => {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme: nextTheme });
  },

  init: async () => {
    const currentTheme = get().theme;
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    set({ isLoading: true, error: null });
    try {
      const status = typeof apex.getTenantStatus === 'function' 
        ? apex.getTenantStatus() 
        : { tenantId: 'root', fallbackActive: false };

      set({
        tenantId: status.tenantId,
        isTenantFallback: status.fallbackActive,
        missingCollections: [...(apex.missingCollectionsHandled || [])]
      });

      const token = apex.getToken();
      let ws: ApexKitRealtimeWSClient | null = null;
      if (token) {
        ws = new ApexKitRealtimeWSClient(apex.baseUrl, token);
        ws.connect();
        
        ws.onEvent((msg: any) => {
          if (msg.type === 'Signal' && msg.event === 'NewMessage') {
            const receivedMsg = msg.payload as Message;
            set((state) => {
              const updatedMessages = [...state.messages];
              if (!updatedMessages.some(m => m.id === receivedMsg.id)) {
                updatedMessages.push(receivedMsg);
              }
              return { messages: updatedMessages };
            });
          }
        });
      }

      let profile: UserProfile | null = null;
      if (token) {
        try {
          const user = await apex.auth.getMe();
          
          // Query the users_profiles collection for the profile record owned by this system user
          const userProfileRes = await apex.collection('users_profiles').list({
            filter: JSON.stringify({ user_id: user.id })
          });

          const profileRecord = userProfileRes.items[0];

          if (profileRecord) {
            // Unfold the profile record schema and map its unique ID
            const profileData = {
              id: String(profileRecord.id), // The unique users_profiles record ID
              ...profileRecord.data
            };

            profile = {
              id: profileData.id, // Overwrite profile.id with the relational users_profiles ID
              email: user.email,
              role: user.role as 'student' | 'tutor',
              name: profileData.name || '',
              avatar: profileData.avatar || '',
              bio: profileData.bio || '',
              expertise: profileData.expertise || [],
              hourlyRate: Number(profileData.hourlyRate) || 0,
              completedTasks: Number(profileData.completedTasks) || 0,
              balance: Number(profileData.balance) ?? 0,
              reviewsCount: Number(profileData.reviewsCount) || 0,
              enrolledCourseIds: profileData.enrolledCourseIds || []
            };
          } else {
            // Fallback to system profile structure if users_profiles is not seeded yet
            profile = {
              id: user.id,
              email: user.email,
              role: user.role as 'student' | 'tutor',
              name: user.metadata?.name || '',
              avatar: user.metadata?.avatar || '',
              bio: user.metadata?.bio || '',
              expertise: user.metadata?.expertise || [],
              hourlyRate: user.metadata?.hourlyRate || 0,
              completedTasks: user.metadata?.completedTasks || 0,
              balance: user.metadata?.balance ?? 0,
              reviewsCount: user.metadata?.reviewsCount || 0,
              enrolledCourseIds: user.metadata?.enrolledCourseIds || []
            };
          }
        } catch (authErr) {
          console.warn('[Store] Session token invalid or expired. Clearing credentials.', authErr);
          apex.auth.logout();
        }
      }

      // Fetch all collections concurrently with fallback protection to prevent cascading failures
      const [
        coursesRes,
        tutorsRes,
        assignmentsRes,
        bidsRes,
        reviewsRes,
        paymentsRes
      ] = await Promise.all([
        apex.collection('courses').list().catch(() => ({ items: [] })),
        apex.collection('users_profiles').list().catch(() => ({ items: [] })),
        apex.collection('assignments').list().catch(() => ({ items: [] })),
        apex.collection('bids').list().catch(() => ({ items: [] })),
        apex.collection('tutors_reviews').list().catch(() => ({ items: [] })),
        apex.collection('payments').list().catch(() => ({ items: [] }))
      ]);

      const courses = (coursesRes.items as any[]).map(item => ({
        id: String(item.id),
        ...item.data,
        created: item.created,
        updated: item.updated
      })) as unknown as Course[];

      const tutors = (tutorsRes.items as any[])
        .map(item => ({
          id: String(item.id),
          ...item.data,
          created: item.created,
          updated: item.updated
        }))
        .filter(u => u.role === 'tutor') as unknown as UserProfile[];

      const assignments = (assignmentsRes.items as any[]).map(item => ({
        id: String(item.id),
        ...item.data,
        created: item.created,
        updated: item.updated
      })) as unknown as Assignment[];

      const bids = (bidsRes.items as any[]).map(item => ({
        id: String(item.id),
        ...item.data,
        created: item.created,
        updated: item.updated
      })) as unknown as Bid[];

      const reviews = (reviewsRes.items as any[]).map(item => ({
        id: String(item.id),
        ...item.data,
        created: item.created,
        updated: item.updated
      })) as unknown as Review[];

      const payments = (paymentsRes.items as any[]).map(item => ({
        id: String(item.id),
        ...item.data,
        created: item.created,
        updated: item.updated
      })) as unknown as PaymentTransaction[];

      set({
        wsClient: ws,
        currentUser: profile,
        isAuthenticated: !!profile,
        courses,
        tutors,
        assignments,
        bids,
        reviews,
        payments,
        isLoading: false,
      });

    } catch (err: any) {
      console.error('[Store Init Error]:', err);
      set({ isLoading: false, error: err.message || 'Failed to initialize app' });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apex.auth.login(email, password);

      // Explicitly trigger token synchronization with localStorage
      apex.setToken(res.token, res.user);
      
      const userProfile: UserProfile = {
        id: res.user.id,
        email: res.user.email,
        role: res.user.role as 'student' | 'tutor',
        name: res.user.metadata?.name || '',
        avatar: res.user.metadata?.avatar || '',
        bio: res.user.metadata?.bio || '',
        expertise: res.user.metadata?.expertise || [],
        hourlyRate: res.user.metadata?.hourlyRate || 0,
        completedTasks: res.user.metadata?.completedTasks || 0,
        balance: res.user.metadata?.balance ?? 0,
        reviewsCount: res.user.metadata?.reviewsCount || 0,
        enrolledCourseIds: res.user.metadata?.enrolledCourseIds || []
      };

      set({
        currentUser: userProfile,
        isAuthenticated: true,
        isLoading: false,
      });

      await get().init();
      return true;
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Login failed' });
      return false;
    }
  },

  register: async (email, password, name, role, extra = {}) => {
    set({ isLoading: true, error: null });
    try {
      const avatar = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${name.replace(/\s+/g, '')}`;
      const metadata = {
        name,
        role,
        avatar,
        bio: extra.bio || '',
        expertise: extra.expertise || [],
        hourlyRate: extra.hourlyRate ? Number(extra.hourlyRate) : 35,
        completedTasks: 0,
        balance: role === 'student' ? 300 : 0,
        reviewsCount: 0
      };

      const res = await apex.auth.register(email, password, metadata, role);
      
      // Explicitly trigger token synchronization with localStorage
      apex.setToken(res.token, res.user);
      
      set({ isLoading: false });
      return await get().login(email, password);
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Registration failed' });
      return false;
    }
  },

  logout: () => {
    apex.auth.logout();
    if (get().wsClient) {
      get().wsClient?.disconnect();
    }
    set({
      currentUser: null,
      isAuthenticated: false,
      wsClient: null,
      messages: [],
      activeChatRoomId: null,
      activeChatPartner: null,
    });
  },

  updateProfile: async (updates) => {
    if (!get().currentUser) return;
    set({ isLoading: true, error: null });
    try {
      await apex.auth.updateMe(updates);
      
      set((state) => ({
        currentUser: state.currentUser ? { ...state.currentUser, ...updates } : null,
        isLoading: false,
      }));

      const tutorsRes = await apex.collection('users_profiles').list();
      const registeredTutors = (tutorsRes.items as any[])
        .map(item => ({
          id: String(item.id),
          ...item.data,
          created: item.created,
          updated: item.updated
        }))
        .filter(u => u.role === 'tutor') as unknown as UserProfile[];
      set({ tutors: registeredTutors });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to update profile' });
    }
  },

  depositFunds: async (amount) => {
    const user = get().currentUser;
    if (!user || user.role !== 'student') return;
    set({ isLoading: true });
    try {
      const newBalance = (user.balance || 0) + amount;
      await get().updateProfile({ balance: newBalance });
      set({ isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Deposit failed' });
    }
  },

  fetchAssignments: async () => {
    try {
      const res = await apex.collection('assignments').list();
      const unfolded = (res.items as any[]).map(item => ({
        id: String(item.id),
        ...item.data,
        created: item.created,
        updated: item.updated
      })) as unknown as Assignment[];
      set({ assignments: unfolded });
    } catch (err) {
      console.error('Error fetching assignments', err);
    }
  },

  createAssignment: async (title, description, courseId, budget, deadline, files) => {
    const user = get().currentUser;
    if (!user || user.role !== 'student') throw new Error('Only students can create requests.');

    set({ isLoading: true, error: null });
    try {
      const fileUrls: { name: string; url: string; size: number }[] = [];
      for (const file of files) {
        const uploaded = await apex.files.upload(file);
        fileUrls.push({
          name: uploaded.filename,
          url: uploaded.url,
          size: uploaded.size
        });
      }

      const course = get().courses.find(c => c.id === courseId);
      const courseCode = course ? course.code : 'GEN';

      const newAssignment = {
        title,
        description,
        courseId,
        courseCode,
        budget: Number(budget),
        deadline: new Date(deadline).toISOString(), // Convert to fully qualified UTC ISO 8601 string
        studentId: user.id,
        studentName: user.name,
        status: 'open',
        fileUrls: fileUrls || [], // Guarantee a valid JSON array structure
        solutionUrls: [],        // Explicitly initialize with an empty JSON array
        bidsCount: 0,
        createdAt: new Date().toISOString()
      };

      await apex.collection('assignments').create(newAssignment);
      
      await get().fetchAssignments();
      set({ isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to create assignment request' });
      throw err;
    }
  },

  cancelAssignment: async (assignmentId) => {
    set({ isLoading: true });
    try {
      await apex.collection('assignments').update(assignmentId, { status: 'cancelled' });
      await get().fetchAssignments();
      set({ isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  submitBid: async (assignmentId, amount, proposal) => {
    const user = get().currentUser;
    if (!user || user.role !== 'tutor') throw new Error('Only tutors can place proposals.');

    set({ isLoading: true, error: null });
    try {
      const assignment = get().assignments.find(a => a.id === assignmentId);
      if (!assignment) throw new Error('Assignment not found');

      const newBid = {
        assignmentId,
        assignmentTitle: assignment.title,
        tutorId: user.id,
        tutorName: user.name,
        tutorAvatar: user.avatar,
        tutorRating: user.rating || 5,
        amount: Number(amount),
        proposal,
        createdAt: new Date().toISOString()
      };

      await apex.collection('bids').create(newBid);

      const bidsRes = await apex.collection('bids').list();
      const unfoldedBids = (bidsRes.items as any[]).map(item => ({
        id: String(item.id),
        ...item.data,
        created: item.created,
        updated: item.updated
      })) as unknown as Bid[];

      set({ bids: unfoldedBids });
      await get().fetchAssignments();
      set({ isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to place bid' });
      throw err;
    }
  },

  acceptBid: async (assignmentId, bidId) => {
    const student = get().currentUser;
    if (!student || student.role !== 'student') throw new Error('Unauthorized');

    set({ isLoading: true, error: null });
    try {
      const bid = get().bids.find(b => b.id === bidId);
      const assignment = get().assignments.find(a => a.id === assignmentId);

      if (!bid || !assignment) throw new Error('Contract files not found');
      if ((student.balance || 0) < bid.amount) {
        throw new Error('Insufficient wallet balance. Please add funds using the Payment Gateway first!');
      }

      const newStudentBalance = (student.balance || 0) - bid.amount;
      await get().updateProfile({ balance: newStudentBalance });

      const transaction = {
        assignmentId,
        assignmentTitle: assignment.title,
        studentId: student.id,
        studentName: student.name,
        tutorId: bid.tutorId,
        tutorName: bid.tutorName,
        amount: bid.amount,
        status: 'escrow',
        stripePaymentId: 'ch_stripe_' + Math.random().toString(36).substr(2, 12),
        createdAt: new Date().toISOString()
      };
      await apex.collection('payments').create(transaction);

      await apex.collection('assignments').update(assignmentId, {
        tutorId: bid.tutorId,
        tutorName: bid.tutorName,
        status: 'active'
      });

      await get().fetchAssignments();
      const payRes = await apex.collection('payments').list();
      const unfoldedPayments = (payRes.items as any[]).map(item => ({
        id: String(item.id),
        ...item.data,
        created: item.created,
        updated: item.updated
      })) as unknown as PaymentTransaction[];

      set({
        payments: unfoldedPayments,
        isLoading: false
      });

      await get().startChat(bid.tutorId, assignmentId);

    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Payment or contract execution failed' });
      throw err;
    }
  },

  markAssignmentCompleted: async (assignmentId, solutionUrls) => {
    set({ isLoading: true });
    try {
      await apex.collection('assignments').update(assignmentId, {
        status: 'completed',
        solutionUrls: solutionUrls || []
      });
      await get().fetchAssignments();
      set({ isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message });
    }
  },

  releasePayment: async (assignmentId) => {
    const student = get().currentUser;
    if (!student || student.role !== 'student') throw new Error('Unauthorized');

    set({ isLoading: true, error: null });
    try {
      const payments = get().payments;
      const tx = payments.find(p => p.assignmentId === assignmentId && p.status === 'escrow');
      if (!tx) throw new Error('Active escrow transaction not found');

      await apex.collection('payments').update(tx.id, { status: 'released' });
      await apex.collection('assignments').update(assignmentId, { status: 'paid' });

      await get().fetchAssignments();
      
      const payRes = await apex.collection('payments').list();
      const unfoldedPayments = (payRes.items as any[]).map(item => ({
        id: String(item.id),
        ...item.data,
        created: item.created,
        updated: item.updated
      })) as unknown as PaymentTransaction[];

      const tutorsRes = await apex.collection('users_profiles').list();
      const unfoldedTutors = (tutorsRes.items as any[])
        .map(item => ({
          id: String(item.id),
          ...item.data,
          created: item.created,
          updated: item.updated
        }))
        .filter(u => u.role === 'tutor') as unknown as UserProfile[];
      
      set({
        payments: unfoldedPayments,
        tutors: unfoldedTutors,
        isLoading: false
      });

    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to release payment' });
      throw err;
    }
  },

  startChat: async (tutorId, assignmentId) => {
    const user = get().currentUser;
    if (!user) return;

    let chatRoomId = '';
    let partnerId = '';
    
    if (user.role === 'student') {
      chatRoomId = `${user.id}_${tutorId}`;
      partnerId = tutorId;
    } else {
      chatRoomId = `${tutorId}_${user.id}`;
      partnerId = tutorId;
    }

    let partnerProfile = get().tutors.find(p => p.id === partnerId);
    if (!partnerProfile) {
      try {
        const res = await apex.collection('users_profiles').get(partnerId);
        partnerProfile = {
          id: String(res.id),
          ...res.data,
          created: res.created,
          updated: res.updated
        } as unknown as UserProfile;
      } catch (e) {
        console.error('Failed to fetch partner profile:', e);
      }
    }

    set({
      activeChatRoomId: chatRoomId,
      activeChatPartner: partnerProfile || null
    });

    await get().fetchMessages(chatRoomId);
  },

  fetchMessages: async (chatRoomId) => {
    try {
      const res = await apex.collection('messages').list({
        filter: JSON.stringify({ chatRoomId })
      });
      const unfolded = (res.items as any[]).map(item => ({
        id: String(item.id),
        ...item.data,
        created: item.created,
        updated: item.updated
      })) as unknown as Message[];
      set({ messages: unfolded });
    } catch (err) {
      console.error('Error fetching chat messages', err);
    }
  },

  sendMessage: async (text, file) => {
    const user = get().currentUser;
    const room = get().activeChatRoomId;
    if (!user || !room) return;

    try {
      let filePayload = undefined;
      if (file) {
        const uploaded = await apex.files.upload(file);
        filePayload = {
          name: uploaded.filename,
          url: uploaded.url,
          size: uploaded.size,
          mime: uploaded.mime_type
        };
      }

      const msgData = {
        chatRoomId: room,
        senderId: user.id,
        senderName: user.name,
        text,
        file: filePayload
      };

      if (get().wsClient && get().wsClient?.isConnected) {
        get().wsClient?.sendSignal(room, 'NewMessage', msgData);
      } else {
        const now = new Date().toISOString();
        const savedMsg = await apex.collection('messages').create({
          ...msgData,
          createdAt: now
        });
        const unfoldedMsg = {
          id: String(savedMsg.id),
          ...savedMsg.data,
          created: savedMsg.created,
          updated: savedMsg.updated
        } as unknown as Message;
        set((state) => ({ messages: [...state.messages, unfoldedMsg] }));
      }

    } catch (err) {
      console.error('Failed to send message', err);
    }
  },

  submitReview: async (tutorId, rating, comment, assignmentTitle) => {
    const student = get().currentUser;
    if (!student) throw new Error('Unauthorized');

    try {
      const review = {
        tutorId,
        studentName: student.name,
        rating,
        comment,
        assignmentTitle,
        createdAt: new Date().toISOString()
      };

      await apex.collection('tutors_reviews').create(review);

      const reviewsRes = await apex.collection('tutors_reviews').list();
      const unfoldedReviews = (reviewsRes.items as any[]).map(item => ({
        id: String(item.id),
        ...item.data,
        created: item.created,
        updated: item.updated
      })) as unknown as Review[];

      const tutorsRes = await apex.collection('users_profiles').list();
      const unfoldedTutors = (tutorsRes.items as any[])
        .map(item => ({
          id: String(item.id),
          ...item.data,
          created: item.created,
          updated: item.updated
        }))
        .filter(u => u.role === 'tutor') as unknown as UserProfile[];
      
      set({
        reviews: unfoldedReviews,
        tutors: unfoldedTutors
      });

    } catch (err) {
      console.error('Failed to submit review', err);
    }
  },

  createCourse: async (code, name, category, iconName, description) => {
    set({ isLoading: true, error: null });
    try {
      const courseData = {
        code,
        name,
        category,
        iconName,
        description
      };
      await apex.collection('courses').create(courseData);
      const coursesRes = await apex.collection('courses').list();
      const unfoldedCourses = (coursesRes.items as any[]).map(item => ({
        id: String(item.id),
        ...item.data,
        created: item.created,
        updated: item.updated
      })) as unknown as Course[];
      set({ courses: unfoldedCourses, isLoading: false });
    } catch (err: any) {
      console.error('Failed to create course', err);
      set({ isLoading: false, error: err.message || 'Failed to create course' });
    }
  },

  updateCourse: async (courseId, updates) => {
    set({ isLoading: true, error: null });
    try {
      await apex.collection('courses').update(courseId, updates);
      const coursesRes = await apex.collection('courses').list();
      const unfoldedCourses = (coursesRes.items as any[]).map(item => ({
        id: String(item.id),
        ...item.data,
        created: item.created,
        updated: item.updated
      })) as unknown as Course[];
      set({ courses: unfoldedCourses, isLoading: false });
    } catch (err: any) {
      console.error('Failed to update course', err);
      set({ isLoading: false, error: err.message || 'Failed to update course' });
    }
  },

  deleteCourse: async (courseId) => {
    set({ isLoading: true, error: null });
    try {
      await apex.collection('courses').delete(courseId);
      const coursesRes = await apex.collection('courses').list();
      const unfoldedCourses = (coursesRes.items as any[]).map(item => ({
        id: String(item.id),
        ...item.data,
        created: item.created,
        updated: item.updated
      })) as unknown as Course[];
      set({ courses: unfoldedCourses, isLoading: false });
    } catch (err: any) {
      console.error('Failed to delete course', err);
      set({ isLoading: false, error: err.message || 'Failed to delete course' });
    }
  },

  switchTenant: async (newTenantId: string) => {
    set({ isLoading: true, error: null });
    try {
      apex = new ApexKit(window.location.origin).tenant(newTenantId) as ApexKit;
      set({ apex, tenantId: newTenantId });
      await get().init();
    } catch (err: any) {
      console.error('[Store switchTenant Error]:', err);
      set({ isLoading: false, error: err.message || 'Failed to switch tenant' });
    }
  },

  simulateMissingCollection: async (collectionName: string) => {
    set({ isLoading: true, error: null });
    try {
      await apex.collection(collectionName).list();
      set({
        // missingCollections: [...apex.missingCollectionsHandled],
        isLoading: false
      });
    } catch (err: any) {
      console.error('[Store simulateMissingCollection Error]:', err);
      set({ isLoading: false, error: err.message || 'Failed to simulate missing collection' });
    }
  }
}));