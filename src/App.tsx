import { useState } from "react";
import { Plus, Trash2, Image as ImageIcon, Wand2, Loader2, Info, Download, Camera, X } from "lucide-react";
import { generateSceneImage } from "./services/imageService";
import { motion, AnimatePresence } from "motion/react";

interface Actor {
  id: string;
  name: string;
  description: string;
  pose: string;
  imageBase64?: string;
}

export default function App() {
  const [sceneDescription, setSceneDescription] = useState("");
  const [actors, setActors] = useState<Actor[]>([
    { id: "1", name: "", description: "", pose: "" }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState("16:9");

  const MAX_ACTORS = 10;

  const handleAddActor = () => {
    if (actors.length < MAX_ACTORS) {
      const newActor: Actor = {
        id: Math.random().toString(36).substring(2, 9),
        name: "",
        description: "",
        pose: "",
      };
      setActors([...actors, newActor]);
    }
  };

  const handleRemoveActor = (id: string) => {
    setActors(actors.filter(actor => actor.id !== id));
  };

  const handleUpdateActor = (id: string, field: keyof Actor, value: string) => {
    setActors(
      actors.map(actor => (actor.id === id ? { ...actor, [field]: value } : actor))
    );
  };

  const handleImageUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      handleUpdateActor(id, "imageBase64", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `multiverse-scene-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerate = async () => {
    if (!sceneDescription.trim() && actors.length === 0) {
      setError("Please provide a scene description or at least one actor.");
      return;
    }
    
    // Check if actors have either a description or an image
    const invalidActors = actors.filter(a => !a.description.trim() && !a.imageBase64);
    if (invalidActors.length > 0) {
      setError("Please provide a description or a portrait for all actors.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const imageUrl = await generateSceneImage(sceneDescription, actors, aspectRatio);
      setGeneratedImage(imageUrl);
    } catch (err: any) {
      setError(err.message || "Failed to generate image.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-6 md:p-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Multiverse Studio</h1>
            <p className="text-gray-500">Create a unified scene with multiple AI actors.</p>
          </div>

          {/* Scene Setting */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Scene Setting</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overall Scene Description
                </label>
                <textarea
                  className="w-full rounded-xl border-gray-200 bg-gray-50 p-4 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm mb-1 resize-none h-32"
                  placeholder="e.g. A bustling futuristic market at neon dusk, raining softly."
                  value={sceneDescription}
                  onChange={(e) => setSceneDescription(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aspect Ratio
                </label>
                <div className="flex gap-2">
                  {["1:1", "16:9", "4:3", "9:16", "3:4"].map(ratio => (
                    <button
                      key={ratio}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        aspectRatio === ratio
                          ? "bg-blue-100 text-blue-700 border border-blue-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
                      }`}
                      onClick={() => setAspectRatio(ratio)}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actors Setup */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                Actors <span className="text-sm font-normal text-gray-400">({actors.length}/{MAX_ACTORS})</span>
              </h2>
              {actors.length < MAX_ACTORS && (
                <button
                  onClick={handleAddActor}
                  className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg"
                >
                  <Plus className="w-4 h-4" /> Add Actor
                </button>
              )}
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 -mr-2">
              <AnimatePresence>
                {actors.map((actor, index) => (
                  <motion.div
                    key={actor.id}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm text-gray-700">Actor {index + 1}</h3>
                      <button
                        onClick={() => handleRemoveActor(actor.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Remove actor"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex gap-4">
                      {/* Portrait Upload */}
                      <div className="flex-shrink-0">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Portrait</label>
                        <div className="relative w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 bg-white flex items-center justify-center overflow-hidden hover:border-blue-400 transition-colors cursor-pointer group">
                          {actor.imageBase64 ? (
                            <>
                              <img src={actor.imageBase64} alt="Portrait" className="w-full h-full object-cover" />
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleUpdateActor(actor.id, "imageBase64", "");
                                }}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                              >
                                <X className="w-5 h-5 text-white" />
                              </button>
                            </>
                          ) : (
                            <>
                              <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                onChange={(e) => {
                                  if (e.target.files?.[0]) handleImageUpload(actor.id, e.target.files[0]);
                                }}
                              />
                              <Camera className="w-6 h-6 text-gray-300" />
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actor Details */}
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          placeholder="Name / Identifier (optional)"
                          className="w-full rounded-lg border-gray-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          value={actor.name}
                          onChange={(e) => handleUpdateActor(actor.id, "name", e.target.value)}
                        />
                        
                        <textarea
                          placeholder="Visual description (if no photo) *"
                          className="w-full rounded-lg border-gray-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none h-16"
                          value={actor.description}
                          onChange={(e) => handleUpdateActor(actor.id, "description", e.target.value)}
                        />
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Pose or Action in scene (e.g. 'Standing left, waving')"
                      className="w-full rounded-lg border-gray-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      value={actor.pose}
                      onChange={(e) => handleUpdateActor(actor.id, "pose", e.target.value)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              {actors.length === 0 && (
                <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-xl">
                  No actors added. The scene will be empty.
                </div>
              )}
            </div>
            
            <div className="mt-6 flex flex-col gap-3">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-start gap-2">
                   <Info className="w-4 h-4 mt-0.5 shrink-0" />
                   {error}
                </div>
              )}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors py-4 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Scene...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-5 h-5" />
                    Generate Scene
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 h-full min-h-[500px] flex flex-col">
            <div className="h-full rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 relative">
              {isGenerating ? (
                <div className="flex flex-col items-center text-gray-400 space-y-4">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin absolute inset-0"></div>
                  </div>
                  <p className="text-sm font-medium animate-pulse">Composing your multiverse...</p>
                </div>
              ) : generatedImage ? (
                <>
                  <img
                    src={generatedImage}
                    alt="Generated Scene"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={handleDownload}
                    className="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg backdrop-blur-sm transition-all hover:scale-105 group"
                    title="Download Image"
                  >
                    <Download className="w-5 h-5 group-hover:text-blue-600 transition-colors" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center text-gray-400 space-y-3">
                  <ImageIcon className="w-12 h-12 opacity-50" />
                  <p className="text-sm">Your generated scene will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
