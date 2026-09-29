import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Opportunity {
  id: string;
  title: string;
  quantity: number;
  location: string;
  operations: string[];
  deadlineDays: number;
  rateRange: string;
  isVerified: boolean;
  exporterName: string;
  requirements: string;
}

export interface Application {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  manufacturerName: string;
  status: 'submitted' | 'shortlisted' | 'negotiation' | 'accepted' | 'rejected';
  proposedRate: number;
  capacityOffered: number;
  timestamp: string;
  notes: string;
  latestMessage?: string;
}

export interface Order {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  exporterName: string;
  manufacturerName: string;
  quantity: number;
  rate: number;
  status: 'upcoming' | 'production' | 'quality-check' | 'ready' | 'completed';
  progress: number; // 0 to 100
  startDate: string;
  endDate: string;
  location: string;
}

export interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: 'manufacturer' | 'exporter';
  text: string;
  timestamp: string;
}

export interface ChatThread {
  id: string; // matches application id or order id
  name: string; // contact person/company name
  subject: string; // e.g. "Regarding: Men's Cotton T-Shirt"
  category: 'applications' | 'orders';
  messages: ChatMessage[];
  lastUpdated: string;
}

interface ManufacturerProfile {
  companyName: string;
  factoryLocation: string;
  maxCapacity: number;
  availableCapacity: number;
  machinery: string[];
  specialisations: string[];
  certifications: string[];
  isProfileComplete: boolean;
}

interface ExporterProfile {
  companyName: string;
  businessDetails: string;
  categories: string[];
  certifications: string[];
  isProfileComplete: boolean;
}

interface MarketplaceContextType {
  userRole: 'manufacturer' | 'exporter';
  toggleRole: () => void;
  manufacturerProfile: ManufacturerProfile;
  exporterProfile: ExporterProfile;
  updateManufacturerProfile: (profile: Partial<ManufacturerProfile>) => Promise<void>;
  updateExporterProfile: (profile: Partial<ExporterProfile>) => Promise<void>;
  opportunities: Opportunity[];
  applications: Application[];
  orders: Order[];
  chatThreads: ChatThread[];
  isLoading: boolean;
  postOpportunity: (opp: Omit<Opportunity, 'id' | 'exporterName' | 'isVerified'>) => Promise<void>;
  applyToOpportunity: (app: Omit<Application, 'id' | 'manufacturerName' | 'timestamp' | 'status'>) => Promise<void>;
  updateApplicationStatus: (appId: string, status: Application['status']) => Promise<void>;
  updateOrderProgress: (orderId: string, progress: number, status?: Order['status']) => Promise<void>;
  sendChatMessage: (threadId: string, text: string) => Promise<void>;
  createChatThread: (id: string, name: string, subject: string, category: ChatThread['category']) => Promise<void>;
  resetAllData: () => Promise<void>;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

const ROLE_STORAGE_KEY = '@threads_role';
const M_PROFILE_KEY = '@threads_m_profile';
const E_PROFILE_KEY = '@threads_e_profile';
const OPPORTUNITIES_KEY = '@threads_opportunities';
const APPLICATIONS_KEY = '@threads_applications';
const ORDERS_KEY = '@threads_orders';
const CHAT_KEY = '@threads_chat';

// MOCK DATA SEED
const INITIAL_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-1',
    title: "Men's Cotton T-Shirt",
    quantity: 25000,
    location: 'Tiruppur',
    operations: ['Stitching', 'Finishing'],
    deadlineDays: 30,
    rateRange: '₹ 85–110',
    isVerified: true,
    exporterName: 'Vogue Global Sourcing',
    requirements: '100% Combed Cotton, 180 GSM, dynamic printing required. Export quality packaging.',
  },
  {
    id: 'opp-2',
    title: 'Women Denim Jackets',
    quantity: 10000,
    location: 'Surat',
    operations: ['Stitching', 'Washing', 'Finishing'],
    deadlineDays: 45,
    rateRange: '₹ 280–320',
    isVerified: true,
    exporterName: 'Indigo Brands Ltd',
    requirements: '12oz Indigo denim fabric, standard brass button trim. Indigo wash finish.',
  },
  {
    id: 'opp-3',
    title: 'Kids Organic Cotton Rompers',
    quantity: 15000,
    location: 'Ludhiana',
    operations: ['Stitching', 'Embroidery', 'Finishing'],
    deadlineDays: 25,
    rateRange: '₹ 60–75',
    isVerified: false,
    exporterName: 'TinyTots Apparel Inc',
    requirements: 'OEKO-TEX Certified Organic cotton, interlock knit, nickle-free snap buttons.',
  },
  {
    id: 'opp-4',
    title: 'Polyester Sports Jerseys',
    quantity: 50000,
    location: 'Noida',
    operations: ['Sublimation Printing', 'Stitching', 'Finishing'],
    deadlineDays: 35,
    rateRange: '₹ 95–115',
    isVerified: true,
    exporterName: 'Apex Sports Sourcing',
    requirements: 'Dry-fit polyester, flatlock stitching, dynamic panel sublimation.',
  }
];

