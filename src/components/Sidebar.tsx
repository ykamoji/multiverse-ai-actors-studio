import React from "react";
import { Info, Loader2, Wand2 } from "lucide-react";
import { motion } from "motion/react";

interface SidebarProps {
  sceneDescription: string;
  setSceneDescription: (v: string) => void;
  aspectRatio: string;
  setAspectRatio: (v: string) => void;
  selectedModel: string;
  setSelectedModel: (v: string) => void;
  error: string | null;
  isGenerating: boolean;
  handleGenerate: () => void;
  children: React.ReactNode;
}

export default function Sidebar({
  sceneDescription,
  setSceneDescription,
  aspectRatio,
  setAspectRatio,
  selectedModel,
  setSelectedModel,
  error,
  isGenerating,
  handleGenerate,
  children
}: SidebarProps) {
  return (
    <aside className="w-[420px] border-r border-studio-border bg-studio-card flex flex-col h-full shrink-0">
      <div className="p-6 border-b border-studio-border">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 bg-studio-accent rounded shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
          <h1 className="text-xl font-display font-bold tracking-tight text-white uppercase italic">Multiverse</h1>
        </div>
        <p className="text-[10px] uppercase tracking-[0.2em] font-mono text-gray-500">AI Studio Edition</p>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-8">
        {/* Section: Global Settings */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Global Config</h3>
            <Info className="w-3.5 h-3.5 text-gray-600 cursor-help" />
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 font-mono">Image Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-black/40 border border-studio-border rounded-lg p-2 text-xs text-white outline-none focus:border-studio-accent transition-all cursor-pointer appearance-none"
            >
              <option value="gemini-2.5-flash-image">Gemini 2.5 Flash Image</option>
              <option value="gemini-3-pro-image-preview">Gemini 3 Pro Image (Preview)</option>
              <option value="gemini-3.1-flash-image-preview">Gemini 3.1 Flash Image (Preview)</option>
              <option value="imagen-4.0-generate-001">Imagen 4.0 Generate</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 font-mono">Aspect Ratio</label>
            <div className="grid grid-cols-5 gap-1">
              {["1:1", "16:9", "4:3", "9:16", "3:4"].map(ratio => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`h-8 rounded text-[10px] font-bold transition-all border ${
                    aspectRatio === ratio
                      ? "bg-studio-accent border-studio-accent text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                      : "bg-transparent border-studio-border text-gray-500 hover:border-gray-600"
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-400 font-mono">Scene Prompt</label>
            <textarea
              className="w-full bg-black/40 border border-studio-border rounded-lg p-3 text-xs outline-none focus:border-studio-accent focus:ring-1 focus:ring-studio-accent/20 transition-all h-24 resize-none leading-relaxed"
              placeholder="Describe the environment, lighting, and style..."
              value={sceneDescription}
              onChange={(e) => setSceneDescription(e.target.value)}
            />
          </div>
        </section>

        {children}
      </div>

      {/* Action Bar */}
      <div className="p-6 border-t border-studio-border bg-black/20">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-[10px] text-red-400 flex items-start gap-2 bg-red-400/10 p-2 rounded border border-red-400/20"
          >
            <Info className="w-3 h-3 shrink-0" />
            {error}
          </motion.div>
        )}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full h-12 rounded-lg bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-studio-accent hover:text-white disabled:bg-gray-800 disabled:text-gray-600 transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2 group"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 transition-transform group-hover:rotate-12" />
              Render Studio
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
