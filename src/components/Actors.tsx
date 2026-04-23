import React from "react";
import { Plus, Trash2, Camera, X, Images } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Actor } from "../types";

interface ActorsProps {
  actors: Actor[];
  maxActors: number;
  handleAddActor: () => void;
  handleRemoveActor: (id: string) => void;
  handleUpdateActor: (id: string, field: keyof Actor, value: string) => void;
  handleImageUpload: (id: string, file: File) => void;
  handleBulkImageUpload: (files: FileList) => void;
}

export default function Actors({
  actors,
  maxActors,
  handleAddActor,
  handleRemoveActor,
  handleUpdateActor,
  handleImageUpload,
  handleBulkImageUpload,
}: ActorsProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-500">
          Actors ({actors.length}/{maxActors})
        </h3>
        <div className="flex items-center gap-1">
          <label 
            className={`p-1.5 rounded-lg border border-studio-border bg-black/20 text-gray-400 hover:text-studio-accent transition-colors flex items-center justify-center cursor-pointer ${actors.length >= maxActors ? 'opacity-20 cursor-not-allowed' : 'hover:border-studio-accent/50'}`}
            title="Bulk Upload Portraits"
          >
            <input 
              type="file" 
              multiple 
              accept="image/*" 
              className="hidden" 
              disabled={actors.length >= maxActors}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleBulkImageUpload(e.target.files);
                }
                e.target.value = ''; // Reset to allow same files again
              }}
            />
            <Images className="w-3.5 h-3.5" />
          </label>
          <button
            onClick={handleAddActor}
            disabled={actors.length >= maxActors}
            className="p-1.5 rounded-lg border border-studio-border bg-black/20 text-gray-400 hover:text-studio-accent transition-colors disabled:opacity-20 hover:border-studio-accent/50"
            title="Add Empty Actor"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-3 pb-2 snap-x scrollbar-hide">
        <AnimatePresence initial={false}>
          {actors.length === 0 && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex items-center justify-center w-full py-8 text-center text-xs text-gray-500 bg-black/10 border border-dashed border-studio-border rounded-xl"
            >
              Add an actor or use bulk upload to begin.
            </motion.div>
          )}
          {actors.map((actor, idx) => (
            <motion.div
              key={actor.id}
              layout
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="group relative bg-black/20 border border-studio-border rounded-xl p-4 space-y-4 hover:border-gray-700 transition-colors shrink-0 w-72 snap-center"
            >
              <div className="flex items-start gap-3">
                {/* Portrait Area */}
                <div className="relative w-12 h-12 rounded-lg bg-studio-border shrink-0 overflow-hidden flex items-center justify-center border border-white/5">
                  {actor.imageBase64 ? (
                    <>
                      <img src={actor.imageBase64} alt="Actor" className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleUpdateActor(actor.id, "imageBase64", "")}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-red-400 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(actor.id, e.target.files[0])}
                      />
                      <Camera className="w-5 h-5 text-gray-600 group-hover:text-studio-accent transition-colors" />
                    </>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-gray-600 uppercase">Actor {idx+1}</span>
                    <button
                      onClick={() => handleRemoveActor(actor.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-red-500 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    className="w-full bg-transparent border-none p-0 text-xs font-medium text-white placeholder:text-gray-700 outline-none"
                    placeholder="Name of actor..."
                    value={actor.name}
                    onChange={(e) => handleUpdateActor(actor.id, "name", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <textarea
                  className="w-full bg-black/40 border border-studio-border rounded-lg p-2 text-[11px] outline-none focus:border-studio-accent h-12 resize-none"
                  placeholder="Visual details (outfit, look)..."
                  value={actor.description}
                  onChange={(e) => handleUpdateActor(actor.id, "description", e.target.value)}
                />
                <input
                  className="w-full bg-black/40 border border-studio-border rounded-lg px-2 py-1.5 text-[11px] outline-none focus:border-studio-accent"
                  placeholder="Action/Pose (e.g. sitting on left)"
                  value={actor.pose}
                  onChange={(e) => handleUpdateActor(actor.id, "pose", e.target.value)}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