const INITIAL_APPLICATIONS: Application[] = [
  {
    id: 'app-seed-1',
    opportunityId: 'opp-1',
    opportunityTitle: "Men's Cotton T-Shirt",
    manufacturerName: 'Vardhman Knits',
    status: 'negotiation',
    proposedRate: 95,
    capacityOffered: 15000,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'We can manage 15,000 pcs in this schedule. Standard lead time is 25 days.',
    latestMessage: 'Can you increase capacity to 20,000 pcs?'
  },
  {
    id: 'app-seed-2',
    opportunityId: 'opp-3',
    opportunityTitle: 'Kids Organic Cotton Rompers',
    manufacturerName: 'Vardhman Knits',
    status: 'submitted',
    proposedRate: 68,
    capacityOffered: 15000,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Certified supplier with organic cotton source ready.',
  }
];

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-seed-1',
    opportunityId: 'opp-1',
    opportunityTitle: "Men's Cotton T-Shirt",
    exporterName: 'Vogue Global Sourcing',
    manufacturerName: 'Vardhman Knits',
    quantity: 10000,
    rate: 95,
    status: 'production',
    progress: 45,
    startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    location: 'Tiruppur',
  },
  {
    id: 'ord-seed-2',
    opportunityId: 'opp-2',
    opportunityTitle: 'Women Denim Jackets',
    exporterName: 'Indigo Brands Ltd',
    manufacturerName: 'Vardhman Knits',
    quantity: 5000,
    rate: 290,
    status: 'upcoming',
    progress: 0,
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    location: 'Surat',
  }
];

const INITIAL_THREADS: ChatThread[] = [
  {
    id: 'app-seed-1',
    name: 'Vogue Global Sourcing',
    subject: "Regarding: Men's Cotton T-Shirt",
    category: 'applications',
    lastUpdated: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    messages: [
      {
        id: 'msg-1',
        senderName: 'Vardhman Knits',
        senderRole: 'manufacturer',
        text: 'Hello, we have submitted our bid for the 25k T-shirt order. We can complete 15,000 units within 30 days.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'msg-2',
        senderName: 'Vogue Global Sourcing',
        senderRole: 'exporter',
        text: 'Thanks for the bid. We need a supplier who can deliver at least 20,000 units. Can you increase capacity to 20,000 pcs?',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }
    ]
  }
];

const DEFAULT_M_PROFILE: ManufacturerProfile = {
  companyName: 'Vardhman Knits',
  factoryLocation: 'Tiruppur, Tamil Nadu',
  maxCapacity: 50000,
  availableCapacity: 35000,
  machinery: ['Circular Knit Machines (12)', 'Flatlock Stitching (25)', 'Automatic Cutting Table (2)'],
  specialisations: ['Knitted fabrics', 'T-Shirts', 'Polos', 'Kids wear'],
  certifications: ['WRAP Certified', 'ISO 9001', 'GOTS (Organic Text)'],
  isProfileComplete: true,
};

