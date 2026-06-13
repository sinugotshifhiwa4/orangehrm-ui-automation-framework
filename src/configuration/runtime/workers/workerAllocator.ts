import * as os from "os";
import type { AllocatorPercentage } from "./types/workerAllocator.type.js";
import ErrorHandler from "../../../utils/errorHandling/errorHandler.js";

export default class WorkerAllocator {
  private static readonly totalCores = os.cpus().length;

  private static readonly MIN_WORKERS = 1;

  /**
   * Optimal worker count for the current environment.
   * Uses sharding in CI or the provided local percentage otherwise.
   */
  public static getOptimalWorkerCount(localPercentage: AllocatorPercentage): number {
    return this.shardingEnabled
      ? this.getWorkersForCIShard()
      : this.getWorkersForLocalPercentage(localPercentage);
  }

  /**
   * Whether sharding is enabled for the current test run.
   */
  private static get shardingEnabled(): boolean {
    return !!(process.env.SHARD_INDEX && process.env.SHARD_TOTAL);
  }

  /**
   * Determines the worker count assigned to the current CI shard.
   */
  private static getWorkersForCIShard(): number {
    const shardTotal = parseInt(process.env.SHARD_TOTAL || "1", 10);
    const shardIndex = parseInt(process.env.SHARD_INDEX || "1", 10);

    this.validateShardConfig(shardIndex, shardTotal);

    return Math.max(this.MIN_WORKERS, this.calculateShardWorkers(shardIndex, shardTotal));
  }

  /**
   * Validates shard index and total values from the runtime environment.
   * @param shardIndex - One-based index of the current shard
   * @param shardTotal - Total number of configured shards
   */
  private static validateShardConfig(shardIndex: number, shardTotal: number): void {
    if (shardTotal < 1) {
      ErrorHandler.logAndThrow(
        "WorkerAllocator",
        `Invalid shard config: SHARD_TOTAL must be at least 1, got ${shardTotal}.`,
      );
    }

    if (shardIndex < 1 || shardIndex > shardTotal) {
      ErrorHandler.logAndThrow(
        "WorkerAllocator",
        `Invalid shard config: SHARD_INDEX (${shardIndex}) must be between 1 and SHARD_TOTAL (${shardTotal}).`,
      );
    }
  }

  /**
   * Calculates the number of workers allocated to a specific shard.
   * @param shardIndex - One-based index of the current shard
   * @param shardTotal - Total number of configured shards
   * @returns The worker count assigned to the shard
   */
  private static calculateShardWorkers(shardIndex: number, shardTotal: number): number {
    const baseWorkersPerShard = Math.floor(this.totalCores / shardTotal);
    const remainingCores = this.totalCores % shardTotal;
    const zeroBasedIndex = shardIndex - 1;

    return zeroBasedIndex < remainingCores
      ? baseWorkersPerShard + 1
      : baseWorkersPerShard;
  }

  /**
   * Parses and validates the worker percentage from the runtime environment.
   */
  public static resolveWorkerPercentage(
    envValue: string | undefined,
    defaultPercentage: AllocatorPercentage = 10,
  ): AllocatorPercentage {
    if (!envValue) {
      return defaultPercentage;
    }

    const parsedPercentage = Number.parseInt(envValue, 10);

    if (this.isValidPercentage(parsedPercentage)) {
      return parsedPercentage;
    }

    return ErrorHandler.logAndThrow(
      "WorkerAllocator",
      `Invalid WORKER_PERCENTAGE value: ${envValue}. Valid percentages: 10, 25, 50, 75, 100.`,
    );
  }

  /**
   * Worker count for local development based on the given allocation percentage.
   */
  private static getWorkersForLocalPercentage(percentage: AllocatorPercentage): number {
    return Math.max(this.MIN_WORKERS, Math.ceil(this.totalCores * (percentage / 100)));
  }

  private static isValidPercentage(value: number): value is AllocatorPercentage {
    return [10, 25, 50, 75, 100].includes(value);
  }
}
