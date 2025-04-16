interface TokenPayload {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  type?: 'individual' | 'team';
  teamMembers?: string[];
  iat?: number;
  exp?: number;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    // In a real app, you would verify the signature here
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    // Check if token is expired
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

export function generateToken(user: TokenPayload): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const payload = {
    ...user,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };

  // In a real app, you would sign the token with a secret key
  const token = [
    btoa(JSON.stringify(header)),
    btoa(JSON.stringify(payload))
  ].join('.');

  return token;
}
