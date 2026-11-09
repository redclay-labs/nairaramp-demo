import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Home from "../app/page";

describe("Home page", () => {
  it("renders NairaRamp demo heading and Testnet only notice", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { name: "NairaRamp demo" })).toBeDefined();
    expect(screen.getByText("Testnet only")).toBeDefined();
  });
});
