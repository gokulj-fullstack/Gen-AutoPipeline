import "./CompanyIntro.css";
import tsklogo from "../../assets/tsklogo.jpeg";

function CompanyIntro() {
  return (
    <div className="company-sidebar">

      {/* HEADER */}
      <div className="company-header">

        <img
          src={tsklogo}
          alt="TSK Logo"
          className="company-image"
        />

        <div className="company-name-group">

          <h1>TSK Automations</h1>

          <h2 className="product-title">
            AI Pipeline Generator
          </h2>

        </div>

      </div>

      {/* DESCRIPTION */}
      <p className="company-tagline">
        Smart AI-powered platform for generating modern CI/CD pipelines,
        deployment workflows, and DevOps automation instantly.
      </p>

      {/* DIVIDER */}
      <div className="company-divider"></div>

      {/* FEATURES */}
      <div className="company-features">

        <div className="feature-card">
          <p>Automated pipeline generation</p>
        </div>

        <div className="feature-card">
          <p>Instant DevOps workflow setup</p>
        </div>

        <div className="feature-card">
          <p>AI-based deployment optimization</p>
        </div>

      </div>

    </div>
  );
}

export default CompanyIntro;