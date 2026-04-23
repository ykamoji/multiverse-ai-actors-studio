import { useState } from "react";
import { generateSceneImage } from "./services/imageService";
import { Actor } from "./types";
import Sidebar from "./components/Sidebar";
import Actors from "./components/Actors";
import MainView from "./components/MainView";

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function App() {
  const [sceneDescription, setSceneDescription] = useState("");
  const [actors, setActors] = useState<Actor[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [selectedModel, setSelectedModel] = useState("gemini-2.5-flash-image");

  const MAX_ACTORS = 14;

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
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setActors(prev => prev.map(actor => {
        if (actor.id === id) {
          return {
            ...actor,
            imageBase64: reader.result as string,
            // Only prefill name if it's currently empty
            name: actor.name.trim() === "" ? fileNameWithoutExt : actor.name 
          };
        }
        return actor;
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleBulkImageUpload = async (files: FileList) => {
    const spaceLeft = MAX_ACTORS - actors.length;
    if (spaceLeft <= 0) return;

    const filesArray = Array.from(files).slice(0, spaceLeft);
    const newActors: Actor[] = [];

    for (const file of filesArray) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");

      newActors.push({
        id: Math.random().toString(36).substring(2, 9),
        name: fileNameWithoutExt,
        description: "",
        pose: "",
        imageBase64: base64
      });
    }

    setActors(prev => [...prev, ...newActors]);
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
    
    const invalidActors = actors.filter(a => !a.description.trim() && !a.imageBase64);
    if (invalidActors.length > 0) {
      setError("Please provide a description or a portrait for all actors.");
      return;
    }

    const isPremiumModel = selectedModel === "gemini-3-pro-image-preview" || 
                           selectedModel === "gemini-3.1-flash-image-preview" || 
                           selectedModel === "imagen-4.0-generate-001";

    if (isPremiumModel && window.aistudio) {
      try {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
          // We don't await hasSelectedApiKey again immediately to avoid race conditions.
        }
      } catch (err) {
        setError("Failed to initialize API key selection. Please ensure you select a key from a paid Google Cloud project.");
        return;
      }
    }

    setIsGenerating(true);
    setError(null);

    try {
      const imageUrl = await generateSceneImage(sceneDescription, actors, aspectRatio, selectedModel);
      setGeneratedImage(imageUrl);
    } catch (err: any) {
      const message = err.message || "";
      if (message.includes("429") || message.includes("RESOURCE_EXHAUSTED") || message.includes("Quota exceeded")) {
        setError(`Quota exceeded for ${selectedModel}. Please try selecting a different image model from the dropdown above.`);
      } else if (message.includes("403") || message.includes("PERMISSION_DENIED") || message.includes("Requested entity was not found")) {
        setError("API key lacks permission or billing is not enabled. Please select an API key from a paid Google Cloud project (ai.google.dev/gemini-api/docs/billing).");
        if (isPremiumModel && window.aistudio) {
          // Re-trigger the selection prompt to fix the permission issue
          window.aistudio.openSelectKey().catch(console.error);
        }
      } else {
        setError(message || "Failed to generate image.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen bg-studio-bg overflow-hidden text-gray-200">
      <Sidebar
        sceneDescription={sceneDescription}
        setSceneDescription={setSceneDescription}
        aspectRatio={aspectRatio}
        setAspectRatio={setAspectRatio}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        error={error}
        isGenerating={isGenerating}
        handleGenerate={handleGenerate}
      >
        <Actors
          actors={actors}
          maxActors={MAX_ACTORS}
          handleAddActor={handleAddActor}
          handleRemoveActor={handleRemoveActor}
          handleUpdateActor={handleUpdateActor}
          handleImageUpload={handleImageUpload}
          handleBulkImageUpload={handleBulkImageUpload}
        />
      </Sidebar>

      <MainView
        aspectRatio={aspectRatio}
        isGenerating={isGenerating}
        generatedImage={generatedImage}
        handleDownload={handleDownload}
        selectedModel={selectedModel}
      />
    </div>
  );
}
