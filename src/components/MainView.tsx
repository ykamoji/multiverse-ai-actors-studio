import React from "react";
import { Image as ImageIcon, Download } from "lucide-react";
import { motion } from "motion/react";

interface MainViewProps {
  aspectRatio: string;
  isGenerating: boolean;
  generatedImage: string | null;
  handleDownload: () => void;
  selectedModel: string;
}

export default function MainView({
  aspectRatio,
  isGenerating,
  generatedImage,
  handleDownload,
  selectedModel
}: MainViewProps) {
  
  const getFriendlyModelName = (modelId: string) => {
    switch (modelId) {
      case "gemini-2.5-flash-image": return "Gemini 2.5 Flash Image";
      case "gemini-3-pro-image-preview": return "Gemini 3 Pro Image (Preview)";
      case "gemini-3.1-flash-image-preview": return "Gemini 3.1 Flash Image (Preview)";
      case "imagen-4.0-generate-001": return "Imagen 4.0 Generate";
      default: return modelId;
    }
  };

  const friendlyName = getFriendlyModelName(selectedModel);

  return (
    <main className="flex-1 relative bg-black flex flex-col overflow-hidden">
      {/* Top Header */}
      <header className="h-14 border-b border-studio-border bg-studio-bg/80 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            {friendlyName} Online
          </div>
          <div className="h-4 w-px bg-studio-border"></div>
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
            Viewport: {aspectRatio}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           {generatedImage && (
             <button
               onClick={handleDownload}
               className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-studio-border text-[10px] font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all"
             >
               <Download className="w-3 h-3" /> Export
             </button>
           )}
        </div>
      </header>

      {/* Viewport Area */}
      <div className="flex-1 relative overflow-hidden flex items-center justify-center p-12 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)]">
        {/* Canvas Frame */}
        <div className={`relative transition-all duration-500 bg-studio-card border border-studio-border shadow-[0_0_100px_rgba(0,0,0,0.5)] flex items-center justify-center group overflow-hidden ${
           aspectRatio === "16:9" ? "w-full max-w-5xl aspect-video" :
           aspectRatio === "9:16" ? "h-full aspect-[9/16]" :
           aspectRatio === "3:4" ? "h-full aspect-[3/4]" :
           aspectRatio === "4:3" ? "w-full max-w-4xl aspect-[4/3]" :
           "w-[500px] aspect-square"
        }`}>
           {isGenerating && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center space-y-4 bg-black/80 backdrop-blur-sm">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-white/5 border-t-studio-accent animate-spin"></div>
                  <div className="absolute inset-0 w-12 h-12 rounded-full border-2 border-white/5 blur-sm"></div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">Composing Scene</p>
                  <p className="text-[9px] font-mono text-gray-500 italic">Syncing actor portraits...</p>
                </div>
              </div>
           )}

           {generatedImage ? (
              <motion.img
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                src={generatedImage}
                alt="Generated Scene"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
           ) : (
              <div className="text-center space-y-6">
                <div className="relative inline-block">
                  <ImageIcon className="w-20 h-20 text-studio-border" />
                  <div className="absolute -inset-4 border border-studio-accent/20 rounded-full animate-[spin_10s_linear_infinite] border-dashed"></div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">No output generated yet</p>
                  <p className="text-[10px] font-mono text-gray-700 uppercase tracking-widest">Adjust configurations in sidebar</p>
                </div>
              </div>
           )}
        </div>

        {/* Decorative Corner Elements */}
        <div className="absolute top-0 left-0 w-12 h-12 border-l border-t border-studio-border/50"></div>
        <div className="absolute top-0 right-0 w-12 h-12 border-r border-t border-studio-border/50"></div>
        <div className="absolute bottom-0 left-0 w-12 h-12 border-l border-b border-studio-border/50"></div>
        <div className="absolute bottom-0 right-0 w-12 h-12 border-r border-b border-studio-border/50"></div>
      </div>

      {/* Footer info bar */}
      <footer className="h-8 border-t border-studio-border bg-studio-card flex items-center justify-between px-4 text-[9px] font-mono text-gray-600 shrink-0">
        <div className="flex gap-4">
           <span>ENGINE: {friendlyName.toUpperCase()}</span>
           <span>BUFFER: OK</span>
        </div>
        <div className="flex gap-4">
           <span>© 2026 MULTIVERSE STUDIO CORP</span>
           <span className="text-studio-accent font-bold">READY</span>
        </div>
      </footer>
    </main>
  );
}
