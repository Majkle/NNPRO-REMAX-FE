// User types
export enum UserRole {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  CLIENT = 'CLIENT'
}

export interface PersonalInformation {
  degree?: string;  // TODO: remove ?
  firstName: string;
  lastName: string;
  phoneNumber?: string; // TODO: remove ?
  birthDate?: Date; // TODO: remove ?
  address?: Address;  // TODO: remove ?
}

export interface User {
  id: number;
  username: string;
  email: string;
  personalInformation: PersonalInformation;
  role: UserRole;
  isBlocked?: boolean;
  createdAt: Date;
}

export interface SimplifiedUser {
  id: number;
  degree?: string;
  firstName: string;
  lastName: string;
}

// Address Region Enum
export enum AddressRegion {
  PRAHA = 'PRAHA',
  STREDOCESKY = 'STREDOCESKY',
  JIHOCESKY = 'JIHOCESKY',
  PLZENSKY = 'PLZENSKY',
  KARLOVARSKY = 'KARLOVARSKY',
  USTECKY = 'USTECKY',
  LIBERECKY = 'LIBERECKY',
  KRALOVEHRADECKY = 'KRALOVEHRADECKY',
  PARDUBICKY = 'PARDUBICKY',
  VYSOCINA = 'VYSOCINA',
  JIHOMORAVSKY = 'JIHOMORAVSKY',
  OLOMOUCKY = 'OLOMOUCKY',
  ZLINSKY = 'ZLINSKY',
  MORAVSKOSLEZSKY = 'MORAVSKOSLEZSKY'
}

// Address and Location types
export interface Address {
  id: number;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  flatNumber?: string;
  region: AddressRegion;
  latitude?: number;
  longitude?: number;
}

// Building Properties Enums
export enum ConstructionMaterial {
  BRICK = 'BRICK',
  PANEL = 'PANEL',
  WOOD = 'WOOD',
  STONE = 'STONE',
  OTHER = 'OTHER'
}

export enum BuildingCondition {
  NEW = 'NEW',
  RENOVATED = 'RENOVATED',
  GOOD = 'GOOD',
  NEEDS_RENOVATION = 'NEEDS_RENOVATION',
  DILAPIDATED = 'DILAPIDATED'
}

export enum EnergyEfficiencyClass {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G'
}

export enum BuildingLocation {
  CITY_CENTER = 'CITY_CENTER',
  SUBURBS = 'SUBURBS',
  RURAL_AREA = 'RURAL_AREA',
  QUITE_AREA = 'QUITE_AREA'
}

export interface BuildingProperties {
  id: number;
  constructionMaterial: ConstructionMaterial;
  buildingCondition: BuildingCondition;
  energyEfficiencyClass: EnergyEfficiencyClass;
  buildingLocation: BuildingLocation;
  isInProtectionZone: boolean;
}

// Utilities Enums and Interface
export enum InternetConnection {
  NONE = 'NONE',
  DSL = 'DSL',
  CABLE = 'CABLE',
  FIBER_OPTIC = 'FIBER_OPTIC',
  SATELLITE = 'SATELLITE'
}

export enum AvailableUtility {
  WATER = 'WATER',
  WELL = 'WELL',
  ELECTRICITY = 'ELECTRICITY',
  GAS = 'GAS',
  SEWERAGE = 'SEWERAGE',
  CESSPOOL = 'CESSPOOL',
  HEATING = 'HEATING',
  PHONE_LINE = 'PHONE_LINE',
  CABLE_TV = 'CABLE_TV',
  RECYCLING = 'RECYCLING',
  BARRIER_FREE_ACCESS = 'BARRIER_FREE_ACCESS'
}

export interface Utilities {
  id: number;
  hasWater: boolean;
  hasWell: boolean;
  hasElectricity: boolean;
  hasGas: boolean;
  hasSewerage: boolean;
  hasCesspool: boolean;
  hasHeating: boolean;
  hasPhoneLine: boolean;
  hasCableTV: boolean;
  hasRecycling: boolean;
  hasBarrierFreeAccess: boolean;
  internetConnection: InternetConnection;
  parkingPlaces: number;
}

// API format for Utilities (using arrays)
export interface UtilitiesAPI {
  availableUtilities: AvailableUtility[];
  internetConnection: InternetConnection;
  parkingPlaces: number;
}

