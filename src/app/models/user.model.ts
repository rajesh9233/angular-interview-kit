export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer' | string;
}

export type UserPayload = Omit<User, 'id'>;