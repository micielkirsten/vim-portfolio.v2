import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "../styles.css";

class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }

  static getDerivedStateFromError(err) {
    return { err };
  }

  componentDidCatch(err) {
    console.error("App render error:", err);
  }

  render() {
    if (!this.state.err) {
      return this.props.children;
    }

    return (
      <pre style={{ margin: 0, padding: 16, color: "#fff", background: "#111", minHeight: "100vh" }}>
        {`App failed to render.\n\n${String(this.state.err?.message || this.state.err)}`}
      </pre>
    );
  }
}

const root = createRoot(document.getElementById("root"));
root.render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);
