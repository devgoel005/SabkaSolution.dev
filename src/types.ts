export interface User {
  id: string;
  phone: string;
  name: string;
  ward: string;
  city: string;
  state: string;
  role: 'CITIZEN' | 'VOLUNTEER' | 'ADMIN';
  avatarUrl?: string;
  points: number;
  streak: number;
  lastActiveDate?: string;
  badges: string[];
}

export interface Issue {
  id: string;
  title: string;
  category: string;
  description: string;
  location: string;
  ward?: string;
  city: string;
  state: string;
  pincode?: string;
  timeAgo: string;
  timestamp: string;
  upvotes: number;
  upvotedBy: string[]; // phone numbers of users who upvoted
  severity: number;
  status: 'PENDING' | 'VERIFIED' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED' | 'REJECTED';
  imageUrl?: string;
  anonymous: boolean;
  reporterName: string;
  reporterPhone: string;
  verificationCount: number;
  rejectionCount: number;
  verifiedBy: string[]; // phone numbers of users who verified
  rejectedBy: string[]; // phone numbers of users who rejected
  authorityName?: string;
  authorityEmail?: string;
  authorityTwitter?: string;
  emailDraft?: string;
  tweetDraft?: string;
  campaign?: Campaign;
  latitude?: number;
  longitude?: number;
}

export interface Campaign {
  campaignName: string;
  petitionTitle: string;
  petitionBody: string;
  hashtag: string;
  signaturesCount: number;
  signedBy: string[]; // phone numbers of users who signed
  createdAt: string;
}

export interface CampaignGroup {
  id: string; // usually category_city
  category: string;
  city: string;
  name: string;
  memberCount: number;
  members: string[]; // phone numbers
  issuesCount: number;
}

export interface RewardCoupon {
  id: string;
  title: string;
  description: string;
  partner: string;
  pointsCost: number;
  code: string;
  expiry: string;
  imageUrl?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}
