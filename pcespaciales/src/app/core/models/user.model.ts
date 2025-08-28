export interface User {
  id: string;
  email: string;
  name?: string;  // Made optional to match AuthService
  token: string;
  role?: string;  // Add role property
  // Add other user properties as needed
}
