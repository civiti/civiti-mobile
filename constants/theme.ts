import type { IssueCategory, IssueStatus, UrgencyLevel } from '@/constants/enums';

// ─── Brand Palette ───────────────────────────────────────────────

export const BrandColors = {
  oxfordBlue: '#14213D',
  orangeWeb: '#FCA311',
  platinum: '#E5E5E5',
  white: '#FFFFFF',
  black: '#000000',

  // Opacity variants
  oxfordBlue90: 'rgba(20, 33, 61, 0.9)',
  oxfordBlue80: 'rgba(20, 33, 61, 0.8)',
  oxfordBlue70: 'rgba(20, 33, 61, 0.7)',
  oxfordBlue50: 'rgba(20, 33, 61, 0.5)',
  orangeWeb90: 'rgba(252, 163, 17, 0.9)',
  orangeWeb20: 'rgba(252, 163, 17, 0.2)',
} as const;

// ─── Semantic Theme Tokens ───────────────────────────────────────

export const Colors = {
  light: {
    text: '#14213D',
    textSecondary: 'rgba(20, 33, 61, 0.7)',
    background: '#E5E5E5',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    border: '#E5E5E5',
    pressed: '#D6D6D6',
    tint: '#FCA311',
    tabIconDefault: 'rgba(20, 33, 61, 0.5)',
    tabIconSelected: '#FCA311',
    primary: '#14213D',
    accent: '#FCA311',
    success: '#28A745',
    successMuted: '#DCFCE7',
    error: '#DC3545',
    errorMuted: '#FFF1F0',
    warningMuted: '#FEF3C7',
    cautionMuted: '#FFEDD5',
    info: '#1890FF',
    infoMuted: '#E6F7FF',
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: 'rgba(236, 237, 238, 0.7)',
    background: '#151718',
    surface: '#1E2022',
    surfaceElevated: '#262A2C',
    border: '#3A3F42',
    pressed: '#4A5057',
    tint: '#FCA311',
    tabIconDefault: 'rgba(236, 237, 238, 0.5)',
    tabIconSelected: '#FCA311',
    primary: '#E5E5E5',
    accent: '#FCA311',
    success: '#4ADE80',
    successMuted: '#14532D',
    error: '#F87171',
    errorMuted: '#450A0A',
    warningMuted: 'rgba(245, 158, 11, 0.15)',
    cautionMuted: 'rgba(249, 115, 22, 0.15)',
    info: '#60A5FA',
    infoMuted: '#1A3A47',
  },
} as const;

// ─── Domain Color Maps ───────────────────────────────────────────

export const StatusColors: Record<IssueStatus, string> = {
  Draft: '#64748B',
  Submitted: '#14213D',
  UnderReview: '#D48806',
  Active: '#1890FF',
  Resolved: '#28A745',
  Rejected: '#DC3545',
  Cancelled: '#64748B',
};

type BadgeStyle = { fg: string; bg: string; border: string };

export const StatusBadgeColors: Record<'light' | 'dark', Record<IssueStatus, BadgeStyle>> = {
  light: {
    Draft:       { fg: '#64748B', bg: '#F1F5F9', border: '#CBD5E1' },
    Submitted:   { fg: '#14213D', bg: '#E6F7FF', border: '#91D5FF' },
    UnderReview: { fg: '#D48806', bg: '#FFFBE6', border: '#FFE58F' },
    Active:      { fg: '#1890FF', bg: '#E6F7FF', border: '#91D5FF' },
    Resolved:    { fg: '#28A745', bg: '#DCFCE7', border: '#86EFAC' },
    Rejected:    { fg: '#DC3545', bg: '#FFF1F0', border: '#FFB8B8' },
    Cancelled:   { fg: '#64748B', bg: '#F1F5F9', border: '#CBD5E1' },
  },
  dark: {
    Draft:       { fg: '#94A3B8', bg: 'rgba(100,116,139,0.15)', border: 'rgba(100,116,139,0.3)' },
    Submitted:   { fg: '#93C5FD', bg: '#1E2D3D', border: 'rgba(147,197,253,0.3)' },
    UnderReview: { fg: '#FBBF24', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' },
    Active:      { fg: '#60A5FA', bg: '#1A3A47', border: 'rgba(96,165,250,0.3)' },
    Resolved:    { fg: '#4ADE80', bg: '#14532D', border: 'rgba(74,222,128,0.3)' },
    Rejected:    { fg: '#F87171', bg: '#450A0A', border: 'rgba(248,113,113,0.3)' },
    Cancelled:   { fg: '#94A3B8', bg: 'rgba(100,116,139,0.15)', border: 'rgba(100,116,139,0.3)' },
  },
};

export const UrgencyBadgeColors: Record<'light' | 'dark', Record<UrgencyLevel, BadgeStyle>> = {
  light: {
    Low:    { fg: '#28A745', bg: '#DCFCE7', border: 'transparent' },
    Medium: { fg: '#F59E0B', bg: '#FEF3C7', border: 'transparent' },
    High:   { fg: '#F97316', bg: '#FFEDD5', border: 'transparent' },
    Urgent: { fg: '#DC3545', bg: '#FFF1F0', border: 'transparent' },
  },
  dark: {
    Low:    { fg: '#4ADE80', bg: '#14532D', border: 'rgba(74,222,128,0.3)' },
    Medium: { fg: '#FBBF24', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' },
    High:   { fg: '#FB923C', bg: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.3)' },
    Urgent: { fg: '#F87171', bg: '#450A0A', border: 'rgba(248,113,113,0.3)' },
  },
};

export const CategoryColors: Record<IssueCategory, string> = {
  Infrastructure: '#F59E0B',
  Environment: '#22C55E',
  Transportation: '#3B82F6',
  PublicServices: '#8B5CF6',
  Safety: '#EF4444',
  Other: '#6B7280',
};

export const UrgencyColors: Record<UrgencyLevel, string> = {
  Low: '#28A745',
  Medium: '#F59E0B',
  High: '#F97316',
  Urgent: '#DC3545',
};

// ─── Fonts ───────────────────────────────────────────────────────

export const Fonts = {
  regular: 'FiraSans_400Regular',
  semiBold: 'FiraSans_600SemiBold',
  bold: 'FiraSans_700Bold',
  extraBold: 'FiraSans_800ExtraBold',
} as const;
