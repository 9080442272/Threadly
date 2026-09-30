import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GarmentCategory {
  id: string;
  name: string;
  icon: string;
  subcategories: string[];
}

export const GARMENT_CATEGORIES: GarmentCategory[] = [
  {
    id: 'stitching',
    name: 'Stitching',
    icon: 'scissors',
    subcategories: ['Single Needle', 'Overlock', 'Flatlock', 'Other']
  },
  {
    id: 'ironing',
    name: 'Ironing',
    icon: 'flame',
    subcategories: ['Regular Ironing', 'Steam Ironing', 'Other']
  },
  {
    id: 'button',
    name: 'Button & Kaaja',
    icon: 'circle-dot',
    subcategories: ['Button Fixing', 'Button Hole / Kaaja']
  },
  {
    id: 'folding',
    name: 'Folding',
    icon: 'layers',
    subcategories: ['Garment Folding', 'Packing Fold']
  },
  {
    id: 'checking',
    name: 'Checking',
    icon: 'check-circle-2',
    subcategories: ['Quality Checking', 'Measurement Checking']
  },
  {
    id: 'printing',
    name: 'Printing',
    icon: 'printer',
    subcategories: ['Screen Printing', 'Sublimation', 'Other']
  },
  {
    id: 'embroidery',
    name: 'Embroidery',
    icon: 'sparkles',
    subcategories: ['Machine Embroidery', 'Hand Embroidery']
  },
  {
    id: 'finishing',
    name: 'Finishing',
    icon: 'shirt',
    subcategories: ['Thread Cutting', 'Final Finishing']
  },
  {
    id: 'packing',
    name: 'Packing',
    icon: 'package',
    subcategories: ['Polybag Packing', 'Box Packing', 'Carton Packing']
  },
  {
    id: 'other',
    name: 'Other Job Work',
    icon: 'more-horizontal',
    subcategories: ['Other Custom Requirement']
  }
];

export type JobStatus = 'OPEN' | 'IN_DISCUSSION' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ContactStatus = 'INTERESTED' | 'CONTACTED' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';

export interface JobWork {
  id: string;
  postedByUserId: string;
  companyName: string;
  mobile: string;
  category: string;
  subcategory: string;
  quantity: number; // pcs
  ratePerPiece?: number; // ₹/pc
  deadlineDays: number;
  location: string;
  description: string;
  status: JobStatus;
  postedDate: string;
  images: string[];
  contactPreference: 'call' | 'whatsapp' | 'both';
  isVerifiedUnit?: boolean;
}

export interface JobContact {
  id: string;
  jobId: string;
  jobTitle: string;
  jobCategory: string;
  jobQuantity: number;
  jobPostedByCompany: string;
  interestedUserId: string;
  interestedCompanyName: string;
  interestedMobile: string;
  status: ContactStatus;
  timestamp: string;
  notes?: string;
}

export interface UserProfile {
  userId: string;
  name: string;
  mobile: string;
  companyName: string;
  businessLocation: string;
  gstNumber?: string;
  companyDescription?: string;
  isLoggedIn: boolean;
}

export type UserAction = 'POST_WORK' | 'FIND_WORK' | null;

interface MarketplaceContextType {
  userProfile: UserProfile;
  loginUser: (mobile: string, name?: string, companyName?: string, location?: string) => Promise<void>;
  logoutUser: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  
  currentAction: UserAction;
  selectAction: (action: UserAction) => void;
  
  jobs: JobWork[];
  contacts: JobContact[];
  isLoading: boolean;
  
