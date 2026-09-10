import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './config';
import {
  MoveInItem,
  ItemCategory,
  StorePlatform,
  CondoNote,
  CondoDetails,
  UserSettings,
} from '../types';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_STORES,
  DEFAULT_SETTINGS,
  DEFAULT_CONDO_DETAILS,
  getDemoItems,
} from '../data/defaults';

/**
 * Initialize default user configuration on first login without overwriting existing data
 */
export async function initializeUserData(userId: string): Promise<void> {
  const settingsDocRef = doc(db, 'users', userId, 'settings', 'user-settings');
  const path = `users/${userId}/settings/user-settings`;

  try {
    const existing = await getDoc(settingsDocRef);
    if (existing.exists()) {
      // User already initialized, do not overwrite anything!
      return;
    }

    const batch = writeBatch(db);

    // Default settings
    batch.set(settingsDocRef, {
      ...DEFAULT_SETTINGS,
      id: 'user-settings',
      userId,
      hasCompletedOnboarding: false,
      hasLoadedDemoData: true,
      updatedAt: new Date().toISOString(),
    });

    // Default condo details
    const condoDocRef = doc(db, 'users', userId, 'condoDetails', 'details');
    batch.set(condoDocRef, {
      ...DEFAULT_CONDO_DETAILS,
      id: 'details',
      userId,
      updatedAt: new Date().toISOString(),
    });

    // Default categories
    for (const cat of DEFAULT_CATEGORIES) {
      const catRef = doc(db, 'users', userId, 'categories', cat.id);
      batch.set(catRef, {
        ...cat,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Default stores
    for (const st of DEFAULT_STORES) {
      const storeRef = doc(db, 'users', userId, 'stores', st.id);
      batch.set(storeRef, {
        ...st,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Initialize with helpful demo items
    const demoItems = getDemoItems(userId);
    for (const item of demoItems) {
      const itemRef = doc(db, 'users', userId, 'items', item.id);
      batch.set(itemRef, item);
    }

    // Default introductory note
    const noteRef = doc(db, 'users', userId, 'notes', 'note-rules');
    batch.set(noteRef, {
      id: 'note-rules',
      userId,
      title: 'Move-in Checklist & Condo Essentials',
      category: 'rules',
      pinned: true,
      content: `1. Unit inspection: Photograph all pre-existing wall marks, tiles, and fixtures before unpacking.\n2. Security deposit: Keep official receipt from landlord.\n3. Upper Bunk Comfort: Remember no drilling is permitted. Use only 3M heavy-duty hooks.\n4. Keys & Cards: Duplicate gate key and pick up elevator RFID card from reception.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * ITEMS SUBSCRIPTION AND MUTATIONS
 */
export function subscribeToItems(
  userId: string,
  onUpdate: (items: MoveInItem[]) => void,
  onError?: (err: Error) => void
) {
  const path = `users/${userId}/items`;
  const itemsCol = collection(db, 'users', userId, 'items');

  return onSnapshot(
    itemsCol,
    (snapshot) => {
      const items: MoveInItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...(docSnap.data() as Omit<MoveInItem, 'id'>) });
      });
      onUpdate(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function createItem(userId: string, itemData: Omit<MoveInItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const itemsCol = collection(db, 'users', userId, 'items');
  const path = `users/${userId}/items`;
  const newDocRef = doc(itemsCol);
  const now = new Date().toISOString();

  const newItem: MoveInItem = {
    ...itemData,
    id: newDocRef.id,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(newDocRef, newItem);
    return newDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${newDocRef.id}`);
  }
}

export async function updateItem(userId: string, itemId: string, updates: Partial<MoveInItem>): Promise<void> {
  const path = `users/${userId}/items/${itemId}`;
  const itemDocRef = doc(db, 'users', userId, 'items', itemId);

  try {
    await updateDoc(itemDocRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function markItemPurchased(
  userId: string,
  itemId: string,
  actualPricePaid: number,
  purchaseDate: string,
  notes?: string,
  store?: string
): Promise<void> {
  const path = `users/${userId}/items/${itemId}`;
  const itemDocRef = doc(db, 'users', userId, 'items', itemId);

  try {
    const updates: Partial<MoveInItem> = {
      status: 'purchased',
      actualPricePaid,
      purchaseDate,
      updatedAt: new Date().toISOString(),
    };
    if (notes !== undefined) updates.notes = notes;
    if (store !== undefined) updates.store = store;

    await updateDoc(itemDocRef, updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteItem(userId: string, itemId: string): Promise<void> {
  const path = `users/${userId}/items/${itemId}`;
  const itemDocRef = doc(db, 'users', userId, 'items', itemId);

  try {
    await deleteDoc(itemDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function loadDemoItems(userId: string): Promise<void> {
  const path = `users/${userId}/items`;
  const batch = writeBatch(db);
  const demoItems = getDemoItems(userId);

  for (const item of demoItems) {
    const itemRef = doc(db, 'users', userId, 'items', item.id);
    batch.set(itemRef, item);
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function removeDemoItems(userId: string): Promise<number> {
  const path = `users/${userId}/items`;
  const itemsCol = collection(db, 'users', userId, 'items');

  try {
    const snapshot = await getDocs(itemsCol);
    const batch = writeBatch(db);
    let count = 0;

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.isDemo === true) {
        batch.delete(docSnap.ref);
        count++;
      }
    });

    if (count > 0) {
      await batch.commit();
    }
    return count;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * CATEGORIES SUBSCRIPTION AND MUTATIONS
 */
export function subscribeToCategories(
  userId: string,
  onUpdate: (categories: ItemCategory[]) => void,
  onError?: (err: Error) => void
) {
  const path = `users/${userId}/categories`;
  const categoriesCol = collection(db, 'users', userId, 'categories');

  return onSnapshot(
    categoriesCol,
    (snapshot) => {
      const categories: ItemCategory[] = [];
      snapshot.forEach((docSnap) => {
        categories.push({ id: docSnap.id, ...(docSnap.data() as Omit<ItemCategory, 'id'>) });
      });
      onUpdate(categories);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function createCategory(userId: string, category: Omit<ItemCategory, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const path = `users/${userId}/categories`;
  const colRef = collection(db, 'users', userId, 'categories');
  const newDocRef = doc(colRef);
  const now = new Date().toISOString();

  const newCat: ItemCategory = {
    ...category,
    id: newDocRef.id,
    userId,
    isCustom: true,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(newDocRef, newCat);
    return newDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${newDocRef.id}`);
  }
}

export async function updateCategory(userId: string, categoryId: string, updates: Partial<ItemCategory>): Promise<void> {
  const path = `users/${userId}/categories/${categoryId}`;
  const docRef = doc(db, 'users', userId, 'categories', categoryId);

  try {
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCategory(userId: string, categoryId: string): Promise<void> {
  const path = `users/${userId}/categories/${categoryId}`;
  const docRef = doc(db, 'users', userId, 'categories', categoryId);

  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * STORES SUBSCRIPTION AND MUTATIONS
 */
export function subscribeToStores(
  userId: string,
  onUpdate: (stores: StorePlatform[]) => void,
  onError?: (err: Error) => void
) {
  const path = `users/${userId}/stores`;
  const storesCol = collection(db, 'users', userId, 'stores');

  return onSnapshot(
    storesCol,
    (snapshot) => {
      const stores: StorePlatform[] = [];
      snapshot.forEach((docSnap) => {
        stores.push({ id: docSnap.id, ...(docSnap.data() as Omit<StorePlatform, 'id'>) });
      });
      onUpdate(stores);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function createStore(userId: string, store: Omit<StorePlatform, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const path = `users/${userId}/stores`;
  const colRef = collection(db, 'users', userId, 'stores');
  const newDocRef = doc(colRef);
  const now = new Date().toISOString();

  const newStore: StorePlatform = {
    ...store,
    id: newDocRef.id,
    userId,
    isCustom: true,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(newDocRef, newStore);
    return newDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${newDocRef.id}`);
  }
}

export async function updateStore(userId: string, storeId: string, updates: Partial<StorePlatform>): Promise<void> {
  const path = `users/${userId}/stores/${storeId}`;
  const docRef = doc(db, 'users', userId, 'stores', storeId);

  try {
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteStore(userId: string, storeId: string): Promise<void> {
  const path = `users/${userId}/stores/${storeId}`;
  const docRef = doc(db, 'users', userId, 'stores', storeId);

  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * NOTES SUBSCRIPTION AND MUTATIONS
 */
export function subscribeToNotes(
  userId: string,
  onUpdate: (notes: CondoNote[]) => void,
  onError?: (err: Error) => void
) {
  const path = `users/${userId}/notes`;
  const notesCol = collection(db, 'users', userId, 'notes');

  return onSnapshot(
    notesCol,
    (snapshot) => {
      const notes: CondoNote[] = [];
      snapshot.forEach((docSnap) => {
        notes.push({ id: docSnap.id, ...(docSnap.data() as Omit<CondoNote, 'id'>) });
      });
      // Sort pinned notes first
      notes.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
      onUpdate(notes);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function createNote(userId: string, note: Omit<CondoNote, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const path = `users/${userId}/notes`;
  const colRef = collection(db, 'users', userId, 'notes');
  const newDocRef = doc(colRef);
  const now = new Date().toISOString();

  const newNote: CondoNote = {
    ...note,
    id: newDocRef.id,
    userId,
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(newDocRef, newNote);
    return newDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${newDocRef.id}`);
  }
}

export async function updateNote(userId: string, noteId: string, updates: Partial<CondoNote>): Promise<void> {
  const path = `users/${userId}/notes/${noteId}`;
  const docRef = doc(db, 'users', userId, 'notes', noteId);

  try {
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteNote(userId: string, noteId: string): Promise<void> {
  const path = `users/${userId}/notes/${noteId}`;
  const docRef = doc(db, 'users', userId, 'notes', noteId);

  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * CONDO DETAILS SUBSCRIPTION AND MUTATIONS
 */
export function subscribeToCondoDetails(
  userId: string,
  onUpdate: (details: CondoDetails) => void,
  onError?: (err: Error) => void
) {
  const path = `users/${userId}/condoDetails/details`;
  const docRef = doc(db, 'users', userId, 'condoDetails', 'details');

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate({ id: snapshot.id, ...(snapshot.data() as Omit<CondoDetails, 'id'>) });
      } else {
        onUpdate({ ...DEFAULT_CONDO_DETAILS, id: 'details', userId });
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function updateCondoDetails(userId: string, details: Partial<CondoDetails>): Promise<void> {
  if (!userId) {
    console.warn('updateCondoDetails called without a valid userId');
    return;
  }
  const path = `users/${userId}/condoDetails/details`;
  const docRef = doc(db, 'users', userId, 'condoDetails', 'details');

  try {
    await setDoc(docRef, {
      ...details,
      userId,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * SETTINGS SUBSCRIPTION AND MUTATIONS
 */
export function subscribeToSettings(
  userId: string,
  onUpdate: (settings: UserSettings) => void,
  onError?: (err: Error) => void
) {
  if (!userId) return () => {};
  const path = `users/${userId}/settings/user-settings`;
  const docRef = doc(db, 'users', userId, 'settings', 'user-settings');

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate({ id: snapshot.id, ...(snapshot.data() as Omit<UserSettings, 'id'>) });
      } else {
        onUpdate({ ...DEFAULT_SETTINGS, id: 'user-settings', userId });
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
  if (!userId) {
    console.warn('updateUserSettings called without a valid userId');
    return;
  }
  const path = `users/${userId}/settings/user-settings`;
  const docRef = doc(db, 'users', userId, 'settings', 'user-settings');

  try {
    await setDoc(docRef, {
      ...settings,
      userId,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * BACKUP EXPORT, IMPORT, AND DELETE ACCOUNT DATA
 */
export async function exportAllUserData(userId: string): Promise<string> {
  const itemsSnapshot = await getDocs(collection(db, 'users', userId, 'items'));
  const categoriesSnapshot = await getDocs(collection(db, 'users', userId, 'categories'));
  const storesSnapshot = await getDocs(collection(db, 'users', userId, 'stores'));
  const notesSnapshot = await getDocs(collection(db, 'users', userId, 'notes'));
  const condoDetailsSnap = await getDoc(doc(db, 'users', userId, 'condoDetails', 'details'));
  const settingsSnap = await getDoc(doc(db, 'users', userId, 'settings', 'user-settings'));

  const exportData = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    userId,
    items: itemsSnapshot.docs.map((d) => d.data()),
    categories: categoriesSnapshot.docs.map((d) => d.data()),
    stores: storesSnapshot.docs.map((d) => d.data()),
    notes: notesSnapshot.docs.map((d) => d.data()),
    condoDetails: condoDetailsSnap.exists() ? condoDetailsSnap.data() : null,
    settings: settingsSnap.exists() ? settingsSnap.data() : null,
  };

  return JSON.stringify(exportData, null, 2);
}

export async function importUserData(userId: string, jsonString: string): Promise<{ success: boolean; itemsCount: number }> {
  const data = JSON.parse(jsonString);
  const batch = writeBatch(db);
  let count = 0;

  if (Array.isArray(data.items)) {
    for (const item of data.items) {
      const docRef = doc(db, 'users', userId, 'items', item.id || `imported-${Date.now()}-${count}`);
      batch.set(docRef, { ...item, userId });
      count++;
    }
  }

  if (Array.isArray(data.categories)) {
    for (const cat of data.categories) {
      const docRef = doc(db, 'users', userId, 'categories', cat.id || `cat-${count}`);
      batch.set(docRef, { ...cat, userId });
    }
  }

  if (Array.isArray(data.stores)) {
    for (const st of data.stores) {
      const docRef = doc(db, 'users', userId, 'stores', st.id || `store-${count}`);
      batch.set(docRef, { ...st, userId });
    }
  }

  if (Array.isArray(data.notes)) {
    for (const nt of data.notes) {
      const docRef = doc(db, 'users', userId, 'notes', nt.id || `note-${count}`);
      batch.set(docRef, { ...nt, userId });
    }
  }

  if (data.condoDetails) {
    const docRef = doc(db, 'users', userId, 'condoDetails', 'details');
    batch.set(docRef, { ...data.condoDetails, userId });
  }

  if (data.settings) {
    const docRef = doc(db, 'users', userId, 'settings', 'user-settings');
    batch.set(docRef, { ...data.settings, userId });
  }

  await batch.commit();
  return { success: true, itemsCount: count };
}

export async function deleteAllUserData(userId: string): Promise<void> {
  const subcollections = ['items', 'categories', 'stores', 'notes', 'condoDetails', 'settings'];
  for (const sub of subcollections) {
    const snap = await getDocs(collection(db, 'users', userId, sub));
    const batch = writeBatch(db);
    snap.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

export const saveCondoDetails = updateCondoDetails;
export const saveUserSettings = updateUserSettings;
export const subscribeToUserSettings = subscribeToSettings;
export const initializeUserWithDefaults = initializeUserData;

