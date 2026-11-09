import { getConfig } from "../lib/config";
import { WalletPanel } from "./components/WalletPanel";

export default function Home() {
  const config = getConfig();

  if (!config.ok) {
    return (
      <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
        <div
          role="alert"
          style={{
            padding: "1rem",
            backgroundColor: "#ffebee",
            color: "#c62828",
            borderRadius: "6px",
            fontWeight: "bold",
          }}
        >
          Configuration Error: {config.error}
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>NairaRamp demo</h1>
      <p>Testnet only</p>
      <WalletPanel />
    </main>
  );
}
