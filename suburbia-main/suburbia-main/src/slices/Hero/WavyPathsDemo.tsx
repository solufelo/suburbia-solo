"use client";

import { useState } from "react";
import { WavyPaths } from "./WavyPaths";
import { AdvancedWavyPaths } from "./AdvancedWavyPaths";

interface DemoConfig {
  name: string;
  component: React.ComponentType<any>;
  props: any;
  description: string;
}

const demoConfigs: DemoConfig[] = [
  {
    name: "Basic Wavy Paths",
    component: WavyPaths,
    props: {
      speed: 1,
      intensity: 1,
      colors: ["#6B7280", "#9CA3AF", "#D1D5DB"],
      interactive: true,
      pulseEffect: true,
    },
    description: "Standard wavy paths with basic animations and hover effects"
  },
  {
    name: "Fast & Intense",
    component: WavyPaths,
    props: {
      speed: 2,
      intensity: 1.5,
      colors: ["#EF4444", "#F97316", "#EAB308"],
      interactive: true,
      pulseEffect: true,
    },
    description: "High-speed animation with intense visual effects"
  },
  {
    name: "Subtle & Slow",
    component: WavyPaths,
    props: {
      speed: 0.5,
      intensity: 0.5,
      colors: ["#6B7280", "#9CA3AF"],
      interactive: false,
      pulseEffect: false,
    },
    description: "Gentle, slow animation perfect for background elements"
  },
  {
    name: "Advanced Morphing",
    component: AdvancedWavyPaths,
    props: {
      speed: 1.2,
      intensity: 1,
      colors: ["#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE"],
      interactive: true,
      morphing: true,
      particleCount: 12,
      waveAmplitude: 25,
      waveFrequency: 0.03,
    },
    description: "Advanced morphing paths with dynamic wave generation"
  },
  {
    name: "Minimal Particles",
    component: AdvancedWavyPaths,
    props: {
      speed: 1,
      intensity: 0.8,
      colors: ["#10B981", "#34D399", "#6EE7B7"],
      interactive: true,
      morphing: false,
      particleCount: 4,
      waveAmplitude: 15,
      waveFrequency: 0.02,
    },
    description: "Clean design with minimal particle effects"
  },
  {
    name: "High Energy",
    component: AdvancedWavyPaths,
    props: {
      speed: 2.5,
      intensity: 2,
      colors: ["#F59E0B", "#FBBF24", "#FCD34D", "#FDE68A"],
      interactive: true,
      morphing: true,
      particleCount: 16,
      waveAmplitude: 30,
      waveFrequency: 0.04,
    },
    description: "High-energy animation with maximum visual impact"
  }
];

export function WavyPathsDemo() {
  const [selectedDemo, setSelectedDemo] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentConfig = demoConfigs[selectedDemo];
  const CurrentComponent = currentConfig.component;

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-zinc-800 mb-4">
          Animated Wavy Paths Demo
        </h2>
        <p className="text-zinc-600 mb-6">
          Explore different variations of animated wavy paths with customizable effects.
        </p>
      </div>

      {/* Demo Selector */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {demoConfigs.map((config, index) => (
            <button
              key={index}
              onClick={() => setSelectedDemo(index)}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                selectedDemo === index
                  ? 'border-brand-purple bg-brand-purple/10'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <h3 className="font-semibold text-zinc-800 mb-2">
                {config.name}
              </h3>
              <p className="text-sm text-zinc-600">
                {config.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Fullscreen Toggle */}
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-xl font-semibold text-zinc-800">
          {currentConfig.name}
        </h3>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition-colors"
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
      </div>

      {/* Demo Display */}
      <div className={`bg-zinc-50 rounded-lg p-8 ${isFullscreen ? 'min-h-screen' : 'min-h-[400px]'} flex items-center justify-center`}>
        <div className={`${isFullscreen ? 'scale-150' : 'scale-100'} transition-transform duration-300`}>
          <CurrentComponent {...currentConfig.props} />
        </div>
      </div>

      {/* Configuration Display */}
      <div className="mt-8 p-6 bg-zinc-100 rounded-lg">
        <h4 className="font-semibold text-zinc-800 mb-4">Current Configuration:</h4>
        <pre className="text-sm text-zinc-700 bg-white p-4 rounded border overflow-x-auto">
          {JSON.stringify(currentConfig.props, null, 2)}
        </pre>
      </div>

      {/* Usage Instructions */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-4">Usage Instructions:</h4>
        <ul className="text-sm text-blue-700 space-y-2">
          <li>• <strong>Hover</strong> over the paths to see interactive effects</li>
          <li>• <strong>Move your mouse</strong> to see particle following effects (in interactive modes)</li>
          <li>• <strong>Click different demos</strong> to see various animation styles</li>
          <li>• <strong>Use fullscreen mode</strong> for better viewing of detailed animations</li>
        </ul>
      </div>
    </div>
  );
}
