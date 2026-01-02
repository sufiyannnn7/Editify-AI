
export type EditingStyle = 
  | 'Natural enhancement'
  | 'Professional portrait'
  | 'Studio lighting'
  | 'Social media ready'
  | 'Minimal correction'
  | 'Vintage film'
  | 'Cyberpunk neon';

export type Language = 'English' | 'Hindi' | 'Other';

export interface AppState {
  language: Language;
  style: EditingStyle;
  images: string[];
  currentImageIndex: number;
  instruction: string;
  resultImage: string | null;
  status: 'idle' | 'processing' | 'success' | 'error';
  errorMessage?: string;
}