const DEFAULT_E_PROFILE: ExporterProfile = {
  companyName: 'Vogue Global Sourcing',
  businessDetails: 'B2B Sourcing partner for European fashion apparel lines.',
  categories: ['Knits', 'Woven wear', 'Denim', 'Sports Jersey'],
  certifications: ['OEKO-TEX Member', 'SEDEX Audited'],
  isProfileComplete: true,
};

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<'manufacturer' | 'exporter'>('manufacturer');
  const [manufacturerProfile, setManufacturerProfile] = useState<ManufacturerProfile>(DEFAULT_M_PROFILE);
  const [exporterProfile, setExporterProfile] = useState<ExporterProfile>(DEFAULT_E_PROFILE);
  
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);

  // Load state on mount
  useEffect(() => {
    async function loadData() {
      try {
        const storedRole = await AsyncStorage.getItem(ROLE_STORAGE_KEY);
        const storedMProfile = await AsyncStorage.getItem(M_PROFILE_KEY);
        const storedEProfile = await AsyncStorage.getItem(E_PROFILE_KEY);
        const storedOpps = await AsyncStorage.getItem(OPPORTUNITIES_KEY);
        const storedApps = await AsyncStorage.getItem(APPLICATIONS_KEY);
        const storedOrders = await AsyncStorage.getItem(ORDERS_KEY);
        const storedChats = await AsyncStorage.getItem(CHAT_KEY);

        if (storedRole) setUserRole(storedRole as any);
        
        if (storedMProfile) setManufacturerProfile(JSON.parse(storedMProfile));
        else setManufacturerProfile(DEFAULT_M_PROFILE);

        if (storedEProfile) setExporterProfile(JSON.parse(storedEProfile));
        else setExporterProfile(DEFAULT_E_PROFILE);

        if (storedOpps) setOpportunities(JSON.parse(storedOpps));
        else {
          setOpportunities(INITIAL_OPPORTUNITIES);
          await AsyncStorage.setItem(OPPORTUNITIES_KEY, JSON.stringify(INITIAL_OPPORTUNITIES));
        }

        if (storedApps) setApplications(JSON.parse(storedApps));
        else {
          setApplications(INITIAL_APPLICATIONS);
          await AsyncStorage.setItem(APPLICATIONS_KEY, JSON.stringify(INITIAL_APPLICATIONS));
        }

        if (storedOrders) setOrders(JSON.parse(storedOrders));
        else {
          setOrders(INITIAL_ORDERS);
          await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(INITIAL_ORDERS));
        }

        if (storedChats) setChatThreads(JSON.parse(storedChats));
        else {
          setChatThreads(INITIAL_THREADS);
          await AsyncStorage.setItem(CHAT_KEY, JSON.stringify(INITIAL_THREADS));
        }
      } catch (e) {
        console.error('Failed to load marketplace storage', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const saveRole = async (newRole: 'manufacturer' | 'exporter') => {
    setUserRole(newRole);
    await AsyncStorage.setItem(ROLE_STORAGE_KEY, newRole);
  };

  const toggleRole = () => {
    const nextRole = userRole === 'manufacturer' ? 'exporter' : 'manufacturer';
    saveRole(nextRole);
  };

  const updateManufacturerProfile = async (p: Partial<ManufacturerProfile>) => {
    const newProfile = { ...manufacturerProfile, ...p };
    setManufacturerProfile(newProfile);
    await AsyncStorage.setItem(M_PROFILE_KEY, JSON.stringify(newProfile));
  };

  const updateExporterProfile = async (p: Partial<ExporterProfile>) => {
    const newProfile = { ...exporterProfile, ...p };
    setExporterProfile(newProfile);
    await AsyncStorage.setItem(E_PROFILE_KEY, JSON.stringify(newProfile));
  };

  const postOpportunity = async (opp: Omit<Opportunity, 'id' | 'exporterName' | 'isVerified'>) => {
    const newOpp: Opportunity = {
      ...opp,
      id: `opp-${Date.now()}`,
      exporterName: exporterProfile.companyName || 'Vogue Global Sourcing',
      isVerified: true,
    };
    const updated = [newOpp, ...opportunities];
    setOpportunities(updated);
    await AsyncStorage.setItem(OPPORTUNITIES_KEY, JSON.stringify(updated));
  };

  const applyToOpportunity = async (app: Omit<Application, 'id' | 'manufacturerName' | 'timestamp' | 'status'>) => {
    const newApp: Application = {
      ...app,
      id: `app-${Date.now()}`,
      manufacturerName: manufacturerProfile.companyName || 'Vardhman Knits',
      status: 'submitted',
      timestamp: new Date().toISOString(),
    };
    
    const updatedApps = [newApp, ...applications];
    setApplications(updatedApps);
    await AsyncStorage.setItem(APPLICATIONS_KEY, JSON.stringify(updatedApps));

    // Auto create chat thread
    await createChatThread(
      newApp.id,
      newApp.opportunityTitle,
      `Proposal: ${newApp.proposedRate}/pc by ${newApp.manufacturerName}`,
      'applications'
    );
  };

  const updateApplicationStatus = async (appId: string, status: Application['status']) => {
    const updated = applications.map(app => {
      if (app.id === appId) {
        return { ...app, status };
      }
      return app;
    });
    setApplications(updated);
    await AsyncStorage.setItem(APPLICATIONS_KEY, JSON.stringify(updated));

    // If accepted, spawn an order!
    if (status === 'accepted') {
      const targetApp = applications.find(a => a.id === appId);
      const targetOpp = opportunities.find(o => o.id === targetApp?.opportunityId);
      if (targetApp && targetOpp) {
        const newOrder: Order = {
          id: `ord-${Date.now()}`,
          opportunityId: targetOpp.id,
          opportunityTitle: targetOpp.title,
          exporterName: targetOpp.exporterName,
          manufacturerName: targetApp.manufacturerName,
          quantity: targetApp.capacityOffered,
          rate: targetApp.proposedRate,
          status: 'upcoming',
          progress: 0,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + targetOpp.deadlineDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          location: targetOpp.location,
        };
        const updatedOrders = [newOrder, ...orders];
        setOrders(updatedOrders);
        await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));

        // Create Chat thread for order
        await createChatThread(
          newOrder.id,
          newOrder.exporterName,
          `Order Active: ${newOrder.opportunityTitle}`,
          'orders'
        );
      }
    }
  };

  const updateOrderProgress = async (orderId: string, progress: number, status?: Order['status']) => {
    const updated = orders.map(ord => {
      if (ord.id === orderId) {
        return {
          ...ord,
          progress,
          status: status || (progress === 100 ? 'completed' : ord.status)
        };
      }
      return ord;
    });
    setOrders(updated);
    await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  };

  const createChatThread = async (id: string, name: string, subject: string, category: ChatThread['category']) => {
    // Avoid double threads
    if (chatThreads.some(t => t.id === id)) return;

    const newThread: ChatThread = {
      id,
      name,
      subject,
      category,
      lastUpdated: new Date().toISOString(),
      messages: [
        {
          id: `msg-sys-${Date.now()}`,
          senderName: 'System',
          senderRole: 'exporter',
          text: `Thread initialized regarding ${subject}.`,
          timestamp: new Date().toISOString()
        }
      ]
    };
    const updated = [newThread, ...chatThreads];
    setChatThreads(updated);
    await AsyncStorage.setItem(CHAT_KEY, JSON.stringify(updated));
  };

  const sendChatMessage = async (threadId: string, text: string) => {
    const activeName = userRole === 'manufacturer' ? manufacturerProfile.companyName : exporterProfile.companyName;
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderName: activeName,
      senderRole: userRole,
      text,
      timestamp: new Date().toISOString()
    };

    const updated = chatThreads.map(thread => {
      if (thread.id === threadId) {
        return {
          ...thread,
          lastUpdated: new Date().toISOString(),
          messages: [...thread.messages, newMessage]
        };
      }
      return thread;
    });

    setChatThreads(updated);
    await AsyncStorage.setItem(CHAT_KEY, JSON.stringify(updated));

    // Also update the latestMessage preview in applications if applicable
    const isAppThread = applications.some(a => a.id === threadId);
    if (isAppThread) {
      const updatedApps = applications.map(app => {
        if (app.id === threadId) {
          return { ...app, latestMessage: text };
        }
        return app;
      });
      setApplications(updatedApps);
      await AsyncStorage.setItem(APPLICATIONS_KEY, JSON.stringify(updatedApps));
    }
  };

  const resetAllData = async () => {
    await AsyncStorage.clear();
    setUserRole('manufacturer');
    setManufacturerProfile(DEFAULT_M_PROFILE);
    setExporterProfile(DEFAULT_E_PROFILE);
    setOpportunities(INITIAL_OPPORTUNITIES);
    setApplications(INITIAL_APPLICATIONS);
    setOrders(INITIAL_ORDERS);
    setChatThreads(INITIAL_THREADS);
  };

  return (
    <MarketplaceContext.Provider value={{
      userRole,
      toggleRole,
      manufacturerProfile,
      exporterProfile,
      updateManufacturerProfile,
      updateExporterProfile,
      opportunities,
      applications,
      orders,
      chatThreads,
      isLoading,
      postOpportunity,
      applyToOpportunity,
      updateApplicationStatus,
      updateOrderProgress,
      sendChatMessage,
      createChatThread,
      resetAllData
    }}>
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
