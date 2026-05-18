import { useState } from "react";
import GithubInput from "./GithubInput";
import FolderDrop from "./FolderDrop";
import PasteStructure from "./PasteStructure";
import "./upload.css";

function UploadTabs({ onAnalyze }) {
  const [activeTab, setActiveTab] = useState("github");

  const tabs = [
    { id: "github",    label: "⌥ GitHub URL" },
    { id: "folder",    label: "⊞ Upload Folder" },
    { id: "structure", label: "⊟ Paste Structure" },
  ];

  return (
    <div className="upload-tabs-wrapper">
      <div className="upload-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={activeTab === tab.id ? "tab active-tab" : "tab"}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="upload-tab-content">
        {activeTab === "github"    && <GithubInput    onAnalyze={onAnalyze} />}
        {activeTab === "folder"    && <FolderDrop     onAnalyze={onAnalyze} />}
        {activeTab === "structure" && <PasteStructure onAnalyze={onAnalyze} />}
      </div>
    </div>
  );
}

export default UploadTabs;
