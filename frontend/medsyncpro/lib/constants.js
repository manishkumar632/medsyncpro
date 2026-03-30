// ─── Routes ───────────────────────────────────────────────────────────────────

export const ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    VERIFY: "/auth/verify-email",
  },
  PATIENT: "/patient",
  DOCTOR: "/doctor/dashboard",
  ADMIN: "/admin/dashboard",
  PHARMACY: "/pharmacy/dashboard",
  AGENT: "/agent/dashboard",
  HOME: "/",
};

// ─── Roles ────────────────────────────────────────────────────────────────────

export const ROLES = {
  PATIENT: "PATIENT",
  DOCTOR: "DOCTOR",
  ADMIN: "ADMIN",
  PHARMACY: "PHARMACY",
  PHARMACIST: "PHARMACY",
  AGENT: "AGENT",
};

// ─── Role → dashboard path ────────────────────────────────────────────────────

export const ROLE_ROUTES = {
  [ROLES.PATIENT]: ROUTES.PATIENT,
  [ROLES.DOCTOR]: ROUTES.DOCTOR,
  [ROLES.ADMIN]: ROUTES.ADMIN,
  [ROLES.PHARMACY]: ROUTES.PHARMACY,
  [ROLES.AGENT]: ROUTES.AGENT,
};

// ─── Role → allowed path prefixes (used by middleware) ───────────────────────

export const ROLE_ALLOWED_PREFIXES = {
  [ROLES.PATIENT]: [ROUTES.PATIENT],
  [ROLES.DOCTOR]: ["/doctor"],
  [ROLES.ADMIN]: ["/admin"],
  [ROLES.PHARMACY]: ["/pharmacy"],
  [ROLES.AGENT]: ["/agent"],
};

// ─── Route groups ─────────────────────────────────────────────────────────────

export const PROTECTED_PREFIXES = [
  "/patient",
  "/doctor",
  "/admin",
  "/pharmacy",
  "/agent",
];

export const AUTH_ROUTES = Object.values(ROUTES.AUTH);
