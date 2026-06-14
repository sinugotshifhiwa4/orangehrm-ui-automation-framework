/**
 * ortoniReport.constants.ts
 * Shared configuration for the Ortoni report scripts (show / stop).
 */

/**
 * Candidate ports the report server tries in order. The first free one wins.
 * The stop script also targets this list when reclaiming ports.
 */
export const CANDIDATE_PORTS = [2004, 2006, 2008, 2009];

export const REPORT_DIR = "ortoni-report";
export const REPORT_FILE = "index.html";
export const HOST = "127.0.0.1";
