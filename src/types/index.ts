// User types
export enum UserRole {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  CLIENT = 'CLIENT'
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// Address and Location types
export interface Address {
  id: number;
  street: string;
  city: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

// Property types
export enum PropertyType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  COMMERCIAL = 'COMMERCIAL',
  LAND = 'LAND'
}

export enum PropertyStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  SOLD = 'SOLD',
  RENTED = 'RENTED'
}

export enum TransactionType {
  SALE = 'SALE',
  RENT = 'RENT'
}

export interface Property {
  id: number;
  title: string;
  description: string;
  price: number;
  type: PropertyType;
  status: PropertyStatus;
  transactionType: TransactionType;
  size: number; // in square meters
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  floor?: number;
  yearBuilt?: number;
  energyClass?: string;
  address: Address;
  images: PropertyImage[];
  agentId: number;
  agent?: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface PropertyImage {
  id: number;
  url: string;
  isPrimary: boolean;
  propertyId: number;
}

// Review types
export interface Review {
  id: number;
  rating: number; // 1-5
  comment: string;
  propertyId?: number;
  property?: Property;
  agentId?: number;
  agent?: User;
  authorId: number;
  author: User;
  createdAt: Date;
  updatedAt: Date;
}

// Appointment types
export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED'
}

export enum AppointmentType {
  PROPERTY_VIEWING = 'PROPERTY_VIEWING',
  CONSULTATION = 'CONSULTATION',
  ONLINE_MEETING = 'ONLINE_MEETING'
}

export interface Appointment {
  id: number;
  title: string;
  description?: string;
  type: AppointmentType;
  status: AppointmentStatus;
  startTime: Date;
  endTime: Date;
  propertyId?: number;
  property?: Property;
  agentId: number;
  agent: User;
  clientId: number;
  client: User;
  location?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Form input types (for creating/updating)
export type CreatePropertyInput = Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'agent' | 'address' | 'images'> & {
  address: Omit<Address, 'id'>;
};

export type UpdatePropertyInput = Partial<CreatePropertyInput> & {
  id: number;
};

export type CreateReviewInput = Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'author' | 'property' | 'agent'>;

export type CreateAppointmentInput = Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'agent' | 'client' | 'property'>;

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}
