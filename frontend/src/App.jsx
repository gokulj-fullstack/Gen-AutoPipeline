import { useState } from "react";

import Header from "./components/header/header";
import Dashboard from "./components/dashboard/dashboard";
import ConfigurePipelinePage from "./components/configure/ConfigurePipelinePage";
import GeneratePipelinePage from "./components/GeneratePipelinePage/GeneratePipelinePage";
import CustomizePipeline from "./components/CustomizePipeline/CustomizePipeline";
import DotField from "./components/Dotfield/Dotfield";
import ImplementationPlan from "./components/ImplementationPlan/ImplementationPlan";
import DeployGithub from "./components/DeployGithub/DeployGithub";

import "./App.css";

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [generatedPipeline, setGeneratedPipeline] = useState("");

  // ✅ Secure token from .env
  const githubToken = import.meta.env.VITE_GITHUB_TOKEN || "";

  return (
    <div className="app-layout">
      <div className="global-dot-background">
        <DotField
          dotRadius={1.8}
          dotSpacing={16}
          bulgeStrength={80}
          glowRadius={220}
          sparkle={true}
          waveAmplitude={1.5}
          cursorRadius={550}
          cursorForce={0.15}
          bulgeOnly
          gradientFrom="rgba(99,102,241,0.45)"
          gradientTo="rgba(168,85,247,0.30)"
          glowColor="#6366f1"
        />
      </div>

      <main
        className={`main-content ${currentStep === 1 ? "dashboard-mode" : ""
          }`}
      >
        <Header />

        <div className="page-content">
          {currentStep === 1 && (
            <Dashboard setCurrentStep={setCurrentStep} />
          )}

          {currentStep === 2 && (
            <ConfigurePipelinePage
              setCurrentStep={setCurrentStep}
              setGeneratedPipeline={setGeneratedPipeline}
            />
          )}

          {currentStep === 3 && (
            <GeneratePipelinePage
              setCurrentStep={setCurrentStep}
              generatedPipeline={generatedPipeline}
            />
          )}

          {currentStep === 4 && (
            <CustomizePipeline setCurrentStep={setCurrentStep} />
          )}

          {currentStep === 5 && (
            <ImplementationPlan setCurrentStep={setCurrentStep} />
          )}

          {currentStep === 6 && (
            <DeployGithub
              setCurrentStep={setCurrentStep}
              generatedPipeline={generatedPipeline}
              githubToken={githubToken}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;