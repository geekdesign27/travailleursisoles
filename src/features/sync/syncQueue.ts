// Queue-based sync with exponential backoff and batch processing

import type { Analysis } from "@/types/analysis.schema";
import { syncAnalysis } from "./sheetsService";

const QUEUE_KEY = "app:sync:queue";
const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;
const BATCH_SIZE = 10; // Stay well under Google's 100 req/100s limit

export type SyncOperationType = "upsert" | "delete";

export interface SyncOperation {
  id: string;
  type: SyncOperationType;
  analysisId: string;
  analysis?: Analysis;
  retries: number;
  createdAt: string;
}

export function enqueueSync(
  operation: Omit<SyncOperation, "id" | "retries" | "createdAt">,
): void {
  const queue = getQueue();

  // Remove any existing operation for the same analysis (latest wins)
  const filtered = queue.filter((op) => op.analysisId !== operation.analysisId);

  const newOp: SyncOperation = {
    ...operation,
    id: crypto.randomUUID(),
    retries: 0,
    createdAt: new Date().toISOString(),
  };

  filtered.push(newOp);
  saveQueue(filtered);
}

export function getQueue(): SyncOperation[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SyncOperation[];
  } catch {
    return [];
  }
}

function saveQueue(queue: SyncOperation[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function clearQueue(): void {
  localStorage.removeItem(QUEUE_KEY);
}

export interface ProcessQueueResult {
  processed: number;
  failed: number;
  remaining: number;
}

export async function processQueue(
  spreadsheetId: string,
): Promise<ProcessQueueResult> {
  const queue = getQueue();
  if (queue.length === 0) return { processed: 0, failed: 0, remaining: 0 };

  // Take a batch
  const batch = queue.slice(0, BATCH_SIZE);
  const rest = queue.slice(BATCH_SIZE);

  let processed = 0;
  let failed = 0;
  const retryLater: SyncOperation[] = [];

  for (const op of batch) {
    try {
      if (op.type === "upsert" && op.analysis) {
        await syncAnalysis(spreadsheetId, op.analysis);
      }
      // "delete" operations are not supported in Google Sheets easily
      // so we just remove from queue (row stays in sheet)
      processed++;
    } catch (err) {
      if (op.retries < MAX_RETRIES) {
        retryLater.push({ ...op, retries: op.retries + 1 });
        failed++;
      } else {
        // Dropped after max retries
        console.error(
          `Sync operation ${op.id} dropped after ${MAX_RETRIES} retries:`,
          err,
        );
        failed++;
      }
    }
  }

  // Save remaining + retries back to queue
  saveQueue([...retryLater, ...rest]);

  return {
    processed,
    failed,
    remaining: retryLater.length + rest.length,
  };
}

/**
 * Returns the delay in ms before retrying a failed operation.
 * Uses exponential backoff: 1s, 2s, 4s, 8s, 16s
 */
export function getRetryDelay(retries: number): number {
  return BASE_DELAY_MS * Math.pow(2, retries);
}

export function getQueueSize(): number {
  return getQueue().length;
}
