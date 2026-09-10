import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase/config';
import {
  subscribeToItems,
  subscribeToCondoDetails,
  subscribeToUserSettings,
  subscribeToCategories,
  subscribeToStores,
  subscribeToNotes,
  createItem,
  updateItem,
  deleteItem,
  markItemPurchased,
  saveCondoDetails,
  saveUserSettings,
  createCategory,
  updateCategory,
  deleteCategory,
  createStore,
  deleteStore,
  createNote,
  updateNote,
  deleteNote,
  initializeUserWithDefaults,
} from './firebase/firestoreService';
import {
  MoveInItem,
  CondoDetails,
  UserSettings,
  ItemCategory,
  StorePlatform,
  MoveInNote,
  SaveStatus,
  PriorityLevel,
  TimelineStage,
} from './types';
import { DEFAULT_DEMO_ITEMS } from './data/defaults';
import { AuthScreen } from './components/AuthScreen';
import { Header } from './components/Header';
import { Navigation, NavView } from './components/Navigation';
import { OnboardingModal } from './components/OnboardingModal';
import { ItemModal } from './components/ItemModal';
import { MarkPurchasedModal } from './components/MarkPurchasedModal';

// Views
import { DashboardView } from './views/DashboardView';
import { ItemsView } from './views/ItemsView';
import { ShoppingModeView } from './views/ShoppingModeView';
import { PriorityBoardView } from './views/PriorityBoardView';
import { EssentialsView } from './views/EssentialsView';
import { StoresView } from './views/StoresView';
import { CategoriesView } from './views/CategoriesView';
import { BudgetView } from './views/BudgetView';
import { TimelineView } from './views/TimelineView';
import { NotesView } from './views/NotesView';
import { CondoDetailsView } from './views/CondoDetailsView';
import { SettingsView } from './views/SettingsView';
import { Home } from 'lucide-react';

// Valid nav views for URL hash routing
const VALID_VIEWS: NavView[] = [
  'dashboard', 'items', 'shopping', 'priority', 'essentials',
  'stores', 'categories', 'budget', 'timeline', 'notes', 'condo', 'settings'
];

