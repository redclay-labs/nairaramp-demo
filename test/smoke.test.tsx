import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import Home from "../app/page";

describe("Home page", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    cleanup();
    process.env = originalEnv;
  });

  it("renders NairaRamp demo heading, Testnet only notice, and WalletPanel when config is valid", () => {
    process.env.NEXT_PUBLIC_STELLAR_NETWORK = "testnet";
    process.env.NEXT_PUBLIC_NAIRARAMP_ANCHOR_ID = "sdf-testanchor";

    render(<Home />);

    expect(screen.getByRole("heading", { name: "NairaRamp demo" })).toBeDefined();
    expect(screen.getByText("Testnet only")).toBeDefined();
    expect(screen.getByRole("region", { name: "Wallet Connection" })).toBeDefined();
  });

  it("shows configuration error and nothing else when config is invalid", () => {
    process.env.NEXT_PUBLIC_STELLAR_NETWORK = "mainnet";
    process.env.NEXT_PUBLIC_NAIRARAMP_ANCHOR_ID = "sdf-testanchor";

    render(<Home />);

    expect(screen.getByRole("alert")).toBeDefined();
    expect(screen.getByText(/Configuration Error:/i)).toBeDefined();
    expect(screen.queryByRole("heading", { name: "NairaRamp demo" })).toBeNull();
    expect(screen.queryByRole("region", { name: "Wallet Connection" })).toBeNull();
  });
});