// Transport Possibilities
export enum TransportPossibility {
  ROAD = 'ROAD',
  HIGHWAY = 'HIGHWAY',
  TRAIN = 'TRAIN',
  BUS = 'BUS',
  PUBLIC_TRANSPORT = 'PUBLIC_TRANSPORT',
  AIRPLANE = 'AIRPLANE',
  BOAT = 'BOAT',
  FERRY = 'FERRY'
}

export interface TransportPossibilities {
  id: number;
  road: boolean;
  highway: boolean;
  train: boolean;
  bus: boolean;
  publicTransport: boolean;
  airplane: boolean;
  boat: boolean;
  ferry: boolean;
}

// API format for Transport Possibilities (using arrays)
export interface TransportPossibilitiesAPI {
  possibilities: TransportPossibility[];
}

// Civic Amenities
export enum CivicAmenity {
  BUS_STOP = 'BUS_STOP',
  TRAIN_STATION = 'TRAIN_STATION',
  POST_OFFICE = 'POST_OFFICE',
  ATM = 'ATM',
  GENERAL_PRACTITIONER = 'GENERAL_PRACTITIONER',
  VETERINARIAN = 'VETERINARIAN',
  ELEMENTARY_SCHOOL = 'ELEMENTARY_SCHOOL',
  KINDERGARTEN = 'KINDERGARTEN',
  SUPERMARKET = 'SUPERMARKET',
  SMALL_SHOP = 'SMALL_SHOP',
  RESTAURANT = 'RESTAURANT',
  PUB = 'PUB',
  PLAYGROUND = 'PLAYGROUND',
  SUBWAY = 'SUBWAY'
}

export interface CivicAmenities {
  id: number;
  busStop: boolean;
  trainStation: boolean;
  postOffice: boolean;
  atm: boolean;
  generalPractitioner: boolean;
  veterinarian: boolean;
  elementarySchool: boolean;
  kindergarten: boolean;
  supermarket: boolean;
  smallShop: boolean;
  restaurant: boolean;
  pub: boolean;
  playground: boolean;
  subway: boolean;
}

// API format for Civic Amenities (using arrays)
export interface CivicAmenitiesAPI {
  amenities: CivicAmenity[];
}

// Property types
export enum PropertyType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  LAND = 'LAND'
}

export enum PropertyStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  BOUGHT = 'BOUGHT'
}

export enum TransactionType {
  SALE = 'SALE',
  RENTAL = 'RENTAL'
}

export enum PriceDisclosure {
  ASK = 'ASK',
  AGREEMENT = 'AGREEMENT',
  NOT_DISCLOSED = 'NOT_DISCLOSED'
}

export enum Commission {
  INCLUDED = 'INCLUDED',
  EXCLUDED = 'EXCLUDED'
}

export enum Taxes {
  INCLUDED = 'INCLUDED',
  EXCLUDED = 'EXCLUDED'
}

export enum Equipment {
  FURNISHED = 'FURNISHED',
  UNFURNISHED = 'UNFURNISHED',
  PARTIALLY_FURNISHED = 'PARTIALLY_FURNISHED'
}

// Base Real Estate Interface
export interface RealEstateBase {
  id: number;
  listedAt: Date;
  name: string;
  description: string;
  status: PropertyStatus;
  usableArea: number;
  contractType: TransactionType;
  price: number;
  previousPrice?: number; // Most recent previous price for quick access
  priceDisclosure: PriceDisclosure;
  commission: Commission;
  taxes: Taxes;
  address: Address;
  availableFrom?: Date;
  buildingProperties: BuildingProperties;
  equipment: Equipment;
  utilities: Utilities;
  transportPossibilities: TransportPossibilities;
  civicAmenities: CivicAmenities;
  basement: boolean;
  images: PropertyImage[];
  priceHistory?: PriceHistory[]; // Full price history
  agentId: number;
  agent?: User;
  createdAt: Date;
  updatedAt: Date;
}

// Apartment Specific
export enum ApartmentOwnershipType {
  OWNERSHIP = 'OWNERSHIP',
  COOPERATIVE_OWNERSHIP = 'COOPERATIVE_OWNERSHIP'
}

export interface Apartment extends RealEstateBase {
  type: PropertyType.APARTMENT;
  ownershipType: ApartmentOwnershipType;
  floor: number;
  totalFloors: number;
  elevator: boolean;
  balcony: boolean;
  rooms: number;
}