  postJob: (jobData: Omit<JobWork, 'id' | 'postedByUserId' | 'companyName' | 'mobile' | 'status' | 'postedDate'>) => Promise<void>;
  contactJobOwner: (jobId: string, notes?: string) => Promise<void>;
  updateJobStatus: (jobId: string, status: JobStatus) => Promise<void>;
  updateContactStatus: (contactId: string, status: ContactStatus) => Promise<void>;
  resetAllData: () => Promise<void>;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

const USER_STORAGE_KEY = '@threadly_user';
const ACTION_STORAGE_KEY = '@threadly_action';
const JOBS_STORAGE_KEY = '@threadly_jobs';
const CONTACTS_STORAGE_KEY = '@threadly_contacts';

const DEFAULT_USER: UserProfile = {
  userId: 'usr-1',
  name: 'Karthik Raja',
  mobile: '9842212345',
  companyName: 'Vardhman Knits & Garments',
  businessLocation: 'PN Road, Tiruppur',
  gstNumber: '33AAAAA0000A1Z5',
  companyDescription: 'Specialized in circular knits, T-shirts, and kids apparel manufacturing since 2012.',
  isLoggedIn: true,
};

const INITIAL_JOBS: JobWork[] = [
  {
    id: 'job-1',
    postedByUserId: 'usr-exporter-1',
    companyName: 'Vogue Global Sourcing',
    mobile: '9843054321',
    category: 'Stitching',
    subcategory: 'Overlock',
    quantity: 25000,
    ratePerPiece: 85,
    deadlineDays: 20,
    location: 'Khaderpet, Tiruppur',
    description: "Men's Combed Cotton T-Shirts. 180 GSM single jersey. Overlock and shoulder tape stitching required.",
    status: 'OPEN',
    postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500'],
    contactPreference: 'both',
    isVerifiedUnit: true
  },
  {
    id: 'job-2',
    postedByUserId: 'usr-exporter-2',
    companyName: 'Indigo Garments Ltd',
    mobile: '9894012345',
    category: 'Ironing',
    subcategory: 'Steam Ironing',
    quantity: 12000,
    ratePerPiece: 6.5,
    deadlineDays: 10,
    location: 'Dharapuram Road, Tiruppur',
    description: 'Steam ironing & hanger packing for women woven rayon tops. Strict export quality checking.',
    status: 'OPEN',
    postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500'],
    contactPreference: 'whatsapp',
    isVerifiedUnit: true
  },
  {
    id: 'job-3',
    postedByUserId: 'usr-exporter-3',
    companyName: 'Sri Amman Knits',
    mobile: '9789011223',
    category: 'Button & Kaaja',
    subcategory: 'Button Hole / Kaaja',
    quantity: 18000,
    ratePerPiece: 1.8,
    deadlineDays: 7,
    location: 'College Road, Tiruppur',
    description: 'Polo t-shirt placket button hole and button fixing (3 buttons per shirt). Machine ready.',
    status: 'OPEN',
    postedDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    images: ['https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500'],
    contactPreference: 'both',
    isVerifiedUnit: false
  },
  {
    id: 'job-4',
    postedByUserId: 'usr-exporter-4',
    companyName: 'Tex-Craft Printing Unit',
    mobile: '9443388776',
    category: 'Printing',
    subcategory: 'Screen Printing',
    quantity: 30000,
    ratePerPiece: 14,
    deadlineDays: 15,
    location: 'Mangalam Road, Tiruppur',
    description: '4-color chest screen print on chest panel cut pieces. High durability pigment print.',
    status: 'OPEN',
    postedDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    images: ['https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500'],
    contactPreference: 'call',
    isVerifiedUnit: true
  }
];

const INITIAL_CONTACTS: JobContact[] = [
  {
    id: 'cnt-1',
    jobId: 'job-1',
    jobTitle: "Stitching - Overlock (25,000 pcs)",
    jobCategory: 'Stitching',
    jobQuantity: 25000,
    jobPostedByCompany: 'Vogue Global Sourcing',
    interestedUserId: 'usr-1',
    interestedCompanyName: 'Vardhman Knits & Garments',
    interestedMobile: '9842212345',
    status: 'INTERESTED',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    notes: 'Contacted owner via WhatsApp to discuss rate and schedule.'
  }
];

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_USER);
  const [currentAction, setCurrentAction] = useState<UserAction>(null);
  const [jobs, setJobs] = useState<JobWork[]>([]);
  const [contacts, setContacts] = useState<JobContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load storage on mount
  useEffect(() => {
    async function loadStorage() {
      try {
        const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
        const storedAction = await AsyncStorage.getItem(ACTION_STORAGE_KEY);
        const storedJobs = await AsyncStorage.getItem(JOBS_STORAGE_KEY);
        const storedContacts = await AsyncStorage.getItem(CONTACTS_STORAGE_KEY);

        if (storedUser) {
          setUserProfile(JSON.parse(storedUser));
        } else {
          setUserProfile(DEFAULT_USER);
          await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEFAULT_USER));
        }

        if (storedAction) {
          setCurrentAction(storedAction as UserAction);
        }

        if (storedJobs) {
          setJobs(JSON.parse(storedJobs));
        } else {
          setJobs(INITIAL_JOBS);
          await AsyncStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(INITIAL_JOBS));
        }

        if (storedContacts) {
          setContacts(JSON.parse(storedContacts));
        } else {
          setContacts(INITIAL_CONTACTS);
          await AsyncStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(INITIAL_CONTACTS));
        }
      } catch (e) {
        console.error('Error loading Threadly marketplace storage:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadStorage();
  }, []);

  const loginUser = async (mobile: string, name = 'Unit Manager', companyName = 'Tiruppur Garments Unit', location = 'PN Road, Tiruppur') => {
    const updatedUser: UserProfile = {
      userId: `usr-${Date.now()}`,
      name,
      mobile,
      companyName,
      businessLocation: location,
      isLoggedIn: true,
    };
    setUserProfile(updatedUser);
    setCurrentAction(null); // Force action selection screen after every login
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
    await AsyncStorage.removeItem(ACTION_STORAGE_KEY);
  };

  const logoutUser = async () => {
    const loggedOutUser = { ...userProfile, isLoggedIn: false };
    setUserProfile(loggedOutUser);
    setCurrentAction(null);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedOutUser));
    await AsyncStorage.removeItem(ACTION_STORAGE_KEY);
  };

  const updateProfile = async (p: Partial<UserProfile>) => {
    const updated = { ...userProfile, ...p };
    setUserProfile(updated);
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
  };

  const selectAction = async (action: UserAction) => {
    setCurrentAction(action);
    if (action) {
      await AsyncStorage.setItem(ACTION_STORAGE_KEY, action);
    } else {
      await AsyncStorage.removeItem(ACTION_STORAGE_KEY);
    }
  };

  const postJob = async (jobData: Omit<JobWork, 'id' | 'postedByUserId' | 'companyName' | 'mobile' | 'status' | 'postedDate'>) => {
    const newJob: JobWork = {
      ...jobData,
      id: `job-${Date.now()}`,
      postedByUserId: userProfile.userId,
      companyName: userProfile.companyName || 'My Garment Unit',
      mobile: userProfile.mobile,
      status: 'OPEN',
      postedDate: new Date().toISOString(),
      isVerifiedUnit: true,
    };

    const updatedJobs = [newJob, ...jobs];
    setJobs(updatedJobs);
    await AsyncStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(updatedJobs));
  };

  const contactJobOwner = async (jobId: string, notes = 'Inquired via Threadly') => {
    const targetJob = jobs.find(j => j.id === jobId);
    if (!targetJob) return;

    // Check if contact record already exists
    const existing = contacts.find(c => c.jobId === jobId && c.interestedUserId === userProfile.userId);
    if (existing) return;

    const newContact: JobContact = {
      id: `cnt-${Date.now()}`,
      jobId,
      jobTitle: `${targetJob.category} - ${targetJob.subcategory} (${targetJob.quantity.toLocaleString()} pcs)`,
      jobCategory: targetJob.category,
      jobQuantity: targetJob.quantity,
      jobPostedByCompany: targetJob.companyName,
      interestedUserId: userProfile.userId,
      interestedCompanyName: userProfile.companyName,
      interestedMobile: userProfile.mobile,
      status: 'INTERESTED',
      timestamp: new Date().toISOString(),
      notes,
    };

    const updatedContacts = [newContact, ...contacts];
    setContacts(updatedContacts);
    await AsyncStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(updatedContacts));
  };

  const updateJobStatus = async (jobId: string, status: JobStatus) => {
    const updated = jobs.map(j => (j.id === jobId ? { ...j, status } : j));
    setJobs(updated);
    await AsyncStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(updated));
  };

  const updateContactStatus = async (contactId: string, status: ContactStatus) => {
    const updated = contacts.map(c => (c.id === contactId ? { ...c, status } : c));
    setContacts(updated);
    await AsyncStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(updated));
  };

  const resetAllData = async () => {
    await AsyncStorage.clear();
    setUserProfile(DEFAULT_USER);
    setCurrentAction(null);
    setJobs(INITIAL_JOBS);
    setContacts(INITIAL_CONTACTS);
  };

  return (
    <MarketplaceContext.Provider
      value={{
        userProfile,
        loginUser,
        logoutUser,
        updateProfile,
        currentAction,
        selectAction,
        jobs,
        contacts,
        isLoading,
        postJob,
        contactJobOwner,
        updateJobStatus,
        updateContactStatus,
        resetAllData,
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (context === undefined) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
}
