export interface QRCodeData {
  id?: string;
  // content: string;
  name?: string;
  shortUrl?: string;
  originalUrl?: string;
  createdAt?: string;
  userId?: string;
  scans?: number;
  lastScanned?: string;
  isActive?: boolean;
}


export interface QRCodeStyle {
  size: number;
  backgroundColor: string;
  foregroundColor: string;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  includeMargin: boolean;
  logoUrl?: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Analytics {
  id: string;
  qrCodeId: string;
  scannedAt: string;
  userAgent?: string;
  ipAddress?: string;
  country?: string;
  city?: string;
}

export interface DashboardStats {
  totalQRCodes: number;
  totalScans: number;
  activeQRCodes: number;
  todayScans: number;
}


export type QRType = 'url' | 'text' | 'email' | 'phone' | 'wifi' | 'vcard';

// Your existing QRCodeData might need to be updated to include type
