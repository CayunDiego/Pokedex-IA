
"use client";

// Removed Button import as it's no longer used for "Identify Pokémon"
// import { Button } from "@/components/ui/button";
import { CameraFeed } from "./CameraFeed";
// Removed Sparkles icon import
// import { Sparkles as Sparkles_icon } from "lucide-react"; 

interface CapturePanelProps {
  onImageCapture: (dataUri: string) => void;
  // onIdentify prop removed
  capturedImageUri: string | null;
  clearCapturedImage: () => void;
  isLoading: boolean;
}

export function CapturePanel({ onImageCapture, capturedImageUri, clearCapturedImage, isLoading }: CapturePanelProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-between">
      <div className="w-full flex-grow rounded-md overflow-hidden mb-2">
        <CameraFeed 
          onCapture={onImageCapture} 
          capturedImageUri={capturedImageUri}
          clearCapturedImage={clearCapturedImage}
          isProcessing={isLoading}
        />
      </div>
      {/* "Identify Pokémon" button removed */}
    </div>
  );
}
