
import React, { useState, useRef, useEffect } from 'react';
import { AppState, Language, EditingStyle } from './types';
import { LANGUAGES, STYLES } from './constants';
import { editImage } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    language: 'English',
    style: 'Natural enhancement',
    images: [],
    currentImageIndex: 0,
    instruction: '',
    resultImage: null,
    status: 'idle',
  });

  const [step, setStep] = useState(1);
  const [isCropping, setIsCropping] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cropArea, setCropArea] = useState({ x: 10, y: 10, width: 80, height: 80 });

  const handleLanguageSelect = (lang: Language) => {
    setState(prev => ({ ...prev, language: lang }));
  };

  const handleStyleSelect = (style: EditingStyle) => {
    setState(prev => ({ ...prev, style }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const filesArray = Array.from(files) as File[];
      const readers = filesArray.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      const results = await Promise.all(readers);
      setState(prev => ({ 
        ...prev, 
        images: results,
        currentImageIndex: 0
      }));
      setStep(3);
    }
  };

  const startCrop = () => setIsCropping(true);

  const performCrop = () => {
    const img = new Image();
    img.src = state.images[state.currentImageIndex];
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const scaleX = img.naturalWidth / 100;
      const scaleY = img.naturalHeight / 100;

      canvas.width = (cropArea.width * scaleX);
      canvas.height = (cropArea.height * scaleY);

      ctx.drawImage(
        img,
        cropArea.x * scaleX,
        cropArea.y * scaleY,
        cropArea.width * scaleX,
        cropArea.height * scaleY,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const croppedData = canvas.toDataURL('image/png');
      const updatedImages = [...state.images];
      updatedImages[state.currentImageIndex] = croppedData;
      setState(prev => ({ ...prev, images: updatedImages }));
      setIsCropping(false);
    };
  };

  const handleSubmit = async () => {
    if (state.images.length === 0 || !state.instruction) return;

    setState(prev => ({ ...prev, status: 'processing', errorMessage: undefined }));
    try {
      const result = await editImage(state.images, state.instruction, state.style);
      setState(prev => ({ ...prev, resultImage: result, status: 'success' }));
      setStep(4);
    } catch (error: any) {
      console.error(error);
      setState(prev => ({ 
        ...prev, 
        status: 'error', 
        errorMessage: error.message || "An unexpected error occurred during image processing." 
      }));
    }
  };

  const handleEditAgain = () => {
    if (state.resultImage) {
      setState(prev => ({
        ...prev,
        images: [prev.resultImage!],
        currentImageIndex: 0,
        resultImage: null,
        status: 'idle'
      }));
      setStep(3);
    }
  };

  const reset = () => {
    setState({
      language: 'English',
      style: 'Natural enhancement',
      images: [],
      currentImageIndex: 0,
      instruction: '',
      resultImage: null,
      status: 'idle',
    });
    setStep(1);
    setIsCropping(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-6 px-4 max-w-6xl mx-auto bg-gray-50 overflow-x-hidden transition-colors duration-500">
      <header className="text-center mb-6 w-full flex-shrink-0 animate-fadeIn">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter leading-none uppercase bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-blue-800">Editify-AI</h1>
        <p className="text-[10px] md:text-xs text-blue-600 font-black uppercase tracking-[0.3em] mt-2">Enterprise Vision Architecture</p>
      </header>

      {/* Progress Bar */}
      <div className="w-full max-w-2xl flex justify-between mb-8 px-4 flex-shrink-0">
        {[1, 2, 3, 4].map((s) => (
          <div 
            key={s} 
            className={`flex-1 h-2.5 mx-1.5 rounded-full transition-all duration-500 ${step >= s ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[0_0_15px_rgba(37,99,235,0.45)] scale-y-110' : 'bg-gray-200'}`}
          />
        ))}
      </div>

      <div className="w-full flex-grow bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-gray-100 p-6 md:p-12 flex flex-col transition-all duration-700 overflow-hidden relative">
        
        {step === 1 && (
          <div className="space-y-10 animate-fadeIn h-full flex flex-col justify-center max-w-3xl mx-auto w-full">
            <div className="text-center">
              <h2 className="text-3xl font-black text-gray-950 uppercase tracking-tight mb-2">Initialize Session</h2>
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Define your creative environment</p>
            </div>
            
            <div className="space-y-8">
              <div>
                <label className="block text-[12px] font-black text-gray-400 mb-5 text-center uppercase tracking-[0.3em]">Communication Protocol</label>
                <div className="flex flex-wrap justify-center gap-4">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLanguageSelect(lang)}
                      className={`px-10 py-4 rounded-[1.5rem] border-2 font-black text-sm transition-all duration-300 ${state.language === lang ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xl scale-105' : 'border-gray-100 text-gray-400 hover:border-blue-200 hover:bg-white active:scale-95'}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-black text-gray-400 mb-5 text-center uppercase tracking-[0.3em]">Aesthetic Archetype</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                  {STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => handleStyleSelect(style.id)}
                      className={`flex flex-col items-center gap-3 p-5 rounded-[2rem] border-2 text-center transition-all duration-500 ${state.style === style.id ? 'border-blue-600 bg-blue-50 shadow-2xl scale-[1.05]' : 'border-gray-50 hover:border-blue-100 hover:bg-gray-50 active:scale-95'}`}
                    >
                      <div className={`transition-colors duration-500 ${state.style === style.id ? 'text-blue-600' : 'text-gray-300'}`}>
                        {style.icon}
                      </div>
                      <span className={`text-[9px] font-black leading-tight uppercase tracking-tighter ${state.style === style.id ? 'text-blue-700' : 'text-gray-500'}`}>
                        {style.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={() => setStep(2)}
              className="w-full py-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-[2rem] font-black text-base uppercase tracking-widest hover:from-blue-700 hover:to-indigo-800 shadow-[0_20px_40px_rgba(37,99,235,0.3)] hover:shadow-[0_25px_50px_rgba(37,99,235,0.4)] transition-all duration-300 active:scale-[0.98] mt-8"
            >
              Access Upload Terminal
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8 animate-fadeIn h-full flex flex-col items-center justify-center">
            <button onClick={() => setStep(1)} className="text-blue-600 font-black flex items-center gap-2 hover:underline text-[12px] uppercase mb-4 group">
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Reconfigure Environment
            </button>
            
            <div className="w-full max-w-xl bg-gray-50 rounded-[4rem] p-16 border-4 border-dashed border-gray-200 flex flex-col items-center text-center group hover:border-blue-400 hover:bg-white transition-all cursor-pointer relative shadow-inner overflow-hidden">
              <input 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleImageUpload} 
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="w-28 h-28 bg-white shadow-[0_20px_40px_rgba(0,0,0,0.08)] text-blue-600 rounded-[2.5rem] flex items-center justify-center mb-10 group-hover:scale-110 group-hover:rotate-[8deg] transition-all duration-700">
                <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <h3 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">Import Raw Assets</h3>
              <p className="text-gray-500 font-bold text-sm uppercase tracking-[0.25em] max-w-[320px] leading-relaxed">
                Connect your high-resolution portrait files for analysis.
              </p>
              
              <div className="mt-12 flex gap-4">
                <div className="w-4 h-4 rounded-full bg-blue-100 animate-pulse"></div>
                <div className="w-4 h-4 rounded-full bg-blue-300 animate-pulse [animation-delay:0.2s]"></div>
                <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse [animation-delay:0.4s]"></div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-200/30 transition-colors"></div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fadeIn h-full flex flex-col overflow-y-auto lg:overflow-hidden pr-1 scrollbar-custom">
            <div className="flex justify-between items-center mb-8">
              <button onClick={() => setStep(2)} className="text-blue-600 font-black flex items-center gap-2 hover:underline text-[12px] uppercase group">
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Return to Assets
              </button>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                <span className="text-[12px] font-black text-gray-500 uppercase tracking-widest bg-gray-100 px-5 py-2 rounded-full border border-gray-200">
                  {state.images.length} Objects Injected
                </span>
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-10 flex-grow overflow-hidden">
              <div className="w-full lg:w-3/5 flex flex-col gap-6 overflow-hidden min-h-[350px] lg:min-h-0">
                <div className="flex-grow flex flex-col items-center justify-center bg-gray-50 rounded-[3rem] p-6 border border-gray-200 shadow-inner overflow-hidden relative group">
                  
                  {isCropping ? (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <div className="relative border-4 border-blue-500 rounded-lg overflow-hidden shadow-2xl max-h-[80%]">
                         <img src={state.images[state.currentImageIndex]} className="max-w-full max-h-full opacity-50" />
                         <div 
                           className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] cursor-move"
                           style={{ 
                             left: `${cropArea.x}%`, 
                             top: `${cropArea.y}%`, 
                             width: `${cropArea.width}%`, 
                             height: `${cropArea.height}%` 
                           }}
                         />
                         <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 pointer-events-none">
                            <div className="col-start-2 col-end-10 row-start-2 row-end-10 border border-white/20"></div>
                         </div>
                      </div>
                      <div className="flex gap-4 mt-6">
                        <button onClick={() => setIsCropping(false)} className="px-8 py-3 bg-gray-200 rounded-xl font-black text-xs uppercase hover:bg-gray-300">Cancel</button>
                        <button onClick={performCrop} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase hover:bg-blue-700 shadow-lg shadow-blue-200">Apply Crop</button>
                      </div>
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  ) : (
                    <>
                      <img 
                        src={state.images[state.currentImageIndex]} 
                        alt="Active Preview" 
                        className="max-w-full max-h-[90%] object-contain rounded-2xl shadow-2xl transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                      <div className="absolute top-6 right-6 flex flex-col gap-2">
                         <button onClick={startCrop} className="bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-xl hover:bg-white text-gray-700 transition-all active:scale-95 border border-gray-100">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                         </button>
                      </div>
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl text-white text-[10px] font-black px-5 py-2.5 rounded-full uppercase tracking-widest border border-white/20 shadow-2xl">
                        Asset Sequence ID: {state.currentImageIndex + 1}
                      </div>
                    </>
                  )}
                </div>
                
                {state.images.length > 1 && (
                  <div className="flex gap-4 overflow-x-auto py-4 px-3 scrollbar-hide bg-gray-50 rounded-[2rem] border border-gray-100 shadow-inner">
                    {state.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setState(prev => ({ ...prev, currentImageIndex: idx }))}
                        className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-4 transition-all duration-500 ${state.currentImageIndex === idx ? 'border-blue-600 scale-110 shadow-2xl ring-4 ring-blue-100' : 'border-white opacity-40 hover:opacity-100 hover:scale-105 shadow-md'}`}
                      >
                        <img src={img} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-full lg:w-2/5 flex flex-col justify-between">
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-2.5 h-10 bg-gradient-to-b from-blue-600 to-indigo-700 rounded-full shadow-xl"></div>
                    <div>
                      <label className="block text-base font-black text-gray-900 uppercase tracking-widest">Neural Directives</label>
                      <p className="text-[11px] text-gray-400 font-bold uppercase mt-1 tracking-wider italic">Precision prompt engineering required</p>
                    </div>
                  </div>
                  
                  <textarea
                    value={state.instruction}
                    onChange={(e) => setState(prev => ({ ...prev, instruction: e.target.value }))}
                    className="w-full p-8 border-2 border-gray-200 rounded-[2.5rem] flex-grow focus:border-blue-600 focus:ring-8 focus:ring-blue-50 focus:bg-white focus:outline-none transition-all duration-500 resize-none text-base md:text-xl font-bold bg-gray-50 text-gray-950 placeholder-gray-400 shadow-2xl leading-relaxed min-h-[220px] lg:min-h-0"
                    placeholder={state.images.length > 1 
                      ? "Direct the fusion: 'Combine Asset #1 and #2 with high-key studio lighting, ensuring edge fidelity and consistent skin tones...'"
                      : "Describe the transformation: 'Enhance facial illumination, apply natural depth-of-field, maintain original pore structure...'"
                    }
                  />
                  <div className="mt-4 flex justify-between items-center px-4">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Model: Gemini-2.5 Vision</span>
                    <span className="text-[10px] text-blue-500 font-black uppercase tracking-widest">Identity Preserved Mode</span>
                  </div>
                </div>

                <div className="mt-10 flex-shrink-0">
                  {state.status === 'processing' ? (
                    <div className="flex flex-col items-center justify-center gap-5 text-blue-600 py-8 bg-blue-50/80 rounded-[2.5rem] border-2 border-blue-100 animate-pulse shadow-2xl">
                      <div className="relative w-16 h-16">
                        <div className="absolute inset-0 animate-spin rounded-full border-[6px] border-blue-600 border-t-transparent"></div>
                        <div className="absolute inset-0 animate-ping rounded-full border-2 border-blue-400 opacity-20"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                           <div className="w-3 h-3 bg-blue-600 rounded-full shadow-lg"></div>
                        </div>
                      </div>
                      <span className="font-black text-sm uppercase tracking-[0.4em] text-blue-700">Synthesizing Master Image...</span>
                    </div>
                  ) : (
                    <button 
                      disabled={!state.instruction}
                      onClick={handleSubmit}
                      className="w-full py-7 bg-gradient-to-r from-blue-600 via-indigo-700 to-blue-800 text-white rounded-[2.5rem] font-black text-base uppercase tracking-[0.2em] shadow-[0_25px_50px_rgba(37,99,235,0.3)] hover:shadow-[0_30px_60px_rgba(37,99,235,0.4)] transition-all duration-500 active:scale-[0.98] group relative overflow-hidden"
                    >
                      <span className="relative z-10">{state.images.length > 1 ? 'Execute Multi-Asset Fusion' : 'Begin AI Reconstruction'}</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer transition-transform duration-1000"></div>
                    </button>
                  )}
                  {state.status === 'error' && (
                    <div className="mt-6 animate-shake">
                       <div className="bg-red-50 p-6 rounded-[2rem] border-2 border-red-100 shadow-xl">
                          <div className="flex items-start gap-4 text-red-600 mb-4">
                            <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            <div>
                               <p className="font-black text-xs uppercase tracking-widest mb-1">Diagnostic Protocol Failed</p>
                               <p className="text-sm font-bold leading-relaxed">{state.errorMessage}</p>
                            </div>
                          </div>
                          <button 
                            onClick={handleSubmit}
                            className="w-full py-4 bg-white text-red-600 border-2 border-red-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-md active:scale-95"
                          >
                            Restart Processing Pipeline
                          </button>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && state.resultImage && (
          <div className="animate-fadeIn h-full flex flex-col overflow-y-auto lg:overflow-hidden pr-1 scrollbar-custom">
            <div className="text-center mb-8 flex-shrink-0">
              <h3 className="text-3xl font-black text-gray-950 uppercase tracking-tighter">Production Finalized</h3>
              <p className="text-[12px] text-gray-400 font-bold uppercase mt-2 tracking-[0.2em]">Validated • High fidelity • Identity preserved</p>
            </div>

            <div className="flex flex-grow gap-8 md:gap-12 overflow-hidden items-stretch mb-10 flex-col lg:flex-row">
              <div className="flex-1 flex flex-col bg-gray-50 rounded-[4rem] border border-gray-100 relative overflow-hidden p-6 shadow-inner">
                 <span className="absolute top-8 left-8 bg-black/70 backdrop-blur-xl text-white text-[10px] px-5 py-2 rounded-full font-black uppercase z-10 border border-white/20 shadow-2xl">Source Components</span>
                 <div className="flex-grow flex flex-wrap items-center justify-center gap-4 overflow-hidden h-[350px] lg:h-auto p-6">
                    {state.images.map((img, idx) => (
                      <div key={idx} className="relative group/asset">
                        <img src={img} alt={`Source ${idx}`} className={`object-cover rounded-2xl shadow-xl transition-all duration-500 group-hover/asset:scale-110 ${state.images.length > 1 ? 'w-28 md:w-36 h-28 md:h-36' : 'max-w-full max-h-full'}`} />
                        {state.images.length > 1 && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/asset:opacity-100 transition-opacity bg-black/20 rounded-2xl">
                             <span className="text-white font-black text-[10px]">#{idx+1}</span>
                          </div>
                        )}
                      </div>
                    ))}
                 </div>
              </div>
              <div className="flex-1 flex flex-col bg-blue-50/50 rounded-[4rem] border-4 border-blue-100 relative overflow-hidden p-6 shadow-[0_40px_80px_-20px_rgba(37,99,235,0.3)]">
                 <span className="absolute top-8 left-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white text-[10px] px-6 py-2 rounded-full font-black uppercase z-10 shadow-2xl border border-blue-400">Master Output</span>
                 <div className="flex-grow flex items-center justify-center overflow-hidden h-[350px] lg:h-auto">
                    <img src={state.resultImage} alt="Result" className="max-w-full max-h-full object-contain rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.15)] transition-all duration-1000 hover:scale-[1.02]" />
                 </div>
              </div>
            </div>

            <div className="bg-gray-950 rounded-[2.5rem] p-8 mb-10 flex-shrink-0 shadow-[0_30px_60px_rgba(0,0,0,0.2)] relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-2 h-5 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,1)] group-hover:scale-y-150 transition-transform duration-500"></div>
                <p className="text-[12px] font-black text-gray-500 uppercase tracking-[0.3em]">AI Applied Directive</p>
              </div>
              <p className="text-lg md:text-2xl font-bold text-white italic leading-relaxed tracking-tight group-hover:text-blue-50 transition-colors">"{state.instruction}"</p>
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px]"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-[60px]"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-shrink-0 pb-4">
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = state.resultImage!;
                  link.download = `editify-master-${Date.now()}.png`;
                  link.click();
                }}
                className="py-6 bg-gradient-to-r from-gray-900 to-black text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.25em] shadow-2xl flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all group"
              >
                <svg className="w-7 h-7 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Export Master
              </button>
              <button 
                onClick={handleEditAgain}
                className="py-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.25em] shadow-[0_20px_40px_rgba(37,99,235,0.25)] flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all group"
              >
                <svg className="w-7 h-7 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Iterate Directive
              </button>
              <button 
                onClick={reset}
                className="md:col-span-2 py-5 text-gray-400 hover:text-gray-950 font-black text-[12px] uppercase tracking-[0.4em] transition-all hover:scale-105 active:scale-95"
              >
                Terminate Session & Start New
              </button>
            </div>
          </div>
        )}
      </div>

      <footer className="mt-8 text-center text-gray-400 font-black text-[11px] w-full flex-shrink-0 uppercase tracking-[0.5em] opacity-40">
        Vision Architecture Lab • Netlify Production Build • v2.5.0
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-shimmer {
          animation: shimmer 1.8s infinite linear;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-custom::-webkit-scrollbar {
          width: 8px;
        }
        .scrollbar-custom::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 20px;
          border: 2px solid white;
        }
        .scrollbar-custom::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
        .flex-grow {
          min-height: 0;
        }
      `}</style>
    </div>
  );
};

export default App;
