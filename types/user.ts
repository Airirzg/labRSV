export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin';
  type: 'individual' | 'team';
  teamMembers?: string[];
}

export interface UserProfile extends Omit<User, 'role' | 'password'> {
  updatedAt?: string;
}
