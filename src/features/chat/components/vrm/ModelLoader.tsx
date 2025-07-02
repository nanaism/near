"use client";

import { Html } from "@react-three/drei";
import { Sparkles } from "lucide-react";

export const ModelLoader = () => {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center text-center w-64">
        <div className="relative w-32 h-32 flex items-center justify-center animate-pulse">
          <Sparkles className="w-24 h-24 text-pink-300 opacity-80" />
        </div>
        <p
          className={`mt-4 text-lg font-bold text-gray-700 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full shadow-lg`}
        >
          ニアがくるのを待っててね…
        </p>
      </div>
    </Html>
  );
};
