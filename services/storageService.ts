import { Item, Category, Location, User } from '../types';

const STORAGE_KEY_ITEMS = 'hostel_finder_items';
const STORAGE_KEY_USERS = 'hostel_finder_users';

const SEED_DATA: Item[] = [
  {
    id: '1',
    type: 'FOUND',
    title: 'Blue Water Bottle',
    category: Category.OTHER,
    location: Location.DINING_HALL,
    description: 'A dark blue metal water bottle left on table 4.',
    dateReported: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'OPEN',
    contactName: 'John Doe',
    contactInfo: 'Room 101'
  },
  {
    id: '2',
    type: 'LOST',
    title: 'Calculus Textbook',
    category: Category.BOOKS,
    location: Location.STUDY_AREA,
    description: 'My calculus textbook, 11th edition. Has a sticker on the cover.',
    dateReported: new Date(Date.now() - 86400000 * 1).toISOString(),
    status: 'OPEN',
    contactName: 'Jane Smith',
    contactInfo: 'jane.s@school.edu'
  },
  {
    id: '3',
    type: 'FOUND',
    title: 'Sony Headphones',
    category: Category.ELECTRONICS,
    location: Location.COMMON_ROOM,
    description: 'Black over-ear headphones found on the sofa.',
    dateReported: new Date(Date.now() - 43200000).toISOString(),
    status: 'OPEN',
    contactName: 'Warden Office',
    contactInfo: 'Reception'
  }
];

const SEED_USERS: User[] = [
  {
    id: 'warden-admin-001',
    name: 'Chief Warden',
    email: 'warden@hostel.com',
    admissionNumber: 'warden', // Specific Admin ID
    password: 'hostel_admin_2025', // Specific Admin Password
    gender: 'Other',
    roomNumber: 'Admin Office',
    role: 'WARDEN'
  }
];

// --- Items ---

export const getItems = (): Item[] => {
  const stored = localStorage.getItem(STORAGE_KEY_ITEMS);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
  return JSON.parse(stored);
};

export const saveItem = (item: Item): void => {
  const items = getItems();
  items.unshift(item); // Add to top
  localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
};

export const updateItemStatus = (id: string, status: 'OPEN' | 'RESOLVED'): void => {
  const items = getItems();
  const updated = items.map(item => item.id === id ? { ...item, status } : item);
  localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(updated));
};

export const deleteItem = (id: string): void => {
    const items = getItems();
    const updated = items.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(updated));
}

// --- Users ---

export const getUsers = (): User[] => {
  const stored = localStorage.getItem(STORAGE_KEY_USERS);
  let users: User[] = stored ? JSON.parse(stored) : [];
  
  // Ensure the Warden exists (in case user clears storage or it's first load)
  // We check by ID or Admission Number to prevent duplication if seed changes
  if (!users.some(u => u.role === 'WARDEN')) {
    users = [...users, ...SEED_USERS];
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  }
  
  return users;
};

export const saveUser = (user: User): boolean => {
  const users = getUsers();
  // Check if admission number already exists
  if (users.some(u => u.admissionNumber === user.admissionNumber)) {
    return false; // User already exists
  }
  users.push(user);
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  return true;
};

export const validateUser = (admissionNumber: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.admissionNumber === admissionNumber && u.password === password);
  return user || null;
};

export const getUserById = (id: string): User | null => {
  const users = getUsers();
  return users.find(u => u.id === id) || null;
}