// House Specific
export enum HouseType {
  DETACHED = 'DETACHED',
  SEMI_DETACHED = 'SEMI_DETACHED',
  TERRACED = 'TERRACED',
  END_TERRACE = 'END_TERRACE'
}

export interface House extends RealEstateBase {
  type: PropertyType.HOUSE;
  plotArea: number;
  houseType: HouseType;
  stories: number;
}

// Land Specific
export interface Land extends RealEstateBase {
  type: PropertyType.LAND;
  isForHousing: boolean;
}

// Union type for all properties
export type Property = Apartment | House | Land;

export interface PropertyImage {
  id: number;
  url: string;
  isPrimary: boolean;
  propertyId: number;
}

// Price History
export interface PriceHistory {
  id: number;
  propertyId: number;
  price: number;
  changedAt: Date;
  changedBy?: number; // User ID who changed the price
  reason?: string; // Optional reason for price change
}

// Review types
export interface Review {
  id: number;
  overall: number;
  speed: number;
  communication: number;
  professionality: number;
  fairness: number;
  text: string;
  realtorId: number;
  agent?: User;
  authorClientId?: number;
  clientDisplayName?: string;
  author: User;
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

// Form input types (for creating/updating) - Frontend format
export type CreatePropertyInput = Omit<Property, 'id' | 'createdAt' | 'updatedAt' | 'agent' | 'address' | 'images' | 'utilities' | 'civicAmenities' | 'buildingProperties' | 'transportPossibilities'> & {
  address: Omit<Address, 'id'>,
  utilities: Omit<Utilities, 'id'>,
  civicAmenities: Omit<CivicAmenities, 'id'>,
  transportPossibilities: Omit<TransportPossibilities, 'id'>,
  buildingProperties: Omit<BuildingProperties, 'id'>
};

export type CreateApartment = CreatePropertyInput & {
  ownershipType: ApartmentOwnershipType;
  floor: number;
  totalFloors: number;
  elevator: boolean;
  balcony: boolean;
  rooms: number;
};

export type CreateHouse = CreatePropertyInput & {
  plotArea: number;
  houseType: HouseType;
  stories: number;
};

export type CreateLand = CreatePropertyInput & {
  isForHousing: boolean;
};

// API input types (for sending to backend)
export interface CreatePropertyAPIInput {
  realEstateType: PropertyType;
  name: string;
  description: string;
  status: PropertyStatus;
  usableArea: number;
  contractType: TransactionType;
  priceDisclosure: PriceDisclosure;
  commission: Commission;
  taxes: Taxes;
  availableFrom?: string; // ISO date string
  basement: boolean;
  price: number;
  address: Omit<Address, 'id'>;
  buildingProperties: Omit<BuildingProperties, 'id'> & { inProtectionZone: boolean };
  equipment: Equipment;
  utilities: UtilitiesAPI;
  transportPossibilities: TransportPossibilitiesAPI;
  civicAmenities: CivicAmenitiesAPI;
  imageIds?: number[];
}

export type CreateApartmentAPI = CreatePropertyAPIInput & {
  ownershipType: ApartmentOwnershipType;
  floor: number;
  totalFloors: number;
  elevator: boolean;
  balcony: boolean;
  rooms: number;
};

export type CreateHouseAPI = CreatePropertyAPIInput & {
  plotArea: number;
  houseType: HouseType;
  stories: number;
};

export type CreateLandAPI = CreatePropertyAPIInput & {
  isForHousing: boolean;
};

export type UpdatePropertyInput = Partial<CreatePropertyInput> & {
  id: number;
};

export type UpdateApartment = Partial<CreateApartment> & {
  id: number;
};

export type UpdateHouse = Partial<CreateHouse> & {
  id: number;
};

export type UpdateLand = Partial<CreateLand> & {
  id: number;
};

export type CreateReviewInput = Omit<Review, 'id' | 'author' | 'property' | 'agent' | 'clientDisplayName'>;

export type CreateAppointmentInput = Omit<Appointment, 'id' | 'createdAt' | 'updatedAt' | 'agent' | 'client' | 'property'>;

// API Response types
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  number: number;
  size: number;
}

export interface ApiError {
  message: string;
  code: string;
  details?: Record<string, unknown>;
}
