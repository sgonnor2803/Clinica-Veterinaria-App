// Appointment
export interface Appointment {
  id: string;
  date: string;
  description: string;
  vet_id?: string;
  user_id?: string;
}

// Pet
export interface Pet {
  id: string;
  name: string;
  species: string;
  age: number;
  adopted: boolean;
  owner_id?: string | null;
}

// Product
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountApplied?: boolean;
}

// Login Response
export interface LoginResponse {
  session: {
    accessToken: string;
  };
  user: {
    id: string;
    email: string;
    role: 'client' | 'vet' | 'admin';
    user_metadata?: {
      role: string;
    };
  };
}

// API Error Response
export interface ApiErrorResponse {
  status: number;
  message: string;
  error?: any;
}
