import React, { useState } from "react";
import { GeneratedNestBoxImage } from "../types";
import {
  Sparkles,
  Image as ImageIcon,
  Download,
  Loader2,
  Maximize2,
  Info,
  Layers,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const SUGGESTED_PROMPTS = [
  {
    title: "Under-Eaves Wooden Swift Box & Audio Lure",
    prompt:
      "A high-quality architectural close-up photograph of a double wooden swift nest box mounted snugly under roof eaves of a Victorian brick terrace house at 5 meters height. A tiny weatherproof acoustic speaker is neatly installed 5cm next to the 65x30mm oval entrance hole. Clean wiring, sunny blue sky.",
  },
  {
    title: "Modern Integrated Swift Bricks on Facade",
    prompt:
      "Contemporary urban apartment building facade made of textured sand-colored brickwork, featuring three seamless flush-mounted swift bricks built into the masonry course near the roofline, with common swifts flying gracefully in the background.",
  },
  {
    title: "Cutaway Architectural Diagram of Swift Box",
    prompt:
      "Detailed architectural cutaway blueprint cross-section diagram of an artificial Common Swift nesting box, showing the entrance tunnel baffle to prevent starling entry, the gentle concave nest hollow in the rear corner, and breathable non-toxic plywood construction.",
  },
  {
    title: "Freestanding Urban Swift Tower",
    prompt:
      "A freestanding architectural swift tower in an urban municipal park, holding 24 artificial nesting chambers with solar panels on top powering an automated dawn/dusk acoustic caller, surrounded by wildflowers.",
  },
];

export const AiNestBoxVisualizer: React.FC = () => {
  const [prompt, setPrompt] = useState<string>(SUGGESTED_PROMPTS[0].prompt);
  const [imageSize, setImageSize] = useState<"512px" | "1K" | "2K" | "4K">("1K");
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [gallery, setGallery] = useState<GeneratedNestBoxImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedNestBoxImage | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          imageSize,
          aspectRatio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Image generation failed.");
      }

      const newImage: GeneratedNestBoxImage = {
        id: `img-${Date.now()}`,
        prompt,
        imageUrl: data.imageUrl,
        imageSize: data.imageSize || imageSize,
        aspectRatio: data.aspectRatio || aspectRatio,
        timestamp: new Date().toLocaleTimeString(),
        description: data.description,
      };

      setGallery((prev) => [newImage, ...prev]);
      setSelectedImage(newImage);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate nest box visual.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (img: GeneratedNestBoxImage) => {
    const link = document.createElement("a");
    link.href = img.imageUrl;
    link.download = `swift-nest-box-${img.imageSize}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="ai-nest-box-visualizer" className="space-y-6">
      {/* Header Info */}
      <div className="bg-slate-900/90 rounded-2xl p-5 sm:p-6 border border-slate-800 text-slate-100 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                AI Visualizer (gemini-3-pro-image-preview)
              </span>
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Swift Nest Box & Speaker Placement Architect
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Generate photorealistic and schematic visualizations of artificial swift boxes, eaves installations, internal chambers, and weatherproof acoustic speaker setups with selectable 1K, 2K, and 4K resolutions.
            </p>
          </div>
        </div>
      </div>

      {/* Main Generator Form */}
      <div className="bg-slate-900/80 rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-sm space-y-4">
        <div>
          <label htmlFor="image-prompt-input" className="block text-xs font-semibold text-slate-200 mb-1.5">
            Describe the Nest Box Setup, Building Architecture, or Speaker Mount:
          </label>
          <textarea
            id="image-prompt-input"
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Under-eaves wooden double swift box with miniature speaker mounted next to entrance hole on north wall..."
            className="w-full p-3 text-xs sm:text-sm rounded-xl border border-slate-700 bg-slate-950 focus:bg-slate-900 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-slate-100"
          />
        </div>

        {/* Quick Suggested Prompts */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 block mb-2">
            Suggested Placement & Architecture Presets:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {SUGGESTED_PROMPTS.map((preset, idx) => (
              <button
                key={idx}
                id={`suggested-prompt-btn-${idx}`}
                onClick={() => setPrompt(preset.prompt)}
                className="text-left p-2.5 rounded-lg border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 bg-slate-950/60 transition-colors text-xs"
              >
                <div className="font-semibold text-slate-200 mb-0.5">
                  {preset.title}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1">
                  {preset.prompt}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Controls: Size affordance (1K, 2K, 4K) & Aspect Ratio */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Image Size Affordance */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Image Resolution (Affordance):
              </label>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {(["1K", "2K", "4K"] as const).map((size) => (
                  <button
                    key={size}
                    id={`size-btn-${size}`}
                    onClick={() => setImageSize(size)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                      imageSize === size
                        ? "bg-emerald-500 text-slate-950 shadow-sm"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Aspect Ratio:
              </label>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {[
                  { label: "1:1 Square", val: "1:1" },
                  { label: "16:9 Landscape", val: "16:9" },
                  { label: "4:3 Classic", val: "4:3" },
                  { label: "3:4 Portrait", val: "3:4" },
                ].map((ar) => (
                  <button
                    key={ar.val}
                    id={`aspect-btn-${ar.val.replace(":", "-")}`}
                    onClick={() => setAspectRatio(ar.val)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                      aspectRatio === ar.val
                        ? "bg-slate-800 text-emerald-400 border border-emerald-500/30"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {ar.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            id="generate-image-submit-btn"
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-2 shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating {imageSize} Visual...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate High-Quality Visual</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Featured / Active Preview */}
      {selectedImage && (
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 text-slate-100 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-sm text-white">
                Generated Architectural Rendering
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                {selectedImage.imageSize} • {selectedImage.aspectRatio}
              </span>
            </div>
            <button
              id="download-rendered-image-btn"
              onClick={() => handleDownload(selectedImage)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {selectedImage.imageSize} Image</span>
            </button>
          </div>

          <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center max-h-[550px]">
            <img
              src={selectedImage.imageUrl}
              alt="Generated Swift Box Setup"
              referrerPolicy="no-referrer"
              className="max-h-[550px] w-auto object-contain rounded-lg"
            />
          </div>

          <p className="text-xs text-slate-400 mt-3 italic">
            "{selectedImage.prompt}"
          </p>
        </div>
      )}

      {/* Gallery Grid */}
      {gallery.length > 0 && (
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-100 mb-3">
            Design Gallery ({gallery.length} renderings)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {gallery.map((img) => (
              <div
                key={img.id}
                onClick={() => setSelectedImage(img)}
                className={`relative rounded-xl overflow-hidden border cursor-pointer group transition-all ${
                  selectedImage?.id === img.id
                    ? "ring-2 ring-emerald-500 border-emerald-500"
                    : "border-slate-800 hover:border-slate-600"
                }`}
              >
                <img
                  src={img.imageUrl}
                  alt="Thumbnail"
                  referrerPolicy="no-referrer"
                  className="w-full h-32 object-cover"
                />
                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center text-white text-[10px]">
                  <span className="line-clamp-2">{img.prompt}</span>
                </div>
                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-950/90 text-emerald-400 text-[9px] font-mono border border-slate-800">
                  {img.imageSize}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