function getViewFromHash(): NavView {
  if (typeof window !== 'undefined' && window.location.hash) {
    const raw = window.location.hash.replace(/^#\/?/, '').toLowerCase() as NavView;
    if (VALID_VIEWS.includes(raw)) return raw;
  }
  return 'dashboard';
}

export default function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Firestore collections state
  const [items, setItems] = useState<MoveInItem[]>([]);
  const [condoDetails, setCondoDetails] = useState<CondoDetails | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [stores, setStores] = useState<StorePlatform[]>([]);
  const [notes, setNotes] = useState<MoveInNote[]>([]);

  // Navigation & UI state
  const [currentView, setCurrentView] = useState<NavView>(getViewFromHash);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [hasDismissedOnboarding, setHasDismissedOnboarding] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MoveInItem | null>(null);
  const [itemToMarkPurchased, setItemToMarkPurchased] = useState<MoveInItem | null>(null);

  // Sync with browser URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const view = getViewFromHash();
      setCurrentView(view);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectView = (view: NavView) => {
    setCurrentView(view);
    if (typeof window !== 'undefined' && window.location.hash.replace(/^#\/?/, '') !== view) {
      window.location.hash = view;
    }
  };

  // Authentication Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        // Initialize default schemas and demo items if brand new user
        try {
          await initializeUserWithDefaults(currentUser.uid);
        } catch (err) {
          console.error('Failed to initialize defaults:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Firestore Real-Time Subscriptions
  useEffect(() => {
    if (!user) {
      setItems([]);
      setCondoDetails(null);
      setSettings(null);
      setCategories([]);
      setStores([]);
      setNotes([]);
      return;
    }

    const unsubs: (() => void)[] = [];

    // Items subscription
    unsubs.push(
      subscribeToItems(user.uid, (data) => {
        setItems(data);
        setSaveStatus('saved');
      })
    );

    // Condo Details subscription
    unsubs.push(
      subscribeToCondoDetails(user.uid, (data) => {
        setCondoDetails(data);
        if (data && !data.isOnboardingCompleted && !hasDismissedOnboarding) {
          setIsOnboardingOpen(true);
        }
      })
    );

    // User Settings subscription
    unsubs.push(
      subscribeToUserSettings(user.uid, (data) => {
        setSettings(data);
      })
    );

    // Categories subscription
    unsubs.push(
      subscribeToCategories(user.uid, (data) => {
        setCategories(data);
      })
    );

    // Stores subscription
    unsubs.push(
      subscribeToStores(user.uid, (data) => {
        setStores(data);
      })
    );

    // Notes subscription
    unsubs.push(
      subscribeToNotes(user.uid, (data) => {
        setNotes(data);
      })
    );

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [user]);

  // Handler: Save / Edit Item
  const handleSaveItem = async (
    itemData: Omit<MoveInItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!user) return;
    setSaveStatus('saving');
    try {
      if (editingItem) {
        await updateItem(user.uid, editingItem.id, itemData);
      } else {
        await createItem(user.uid, itemData);
      }
      setSaveStatus('saved');
      setIsItemModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    }
  };

  // Handler: Delete Item
  const handleDeleteItem = async (itemId: string) => {
    if (!user) return;
    setSaveStatus('saving');
    try {
      await deleteItem(user.uid, itemId);
      setSaveStatus('saved');
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    }
  };

  // Handler: Mark Item as Purchased
  const handleConfirmPurchased = async (
    itemId: string,
    actualPricePaid: number,
    purchaseDate: string,
    notes?: string,
    store?: string
  ) => {
    if (!user) return;
    setSaveStatus('saving');
    try {
      await markItemPurchased(user.uid, itemId, actualPricePaid, purchaseDate, notes, store);
      setSaveStatus('saved');
      setItemToMarkPurchased(null);
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    }
  };

  // Quick toggle purchased
  const handleQuickTogglePurchased = async (item: MoveInItem) => {
    if (!user) return;
    setSaveStatus('saving');
    try {
      const isCurrentlyPurchased =
        item.status === 'purchased' || item.status === 'already_owned';
      await updateItem(user.uid, item.id, {
        status: isCurrentlyPurchased ? 'need_to_buy' : 'purchased',
        actualPricePaid: isCurrentlyPurchased ? undefined : item.totalPrice,
        purchaseDate: isCurrentlyPurchased ? undefined : new Date().toISOString().split('T')[0],
      });
      setSaveStatus('saved');
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    }
  };

  // Bulk Mark Purchased
  const handleBulkMarkPurchased = async (itemIds: string[]) => {
    if (!user) return;
    setSaveStatus('saving');
    try {
      const now = new Date().toISOString().split('T')[0];
      for (const id of itemIds) {
        const it = items.find((i) => i.id === id);
        if (it) {
          await markItemPurchased(user.uid, id, it.totalPrice, now);
        }
      }
      setSaveStatus('saved');
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    }
  };

  // Bulk Delete
  const handleBulkDelete = async (itemIds: string[]) => {
    if (!user) return;
    setSaveStatus('saving');
    try {
      for (const id of itemIds) {
        await deleteItem(user.uid, id);
      }
      setSaveStatus('saved');
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    }
  };

  // Handler: Update Priority
  const handleUpdatePriority = async (itemId: string, newPriority: PriorityLevel) => {
    if (!user) return;
    setSaveStatus('saving');
    try {
      await updateItem(user.uid, itemId, { priority: newPriority });
      setSaveStatus('saved');
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    }
  };

  // Handler: Update Timeline Stage
  const handleUpdateStage = async (itemId: string, newStage: TimelineStage) => {
    if (!user) return;
    setSaveStatus('saving');
    try {
      await updateItem(user.uid, itemId, { timelineStage: newStage });
      setSaveStatus('saved');
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    }
  };

  // Handler: Categories CRUD
  const handleAddCategory = async (
    category: Omit<ItemCategory, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!user) throw new Error('Not authenticated');
    return await createCategory(user.uid, category);
  };

  const handleUpdateCategory = async (categoryId: string, updates: Partial<ItemCategory>) => {
    if (!user) return;
    await updateCategory(user.uid, categoryId, updates);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!user) return;
    await deleteCategory(user.uid, categoryId);
  };

  // Handler: Stores CRUD
  const handleAddStore = async (
    store: Omit<StorePlatform, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!user) throw new Error('Not authenticated');
    return await createStore(user.uid, store);
  };

  const handleDeleteStore = async (storeId: string) => {
    if (!user) return;
    await deleteStore(user.uid, storeId);
  };

  // Handler: Notes CRUD
  const handleAddNote = async (
    note: Omit<MoveInNote, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!user) throw new Error('Not authenticated');
    return await createNote(user.uid, note);
  };

  const handleUpdateNote = async (noteId: string, updates: Partial<MoveInNote>) => {
    if (!user) return;
    await updateNote(user.uid, noteId, updates);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!user) return;
    await deleteNote(user.uid, noteId);
  };

  // Handler: Update Condo Details
  const handleUpdateCondoDetails = async (details: Partial<CondoDetails>) => {
    if (!user) return;
    setSaveStatus('saving');
    try {
      await saveCondoDetails(user.uid, details);
      setSaveStatus('saved');
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    }
  };

  // Handler: Update Budget Caps
  const handleUpdateBudget = async (moveInBudget: number, monthlyBudget: number) => {
    if (!user) return;
    setSaveStatus('saving');
    try {
      await saveUserSettings(user.uid, { moveInBudget, monthlyBudget });
      setSaveStatus('saved');
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    }
  };

  // Handler: Restore / Import JSON
  const handleImportData = async (data: any) => {
    if (!user) return;
    setSaveStatus('saving');
    try {
      if (data.condoDetails) await saveCondoDetails(user.uid, data.condoDetails);
      if (data.settings) await saveUserSettings(user.uid, data.settings);

      if (Array.isArray(data.items)) {
        for (const item of data.items) {
          const { id, userId, createdAt, updatedAt, ...clean } = item;
          await createItem(user.uid, clean);
        }
      }
      if (Array.isArray(data.notes)) {
        for (const note of data.notes) {
          const { id, userId, createdAt, updatedAt, ...clean } = note;
          await createNote(user.uid, clean);
        }
      }
      setSaveStatus('saved');
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
      throw err;
    }
  };

  // Handler: Reset Data
  const handleResetData = async () => {
    if (!user) return;
    setSaveStatus('saving');
    try {
      for (const item of items) {
        await deleteItem(user.uid, item.id);
      }
      for (const note of notes) {
        await deleteNote(user.uid, note.id);
      }
      setSaveStatus('saved');
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    }
  };

  // Handler: Load Demo Data
  const handleLoadDemoData = async () => {
    if (!user) return;
    setSaveStatus('saving');
    try {
      for (const demo of DEFAULT_DEMO_ITEMS) {
        await createItem(user.uid, { ...demo, isDemo: true });
      }
      setSaveStatus('saved');
    } catch (err) {
      console.error(err);
      setSaveStatus('error');
    }
  };

  // AUTH LOADING STATE
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FEFBE9] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-[#D7E9B9] border border-[#BADB88] flex items-center justify-center shadow-xs animate-bounce mb-4">
          <Home className="w-8 h-8 text-[#22252A]" />
        </div>
        <h2 className="text-xl font-bold text-[#22252A] font-['Outfit']">
          Condo Move-In Planner
        </h2>
        <p className="text-xs text-[#6B7280] mt-1">Connecting to your move-in command center...</p>
      </div>
    );
  }

  // NO USER AUTHENTICATED
  if (!user) {
    return <AuthScreen onLoginSuccess={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-[#FEFBE9] text-[#22252A] flex flex-col selection:bg-[#D7E9B9] selection:text-[#22252A]">
      {/* Top Header */}
      <Header
        user={user}
        items={items}
        condoDetails={condoDetails}
        saveStatus={saveStatus}
        onOpenAddItem={() => {
          setEditingItem(null);
          setIsItemModalOpen(true);
        }}
        onNavigateSettings={() => handleSelectView('settings')}
      />

      {/* Main Layout (Desktop Sidebar + Main Content View) */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-20 lg:pb-8">
        {/* Navigation Sidebar */}
        <Navigation
          currentView={currentView}
          onSelectView={(v) => handleSelectView(v)}
          items={items}
        />

        {/* Dynamic View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-full overflow-x-hidden">
          {currentView === 'dashboard' && (
            <DashboardView
              items={items}
              settings={settings}
              condoDetails={condoDetails}
              onOpenAddItem={() => {
                setEditingItem(null);
                setIsItemModalOpen(true);
              }}
              onOpenMarkPurchased={(item) => setItemToMarkPurchased(item)}
              onNavigate={(v) => handleSelectView(v)}
            />
          )}

          {currentView === 'items' && (
            <ItemsView
              items={items}
              categories={categories}
              stores={stores}
              onOpenAddItem={() => {
                setEditingItem(null);
                setIsItemModalOpen(true);
              }}
              onEditItem={(item) => {
                setEditingItem(item);
                setIsItemModalOpen(true);
              }}
              onDeleteItem={handleDeleteItem}
              onOpenMarkPurchased={(item) => setItemToMarkPurchased(item)}
              onBulkMarkPurchased={handleBulkMarkPurchased}
              onBulkDelete={handleBulkDelete}
            />
          )}

          {currentView === 'shopping' && (
            <ShoppingModeView
              items={items}
              onOpenMarkPurchased={(item) => setItemToMarkPurchased(item)}
              onQuickTogglePurchased={handleQuickTogglePurchased}
            />
          )}

          {currentView === 'priority' && (
            <PriorityBoardView
              items={items}
              onUpdatePriority={handleUpdatePriority}
              onOpenMarkPurchased={(item) => setItemToMarkPurchased(item)}
              onEditItem={(item) => {
                setEditingItem(item);
                setIsItemModalOpen(true);
              }}
            />
          )}

          {currentView === 'essentials' && (
            <EssentialsView
              items={items}
              onOpenMarkPurchased={(item) => setItemToMarkPurchased(item)}
              onEditItem={(item) => {
                setEditingItem(item);
                setIsItemModalOpen(true);
              }}
              onOpenAddItem={() => {
                setEditingItem(null);
                setIsItemModalOpen(true);
              }}
            />
          )}

          {currentView === 'stores' && (
            <StoresView
              stores={stores}
              items={items}
              onSelectStore={(storeName) => {
                // Navigate to items view with store
                handleSelectView('items');
              }}
              onAddStore={handleAddStore}
              onDeleteStore={handleDeleteStore}
            />
          )}

          {currentView === 'categories' && (
            <CategoriesView
              categories={categories}
              items={items}
              onSelectCategory={(categoryName) => {
                handleSelectView('items');
              }}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {currentView === 'budget' && (
            <BudgetView
              items={items}
              settings={settings}
              onUpdateBudget={handleUpdateBudget}
            />
          )}

          {currentView === 'timeline' && (
            <TimelineView
              items={items}
              onUpdateStage={handleUpdateStage}
              onOpenMarkPurchased={(item) => setItemToMarkPurchased(item)}
              onEditItem={(item) => {
                setEditingItem(item);
                setIsItemModalOpen(true);
              }}
            />
          )}

          {currentView === 'notes' && (
            <NotesView
              notes={notes}
              onAddNote={handleAddNote}
              onUpdateNote={handleUpdateNote}
              onDeleteNote={handleDeleteNote}
            />
          )}

          {currentView === 'condo' && (
            <CondoDetailsView
              condoDetails={condoDetails}
              onUpdateCondoDetails={handleUpdateCondoDetails}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView
              user={user}
              items={items}
              condoDetails={condoDetails}
              settings={settings}
              categories={categories}
              stores={stores}
              notes={notes}
              onImportData={handleImportData}
              onResetData={handleResetData}
              onLoadDemoData={handleLoadDemoData}
            />
          )}
        </main>
      </div>

      {/* Add / Edit Item Modal */}
      {isItemModalOpen && (
        <ItemModal
          isOpen={isItemModalOpen}
          item={editingItem}
          categories={categories}
          stores={stores}
          userId={user.uid}
          onClose={() => {
            setIsItemModalOpen(false);
            setEditingItem(null);
          }}
          onSave={handleSaveItem}
        />
      )}

      {/* Mark Purchased Modal */}
      {itemToMarkPurchased && (
        <MarkPurchasedModal
          isOpen={!!itemToMarkPurchased}
          item={itemToMarkPurchased}
          stores={stores}
          onClose={() => setItemToMarkPurchased(null)}
          onConfirm={handleConfirmPurchased}
        />
      )}

      {/* Onboarding Flow Modal (if first time) */}
      {isOnboardingOpen && (
        <OnboardingModal
          isOpen={isOnboardingOpen}
          userId={user.uid}
          initialDetails={condoDetails}
          initialSettings={settings}
          onClose={() => {
            setHasDismissedOnboarding(true);
            setIsOnboardingOpen(false);
          }}
          onComplete={() => {
            setHasDismissedOnboarding(true);
            setIsOnboardingOpen(false);
          }}
          onSave={async (details, budget) => {
            setHasDismissedOnboarding(true);
            if (budget) {
              await handleUpdateBudget(budget.moveInBudget ?? 20000, budget.monthlyBudget ?? 8000);
            }
            await handleUpdateCondoDetails({
              ...details,
              isOnboardingCompleted: true,
            });
            setIsOnboardingOpen(false);
          }}
        />
      )}
    </div>
  );
}
