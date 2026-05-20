import { useState } from "react";
import "./header.css";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="logo-section">

        <div className="logo-text">
          <h1 className="logo-title">PipeGen</h1>
          <p className="logo-subtitle">
            AI Pipeline Generator
          </p>
        </div>
      </div>

      <nav className={menuOpen ? "nav active" : "nav"}>
        <a href="/">Home</a>
        <a href="/">Solutions</a>
        <a href="/">Features</a>
        <a href="/">Developers</a>
        <a href="/">Pricing</a>
        <a href="/">Contact</a>

        <button className="mobile-btn">Get Started</button>
      </nav>

      <div className="right-section">

        <button className="start-btn">Get Started</button>

        <div className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✕" : "☰"}
        </div>
      </div>
    </header>
  );
}

export default Header;