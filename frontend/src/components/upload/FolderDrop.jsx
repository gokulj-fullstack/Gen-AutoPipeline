import { useRef, useState } from "react";

function FolderDrop({ onAnalyze }) {
  const [dragOver, setDragOver]           = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState(null);
  const fileInputRef = useRef(null);

  const formatSize = (bytes) =>
    bytes > 1048576
      ? (bytes / 1048576).toFixed(1) + " MB"
      : (bytes / 1024).toFixed(0) + " KB";

  const totalSize = uploadedFiles
    ? uploadedFiles.reduce((a, f) => a + f.size, 0)
    : 0;

  const handleDragOver  = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = ()  => setDragOver(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) setUploadedFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) setUploadedFiles(files);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setUploadedFiles(null);
    fileInputRef.current.value = "";
  };

  const handleAnalyze = () => {
    if (!uploadedFiles) return;
    onAnalyze({
      source: "folder",
      files: uploadedFiles,
      filesScanned: uploadedFiles.length,
      technologies: ["React.js", "Node.js 18", "Docker", "MongoDB"],
      stages: [
        { name: "Checkout & Install", desc: "npm ci",           time: "~30s"  },
        { name: "Lint",               desc: "npm run lint",     time: "~20s"  },
        { name: "Test",               desc: "npm test",         time: "~60s"  },
        { name: "Build",              desc: "npm run build",    time: "~90s"  },
        { name: "Docker Build & Push",desc: "push to ghcr.io", time: "~2min" },
      ],
    });
  };

  return (
    <div className="folder-drop-wrapper">
      <div
        className={`drag-box ${dragOver ? "drag-over" : ""} ${uploadedFiles ? "has-files" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploadedFiles && fileInputRef.current.click()}
      >
        {!uploadedFiles ? (
          <>
            <div className="drag-icon">⊞</div>
            <h3>Drag & Drop Project Folder</h3>
            <p>Upload your complete project folder</p>
            <button
              className="browse-btn"
              onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
            >
              Browse files
            </button>
          </>
        ) : (
          <div className="file-preview">
            <div className="file-icon-wrap">⊞</div>
            <div className="file-info">
              <span className="file-name">
                {uploadedFiles.length} file{uploadedFiles.length > 1 ? "s" : ""} selected
              </span>
              <span className="file-meta">
                {formatSize(totalSize)} —{" "}
                {uploadedFiles.slice(0, 2).map((f) => f.name).join(", ")}
                {uploadedFiles.length > 2 && ` +${uploadedFiles.length - 2} more`}
              </span>
            </div>
            <button className="remove-btn" onClick={handleRemove}>✕ Remove</button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />
      </div>

      {uploadedFiles && (
        <button className="analyze-btn" onClick={handleAnalyze}>
           Analyze Folder
        </button>
      )}
    </div>
  );
}

export default FolderDrop;
