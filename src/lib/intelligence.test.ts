import { describe, expect, it } from "vitest";
import { confidenceFromStatus, learningStatus } from "@/lib/intelligence";

describe("confidenceFromStatus", () => {
  it("never elevates AI output into evidence", () => {
    expect(confidenceFromStatus("AI_GENERATED", 1000)).toBe("UNVERIFIED");
  });

  it("uses observed sample size conservatively", () => {
    expect(confidenceFromStatus("OBSERVED", 3)).toBe("LOW");
    expect(confidenceFromStatus("OBSERVED", 10)).toBe("HIGH");
  });
});

describe("learningStatus", () => {
  it("promotes only after repeated observations", () => {
    expect(learningStatus("HYPOTHESIS", 2)).toBe("HYPOTHESIS");
    expect(learningStatus("HYPOTHESIS", 3)).toBe("SUPPORTED");
    expect(learningStatus("SUPPORTED", 8)).toBe("CONSOLIDATED");
  });

  it("keeps rejected learning rejected", () => {
    expect(learningStatus("REJECTED", 20)).toBe("REJECTED");
  });
});