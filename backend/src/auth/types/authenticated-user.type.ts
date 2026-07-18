export interface AuthenticatedUser {
  id: string;
  displayName: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
}
