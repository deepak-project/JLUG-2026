export const ADMIN_CONFIG = {
  /** Env var holding the secret key. Login is disabled when unset. */
  secretEnvVar: "ADMIN_SECRET_KEY",
  cookieName: "jlug_admin",
  sessionTtlSeconds: 60 * 60 * 8,
  maxLoginAttempts: 5,
  loginWindowMs: 15 * 60 * 1000,
  /** Directory for submissions.json. Point DATA_DIR at a persistent disk in production. */
  dataDirEnvVar: "DATA_DIR",
  defaultDataDir: ".data",
  dataFileName: "submissions.json",
  exportFilePrefix: "jlug-recruitment",
} as const;
