export type PriorityLevel = 'critical' | 'high' | 'medium' | 'low' | 'optional';

export type ItemStatus = 
  | 'need_to_buy' 
  | 'researching' 
  | 'planned' 
  | 'ordered' 
  | 'purchased' 
  | 'already_owned' 
  | 'no_longer_needed';

export type PurchaseMethod = 'online' | 'physical';

export type TimelineStage = 'before_move' | 'first_week' | 'after_settling_in';

export interface PriceOption {
  id: string;
  store: string;
  price: number;
  productUrl?: string;
  isPreferred?: boolean;
  notes?: string;
}

export interface MoveInItem {
  id: string;
  userId: string;
  name: string;
  category: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  priority: PriorityLevel;
  status: ItemStatus;
  purchaseMethod: PurchaseMethod;
  store: string;
  storeLocation?: string;
  productUrl?: string;
  imageUrl?: string;
  notes?: string;
  targetPurchaseDate?: string;
  isEssential: boolean;
  timelineStage: TimelineStage;
  alreadyOwned?: boolean;
  actualPricePaid?: number;
  purchaseDate?: string;
  options?: PriceOption[];
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ItemCategory {
  id: string;
  userId: string;
  name: string;
  icon?: string;
  isCustom?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface StorePlatform {
  id: string;
  userId: string;
  name: string;
  type: PurchaseMethod;
  location?: string;
  notes?: string;
  isCustom?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CondoNote {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: 'rules' | 'questions' | 'roommates' | 'measurements' | 'shopping' | 'reminders' | 'general';
  pinned?: boolean;
  isPinned?: boolean;
  checklist?: { id: string; text: string; completed: boolean }[];
  createdAt: string;
  updatedAt: string;
}

export type MoveInNote = CondoNote;
export type NoteCategory = 'rules' | 'questions' | 'roommates' | 'measurements' | 'shopping' | 'reminders' | 'general' | 'condo_rules' | 'checklist';


export interface CondoDetails {
  id: string;
  userId: string;
  condoName: string;
  address?: string;
  tower?: string;
  unit?: string;
  moveInDate?: string;
  roommates?: string;
  landlordContact?: string;
  adminContact?: string;
  guardContact?: string;
  officeHours?: string;
  monthlyRent?: number;
  monthlyRentShare?: number;
  utilities?: string;
  internet?: string;
  laundryInfo?: string;
  houseRules?: string;
  rulesNotes?: string;
  otherNotes?: string;
  upperBunkNotes?: string;
  drillingAllowed?: string;
  adhesiveAllowed?: string;
  isOnboardingCompleted?: boolean;
  updatedAt: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  moveInBudget: number;
  monthlyBudget: number;
  currency: string;
  theme: 'light' | 'dark' | 'system';
  defaultPriority: PriorityLevel;
  defaultStore: string;
  defaultSorting: string;
  hasCompletedOnboarding: boolean;
  hasLoadedDemoData: boolean;
  updatedAt: string;
}

export type SortOption = 
  | 'priority' 
  | 'price_desc' 
  | 'price_asc' 
  | 'recent_added' 
  | 'recent_updated' 
  | 'purchase_date' 
  | 'category' 
  | 'store' 
  | 'name_asc' 
  | 'name_desc';

export interface FilterState {
  search: string;
  priority: PriorityLevel[];
  status: ItemStatus[];
  store: string[];
  purchaseMethod: 'all' | 'online' | 'physical';
  category: string[];
  priceRange: 'all' | 'under_500' | '500_1000' | '1000_2500' | '2500_plus' | 'custom';
  customMinPrice?: number;
  customMaxPrice?: number;
  purchased: 'all' | 'purchased' | 'not_purchased';
  onlyEssential?: boolean;
  timelineStage?: 'all' | TimelineStage;
  sortBy: SortOption;
}

export type SaveStatus = 'saved' | 'saving' | 'offline' | 'error';
