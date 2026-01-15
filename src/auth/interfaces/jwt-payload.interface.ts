export interface JwtPayload {
  sub: string;           // User ID
  email: string;         // User email
  type: 'access' | 'refresh';  // Token type
  iat?: number;          // Issued at
  exp?: number;          // Expiration
}

