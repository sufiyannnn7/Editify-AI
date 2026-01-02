
import React from 'react';
import { EditingStyle, Language } from './types';

export const LANGUAGES: Language[] = ['English', 'Hindi', 'Other'];

export const STYLES: { id: EditingStyle; label: string; icon: React.ReactNode }[] = [
  { 
    id: 'Natural enhancement', 
    label: 'Natural Enhancement',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l.707.707M6.343 6.343l.707-.707M14.5 12a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" /></svg> 
  },
  { 
    id: 'Professional portrait', 
    label: 'Professional Portrait',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> 
  },
  { 
    id: 'Studio lighting', 
    label: 'Studio Lighting',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg> 
  },
  { 
    id: 'Social media ready', 
    label: 'Social Media Ready',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> 
  },
  { 
    id: 'Vintage film', 
    label: 'Vintage Film',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> 
  },
  { 
    id: 'Cyberpunk neon', 
    label: 'Cyberpunk Neon',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> 
  },
  { 
    id: 'Minimal correction', 
    label: 'Minimal Correction',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg> 
  },
];

export const INTERNAL_PROMPT_TEMPLATE = `
You are a world-class professional photo editor and compositor. 
Task: Enhance, edit, or combine the provided source images into a single high-quality result.

CORE REQUIREMENTS:
1. IDENTITY PROTECTION: Do not alter the fundamental facial structure, identity, or core features of any person in the images.
2. OPTICAL REALISM: Ensure seamless blending, natural shadows, and consistent lighting across the entire frame.
3. BLENDING: If multiple images are provided, combine them into a single coherent composition (e.g., merging people into one scene, swapping backgrounds, or compositing elements) as requested.
4. TEXTURE PRESERVATION: Maintain original skin pores, fine details, and clothing textures. Avoid a "plastic" or "AI-generated" look.

TECHNICAL SPECIFICATIONS:
- Style Direction: {{style}}.
- User Instruction: {{instruction}}.
- Lighting: Balanced, soft studio or natural lighting as per the style.
- Sharpness: High clarity without digital noise.
- Tags: ultra-realistic, natural skin texture, original identity preserved, high resolution, sharp focus, balanced exposure, professional photography, seamless composition.

If multiple images are provided, they are numbered Asset #1, Asset #2, etc. and you must synthesize them into one perfect final image.
`;

export const SPECIAL_EDIT_MAPPINGS: Record<string, string> = {
  "light on face": "Soft frontal light, gentle highlights, no glow effect",
  "remove dark circles": "Mild correction only, texture preserved",
  "clear skin": "Natural cleanup, pores visible",
  "professional look": "Neutral color grading, studio balance",
  "blur background": "Natural depth of field, edge-safe blur",
  "white background": "Studio-style clean background, no cutout artifacts",
  "combine": "Perform high-fidelity seamless blending and composition of all subjects",
  "merge": "Seamlessly integrate multiple subjects into a single coherent scene",
  "swap": "Precisely swap or replace elements between the provided source assets",
  "vintage": "Apply subtle film grain, warm tones, and classic cinematic contrast",
  "cyberpunk": "Infuse with neon blue and pink highlights, atmospheric depth, and futuristic sharp contrast"
};
