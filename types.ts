export type ItemType = 'LOST' | 'FOUND';

export enum Category {
  ELECTRONICS = 'Electronics',
  CLOTHING = 'Clothing',
  BOOKS = 'Books',
  ID_CARDS = 'ID Cards',
  STATIONERY = 'Stationery',
  OTHER = 'Other'
}

export enum Location {
  DINING_HALL = 'Dining Hall',
  COMMON_ROOM = 'Common Room',
  STUDY_AREA = 'Study Area',
  DORM_BLOCK_A = 'Dorm Block A',
  DORM_BLOCK_B = 'Dorm Block B',
  GYM = 'Gym',
  RECEPTION = 'Reception',
  OUTDOOR_GROUNDS = 'Outdoor Grounds'
}

export interface User {
  id: string;
  name: string;
  email: string;
  admissionNumber: string; // Used for login
  gender: string;
  password: string; // In a real app, this would be hashed. Stored plainly for this localStorage demo.
  roomNumber: string;
  role: 'STUDENT' | 'WARDEN';
}

export interface Item {
  id: string;
  userId?: string; // Optional for backward compatibility with seed data
  type: ItemType;
  title: string;
  category: Category;
  location: Location;
  description: string;
  dateReported: string; // ISO String
  status: 'OPEN' | 'RESOLVED';
  contactName: string;
  contactInfo: string; // Email or Room Number
  imageBase64?: string; // Optional image data
}

export interface MatchResult {
  itemId: string;
  confidence: number;
  reason: string;
}