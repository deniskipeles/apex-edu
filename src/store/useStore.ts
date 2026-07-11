import { create } from 'zustand';
import { ApexKit, ApexKitRealtimeWSClient, browserDB } from '../lib/apexClient';
import { UserProfile, Assignment, Bid, Message, Course, Review, PaymentTransaction } from '../types';

// Instantiate ApexKit pointing to a mockup endpoint, with the 'apex-assignment-help' tenant by default
let apex = new ApexKit('https://api.apexkit.edu').tenant('apex-assignment-help');

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
  startChat: (tutorId: string, assignmentId?: string) => void;
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
    // Apply current theme on initialize
    const currentTheme = get().theme;
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    set({ isLoading: true, error: null });
    try {
      // Set tenant fallback status checks
      const status = apex.getTenantStatus();
      set({
        tenantId: status.tenantId,
        isTenantFallback: status.fallbackActive,
        missingCollections: [...apex.missingCollectionsHandled]
      });

      // 1. Setup WS Client if token exists
      const token = apex.getToken();
      let ws: ApexKitRealtimeWSClient | null = null;
      if (token) {
        ws = new ApexKitRealtimeWSClient('https://api.apexkit.edu', token);
        ws.connect();
        
        // Listen to live message events
        ws.onEvent((msg: any) => {
          if (msg.type === 'Signal' && msg.event === 'NewMessage') {
            const receivedMsg = msg.payload as Message;
            const currentChatRoom = get().activeChatRoomId;
            
            // Append message to state if it fits the general or active chatroom
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

      // 2. Fetch authenticated user profile
      let profile: UserProfile | null = null;
      if (token) {
        const user = await apex.auth.getMe();
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

      // 3. Load all resources
      const coursesRes = await apex.collection('courses').list();
      const tutorsRes = await apex.collection('users_profiles').list();
      const assignmentsRes = await apex.collection('assignments').list();
      const bidsRes = await apex.collection('bids').list();
      const reviewsRes = await apex.collection('tutors_reviews').list();
      const paymentsRes = await apex.collection('payments').list();

      const registeredTutors = (tutorsRes.items as any[]).filter(u => u.role === 'tutor');

      set({
        wsClient: ws,
        currentUser: profile,
        isAuthenticated: !!profile,
        courses: coursesRes.items as Course[],
        tutors: registeredTutors,
        assignments: assignmentsRes.items as Assignment[],
        bids: bidsRes.items as Bid[],
        reviews: reviewsRes.items as Review[],
        payments: paymentsRes.items as PaymentTransaction[],
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

      // Recalibrate SDK connections
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
        balance: role === 'student' ? 300 : 0, // Students get $300 starter budget for demo!
        reviewsCount: 0
      };

      await apex.auth.register(email, password, metadata);
      
      set({ isLoading: false });
      // Authenticate directly
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
      // Save to server/localStorage profiles
      await apex.auth.updateMe(updates);
      
      set((state) => ({
        currentUser: state.currentUser ? { ...state.currentUser, ...updates } : null,
        isLoading: false,
      }));

      // Reload tutors list in case current user was a tutor
      const tutorsRes = await apex.collection('users_profiles').list();
      const registeredTutors = (tutorsRes.items as any[]).filter(u => u.role === 'tutor');
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
      set({ assignments: res.items as Assignment[] });
    } catch (err) {
      console.error('Error fetching assignments', err);
    }
  },

  createAssignment: async (title, description, courseId, budget, deadline, files) => {
    const user = get().currentUser;
    if (!user || user.role !== 'student') throw new Error('Only students can create requests.');

    set({ isLoading: true, error: null });
    try {
      // 1. Upload files if any
      const fileUrls: { name: string; url: string; size: number }[] = [];
      for (const file of files) {
        const uploaded = await apex.files.upload(file);
        fileUrls.push({
          name: uploaded.filename,
          url: uploaded.url,
          size: uploaded.size
        });
      }

      // 2. Fetch course code
      const course = get().courses.find(c => c.id === courseId);
      const courseCode = course ? course.code : 'GEN';

      // 3. Create assignment request
      const newAssignment: Partial<Assignment> = {
        title,
        description,
        courseId,
        courseCode,
        budget: Number(budget),
        deadline,
        studentId: user.id,
        studentName: user.name,
        status: 'open',
        fileUrls,
        bidsCount: 0,
        createdAt: new Date().toISOString()
      };

      await apex.collection('assignments').create({ data: newAssignment });
      
      // Update state
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
      await apex.collection('assignments').update(assignmentId, { data: { status: 'cancelled' } });
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

      const newBid: Partial<Bid> = {
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

      await apex.collection('bids').create({ data: newBid });

      // Refresh assignments & bids list
      const bidsRes = await apex.collection('bids').list();
      set({ bids: bidsRes.items as Bid[] });
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

      // 1. Escrow Payment - Deduct from student balance
      const newStudentBalance = (student.balance || 0) - bid.amount;
      await get().updateProfile({ balance: newStudentBalance });

      // 2. Create Escrow Transaction record
      const transaction: Partial<PaymentTransaction> = {
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
      await apex.collection('payments').create({ data: transaction });

      // 3. Assign tutor to contract and mark as Active
      await apex.collection('assignments').update(assignmentId, {
        data: {
          tutorId: bid.tutorId,
          tutorName: bid.tutorName,
          status: 'active'
        }
      });

      // 4. Reload lists
      await get().fetchAssignments();
      const payRes = await apex.collection('payments').list();
      set({
        payments: payRes.items as PaymentTransaction[],
        isLoading: false
      });

      // 5. Instantly open chat room with selected tutor
      get().startChat(bid.tutorId, assignmentId);

    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Payment or contract execution failed' });
      throw err;
    }
  },

  markAssignmentCompleted: async (assignmentId, solutionUrls) => {
    set({ isLoading: true });
    try {
      await apex.collection('assignments').update(assignmentId, {
        data: {
          status: 'completed',
          solutionUrls: solutionUrls || []
        }
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
      // 1. Find payment in escrow
      const payments = get().payments;
      const tx = payments.find(p => p.assignmentId === assignmentId && p.status === 'escrow');
      if (!tx) throw new Error('Active escrow transaction not found');

      // 2. Update transaction status on server/local storage
      await apex.collection('payments').update(tx.id, { data: { status: 'released' } });

      // 3. Credit Tutor's balance
      const tutorsProfiles = browserDB.get<any>('users_profiles');
      const tutorIndex = tutorsProfiles.findIndex(t => t.id === tx.tutorId);
      if (tutorIndex !== -1) {
        tutorsProfiles[tutorIndex].balance = (tutorsProfiles[tutorIndex].balance || 0) + tx.amount;
        tutorsProfiles[tutorIndex].completedTasks = (tutorsProfiles[tutorIndex].completedTasks || 0) + 1;
        browserDB.save('users_profiles', tutorsProfiles);
      }

      // 4. Update assignment status to Paid
      await apex.collection('assignments').update(assignmentId, { data: { status: 'paid' } });

      // 5. Reload lists
      await get().fetchAssignments();
      const payRes = await apex.collection('payments').list();
      const tutorsRes = await apex.collection('users_profiles').list();
      
      set({
        payments: payRes.items as PaymentTransaction[],
        tutors: (tutorsRes.items as any[]).filter(u => u.role === 'tutor'),
        isLoading: false
      });

    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Failed to release payment' });
      throw err;
    }
  },

  startChat: (tutorId, assignmentId) => {
    const user = get().currentUser;
    if (!user) return;

    // Chatroom standard ID formulation: "studentId_tutorId"
    let chatRoomId = '';
    let partnerId = '';
    
    if (user.role === 'student') {
      chatRoomId = `${user.id}_${tutorId}`;
      partnerId = tutorId;
    } else {
      chatRoomId = `${tutorId}_${user.id}`;
      partnerId = tutorId; // in tutor mode, tutorId parameter behaves as studentId
    }

    const partnerProfile = browserDB.get<UserProfile>('users_profiles').find(p => p.id === partnerId);

    set({
      activeChatRoomId: chatRoomId,
      activeChatPartner: partnerProfile || null
    });

    get().fetchMessages(chatRoomId);
  },

  fetchMessages: async (chatRoomId) => {
    try {
      const res = await apex.collection('messages').list({
        filter: JSON.stringify({ chatRoomId })
      });
      set({ messages: res.items as Message[] });
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

      // If WS is connected, send signal. WS Client handler automatically updates local DB on server simulation
      if (get().wsClient && get().wsClient?.isConnected) {
        get().wsClient?.sendSignal(room, 'NewMessage', msgData);
      } else {
        // Direct local storage backup fallback
        const now = new Date().toISOString();
        const savedMsg = await apex.collection('messages').create({
          data: {
            ...msgData,
            createdAt: now
          }
        });
        set((state) => ({ messages: [...state.messages, savedMsg as unknown as Message] }));
      }

    } catch (err) {
      console.error('Failed to send message', err);
    }
  },

  submitReview: async (tutorId, rating, comment, assignmentTitle) => {
    const student = get().currentUser;
    if (!student) throw new Error('Unauthorized');

    try {
      const review: Partial<Review> = {
        tutorId,
        studentName: student.name,
        rating,
        comment,
        assignmentTitle,
        createdAt: new Date().toISOString()
      };

      await apex.collection('tutors_reviews').create({ data: review });

      // Recalculate tutor's rating average and review count
      const reviewsList = browserDB.get<Review>('tutors_reviews').filter(r => r.tutorId === tutorId);
      const totalRating = reviewsList.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = reviewsList.length > 0 ? Number((totalRating / reviewsList.length).toFixed(1)) : 5;

      const profiles = browserDB.get<any>('users_profiles');
      const idx = profiles.findIndex(p => p.id === tutorId);
      if (idx !== -1) {
        profiles[idx].rating = averageRating;
        profiles[idx].reviewsCount = reviewsList.length;
        browserDB.save('users_profiles', profiles);
      }

      // Reload resources
      const reviewsRes = await apex.collection('tutors_reviews').list();
      const tutorsRes = await apex.collection('users_profiles').list();
      
      set({
        reviews: reviewsRes.items as Review[],
        tutors: (tutorsRes.items as any[]).filter(u => u.role === 'tutor')
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
      await apex.collection('courses').create({ data: courseData });
      const coursesRes = await apex.collection('courses').list();
      set({ courses: coursesRes.items as Course[], isLoading: false });
    } catch (err: any) {
      console.error('Failed to create course', err);
      set({ isLoading: false, error: err.message || 'Failed to create course' });
    }
  },

  updateCourse: async (courseId, updates) => {
    set({ isLoading: true, error: null });
    try {
      await apex.collection('courses').update(courseId, { data: updates });
      const coursesRes = await apex.collection('courses').list();
      set({ courses: coursesRes.items as Course[], isLoading: false });
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
      set({ courses: coursesRes.items as Course[], isLoading: false });
    } catch (err: any) {
      console.error('Failed to delete course', err);
      set({ isLoading: false, error: err.message || 'Failed to delete course' });
    }
  },

  switchTenant: async (newTenantId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Re-initialize class instance with new tenant scope ID
      apex = new ApexKit('https://api.apexkit.edu').tenant(newTenantId);
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
      // Access the non-existent collection to trigger warning and fallback list
      await apex.collection(collectionName).list();
      set({
        missingCollections: [...apex.missingCollectionsHandled],
        isLoading: false
      });
    } catch (err: any) {
      console.error('[Store simulateMissingCollection Error]:', err);
      set({ isLoading: false, error: err.message || 'Failed to simulate missing collection' });
    }
  }
}));
