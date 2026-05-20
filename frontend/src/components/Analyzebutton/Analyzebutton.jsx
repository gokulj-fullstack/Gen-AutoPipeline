import { useState } from "react";
import axios from "axios";

const API_URL = "https://gen-autopipeline.onrender.com";

export default function AnalyzeButton({ setCurrentStep, githubUrl }) {
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/generate-pipeline/`,
        {
          github_url: githubUrl,
          framework: "React",
          deployment: "Kubernetes",
        }
      );

      console.log(response.data);

      setLoading(false);

      setCurrentStep(2);

    } catch (error) {
      console.error("API Error:", error);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAnalyze}
      disabled={loading}
      className="px-6 py-3 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] transition-all duration-300 text-white font-semibold shadow-lg"
    >
      {loading ? "Analyzing Project..." : "Analyze"}
    </button>
  );
}
