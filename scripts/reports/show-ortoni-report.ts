/**
 * show-ortoni-report.ts
 * Launches the Ortoni report server, preferring the default port (2004) but
 * falling back to a random free port when it is already in use.
 *
 * The ortoni-report CLI does not retry when its port is taken, so this wrapper
 * resolves a usable port first and then passes it explicitly.
 */

import net from "net";
import { spawn } from "child_process";
import { logger } from "../logger/logger.js";
import {
  CANDIDATE_PORTS,
  REPORT_DIR,
  REPORT_FILE,
  HOST,
} from "./ortoniReport.constants.js";

/**
 * Attempts to bind to the given port to confirm it is free.
 *
 * No host is passed to `listen`, so this mirrors how ortoni-report binds
 * (all interfaces / dual-stack). Forcing 127.0.0.1 here would falsely report a
 * port as free on Windows when another process holds 0.0.0.0/[::] on it.
 * @param port - Port to test; pass 0 to let the OS assign a random free port.
 * @returns The usable port number, or null if the requested port is taken.
 */
function probePort(port: number): Promise<number | null> {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", () => resolve(null));
    server.once("listening", () => {
      const address = server.address();
      const resolvedPort =
        typeof address === "object" && address !== null ? address.port : port;
      server.close(() => resolve(resolvedPort));
    });

    server.listen(port);
  });
}

/**
 * Resolves the port to serve the report on: the first free candidate port,
 * otherwise a random free port assigned by the OS.
 */
async function resolvePort(): Promise<number> {
  for (const candidate of CANDIDATE_PORTS) {
    const free = await probePort(candidate);
    if (free !== null) {
      return free;
    }
    logger.warn(`Port ${candidate} is in use. Trying the next port...`);
  }

  const fallback = await probePort(0);
  if (fallback === null) {
    logger.error("Could not find a free port for the Ortoni report server.");
    process.exit(1);
  }

  logger.warn(`All candidate ports are in use. Using random free port ${fallback}.`);
  return fallback;
}

async function main(): Promise<void> {
  const port = await resolvePort();
  logger.info(`Starting Ortoni report on http://${HOST}:${port}`);

  const child = spawn(
    "npx",
    [
      "ortoni-report",
      "show-report",
      "--dir",
      REPORT_DIR,
      "--file",
      REPORT_FILE,
      "--port",
      String(port),
    ],
    { stdio: "inherit", shell: true },
  );

  child.on("exit", (code) => process.exit(code ?? 0));
}

void main();
