import { describe, it, expect, beforeEach, vi } from "vitest";
import type { Analysis } from "@/types/analysis.schema";
import {
  enqueueSync,
  getQueue,
  clearQueue,
  processQueue,
  getRetryDelay,
  getQueueSize,
} from "./syncQueue";

// Mock sheetsService — no actual Google API calls
vi.mock("./sheetsService", () => ({
  syncAnalysis: vi.fn(),
}));

import { syncAnalysis } from "./sheetsService";
const mockSyncAnalysis = vi.mocked(syncAnalysis);

const fakeAnalysis: Analysis = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  entreprise: "Test SA",
  departement: "",
  responsable: "PA",
  titre_activite: "Test activité",
  description: "",
  nombre_personnes: 1,
  periode_travail: "jour",
  frequence_activite: "quotidienne",
  status: "draft",
  currentStep: 1,
  currentLevel: 0,
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
};

describe("syncQueue", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("enqueueSync", () => {
    it("adds an operation to the queue", () => {
      enqueueSync({
        type: "upsert",
        analysisId: fakeAnalysis.id,
        analysis: fakeAnalysis,
      });

      const queue = getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].analysisId).toBe(fakeAnalysis.id);
      expect(queue[0].type).toBe("upsert");
      expect(queue[0].retries).toBe(0);
    });

    it("replaces existing operation for same analysis (latest wins)", () => {
      const updated = { ...fakeAnalysis, entreprise: "Updated SA" };

      enqueueSync({
        type: "upsert",
        analysisId: fakeAnalysis.id,
        analysis: fakeAnalysis,
      });
      enqueueSync({
        type: "upsert",
        analysisId: fakeAnalysis.id,
        analysis: updated,
      });

      const queue = getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].analysis!.entreprise).toBe("Updated SA");
    });

    it("keeps different analyses separate", () => {
      enqueueSync({
        type: "upsert",
        analysisId: "id-1",
        analysis: { ...fakeAnalysis, id: "id-1" },
      });
      enqueueSync({
        type: "upsert",
        analysisId: "id-2",
        analysis: { ...fakeAnalysis, id: "id-2" },
      });

      expect(getQueue()).toHaveLength(2);
    });
  });

  describe("clearQueue", () => {
    it("empties the queue", () => {
      enqueueSync({
        type: "upsert",
        analysisId: fakeAnalysis.id,
        analysis: fakeAnalysis,
      });
      expect(getQueueSize()).toBe(1);

      clearQueue();
      expect(getQueueSize()).toBe(0);
    });
  });

  describe("processQueue", () => {
    it("processes all items and clears them on success", async () => {
      mockSyncAnalysis.mockResolvedValue(undefined);

      enqueueSync({
        type: "upsert",
        analysisId: fakeAnalysis.id,
        analysis: fakeAnalysis,
      });

      const result = await processQueue("fake-token", "fake-spreadsheet-id");

      expect(result.processed).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.remaining).toBe(0);
      expect(getQueueSize()).toBe(0);
      expect(mockSyncAnalysis).toHaveBeenCalledWith(
        "fake-token",
        "fake-spreadsheet-id",
        fakeAnalysis,
      );
    });

    it("retries failed operations", async () => {
      mockSyncAnalysis.mockRejectedValue(new Error("Network error"));

      enqueueSync({
        type: "upsert",
        analysisId: fakeAnalysis.id,
        analysis: fakeAnalysis,
      });

      const result = await processQueue("fake-token", "fake-spreadsheet-id");

      expect(result.processed).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.remaining).toBe(1);

      // Operation should still be in queue with incremented retries
      const queue = getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].retries).toBe(1);
    });

    it("drops operations after max retries", async () => {
      mockSyncAnalysis.mockRejectedValue(new Error("Persistent error"));

      // Manually set retries to max - 1
      enqueueSync({
        type: "upsert",
        analysisId: fakeAnalysis.id,
        analysis: fakeAnalysis,
      });

      const queue = getQueue();
      queue[0].retries = 5; // MAX_RETRIES
      localStorage.setItem("app:sync:queue", JSON.stringify(queue));

      const result = await processQueue("fake-token", "fake-spreadsheet-id");

      expect(result.failed).toBe(1);
      expect(result.remaining).toBe(0); // Dropped, not retried
    });

    it("returns zero counts for empty queue", async () => {
      const result = await processQueue("fake-token", "fake-spreadsheet-id");

      expect(result.processed).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.remaining).toBe(0);
    });
  });

  describe("getRetryDelay", () => {
    it("returns exponential backoff delays", () => {
      expect(getRetryDelay(0)).toBe(1000);
      expect(getRetryDelay(1)).toBe(2000);
      expect(getRetryDelay(2)).toBe(4000);
      expect(getRetryDelay(3)).toBe(8000);
      expect(getRetryDelay(4)).toBe(16000);
    });
  });
});
