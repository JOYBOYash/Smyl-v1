export type PlatformType = 'x' | 'linkedin';

export interface PostAuthor {
  name: string;
  username: string; // Handle (X) or headline title (LinkedIn)
  isVerified: boolean;
  avatarColor: string;
  avatarText: string;
  avatarUrl?: string; // Optional custom avatar image upload
}

export interface PostContent {
  text: string;
  hashtags: string[];
  mentions: string[];
  links: string[];
}

export interface PostEngagement {
  likes: number;
  comments: number;
  reposts: number;
  views?: number; // X-only
}

export interface ParsedPost {
  platform: PlatformType;
  author: PostAuthor;
  content: PostContent;
  timestamp: string;
  engagement: PostEngagement;
}

export type CardTheme = 'light' | 'dark' | 'retro';

export type CardOrientation = 'auto' | 'landscape' | 'portrait' | 'square';

export type FontFamily =
  | 'sans'
  | 'inter'
  | 'roboto'
  | 'display'
  | 'outfit'
  | 'poppins'
  | 'montserrat'
  | 'space'
  | 'serif'
  | 'playfair'
  | 'mono'
  | 'fira';

export type CanvasBackground =
  | 'none'
  | 'solid-white'
  | 'solid-dark'
  | 'gradient-sunset'
  | 'gradient-ocean'
  | 'gradient-twilight'
  | 'gradient-emerald'
  | 'gradient-royal'
  | 'gradient-cyber'
  | 'pattern-dots-light'
  | 'pattern-dots-dark'
  | 'pattern-grid-light'
  | 'pattern-grid-dark'
  | 'pattern-lines-gradient'
  | 'pattern-blueprint'
  | 'pattern-crosses';

export interface CardCustomization {
  theme: CardTheme;
  platform: PlatformType;
  fontFamily: FontFamily;
  orientation: CardOrientation;
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: number; // base font size in px, e.g. 12 to 24
  canvasPadding: '0' | '16' | '32' | '48' | '64';
  canvasBackground: CanvasBackground;
  backgroundBlur?: number; // blur intensity in px for gradient backgrounds (0 to 30)
  showEngagement: boolean;
  showPlatformIcon: boolean;
  showHashtagCloud?: boolean; // toggle automatic hashtag pills cloud
  isEditable: boolean;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  shadowSize: 'none' | 'sm' | 'md' | 'lg';
}
