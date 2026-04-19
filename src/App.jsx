import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { db, auth, collection, doc, getDocs, setDoc, deleteDoc, onSnapshot, signInAnonymously, onAuthStateChanged, signOut } from "./firebase";

const C = {
  red: "#8C1414",
  redHover: "#A51818",
  redLight: "#FEF2F2",
  redBorder: "#FECACA",
  dark: "#111318",
  darkMid: "#1C2030",
  sidebar: "#13161E",
  surface: "#F5F6FA",
  white: "#FFFFFF",
  border: "#E4E6EE",
  text: "#1A1F2E",
  muted: "#6B7280",
  mutedLt: "#9CA3AF",
  success: "#059669",
  successBg: "#ECFDF5",
  warn: "#D97706",
  warnBg: "#FFFBEB",
  info: "#1D4ED8",
  infoBg: "#EFF6FF",
};
const CATEGORIES = [
  "Vehicle",
  "TLB",
  "Excavator",
  "Compactor",
  "Generator",
  "Trailer",
  "Grader",
  "Tipper Truck",
  "Tools",
  "Other",
];
const USEFUL_LIFE = {
  Vehicle: 5,
  TLB: 10,
  Excavator: 10,
  Compactor: 8,
  Generator: 7,
  Trailer: 10,
  Grader: 10,
  "Tipper Truck": 7,
  Tools: 3,
  Other: 5,
};
const SITES = [
  "Head Office",
  "Site A",
  "Site B",
  "Site C",
  "Workshop",
  "Storage Yard",
];
const ASSET_STATUS = ["Active", "Under Maintenance", "Disposed", "Inactive"];
const CONDITION_RATINGS = [
  "Excellent",
  "Good",
  "Fair",
  "Poor",
  "Write-Off Recommended",
];
const CONDITION_COLORS = {
  Excellent: "green",
  Good: "green",
  Fair: "yellow",
  Poor: "red",
  "Write-Off Recommended": "red",
};
const INCIDENT_TYPES = [
  "Breakdown",
  "Accident",
  "Theft",
  "Vandalism",
  "Operator Error",
  "Mechanical Failure",
  "Electrical Fault",
  "Hydraulic Failure",
  "Tyre Blowout",
  "Other",
];
const SUPPLIER_TYPES = [
  "Service & Repairs",
  "Fuel Supplier",
  "Parts & Spares",
  "Tyre Supplier",
  "Electrical",
  "Hydraulics",
  "General Maintenance",
  "Other",
];
const BUDGET_CATEGORIES = [
  "Maintenance",
  "Fuel",
  "Equipment Hire",
  "General Operations",
];
const HIRE_STATUS = ["Active Hire", "Returned", "Extended", "Cancelled"];
const DISPOSAL_METHODS = [
  "Sold",
  "Written Off",
  "Donated",
  "Scrapped",
  "Trade-In",
  "Stolen",
  "Other",
];
const SPARE_CATEGORIES = [
  "Engine Parts",
  "Filters",
  "Tyres",
  "Hydraulics",
  "Electrical",
  "Brakes",
  "Belts & Hoses",
  "Fluids & Lubricants",
  "Tools",
  "Safety Equipment",
  "Other",
];
const SPARE_STATUS = ["In Stock", "Low Stock", "Out of Stock", "Ordered"];
const WARRANTY_STATUS = ["Active", "Expired", "Claimed", "Void"];
const SARS_RATES = {
  Vehicle: 20,
  TLB: 10,
  Excavator: 10,
  Compactor: 12.5,
  Generator: 14.3,
  Trailer: 10,
  Grader: 10,
  "Tipper Truck": 14.3,
  Tools: 33.3,
  Other: 20,
};
const LEAVE_TYPES = [
  "Annual Leave",
  "Sick Leave",
  "Unpaid Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Family Responsibility",
  "Study Leave",
  "Other",
];
const LEAVE_STATUS = ["Pending", "Approved", "Rejected"];
const MODULE_NAMES = {
  mcw_assets: "Asset Register",
  mcw_maint: "Maintenance",
  mcw_fuel: "Fuel & Usage",
  mcw_ts: "Timesheets",
  mcw_conditions: "Asset Conditions",
  mcw_incidents: "Incidents",
  mcw_suppliers: "Suppliers",
  mcw_compliance: "Compliance",
  mcw_projects: "Projects",
  mcw_employees: "Employees",
  mcw_schedules: "Schedules",
  mcw_budgets: "Budgets",
  mcw_hires: "Equipment Hire",
  mcw_disposals: "Disposals",
  mcw_leaves: "Leave Records",
  mcw_overtimes: "Overtime",
  mcw_assignments: "Asset Assignments",
  mcw_spares: "Parts & Spares",
  mcw_warranties: "Warranties",
  mcw_preops: "Pre-Op Checklists",
  mcw_contractors: "Contractor Register",
  mcw_transfers: "Asset Transfer Log",
  mcw_jobcards: "Job Cards",
  mcw_pos: "Purchase Orders",
};
const COMPLIANCE_TYPES = [
  "Roadworthy Certificate",
  "Vehicle Licence",
  "Operating Licence",
  "Insurance",
  "COF (Certificate of Fitness)",
  "Fire Extinguisher",
  "Other",
];
const EMPLOYEE_ROLES = [
  "Plant Manager",
  "Site Supervisor",
  "TLB Operator",
  "Excavator Operator",
  "Truck Driver",
  "Grader Operator",
  "General Worker",
  "Mechanic",
  "Safety Officer",
  "Admin",
  "Other",
];
const EMPLOYEE_STATUS = ["Active", "On Leave", "Suspended", "Terminated"];
const PROJECT_STATUS = ["Active", "Completed", "On Hold", "Cancelled"];
const MAINT_TYPES = [
  "Full Service",
  "Repair",
  "Inspection",
  "Tyre Change",
  "Oil Change",
  "Battery",
  "Brakes",
  "Other",
];
const NAV = [
  { id: "Dashboard", ico: "⊞" },
  { id: "Assets", ico: "⊟" },
  { id: "Depreciation", ico: "⊘" },
  { id: "Maintenance", ico: "⊙" },
  { id: "Fuel", ico: "◈" },
  { id: "Timesheets", ico: "◷" },
  { id: "Reports", ico: "◈" },
  { id: "Compliance", ico: "⊛" },
  { id: "Projects", ico: "⊕" },
  { id: "Employees", ico: "⊞" },
  { id: "Schedules", ico: "⊗" },
  { id: "Conditions", ico: "⊜" },
  { id: "Incidents", ico: "⚠" },
  { id: "Suppliers", ico: "⊡" },
  { id: "Budgets", ico: "₿" },
  { id: "Hire", ico: "⊠" },
  { id: "Disposals", ico: "⊖" },
  { id: "Analytics", ico: "▲" },
  { id: "FuelRecon", ico: "⊟" },
  { id: "AuditLog", ico: "⊙" },
  { id: "Leave", ico: "◫" },
  { id: "Assignments", ico: "◴" },
  { id: "Spares", ico: "⊟" },
  { id: "Warranties", ico: "⊛" },
  { id: "SARSReport", ico: "₴" },
  { id: "Import", ico: "⊕" },
  { id: "ProjectCost", ico: "₱" },
  { id: "Utilisation", ico: "◎" },
  { id: "Alerts", ico: "⚑" },
  { id: "AssetExpenses", ico: "₽" },
  { id: "PreOp", ico: "☑" },
  { id: "Contractors", ico: "⊡" },
  { id: "Transfers", ico: "⇄" },
  { id: "PurchaseOrders", ico: "📦" },
  { id: "JobCards", ico: "🔧" },
  { id: "AIAssist", ico: "✦" },
  { id: "FleetMap", ico: "◉" },
  { id: "AssetIntel", ico: "◈" },
  { id: "Settings", ico: "⚙" },
];
const NAV_LABELS = {
  Dashboard: "Dashboard",
  Assets: "Asset Register",
  Depreciation: "Depreciation",
  Maintenance: "Maintenance",
  Fuel: "Fuel & Usage",
  Timesheets: "Timesheets",
  Reports: "Reports",
  Compliance: "Compliance",
  Projects: "Projects",
  Employees: "Employees",
  Schedules: "Schedules",
  Conditions: "Conditions",
  Incidents: "Incidents",
  Suppliers: "Suppliers",
  Budgets: "Budget",
  Hire: "Equipment Hire",
  Disposals: "Disposals",
  Analytics: "Analytics",
  FuelRecon: "Fuel Recon",
  AuditLog: "Audit Trail",
  Leave: "Leave & Overtime",
  Assignments: "Assignments",
  Spares: "Parts & Spares",
  Warranties: "Warranties",
  SARSReport: "SARS 11(e)",
  Import: "Bulk Import",
  ProjectCost: "Project Cost Report",
  Utilisation: "Asset Utilisation",
  Alerts: "Notification Centre",
  AssetExpenses: "Asset Expenses",
  PreOp: "Pre-Op Checklists",
  Contractors: "Contractor Register",
  Transfers: "Asset Transfer Log",
  PurchaseOrders: "Purchase Orders",
  JobCards: "Job Cards",
  AIAssist: "AI Plant Assistant",
  FleetMap: "Fleet Visual Map",
  AssetIntel: "Asset Intelligence",
  Settings: "Settings",
};
const ROLES = {
  admin: "Admin",
  manager: "Manager",
  operator: "Operator",
  viewer: "Viewer",
};
const DEFAULT_USERS = [
  {
    id: "1",
    username: "admin",
    password: "admin123",
    name: "System Admin",
    role: "admin",
  },
];
const PERMS = {
  admin: {
    canAdd: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: true,
    canViewReports: true,
  },
  manager: {
    canAdd: true,
    canEdit: true,
    canDelete: true,
    canManageUsers: false,
    canViewReports: true,
  },
  operator: {
    canAdd: true,
    canEdit: false,
    canDelete: false,
    canManageUsers: false,
    canViewReports: false,
  },
  viewer: {
    canAdd: false,
    canEdit: false,
    canDelete: false,
    canManageUsers: false,
    canViewReports: true,
  },
};
const can = (user, perm) => (user ? !!PERMS[user.role]?.[perm] : false);

const fmt = (n) =>
  `R ${Number(n || 0).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
const today = () => new Date().toISOString().split("T")[0];
const monthLabel = (m) => {
  try {
    return new Date(m + "-02").toLocaleDateString("en-ZA", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return m;
  }
};

function depreciate(a) {
  if (!a?.purchaseDate || !a?.purchaseCost)
    return { bookValue: 0, accumulated: 0, rate: 0, years: 0 };
  const years = Math.max(
    0,
    (Date.now() - new Date(a.purchaseDate).getTime()) /
      (1000 * 60 * 60 * 24 * 365.25)
  );
  const life = USEFUL_LIFE[a.category] || 5;
  const accumulated = Math.min(
    Number(a.purchaseCost),
    Number(a.purchaseCost) * (1 / life) * years
  );
  return {
    bookValue: Math.max(0, Number(a.purchaseCost) - accumulated),
    accumulated,
    rate: (1 / life) * 100,
    years,
  };
}

function Pill({ text, color = "gray" }) {
  const m = {
    green: { bg: C.successBg, c: C.success, b: "#A7F3D0" },
    yellow: { bg: C.warnBg, c: C.warn, b: "#FDE68A" },
    red: { bg: C.redLight, c: C.red, b: C.redBorder },
    blue: { bg: C.infoBg, c: C.info, b: "#BFDBFE" },
    gray: { bg: "#F3F4F6", c: C.muted, b: "#E5E7EB" },
  };
  const s = m[color] || m.gray;
  return (
    <span
      style={{
        background: s.bg,
        color: s.c,
        border: `1px solid ${s.b}`,
        padding: "2px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 0.3,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </span>
  );
}

function KPI({ label, value, sub, color, icon }) {
  return (
    <div
      style={{
        background: C.white,
        borderRadius: 10,
        padding: "20px 22px",
        border: `1px solid ${C.border}`,
        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 3,
          height: "100%",
          background: color,
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              color: C.muted,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 0.8,
              marginBottom: 7,
            }}
          >
            {label}
          </div>
          <div
            style={{
              fontSize: 23,
              fontWeight: 700,
              color: C.text,
              letterSpacing: -0.5,
              fontFamily: "'Barlow Condensed',sans-serif",
            }}
          >
            {value}
          </div>
          {sub && (
            <div style={{ fontSize: 11, color: C.mutedLt, marginTop: 4 }}>
              {sub}
            </div>
          )}
        </div>
        <div style={{ fontSize: 22, opacity: 0.12 }}>{icon}</div>
      </div>
    </div>
  );
}

function Btn({
  onClick,
  children,
  variant = "primary",
  size = "md",
  style: s = {},
}) {
  const sizes = {
    sm: { padding: "6px 14px", fontSize: 12 },
    md: { padding: "9px 18px", fontSize: 13 },
    lg: { padding: "11px 24px", fontSize: 14 },
  };
  const variants = {
    primary: {
      background: C.red,
      color: C.white,
      boxShadow: "0 2px 8px rgba(140,20,20,0.25)",
      border: "none",
    },
    ghost: {
      background: "transparent",
      color: C.muted,
      boxShadow: "none",
      border: `1px solid ${C.border}`,
    },
    outline: {
      background: C.white,
      color: C.red,
      border: `1px solid ${C.red}`,
      boxShadow: "none",
    },
  };
  return (
    <button
      onClick={onClick}
      style={{
        borderRadius: 7,
        fontFamily: "'DM Sans',sans-serif",
        fontWeight: 600,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        transition: "all 0.15s",
        ...sizes[size],
        ...variants[variant],
        ...s,
      }}
    >
      {children}
    </button>
  );
}

function Modal({ title, subtitle, onClose, children }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(17,19,24,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: 20,
        backdropFilter: "blur(3px)",
      }}
    >
      <div
        style={{
          background: C.white,
          borderRadius: 14,
          width: "100%",
          maxWidth: 540,
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
          border: `1px solid ${C.border}`,
        }}
      >
        <div
          style={{
            padding: "22px 28px",
            borderBottom: `1px solid ${C.border}`,
            background: C.surface,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
              {title}
            </div>
            {subtitle && (
              <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                {subtitle}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 18,
              cursor: "pointer",
              color: C.mutedLt,
              padding: "0 4px",
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: "24px 28px" }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 700,
          color: C.muted,
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: 0.6,
        }}
      >
        {label}
        {required && <span style={{ color: C.red, marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}
const inp = {
  style: {
    width: "100%",
    border: `1px solid ${C.border}`,
    borderRadius: 7,
    padding: "9px 12px",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
    background: C.white,
    color: C.text,
    fontFamily: "'DM Sans',sans-serif",
  },
};
function Row2({ children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      {children}
    </div>
  );
}

function Tbl({ cols, children, foot }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: C.surface }}>
            {cols.map((h) => (
              <th
                key={h}
                style={{
                  padding: "8px 11px",
                  textAlign: "left",
                  fontSize: 10,
                  color: C.muted,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                  borderBottom: `1px solid ${C.border}`,
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
        {foot && <tfoot>{foot}</tfoot>}
      </table>
    </div>
  );
}

function TR({ cells, stripe }) {
  return (
    <tr
      style={{
        background: stripe ? C.surface : C.white,
        borderBottom: `1px solid ${C.surface}`,
      }}
    >
      {cells.map((c, i) => (
        <td
          key={i}
          style={{
            padding: "8px 11px",
            fontSize: 12.5,
            color: C.text,
            verticalAlign: "middle",
          }}
        >
          {c}
        </td>
      ))}
    </tr>
  );
}

function Empty({ icon, title, desc, btn }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "64px 20px",
        background: C.white,
        borderRadius: 10,
        border: `1px dashed ${C.border}`,
      }}
    >
      <div style={{ fontSize: 36, marginBottom: 14, opacity: 0.25 }}>
        {icon}
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: C.text,
          marginBottom: 6,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontSize: 13,
          color: C.muted,
          marginBottom: 20,
          maxWidth: 300,
          textAlign: "center",
        }}
      >
        {desc}
      </div>
      {btn}
    </div>
  );
}

function Card({ title, sub, action, children }) {
  return (
    <div
      style={{
        background: C.white,
        borderRadius: 10,
        border: `1px solid ${C.border}`,
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      {(title || action) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>
              {title}
            </div>
            {sub && (
              <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>
                {sub}
              </div>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

function PageTitle({ title, sub, action }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: 22,
      }}
    >
      <div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: C.text,
            letterSpacing: -0.5,
            fontFamily: "'Barlow Condensed',sans-serif",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>{sub}</div>
      </div>
      {action}
    </div>
  );
}

function FtRow({ label, vals, highlight }) {
  return (
    <tr
      style={{
        background: highlight ? C.dark : C.surface,
        borderTop: `2px solid ${C.border}`,
      }}
    >
      {vals.map((v, i) => (
        <td
          key={i}
          style={{
            padding: "8px 11px",
            fontWeight: 800,
            fontSize: i === 0 ? 12 : 13,
            color: highlight ? "white" : C.text,
            textTransform: i === 0 ? "uppercase" : undefined,
            letterSpacing: i === 0 ? 0.5 : undefined,
          }}
        >
          {v}
        </td>
      ))}
    </tr>
  );
}

function BarChart({ data, valueKey, labelKey, color, height = 160, fmtFn }) {
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 6,
          height,
          padding: "0 4px",
        }}
      >
        {data.map((d, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 3,
            }}
          >
            <div
              style={{
                fontSize: 9,
                color: C.muted,
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              {fmtFn ? fmtFn(Number(d[valueKey]) || 0) : d[valueKey]}
            </div>
            <div
              style={{
                width: "100%",
                background: color,
                borderRadius: "3px 3px 0 0",
                minHeight: 3,
                height: `${Math.max(
                  3,
                  ((Number(d[valueKey]) || 0) / max) * (height - 30)
                )}px`,
                transition: "height 0.5s",
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 6, padding: "0 4px" }}>
        {data.map((d, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              fontSize: 9,
              color: C.muted,
              textAlign: "center",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {d[labelKey]}
          </div>
        ))}
      </div>
    </div>
  );
}

function HBarChart({ data, valueKey, labelKey, color, fmtFn }) {
  const max = Math.max(...data.map((d) => Number(d[valueKey]) || 0), 1);
  return (
    <div style={{ padding: "4px 0" }}>
      {data.map((d, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <div
            style={{
              width: 110,
              fontSize: 11,
              color: C.text,
              fontWeight: 600,
              textAlign: "right",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {d[labelKey]}
          </div>
          <div
            style={{
              flex: 1,
              height: 18,
              background: C.border,
              borderRadius: 3,
            }}
          >
            <div
              style={{
                height: "100%",
                background: color,
                borderRadius: 3,
                width: `${((Number(d[valueKey]) || 0) / max) * 100}%`,
                transition: "width 0.5s",
              }}
            />
          </div>
          <div
            style={{
              width: 80,
              fontSize: 11,
              color: C.muted,
              textAlign: "right",
              flexShrink: 0,
            }}
          >
            {fmtFn ? fmtFn(Number(d[valueKey]) || 0) : d[valueKey]}
          </div>
        </div>
      ))}
    </div>
  );
}
// ── PROFESSIONAL EXCEL STYLING HELPERS ──────────────────────────────────────
const XL = {
  // Brand colours (ARGB — full opacity prefix AA)
  RED:    "FF8C1414",
  DARK:   "FF111318",
  WHITE:  "FFFFFFFF",
  LIGHT:  "FFF5F6FA",
  STRIPE: "FFFAFAFA",
  BORDER: "FFE4E6EE",
  MUTED:  "FF6B7280",
  WARN:   "FFFEF3C7",
  SUCCESS:"FFD1FAE5",
  TOTAL:  "FF1C2030",

  // Reusable border definition
  thinBorder(color = "FFD1D5DB") {
    const s = { style:"thin", color:{ rgb: color } };
    return { top:s, bottom:s, left:s, right:s };
  },

  // Header cell style — dark brand background, white bold text
  header(wide = false) {
    return {
      font:  { bold:true, color:{ rgb: XL.WHITE }, sz: wide ? 10 : 9, name:"Calibri" },
      fill:  { fgColor:{ rgb: XL.DARK }, patternType:"solid" },
      alignment: { horizontal:"left", vertical:"center", wrapText: true },
      border: XL.thinBorder("FF374151"),
    };
  },

  // Red accent header (for section sub-headers)
  redHeader() {
    return {
      font:  { bold:true, color:{ rgb: XL.WHITE }, sz:9, name:"Calibri" },
      fill:  { fgColor:{ rgb: XL.RED }, patternType:"solid" },
      alignment: { horizontal:"left", vertical:"center" },
      border: XL.thinBorder(XL.RED),
    };
  },

  // Normal data cell
  cell(stripe = false, bold = false, color = null, align = "left") {
    return {
      font:  { bold, color:{ rgb: color || "FF1A1F2E" }, sz:9, name:"Calibri" },
      fill:  { fgColor:{ rgb: stripe ? XL.STRIPE : XL.WHITE }, patternType:"solid" },
      alignment: { horizontal: align, vertical:"center", wrapText: false },
      border: XL.thinBorder(),
    };
  },

  // Totals row — dark background, coloured text
  total(accent = null) {
    return {
      font:  { bold:true, color:{ rgb: accent || XL.WHITE }, sz:10, name:"Calibri" },
      fill:  { fgColor:{ rgb: XL.TOTAL }, patternType:"solid" },
      alignment: { horizontal:"right", vertical:"center" },
      border: XL.thinBorder("FF374151"),
    };
  },

  // Currency format
  ZAR: "R\\ #,##0.00",
  INT: "#,##0",
  PCT: "0.0%",
};

// Applies full professional styling to a worksheet after json_to_sheet
function styleSheet(ws, rows, colCount) {
  if (!ws["!ref"]) return;
  const range = XLSX.utils.decode_range(ws["!ref"]);

  for (let R = range.s.r; R <= range.e.r; R++) {
    const isHeader = R === 0;
    const isTotalRow = R === range.e.r && rows.length > 0 &&
      String(Object.values(rows[rows.length - 1])[0] || "").toUpperCase().includes("TOTAL");
    const stripe = R % 2 === 0;

    for (let C = range.s.c; C <= range.e.c; C++) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[addr]) ws[addr] = { t:"z" };
      const cell = ws[addr];

      if (isHeader) {
        cell.s = XL.header();
      } else if (isTotalRow) {
        const s = XL.total(C === 0 ? XL.WHITE : "FFFDE68A");
        s.alignment = { horizontal: C === 0 ? "left" : "right", vertical:"center" };
        cell.s = s;
      } else {
        // Detect numeric / currency columns
        const isNum = cell.t === "n";
        const headerCell = ws[XLSX.utils.encode_cell({ r:0, c:C })];
        const hdr = String(headerCell?.v || "").toLowerCase();
        const isCurrency = isNum && (hdr.includes("(r)") || hdr.includes("cost") || hdr.includes("value") || hdr.includes("amount") || hdr.includes("rate") || hdr.includes("budget") || hdr.includes("spend") || hdr.includes("total") || hdr.includes("price"));
        const isPct = isNum && hdr.includes("%");
        const isInt = isNum && !isCurrency && !isPct;

        if (isCurrency) cell.z = XL.ZAR;
        else if (isPct) cell.z = XL.PCT;
        else if (isInt) cell.z = XL.INT;

        const bold = isNum && (hdr.includes("total") || hdr.includes("value"));
        cell.s = XL.cell(stripe, bold, null, isNum ? "right" : "left");
      }
    }
  }

  // Row heights
  ws["!rows"] = ws["!rows"] || [];
  ws["!rows"][0] = { hpt: 22 }; // header row taller
  for (let R = 1; R <= range.e.r; R++) {
    ws["!rows"][R] = { hpt: 18 };
  }
}

function addSheet(wb, rows, name, colWidths) {
  const data = rows.length ? rows : [{ Note: `No ${name} records` }];
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = colWidths.map((w) => ({ wch: w }));
  ws["!freeze"] = { xSplit:0, ySplit:1, topLeftCell:"A2", activePane:"bottomLeft", state:"frozen" };
  styleSheet(ws, data, colWidths.length);
  XLSX.utils.book_append_sheet(wb, ws, name);
}
const PO_STATUS = ["Draft","Awaiting Approval","Approved","Sent to Supplier","Partially Received","Fully Received","Cancelled"];
const PO_TYPES = ["Parts & Spares","Fuel","Equipment","Tools","Safety Equipment","Maintenance Services","Other"];
const PO_TERMS = ["COD","7 days","14 days","30 days","45 days","60 days"];

const JOB_CARD_STATUS = [
  "Open",
  "Assigned",
  "In Progress",
  "Awaiting Parts",
  "Complete",
  "Invoiced",
  "Cancelled",
];
const JOB_CARD_PRIORITY = ["Critical", "High", "Medium", "Low"];
const JOB_CARD_TYPE = [
  "Scheduled Service",
  "Breakdown Repair",
  "Preventive Maintenance",
  "Tyre Change",
  "Electrical Fault",
  "Hydraulic Repair",
  "Body & Paint",
  "Safety Inspection",
  "Warranty Claim",
  "Other",
];

const TRANSFER_REASONS = [
  "Site Reallocation",
  "Project Assignment",
  "Maintenance / Repairs",
  "Operator Request",
  "Fleet Optimisation",
  "Return from Project",
  "Storage",
  "Inspection",
  "Other",
];
const TRANSFER_TRANSPORT = [
  "Self-Drive",
  "Flatbed Truck",
  "Low-Bed Trailer",
  "Towed",
  "Third-Party Transport",
  "Other",
];
const TRANSFER_CONDITION = [
  "Excellent",
  "Good",
  "Fair",
  "Poor — Noted",
  "Damaged — Report Filed",
];
const CIDB_GRADES = ["1","2","3","4","5","6","7","8","9","GB","GB1","GB2","GB3","GB4","GB5","GB6","GB7","GB8","GB9"];
const CIDB_CLASSES = ["General Building","Civil Engineering","Electrical Engineering","Mechanical Engineering","Specialist Works","Other"];
const CONTRACTOR_STATUS = ["Active","Inactive","Blacklisted","Pending Vetting"];
const CONTRACTOR_WORK_TYPES = [
  "Earthworks","Road Construction","Concrete Works","Steel Erection","Electrical","Plumbing",
  "Landscaping","Demolition","Paving","Waterproofing","Painting","Fencing","General Labour","Other"
];
const PREOP_CHECKS = [
  { id:"oil",       label:"Engine Oil Level",          icon:"🛢" },
  { id:"coolant",   label:"Coolant / Water Level",      icon:"💧" },
  { id:"hydraulic", label:"Hydraulic Fluid Level",      icon:"⚙" },
  { id:"tyres",     label:"Tyre Condition & Pressure",  icon:"⭕" },
  { id:"lights",    label:"Lights & Indicators",        icon:"💡" },
  { id:"brakes",    label:"Brakes & Handbrake",         icon:"🔴" },
  { id:"extinguisher", label:"Fire Extinguisher Present & Charged", icon:"🧯" },
  { id:"seatbelt",  label:"Seatbelt Functional",        icon:"🔒" },
  { id:"mirrors",   label:"Mirrors & Visibility",       icon:"🔲" },
  { id:"leaks",     label:"No Visible Leaks (oil/fuel/coolant)", icon:"🔍" },
  { id:"battery",   label:"Battery & Electrical",       icon:"⚡" },
  { id:"general",   label:"General Condition Acceptable", icon:"✅" },
];
const PREOP_STATUS = { pass:"Pass", fail:"Fail — Defect Found", na:"N/A" };
const DEFAULT_COMPANY = {
  name: "Mapitsi Civil Works",
  tagline: "Plant Management Division",
  regNumber: "",
  vatNumber: "",
  address: "",
  city: "Johannesburg, Gauteng",
  phone: "011 394 7343",
  email: "info@mapcw.co.za",
  website: "www.mapcw.co.za",
  logoUrl: "",
  financialYearStart: "03",
  complianceAlertDays: "30",
  warrantyAlertDays: "60",
  sessionTimeout: "60",
  reportFooter: "Confidential — For Internal Use Only · Mapitsi Civil Works · Every Good Development Starts With A Good Foundation",
};
const DEFAULT_SITES = [
  "Head Office",
  "Site A",
  "Site B",
  "Site C",
  "Workshop",
  "Storage Yard",
];
const NAV_SECTIONS = [
  { label: "Overview", ids: ["Dashboard"] },
  { label: "Assets", ids: ["Assets","Depreciation","Conditions","Warranties","Assignments","Disposals","Spares","Transfers"] },
  { label: "Operations", ids: ["Maintenance","JobCards","Schedules","Fuel","FuelRecon","Incidents","Hire","PreOp"] },
  { label: "People", ids: ["Employees", "Timesheets", "Leave", "Projects"] },
  { label: "Finance", ids: ["Budgets", "Compliance", "Reports", "SARSReport", "ProjectCost", "PurchaseOrders"] },
  { label: "Intelligence", ids: ["Analytics", "AIAssist", "FleetMap", "AssetIntel", "FuelRecon", "Utilisation", "Alerts", "AssetExpenses"] },
  { label: "System", ids: ["Suppliers","Contractors","AuditLog","Import","Settings"] },
];

function AlertChip({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: C.white,
        border: `1px solid ${C.redBorder}`,
        borderRadius: 20,
        padding: "5px 14px",
        fontSize: 11.5,
        color: C.red,
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "'DM Sans',sans-serif",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {label} →
    </button>
  );
}
function Toast({ toasts, remove }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 99999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background:
              t.type === "success"
                ? C.success
                : t.type === "error"
                ? C.red
                : t.type === "warn"
                ? C.warn
                : C.info,
            color: "white",
            borderRadius: 8,
            padding: "11px 18px",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "'DM Sans',sans-serif",
            boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            minWidth: 260,
            maxWidth: 380,
            animation: "slideIn 0.2s ease",
            pointerEvents: "all",
          }}
        >
          <span style={{ fontSize: 16 }}>
            {t.type === "success"
              ? "✓"
              : t.type === "error"
              ? "⚠"
              : t.type === "warn"
              ? "⚐"
              : "ℹ"}
          </span>
          <span style={{ flex: 1 }}>{t.msg}</span>
          <button
            onClick={() => remove(t.id)}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.7)",
              cursor: "pointer",
              fontSize: 16,
              padding: "0 2px",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

function PurchaseOrdersTab({ purchaseOrders, setPurchaseOrders, suppliers, spares, projects, currentUser, persist, add, update, del, logAudit, toast, can, fmt, today, C, inp, Field, Row2, Btn, Card, Tbl, TR, Empty, KPI, Pill, PageTitle }) {
  const dPO = { poNumber:"", supplierId:"", type:"Parts & Spares", status:"Draft", dateCreated:today(), dateRequired:"", projectId:"", items:[], notes:"", approvedBy:"", deliveryAddress:"", terms:"30 days", receivedDate:"", invoiceNumber:"" };
  const [poForm, setPoForm] = useState(dPO);
  const [poModal, setPoModal] = useState(null);
  const [poView, setPoView] = useState(null);
  const [poFilter, setPoFilter] = useState("All");

  const getPoTotal = po => (po.items||[]).reduce((s,i) => s + Number(i.qty||0)*Number(i.unitPrice||0), 0);
  const openPOs = purchaseOrders.filter(p => !["Fully Received","Cancelled"].includes(p.status)).length;
  const totalValue = purchaseOrders.reduce((s,p) => s + getPoTotal(p), 0);
  const pendingValue = purchaseOrders.filter(p => !["Fully Received","Cancelled"].includes(p.status)).reduce((s,p) => s + getPoTotal(p), 0);
  const filteredPOs = poFilter === "All" ? purchaseOrders : purchaseOrders.filter(p => p.status === poFilter);
  const statusColor = s => s==="Fully Received"?"green":s==="Approved"||s==="Sent to Supplier"?"blue":s==="Partially Received"||s==="Awaiting Approval"?"yellow":s==="Cancelled"?"gray":"gray";
  const genPONum = () => `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(4,"0")}`;

  return (
    <div>
      <PageTitle title="PURCHASE ORDERS" sub="Raise, approve and track all procurement from suppliers"
        action={can(currentUser,"canAdd") && <Btn onClick={()=>{ setPoForm({...dPO, poNumber:genPONum()}); setPoModal("form"); }}>＋ Raise Purchase Order</Btn>}
      />

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",gap:14,marginBottom:22}}>
        <KPI label="Total POs" value={purchaseOrders.length} color={C.info} icon="📦" sub="all time"/>
        <KPI label="Open / Pending" value={openPOs} color={openPOs>0?C.warn:C.success} icon="⚑" sub="awaiting action"/>
        <KPI label="Total PO Value" value={fmt(totalValue)} color={C.muted} icon="₽" sub="all orders"/>
        <KPI label="Pending Value" value={fmt(pendingValue)} color={pendingValue>0?C.warn:C.success} icon="₽" sub="not yet received"/>
        <KPI label="Fully Received" value={purchaseOrders.filter(p=>p.status==="Fully Received").length} color={C.success} icon="✓" sub="completed"/>
        <KPI label="Draft / Pending Approval" value={purchaseOrders.filter(p=>["Draft","Awaiting Approval"].includes(p.status)).length} color={C.muted} icon="✎" sub="in progress"/>
      </div>

      {/* Filter chips */}
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        {["All",...PO_STATUS].map(s=>(
          <button key={s} onClick={()=>setPoFilter(s)} style={{padding:"6px 14px",borderRadius:20,border:`1px solid ${poFilter===s?C.red:C.border}`,background:poFilter===s?C.red:C.white,color:poFilter===s?"white":C.muted,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s"}}>
            {s} {s!=="All"&&purchaseOrders.filter(p=>p.status===s).length>0?`(${purchaseOrders.filter(p=>p.status===s).length})`:""}
          </button>
        ))}
      </div>

      {/* Table */}
      {filteredPOs.length===0 ? (
        <Empty icon="📦" title={poFilter==="All"?"No purchase orders yet":`No ${poFilter} purchase orders`}
          desc="Raise a PO for every procurement — parts, fuel, equipment or services. Full audit trail from request through to delivery and invoice."
          btn={<Btn onClick={()=>{setPoForm({...dPO,poNumber:genPONum()});setPoModal("form");}}>Raise First Purchase Order</Btn>}/>
      ) : (
        <Card>
          <Tbl cols={["PO Number","Supplier","Type","Lines","Total Value","Date Raised","Required By","Status","Project",""]}>
            {[...filteredPOs].sort((a,b)=>b.dateCreated>a.dateCreated?1:-1).map((po,i)=>{
              const supplier=suppliers.find(s=>s.id===po.supplierId);
              const total=getPoTotal(po);
              const overdue=po.dateRequired&&po.dateRequired<today()&&!["Fully Received","Cancelled"].includes(po.status);
              const project=projects.find(p=>p.id===po.projectId);
              return (
                <TR key={po.id} stripe={i%2!==0} cells={[
                  <div>
                    <div style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:C.red}}>{po.poNumber}</div>
                    <div style={{fontSize:10,color:C.muted}}>{po.dateCreated}</div>
                  </div>,
                  <div>
                    <div style={{fontWeight:700,fontSize:12,color:C.text}}>{supplier?.name||"—"}</div>
                    <div style={{fontSize:10,color:C.mutedLt}}>{supplier?.type||""}</div>
                  </div>,
                  <Pill text={po.type} color="blue"/>,
                  <span style={{fontSize:12,color:C.muted}}>{(po.items||[]).length} line{(po.items||[]).length!==1?"s":""}</span>,
                  <span style={{fontWeight:700,color:total>0?C.text:C.mutedLt}}>{total>0?fmt(total):"—"}</span>,
                  <span style={{fontSize:12,color:C.muted}}>{po.dateCreated}</span>,
                  <span style={{fontSize:12,fontWeight:overdue?700:400,color:overdue?C.red:C.muted}}>{po.dateRequired||"—"}{overdue?" ⚠":""}</span>,
                  <Pill text={po.status} color={statusColor(po.status)}/>,
                  <span style={{fontSize:11,color:C.muted}}>{project?.name||"—"}</span>,
                  <div style={{display:"flex",gap:4}}>
                    <button onClick={()=>setPoView(po)} style={{color:C.info,background:"none",border:"none",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>View</button>
                    {can(currentUser,"canEdit")&&!["Fully Received","Cancelled"].includes(po.status)&&(
                      <button onClick={()=>{setPoForm({...dPO,...po});setPoModal("form");}} style={{color:C.warn,background:"none",border:"none",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>Edit</button>
                    )}
                    {can(currentUser,"canDelete")&&(
                      <button onClick={()=>del("mcw_pos",setPurchaseOrders,purchaseOrders,po.id)} style={{color:C.muted,background:"none",border:"none",cursor:"pointer",fontSize:14,padding:"0 4px"}}>×</button>
                    )}
                  </div>
                ]}/>
              );
            })}
          </Tbl>
        </Card>
      )}

      {/* FORM MODAL */}
      {poModal==="form"&&(
        <div style={{position:"fixed",inset:0,background:"rgba(17,19,24,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:20,backdropFilter:"blur(3px)"}}>
          <div style={{background:C.white,borderRadius:14,width:"100%",maxWidth:740,maxHeight:"93vh",overflowY:"auto",boxShadow:"0 24px 80px rgba(0,0,0,0.3)",border:`1px solid ${C.border}`}}>
            <div style={{padding:"20px 28px",borderBottom:`1px solid ${C.border}`,background:C.surface,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:10}}>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:C.text}}>{poForm.id?`Edit — ${poForm.poNumber}`:`New Purchase Order — ${poForm.poNumber}`}</div>
                <div style={{fontSize:12,color:C.muted,marginTop:2}}>Complete all fields for a full procurement audit trail</div>
              </div>
              <button onClick={()=>setPoModal(null)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:C.mutedLt}}>✕</button>
            </div>
            <div style={{padding:"22px 28px"}}>
              <div style={{fontSize:11,fontWeight:700,color:C.red,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Order Details</div>
              <Row2>
                <Field label="PO Number" required>
                  <input {...inp} value={poForm.poNumber} onChange={e=>setPoForm({...poForm,poNumber:e.target.value})}/>
                </Field>
                <Field label="Purchase Type" required>
                  <select {...inp} value={poForm.type} onChange={e=>setPoForm({...poForm,type:e.target.value})}>
                    {PO_TYPES.map(t=><option key={t}>{t}</option>)}
                  </select>
                </Field>
              </Row2>
              <Field label="Supplier" required>
                <select {...inp} value={poForm.supplierId} onChange={e=>setPoForm({...poForm,supplierId:e.target.value})}>
                  <option value="">— Select Supplier —</option>
                  {suppliers.map(s=><option key={s.id} value={s.id}>{s.name} · {s.type}</option>)}
                </select>
              </Field>
              <Row2>
                <Field label="Date Raised" required>
                  <input type="date" {...inp} value={poForm.dateCreated} onChange={e=>setPoForm({...poForm,dateCreated:e.target.value})}/>
                </Field>
                <Field label="Date Required By">
                  <input type="date" {...inp} value={poForm.dateRequired} onChange={e=>setPoForm({...poForm,dateRequired:e.target.value})}/>
                </Field>
              </Row2>
              <Row2>
                <Field label="Status">
                  <select {...inp} value={poForm.status} onChange={e=>setPoForm({...poForm,status:e.target.value})}>
                    {PO_STATUS.map(s=><option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Payment Terms">
                  <select {...inp} value={poForm.terms} onChange={e=>setPoForm({...poForm,terms:e.target.value})}>
                    {PO_TERMS.map(t=><option key={t}>{t}</option>)}
                  </select>
                </Field>
              </Row2>
              <Row2>
                <Field label="Allocate to Project">
                  <select {...inp} value={poForm.projectId||""} onChange={e=>setPoForm({...poForm,projectId:e.target.value})}>
                    <option value="">— No Project —</option>
                    {projects.filter(p=>p.status==="Active").map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </Field>
                <Field label="Approved By">
                  <input {...inp} value={poForm.approvedBy} onChange={e=>setPoForm({...poForm,approvedBy:e.target.value})} placeholder="Name of authorising manager"/>
                </Field>
              </Row2>
              <Row2>
                <Field label="Supplier Invoice / Reference No.">
                  <input {...inp} value={poForm.invoiceNumber} onChange={e=>setPoForm({...poForm,invoiceNumber:e.target.value})} placeholder="On delivery/invoice from supplier"/>
                </Field>
                <Field label="Date Received">
                  <input type="date" {...inp} value={poForm.receivedDate} onChange={e=>setPoForm({...poForm,receivedDate:e.target.value})}/>
                </Field>
              </Row2>
              <Field label="Delivery Address">
                <input {...inp} value={poForm.deliveryAddress} onChange={e=>setPoForm({...poForm,deliveryAddress:e.target.value})} placeholder="Where should goods be delivered?"/>
              </Field>

              {/* LINE ITEMS */}
              <div style={{fontSize:11,fontWeight:700,color:C.red,textTransform:"uppercase",letterSpacing:1,margin:"20px 0 12px"}}>
                Line Items
                <span style={{fontSize:10,color:C.muted,fontWeight:400,marginLeft:8,textTransform:"none"}}>— what you are ordering</span>
              </div>
              <div style={{background:C.surface,borderRadius:8,border:`1px solid ${C.border}`,overflow:"hidden",marginBottom:14}}>
                {(poForm.items||[]).length>0&&(
                  <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`}}>
                    {(poForm.items||[]).map((item,idx)=>(
                      <div key={idx} style={{display:"flex",alignItems:"center",gap:10,marginBottom:idx<(poForm.items||[]).length-1?8:0}}>
                        <div style={{flex:3,fontSize:12,fontWeight:600,color:C.text}}>{item.description}</div>
                        <div style={{flex:1,fontSize:12,color:C.muted}}>Qty: {item.qty} {item.unit}</div>
                        <div style={{flex:1,fontSize:12}}>{item.unitPrice?fmt(item.unitPrice)+"/unit":"No price"}</div>
                        <div style={{fontSize:12,fontWeight:700,color:C.text,flex:1}}>{item.unitPrice?fmt(Number(item.qty)*Number(item.unitPrice)):"—"}</div>
                        <button onClick={()=>setPoForm({...poForm,items:(poForm.items||[]).filter((_,i)=>i!==idx)})} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:14}}>×</button>
                      </div>
                    ))}
                    <div style={{borderTop:`1px solid ${C.border}`,marginTop:8,paddingTop:8,display:"flex",justifyContent:"flex-end"}}>
                      <span style={{fontSize:13,fontWeight:800,color:C.text}}>Order Total: {fmt((poForm.items||[]).reduce((s,i)=>s+Number(i.qty||0)*Number(i.unitPrice||0),0))}</span>
                    </div>
                  </div>
                )}
                <div style={{padding:"12px 14px"}}>
                  <div style={{fontSize:11,color:C.muted,marginBottom:8,fontWeight:600}}>Add line item:</div>
                  <div style={{display:"flex",gap:8,alignItems:"flex-end",flexWrap:"wrap"}}>
                    <div style={{flex:3}}><input style={{...inp.style,fontSize:12}} id="po_desc" placeholder="Description / Part Name" defaultValue=""/></div>
                    <div style={{flex:1}}><input type="number" id="po_qty" min="1" defaultValue="1" style={{...inp.style,fontSize:12}} placeholder="Qty"/></div>
                    <div style={{flex:1}}><input style={{...inp.style,fontSize:12}} id="po_unit" defaultValue="each" placeholder="Unit"/></div>
                    <div style={{flex:1}}><input type="number" id="po_price" style={{...inp.style,fontSize:12}} placeholder="Unit Price (R)"/></div>
                    <Btn size="sm" variant="outline" onClick={()=>{
                      const desc=document.getElementById("po_desc");
                      const qty=document.getElementById("po_qty");
                      const unit=document.getElementById("po_unit");
                      const price=document.getElementById("po_price");
                      if(!desc.value.trim()){toast("Enter a description.","error");return;}
                      setPoForm({...poForm,items:[...(poForm.items||[]),{description:desc.value.trim(),qty:Number(qty.value||1),unit:unit.value||"each",unitPrice:price.value?Number(price.value):0}]});
                      desc.value=""; qty.value="1"; unit.value="each"; price.value="";
                    }}>＋ Add</Btn>
                  </div>
                </div>
              </div>

              <Field label="Notes / Special Instructions">
                <input {...inp} value={poForm.notes} onChange={e=>setPoForm({...poForm,notes:e.target.value})} placeholder="Delivery instructions, quality specs, warranty requirements..."/>
              </Field>

              <div style={{display:"flex",gap:10,marginTop:20,paddingTop:16,borderTop:`1px solid ${C.border}`}}>
                <Btn style={{flex:1,justifyContent:"center"}} onClick={()=>{
                  if(!poForm.supplierId||!poForm.poNumber){toast("Select a supplier and set a PO number.","error");return;}
                  if((poForm.items||[]).length===0){toast("Add at least one line item.","error");return;}
                  if(poForm.id){
                    update("mcw_pos",setPurchaseOrders,purchaseOrders,poForm.id,poForm);
                    toast("Purchase order updated.");
                  } else {
                    add("mcw_pos",setPurchaseOrders,purchaseOrders,poForm);
                    toast(`${poForm.poNumber} raised successfully.`);
                  }
                  setPoModal(null);
                }}>{poForm.id?"Save Changes":"Raise Purchase Order"}</Btn>
                <Btn variant="ghost" onClick={()=>setPoModal(null)}>Cancel</Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW / PRINT MODAL */}
      {poView&&(()=>{
        const supplier=suppliers.find(s=>s.id===poView.supplierId);
        const total=getPoTotal(poView);
        const project=projects.find(p=>p.id===poView.projectId);
        return (
          <div style={{position:"fixed",inset:0,background:"rgba(17,19,24,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:20,backdropFilter:"blur(4px)"}}>
            <div style={{background:C.white,borderRadius:14,width:"100%",maxWidth:780,maxHeight:"94vh",overflowY:"auto",boxShadow:"0 32px 100px rgba(0,0,0,0.4)"}}>
              {/* PO DARK HEADER */}
              <div style={{background:C.dark,padding:"24px 32px",borderRadius:"14px 14px 0 0"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                      <div style={{background:C.red,borderRadius:6,padding:"4px 12px"}}>
                        <span style={{color:"white",fontSize:11,fontWeight:900,fontFamily:"monospace",letterSpacing:1}}>{poView.poNumber}</span>
                      </div>
                      <Pill text={poView.status} color={statusColor(poView.status)}/>
                      <Pill text={poView.type} color="blue"/>
                    </div>
                    <div style={{fontSize:22,fontWeight:800,color:"white",fontFamily:"'Barlow Condensed',sans-serif"}}>{supplier?.name||"Unknown Supplier"}</div>
                    <div style={{fontSize:12,color:"#6B7280",marginTop:2}}>
                      {supplier?.contactPerson&&`${supplier.contactPerson}`}{supplier?.phone?` · ${supplier.phone}`:""}{supplier?.email?` · ${supplier.email}`:""}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>window.print()} style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:6,padding:"7px 14px",color:"white",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>⬒ Print PO</button>
                    <button onClick={()=>setPoView(null)} style={{background:"none",border:"none",color:"#6B7280",fontSize:18,cursor:"pointer"}}>✕</button>
                  </div>
                </div>
              </div>

              <div style={{padding:"24px 32px"}}>
                {/* META GRID */}
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
                  {[
                    {l:"Date Raised",v:poView.dateCreated},
                    {l:"Date Required",v:poView.dateRequired||"Not specified"},
                    {l:"Payment Terms",v:poView.terms||"—"},
                    {l:"Approved By",v:poView.approvedBy||"Pending approval"},
                    {l:"Invoice / Ref No.",v:poView.invoiceNumber||"Not received yet"},
                    {l:"Date Received",v:poView.receivedDate||"Not received"},
                    {l:"Delivery Address",v:poView.deliveryAddress||"Not specified"},
                    {l:"Project Allocation",v:project?.name||"Not allocated"},
                    {l:"Notes",v:poView.notes||"None"},
                  ].map(item=>(
                    <div key={item.l} style={{background:C.surface,borderRadius:7,padding:"10px 12px"}}>
                      <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:3}}>{item.l}</div>
                      <div style={{fontSize:12,fontWeight:600,color:C.text}}>{item.v}</div>
                    </div>
                  ))}
                </div>

                {/* LINE ITEMS */}
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:0.8,marginBottom:10}}>Line Items</div>
                  <div style={{border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                      <thead>
                        <tr style={{background:C.surface}}>
                          {["#","Description","Qty","Unit","Unit Price","Line Total"].map(h=>(
                            <th key={h} style={{padding:"9px 12px",textAlign:"left",color:C.muted,fontWeight:700,fontSize:10,textTransform:"uppercase",borderBottom:`1px solid ${C.border}`}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(poView.items||[]).map((item,i)=>(
                          <tr key={i} style={{background:i%2===0?C.white:C.surface,borderBottom:`1px solid ${C.border}`}}>
                            <td style={{padding:"9px 12px",color:C.muted}}>{i+1}</td>
                            <td style={{padding:"9px 12px",fontWeight:600}}>{item.description}</td>
                            <td style={{padding:"9px 12px",fontWeight:700,color:C.info}}>{item.qty}</td>
                            <td style={{padding:"9px 12px",color:C.muted}}>{item.unit||"each"}</td>
                            <td style={{padding:"9px 12px"}}>{item.unitPrice?fmt(item.unitPrice):"—"}</td>
                            <td style={{padding:"9px 12px",fontWeight:700}}>{item.unitPrice?fmt(Number(item.qty)*Number(item.unitPrice)):"—"}</td>
                          </tr>
                        ))}
                        <tr style={{background:C.dark}}>
                          <td colSpan={5} style={{padding:"10px 12px",fontWeight:800,color:"white",fontSize:11,textTransform:"uppercase",letterSpacing:0.5}}>Order Total (excl. VAT)</td>
                          <td style={{padding:"10px 12px",fontWeight:800,color:"#93C5FD",fontFamily:"'Barlow Condensed',sans-serif",fontSize:17}}>{fmt(total)}</td>
                        </tr>
                        <tr style={{background:"#0F1117"}}>
                          <td colSpan={5} style={{padding:"8px 12px",fontWeight:700,color:"#6B7280",fontSize:11}}>VAT @ 15%</td>
                          <td style={{padding:"8px 12px",fontWeight:700,color:"#6B7280",fontSize:13,fontFamily:"'Barlow Condensed',sans-serif"}}>{fmt(total*0.15)}</td>
                        </tr>
                        <tr style={{background:"#0F1117"}}>
                          <td colSpan={5} style={{padding:"8px 12px",fontWeight:800,color:"white",fontSize:11,textTransform:"uppercase"}}>Total Incl. VAT</td>
                          <td style={{padding:"8px 12px",fontWeight:900,color:"#FDE68A",fontSize:17,fontFamily:"'Barlow Condensed',sans-serif"}}>{fmt(total*1.15)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* SIGNATURES */}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginTop:24,paddingTop:20,borderTop:`2px solid ${C.border}`}}>
                  {["Requested By","Authorised By (Mapitsi)","Supplier Acknowledgement"].map(role=>(
                    <div key={role} style={{textAlign:"center"}}>
                      <div style={{height:50,borderBottom:`1px solid ${C.text}`,marginBottom:6}}/>
                      <div style={{fontSize:10,color:C.muted,fontWeight:600}}>{role}</div>
                      <div style={{fontSize:9,color:C.mutedLt,marginTop:2}}>Signature & Date</div>
                    </div>
                  ))}
                </div>

                <div style={{marginTop:16,display:"flex",gap:10,justifyContent:"flex-end"}}>
                  {can(currentUser,"canEdit")&&!["Fully Received","Cancelled"].includes(poView.status)&&(
                    <Btn variant="outline" size="sm" onClick={()=>{setPoForm({...dPO,...poView});setPoView(null);setPoModal("form");}}>Edit PO</Btn>
                  )}
                  <Btn variant="ghost" size="sm" onClick={()=>setPoView(null)}>Close</Btn>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function JobCardsTab({ assets, jobCards, setJobCards, spares, setSpares, maint, setMaint, suppliers, employees, projects, siteNames, currentUser, persist, add, update, del, logAudit, toast, can, fmt, today, C, inp, Field, Row2, Btn, Card, Tbl, TR, Empty, KPI, Pill, PageTitle, depreciate }) {
  const JOB_CARD_STATUS_LOCAL = ["Open","Assigned","In Progress","Awaiting Parts","Complete","Invoiced","Cancelled"];
  const JOB_CARD_PRIORITY_LOCAL = ["Critical","High","Medium","Low"];
  const JOB_CARD_TYPE_LOCAL = ["Scheduled Service","Breakdown Repair","Preventive Maintenance","Tyre Change","Electrical Fault","Hydraulic Repair","Body & Paint","Safety Inspection","Warranty Claim","Other"];

  const dJC = { assetId:"", type:"Breakdown Repair", priority:"High", description:"", reportedBy:"", assignedTo:"", supplierId:"", status:"Open", openedDate:today(), scheduledDate:"", completedDate:"", odometerAtOpen:"", estimatedCost:"", actualCost:"", invoiceNumber:"", partsUsed:[], workDone:"", rootCause:"", notes:"" };

  const [jcForm, setJcForm] = useState(dJC);
  const [jcModal, setJcModal] = useState(null);
  const [jcView, setJcView] = useState(null);
  const [jcFilter, setJcFilter] = useState("All");

  const openJCs = jobCards.filter(j => j.status !== "Complete" && j.status !== "Cancelled" && j.status !== "Invoiced").length;
  const criticalJCs = jobCards.filter(j => j.priority === "Critical" && j.status !== "Complete" && j.status !== "Cancelled").length;
  const totalRepairCost = jobCards.reduce((s,j) => s + Number(j.actualCost||0), 0);
  const avgResolutionDays = (() => {
    const completed = jobCards.filter(j => j.completedDate && j.openedDate);
    if (!completed.length) return null;
    return (completed.reduce((s,j) => s + Math.max(0, Math.round((new Date(j.completedDate) - new Date(j.openedDate))/(1000*60*60*24))),0) / completed.length).toFixed(1);
  })();
  const filteredJCs = jcFilter === "All" ? jobCards : jobCards.filter(j => j.status === jcFilter);
  const statusColor = s => s==="Complete"||s==="Invoiced"?"green":s==="In Progress"?"blue":s==="Awaiting Parts"?"yellow":s==="Cancelled"?"gray":"yellow";
  const priorityColor = p => p==="Critical"?"red":p==="High"?"yellow":p==="Medium"?"blue":"gray";

  return (
    <div>
      <PageTitle
        title="JOB CARD MANAGEMENT"
        sub="Full lifecycle workshop control — open, assign, track parts, close and invoice"
        action={can(currentUser,"canAdd") && <Btn onClick={() => { setJcForm(dJC); setJcModal("form"); }}>＋ Open Job Card</Btn>}
      />

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",gap:14,marginBottom:22}}>
        <KPI label="Total Job Cards" value={jobCards.length} color={C.info} icon="🔧" sub="all time"/>
        <KPI label="Open / Active" value={openJCs} color={openJCs>0?C.warn:C.success} icon="⚑" sub="requiring attention"/>
        <KPI label="Critical Priority" value={criticalJCs} color={criticalJCs>0?C.red:C.success} icon="⚠" sub="immediate action"/>
        <KPI label="Total Repair Cost" value={fmt(totalRepairCost)} color={C.muted} icon="₽" sub="all completed cards"/>
        <KPI label="Avg Resolution" value={avgResolutionDays?`${avgResolutionDays}d`:"—"} color={C.info} icon="◷" sub="days to complete"/>
        <KPI label="Completed" value={jobCards.filter(j=>j.status==="Complete"||j.status==="Invoiced").length} color={C.success} icon="✓" sub="closed cards"/>
      </div>

      {/* CRITICAL BANNER */}
      {criticalJCs > 0 && (
        <div style={{background:C.redLight,border:`1px solid ${C.redBorder}`,borderRadius:10,padding:"14px 18px",marginBottom:18}}>
          <div style={{fontSize:13,fontWeight:700,color:C.red,marginBottom:10}}>⚠ Critical Job Cards — Immediate Attention Required</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {jobCards.filter(j=>j.priority==="Critical"&&j.status!=="Complete"&&j.status!=="Cancelled").map(j => {
              const asset = assets.find(a=>a.id===j.assetId);
              const daysOpen = Math.round((new Date()-new Date(j.openedDate))/(1000*60*60*24));
              return (
                <div key={j.id} onClick={()=>setJcView(j)} style={{background:C.white,border:`1px solid ${C.redBorder}`,borderRadius:8,padding:"8px 14px",cursor:"pointer"}}>
                  <div style={{fontWeight:700,fontSize:12,color:C.text}}>{asset?.name||"—"} — {j.type}</div>
                  <div style={{fontSize:11,color:C.red}}>{daysOpen}d open · {j.status}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* FILTER BAR */}
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        {["All",...JOB_CARD_STATUS_LOCAL].map(s => (
          <button key={s} onClick={()=>setJcFilter(s)} style={{
            padding:"6px 14px",borderRadius:20,border:`1px solid ${jcFilter===s?C.red:C.border}`,
            background:jcFilter===s?C.red:C.white,color:jcFilter===s?"white":C.muted,
            fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s"
          }}>
            {s} {s!=="All"&&jobCards.filter(j=>j.status===s).length>0&&`(${jobCards.filter(j=>j.status===s).length})`}
          </button>
        ))}
      </div>

      {/* TABLE */}
      {filteredJCs.length === 0 ? (
        <Empty icon="🔧" title={jcFilter==="All"?"No job cards yet":`No ${jcFilter} job cards`}
          desc="Open a job card for every maintenance task — scheduled or breakdown. This creates a full audit trail from fault reported to invoice paid."
          btn={<Btn onClick={()=>{setJcForm(dJC);setJcModal("form");}}>Open First Job Card</Btn>}/>
      ) : (
        <Card>
          <Tbl cols={["JC No.","Asset","Type","Priority","Status","Assigned To","Opened","Est. Cost","Actual Cost","Parts",""]}>
            {[...filteredJCs].sort((a,b) => {
              const po={Critical:0,High:1,Medium:2,Low:3};
              if(a.status!=="Complete"&&b.status==="Complete") return -1;
              if(a.status==="Complete"&&b.status!=="Complete") return 1;
              return (po[a.priority]||2)-(po[b.priority]||2);
            }).map((j,i) => {
              const asset=assets.find(a=>a.id===j.assetId);
              const supplier=suppliers.find(s=>s.id===j.supplierId);
              const daysOpen=j.completedDate
                ?Math.round((new Date(j.completedDate)-new Date(j.openedDate))/(1000*60*60*24))
                :Math.round((new Date()-new Date(j.openedDate))/(1000*60*60*24));
              const partsTotal=(j.partsUsed||[]).reduce((s,p)=>s+(Number(p.qty)*Number(p.unitCost||0)),0);
              const jcNumber=`JC-${j.id.slice(-6).toUpperCase()}`;
              return (
                <TR key={j.id} stripe={i%2!==0} cells={[
                  <div>
                    <div style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:C.red}}>{jcNumber}</div>
                    <div style={{fontSize:10,color:C.muted}}>{daysOpen}d {j.completedDate?"total":"open"}</div>
                  </div>,
                  <div>
                    <div style={{fontWeight:700,fontSize:12,color:C.text}}>{asset?.name||"—"}</div>
                    <div style={{fontSize:10,color:C.mutedLt}}>{asset?.category||""}</div>
                  </div>,
                  <span style={{fontSize:12}}>{j.type}</span>,
                  <Pill text={j.priority} color={priorityColor(j.priority)}/>,
                  <Pill text={j.status} color={statusColor(j.status)}/>,
                  <span style={{fontSize:12,color:C.muted}}>{j.assignedTo||supplier?.name||"Unassigned"}</span>,
                  <span style={{fontSize:12,color:C.muted}}>{j.openedDate}</span>,
                  <span style={{fontSize:12}}>{j.estimatedCost?fmt(j.estimatedCost):"—"}</span>,
                  <span style={{fontWeight:700,color:j.actualCost?C.text:C.mutedLt}}>{j.actualCost?fmt(j.actualCost):"—"}</span>,
                  <div>
                    {(j.partsUsed||[]).length>0?(
                      <div>
                        <Pill text={`${(j.partsUsed||[]).length} part${(j.partsUsed||[]).length!==1?"s":""}`} color="blue"/>
                        <div style={{fontSize:10,color:C.muted,marginTop:2}}>{fmt(partsTotal)}</div>
                      </div>
                    ):<span style={{color:C.mutedLt,fontSize:11}}>None</span>}
                  </div>,
                  <div style={{display:"flex",gap:4}}>
                    <button onClick={()=>setJcView(j)} style={{color:C.info,background:"none",border:"none",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>View</button>
                    {can(currentUser,"canEdit")&&j.status!=="Invoiced"&&(
                      <button onClick={()=>{setJcForm({...dJC,...j});setJcModal("form");}} style={{color:C.warn,background:"none",border:"none",cursor:"pointer",fontSize:11,fontWeight:600,fontFamily:"'DM Sans',sans-serif"}}>Edit</button>
                    )}
                    {can(currentUser,"canDelete")&&(
                      <button onClick={()=>del("mcw_jobcards",setJobCards,jobCards,j.id)} style={{color:C.muted,background:"none",border:"none",cursor:"pointer",fontSize:14,padding:"0 4px"}}>×</button>
                    )}
                  </div>
                ]}/>
              );
            })}
          </Tbl>
        </Card>
      )}

      {/* JC FORM MODAL */}
      {jcModal==="form" && (
        <div style={{position:"fixed",inset:0,background:"rgba(17,19,24,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:20,backdropFilter:"blur(3px)"}}>
          <div style={{background:C.white,borderRadius:14,width:"100%",maxWidth:680,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 24px 80px rgba(0,0,0,0.3)",border:`1px solid ${C.border}`}}>
            <div style={{padding:"20px 28px",borderBottom:`1px solid ${C.border}`,background:C.surface,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:10}}>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:C.text}}>{jcForm.id?`Edit Job Card JC-${jcForm.id.slice(-6).toUpperCase()}`:"Open New Job Card"}</div>
                <div style={{fontSize:12,color:C.muted,marginTop:2}}>Complete all details for a full audit trail</div>
              </div>
              <button onClick={()=>setJcModal(null)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:C.mutedLt}}>✕</button>
            </div>
            <div style={{padding:"22px 28px"}}>
              <div style={{fontSize:11,fontWeight:700,color:C.red,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>Job Details</div>
              <Field label="Asset" required>
                <select {...inp} value={jcForm.assetId} onChange={e=>setJcForm({...jcForm,assetId:e.target.value})}>
                  <option value="">— Select Asset —</option>
                  {assets.map(a=><option key={a.id} value={a.id}>{a.name} · {a.category} · {a.location}</option>)}
                </select>
              </Field>
              <Row2>
                <Field label="Job Type" required>
                  <select {...inp} value={jcForm.type} onChange={e=>setJcForm({...jcForm,type:e.target.value})}>
                    {JOB_CARD_TYPE_LOCAL.map(t=><option key={t}>{t}</option>)}
                  </select>
                </Field>
                <Field label="Priority" required>
                  <select {...inp} value={jcForm.priority} onChange={e=>setJcForm({...jcForm,priority:e.target.value})}>
                    {JOB_CARD_PRIORITY_LOCAL.map(p=><option key={p}>{p}</option>)}
                  </select>
                </Field>
              </Row2>
              <Field label="Fault Description / Work Required" required>
                <input {...inp} value={jcForm.description} onChange={e=>setJcForm({...jcForm,description:e.target.value})} placeholder="Describe the fault, symptoms or work to be carried out in detail..."/>
              </Field>
              <Row2>
                <Field label="Reported By">
                  <input {...inp} value={jcForm.reportedBy} onChange={e=>setJcForm({...jcForm,reportedBy:e.target.value})} placeholder="Who reported the fault?"/>
                </Field>
                <Field label="Odometer / Hours at Open">
                  <input {...inp} value={jcForm.odometerAtOpen} onChange={e=>setJcForm({...jcForm,odometerAtOpen:e.target.value})} placeholder="e.g. 14 500 km or 890 hrs"/>
                </Field>
              </Row2>

              <div style={{fontSize:11,fontWeight:700,color:C.red,textTransform:"uppercase",letterSpacing:1,margin:"20px 0 12px"}}>Assignment & Scheduling</div>
              <Row2>
                <Field label="Assign To (Internal)">
                  {employees.length>0?(
                    <select {...inp} value={jcForm.assignedTo} onChange={e=>setJcForm({...jcForm,assignedTo:e.target.value})}>
                      <option value="">— Internal Employee —</option>
                      {employees.filter(e=>e.status==="Active").map(e=><option key={e.id} value={e.name}>{e.name} · {e.role}</option>)}
                    </select>
                  ):(
                    <input {...inp} value={jcForm.assignedTo} onChange={e=>setJcForm({...jcForm,assignedTo:e.target.value})} placeholder="Mechanic or technician name"/>
                  )}
                </Field>
                <Field label="External Supplier">
                  <select {...inp} value={jcForm.supplierId} onChange={e=>setJcForm({...jcForm,supplierId:e.target.value})}>
                    <option value="">— No External Supplier —</option>
                    {suppliers.map(s=><option key={s.id} value={s.id}>{s.name} · {s.type}</option>)}
                  </select>
                </Field>
              </Row2>
              <Row2>
                <Field label="Date Opened" required>
                  <input type="date" {...inp} value={jcForm.openedDate} onChange={e=>setJcForm({...jcForm,openedDate:e.target.value})}/>
                </Field>
                <Field label="Scheduled Date">
                  <input type="date" {...inp} value={jcForm.scheduledDate} onChange={e=>setJcForm({...jcForm,scheduledDate:e.target.value})}/>
                </Field>
              </Row2>

              <div style={{fontSize:11,fontWeight:700,color:C.red,textTransform:"uppercase",letterSpacing:1,margin:"20px 0 12px"}}>Status & Costs</div>
              <Row2>
                <Field label="Status" required>
                  <select {...inp} value={jcForm.status} onChange={e=>setJcForm({...jcForm,status:e.target.value})}>
                    {JOB_CARD_STATUS_LOCAL.map(s=><option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Completed Date">
                  <input type="date" {...inp} value={jcForm.completedDate} onChange={e=>setJcForm({...jcForm,completedDate:e.target.value})}/>
                </Field>
              </Row2>
              <Row2>
                <Field label="Estimated Cost (R)">
                  <input type="number" {...inp} value={jcForm.estimatedCost} onChange={e=>setJcForm({...jcForm,estimatedCost:e.target.value})} placeholder="0.00"/>
                </Field>
                <Field label="Actual / Invoice Cost (R)">
                  <input type="number" {...inp} value={jcForm.actualCost} onChange={e=>setJcForm({...jcForm,actualCost:e.target.value})} placeholder="0.00"/>
                </Field>
              </Row2>
              <Row2>
                <Field label="Invoice / Reference Number">
                  <input {...inp} value={jcForm.invoiceNumber} onChange={e=>setJcForm({...jcForm,invoiceNumber:e.target.value})} placeholder="Supplier invoice number"/>
                </Field>
                <Field label="Root Cause">
                  <input {...inp} value={jcForm.rootCause} onChange={e=>setJcForm({...jcForm,rootCause:e.target.value})} placeholder="What caused the fault?"/>
                </Field>
              </Row2>
              <Field label="Work Done / Resolution Notes">
                <input {...inp} value={jcForm.workDone} onChange={e=>setJcForm({...jcForm,workDone:e.target.value})} placeholder="Describe work completed, repairs made, parts replaced..."/>
              </Field>

              <div style={{fontSize:11,fontWeight:700,color:C.red,textTransform:"uppercase",letterSpacing:1,margin:"20px 0 12px"}}>
                Parts & Spares Used
                <span style={{fontSize:10,color:C.muted,fontWeight:400,marginLeft:8,textTransform:"none"}}>— deducted from inventory on save</span>
              </div>
              <div style={{background:C.surface,borderRadius:8,border:`1px solid ${C.border}`,overflow:"hidden",marginBottom:14}}>
                {(jcForm.partsUsed||[]).length>0&&(
                  <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`}}>
                    {(jcForm.partsUsed||[]).map((p,idx)=>(
                      <div key={idx} style={{display:"flex",alignItems:"center",gap:10,marginBottom:idx<(jcForm.partsUsed||[]).length-1?8:0}}>
                        <div style={{flex:2,fontSize:12,fontWeight:600,color:C.text}}>{p.partName}</div>
                        <div style={{flex:1,fontSize:12,color:C.muted}}>Qty: {p.qty}</div>
                        <div style={{flex:1,fontSize:12,color:C.muted}}>{p.unitCost?fmt(p.unitCost)+"/unit":"No cost"}</div>
                        <div style={{fontSize:12,fontWeight:700,color:C.text,flex:1}}>{p.unitCost?fmt(Number(p.qty)*Number(p.unitCost)):"—"}</div>
                        <button onClick={()=>setJcForm({...jcForm,partsUsed:(jcForm.partsUsed||[]).filter((_,i)=>i!==idx)})}
                          style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:14}}>×</button>
                      </div>
                    ))}
                    <div style={{borderTop:`1px solid ${C.border}`,marginTop:8,paddingTop:8,display:"flex",justifyContent:"flex-end"}}>
                      <span style={{fontSize:12,fontWeight:800,color:C.text}}>Parts Total: {fmt((jcForm.partsUsed||[]).reduce((s,p)=>s+Number(p.qty||0)*Number(p.unitCost||0),0))}</span>
                    </div>
                  </div>
                )}
                <div style={{padding:"12px 14px"}}>
                  <div style={{fontSize:11,color:C.muted,marginBottom:8,fontWeight:600}}>Add part from inventory:</div>
                  <div style={{display:"flex",gap:8,alignItems:"flex-end",flexWrap:"wrap"}}>
                    <div style={{flex:2}}>
                      <select style={{...inp.style,fontSize:12}} id="jc_part_select" defaultValue="">
                        <option value="">— Select Part —</option>
                        {spares.filter(s=>Number(s.quantity||0)>0).map(s=>(
                          <option key={s.id} value={s.id}>{s.partName}{s.partNumber?` (${s.partNumber})`:""} — {s.quantity} in stock{s.unitCost?` @ ${fmt(s.unitCost)}`:""}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{flex:1}}>
                      <input type="number" id="jc_part_qty" min="1" defaultValue="1" style={{...inp.style,fontSize:12}} placeholder="Qty"/>
                    </div>
                    <Btn size="sm" variant="outline" onClick={()=>{
                      const sel=document.getElementById("jc_part_select");
                      const qty=document.getElementById("jc_part_qty");
                      if(!sel.value){toast("Select a part first.","error");return;}
                      const spare=spares.find(s=>s.id===sel.value);
                      if(!spare) return;
                      const qtyNum=Math.max(1,Number(qty.value||1));
                      if(qtyNum>Number(spare.quantity||0)){toast(`Only ${spare.quantity} units in stock.`,"error");return;}
                      const existing=(jcForm.partsUsed||[]).findIndex(p=>p.spareId===spare.id);
                      if(existing>=0){
                        const updated=[...(jcForm.partsUsed||[])];
                        updated[existing]={...updated[existing],qty:Number(updated[existing].qty)+qtyNum};
                        setJcForm({...jcForm,partsUsed:updated});
                      } else {
                        setJcForm({...jcForm,partsUsed:[...(jcForm.partsUsed||[]),{spareId:spare.id,partName:spare.partName,partNumber:spare.partNumber||"",qty:qtyNum,unitCost:spare.unitCost||0}]});
                      }
                      sel.value="";qty.value="1";
                    }}>＋ Add Part</Btn>
                  </div>
                </div>
              </div>

              <Field label="Additional Notes">
                <input {...inp} value={jcForm.notes} onChange={e=>setJcForm({...jcForm,notes:e.target.value})} placeholder="Any other notes, safety observations, follow-up required..."/>
              </Field>

              <div style={{display:"flex",gap:10,marginTop:20,paddingTop:16,borderTop:`1px solid ${C.border}`}}>
                <Btn style={{flex:1,justifyContent:"center"}} onClick={()=>{
                  if(!jcForm.assetId||!jcForm.description){toast("Select an asset and describe the work required.","error");return;}
                  if((jcForm.partsUsed||[]).length>0&&!jcForm.id){
                    const updatedSpares=spares.map(s=>{
                      const used=(jcForm.partsUsed||[]).find(p=>p.spareId===s.id);
                      if(!used) return s;
                      const newQty=Math.max(0,Number(s.quantity||0)-Number(used.qty||0));
                      return{...s,quantity:newQty,status:newQty===0?"Out of Stock":Number(newQty)<=Number(s.minStockLevel||0)?"Low Stock":"In Stock"};
                    });
                    setSpares(updatedSpares);
                    persist("mcw_spares",updatedSpares);
                  }
                  if((jcForm.status==="Complete"||jcForm.status==="Invoiced")&&jcForm.actualCost&&!jcForm.id){
                    const jcRef=`JC-${Date.now().toString().slice(-6).toUpperCase()}`;
                    const maintRecord={id:Date.now().toString()+"jc",assetId:jcForm.assetId,date:jcForm.completedDate||today(),type:jcForm.type.includes("Service")?"Full Service":"Repair",description:`[${jcRef}] ${jcForm.workDone||jcForm.description}`,cost:jcForm.actualCost,performedBy:jcForm.assignedTo||(suppliers.find(s=>s.id===jcForm.supplierId)?.name||""),nextDueDate:""};
                    const updatedMaint=[...maint,maintRecord];
                    setMaint(updatedMaint);
                    persist("mcw_maint",updatedMaint);
                  }
                  if(jcForm.id){
                    update("mcw_jobcards",setJobCards,jobCards,jcForm.id,jcForm);
                    toast("Job card updated.");
                  } else {
                    add("mcw_jobcards",setJobCards,jobCards,jcForm);
                    toast(`Job card opened.${(jcForm.partsUsed||[]).length>0?` ${(jcForm.partsUsed||[]).length} part(s) deducted from inventory.`:""}${jcForm.status==="Complete"?" Maintenance record auto-created.":""}`);
                  }
                  setJcModal(null);
                }}>
                  {jcForm.id?"Save Changes":"Open Job Card"}
                </Btn>
                <Btn variant="ghost" onClick={()=>setJcModal(null)}>Cancel</Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* JC VIEW MODAL */}
      {jcView&&(()=>{
        const asset=assets.find(a=>a.id===jcView.assetId);
        const supplier=suppliers.find(s=>s.id===jcView.supplierId);
        const partsTotal=(jcView.partsUsed||[]).reduce((s,p)=>s+Number(p.qty||0)*Number(p.unitCost||0),0);
        const daysOpen=jcView.completedDate
          ?Math.round((new Date(jcView.completedDate)-new Date(jcView.openedDate))/(1000*60*60*24))
          :Math.round((new Date()-new Date(jcView.openedDate))/(1000*60*60*24));
        const jcNumber=`JC-${jcView.id.slice(-6).toUpperCase()}`;
        return (
          <div style={{position:"fixed",inset:0,background:"rgba(17,19,24,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:20,backdropFilter:"blur(4px)"}}>
            <div style={{background:C.white,borderRadius:14,width:"100%",maxWidth:720,maxHeight:"94vh",overflowY:"auto",boxShadow:"0 32px 100px rgba(0,0,0,0.4)"}}>
              <div style={{background:C.dark,padding:"24px 32px",borderRadius:"14px 14px 0 0"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
                      <div style={{background:C.red,borderRadius:6,padding:"4px 12px"}}>
                        <span style={{color:"white",fontSize:11,fontWeight:900,fontFamily:"monospace",letterSpacing:1}}>{jcNumber}</span>
                      </div>
                      <Pill text={jcView.priority} color={priorityColor(jcView.priority)}/>
                      <Pill text={jcView.status} color={statusColor(jcView.status)}/>
                    </div>
                    <div style={{fontSize:20,fontWeight:800,color:"white",fontFamily:"'Barlow Condensed',sans-serif"}}>{asset?.name||"Unknown Asset"}</div>
                    <div style={{fontSize:12,color:"#6B7280",marginTop:2}}>{asset?.category} · {asset?.serialNumber||"No serial"} · {asset?.location}</div>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>window.print()} style={{background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:6,padding:"7px 14px",color:"white",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>⬒ Print</button>
                    <button onClick={()=>setJcView(null)} style={{background:"none",border:"none",color:"#6B7280",fontSize:18,cursor:"pointer"}}>✕</button>
                  </div>
                </div>
              </div>
              <div style={{padding:"24px 32px"}}>
                <div style={{background:C.redLight,border:`1px solid ${C.redBorder}`,borderRadius:9,padding:"14px 18px",marginBottom:20}}>
                  <div style={{fontSize:11,color:C.red,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>Fault / Work Description</div>
                  <div style={{fontSize:13,color:C.text,fontWeight:600}}>{jcView.description}</div>
                  {jcView.reportedBy&&<div style={{fontSize:11,color:C.muted,marginTop:4}}>Reported by: {jcView.reportedBy}</div>}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
                  {[
                    {l:"Job Type",v:jcView.type},
                    {l:"Date Opened",v:jcView.openedDate},
                    {l:"Duration",v:`${daysOpen} day${daysOpen!==1?"s":""}`},
                    {l:"Assigned To",v:jcView.assignedTo||supplier?.name||"Unassigned"},
                    {l:"Scheduled Date",v:jcView.scheduledDate||"Not scheduled"},
                    {l:"Completed Date",v:jcView.completedDate||"Not completed"},
                    {l:"Odometer / Hours",v:jcView.odometerAtOpen||"Not recorded"},
                    {l:"Invoice Number",v:jcView.invoiceNumber||"Not invoiced"},
                    {l:"Root Cause",v:jcView.rootCause||"Not identified"},
                  ].map(item=>(
                    <div key={item.l} style={{background:C.surface,borderRadius:7,padding:"10px 12px"}}>
                      <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:3}}>{item.l}</div>
                      <div style={{fontSize:12,fontWeight:600,color:C.text}}>{item.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
                  {[
                    {l:"Estimated Cost",v:jcView.estimatedCost?fmt(jcView.estimatedCost):"—",c:C.muted},
                    {l:"Parts Cost",v:fmt(partsTotal),c:C.info},
                    {l:"Total Actual Cost",v:jcView.actualCost?fmt(Number(jcView.actualCost)+partsTotal):fmt(partsTotal),c:C.red},
                  ].map(item=>(
                    <div key={item.l} style={{background:C.surface,borderRadius:7,padding:"12px 14px",borderLeft:`3px solid ${item.c}`}}>
                      <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:4}}>{item.l}</div>
                      <div style={{fontSize:18,fontWeight:800,color:item.c,fontFamily:"'Barlow Condensed',sans-serif"}}>{item.v}</div>
                    </div>
                  ))}
                </div>
                {(jcView.partsUsed||[]).length>0&&(
                  <div style={{marginBottom:20}}>
                    <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:0.8,marginBottom:10}}>Parts & Spares Used</div>
                    <div style={{border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
                      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                        <thead>
                          <tr style={{background:C.surface}}>
                            {["Part Name","Part No.","Qty","Unit Cost","Total"].map(h=>(
                              <th key={h} style={{padding:"8px 12px",textAlign:"left",color:C.muted,fontWeight:700,fontSize:10,textTransform:"uppercase",borderBottom:`1px solid ${C.border}`}}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(jcView.partsUsed||[]).map((p,i)=>(
                            <tr key={i} style={{background:i%2===0?C.white:C.surface,borderBottom:`1px solid ${C.border}`}}>
                              <td style={{padding:"8px 12px",fontWeight:600}}>{p.partName}</td>
                              <td style={{padding:"8px 12px",color:C.muted,fontFamily:"monospace"}}>{p.partNumber||"—"}</td>
                              <td style={{padding:"8px 12px",fontWeight:700,color:C.info}}>{p.qty}</td>
                              <td style={{padding:"8px 12px"}}>{p.unitCost?fmt(p.unitCost):"—"}</td>
                              <td style={{padding:"8px 12px",fontWeight:700}}>{p.unitCost?fmt(Number(p.qty)*Number(p.unitCost)):"—"}</td>
                            </tr>
                          ))}
                          <tr style={{background:C.dark}}>
                            <td colSpan={4} style={{padding:"8px 12px",fontWeight:800,color:"white",fontSize:11,textTransform:"uppercase"}}>Parts Total</td>
                            <td style={{padding:"8px 12px",fontWeight:800,color:"#93C5FD",fontFamily:"'Barlow Condensed',sans-serif",fontSize:15}}>{fmt(partsTotal)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {jcView.workDone&&(
                  <div style={{background:C.successBg,border:"1px solid #A7F3D0",borderRadius:9,padding:"14px 18px",marginBottom:14}}>
                    <div style={{fontSize:11,color:C.success,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:6}}>Work Completed</div>
                    <div style={{fontSize:13,color:C.text}}>{jcView.workDone}</div>
                  </div>
                )}
                {jcView.notes&&(
                  <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:"12px 16px",marginBottom:14}}>
                    <div style={{fontSize:11,color:C.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:0.8,marginBottom:4}}>Notes</div>
                    <div style={{fontSize:12,color:C.text}}>{jcView.notes}</div>
                  </div>
                )}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginTop:24,paddingTop:20,borderTop:`2px solid ${C.border}`}}>
                  {["Technician / Mechanic","Supervisor / Foreman","Plant Manager"].map(role=>(
                    <div key={role} style={{textAlign:"center"}}>
                      <div style={{height:50,borderBottom:`1px solid ${C.text}`,marginBottom:6}}/>
                      <div style={{fontSize:10,color:C.muted,fontWeight:600}}>{role}</div>
                      <div style={{fontSize:9,color:C.mutedLt,marginTop:2}}>Signature & Date</div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:16,display:"flex",gap:10,justifyContent:"flex-end"}}>
                  {can(currentUser,"canEdit")&&jcView.status!=="Invoiced"&&(
                    <Btn variant="outline" size="sm" onClick={()=>{setJcForm({...dJC,...jcView});setJcView(null);setJcModal("form");}}>Edit Job Card</Btn>
                  )}
                  <Btn variant="ghost" size="sm" onClick={()=>setJcView(null)}>Close</Btn>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function AIAssistTab({ assets, maint, fuel, incidents, compliance, spares, jobCards, projects, employees, company, currentUser, getProjectSpend, depreciate, allAlerts, expiringSoon, employeesOnLeave, totalCost, totalBook, fmt, today, monthLabel, C, Btn, KPI }) {
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const QUICK_PROMPTS = [
    "Which asset is costing us the most in maintenance this year?",
    "Which assets are due for service in the next 30 days?",
    "Which operator has the most incidents on record?",
    "What is the total cost of ownership of our TLBs?",
    "Which assets have not been fuelled this month?",
    "Summarise our fleet health — what needs urgent attention?",
    "Which supplier do we spend the most money with?",
    "What is our average fuel cost per litre across all assets?",
    "List all assets that are fully depreciated but still active.",
    "Which project is most over budget right now?",
  ];

  const buildFleetContext = () => `
You are the AI Plant Assistant for ${company.name||"Mapitsi Civil Works"} — a professional South African civil engineering company. You have complete live access to their fleet management data. Be precise, professional and direct. Use South African Rand (R). Flag risks and savings opportunities proactively.

TODAY: ${today()} | COMPANY: ${company.name||"Mapitsi Civil Works"} | ${company.city||"Johannesburg"} | ${company.phone||"011 394 7343"}

=== FLEET (${assets.length} assets) ===
${JSON.stringify(assets.map(a=>{const d=depreciate(a);return{name:a.name,cat:a.category,status:a.status,location:a.location,cost:Number(a.purchaseCost||0),bookValue:Math.round(d.bookValue),deprPct:Number(a.purchaseCost)>0?Math.round((d.accumulated/Number(a.purchaseCost))*100):0};}),null,1)}

=== MAINTENANCE (${maint.length} records) ===
Total Cost: R${maint.reduce((s,m)=>s+Number(m.cost||0),0).toLocaleString()}
Overdue: ${maint.filter(m=>m.nextDueDate&&m.nextDueDate<today()).length}
Per Asset: ${JSON.stringify(assets.map(a=>({asset:a.name,cost:maint.filter(m=>m.assetId===a.id).reduce((s,m)=>s+Number(m.cost||0),0),count:maint.filter(m=>m.assetId===a.id).length,lastService:[...maint].filter(m=>m.assetId===a.id).sort((x,y)=>y.date>x.date?1:-1)[0]?.date||"never"})),null,1)}

=== FUEL (${fuel.length} records) ===
Total Cost: R${fuel.reduce((s,f)=>s+Number(f.cost||0),0).toLocaleString()}
Total Litres: ${fuel.reduce((s,f)=>s+Number(f.litres||0),0).toFixed(0)}L
Avg R/L: R${fuel.reduce((s,f)=>s+Number(f.litres||0),0)>0?(fuel.reduce((s,f)=>s+Number(f.cost||0),0)/fuel.reduce((s,f)=>s+Number(f.litres||0),0)).toFixed(2):"N/A"}
Per Asset: ${JSON.stringify(assets.map(a=>({asset:a.name,cost:fuel.filter(f=>f.assetId===a.id).reduce((s,f)=>s+Number(f.cost||0),0),litres:fuel.filter(f=>f.assetId===a.id).reduce((s,f)=>s+Number(f.litres||0),0)})).filter(x=>x.litres>0),null,1)}

=== INCIDENTS (${incidents.length}) ===
Open: ${incidents.filter(i=>i.resolved==="No").length} | Downtime: ${incidents.reduce((s,i)=>s+Number(i.downtimeHours||0),0).toFixed(1)}hrs | Repair Cost: R${incidents.reduce((s,i)=>s+Number(i.repairCost||0),0).toLocaleString()}

=== PROJECTS ===
${JSON.stringify(projects.filter(p=>p.status==="Active").map(p=>{const sp=getProjectSpend(p.id);return{name:p.name,site:p.site,contractValue:Number(p.contractValue||0),spent:Math.round(sp.total),remaining:Math.round(Number(p.contractValue||0)-sp.total)};}),null,1)}

=== JOB CARDS ===
Total: ${jobCards.length} | Open: ${jobCards.filter(j=>j.status!=="Complete"&&j.status!=="Cancelled"&&j.status!=="Invoiced").length} | Critical: ${jobCards.filter(j=>j.priority==="Critical"&&j.status!=="Complete"&&j.status!=="Cancelled").length}

=== COMPLIANCE ===
Total: ${compliance.length} | Expired: ${compliance.filter(c=>c.expiryDate&&c.expiryDate<today()).length} | Expiring 30d: ${expiringSoon.length}

=== SPARES ===
Parts: ${spares.length} | Low: ${spares.filter(s=>Number(s.quantity||0)<=Number(s.minStockLevel||0)&&Number(s.minStockLevel||0)>0).length} | Out: ${spares.filter(s=>Number(s.quantity||0)===0).length} | Value: R${spares.reduce((s,x)=>s+Number(x.quantity||0)*Number(x.unitCost||0),0).toLocaleString()}

=== EMPLOYEES (${employees.length}) ===
Active: ${employees.filter(e=>e.status==="Active").length} | On Leave: ${employeesOnLeave}

=== ALERTS ===
Critical: ${allAlerts.filter(a=>a.severity==="critical").length} | Warnings: ${allAlerts.filter(a=>a.severity==="warning").length} | Info: ${allAlerts.filter(a=>a.severity==="info").length}

Portfolio: Cost R${totalCost.toLocaleString()} | Book Value R${Math.round(totalBook).toLocaleString()} | Depreciated R${Math.round(totalCost-totalBook).toLocaleString()}
`;

  const sendMessage = async (messageText) => {
    const text = (messageText || aiInput).trim();
    if (!text || aiLoading) return;
    setAiInput("");
    const userMsg = { role:"user", content:text, ts:Date.now() };
    setAiMessages(prev => [...prev, userMsg]);
    setAiLoading(true);
    try {
      const history = [...aiMessages, userMsg].filter(m=>m.role==="user"||m.role==="assistant").slice(-10).map(m=>({role:m.role,content:m.content}));
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "x-api-key":"YOUR_ANTHROPIC_API_KEY_HERE",
          "anthropic-version":"2023-06-01",
          "anthropic-dangerous-direct-browser-access":"true"
        },
        body:JSON.stringify({ model:"claude-haiku-4-5-20251001", max_tokens:1000, system:buildFleetContext(), messages:history }),
      });
      const data = await response.json();
      const replyText = data.content?.find(b=>b.type==="text")?.text || "I couldn't generate a response. Please try again.";
      setAiMessages(prev => [...prev, { role:"assistant", content:replyText, ts:Date.now() }]);
    } catch {
      setAiMessages(prev => [...prev, { role:"assistant", content:"⚠ Connection error. Please check your internet connection and try again.", ts:Date.now() }]);
    }
    setAiLoading(false);
  };

  return (
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 130px)"}}>
      <style>{`@keyframes bounce{0%,80%,100%{transform:scale(0.6);opacity:0.5;}40%{transform:scale(1);opacity:1;}}`}</style>

      {/* HEADER */}
      <div style={{marginBottom:20,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:8}}>
          <div style={{width:48,height:48,background:"linear-gradient(135deg, #8C1414 0%, #1C2030 100%)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,boxShadow:"0 4px 16px rgba(140,20,20,0.3)",flexShrink:0}}>✦</div>
          <div>
            <div style={{fontSize:22,fontWeight:800,color:C.text,letterSpacing:-0.5,fontFamily:"'Barlow Condensed',sans-serif"}}>AI PLANT ASSISTANT</div>
            <div style={{fontSize:13,color:C.muted}}>Powered by Claude · Full access to your live fleet data · Ask anything</div>
          </div>
          <div style={{marginLeft:"auto",display:"flex",gap:8,alignItems:"center"}}>
            {aiMessages.length>0&&<Btn variant="ghost" size="sm" onClick={()=>setAiMessages([])}>Clear Chat</Btn>}
            <div style={{background:C.successBg,border:"1px solid #A7F3D0",borderRadius:20,padding:"4px 12px",fontSize:11,color:C.success,fontWeight:700}}>
              ● LIVE — {assets.length} assets · {maint.length} maint · {fuel.length} fuel logs
            </div>
          </div>
        </div>
      </div>

      {/* CHAT AREA */}
      <div style={{flex:1,overflowY:"auto",background:C.white,borderRadius:12,border:`1px solid ${C.border}`,display:"flex",flexDirection:"column",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",minHeight:0}}>

        {/* WELCOME */}
        {aiMessages.length===0&&(
          <div style={{padding:"32px 32px 20px",flex:1,overflowY:"auto"}}>
            <div style={{textAlign:"center",marginBottom:32}}>
              <div style={{fontSize:40,marginBottom:12}}>✦</div>
              <div style={{fontSize:18,fontWeight:800,color:C.text,fontFamily:"'Barlow Condensed',sans-serif",marginBottom:6}}>
                Good {new Date().getHours()<12?"morning":new Date().getHours()<17?"afternoon":"evening"}, {currentUser?.name?.split(" ")[0]||"Manager"}
              </div>
              <div style={{fontSize:13,color:C.muted,maxWidth:500,margin:"0 auto"}}>
                I have complete access to your fleet — {assets.length} assets, {maint.length} maintenance records, {fuel.length} fuel logs, {incidents.length} incidents and more. Ask me anything.
              </div>
            </div>
            <div style={{fontSize:11,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:0.8,marginBottom:12,textAlign:"center"}}>Suggested Questions</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,maxWidth:700,margin:"0 auto"}}>
              {QUICK_PROMPTS.map((q,i)=>(
                <button key={i} onClick={()=>sendMessage(q)} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:"11px 14px",textAlign:"left",fontSize:12,color:C.text,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",lineHeight:1.4,transition:"all 0.15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=C.red;e.currentTarget.style.background=C.redLight;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.background=C.surface;}}>
                  <span style={{color:C.red,marginRight:6,fontWeight:700}}>→</span>{q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MESSAGES */}
        {aiMessages.length>0&&(
          <div style={{flex:1,padding:"20px 24px",display:"flex",flexDirection:"column",gap:16,overflowY:"auto"}}>
            {aiMessages.map((msg,i)=>(
              <div key={i} style={{display:"flex",gap:12,flexDirection:msg.role==="user"?"row-reverse":"row",alignItems:"flex-start"}}>
                <div style={{width:32,height:32,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,background:msg.role==="user"?C.red:C.dark,color:"white",fontFamily:"'Barlow Condensed',sans-serif"}}>
                  {msg.role==="user"?(currentUser?.name?.charAt(0)||"U"):"✦"}
                </div>
                <div style={{maxWidth:"75%",background:msg.role==="user"?C.red:C.surface,color:msg.role==="user"?"white":C.text,borderRadius:msg.role==="user"?"14px 14px 4px 14px":"14px 14px 14px 4px",padding:"12px 16px",fontSize:13,lineHeight:1.65,boxShadow:"0 2px 8px rgba(0,0,0,0.06)",border:msg.role==="user"?"none":`1px solid ${C.border}`,whiteSpace:"pre-wrap"}}>
                  {msg.content}
                </div>
              </div>
            ))}
            {aiLoading&&(
              <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:C.dark,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"white",flexShrink:0}}>✦</div>
                <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:"14px 14px 14px 4px",padding:"12px 16px",display:"flex",gap:6,alignItems:"center"}}>
                  {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:C.red,animation:`bounce 1.2s ease-in-out ${i*0.2}s infinite`,opacity:0.8}}/>)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* INLINE QUICK PROMPTS */}
        {aiMessages.length>0&&!aiLoading&&(
          <div style={{padding:"0 24px 12px",display:"flex",gap:6,flexWrap:"wrap",flexShrink:0}}>
            {QUICK_PROMPTS.slice(0,4).map((q,i)=>(
              <button key={i} onClick={()=>sendMessage(q)} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:20,padding:"5px 12px",fontSize:11,color:C.muted,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.15s",fontWeight:500}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=C.red;e.currentTarget.style.color=C.red;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.color=C.muted;}}>
                {q.length>45?q.slice(0,45)+"…":q}
              </button>
            ))}
          </div>
        )}

        {/* INPUT */}
        <div style={{padding:"14px 18px",borderTop:`1px solid ${C.border}`,background:C.surface,borderRadius:"0 0 12px 12px",display:"flex",gap:10,alignItems:"center",flexShrink:0}}>
          <input value={aiInput} onChange={e=>setAiInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendMessage()} disabled={aiLoading}
            placeholder={`Ask anything about your ${assets.length} assets, costs, compliance, incidents...`}
            style={{flex:1,border:`1px solid ${C.border}`,borderRadius:9,padding:"11px 16px",fontSize:13,background:C.white,fontFamily:"'DM Sans',sans-serif",color:C.text,outline:"none",opacity:aiLoading?0.6:1}}/>
          <button onClick={()=>sendMessage()} disabled={!aiInput.trim()||aiLoading} style={{background:aiInput.trim()&&!aiLoading?C.red:C.border,color:"white",border:"none",borderRadius:9,width:44,height:44,cursor:aiInput.trim()&&!aiLoading?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,transition:"all 0.15s",flexShrink:0}}>→</button>
        </div>
      </div>
    </div>
  );
}


function FleetMapTab({ assets, maint, fuel, incidents, conditions, transfers, preops, assignments,
  spares, jobCards, siteNames, today, fmt, depreciate, getDaysSinceLastTransfer,
  getAssetCurrentSite, C, Btn, Pill, KPI, PageTitle, setTab }) {

  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCat, setFilterCat] = useState("All");
  const [selectedAsset, setSelectedAsset] = useState(null);

  const CAT_ICONS = {
    "Vehicle": "🚗", "TLB": "🚜", "Excavator": "⛏", "Compactor": "🔩",
    "Generator": "⚡", "Trailer": "🚛", "Grader": "🏗", "Tipper Truck": "🚚",
    "Tools": "🔧", "Other": "⚙",
  };

  const STATUS_COLORS = {
    "Active": C.success, "Under Maintenance": C.warn,
    "Disposed": C.muted, "Inactive": C.muted,
  };

  const STATUS_BG = {
    "Active": "#ECFDF5", "Under Maintenance": "#FFFBEB",
    "Disposed": "#F3F4F6", "Inactive": "#F3F4F6",
  };

  const categories = ["All", ...new Set(assets.map(a => a.category))];
  const statuses   = ["All", "Active", "Under Maintenance", "Inactive", "Disposed"];

  const visibleAssets = assets.filter(a => {
    if (filterStatus !== "All" && a.status !== filterStatus) return false;
    if (filterCat !== "All" && a.category !== filterCat) return false;
    return true;
  });

  // Build per-site asset lists
  const assetsBySite = siteNames.map(site => ({
    site,
    assets: visibleAssets.filter(a => getAssetCurrentSite(a) === site),
  }));

  // Assets not at any named site
  const unmapped = visibleAssets.filter(a => !siteNames.includes(getAssetCurrentSite(a)));

  // Fleet health helpers
  const getAssetHealth = (a) => {
    const d = depreciate(a);
    const pct = Number(a.purchaseCost) > 0 ? d.accumulated / Number(a.purchaseCost) : 0;
    const latestCond = [...conditions].filter(c => c.assetId === a.id)
      .sort((x, y) => y.assessmentDate > x.assessmentDate ? 1 : -1)[0];
    const openJC = jobCards.filter(j => j.assetId === a.id &&
      !["Complete","Cancelled","Invoiced"].includes(j.status)).length;
    const openInc = incidents.filter(i => i.assetId === a.id && i.resolved === "No").length;
    const noPreop = !preops.find(p => p.assetId === a.id && p.date === today());
    const stale = getDaysSinceLastTransfer(a.id);
    const longStay = stale !== null && stale > 180;

    if (a.status === "Under Maintenance" || openInc > 0) return "critical";
    if (latestCond?.rating === "Poor" || latestCond?.rating === "Write-Off Recommended") return "critical";
    if (openJC > 0 || pct > 0.75) return "warning";
    if (noPreop && a.status === "Active") return "warning";
    if (longStay) return "info";
    return "good";
  };

  const HEALTH_DOT = {
    good:     { bg: C.success,  label: "Good" },
    warning:  { bg: C.warn,     label: "Attention" },
    critical: { bg: C.red,      label: "Critical" },
    info:     { bg: C.info,     label: "Stationary" },
  };

  // Summary counts
  const totalActive  = assets.filter(a => a.status === "Active").length;
  const totalMaint   = assets.filter(a => a.status === "Under Maintenance").length;
  const criticalCount = assets.filter(a => getAssetHealth(a) === "critical").length;
  const warnCount    = assets.filter(a => getAssetHealth(a) === "warning").length;

  // Asset detail card
  const AssetDetailPanel = ({ a, onClose }) => {
    const d = depreciate(a);
    const health = getAssetHealth(a);
    const openJCs = jobCards.filter(j => j.assetId === a.id && !["Complete","Cancelled","Invoiced"].includes(j.status));
    const openInc = incidents.filter(i => i.assetId === a.id && i.resolved === "No");
    const latestCond = [...conditions].filter(c => c.assetId === a.id)
      .sort((x, y) => y.assessmentDate > x.assessmentDate ? 1 : -1)[0];
    const lastMaint = [...maint].filter(m => m.assetId === a.id)
      .sort((x, y) => y.date > x.date ? 1 : -1)[0];
    const lastFuel = [...fuel].filter(f => f.assetId === a.id)
      .sort((x, y) => y.date > x.date ? 1 : -1)[0];
    const currentSite = getAssetCurrentSite(a);
    const daysSince = getDaysSinceLastTransfer(a.id);
    const todayPreop = preops.find(p => p.assetId === a.id && p.date === today());
    const assignedOp = [...assignments].filter(x => x.assetId === a.id && !x.endDate)
      .sort((x,y) => y.startDate > x.startDate ? 1 : -1)[0];

    return (
      <div style={{
        position: "fixed", inset: 0, background: "rgba(17,19,24,0.65)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 9999, padding: 20, backdropFilter: "blur(3px)"
      }} onClick={onClose}>
        <div style={{
          background: C.white, borderRadius: 14, width: "100%", maxWidth: 520,
          maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 24px 80px rgba(0,0,0,0.3)", border: `1px solid ${C.border}`
        }} onClick={e => e.stopPropagation()}>
          {/* HEADER */}
          <div style={{ background: C.dark, padding: "22px 26px", borderRadius: "14px 14px 0 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 26 }}>{CAT_ICONS[a.category] || "⚙"}</span>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "white", fontFamily: "'Barlow Condensed',sans-serif" }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: "#6B7280" }}>{a.category} · {a.serialNumber || "No serial"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Pill text={a.status} color={a.status === "Active" ? "green" : a.status === "Under Maintenance" ? "yellow" : "gray"} />
                  <div style={{ background: HEALTH_DOT[health].bg, color: "white", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
                    ● {HEALTH_DOT[health].label}
                  </div>
                </div>
              </div>
              <button onClick={onClose} style={{ background: "none", border: "none", color: "#6B7280", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
          </div>

          <div style={{ padding: "22px 26px" }}>
            {/* LOCATION */}
            <div style={{ background: C.infoBg, border: "1px solid #BFDBFE", borderRadius: 9, padding: "12px 16px", marginBottom: 16 }}>
              <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Current Location</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: C.info, fontFamily: "'Barlow Condensed',sans-serif" }}>📍 {currentSite}</div>
              {daysSince !== null && (
                <div style={{ fontSize: 11, color: daysSince > 180 ? C.warn : C.muted, marginTop: 3 }}>
                  {daysSince > 180 ? `⚠ Stationary for ${daysSince} days` : `Last moved ${daysSince} days ago`}
                </div>
              )}
              {assignedOp && (
                <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>👤 Assigned to: <strong>{assignedOp.employeeName}</strong></div>
              )}
            </div>

            {/* ALERTS */}
            {(openJCs.length > 0 || openInc.length > 0) && (
              <div style={{ background: C.redLight, border: `1px solid ${C.redBorder}`, borderRadius: 9, padding: "12px 16px", marginBottom: 16 }}>
                {openInc.length > 0 && <div style={{ fontSize: 12, fontWeight: 700, color: C.red, marginBottom: 4 }}>⚠ {openInc.length} Open Incident{openInc.length !== 1 ? "s" : ""}</div>}
                {openJCs.length > 0 && <div style={{ fontSize: 12, fontWeight: 700, color: C.red }}>🔧 {openJCs.length} Active Job Card{openJCs.length !== 1 ? "s" : ""}</div>}
              </div>
            )}

            {/* STATS GRID */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[
                { l: "Book Value", v: fmt(d.bookValue), c: d.bookValue > 0 ? C.success : C.muted },
                { l: "Depreciated", v: `${Number(a.purchaseCost) > 0 ? ((d.accumulated / Number(a.purchaseCost)) * 100).toFixed(0) : 0}%`, c: C.warn },
                { l: "Purchase Cost", v: fmt(a.purchaseCost), c: C.muted },
                { l: "Last Service", v: lastMaint?.date || "Never", c: C.text },
                { l: "Last Fuel", v: lastFuel?.date || "None logged", c: C.text },
                { l: "Condition", v: latestCond?.rating || "Not assessed", c: latestCond ? (latestCond.rating === "Poor" || latestCond.rating === "Write-Off Recommended" ? C.red : C.success) : C.muted },
              ].map(item => (
                <div key={item.l} style={{ background: C.surface, borderRadius: 7, padding: "10px 12px" }}>
                  <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>{item.l}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: item.c }}>{item.v}</div>
                </div>
              ))}
            </div>

            {/* TODAY PRE-OP */}
            <div style={{ background: todayPreop ? C.successBg : C.warnBg, border: `1px solid ${todayPreop ? "#A7F3D0" : "#FDE68A"}`, borderRadius: 9, padding: "10px 14px", marginBottom: 14, fontSize: 12, fontWeight: 600, color: todayPreop ? C.success : C.warn }}>
              {todayPreop
                ? `✓ Pre-op check completed today by ${todayPreop.operatorName}`
                : "⚠ No pre-operation checklist completed today"}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <Btn size="sm" variant="outline" onClick={() => { setSelectedAsset(null); setTab("Maintenance"); }}>View Maintenance</Btn>
              <Btn size="sm" variant="outline" onClick={() => { setSelectedAsset(null); setTab("Transfers"); }}>Transfer Log</Btn>
              <Btn size="sm" variant="ghost" onClick={onClose}>Close</Btn>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <PageTitle
        title="FLEET VISUAL MAP"
        sub="Live asset positions across all sites — click any asset for full details"
      />

      {/* KPI STRIP */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14, marginBottom: 22 }}>
        <KPI label="Total Assets" value={assets.length} color={C.info} icon="◉" sub="on register" />
        <KPI label="Active" value={totalActive} color={C.success} icon="▶" sub="deployed" />
        <KPI label="Under Maintenance" value={totalMaint} color={C.warn} icon="🔧" sub="off-road" />
        <KPI label="Critical Alerts" value={criticalCount} color={criticalCount > 0 ? C.red : C.success} icon="⚑" sub="need attention" />
        <KPI label="Needs Attention" value={warnCount} color={warnCount > 0 ? C.warn : C.success} icon="⚐" sub="monitor" />
        <KPI label="Sites Active" value={assetsBySite.filter(s => s.assets.length > 0).length} color={C.muted} icon="📍" sub={`of ${siteNames.length}`} />
      </div>

      {/* LEGEND */}
      <div style={{ display: "flex", gap: 16, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 0.8 }}>Health:</span>
        {Object.entries(HEALTH_DOT).map(([k, v]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: v.bg }} />
            <span style={{ fontSize: 11, color: C.muted }}>{v.label}</span>
          </div>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
          {/* STATUS FILTER */}
          {statuses.map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{
              padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer",
              border: `1px solid ${filterStatus === s ? C.red : C.border}`,
              background: filterStatus === s ? C.red : C.white,
              color: filterStatus === s ? "white" : C.muted, fontFamily: "'DM Sans',sans-serif"
            }}>{s}</button>
          ))}
        </div>
      </div>

      {/* CATEGORY FILTER */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)} style={{
            padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer",
            border: `1px solid ${filterCat === cat ? C.info : C.border}`,
            background: filterCat === cat ? C.infoBg : C.white,
            color: filterCat === cat ? C.info : C.muted, fontFamily: "'DM Sans',sans-serif"
          }}>
            {cat !== "All" && CAT_ICONS[cat] ? `${CAT_ICONS[cat]} ` : ""}{cat}
          </button>
        ))}
      </div>

      {/* SITE GRID */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px,1fr))", gap: 16 }}>
        {assetsBySite.map(({ site, assets: siteAssets }) => {
          const activeCount  = siteAssets.filter(a => a.status === "Active").length;
          const maintCount   = siteAssets.filter(a => a.status === "Under Maintenance").length;
          const critCount    = siteAssets.filter(a => getAssetHealth(a) === "critical").length;
          const isEmpty      = siteAssets.length === 0;

          return (
            <div key={site} style={{
              background: C.white, borderRadius: 12,
              border: `1px solid ${critCount > 0 ? C.redBorder : C.border}`,
              overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              opacity: isEmpty ? 0.5 : 1,
            }}>
              {/* SITE HEADER */}
              <div style={{
                background: isEmpty ? C.surface : C.dark,
                padding: "14px 18px",
                display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: isEmpty ? C.muted : "white", fontFamily: "'Barlow Condensed',sans-serif", letterSpacing: 0.5 }}>
                    📍 {site.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 11, color: isEmpty ? C.mutedLt : "#6B7280", marginTop: 2 }}>
                    {isEmpty ? "No assets" : `${siteAssets.length} asset${siteAssets.length !== 1 ? "s" : ""}`}
                    {activeCount > 0 && ` · ${activeCount} active`}
                    {maintCount > 0 && ` · ${maintCount} in maintenance`}
                  </div>
                </div>
                {!isEmpty && (
                  <div style={{ display: "flex", gap: 6 }}>
                    {critCount > 0 && (
                      <div style={{ background: C.red, color: "white", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                        ⚑ {critCount}
                      </div>
                    )}
                    <div style={{ background: "rgba(255,255,255,0.1)", color: "white", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
                      {siteAssets.length}
                    </div>
                  </div>
                )}
              </div>

              {/* ASSET CHIPS */}
              <div style={{ padding: isEmpty ? "16px 18px" : "14px 18px", minHeight: 60 }}>
                {isEmpty ? (
                  <div style={{ fontSize: 12, color: C.mutedLt, fontStyle: "italic", textAlign: "center" }}>No assets deployed here</div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {siteAssets.map(a => {
                      const health  = getAssetHealth(a);
                      const dot     = HEALTH_DOT[health];
                      const daysSince = getDaysSinceLastTransfer(a.id);
                      const openJC  = jobCards.filter(j => j.assetId === a.id && !["Complete","Cancelled","Invoiced"].includes(j.status)).length;

                      return (
                        <div
                          key={a.id}
                          onClick={() => setSelectedAsset(a)}
                          title={`${a.name} · ${a.status} · Click for details`}
                          style={{
                            background: STATUS_BG[a.status] || C.surface,
                            border: `1.5px solid ${health === "critical" ? C.redBorder : health === "warning" ? "#FDE68A" : C.border}`,
                            borderRadius: 9, padding: "8px 12px", cursor: "pointer",
                            transition: "all 0.15s", minWidth: 0,
                            display: "flex", alignItems: "center", gap: 7,
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)"; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                        >
                          {/* Health dot */}
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: dot.bg, flexShrink: 0 }} />
                          {/* Icon */}
                          <span style={{ fontSize: 14, flexShrink: 0 }}>{CAT_ICONS[a.category] || "⚙"}</span>
                          {/* Name */}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 120 }}>
                              {a.name}
                            </div>
                            <div style={{ fontSize: 9, color: C.muted, marginTop: 1 }}>
                              {a.category}
                              {openJC > 0 && <span style={{ color: C.red, fontWeight: 700, marginLeft: 4 }}>· {openJC} JC</span>}
                              {daysSince !== null && daysSince > 180 && <span style={{ color: C.warn, fontWeight: 700, marginLeft: 4 }}>· {daysSince}d</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SITE FOOTER — maintenance summary */}
              {!isEmpty && (
                <div style={{ borderTop: `1px solid ${C.border}`, padding: "8px 18px", background: C.surface, display: "flex", gap: 12 }}>
                  <span style={{ fontSize: 10, color: C.success, fontWeight: 700 }}>
                    ● {activeCount} Active
                  </span>
                  {maintCount > 0 && <span style={{ fontSize: 10, color: C.warn, fontWeight: 700 }}>● {maintCount} Maintenance</span>}
                  {critCount  > 0 && <span style={{ fontSize: 10, color: C.red, fontWeight: 700 }}>⚑ {critCount} Critical</span>}
                  <span style={{ fontSize: 10, color: C.muted, marginLeft: "auto" }}>
                    {fmt(siteAssets.reduce((s, a) => s + depreciate(a).bookValue, 0))} book value
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* UNMAPPED ASSETS */}
        {unmapped.length > 0 && (
          <div style={{ background: C.warnBg, border: `1px solid #FDE68A`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ background: C.warn, padding: "14px 18px" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "white", fontFamily: "'Barlow Condensed',sans-serif" }}>⚠ UNKNOWN LOCATION</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>{unmapped.length} asset{unmapped.length !== 1 ? "s" : ""} not at a named site</div>
            </div>
            <div style={{ padding: "14px 18px", display: "flex", flexWrap: "wrap", gap: 8 }}>
              {unmapped.map(a => (
                <div key={a.id} onClick={() => setSelectedAsset(a)} style={{ background: C.white, border: `1px solid #FDE68A`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 11, fontWeight: 600, color: C.warn }}>
                  {CAT_ICONS[a.category]} {a.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ASSET DETAIL MODAL */}
      {selectedAsset && (
        <AssetDetailPanel a={selectedAsset} onClose={() => setSelectedAsset(null)} />
      )}
    </div>
  );
}


function AssetIntelTab({ assets, maint, fuel, incidents, conditions, preops, spares,
  jobCards, assignments, employees, ts, company, today, fmt, depreciate,
  getAssetExpenses, C, Btn, Pill, KPI, PageTitle }) {

  const [activeSection, setActiveSection] = React.useState("predict");
  const [aiLoading, setAiLoading] = React.useState(false);
  const [predictions, setPredictions] = React.useState(null);
  const [aiError, setAiError] = React.useState(null);
  const [expandedAsset, setExpandedAsset] = React.useState(null);

  const last6Months = () => Array.from({length:6},(_,i)=>{
    const d=new Date(); d.setMonth(d.getMonth()-(5-i)); return d.toISOString().slice(0,7);
  });
  const last6 = last6Months();
  const prev6 = Array.from({length:6},(_,i)=>{
    const d=new Date(); d.setMonth(d.getMonth()-(11-i)); return d.toISOString().slice(0,7);
  });
  const shortM = (m) => { try { return new Date(m+"-02").toLocaleDateString("en-ZA",{month:"short"}); } catch { return m; } };

  const getReplaceRepairScore = (a) => {
    const e = getAssetExpenses(a.id);
    const d = depreciate(a);
    const pc = Number(a.purchaseCost || 0);
    const expenseRatio = pc > 0 ? e.totalExpenses / pc : 0;
    const recentMC = maint.filter(m=>m.assetId===a.id&&last6.some(mo=>m.date?.startsWith(mo))).reduce((s,m)=>s+Number(m.cost||0),0);
    const priorMC  = maint.filter(m=>m.assetId===a.id&&prev6.some(mo=>m.date?.startsWith(mo))).reduce((s,m)=>s+Number(m.cost||0),0);
    const maintTrend = priorMC > 0 ? (recentMC - priorMC) / priorMC : 0;
    const totalMonths = pc>0&&a.purchaseDate ? Math.max(1,(Date.now()-new Date(a.purchaseDate))/(1000*60*60*24*30)) : 12;
    const incidentRate = (incidents.filter(i=>i.assetId===a.id).length/totalMonths)*12;
    const deprPct = pc > 0 ? d.accumulated/pc : 0;
    const latestCond = [...conditions].filter(c=>c.assetId===a.id).sort((x,y)=>y.assessmentDate>x.assessmentDate?1:-1)[0];
    const condScore = ({Excellent:0,Good:0.1,Fair:0.3,Poor:0.6,"Write-Off Recommended":1})[latestCond?.rating] ?? 0.2;
    const openJCs = jobCards.filter(j=>j.assetId===a.id&&!["Complete","Cancelled","Invoiced"].includes(j.status)).length;
    const score = Math.min(100,Math.round(expenseRatio*35+Math.max(0,maintTrend)*15+Math.min(incidentRate/5,1)*15+deprPct*20+condScore*10+Math.min(openJCs/3,1)*5));
    const rec = score>=75?{label:"Replace Now",color:C.red,bg:"#FEE2E2",icon:"🔴"}:score>=50?{label:"Plan Replacement",color:"#F97316",bg:"#FFEDD5",icon:"🟠"}:score>=30?{label:"Monitor Closely",color:C.warn,bg:"#FFFBEB",icon:"🟡"}:{label:"Keep — Good Value",color:C.success,bg:"#ECFDF5",icon:"🟢"};
    return {score,recommendation:rec,expenseRatio,maintTrend,recentMC,priorMC,incidentRate,deprPct,openJCs,totalExpenses:e.totalExpenses,bookValue:d.bookValue,pc,latestCond};
  };

  const getOperatorScores = () => {
    const allOps = new Set([...ts.map(t=>t.employeeName),...preops.map(p=>p.operatorName),...incidents.map(i=>i.operatorName).filter(Boolean),...assignments.map(a=>a.employeeName)]);
    return [...allOps].filter(Boolean).map(name => {
      const opTs=ts.filter(t=>t.employeeName===name);
      const totalHours=opTs.reduce((s,t)=>s+Number(t.hours||0),0);
      const opPreops=preops.filter(p=>p.operatorName===name);
      const defectPreops=opPreops.filter(p=>p.checks&&Object.values(p.checks).some(v=>v==="fail")).length;
      const preOpCompliance=opPreops.length>0?((opPreops.length-defectPreops)/opPreops.length)*100:null;
      const opIncidents=incidents.filter(i=>i.operatorName===name);
      const totalDowntime=opIncidents.reduce((s,i)=>s+Number(i.downtimeHours||0),0);
      const assignedAssets=assignments.filter(a=>a.employeeName===name).map(a=>a.assetId);
      const opFuel=fuel.filter(f=>assignedAssets.includes(f.assetId));
      const fuelCost=opFuel.reduce((s,f)=>s+Number(f.cost||0),0);
      const fuelLitres=opFuel.reduce((s,f)=>s+Number(f.litres||0),0);
      const avgCpl=fuelLitres>0?fuelCost/fuelLitres:null;
      const preOpScore=preOpCompliance!==null?(preOpCompliance/100)*35:17.5;
      const incPer100=totalHours>0?(opIncidents.length/totalHours)*100:opIncidents.length*5;
      const incScore=Math.max(0,35-incPer100*10);
      const actScore=Math.min(20,(totalHours/200)*20);
      const fuelScore=avgCpl===null?5:Math.max(0,10-Math.max(0,avgCpl-15)*0.5);
      const totalScore=Math.round(Math.min(100,preOpScore+incScore+actScore+fuelScore));
      const grade=totalScore>=85?"A":totalScore>=70?"B":totalScore>=55?"C":totalScore>=40?"D":"F";
      const gradeColor=totalScore>=85?C.success:totalScore>=70?"#22C55E":totalScore>=55?C.warn:totalScore>=40?"#F97316":C.red;
      return {name,totalScore,grade,gradeColor,totalHours,preOpCompliance,defectPreops,incidents:opIncidents.length,totalDowntime,avgCpl,preOpScore:Math.round(preOpScore),incScore:Math.round(incScore),actScore:Math.round(actScore),fuelScore:Math.round(fuelScore),totalPreops:opPreops.length};
    }).sort((a,b)=>b.totalScore-a.totalScore);
  };

  const runPredictiveAI = async () => {
    setAiLoading(true); setAiError(null); setPredictions(null);
    try {
      const assetData = assets.map(a => {
        const e=getAssetExpenses(a.id); const d=depreciate(a);
        const assetMaint=[...maint].filter(m=>m.assetId===a.id).sort((x,y)=>y.date>x.date?1:-1);
        const recentMC=assetMaint.filter(m=>last6.some(mo=>m.date?.startsWith(mo))).reduce((s,m)=>s+Number(m.cost||0),0);
        const priorMC=assetMaint.filter(m=>prev6.some(mo=>m.date?.startsWith(mo))).reduce((s,m)=>s+Number(m.cost||0),0);
        const assetInc=incidents.filter(i=>i.assetId===a.id);
        const recentInc=assetInc.filter(i=>last6.some(mo=>i.date?.startsWith(mo)));
        const latestCond=[...conditions].filter(c=>c.assetId===a.id).sort((x,y)=>y.assessmentDate>x.assessmentDate?1:-1)[0];
        const failedChecks={};
        preops.filter(p=>p.assetId===a.id).forEach(p=>Object.entries(p.checks||{}).forEach(([k,v])=>{ if(v==="fail") failedChecks[k]=(failedChecks[k]||0)+1; }));
        const daysSince=assetMaint[0]?Math.round((new Date()-new Date(assetMaint[0].date))/(1000*60*60*24)):null;
        const preopsLast30=preops.filter(p=>p.assetId===a.id&&((new Date()-new Date(p.date))/(1000*60*60*24))<=30);
        return {
          id:a.id,name:a.name,category:a.category,
          age_years:d.years.toFixed(1),depr_pct:Math.round(d.accumulated/Math.max(1,Number(a.purchaseCost||0))*100),
          book_value:Math.round(d.bookValue),purchase_cost:Number(a.purchaseCost||0),
          status:a.status,condition:latestCond?.rating||"Not assessed",
          days_since_last_service:daysSince,
          maint_types_6mo:assetMaint.filter(m=>last6.some(mo=>m.date?.startsWith(mo))).map(m=>m.type),
          maint_cost_6mo:Math.round(recentMC),maint_cost_prior_6mo:Math.round(priorMC),
          maint_trend_pct:priorMC>0?Math.round(((recentMC-priorMC)/priorMC)*100):null,
          incidents_6mo:recentInc.length,incidents_prior_6mo:assetInc.filter(i=>prev6.some(mo=>i.date?.startsWith(mo))).length,
          incident_types:[...new Set(recentInc.map(i=>i.type))],
          downtime_hrs:recentInc.reduce((s,i)=>s+Number(i.downtimeHours||0),0),
          preop_fails_30d:preopsLast30.filter(p=>p.checks&&Object.values(p.checks).some(v=>v==="fail")).length,
          recurring_preop_fails:Object.entries(failedChecks).filter(([,v])=>v>1).map(([k])=>k),
          open_job_cards:jobCards.filter(j=>j.assetId===a.id&&!["Complete","Cancelled","Invoiced"].includes(j.status)).length,
          expense_ratio_pct:Math.round(e.totalExpenses/Math.max(1,Number(a.purchaseCost||0))*100),
        };
      });
      const response = await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":"","anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({
          model:"claude-haiku-4-5-20251001",max_tokens:2000,
          system:`You are a plant maintenance AI for ${company.name||"Mapitsi Civil Works"} (South Africa). Analyse asset data and return ONLY a valid JSON array — no markdown. Each object: {"id":"string","risk":"Low|Medium|High|Critical","risk_score":0-100,"predicted_failure_window":"string","likely_failure_type":"string","confidence":"Low|Medium|High","key_signals":["string"],"recommended_action":"string","estimated_preventive_cost":"string","estimated_failure_cost":"string"}. Use maintenance trends, incident patterns, pre-op failures, depreciation to assess risk. Be specific about failure types.`,
          messages:[{role:"user",content:`Analyse ${assetData.length} assets:
${JSON.stringify(assetData)}`}],
        }),
      });
      const data=await response.json();
      const text=data.content?.find(b=>b.type==="text")?.text||"[]";
      setPredictions(JSON.parse(text.replace(/```json|```/g,"").trim()));
    } catch(err) { setAiError("Analysis failed: "+err.message); }
    setAiLoading(false);
  };

  const rrScores = assets.map(a=>({asset:a,...getReplaceRepairScore(a)})).sort((a,b)=>b.score-a.score);
  const opScores = getOperatorScores();
  const RISK_COLOR={Low:C.success,Medium:C.warn,High:"#F97316",Critical:C.red};
  const RISK_BG={Low:"#ECFDF5",Medium:"#FFFBEB",High:"#FFEDD5",Critical:"#FEE2E2"};

  return (
    <div>
      <PageTitle title="ASSET INTELLIGENCE" sub="AI-powered predictive analytics — making decisions BuildSmart and Syspro can't"/>

      {/* SECTION TABS */}
      <div style={{display:"flex",gap:4,marginBottom:24,borderBottom:`1px solid ${C.border}`,paddingBottom:0}}>
        {[
          {id:"predict",label:"🔮 Predictive Maintenance",desc:"AI failure prediction"},
          {id:"rr",     label:"⚖ Replace vs Repair",      desc:"Financial decision engine"},
          {id:"ops",    label:"👷 Operator Performance",   desc:"Ranked operator scoring"},
        ].map(s=>(
          <button key={s.id} onClick={()=>setActiveSection(s.id)} style={{padding:"10px 20px",border:"none",background:"none",cursor:"pointer",borderBottom:`2px solid ${activeSection===s.id?C.red:"transparent"}`,fontSize:13,fontWeight:activeSection===s.id?700:400,color:activeSection===s.id?C.red:C.muted,fontFamily:"'DM Sans',sans-serif",marginBottom:-1,transition:"all 0.15s"}}>
            {s.label}
            <div style={{fontSize:10,color:C.mutedLt,fontWeight:400,marginTop:1}}>{s.desc}</div>
          </button>
        ))}
      </div>

      {/* PREDICTIVE MAINTENANCE */}
      {activeSection==="predict"&&(
        <div>
          <div style={{background:"linear-gradient(135deg,#111318 0%,#1C2030 100%)",borderRadius:12,padding:"28px 32px",marginBottom:24,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
            <div>
              <div style={{fontSize:18,fontWeight:800,color:"white",fontFamily:"'Barlow Condensed',sans-serif",marginBottom:6}}>✦ AI Predictive Failure Analysis</div>
              <div style={{fontSize:13,color:"#9CA3AF",maxWidth:560}}>Claude analyses maintenance history, incident patterns, pre-op failure records and cost trends to predict which assets are likely to fail — and when. Catches issues before breakdowns cost you downtime.</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:10}}>
              <Btn onClick={runPredictiveAI} style={{background:C.red,color:"white",border:"none",fontSize:13,padding:"11px 24px"}}>
                {aiLoading?"Analysing fleet…":predictions?"🔄 Re-analyse":"🔮 Analyse Fleet Now"}
              </Btn>
              {predictions&&<div style={{fontSize:11,color:"#6B7280"}}>{predictions.length} assets analysed</div>}
            </div>
          </div>

          {aiError&&<div style={{background:"#FEE2E2",border:`1px solid ${C.redBorder}`,borderRadius:9,padding:"14px 18px",marginBottom:16,fontSize:13,color:C.red}}>⚠ {aiError}</div>}

          {aiLoading&&(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
              {assets.slice(0,4).map((a,i)=>(
                <div key={i} style={{background:C.white,borderRadius:10,border:`1px solid ${C.border}`,padding:"20px 24px",display:"flex",alignItems:"center",gap:16}}>
                  <div style={{width:44,height:44,borderRadius:9,background:C.surface,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    <div style={{width:20,height:20,borderRadius:"50%",border:`3px solid ${C.red}`,borderTopColor:"transparent",animation:"spin 0.8s linear infinite"}}/>
                  </div>
                  <div><div style={{fontWeight:700,color:C.text,fontSize:13}}>{a.name}</div><div style={{fontSize:11,color:C.muted}}>Analysing patterns…</div></div>
                </div>
              ))}
            </div>
          )}

          {!predictions&&!aiLoading&&(
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:14}}>
              {assets.map(a=>{
                const am=[...maint].filter(m=>m.assetId===a.id).sort((x,y)=>y.date>x.date?1:-1);
                const daysSince=am[0]?Math.round((new Date()-new Date(am[0].date))/(1000*60*60*24)):null;
                const d=depreciate(a);
                const pct=Number(a.purchaseCost)>0?Math.round(d.accumulated/Number(a.purchaseCost)*100):0;
                const recentInc=incidents.filter(i=>i.assetId===a.id&&last6.some(mo=>i.date?.startsWith(mo)));
                return (
                  <div key={a.id} style={{background:C.white,borderRadius:10,border:`1px solid ${C.border}`,padding:"18px 20px"}}>
                    <div style={{fontWeight:700,color:C.text,marginBottom:10}}>{a.name} <span style={{fontSize:11,color:C.muted,fontWeight:400}}>· {a.category}</span></div>
                    {[
                      {l:"Days since service",v:daysSince!==null?`${daysSince}d`:"Never",alert:daysSince>180},
                      {l:"Incidents (6mo)",   v:recentInc.length,                         alert:recentInc.length>1},
                      {l:"Depreciation",      v:`${pct}%`,                                alert:pct>75},
                      {l:"Open job cards",    v:jobCards.filter(j=>j.assetId===a.id&&!["Complete","Cancelled","Invoiced"].includes(j.status)).length,alert:false},
                    ].map(item=>(
                      <div key={item.l} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.surface}`}}>
                        <span style={{fontSize:12,color:C.muted}}>{item.l}</span>
                        <span style={{fontSize:12,fontWeight:700,color:item.alert?C.red:C.text}}>{item.v}</span>
                      </div>
                    ))}
                    <div style={{marginTop:10,fontSize:11,color:C.mutedLt,fontStyle:"italic"}}>Click "Analyse Fleet Now" for AI predictions ↑</div>
                  </div>
                );
              })}
            </div>
          )}

          {predictions&&!aiLoading&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:4}}>
                {[{label:"Critical",color:C.red},{label:"High",color:"#F97316"},{label:"Medium",color:C.warn},{label:"Low",color:C.success}].map(s=>(
                  <div key={s.label} style={{background:C.white,borderRadius:9,border:`1px solid ${C.border}`,padding:"14px 16px",borderTop:`3px solid ${s.color}`}}>
                    <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:0.8,marginBottom:4}}>{s.label} Risk</div>
                    <div style={{fontSize:28,fontWeight:800,color:s.color,fontFamily:"'Barlow Condensed',sans-serif"}}>{predictions.filter(p=>p.risk===s.label).length}</div>
                  </div>
                ))}
              </div>
              {[...predictions].sort((a,b)=>b.risk_score-a.risk_score).map(p=>{
                const asset=assets.find(a=>a.id===p.id);
                const isExp=expandedAsset===p.id;
                return (
                  <div key={p.id} style={{background:C.white,borderRadius:10,border:`1px solid ${p.risk==="Critical"?C.redBorder:p.risk==="High"?"#FED7AA":C.border}`,overflow:"hidden"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px",cursor:"pointer",background:p.risk==="Critical"?"#FEF2F2":p.risk==="High"?"#FFF7ED":C.white}} onClick={()=>setExpandedAsset(isExp?null:p.id)}>
                      <div style={{display:"flex",alignItems:"center",gap:12}}>
                        <div style={{width:44,height:44,borderRadius:9,background:RISK_BG[p.risk]||C.surface,border:`1px solid ${RISK_COLOR[p.risk]||C.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:RISK_COLOR[p.risk]||C.muted,fontFamily:"'Barlow Condensed',sans-serif"}}>{p.risk_score}</div>
                        <div>
                          <div style={{fontWeight:700,fontSize:14,color:C.text}}>{asset?.name||p.id}</div>
                          <div style={{fontSize:11,color:C.muted}}>{asset?.category} · {p.likely_failure_type}</div>
                        </div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:10}}>
                        <div style={{textAlign:"right"}}>
                          <div style={{background:RISK_BG[p.risk],color:RISK_COLOR[p.risk],border:`1px solid ${RISK_COLOR[p.risk]}`,borderRadius:20,padding:"3px 12px",fontSize:11,fontWeight:700,marginBottom:3}}>{p.risk} Risk</div>
                          <div style={{fontSize:11,color:C.muted}}>{p.predicted_failure_window}</div>
                        </div>
                        <span style={{color:C.muted,fontSize:14}}>{isExp?"▲":"▼"}</span>
                      </div>
                    </div>
                    {isExp&&(
                      <div style={{borderTop:`1px solid ${C.border}`,padding:"18px 20px"}}>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                          <div style={{background:C.surface,borderRadius:8,padding:"12px 14px"}}>
                            <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>Key Signals Detected</div>
                            {(p.key_signals||[]).map((sig,i)=><div key={i} style={{fontSize:12,color:C.text,padding:"3px 0"}}><span style={{color:RISK_COLOR[p.risk]}}>› </span>{sig}</div>)}
                          </div>
                          <div style={{background:C.surface,borderRadius:8,padding:"12px 14px"}}>
                            <div style={{fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:6}}>Cost Estimate</div>
                            <div style={{marginBottom:8}}><div style={{fontSize:10,color:C.success,fontWeight:700}}>Preventive (act now):</div><div style={{fontSize:13,fontWeight:700,color:C.text}}>{p.estimated_preventive_cost}</div></div>
                            <div><div style={{fontSize:10,color:C.red,fontWeight:700}}>Reactive (if it fails):</div><div style={{fontSize:13,fontWeight:700,color:C.red}}>{p.estimated_failure_cost}</div></div>
                          </div>
                        </div>
                        <div style={{background:RISK_BG[p.risk]||C.infoBg,border:`1px solid ${RISK_COLOR[p.risk]||C.border}`,borderRadius:8,padding:"12px 14px"}}>
                          <div style={{fontSize:10,color:RISK_COLOR[p.risk]||C.info,fontWeight:700,textTransform:"uppercase",letterSpacing:0.5,marginBottom:5}}>Recommended Action</div>
                          <div style={{fontSize:13,color:C.text,fontWeight:500}}>{p.recommended_action}</div>
                          <div style={{fontSize:10,color:C.mutedLt,marginTop:6}}>AI Confidence: {p.confidence}</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* REPLACE VS REPAIR */}
      {activeSection==="rr"&&(
        <div>
          <div style={{background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,padding:"16px 20px",marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:10}}>How the Replace vs Repair Score is calculated</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:10}}>
              {[{f:"Expense Ratio",w:"35%",d:"Lifetime costs vs purchase price"},{f:"Maintenance Trend",w:"15%",d:"Cost acceleration over 6 months"},{f:"Incident Rate",w:"15%",d:"Breakdowns per year"},{f:"Depreciation",w:"20%",d:"% of value written off"},{f:"Condition Rating",w:"10%",d:"Latest assessment score"},{f:"Open Job Cards",w:"5%",d:"Active unresolved issues"}].map(x=>(
                <div key={x.f} style={{background:C.white,borderRadius:7,padding:"10px 12px",border:`1px solid ${C.border}`}}>
                  <div style={{fontSize:11,fontWeight:700,color:C.text}}>{x.f} <span style={{color:C.red}}>{x.w}</span></div>
                  <div style={{fontSize:10,color:C.muted,marginTop:2}}>{x.d}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
            {[{label:"Replace Now",count:rrScores.filter(s=>s.score>=75).length,color:C.red,icon:"🔴"},{label:"Plan Replacement",count:rrScores.filter(s=>s.score>=50&&s.score<75).length,color:"#F97316",icon:"🟠"},{label:"Monitor Closely",count:rrScores.filter(s=>s.score>=30&&s.score<50).length,color:C.warn,icon:"🟡"},{label:"Keep — Good Value",count:rrScores.filter(s=>s.score<30).length,color:C.success,icon:"🟢"}].map(s=>(
              <div key={s.label} style={{background:C.white,borderRadius:9,border:`1px solid ${C.border}`,padding:"14px 16px",borderLeft:`4px solid ${s.color}`}}>
                <div style={{fontSize:18,marginBottom:4}}>{s.icon}</div>
                <div style={{fontSize:22,fontWeight:800,color:s.color,fontFamily:"'Barlow Condensed',sans-serif"}}>{s.count}</div>
                <div style={{fontSize:10,color:C.muted,fontWeight:600,marginTop:2}}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {rrScores.map(({asset:a,score,recommendation:rec,expenseRatio,maintTrend,recentMC,priorMC,incidentRate,deprPct,totalExpenses,bookValue,pc,latestCond,openJCs})=>(
              <div key={a.id} style={{background:C.white,borderRadius:10,border:`1px solid ${score>=75?C.redBorder:score>=50?"#FED7AA":C.border}`,overflow:"hidden"}}>
                <div style={{display:"flex",alignItems:"center",padding:"16px 20px",gap:16,flexWrap:"wrap",background:score>=75?"#FEF2F2":score>=50?"#FFF7ED":C.white}}>
                  <div style={{width:56,height:56,borderRadius:"50%",border:`3px solid ${rec.color}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0,background:rec.bg}}>
                    <div style={{fontSize:16,fontWeight:900,color:rec.color,fontFamily:"'Barlow Condensed',sans-serif",lineHeight:1}}>{score}</div>
                    <div style={{fontSize:7,color:rec.color,fontWeight:700}}>SCORE</div>
                  </div>
                  <div style={{flex:1,minWidth:160}}>
                    <div style={{fontWeight:800,fontSize:14,color:C.text}}>{a.name}</div>
                    <div style={{fontSize:11,color:C.muted}}>{a.category} · {a.location}</div>
                    <div style={{marginTop:6}}><span style={{background:rec.bg,color:rec.color,border:`1px solid ${rec.color}`,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:700}}>{rec.icon} {rec.label}</span></div>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                    {[{l:"Purchase Cost",v:fmt(pc),c:C.muted},{l:"Book Value",v:fmt(bookValue),c:bookValue/Math.max(1,pc)<0.2?C.red:C.success},{l:"Expenses",v:fmt(totalExpenses),c:expenseRatio>0.75?C.red:expenseRatio>0.4?C.warn:C.muted},{l:"Ratio",v:`${(expenseRatio*100).toFixed(0)}%`,c:expenseRatio>0.75?C.red:expenseRatio>0.4?C.warn:C.success},{l:"Maint 6mo",v:fmt(recentMC),c:C.muted},{l:"Maint Trend",v:priorMC>0?`${maintTrend>0?"+":""}${(maintTrend*100).toFixed(0)}%`:"—",c:maintTrend>0.2?C.red:maintTrend>0?C.warn:C.success}].map(item=>(
                      <div key={item.l} style={{background:C.surface,borderRadius:6,padding:"6px 10px"}}>
                        <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:0.4}}>{item.l}</div>
                        <div style={{fontSize:11,fontWeight:700,color:item.c}}>{item.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{width:110,flexShrink:0}}>
                    <div style={{fontSize:9,color:C.muted,marginBottom:4,textTransform:"uppercase",letterSpacing:0.5}}>Replace pressure</div>
                    <div style={{height:8,background:C.border,borderRadius:4}}>
                      <div style={{height:"100%",width:`${score}%`,background:score>=75?C.red:score>=50?"#F97316":score>=30?C.warn:C.success,borderRadius:4,transition:"width 0.5s"}}/>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:3,fontSize:8,color:C.mutedLt}}><span>Keep</span><span>Replace</span></div>
                  </div>
                </div>
                <div style={{padding:"8px 20px",borderTop:`1px solid ${C.border}`,background:C.surface,display:"flex",gap:16,flexWrap:"wrap"}}>
                  <span style={{fontSize:11,color:C.muted}}>Condition: <strong style={{color:latestCond?.rating==="Poor"||latestCond?.rating==="Write-Off Recommended"?C.red:C.text}}>{latestCond?.rating||"Not assessed"}</strong></span>
                  <span style={{fontSize:11,color:C.muted}}>Incidents/yr: <strong style={{color:incidentRate>4?C.red:incidentRate>2?C.warn:C.text}}>{incidentRate.toFixed(1)}</strong></span>
                  <span style={{fontSize:11,color:C.muted}}>Depreciation: <strong style={{color:deprPct>0.75?C.red:deprPct>0.5?C.warn:C.text}}>{(deprPct*100).toFixed(0)}%</strong></span>
                  <span style={{fontSize:11,color:C.muted}}>Open JCs: <strong style={{color:openJCs>0?C.warn:C.text}}>{openJCs}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OPERATOR PERFORMANCE */}
      {activeSection==="ops"&&(
        <div>
          {opScores.length===0?(
            <div style={{background:C.white,borderRadius:10,border:`1px solid ${C.border}`,padding:"48px",textAlign:"center"}}>
              <div style={{fontSize:32,marginBottom:12,opacity:0.3}}>👷</div>
              <div style={{fontSize:14,fontWeight:700,color:C.text,marginBottom:6}}>No operator data yet</div>
              <div style={{fontSize:13,color:C.muted}}>Add employees, log timesheets, complete pre-op checklists and record incidents to generate operator performance scores.</div>
            </div>
          ):(
            <div>
              {opScores.length>=3&&(
                <div style={{marginBottom:24}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:14}}>Top Performers</div>
                  <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",alignItems:"flex-end"}}>
                    {[1,0,2].map(i=>{
                      if(!opScores[i]) return null;
                      const op=opScores[i];
                      const medals=["🥇","🥈","🥉"];
                      const heights=[120,150,100];
                      const podColors=[C.warn,"#9CA3AF","#CD7F32"];
                      return (
                        <div key={op.name} style={{display:"flex",flexDirection:"column",alignItems:"center",width:170}}>
                          <div style={{fontSize:22,marginBottom:4}}>{medals[i]}</div>
                          <div style={{fontWeight:800,fontSize:13,color:C.text,marginBottom:2,textAlign:"center"}}>{op.name}</div>
                          <div style={{fontSize:28,fontWeight:900,color:op.gradeColor,fontFamily:"'Barlow Condensed',sans-serif"}}>{op.totalScore}</div>
                          <div style={{fontSize:11,color:C.muted,marginBottom:8}}>Grade {op.grade}</div>
                          <div style={{width:"100%",height:heights[i],background:`${podColors[i]}33`,borderRadius:"6px 6px 0 0",border:`2px solid ${podColors[i]}`,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:10}}>
                            <span style={{fontSize:28}}>{medals[i]}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div style={{background:C.white,borderRadius:10,border:`1px solid ${C.border}`,overflow:"hidden"}}>
                <div style={{padding:"14px 20px",borderBottom:`1px solid ${C.border}`,background:C.surface,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.text}}>Full Operator Ranking</div>
                  <div style={{fontSize:11,color:C.muted}}>Scored on: pre-op compliance (35) · incident rate (35) · activity (20) · fuel efficiency (10)</div>
                </div>
                {opScores.map((op,rank)=>(
                  <div key={op.name} style={{borderBottom:`1px solid ${C.surface}`,padding:"14px 20px",display:"flex",alignItems:"center",gap:14,background:rank===0?"#FFFBEB":C.white,flexWrap:"wrap"}}>
                    <div style={{width:28,fontSize:13,fontWeight:800,color:rank<3?C.warn:C.mutedLt,textAlign:"center",flexShrink:0}}>#{rank+1}</div>
                    <div style={{width:42,height:42,borderRadius:9,background:op.gradeColor+"22",border:`2px solid ${op.gradeColor}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:18,color:op.gradeColor,fontFamily:"'Barlow Condensed',sans-serif",flexShrink:0}}>{op.grade}</div>
                    <div style={{flex:1,minWidth:120}}>
                      <div style={{fontWeight:700,fontSize:13,color:C.text}}>{op.name}</div>
                      <div style={{display:"flex",gap:0,marginTop:5,height:5,borderRadius:3,overflow:"hidden"}}>
                        <div style={{width:`${op.preOpScore/35*100}%`,background:C.success,opacity:0.8}}/>
                        <div style={{width:`${op.incScore/35*100}%`,background:"#7c3aed",opacity:0.8}}/>
                        <div style={{width:`${op.actScore/20*100}%`,background:C.info,opacity:0.8}}/>
                        <div style={{width:`${op.fuelScore/10*100}%`,background:C.warn,opacity:0.8}}/>
                        <div style={{flex:1,background:C.border}}/>
                      </div>
                    </div>
                    <div style={{textAlign:"center",flexShrink:0}}>
                      <div style={{fontSize:24,fontWeight:900,color:op.gradeColor,fontFamily:"'Barlow Condensed',sans-serif",lineHeight:1}}>{op.totalScore}</div>
                      <div style={{fontSize:9,color:C.muted}}>/ 100</div>
                    </div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",flexShrink:0}}>
                      {[
                        {l:"Pre-Op",v:op.preOpCompliance!==null?`${op.preOpCompliance.toFixed(0)}%`:"—",alert:op.preOpCompliance!==null&&op.preOpCompliance<80},
                        {l:"Incidents",v:op.incidents,alert:op.incidents>2},
                        {l:"Hours",v:`${op.totalHours.toFixed(0)}h`,alert:false},
                        {l:"Defects",v:op.defectPreops,alert:op.defectPreops>3},
                        {l:"Downtime",v:`${op.totalDowntime.toFixed(0)}h`,alert:op.totalDowntime>8},
                      ].map(stat=>(
                        <div key={stat.l} style={{background:stat.alert?C.redLight:C.surface,border:`1px solid ${stat.alert?C.redBorder:C.border}`,borderRadius:7,padding:"5px 10px",textAlign:"center"}}>
                          <div style={{fontSize:9,color:stat.alert?C.red:C.muted,textTransform:"uppercase",letterSpacing:0.4}}>{stat.l}</div>
                          <div style={{fontSize:12,fontWeight:700,color:stat.alert?C.red:C.text}}>{stat.v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{marginTop:14,fontSize:11,color:C.muted,textAlign:"center",fontStyle:"italic"}}>Scores auto-update as timesheets, pre-op checks and incidents are logged. More data = more accurate scores.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("Dashboard");
  const [assets, setAssets] = useState([]);
  const [maint, setMaint] = useState([]);
  const [fuel, setFuel] = useState([]);
  const [ts, setTs] = useState([]);
  const [modal, setModal] = useState(null);
  const [editAsset, setEditAsset] = useState(null);
  const [transfers, setTransfers] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [preops, setPreops] = useState([]);
  const [company, setCompany] = useState(DEFAULT_COMPANY);
  const [siteNames, setSiteNames] = useState(DEFAULT_SITES);
  const [toasts, setToasts] = useState([]);
  const [settingsTab, setSettingsTab] = useState("company");
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [spares, setSpares] = useState([]);
  const [warranties, setWarranties] = useState([]);
  const [importPreview, setImportPreview] = useState(null);
  const [importType, setImportType] = useState("assets");
  const [importStatus, setImportStatus] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [overtimes, setOvertimes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [hires, setHires] = useState([]);
  const [disposals, setDisposals] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [auditFilter, setAuditFilter] = useState({
    action: "All",
    module: "All",
  });
  const [conditions, setConditions] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [compliance, setCompliance] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [month, setMonth] = useState(today().slice(0, 7));
  const [side, setSide] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(DEFAULT_USERS);
  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
    error: "",
  });
  const [showUserMgmt, setShowUserMgmt] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    name: "",
    role: "operator",
  });

  const toast = (msg, type = "success") => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  };
  const removeToast = (id) => setToasts((p) => p.filter((t) => t.id !== id));
  const persist = async (k, d) => {
    try {
      localStorage.setItem(k, JSON.stringify(d));
    } catch {}
    try {
      const collectionName = k.replace("mcw_","");
      if(Array.isArray(d)) {
        for(const item of d) {
          if(item.id) {
            await setDoc(doc(db, collectionName, item.id), item);
          }
        }
      } else if(typeof d === "object" && d !== null) {
        await setDoc(doc(db, collectionName, "singleton"), d);
      }
    } catch(e) {
      console.error("Firebase persist error for", k, ":", e.code, e.message);
    }
  };

  const persistDelete = async (k, id) => {
    try {
      const collectionName = k.replace("mcw_","");
      await deleteDoc(doc(db, collectionName, id));
    } catch(e) {
      console.error("Firebase delete error:", e);
    }
  };
  const logAudit = (action, module, description) => {
    const entry = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      timestamp: new Date().toISOString(),
      user: currentUser?.name || "System",
      role: currentUser?.role || "unknown",
      action,
      module,
      description,
    };
    setAuditLog((prev) => {
      const updated = [entry, ...prev].slice(0, 2000);
      try {
        localStorage.setItem("mcw_audit", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };
  const add = (k, set, arr, item) => {
    const u = [...arr, { ...item, id: Date.now().toString() }];
    set(u);
    persist(k, u);
    logAudit(
      "ADD",
      MODULE_NAMES[k] || k,
      `Record added to ${MODULE_NAMES[k] || k}`
    );
  };
  const del = (k, set, arr, id) => {
    const u = arr.filter((i) => i.id !== id);
    set(u);
    persist(k, u);
    persistDelete(k, id);
    logAudit(
      "DELETE",
      MODULE_NAMES[k] || k,
      `Record removed from ${MODULE_NAMES[k] || k}`
    );
  };
  const update = (k, set, arr, id, data) => {
    const u = arr.map((i) => (i.id === id ? { ...i, ...data } : i));
    set(u);
    persist(k, u);
    logAudit(
      "UPDATE",
      MODULE_NAMES[k] || k,
      `Record updated in ${MODULE_NAMES[k] || k}`
    );
  };

  useEffect(() => {
    if(!currentUser) return;
    const realTimeCollections = [
      ["assets",      setAssets],
      ["maint",       setMaint],
      ["fuel",        setFuel],
      ["incidents",   setIncidents],
      ["compliance",  setCompliance],
      ["preops",      setPreops],
      ["jobcards",    setJobCards],
      ["pos",         setPurchaseOrders],
    ];
    const unsubscribers = realTimeCollections.map(([name, setter]) => {
      return onSnapshot(collection(db, name), (snapshot) => {
        if(!snapshot.empty) {
          const data = snapshot.docs.map(d => d.data());
          setter(data);
        }
      }, (error) => {
        console.warn(`Realtime listener failed for ${name}:`, error);
      });
    });
    return () => unsubscribers.forEach(unsub => unsub());
  }, [currentUser]);

  useEffect(() => {
  // Sign in anonymously so Firestore rules (auth != null) are satisfied
  // on every device without any credential management.
  const unsubAuth = onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      // Not signed in yet — trigger anonymous sign-in
      try { await signInAnonymously(auth); } catch (e) { console.error("Anon auth failed:", e); }
      return; // onAuthStateChanged will fire again once signed in
    }

    // Firebase Auth is ready — now safe to read/write Firestore
    try {
      const r = localStorage.getItem("mcw_session");
      if (r) setCurrentUser(JSON.parse(r));
    } catch {}
    try {
      const r = localStorage.getItem("mcw_company");
      if (r) setCompany({ ...DEFAULT_COMPANY, ...JSON.parse(r) });
    } catch {}
    try {
      const r = localStorage.getItem("mcw_sites");
      if (r) setSiteNames(JSON.parse(r));
    } catch {}

    const collections = [
      ["assets",      setAssets],
      ["maint",       setMaint],
      ["fuel",        setFuel],
      ["ts",          setTs],
      ["audit",       setAuditLog],
      ["spares",      setSpares],
      ["warranties",  setWarranties],
      ["leaves",      setLeaves],
      ["overtimes",   setOvertimes],
      ["assignments", setAssignments],
      ["budgets",     setBudgets],
      ["hires",       setHires],
      ["disposals",   setDisposals],
      ["conditions",  setConditions],
      ["incidents",   setIncidents],
      ["suppliers",   setSuppliers],
      ["compliance",  setCompliance],
      ["projects",    setProjects],
      ["employees",   setEmployees],
      ["schedules",   setSchedules],
      ["preops",      setPreops],
      ["contractors", setContractors],
      ["transfers",   setTransfers],
      ["jobcards",    setJobCards],
      ["pos",         setPurchaseOrders],
    ];

    for (const [name, setter] of collections) {
      try {
        const snapshot = await getDocs(collection(db, name));
        if (!snapshot.empty) {
          const data = snapshot.docs.map(d => d.data());
          setter(data);
          localStorage.setItem("mcw_" + name, JSON.stringify(data));
        } else {
          const r = localStorage.getItem("mcw_" + name);
          if (r) {
            const parsed = JSON.parse(r);
            setter(parsed);
            for (const item of parsed) {
              if (item.id) await setDoc(doc(db, name, item.id), item);
            }
          }
        }
      } catch (e) {
        console.warn(`Firebase load failed for ${name}, using localStorage:`, e);
        try {
          const r = localStorage.getItem("mcw_" + name);
          if (r) setter(JSON.parse(r));
        } catch {}
      }
    }

    // Load users
    try {
      const snapshot = await getDocs(collection(db, "users"));
      if (!snapshot.empty) {
        const data = snapshot.docs.map(d => d.data());
        setUsers(data.length ? data : DEFAULT_USERS);
        localStorage.setItem("mcw_users", JSON.stringify(data));
      } else {
        const r = localStorage.getItem("mcw_users");
        const usersToLoad = r ? JSON.parse(r) : DEFAULT_USERS;
        setUsers(usersToLoad.length ? usersToLoad : DEFAULT_USERS);
        for (const u of (usersToLoad.length ? usersToLoad : DEFAULT_USERS)) {
          await setDoc(doc(db, "users", u.id), u);
        }
      }
    } catch (e) {
      console.warn("Firebase users load failed:", e);
      try {
        const r = localStorage.getItem("mcw_users");
        if (r) { const saved = JSON.parse(r); setUsers(saved.length ? saved : DEFAULT_USERS); }
      } catch {}
    }
  });

  return () => unsubAuth(); // clean up listener on unmount
}, []);

  const totalCost = assets.reduce((s, a) => s + Number(a.purchaseCost || 0), 0);
  const totalBook = assets.reduce((s, a) => s + depreciate(a).bookValue, 0);
  const overdue = maint.filter(
    (m) => m.nextDueDate && m.nextDueDate < today()
  ).length;
  const rM = maint.filter((m) => m.date?.startsWith(month));
  const rF = fuel.filter((f) => f.date?.startsWith(month));
  const rT = ts.filter((t) => t.date?.startsWith(month));
  const rMC = rM.reduce((s, m) => s + Number(m.cost || 0), 0);
  const rFC = rF.reduce((s, f) => s + Number(f.cost || 0), 0);
  const rH = rT.reduce((s, t) => s + Number(t.hours || 0), 0);

  const dA = {
    name: "",
    category: "Vehicle",
    serialNumber: "",
    purchaseDate: "",
    purchaseCost: "",
    location: "Head Office",
    assignedTo: "",
    status: "Active",
  };
  const dM = {
    assetId: "",
    date: today(),
    type: "Full Service",
    cost: "",
    description: "",
    nextDueDate: "",
    performedBy: "",
  };
  const dF = {
    assetId: "",
    date: today(),
    litres: "",
    cost: "",
    odometer: "",
    site: "Head Office",
  };
  const dT = {
    employeeName: "",
    date: today(),
    hours: "",
    site: "Head Office",
    task: "",
    notes: "",
  };
  const dSp = {
    partName: "",
    partNumber: "",
    category: "Filters",
    supplier: "",
    quantity: "",
    minStockLevel: "",
    unitCost: "",
    location: "Workshop",
    status: "In Stock",
    notes: "",
  };
  const dW = {
    assetId: "",
    supplier: "",
    warrantyNumber: "",
    startDate: "",
    expiryDate: "",
    coverageDetails: "",
    status: "Active",
    notes: "",
  };
  const dL = {
    employeeName: "",
    leaveType: "Annual Leave",
    startDate: today(),
    endDate: "",
    days: "",
    approvedBy: "",
    status: "Approved",
    notes: "",
  };
  const dOT = {
    employeeName: "",
    date: today(),
    regularHours: "8",
    overtimeHours: "",
    reason: "",
    approvedBy: "",
    site: "Head Office",
    notes: "",
  };
  const dAss = {
    assetId: "",
    employeeName: "",
    startDate: today(),
    endDate: "",
    site: "Head Office",
    notes: "",
  };
  const dB = {
    month: today().slice(0, 7),
    category: "Maintenance",
    site: "Head Office",
    budgetAmount: "",
    notes: "",
  };
  const dH = {
    assetDescription: "",
    category: "TLB",
    hireCompany: "",
    dailyRate: "",
    startDate: today(),
    expectedReturnDate: "",
    actualReturnDate: "",
    status: "Active Hire",
    projectId: "",
    notes: "",
  };
  const dDis = {
    assetId: "",
    disposalDate: today(),
    method: "Sold",
    disposalValue: "",
    buyerName: "",
    buyerContact: "",
    reason: "",
    notes: "",
  };
  const dCond = {
    assetId: "",
    rating: "Good",
    assessedBy: "",
    assessmentDate: today(),
    notes: "",
    actionRequired: "",
  };
  const dInc = {
    assetId: "",
    date: today(),
    type: "Breakdown",
    description: "",
    operatorName: "",
    downtimeHours: "",
    repairCost: "",
    reportedBy: "",
    resolved: "No",
  };
  const dSup = {
    name: "",
    type: "Service & Repairs",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  };
  const dC = {
    assetId: "",
    docType: "Roadworthy Certificate",
    docNumber: "",
    issueDate: "",
    expiryDate: "",
    notes: "",
  };
  const dP = {
    name: "",
    code: "",
    site: "Head Office",
    status: "Active",
    startDate: "",
    contractValue: "",
    description: "",
  };
  const dE = {
    name: "",
    idNumber: "",
    role: "General Worker",
    site: "Head Office",
    contactNumber: "",
    startDate: "",
    status: "Active",
    notes: "",
  };
  const dSch = {
    assetId: "",
    serviceType: "Full Service",
    intervalHours: "",
    intervalKm: "",
    lastServiceHours: "",
    lastServiceKm: "",
    lastServiceDate: "",
    notes: "",
  };
  const dTrans = {
    assetId: "",
    fromSite: "",
    toSite: "",
    transferDate: today(),
    reason: "Site Reallocation",
    transportMethod: "Self-Drive",
    conditionAtTransfer: "Good",
    authorisedBy: "",
    transportedBy: "",
    odometerAtTransfer: "",
    notes: "",
  };
  const [transF, setTransF] = useState(dTrans);
  const [jobCards, setJobCards] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const dCon = {
    name: "",
    tradingName: "",
    registrationNumber: "",
    vatNumber: "",
    cidbGrade: "1",
    cidbClass: "Civil Engineering",
    cidbExpiryDate: "",
    workTypes: [],
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    status: "Active",
    taxClearanceNumber: "",
    taxClearanceExpiry: "",
    publicLiabilityInsurer: "",
    publicLiabilityExpiry: "",
    publicLiabilityAmount: "",
    coidaRegistrationNumber: "",
    coidaExpiryDate: "",
    bankName: "",
    bankAccountNumber: "",
    bankBranchCode: "",
    notes: "",
  };
  const [conF, setConF] = useState(dCon);
  const [conSettingsTab, setConSettingsTab] = useState("details");
  const dPreop = {
    assetId: "",
    operatorName: "",
    date: today(),
    time: new Date().toTimeString().slice(0,5),
    checks: Object.fromEntries(PREOP_CHECKS.map(c=>[c.id,"pass"])),
    defectNotes: "",
    odometerReading: "",
    fuelLevel: "Full",
    supervisorName: "",
  };
  const [preopF, setPreopF] = useState(dPreop);
  const [af, setAf] = useState(dA);
  const [mf, setMf] = useState(dM);
  const [ff, setFf] = useState(dF);
  const [tf, setTf] = useState(dT);
  const [spF, setSpF] = useState(dSp);
  const [wF, setWF] = useState(dW);
  const [lF, setLF] = useState(dL);
  const [otF, setOtF] = useState(dOT);
  const [assF, setAssF] = useState(dAss);
  const [bF, setBF] = useState(dB);
  const [hF, setHF] = useState(dH);
  const [disF, setDisF] = useState(dDis);
  const [condF, setCondF] = useState(dCond);
  const [incF, setIncF] = useState(dInc);
  const [supF, setSupF] = useState(dSup);
  const [cf, setCf] = useState(dC);
  const [pf, setPf] = useState(dP);
  const [ef, setEf] = useState(dE);
  const [sf, setSf] = useState(dSch);

  const expiringSoon = compliance.filter((c) => {
    if (!c.expiryDate) return false;
    const days = Math.round(
      (new Date(c.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    return days <= 30;
  });
  const getBudgetSpent = (b) => {
    if (b.category === "Maintenance")
      return maint
        .filter(
          (m) =>
            m.date?.startsWith(b.month) &&
            (b.site === "Head Office" ||
              assets.find((a) => a.id === m.assetId)?.location === b.site)
        )
        .reduce((s, m) => s + Number(m.cost || 0), 0);
    if (b.category === "Fuel")
      return fuel
        .filter(
          (f) =>
            f.date?.startsWith(b.month) &&
            (b.site === "Head Office" || f.site === b.site)
        )
        .reduce((s, f) => s + Number(f.cost || 0), 0);
    if (b.category === "Equipment Hire")
      return hires
        .filter((h) => h.startDate?.startsWith(b.month.slice(0, 7)))
        .reduce((s, h) => {
          const days = h.actualReturnDate
            ? Math.round(
                (new Date(h.actualReturnDate) - new Date(h.startDate)) /
                  (1000 * 60 * 60 * 24)
              )
            : Math.round(
                (new Date() - new Date(h.startDate)) / (1000 * 60 * 60 * 24)
              );
          return s + Number(h.dailyRate || 0) * Math.max(1, days);
        }, 0);
    return 0;
  };
  const budgetsOverspent = budgets.filter(
    (b) => getBudgetSpent(b) > Number(b.budgetAmount || 0)
  ).length;
  const totalBudgeted = budgets
    .filter((b) => b.month === month)
    .reduce((s, b) => s + Number(b.budgetAmount || 0), 0);
  const totalSpentAgainstBudget = budgets
    .filter((b) => b.month === month)
    .reduce((s, b) => s + getBudgetSpent(b), 0);
  const poorConditionAssets = conditions.filter(
    (c) => c.rating === "Poor" || c.rating === "Write-Off Recommended"
  ).length;
  const openIncidents = incidents.filter((i) => i.resolved === "No").length;
  const scheduleAlerts = schedules.filter((s) => {
    const asset = assets.find((a) => a.id === s.assetId);
    if (!asset) return false;
    const lastFuel = [...fuel]
      .filter((f) => f.assetId === s.assetId)
      .sort((a, b) => (b.date > a.date ? 1 : -1))[0];
    const currentHours = lastFuel
      ? Number(lastFuel.odometer?.replace(/[^0-9.]/g, "") || 0)
      : 0;
    const nextDue =
      Number(s.lastServiceHours || 0) + Number(s.intervalHours || 0);
    return s.intervalHours && currentHours >= nextDue * 0.9;
  });
  const getAssetTransferHistory = (assetId) => {
    return [...transfers]
      .filter(t => t.assetId === assetId)
      .sort((a,b) => b.transferDate > a.transferDate ? 1 : -1);
  };

  const getAssetCurrentSite = (asset) => {
    const history = getAssetTransferHistory(asset.id);
    if(history.length === 0) return asset.location;
    return history[0].toSite;
  };

  const getDaysSinceLastTransfer = (assetId) => {
    const history = getAssetTransferHistory(assetId);
    if(history.length === 0) return null;
    return Math.round((new Date() - new Date(history[0].transferDate)) / (1000*60*60*24));
  };
  const getContractorCompliance = (c) => {
    const checks = [
      { label:"CIDB Certificate",      expiry: c.cidbExpiryDate,           required: true  },
      { label:"Tax Clearance",         expiry: c.taxClearanceExpiry,        required: true  },
      { label:"Public Liability",      expiry: c.publicLiabilityExpiry,     required: true  },
      { label:"COIDA / Workman's Comp",expiry: c.coidaExpiryDate,           required: true  },
    ];
    let expired=0, expiringSoon=0, valid=0, missing=0;
    const issues=[];
    checks.forEach(ch=>{
      if(!ch.expiry){
        if(ch.required){ missing++; issues.push({label:ch.label,status:"missing"}); }
        return;
      }
      const days=Math.round((new Date(ch.expiry)-new Date())/(1000*60*60*24));
      if(days<0){ expired++; issues.push({label:ch.label,status:"expired",days:Math.abs(days)}); }
      else if(days<=30){ expiringSoon++; issues.push({label:ch.label,status:"soon",days}); }
      else valid++;
    });
    const total=checks.filter(ch=>ch.required).length;
    const score=total>0?Math.round((valid/total)*100):0;
    const overallStatus=expired>0?"expired":expiringSoon>0?"expiring":missing>0?"incomplete":"compliant";
    return {expired,expiringSoon,valid,missing,issues,score,overallStatus};
  };
  const getAssetExpenses = (assetId) => {
    const maintRecords = maint.filter((m) => m.assetId === assetId);
    const fuelRecords = fuel.filter((f) => f.assetId === assetId);
    const incidentRecs = incidents.filter((i) => i.assetId === assetId);
    const hireRecs = hires.filter(
      (h) => h.projectId && assets.find((a) => a.id === assetId)
    );
    const maintCost = maintRecords.reduce((s, m) => s + Number(m.cost || 0), 0);
    const fuelCost = fuelRecords.reduce((s, f) => s + Number(f.cost || 0), 0);
    const incidentCost = incidentRecs.reduce(
      (s, i) => s + Number(i.repairCost || 0),
      0
    );
    const fuelLitres = fuelRecords.reduce(
      (s, f) => s + Number(f.litres || 0),
      0
    );
    const downtimeHrs = incidentRecs.reduce(
      (s, i) => s + Number(i.downtimeHours || 0),
      0
    );
    const totalExpenses = maintCost + fuelCost + incidentCost;
    return {
      maintCost,
      fuelCost,
      incidentCost,
      fuelLitres,
      downtimeHrs,
      totalExpenses,
      maintCount: maintRecords.length,
      fuelCount: fuelRecords.length,
      incidentCount: incidentRecs.length,
    };
  };
  const getProjectSpend = (projectId) => {
    const mCost = maint
      .filter((m) => m.projectId === projectId)
      .reduce((s, m) => s + Number(m.cost || 0), 0);
    const fCost = fuel
      .filter((f) => f.projectId === projectId)
      .reduce((s, f) => s + Number(f.cost || 0), 0);
    const hCost = hires
      .filter((h) => h.projectId === projectId)
      .reduce((s, h) => {
        const days = h.actualReturnDate
          ? Math.round(
              (new Date(h.actualReturnDate) - new Date(h.startDate)) /
                (1000 * 60 * 60 * 24)
            )
          : Math.round(
              (new Date() - new Date(h.startDate)) / (1000 * 60 * 60 * 24)
            );
        return s + Number(h.dailyRate || 0) * Math.max(1, days);
      }, 0);
    return {
      maint: mCost,
      fuel: fCost,
      hire: hCost,
      total: mCost + fCost + hCost,
    };
  };
  const getAssetUtilisation = (assetId) => {
    const assetFuel = fuel.filter((f) => f.assetId === assetId);
    const assetMaint = maint.filter((m) => m.assetId === assetId);
    const assetIncidents = incidents.filter((i) => i.assetId === assetId);
    const fuelCost = assetFuel.reduce((s, f) => s + Number(f.cost || 0), 0);
    const maintCost = assetMaint.reduce((s, m) => s + Number(m.cost || 0), 0);
    const totalCostAsset = fuelCost + maintCost;
    const lastFuel = [...assetFuel].sort((a, b) =>
      b.date > a.date ? 1 : -1
    )[0];
    const hoursReading = lastFuel
      ? Number(lastFuel.odometer?.replace(/[^0-9.]/g, "") || 0)
      : 0;
    const costPerHour = hoursReading > 0 ? totalCostAsset / hoursReading : 0;
    const downtime = assetIncidents.reduce(
      (s, i) => s + Number(i.downtimeHours || 0),
      0
    );
    return {
      fuelCost,
      maintCost,
      totalCostAsset,
      hoursReading,
      costPerHour,
      downtime,
      fuelRecords: assetFuel.length,
      maintRecords: assetMaint.length,
    };
  };
  const allAlerts = [
    ...maint
      .filter((m) => m.nextDueDate && m.nextDueDate < today())
      .map((m) => ({
        id: "maint-" + m.id,
        severity: "critical",
        module: "Maintenance",
        title: "Overdue Maintenance",
        desc: `${assets.find((a) => a.id === m.assetId)?.name || "Asset"} — ${
          m.type
        } was due ${Math.abs(
          Math.round(
            (new Date(m.nextDueDate) - new Date()) / (1000 * 60 * 60 * 24)
          )
        )}d ago`,
        tab: "Maintenance",
        date: m.nextDueDate,
      })),
    ...compliance
      .filter((c) => c.expiryDate && c.expiryDate < today())
      .map((c) => ({
        id: "comp-exp-" + c.id,
        severity: "critical",
        module: "Compliance",
        title: "Document Expired",
        desc: `${assets.find((a) => a.id === c.assetId)?.name || "Asset"} — ${
          c.docType
        } expired on ${c.expiryDate}`,
        tab: "Compliance",
        date: c.expiryDate,
      })),
    ...incidents
      .filter((i) => i.resolved === "No")
      .map((i) => ({
        id: "inc-" + i.id,
        severity: "critical",
        module: "Incidents",
        title: "Open Incident",
        desc: `${assets.find((a) => a.id === i.assetId)?.name || "Asset"} — ${
          i.type
        }: ${i.description?.slice(0, 60) || ""}`,
        tab: "Incidents",
        date: i.date,
      })),
    ...compliance
      .filter((c) => {
        if (!c.expiryDate || c.expiryDate < today()) return false;
        const d = Math.round(
          (new Date(c.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
        );
        return d >= 0 && d <= 30;
      })
      .map((c) => ({
        id: "comp-soon-" + c.id,
        severity: "warning",
        module: "Compliance",
        title: "Document Expiring Soon",
        desc: `${assets.find((a) => a.id === c.assetId)?.name || "Asset"} — ${
          c.docType
        } expires ${Math.round(
          (new Date(c.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
        )}d`,
        tab: "Compliance",
        date: c.expiryDate,
      })),
    ...conditions
      .filter(
        (c) => c.rating === "Poor" || c.rating === "Write-Off Recommended"
      )
      .map((c) => ({
        id: "cond-" + c.id,
        severity: "warning",
        module: "Conditions",
        title:
          c.rating === "Write-Off Recommended"
            ? "Write-Off Recommended"
            : "Poor Condition Asset",
        desc: `${
          assets.find((a) => a.id === c.assetId)?.name || "Asset"
        } — rated ${c.rating} on ${c.assessmentDate}`,
        tab: "Conditions",
        date: c.assessmentDate,
      })),
    ...budgets
      .filter((b) => getBudgetSpent(b) > Number(b.budgetAmount || 0))
      .map((b) => ({
        id: "bud-" + b.id,
        severity: "warning",
        module: "Budgets",
        title: "Budget Overspent",
        desc: `${b.category} · ${b.site} · ${monthLabel(b.month)} — spent ${fmt(
          getBudgetSpent(b)
        )} of ${fmt(b.budgetAmount)}`,
        tab: "Budgets",
        date: b.month + "-01",
      })),
    ...spares
      .filter(
        (s) => Number(s.quantity || 0) === 0 || s.status === "Out of Stock"
      )
      .map((s) => ({
        id: "spare-out-" + s.id,
        severity: "warning",
        module: "Spares",
        title: "Part Out of Stock",
        desc: `${s.partName}${
          s.partNumber ? " (" + s.partNumber + ")" : ""
        }  — 0 units remaining`,
        tab: "Spares",
        date: today(),
      })),
    ...warranties
      .filter((w) => {
        if (!w.expiryDate || w.status !== "Active") return false;
        const d = Math.round(
          (new Date(w.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
        );
        return d >= 0 && d <= 60;
      })
      .map((w) => ({
        id: "warr-" + w.id,
        severity: "warning",
        module: "Warranties",
        title: "Warranty Expiring Soon",
        desc: `${
          assets.find((a) => a.id === w.assetId)?.name || "Asset"
        } — ${Math.round(
          (new Date(w.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
        )}d remaining`,
        tab: "Warranties",
        date: w.expiryDate,
      })),
    ...scheduleAlerts.map((s) => ({
      id: "sched-" + s.id,
      severity: "info",
      module: "Schedules",
      title: "Service Due Soon",
      desc: `${assets.find((a) => a.id === s.assetId)?.name || "Asset"} — ${
        s.serviceType
      } approaching interval`,
      tab: "Schedules",
      date: today(),
    })),
    ...hires
      .filter(
        (h) =>
          !h.actualReturnDate &&
          h.expectedReturnDate &&
          h.expectedReturnDate < today()
      )
      .map((h) => ({
        id: "hire-" + h.id,
        severity: "info",
        module: "Equipment Hire",
        title: "Hire Return Overdue",
        desc: `${h.assetDescription} — expected return ${h.expectedReturnDate}`,
        tab: "Hire",
        date: h.expectedReturnDate,
      })),
    ...spares
      .filter(
        (s) =>
          Number(s.quantity || 0) > 0 &&
          Number(s.quantity || 0) <= Number(s.minStockLevel || 0) &&
          Number(s.minStockLevel || 0) > 0
      )
      .map((s) => ({
        id: "spare-low-" + s.id,
        severity: "info",
        module: "Spares",
        title: "Part Low Stock",
        desc: `${s.partName} — only ${s.quantity} units (min: ${s.minStockLevel})`,
        tab: "Spares",
        date: today(),
      })),
      ...assets
      .filter(a => {
        if(a.status !== "Active") return false;
        const days = getDaysSinceLastTransfer(a.id);
        if(days === null) return false;
        return days > 180;
      })
      .map(a => {
        const days = getDaysSinceLastTransfer(a.id);
        return {
          id: "transfer-idle-" + a.id,
          severity: "info",
          module: "Asset Transfer Log",
          title: "Asset Stationary — 6+ Months",
          desc: `${a.name} has not moved sites in ${days} days — verify it is still active and correctly located`,
          tab: "Transfers",
          date: today(),
        };
      }),
    ...transfers
      .filter(t => {
        const asset = assets.find(a => a.id === t.assetId);
        return asset && (t.conditionAtTransfer === "Poor — Noted" || t.conditionAtTransfer === "Damaged — Report Filed");
      })
      .filter(t => {
        const daysSince = Math.round((new Date() - new Date(t.transferDate)) / (1000*60*60*24));
        return daysSince <= 7;
      })
      .map(t => {
        const asset = assets.find(a => a.id === t.assetId);
        return {
          id: "transfer-damage-" + t.id,
          severity: "warning",
          module: "Asset Transfer Log",
          title: "Asset Transferred in Poor Condition",
          desc: `${asset?.name||"Asset"} transferred ${t.transferDate} in condition: ${t.conditionAtTransfer}`,
          tab: "Transfers",
          date: t.transferDate,
        };
      }),
      ...contractors
      .filter(c=>c.status==="Active")
      .flatMap(c=>{
        const alerts=[];
        const checks=[
          {label:"CIDB Certificate",     expiry:c.cidbExpiryDate},
          {label:"Tax Clearance",        expiry:c.taxClearanceExpiry},
          {label:"Public Liability",     expiry:c.publicLiabilityExpiry},
          {label:"COIDA Registration",   expiry:c.coidaExpiryDate},
        ];
        checks.forEach(ch=>{
          if(!ch.expiry) return;
          const days=Math.round((new Date(ch.expiry)-new Date())/(1000*60*60*24));
          if(days<0){
            alerts.push({id:`con-exp-${c.id}-${ch.label}`,severity:"critical",module:"Contractor Register",title:`Contractor ${ch.label} Expired`,desc:`${c.name} — ${ch.label} expired ${Math.abs(days)}d ago`,tab:"Contractors",date:ch.expiry});
          } else if(days<=30){
            alerts.push({id:`con-soon-${c.id}-${ch.label}`,severity:"warning",module:"Contractor Register",title:`Contractor ${ch.label} Expiring Soon`,desc:`${c.name} — ${ch.label} expires in ${days}d`,tab:"Contractors",date:ch.expiry});
          }
        });
        if(!c.cidbExpiryDate||!c.taxClearanceExpiry||!c.publicLiabilityExpiry||!c.coidaExpiryDate){
          alerts.push({id:`con-miss-${c.id}`,severity:"info",module:"Contractor Register",title:"Contractor Documents Incomplete",desc:`${c.name} — one or more compliance documents not yet captured`,tab:"Contractors",date:today()});
        }
        return alerts;
      }),
      ...assets
      .filter(a => {
        if(a.status !== "Active") return false;
        const hour = new Date().getHours();
        if(hour < 6) return false;
        return !preops.find(p => p.assetId === a.id && p.date === today());
      })
      .map(a => ({
        id: "preop-" + a.id,
        severity: "info",
        module: "Pre-Op Checklists",
        title: "Pre-Op Check Not Done",
        desc: `${a.name} — no pre-operation checklist completed today`,
        tab: "PreOp",
        date: today(),
      })),
    ...preops
      .filter(p => {
        const hasDefect = PREOP_CHECKS.some(c => p.checks?.[c.id] === "fail");
        return hasDefect && p.date === today();
      })
      .map(p => ({
        id: "preop-defect-" + p.id,
        severity: "warning",
        module: "Pre-Op Checklists",
        title: "Pre-Op Defect Reported",
        desc: `${assets.find(a=>a.id===p.assetId)?.name||"Asset"} — defect found during pre-op check by ${p.operatorName}`,
        tab: "PreOp",
        date: p.date,
      })),
    ...assets
      .filter((a) => !conditions.find((c) => c.assetId === a.id))
      .map((a) => ({
        id: "nocond-" + a.id,
        severity: "info",
        module: "Conditions",
        title: "Asset Not Assessed",
        desc: `${a.name} — no condition assessment on record`,
        tab: "Conditions",
        date: today(),
      })),
  ].sort((a, b) => {
    const order = { critical: 0, warning: 1, info: 2 };
    return order[a.severity] - order[b.severity] || a.date < b.date ? -1 : 1;
  });
  const sparesLow = spares.filter(
    (s) =>
      Number(s.quantity || 0) <= Number(s.minStockLevel || 0) &&
      s.status !== "Out of Stock"
  ).length;
  const sparesOut = spares.filter(
    (s) => s.status === "Out of Stock" || Number(s.quantity || 0) === 0
  ).length;
  const warrantiesExpiringSoon = warranties.filter((w) => {
    if (!w.expiryDate || w.status !== "Active") return false;
    const days = Math.round(
      (new Date(w.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    return days >= 0 && days <= 60;
  }).length;
  const warrantiesExpired = warranties.filter(
    (w) => w.expiryDate && w.expiryDate < today() && w.status === "Active"
  ).length;
  const employeesOnLeave = leaves.filter(
    (l) =>
      l.status === "Approved" &&
      l.startDate <= today() &&
      (!l.endDate || l.endDate >= today())
  ).length;
  const totalOvertimeHours = overtimes.reduce(
    (s, o) => s + Number(o.overtimeHours || 0),
    0
  );
  const overtimeThisMonth = overtimes
    .filter((o) => o.date?.startsWith(month))
    .reduce((s, o) => s + Number(o.overtimeHours || 0), 0);

  const getLast6Months = () =>
    Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return d.toISOString().slice(0, 7);
    });
  const last6 = getLast6Months();
  const shortMonth = (m) => {
    try {
      return new Date(m + "-02").toLocaleDateString("en-ZA", {
        month: "short",
      });
    } catch {
      return m;
    }
  };
  const fuelByMonth = last6.map((m) => ({
    label: shortMonth(m),
    value: fuel
      .filter((f) => f.date?.startsWith(m))
      .reduce((s, f) => s + Number(f.cost || 0), 0),
  }));
  const maintByMonth = last6.map((m) => ({
    label: shortMonth(m),
    value: maint
      .filter((x) => x.date?.startsWith(m))
      .reduce((s, x) => s + Number(x.cost || 0), 0),
  }));
  const hoursBy6Month = last6.map((m) => ({
    label: shortMonth(m),
    value: ts
      .filter((t) => t.date?.startsWith(m))
      .reduce((s, t) => s + Number(t.hours || 0), 0),
  }));
  const topAssetsByMaint = [...assets]
    .map((a) => ({
      label: a.name,
      value: maint
        .filter((m) => m.assetId === a.id)
        .reduce((s, m) => s + Number(m.cost || 0), 0),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)
    .filter((a) => a.value > 0);
  const topAssetsByFuel = [...assets]
    .map((a) => ({
      label: a.name,
      value: fuel
        .filter((f) => f.assetId === a.id)
        .reduce((s, f) => s + Number(f.cost || 0), 0),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)
    .filter((a) => a.value > 0);
  const hoursBySite = SITES.map((s) => ({
    label: s.replace(" ", "\n"),
    value: ts
      .filter((t) => t.site === s)
      .reduce((s, t) => s + Number(t.hours || 0), 0),
  })).filter((s) => s.value > 0);
  const incidentsByType = INCIDENT_TYPES.map((t) => ({
    label: t.split(" ")[0],
    value: incidents.filter((i) => i.type === t).length,
  })).filter((t) => t.value > 0);
  const fuelMonthAssets = assets
    .map((a) => {
      const assetFuel = fuel.filter(
        (f) => f.assetId === a.id && f.date?.startsWith(month)
      );
      const litres = assetFuel.reduce((s, f) => s + Number(f.litres || 0), 0);
      const cost = assetFuel.reduce((s, f) => s + Number(f.cost || 0), 0);
      const hasMaint = maint.some(
        (m) => m.assetId === a.id && m.date?.startsWith(month)
      );
      const hasTs = ts.some((t) => t.date?.startsWith(month));
      return {
        asset: a,
        litres,
        cost,
        cpl: litres > 0 ? cost / litres : 0,
        hasFuel: litres > 0,
        hasMaint,
        hasTs,
        records: assetFuel.length,
      };
    })
    .filter((x) => x.hasFuel || x.hasMaint);
  const totalFuelMonthLitres = fuel
    .filter((f) => f.date?.startsWith(month))
    .reduce((s, f) => s + Number(f.litres || 0), 0);
  const totalFuelMonthCost = fuel
    .filter((f) => f.date?.startsWith(month))
    .reduce((s, f) => s + Number(f.cost || 0), 0);
  const prevMonth = (() => {
    const d = new Date(month + "-02");
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 7);
  })();
  const prevFuelCost = fuel
    .filter((f) => f.date?.startsWith(prevMonth))
    .reduce((s, f) => s + Number(f.cost || 0), 0);
  const fuelVariance =
    prevFuelCost > 0
      ? (((totalFuelMonthCost - prevFuelCost) / prevFuelCost) * 100).toFixed(1)
      : null;
  const assetsNoFuelButActive = fuelMonthAssets.filter(
    (x) => x.hasMaint && !x.hasFuel
  );
  const W = side ? 224 : 64;
  const doLogin = () => {
  const u = users.find(
    (x) => x.username === loginForm.username && x.password === loginForm.password
  );
  if (u) {
    setCurrentUser(u);
    try { localStorage.setItem("mcw_session", JSON.stringify(u)); } catch {}
    setLoginForm({ username: "", password: "", error: "" });
  } else {
    setLoginForm((f) => ({ ...f, error: "Incorrect username or password. Please try again." }));
  }
};
  const doLogout = async () => {
    setCurrentUser(null);
    try { localStorage.removeItem("mcw_session"); } catch {}
    try { await signOut(auth); } catch {}
  };
  const exportExcel = async () => {
    toast("Building report — please wait...", "success");
    try {
      if (!window.ExcelJS) {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://cdn.jsdelivr.net/npm/exceljs@4.3.0/dist/exceljs.min.js";
          s.onload = resolve; s.onerror = reject;
          document.head.appendChild(s);
        });
      }
      const XJS = window.ExcelJS;
      const wb = new XJS.Workbook();
      wb.creator = company.name || "Mapitsi Civil Works";
      wb.created = new Date();

      // ── THEME ──────────────────────────────────────────────────────────
      const RED="FF8C1414", DARK="FF111318", WHITE="FFFFFFFF";
      const SURFACE="FFF5F6FA", BORDERC="FFE4E6EE";
      const SUCCESS_C="FF059669", WARN_C="FFD97706", INFO_C="FF1D4ED8";
      const MONEY="R #,##0.00", PCT="0.0%", INT="#,##0", HRS="0.0";

      const f = {
        hdr:   { name:"Calibri", size:10, bold:true,  color:{argb:WHITE} },
        data:  { name:"Calibri", size:10,              color:{argb:"FF1A1F2E"} },
        bold:  { name:"Calibri", size:10, bold:true,  color:{argb:"FF1A1F2E"} },
        total: { name:"Calibri", size:11, bold:true,  color:{argb:WHITE} },
        muted: { name:"Calibri", size:10,              color:{argb:"FF6B7280"} },
        title: { name:"Calibri", size:18, bold:true,  color:{argb:WHITE} },
        sub:   { name:"Calibri", size:12,              color:{argb:"FFB0B8C8"} },
        kpiv:  { name:"Calibri", size:16, bold:true,  color:{argb:"FF1A1F2E"} },
      };
      const fill = {
        dark:    { type:"pattern", pattern:"solid", fgColor:{argb:DARK} },
        red:     { type:"pattern", pattern:"solid", fgColor:{argb:RED} },
        surf:    { type:"pattern", pattern:"solid", fgColor:{argb:SURFACE} },
        white:   { type:"pattern", pattern:"solid", fgColor:{argb:WHITE} },
        success: { type:"pattern", pattern:"solid", fgColor:{argb:"FFD1FAE5"} },
        warn:    { type:"pattern", pattern:"solid", fgColor:{argb:"FFFEF3C7"} },
        danger:  { type:"pattern", pattern:"solid", fgColor:{argb:"FFFEE2E2"} },
        infoBg:  { type:"pattern", pattern:"solid", fgColor:{argb:"FFEFF6FF"} },
        purple:  { type:"pattern", pattern:"solid", fgColor:{argb:"FFF5F3FF"} },
      };
      const thin = { top:{style:"thin",color:{argb:BORDERC}}, left:{style:"thin",color:{argb:BORDERC}}, bottom:{style:"thin",color:{argb:BORDERC}}, right:{style:"thin",color:{argb:BORDERC}} };
      const medBot = { ...thin, bottom:{style:"medium",color:{argb:DARK}} };

      // ── HELPERS ────────────────────────────────────────────────────────
      const freeze = (ws, widths) => {
        ws.views = [{ state:"frozen", xSplit:0, ySplit:2, activeCell:"A3" }];
        ws.columns = widths.map(w => ({ width:w }));
      };

      const addBanner = (ws, title, sub, numCols) => {
        const r1 = ws.addRow([title]);
        ws.mergeCells(r1.number, 1, r1.number, numCols);
        r1.height = 40;
        const c1 = r1.getCell(1);
        c1.font = f.title; c1.fill = fill.dark; c1.alignment = { vertical:"middle", horizontal:"center" };

        const r2 = ws.addRow([sub]);
        ws.mergeCells(r2.number, 1, r2.number, numCols);
        r2.height = 22;
        const c2 = r2.getCell(1);
        c2.font = f.sub; c2.fill = fill.dark; c2.alignment = { vertical:"middle", horizontal:"center" };
      };

      const addHdr = (ws, cols) => {
        const row = ws.addRow(cols);
        row.height = 24;
        row.eachCell({ includeEmpty:true }, cell => {
          cell.font = f.hdr; cell.fill = fill.dark;
          cell.alignment = { vertical:"middle", horizontal:"center", wrapText:true };
          cell.border = thin;
        });
        return row;
      };

      const addRow = (ws, vals, altFill, opts={}) => {
        const row = ws.addRow(vals);
        row.height = opts.h || 18;
        row.eachCell({ includeEmpty:true }, (cell, ci) => {
          const ci0 = ci - 1;
          cell.fill = opts.fill || (altFill ? fill.surf : fill.white);
          cell.border = thin;
          cell.font = opts.font || f.data;
          cell.alignment = { vertical:"middle", horizontal: opts.align?.[ci0] || "left", wrapText:false };
          if (opts.fmt?.[ci0]) cell.numFmt = opts.fmt[ci0];
        });
        return row;
      };

      const addTotal = (ws, vals, opts={}) => {
        const row = ws.addRow(vals);
        row.height = 22;
        row.eachCell({ includeEmpty:true }, (cell, ci) => {
          const ci0 = ci - 1;
          cell.fill = opts.fill || fill.dark;
          cell.font = opts.font || f.total;
          cell.border = thin;
          cell.alignment = { vertical:"middle", horizontal: opts.align?.[ci0] || "right" };
          if (opts.fmt?.[ci0]) cell.numFmt = opts.fmt[ci0];
        });
        return row;
      };

      const addSection = (ws, title, numCols, color=RED) => {
        ws.addRow([]);
        const row = ws.addRow([title]);
        ws.mergeCells(row.number, 1, row.number, numCols);
        row.height = 20;
        const cell = row.getCell(1);
        cell.font = { name:"Calibri", size:10, bold:true, color:{argb:WHITE} };
        cell.fill = { type:"pattern", pattern:"solid", fgColor:{argb:color} };
        cell.alignment = { vertical:"middle", horizontal:"left", indent:1 };
        cell.border = thin;
        return row;
      };

      const poItemTotal = po => (po.items||[]).reduce((s,i)=>s+Number(i.qty||0)*Number(i.unitPrice||0),0);

      // ── 1. COVER ───────────────────────────────────────────────────────
      const cov = wb.addWorksheet("Cover", { properties:{ tabColor:{argb:RED} } });
      cov.views = [{ showGridLines:false }];
      cov.columns = [{ width:36 },{ width:36 }];

      // Big banner
      const bannerR = cov.addRow([`${(company.name||"MAPITSI CIVIL WORKS").toUpperCase()}`, ""]);
      cov.mergeCells(bannerR.number, 1, bannerR.number, 2);
      bannerR.height = 50;
      const bCell = bannerR.getCell(1);
      bCell.font = { name:"Calibri", size:24, bold:true, color:{argb:WHITE} };
      bCell.fill = fill.dark;
      bCell.alignment = { vertical:"middle", horizontal:"center" };

      const subR = cov.addRow([`Asset Management System — Management Report · ${monthLabel(month)}`, ""]);
      cov.mergeCells(subR.number, 1, subR.number, 2);
      subR.height = 26;
      const sCell = subR.getCell(1);
      sCell.font = { name:"Calibri", size:13, bold:false, color:{argb:"FFB0B8C8"} };
      sCell.fill = fill.dark;
      sCell.alignment = { vertical:"middle", horizontal:"center" };

      const redBar = cov.addRow([company.tagline||"Every Good Development Starts With A Good Foundation", ""]);
      cov.mergeCells(redBar.number, 1, redBar.number, 2);
      redBar.height = 22;
      const rCell = redBar.getCell(1);
      rCell.font = { name:"Calibri", size:11, bold:false, color:{argb:WHITE} };
      rCell.fill = fill.red;
      rCell.alignment = { vertical:"middle", horizontal:"center" };

      cov.addRow([]);

      // Report meta
      addSection(cov, "REPORT DETAILS", 2, DARK);
      [
        ["Report Period", monthLabel(month)],
        ["Generated On", new Date().toLocaleDateString("en-ZA", {day:"numeric",month:"long",year:"numeric"})],
        ["Prepared By", currentUser?.name || "System"],
        ["Role", ROLES[currentUser?.role] || ""],
        ["Company", company.name || "Mapitsi Civil Works"],
        ["Reg. Number", company.regNumber || "Not captured"],
        ["VAT Number", company.vatNumber || "Not captured"],
        ["Classification", "CONFIDENTIAL — FOR INTERNAL USE ONLY"],
      ].forEach(([k,v], i) => {
        const r = cov.addRow([k, v]);
        r.height = 20;
        r.getCell(1).font = f.muted; r.getCell(1).fill = fill.surf;
        r.getCell(2).font = { name:"Calibri",size:10,bold:true,color:{argb:DARK} };
        r.getCell(2).fill = fill.white;
        r.getCell(1).border = r.getCell(2).border = thin;
      });

      // KPI summary
      addSection(cov, "PORTFOLIO SUMMARY", 2, RED);
      [
        ["Total Assets on Register", assets.length, INT],
        ["Active Assets", assets.filter(a=>a.status==="Active").length, INT],
        ["Total Acquisition Cost (R)", totalCost, MONEY],
        ["Net Book Value (R)", totalBook, MONEY],
        ["Accumulated Depreciation (R)", totalCost-totalBook, MONEY],
        ["Maintenance Cost — "+monthLabel(month), rMC, MONEY],
        ["Fuel Cost — "+monthLabel(month), rFC, MONEY],
        ["Total Operating Cost (R)", rMC+rFC, MONEY],
        ["Labour Hours This Period", rH, HRS],
      ].forEach(([k,v,fmt_], i) => {
        const r = cov.addRow([k, v]);
        r.height = 20;
        r.getCell(1).font = f.muted; r.getCell(1).fill = i%2===0?fill.surf:fill.white;
        r.getCell(2).font = f.bold; r.getCell(2).fill = i%2===0?fill.surf:fill.white;
        r.getCell(2).numFmt = fmt_;
        r.getCell(2).alignment = { horizontal:"right" };
        r.getCell(1).border = r.getCell(2).border = thin;
      });

      // Alert summary
      addSection(cov, "ALERT SUMMARY", 2, DARK);
      [
        ["Critical Alerts", allAlerts.filter(a=>a.severity==="critical").length, true],
        ["Warnings", allAlerts.filter(a=>a.severity==="warning").length, true],
        ["Expired Compliance Docs", compliance.filter(c=>c.expiryDate&&c.expiryDate<today()).length, true],
        ["Open Incidents", openIncidents, true],
        ["Spares Out of Stock", sparesOut, false],
        ["Budgets Overspent", budgetsOverspent, false],
      ].forEach(([k,v,alert], i) => {
        const r = cov.addRow([k, v]);
        r.height = 20;
        const isRed = alert && v > 0;
        r.getCell(1).font = isRed ? { name:"Calibri",size:10,bold:true,color:{argb:RED} } : f.muted;
        r.getCell(2).font = isRed ? { name:"Calibri",size:11,bold:true,color:{argb:RED} } : f.bold;
        const rowFill = isRed ? fill.danger : i%2===0?fill.surf:fill.white;
        r.getCell(1).fill = r.getCell(2).fill = rowFill;
        r.getCell(2).numFmt = INT;
        r.getCell(2).alignment = { horizontal:"right" };
        r.getCell(1).border = r.getCell(2).border = thin;
      });

      // ── 2. ASSET REGISTER ──────────────────────────────────────────────
      const asWs = wb.addWorksheet("Asset Register", { properties:{ tabColor:{argb:INFO_C} } });
      freeze(asWs, [28,14,18,14,18,12,13,18,18,18,14,14,18]);
      addBanner(asWs, "ASSET REGISTER", `${assets.length} Assets on Register · ${company.name||"Mapitsi Civil Works"} · ${new Date().toLocaleDateString("en-ZA")}`, 13);
      addHdr(asWs, ["Asset Name","Category","Serial / Reg","Purchase Date","Purchase Cost (R)","Useful Life","Rate %/yr","Annual Write-Off (R)","Acc. Depreciation (R)","Net Book Value (R)","Location","Status","Condition"]);

      assets.forEach((a, i) => {
        const d = depreciate(a);
        const pct = Number(a.purchaseCost)>0 ? d.accumulated/Number(a.purchaseCost) : 0;
        const latestCond = [...conditions].filter(c=>c.assetId===a.id).sort((x,y)=>y.assessmentDate>x.assessmentDate?1:-1)[0];
        const rowFill = d.bookValue<=0 ? fill.danger : pct>0.75 ? fill.warn : i%2===0 ? fill.white : fill.surf;
        addRow(asWs, [
          a.name, a.category, a.serialNumber||"", a.purchaseDate,
          Number(a.purchaseCost||0), USEFUL_LIFE[a.category]||5, d.rate/100,
          Number(a.purchaseCost||0)/(USEFUL_LIFE[a.category]||5),
          d.accumulated, d.bookValue, a.location, a.status, latestCond?.rating||"Not Assessed"
        ], false, {
          fill: rowFill,
          fmt: ["","","","DD-MMM-YYYY",MONEY,"","0.0%",MONEY,MONEY,MONEY,"","",""],
          align:["left","left","left","center","right","center","center","right","right","right","left","center","center"]
        });
      });
      addTotal(asWs, ["PORTFOLIO TOTAL — "+assets.length+" Assets","","","",totalCost,"","",
        assets.reduce((s,a)=>s+Number(a.purchaseCost||0)/(USEFUL_LIFE[a.category]||5),0),
        totalCost-totalBook, totalBook,"","",""], {
        fmt:["","","","",MONEY,"","",MONEY,MONEY,MONEY,"","",""],
        align:["left","","","","right","","","right","right","right","","",""]
      });

      // ── 3. DEPRECIATION ────────────────────────────────────────────────
      const dpWs = wb.addWorksheet("Depreciation", { properties:{ tabColor:{argb:"FFCA8A04"} } });
      freeze(dpWs, [28,14,14,18,12,12,12,18,20,18,13,18]);
      addBanner(dpWs, "DEPRECIATION SCHEDULE", "Straight-Line Method — Auto-Calculated per Asset Category", 12);
      addHdr(dpWs, ["Asset","Category","Purchase Date","Purchase Cost (R)","Useful Life","Rate %/yr","Yrs Elapsed","Annual Write-Off (R)","Acc. Depreciation (R)","Book Value (R)","% Depreciated","Health Status"]);
      assets.forEach((a,i) => {
        const d = depreciate(a);
        const pct = Number(a.purchaseCost)>0 ? d.accumulated/Number(a.purchaseCost) : 0;
        const health = d.bookValue<=0?"Fully Depreciated":pct>0.75?"Near End of Life":pct>0.50?"Mid-Life":"Good";
        const rowFill = d.bookValue<=0?fill.danger:pct>0.75?fill.warn:i%2===0?fill.white:fill.surf;
        addRow(dpWs, [
          a.name, a.category, a.purchaseDate, Number(a.purchaseCost||0),
          USEFUL_LIFE[a.category]||5, d.rate/100, d.years,
          Number(a.purchaseCost||0)/(USEFUL_LIFE[a.category]||5),
          d.accumulated, d.bookValue, pct, health
        ], false, { fill:rowFill, fmt:["","","DD-MMM-YYYY",MONEY,"","0.0%","0.0",MONEY,MONEY,MONEY,"0.0%",""],
          align:["left","left","center","right","center","center","center","right","right","right","center","center"] });
      });
      addTotal(dpWs, ["PORTFOLIO TOTAL","","",totalCost,"","","",
        assets.reduce((s,a)=>s+Number(a.purchaseCost||0)/(USEFUL_LIFE[a.category]||5),0),
        totalCost-totalBook,totalBook,totalCost>0?(totalCost-totalBook)/totalCost:0,""], {
        fmt:["","","",MONEY,"","","",MONEY,MONEY,MONEY,"0.0%",""]
      });

      // ── 4. MAINTENANCE ─────────────────────────────────────────────────
      const maWs = wb.addWorksheet("Maintenance", { properties:{ tabColor:{argb:"FF7C3AED"} } });
      freeze(maWs, [28,14,14,18,16,35,25,25,14]);
      addBanner(maWs, "MAINTENANCE RECORDS", `Period: ${monthLabel(month)} · ${rM.length} Records · Total: ${fmt(rMC)}`, 9);
      addHdr(maWs, ["Asset","Category","Date","Type","Cost (R)","Description","Performed By","Project Allocated","Next Due Date"]);
      rM.forEach((m,i) => {
        const asset = assets.find(a=>a.id===m.assetId);
        const project = projects.find(p=>p.id===m.projectId);
        const od = m.nextDueDate&&m.nextDueDate<today();
        addRow(maWs, [
          asset?.name||"—", asset?.category||"", m.date, m.type,
          Number(m.cost||0), m.description||"", m.performedBy||"", project?.name||"", m.nextDueDate||""
        ], false, { fill:od?fill.danger:i%2===0?fill.white:fill.surf,
          fmt:["","","DD-MMM-YYYY","",MONEY,"","","","DD-MMM-YYYY"],
          align:["left","left","center","left","right","left","left","left","center"] });
      });
      if(rM.length>0) addTotal(maWs, ["TOTAL MAINTENANCE COST — "+monthLabel(month),"","","",rMC,"","","",""], {
        fmt:["","","","",MONEY,"","","",""],
        align:["left","","","","right","","","",""]
      });

      // ── 5. FUEL ────────────────────────────────────────────────────────
      const fuWs = wb.addWorksheet("Fuel & Usage", { properties:{ tabColor:{argb:"FF"+WARN_C.replace("FF","")} } });
      freeze(fuWs, [28,14,14,12,16,16,18,14,25]);
      const totL = rF.reduce((s,f)=>s+Number(f.litres||0),0);
      const avgCpl = totL>0 ? rFC/totL : 0;
      addBanner(fuWs, "FUEL & USAGE LOG", `Period: ${monthLabel(month)} · ${totL.toFixed(0)}L · ${fmt(rFC)} · Avg R${avgCpl.toFixed(2)}/L`, 9);
      addHdr(fuWs, ["Asset","Category","Date","Litres","Cost (R)","Cost/Litre (R)","Odometer / Hours","Site","Project Allocated"]);
      rF.forEach((ff2,i) => {
        const asset = assets.find(a=>a.id===ff2.assetId);
        const project = projects.find(p=>p.id===ff2.projectId);
        const cpl = Number(ff2.litres)>0 ? Number(ff2.cost)/Number(ff2.litres) : 0;
        const highCpl = cpl > avgCpl * 1.15 && avgCpl > 0;
        addRow(fuWs, [
          asset?.name||"—", asset?.category||"", ff2.date,
          Number(ff2.litres||0), Number(ff2.cost||0), cpl,
          ff2.odometer||"", ff2.site, project?.name||""
        ], false, { fill:highCpl?fill.warn:i%2===0?fill.white:fill.surf,
          fmt:["","","DD-MMM-YYYY","0.0",MONEY,MONEY,"","",""],
          align:["left","left","center","right","right","right","left","left","left"] });
      });
      if(rF.length>0) addTotal(fuWs, ["TOTAL / AVERAGES","","",totL,rFC,totL>0?rFC/totL:0,"","",""], {
        fmt:["","","","0.0",MONEY,MONEY,"","",""]
      });

      // ── 6. TIMESHEETS ──────────────────────────────────────────────────
      const tsWs2 = wb.addWorksheet("Timesheets", { properties:{ tabColor:{argb:RED} } });
      freeze(tsWs2, [25,14,14,14,25,30]);
      addBanner(tsWs2, "TIMESHEET RECORDS", `Period: ${monthLabel(month)} · ${rT.length} Entries · ${rH.toFixed(1)} Hours`, 6);
      addHdr(tsWs2, ["Employee","Date","Hours Worked","Site","Task / Role","Notes"]);
      rT.forEach((t,i) => {
        addRow(tsWs2, [t.employeeName, t.date, Number(t.hours||0), t.site, t.task||"", t.notes||""], i%2!==0, {
          fmt:["","DD-MMM-YYYY","0.0","","",""], align:["left","center","center","left","left","left"]
        });
      });
      if(rT.length>0) addTotal(tsWs2, ["TOTAL HOURS","",rH,"","",""], { fmt:["","","0.0","","",""] });

      // ── 7. SUMMARY ─────────────────────────────────────────────────────
      const smWs = wb.addWorksheet("Summary", { properties:{ tabColor:{argb:"FF059669"} } });
      smWs.views = [{ showGridLines:false }];
      smWs.columns = [{ width:48 },{ width:26 }];

      const banSm = smWs.addRow(["MANAGEMENT SUMMARY REPORT", ""]);
      smWs.mergeCells(banSm.number, 1, banSm.number, 2); banSm.height = 38;
      banSm.getCell(1).font = f.title; banSm.getCell(1).fill = fill.dark;
      banSm.getCell(1).alignment = { vertical:"middle", horizontal:"center" };
      const banSm2 = smWs.addRow([`${company.name||"Mapitsi Civil Works"} · ${monthLabel(month)}`, ""]);
      smWs.mergeCells(banSm2.number, 1, banSm2.number, 2); banSm2.height = 22;
      banSm2.getCell(1).font = f.sub; banSm2.getCell(1).fill = fill.dark;
      banSm2.getCell(1).alignment = { vertical:"middle", horizontal:"center" };

      const addSmRow = (label, value, bold=false, numFmt2="", isAlert=false) => {
        const rn = smWs.lastRow.number + 1;
        const r = smWs.addRow([label, value]);
        r.height = 20;
        r.getCell(1).font = bold ? f.bold : f.muted;
        r.getCell(2).font = isAlert&&value>0 ? { name:"Calibri",size:10,bold:true,color:{argb:RED} } : bold ? f.bold : f.data;
        r.getCell(2).numFmt = numFmt2;
        r.getCell(2).alignment = { horizontal:"right" };
        const rowFill = isAlert&&value>0 ? fill.danger : rn%2===0?fill.surf:fill.white;
        r.getCell(1).fill = r.getCell(2).fill = rowFill;
        r.getCell(1).border = r.getCell(2).border = thin;
      };

      const smSections = [
        { title:"ASSET PORTFOLIO", c:DARK, rows:[
          ["Total Assets on Register", assets.length, true, INT],
          ["Active Assets", assets.filter(a=>a.status==="Active").length, false, INT],
          ["Total Acquisition Cost (R)", totalCost, true, MONEY],
          ["Net Book Value (R)", totalBook, true, MONEY],
          ["Accumulated Depreciation (R)", totalCost-totalBook, false, MONEY],
          ["Portfolio Depreciation %", totalCost>0?(totalCost-totalBook)/totalCost:0, false, PCT],
          ["Assets Fully Depreciated", assets.filter(a=>depreciate(a).bookValue<=0).length, false, INT],
          ["Assets Disposed", disposals.length, false, INT],
        ]},
        { title:"OPERATIONAL — "+monthLabel(month).toUpperCase(), c:RED, rows:[
          ["Maintenance Records", rM.length, false, INT],
          ["Total Maintenance Cost (R)", rMC, true, MONEY],
          ["Fuel Records", rF.length, false, INT],
          ["Total Fuel Cost (R)", rFC, true, MONEY],
          ["Total Operating Cost (R)", rMC+rFC, true, MONEY],
          ["Labour Hours", rH, false, HRS],
        ]},
        { title:"COMPLIANCE & RISK", c:DARK, rows:[
          ["Expired Documents", compliance.filter(c=>c.expiryDate&&c.expiryDate<today()).length, true, INT, true],
          ["Expiring within 30 Days", expiringSoon.length, false, INT, true],
          ["Open Incidents", openIncidents, true, INT, true],
          ["Total Incident Downtime (hrs)", incidents.reduce((s,i)=>s+Number(i.downtimeHours||0),0), false, HRS],
          ["Total Incident Repair Cost (R)", incidents.reduce((s,i)=>s+Number(i.repairCost||0),0), false, MONEY],
          ["Poor Condition Assets", poorConditionAssets, false, INT, true],
          ["Schedule Alerts", scheduleAlerts.length, false, INT, true],
        ]},
        { title:"PARTS & PROCUREMENT", c:RED, rows:[
          ["Total Parts on Register", spares.length, false, INT],
          ["Parts Out of Stock", sparesOut, false, INT, true],
          ["Parts Low Stock", sparesLow, false, INT, true],
          ["Spares Inventory Value (R)", spares.reduce((s,x)=>s+Number(x.quantity||0)*Number(x.unitCost||0),0), true, MONEY],
          ["Open Purchase Orders", purchaseOrders.filter(p=>!["Fully Received","Cancelled"].includes(p.status)).length, false, INT],
          ["Total PO Value (excl. VAT)", purchaseOrders.reduce((s,p)=>s+poItemTotal(p),0), false, MONEY],
        ]},
        { title:"HR & LABOUR", c:DARK, rows:[
          ["Total Employees", employees.length, false, INT],
          ["Active Employees", employees.filter(e=>e.status==="Active").length, false, INT],
          ["Currently on Leave", employeesOnLeave, false, INT],
          ["Total Overtime Hours (All Time)", totalOvertimeHours, false, HRS],
          ["Job Cards Open / Active", jobCards.filter(j=>!["Complete","Cancelled","Invoiced"].includes(j.status)).length, false, INT, true],
          ["Critical Job Cards", jobCards.filter(j=>j.priority==="Critical"&&!["Complete","Cancelled"].includes(j.status)).length, false, INT, true],
        ]},
        { title:"FINANCIAL", c:RED, rows:[
          ["Active Projects", projects.filter(p=>p.status==="Active").length, false, INT],
          ["Total Active Contract Value (R)", projects.filter(p=>p.status==="Active").reduce((s,p)=>s+Number(p.contractValue||0),0), true, MONEY],
          ["Budgets Overspent", budgetsOverspent, false, INT, true],
          ["Total Disposal Recovery (R)", disposals.reduce((s,d)=>s+Number(d.disposalValue||0),0), false, MONEY],
        ]},
      ];

      smSections.forEach(sec => {
        addSection(smWs, sec.title, 2, sec.c);
        sec.rows.forEach(r => addSmRow(...r));
      });

      // ── 8. COMPLIANCE ──────────────────────────────────────────────────
      const coWs = wb.addWorksheet("Compliance", { properties:{ tabColor:{argb:"FF"+INFO_C.replace("FF","")||INFO_C} } });
      freeze(coWs, [28,22,20,14,14,14,35]);
      addBanner(coWs, "COMPLIANCE & LICENCES REGISTER", `${compliance.length} Documents · ${compliance.filter(c=>c.expiryDate&&c.expiryDate<today()).length} Expired · ${expiringSoon.length} Expiring Soon`, 7);
      addHdr(coWs, ["Asset","Document Type","Doc Number","Issue Date","Expiry Date","Status","Notes"]);
      [...compliance].sort((a,b)=>a.expiryDate>b.expiryDate?1:-1).forEach((c,i) => {
        const asset = assets.find(a=>a.id===c.assetId);
        const days = c.expiryDate ? Math.round((new Date(c.expiryDate)-new Date())/(1000*60*60*24)) : null;
        const expired = days!==null&&days<0, soon = days!==null&&days>=0&&days<=30;
        addRow(coWs, [
          asset?.name||"—", c.docType, c.docNumber||"", c.issueDate||"", c.expiryDate||"",
          expired?"EXPIRED":soon?`Expires in ${days} days`:"Valid", c.notes||""
        ], false, { fill:expired?fill.danger:soon?fill.warn:i%2===0?fill.white:fill.surf,
          fmt:["","","","DD-MMM-YYYY","DD-MMM-YYYY","",""],
          align:["left","left","left","center","center","center","left"] });
      });

      // ── 9. INCIDENTS ───────────────────────────────────────────────────
      const inWs = wb.addWorksheet("Incidents", { properties:{ tabColor:{argb:RED} } });
      freeze(inWs, [28,14,14,18,35,22,14,16,22,12]);
      addBanner(inWs, "INCIDENT & BREAKDOWN LOG", `${incidents.length} Incidents · ${incidents.filter(i=>i.resolved==="No").length} Open · ${fmt(incidents.reduce((s,i)=>s+Number(i.repairCost||0),0))} Total Repair Cost`, 10);
      addHdr(inWs, ["Asset","Category","Date","Type","Description","Operator","Downtime (hrs)","Repair Cost (R)","Reported By","Status"]);
      incidents.forEach((inc,i) => {
        const asset = assets.find(a=>a.id===inc.assetId);
        addRow(inWs, [
          asset?.name||"—", asset?.category||"", inc.date, inc.type, inc.description||"",
          inc.operatorName||"", Number(inc.downtimeHours||0), Number(inc.repairCost||0), inc.reportedBy||"",
          inc.resolved==="Yes"?"Resolved":"Open"
        ], false, { fill:inc.resolved==="No"?fill.danger:i%2===0?fill.white:fill.surf,
          fmt:["","","DD-MMM-YYYY","","","",HRS,MONEY,"",""],
          align:["left","left","center","left","left","left","center","right","left","center"] });
      });
      if(incidents.length>0) addTotal(inWs, ["TOTALS","","","","","",
        incidents.reduce((s,i)=>s+Number(i.downtimeHours||0),0),
        incidents.reduce((s,i)=>s+Number(i.repairCost||0),0),"",""], {
        fmt:["","","","","","",HRS,MONEY,"",""]
      });

      // ── 10. BUDGET TRACKER ─────────────────────────────────────────────
      const buWs = wb.addWorksheet("Budget Tracker", { properties:{ tabColor:{argb:"FFD97706"} } });
      freeze(buWs, [18,20,14,18,18,18,13,16,30]);
      addBanner(buWs, "BUDGET TRACKER", `${budgets.length} Budget Lines · ${budgetsOverspent} Overspent · ${fmt(totalBudgeted)} Budgeted this month`, 9);
      addHdr(buWs, ["Month","Category","Site","Budget (R)","Spent (R)","Remaining (R)","Usage %","Status","Notes"]);
      budgets.forEach((b,i) => {
        const spent=getBudgetSpent(b), budget=Number(b.budgetAmount||0), rem=budget-spent;
        const pct=budget>0?spent/budget:0, over=spent>budget;
        addRow(buWs, [monthLabel(b.month),b.category,b.site,budget,spent,rem,pct,
          over?"OVER BUDGET":pct>0.8?"Near Limit":"On Track",b.notes||""
        ], false, { fill:over?fill.danger:pct>0.8?fill.warn:i%2===0?fill.white:fill.surf,
          fmt:["","","",MONEY,MONEY,MONEY,PCT,"",""],
          align:["left","left","left","right","right","right","right","center","left"] });
      });

      // ── 11. SPARES INVENTORY ───────────────────────────────────────────
      const spWs2 = wb.addWorksheet("Parts & Spares", { properties:{ tabColor:{argb:"FF059669"} } });
      freeze(spWs2, [28,16,16,20,12,14,16,18,14,12,30]);
      addBanner(spWs2, "PARTS & SPARES INVENTORY",
        `${spares.length} Parts · ${sparesOut} Out of Stock · ${sparesLow} Low Stock · ${fmt(spares.reduce((s,x)=>s+Number(x.quantity||0)*Number(x.unitCost||0),0))} Total Value`, 11);
      addHdr(spWs2, ["Part Name","Part Number","Category","Supplier","Qty in Stock","Min Stock Level","Unit Cost (R)","Total Value (R)","Location","Status","Notes"]);
      [...spares].sort((a,b)=>{ const aA=Number(a.quantity||0)<=Number(a.minStockLevel||0), bA=Number(b.quantity||0)<=Number(b.minStockLevel||0); return bA-aA; })
        .forEach((s,i) => {
          const out=Number(s.quantity||0)===0, low=!out&&Number(s.quantity||0)<=Number(s.minStockLevel||0)&&Number(s.minStockLevel||0)>0;
          addRow(spWs2, [
            s.partName, s.partNumber||"", s.category, s.supplier||"",
            Number(s.quantity||0), Number(s.minStockLevel||0), Number(s.unitCost||0),
            Number(s.quantity||0)*Number(s.unitCost||0), s.location,
            out?"OUT OF STOCK":low?"LOW STOCK":s.status, s.notes||""
          ], false, { fill:out?fill.danger:low?fill.warn:i%2===0?fill.white:fill.surf,
            fmt:["","","","",INT,INT,MONEY,MONEY,"","",""],
            align:["left","left","left","left","center","center","right","right","left","center","left"] });
        });
      addTotal(spWs2, ["TOTAL INVENTORY VALUE","","","","","","",
        spares.reduce((s,x)=>s+Number(x.quantity||0)*Number(x.unitCost||0),0),"","",""], {
        fmt:["","","","","","","",MONEY,"","",""]
      });

      // ── 12. JOB CARDS ──────────────────────────────────────────────────
      if(jobCards.length > 0) {
        const jcWs2 = wb.addWorksheet("Job Cards", { properties:{ tabColor:{argb:"FF374151"} } });
        freeze(jcWs2, [14,28,22,12,16,22,14,16,16,35,35]);
        addBanner(jcWs2, "JOB CARD REGISTER", `${jobCards.length} Total · ${jobCards.filter(j=>!["Complete","Cancelled","Invoiced"].includes(j.status)).length} Open · ${jobCards.filter(j=>j.priority==="Critical"&&!["Complete","Cancelled"].includes(j.status)).length} Critical`, 11);
        addHdr(jcWs2, ["JC Number","Asset","Type","Priority","Status","Assigned To","Date Opened","Estimated Cost","Actual Cost","Description","Work Done"]);
        [...jobCards].sort((a,b)=>{const po={Critical:0,High:1,Medium:2,Low:3};return (po[a.priority]||2)-(po[b.priority]||2);}).forEach((j,i) => {
          const asset=assets.find(a=>a.id===j.assetId);
          const jcFill=j.priority==="Critical"?fill.danger:j.priority==="High"?fill.warn:j.status==="Complete"?fill.success:i%2===0?fill.white:fill.surf;
          addRow(jcWs2, [
            `JC-${j.id.slice(-6).toUpperCase()}`, asset?.name||"—", j.type, j.priority, j.status,
            j.assignedTo||"", j.openedDate, Number(j.estimatedCost||0), Number(j.actualCost||0),
            j.description||"", j.workDone||""
          ], false, { fill:jcFill,
            fmt:["","","","","","","DD-MMM-YYYY",MONEY,MONEY,"",""],
            align:["center","left","left","center","center","left","center","right","right","left","left"] });
        });
        addTotal(jcWs2, ["","","","","","","","",jobCards.reduce((s,j)=>s+Number(j.actualCost||0),0),"",""], {
          fmt:["","","","","","","","",MONEY,"",""]
        });
      }

      // ── 13. PURCHASE ORDERS ────────────────────────────────────────────
      if(purchaseOrders.length > 0) {
        const poWs2 = wb.addWorksheet("Purchase Orders", { properties:{ tabColor:{argb:"FF1D4ED8"} } });
        freeze(poWs2, [16,28,22,22,10,18,18,12,14,14,16]);
        const poTotal2=purchaseOrders.reduce((s,p)=>s+poItemTotal(p),0);
        addBanner(poWs2, "PURCHASE ORDERS", `${purchaseOrders.length} Orders · ${purchaseOrders.filter(p=>!["Fully Received","Cancelled"].includes(p.status)).length} Open · ${fmt(poTotal2)} excl. VAT · ${fmt(poTotal2*1.15)} incl. VAT`, 11);
        addHdr(poWs2, ["PO Number","Supplier","Type","Project","Lines","Total excl. VAT","Total incl. VAT","Terms","Date Raised","Date Required","Status"]);
        purchaseOrders.forEach((po,i) => {
          const supplier=suppliers.find(s=>s.id===po.supplierId);
          const project=projects.find(p=>p.id===po.projectId);
          const tot=poItemTotal(po);
          const poFill=po.status==="Fully Received"?fill.success:po.status==="Cancelled"?fill.surf:i%2===0?fill.white:fill.surf;
          addRow(poWs2, [po.poNumber,supplier?.name||"—",po.type,project?.name||"—",
            (po.items||[]).length,tot,tot*1.15,po.terms||"—",po.dateCreated,po.dateRequired||"",po.status
          ], false, { fill:poFill,
            fmt:["","","","",INT,MONEY,MONEY,"","DD-MMM-YYYY","DD-MMM-YYYY",""],
            align:["center","left","left","left","center","right","right","center","center","center","center"] });
        });
        addTotal(poWs2, ["TOTALS","","","",purchaseOrders.reduce((s,p)=>s+(p.items||[]).length,0),poTotal2,poTotal2*1.15,"","","",""], {
          fmt:["","","","",INT,MONEY,MONEY,"","","",""]
        });
      }

      // ── 14. ASSET EXPENSES ─────────────────────────────────────────────
      const aeWs = wb.addWorksheet("Asset Expenses", { properties:{ tabColor:{argb:RED} } });
      freeze(aeWs, [28,14,14,14,18,16,18,14,18,16,22,12]);
      addBanner(aeWs, "ASSET EXPENSE REPORT", "Full Lifetime Cost Breakdown per Asset — Maintenance · Fuel · Incident Repairs · Total Cost of Ownership", 12);
      addHdr(aeWs, ["Asset","Category","Status","Location","Purchase Cost (R)","Book Value (R)","Maintenance (R)","Fuel (R)","Incident Repairs (R)","Total Expenses (R)","Cost of Ownership (R)","Expense Ratio %"]);
      [...assets].map(a => { const e=getAssetExpenses(a.id), d=depreciate(a), pc=Number(a.purchaseCost||0), ratio=pc>0?e.totalExpenses/pc:0; return {...a,_e:e,_d:d,_pc:pc,_ratio:ratio}; })
        .sort((a,b)=>b._e.totalExpenses-a._e.totalExpenses)
        .forEach((a,i) => {
          const aFill=a._ratio>0.75?fill.danger:a._ratio>0.40?fill.warn:i%2===0?fill.white:fill.surf;
          addRow(aeWs, [
            a.name, a.category, a.status, a.location, a._pc, a._d.bookValue,
            a._e.maintCost, a._e.fuelCost, a._e.incidentCost, a._e.totalExpenses,
            a._pc+a._e.totalExpenses, a._ratio
          ], false, { fill:aFill,
            fmt:["","","","",MONEY,MONEY,MONEY,MONEY,MONEY,MONEY,MONEY,PCT],
            align:["left","left","center","left","right","right","right","right","right","right","right","right"] });
        });
      addTotal(aeWs, ["FLEET TOTALS","","","",
        assets.reduce((s,a)=>s+Number(a.purchaseCost||0),0),
        assets.reduce((s,a)=>s+depreciate(a).bookValue,0),
        maint.reduce((s,m)=>s+Number(m.cost||0),0),
        fuel.reduce((s,f)=>s+Number(f.cost||0),0),
        incidents.reduce((s,i)=>s+Number(i.repairCost||0),0),
        assets.reduce((s,a)=>s+getAssetExpenses(a.id).totalExpenses,0),
        assets.reduce((s,a)=>s+Number(a.purchaseCost||0)+getAssetExpenses(a.id).totalExpenses,0), ""
      ], { fmt:["","","","",MONEY,MONEY,MONEY,MONEY,MONEY,MONEY,MONEY,""] });

      // ── 15. SARS 11(e) ─────────────────────────────────────────────────
      const srWs = wb.addWorksheet("SARS 11(e)", { properties:{ tabColor:{argb:"FF059669"} } });
      freeze(srWs, [28,14,14,18,12,22,18,22,18,28]);
      addBanner(srWs, "SARS SECTION 11(e) — WEAR & TEAR SCHEDULE", "For Income Tax Submission Purposes · Verify with Tax Practitioner Before Filing", 10);
      addHdr(srWs, ["Asset","Category","Purchase Date","Purchase Cost (R)","SARS Rate %","SARS Annual Allowance (R)","Straight-Line Rate %","Straight-Line Annual (R)","Difference (R)","Note"]);
      assets.forEach((a,i) => {
        const sRate=SARS_RATES[a.category]||20, slRate=(1/(USEFUL_LIFE[a.category]||5))*100;
        const sAnnual=Number(a.purchaseCost||0)*sRate/100, slAnnual=Number(a.purchaseCost||0)/(USEFUL_LIFE[a.category]||5);
        const diff=sAnnual-slAnnual;
        addRow(srWs, [
          a.name, a.category, a.purchaseDate, Number(a.purchaseCost||0), sRate/100,
          sAnnual, slRate/100, slAnnual, diff,
          sRate>slRate?"SARS more favourable":sRate<slRate?"Straight-line more favourable":"Equal rates"
        ], false, { fill:sAnnual>slAnnual?fill.success:i%2===0?fill.white:fill.surf,
          fmt:["","","DD-MMM-YYYY",MONEY,"0.0%",MONEY,"0.0%",MONEY,MONEY,""],
          align:["left","left","center","right","center","right","center","right","right","center"] });
      });
      addTotal(srWs, ["TOTALS","","",totalCost,"",
        assets.reduce((s,a)=>s+(Number(a.purchaseCost||0)*(SARS_RATES[a.category]||20)/100),0), "",
        assets.reduce((s,a)=>s+Number(a.purchaseCost||0)/(USEFUL_LIFE[a.category]||5),0),
        assets.reduce((s,a)=>s+(Number(a.purchaseCost||0)*(SARS_RATES[a.category]||20)/100)-(Number(a.purchaseCost||0)/(USEFUL_LIFE[a.category]||5)),0), ""
      ], { fmt:["","","",MONEY,"",MONEY,"",MONEY,MONEY,""] });

      // ── 16. AUDIT TRAIL ────────────────────────────────────────────────
      const auWs = wb.addWorksheet("Audit Trail", { properties:{ tabColor:{argb:"FF6B7280"} } });
      freeze(auWs, [14,12,22,14,12,22,50]);
      addBanner(auWs, "SYSTEM AUDIT TRAIL", `Last 1,000 Events · ${auditLog.length} Total Events Logged`, 7);
      addHdr(auWs, ["Date","Time","User","Role","Action","Module","Description"]);
      auditLog.slice(0,1000).forEach((a,i) => {
        const ts2=new Date(a.timestamp);
        const aFill=a.action==="DELETE"?fill.danger:a.action==="ADD"?fill.success:i%2===0?fill.white:fill.surf;
        addRow(auWs, [
          ts2.toLocaleDateString("en-ZA"),
          ts2.toLocaleTimeString("en-ZA",{hour:"2-digit",minute:"2-digit"}),
          a.user, a.role, a.action, a.module, a.description
        ], false, { fill:aFill, align:["center","center","left","center","center","left","left"] });
      });

      // ── WRITE FILE ─────────────────────────────────────────────────────
      const buf = await wb.xlsx.writeBuffer();
      const blob = new Blob([buf], { type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = URL.createObjectURL(blob);
      const a2 = document.createElement("a");
      a2.href = url; a2.download = `Mapitsi_Management_Report_${month}.xlsx`;
      a2.click(); URL.revokeObjectURL(url);
      toast("Professional Excel report exported ✓", "success");
    } catch(err) {
      console.error("Excel export error:", err);
      toast("Export failed: " + err.message, "error");
    }
  };

  if (!currentUser)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: C.dark,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'DM Sans',sans-serif",
        }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Barlow+Condensed:wght@600;700;800&display=swap');*{box-sizing:border-box;}`}</style>
        <div
          style={{
            background: C.white,
            borderRadius: 14,
            padding: "40px 44px",
            width: "100%",
            maxWidth: 400,
            boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                background: C.red,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt="Logo"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <span
                  style={{
                    color: "white",
                    fontSize: 18,
                    fontWeight: 900,
                    fontFamily: "'Barlow Condensed',sans-serif",
                  }}
                >
                  MC
                </span>
              )}
            </div>
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: C.text,
                  fontFamily: "'Barlow Condensed',sans-serif",
                  letterSpacing: 0.5,
                }}
              >
                {company.name || "Mapitsi Civil Works"}
              </div>
              <div style={{ fontSize: 11, color: C.muted, letterSpacing: 1 }}>
                ASSET MANAGEMENT SYSTEM
              </div>
              {company.address && (
                <div style={{ fontSize: 10, color: C.mutedLt, marginTop: 2 }}>
                  {company.address}
                  {company.city ? ", " + company.city : ""}
                </div>
              )}
            </div>
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: C.text,
              marginBottom: 20,
            }}
          >
            Sign in to your account
          </div>
          <Field label="Username">
            <input
              {...inp}
              value={loginForm.username}
              onChange={(e) =>
                setLoginForm({
                  ...loginForm,
                  username: e.target.value,
                  error: "",
                })
              }
              placeholder="Enter username"
              onKeyDown={(e) => e.key === "Enter" && doLogin()}
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              {...inp}
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({
                  ...loginForm,
                  password: e.target.value,
                  error: "",
                })
              }
              placeholder="Enter password"
              onKeyDown={(e) => e.key === "Enter" && doLogin()}
            />
          </Field>
          {loginForm.error && (
            <div
              style={{
                background: C.redLight,
                border: `1px solid ${C.redBorder}`,
                borderRadius: 7,
                padding: "10px 14px",
                fontSize: 12,
                color: C.red,
                marginBottom: 14,
                fontWeight: 600,
              }}
            >
              {loginForm.error}
            </div>
          )}
          <Btn
            style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
            onClick={doLogin}
          >
            Sign In →
          </Btn>
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <button
              onClick={() =>
                setLoginForm((f) => ({ ...f, showForgot: !f.showForgot }))
              }
              style={{
                background: "none",
                border: "none",
                color: C.muted,
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif",
                textDecoration: "underline",
              }}
            >
              Forgot password?
            </button>
          </div>
          {loginForm.showForgot && (
            <div
              style={{
                marginTop: 12,
                padding: "14px",
                background: "#FFF7ED",
                border: "1px solid #FED7AA",
                borderRadius: 8,
                fontSize: 12,
                color: "#92400E",
                lineHeight: 1.7,
              }}
            >
              <strong
                style={{ display: "block", marginBottom: 4, color: "#78350F" }}
              >
                Password Reset
              </strong>
              Contact your system administrator to reset your password. The
              admin can update passwords via the Users panel after signing in.
              <div style={{ marginTop: 8, fontSize: 11, color: C.muted }}>
                Admin username: <strong style={{ color: C.text }}>admin</strong>
              </div>
            </div>
          )}
          <div
            style={{
              marginTop: 16,
              padding: "14px",
              background: C.surface,
              borderRadius: 8,
              fontSize: 11,
              color: C.muted,
              lineHeight: 1.8,
            }}
          >
            <strong
              style={{ color: C.text, display: "block", marginBottom: 4 }}
            >
              Default credentials:
            </strong>
            Username: <strong>admin</strong> · Password:{" "}
            <strong>admin123</strong>
          </div>
          <div
            style={{
              marginTop: 16,
              padding: "12px 14px",
              background: C.dark,
              borderRadius: 8,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 10, color: "#4B5563", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
              Every Good Development Starts With A Good Foundation
            </div>
            {(company.phone || company.email) && (
              <div style={{ fontSize: 11, color: "#6B7280" }}>
                {company.phone && <span>📞 {company.phone}</span>}
                {company.phone && company.email && <span style={{ margin: "0 8px", color: "#374151" }}>·</span>}
                {company.email && <span>✉ {company.email}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  return (
    <div
      style={{
        fontFamily: "'DM Sans',sans-serif",
        minHeight: "100vh",
        background: C.surface,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Barlow+Condensed:wght@600;700;800&display=swap');*{box-sizing:border-box;}input:focus,select:focus{border-color:${C.red}!important;box-shadow:0 0 0 3px rgba(140,20,20,0.08);} @keyframes slideIn{from{opacity:0;transform:translateX(40px);}to{opacity:1;transform:translateX(0);}} @media print{
  .np{display:none!important;}
  @page{margin:18mm 18mm 22mm 18mm;size:A4;}
  body{print-color-adjust:exact;-webkit-print-color-adjust:exact;}
  .print-break{page-break-before:always;}
  .print-no-break{page-break-inside:avoid;}
  table{page-break-inside:auto;}
  tr{page-break-inside:avoid;page-break-after:auto;}
  thead{display:table-header-group;}
  tfoot{display:table-footer-group;}
}`}</style>

      {/* TOPBAR */}
      <header
        className="np"
        style={{
          height: 54,
          background: C.dark,
          display: "flex",
          alignItems: "center",
          padding: "0 18px",
          gap: 14,
          position: "sticky",
          top: 0,
          zIndex: 200,
          borderBottom: "1px solid #1E2130",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: W - 18,
            flexShrink: 0,
            overflow: "hidden",
            transition: "width 0.2s",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: C.red,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
            }}
          >
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt="Logo"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <span
                style={{
                  color: "white",
                  fontSize: 13,
                  fontWeight: 900,
                  fontFamily: "'Barlow Condensed',sans-serif",
                }}
              >
                MC
              </span>
            )}
          </div>
          {side && (
            <div style={{ overflow: "hidden", whiteSpace: "nowrap" }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: C.white,
                  letterSpacing: 0.8,
                  fontFamily: "'Barlow Condensed',sans-serif",
                  lineHeight: 1.1,
                }}
              >
                {(company.name || "Mapitsi Civil")
                  .split(" ")
                  .slice(0, 2)
                  .join(" ")
                  .toUpperCase()}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "#4B5563",
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                }}
              >
                {company.tagline || "Asset Management"}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => setSide(!side)}
          style={{
            background: "none",
            border: "none",
            color: "#4B5563",
            fontSize: 15,
            cursor: "pointer",
            padding: 6,
            borderRadius: 5,
          }}
        >
          ☰
        </button>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {allAlerts.filter((a) => a.severity === "critical").length > 0 && (
            <button
              onClick={() => setTab("Alerts")}
              style={{
                background: C.red,
                color: "white",
                borderRadius: 5,
                padding: "3px 10px",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.3,
                border: "none",
                cursor: "pointer",
                fontFamily: "'DM Sans',sans-serif",
              }}
            >
              ⚑ {allAlerts.filter((a) => a.severity === "critical").length}{" "}
              Critical Alert
              {allAlerts.filter((a) => a.severity === "critical").length > 1
                ? "s"
                : ""}
            </button>
          )}
          <div
            style={{
              fontSize: 11,
              color: "#4B5563",
              textAlign: "right",
              lineHeight: 1.5,
            }}
          >
            <div style={{ color: "#6B7280" }}>
              {new Date().toLocaleDateString("en-ZA", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
            <div style={{ fontSize: 9, letterSpacing: 0.5 }}>
              PLANT MANAGER PORTAL
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {can(currentUser, "canManageUsers") && (
              <button
                onClick={() => setShowUserMgmt(true)}
                style={{
                  background: "none",
                  border: "1px solid #2A2F40",
                  borderRadius: 6,
                  color: "#6B7280",
                  fontSize: 11,
                  cursor: "pointer",
                  padding: "5px 10px",
                  fontFamily: "'DM Sans',sans-serif",
                  fontWeight: 600,
                }}
              >
                👥 Users
              </button>
            )}
            <div style={{ textAlign: "right", lineHeight: 1.4 }}>
              <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600 }}>
                {currentUser.name}
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: "#4B5563",
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}
              >
                {ROLES[currentUser.role]}
              </div>
            </div>
            <div
              onClick={doLogout}
              title="Sign out"
              style={{
                width: 30,
                height: 30,
                background: "#1E2130",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                color: "#6B7280",
                border: "1px solid #2A2F40",
                cursor: "pointer",
              }}
            >
              ↪
            </div>
          </div>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* SIDEBAR */}
        <aside
          className="np"
          style={{
            width: W,
            background: C.sidebar,
            flexShrink: 0,
            transition: "width 0.2s",
            overflow: "hidden",
            borderRight: "1px solid #1A1D28",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <nav style={{ flex: 1, padding: "8px", overflowY: "auto" }}>
            {NAV_SECTIONS.map((section) => (
              <div key={section.label} style={{ marginBottom: 4 }}>
                {side ? (
                  <div
                    style={{
                      fontSize: 8.5,
                      fontWeight: 700,
                      color: "#2A2F42",
                      textTransform: "uppercase",
                      letterSpacing: 1.5,
                      padding: "10px 10px 4px",
                    }}
                  >
                    {section.label}
                  </div>
                ) : (
                  <div
                    style={{
                      height: 1,
                      background: "#1A1D28",
                      margin: "6px 4px 4px",
                    }}
                  />
                )}
                {section.ids.map((id) => {
                  const n = NAV.find((x) => x.id === id);
                  if (!n) return null;
                  const a = tab === n.id;
                  return (
                    <button
                      key={n.id}
                      onClick={() => setTab(n.id)}
                      title={NAV_LABELS[n.id]}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 9,
                        padding: side ? "7px 10px" : "8px",
                        borderRadius: 6,
                        border: "none",
                        cursor: "pointer",
                        marginBottom: 1,
                        textAlign: "left",
                        background: a ? "rgba(140,20,20,0.2)" : "transparent",
                        color: a ? C.white : "#5B6378",
                        transition: "all 0.15s",
                        position: "relative",
                        fontFamily: "'DM Sans',sans-serif",
                      }}
                    >
                      {a && (
                        <span
                          style={{
                            position: "absolute",
                            left: 0,
                            top: "15%",
                            height: "70%",
                            width: 3,
                            background: C.red,
                            borderRadius: "0 2px 2px 0",
                          }}
                        />
                      )}
                      <span
                        style={{
                          fontSize: 13,
                          flexShrink: 0,
                          opacity: a ? 1 : 0.45,
                        }}
                      >
                        {n.ico}
                      </span>
                      {side && (
                        <span
                          style={{
                            fontSize: 11.5,
                            fontWeight: a ? 700 : 400,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {NAV_LABELS[n.id]}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
          {side && (
            <div
              style={{ padding: "14px 16px", borderTop: "1px solid #1A1D28" }}
            >
              <div
                style={{
                  fontSize: 9,
                  color: "#2D3347",
                  textTransform: "uppercase",
                  letterSpacing: 1.2,
                  marginBottom: 6,
                  fontWeight: 700,
                }}
              >
                Quick Entry
              </div>
              {[
                ["＋ Add Asset", "asset"],
                ["＋ Maintenance", "maint"],
                ["＋ Fuel Log", "fuel"],
                ["＋ Log Time", "time"],
              ].map(([l, m]) => (
                <button
                  key={m}
                  onClick={() => setModal(m)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "6px 8px",
                    marginBottom: 1,
                    background: "none",
                    border: "none",
                    color: "#4B5563",
                    fontSize: 11,
                    cursor: "pointer",
                    borderRadius: 5,
                    fontFamily: "'DM Sans',sans-serif",
                    fontWeight: 500,
                  }}
                >
                  <span
                    style={{ color: C.red, marginRight: 3, fontWeight: 800 }}
                  ></span>
                  {l}
                </button>
              ))}
            </div>
          )}
        </aside>

        {/* MAIN */}
        <main style={{ flex: 1, overflow: "auto", padding: "26px 28px" }}>
          {/* DASHBOARD */}
          {tab === "Dashboard" && (
            <div>
              {/* ── HEADER ROW ── */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:10 }}>
                <div>
                  <div style={{ fontSize:22, fontWeight:800, color:C.text, letterSpacing:-0.5, fontFamily:"'Barlow Condensed',sans-serif", lineHeight:1.1 }}>
                    OPERATIONAL DASHBOARD
                    <span style={{ fontSize:13, fontWeight:400, color:C.muted, marginLeft:14, fontFamily:"'DM Sans',sans-serif", letterSpacing:0 }}>
                      Real-time overview · {company.name||"Mapitsi Civil Works"} · {new Date().toLocaleDateString("en-ZA",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
                    </span>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  {allAlerts.filter(a=>a.severity==="critical").length>0&&(
                    <button onClick={()=>setTab("Alerts")} style={{ background:C.red, color:"white", borderRadius:7, padding:"7px 14px", fontSize:12, fontWeight:700, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                      ⚑ {allAlerts.filter(a=>a.severity==="critical").length} Critical Alert{allAlerts.filter(a=>a.severity==="critical").length>1?"s":""}
                    </button>
                  )}
                  <Btn variant="outline" size="sm" onClick={()=>setTab("FleetMap")}>◉ Fleet Map</Btn>
                  <Btn variant="ghost" size="sm" onClick={()=>setTab("Alerts")}>🔔 All Alerts</Btn>
                </div>
              </div>

              {/* ── KPI ROW ── */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))", gap:12, marginBottom:20 }}>
                {[
                  { label:"Total Assets",     value:assets.length,                                                   sub:`${assets.filter(a=>a.status==="Active").length} active`,       color:C.info,    icon:"▤" },
                  { label:"Original Cost",    value:fmt(totalCost),                                                  sub:"Total acquisition value",                                       color:C.muted,   icon:"₽" },
                  { label:"Net Book Value",   value:fmt(totalBook),                                                  sub:"After depreciation",                                            color:C.success, icon:"≋" },
                  { label:"Total Write-Down", value:fmt(totalCost-totalBook),                                        sub:`${totalCost>0?(((totalCost-totalBook)/totalCost)*100).toFixed(1):0}% depreciated`, color:C.warn, icon:"↘" },
                  { label:"Operating Cost",   value:fmt(rMC+rFC),                                                    sub:`${monthLabel(month)} · maint+fuel`,                             color:"#7c3aed", icon:"₽" },
                  { label:"Open Alerts",      value:allAlerts.filter(a=>a.severity==="critical"||a.severity==="warning").length, sub:`${allAlerts.filter(a=>a.severity==="critical").length} critical`, color:allAlerts.filter(a=>a.severity==="critical").length>0?C.red:C.success, icon:"⚑" },
                ].map(k=>(
                  <KPI key={k.label} label={k.label} value={k.value} sub={k.sub} color={k.color} icon={k.icon}/>
                ))}
              </div>

              {/* ── CHARTS ROW 1: Trend + Donut ── */}
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16, marginBottom:16 }}>

                {/* COMBINED 6-MONTH COST TREND */}
                <div style={{ background:C.white, borderRadius:10, border:`1px solid ${C.border}`, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div style={{ padding:"14px 20px 10px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:700, color:C.text }}>Operating Cost Trend</div>
                      <div style={{ fontSize:11, color:C.muted }}>Maintenance + Fuel — last 6 months</div>
                    </div>
                    <div style={{ display:"flex", gap:12 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:4 }}><div style={{ width:10,height:10,borderRadius:2,background:"#7c3aed" }}/><span style={{ fontSize:10,color:C.muted }}>Maintenance</span></div>
                      <div style={{ display:"flex", alignItems:"center", gap:4 }}><div style={{ width:10,height:10,borderRadius:2,background:C.warn }}/><span style={{ fontSize:10,color:C.muted }}>Fuel</span></div>
                    </div>
                  </div>
                  <div style={{ padding:"16px 20px 12px" }}>
                    {(()=>{
                      const maxVal = Math.max(...last6.map(m=>{
                        const mc=maint.filter(x=>x.date?.startsWith(m)).reduce((s,x)=>s+Number(x.cost||0),0);
                        const fc=fuel.filter(x=>x.date?.startsWith(m)).reduce((s,x)=>s+Number(x.cost||0),0);
                        return mc+fc;
                      }),1);
                      const chartH = 130;
                      return (
                        <div>
                          <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:chartH, paddingBottom:0 }}>
                            {last6.map(m=>{
                              const mc=maint.filter(x=>x.date?.startsWith(m)).reduce((s,x)=>s+Number(x.cost||0),0);
                              const fc=fuel.filter(x=>x.date?.startsWith(m)).reduce((s,x)=>s+Number(x.cost||0),0);
                              const total=mc+fc;
                              const mH=Math.max(2,Math.round((mc/maxVal)*(chartH-24)));
                              const fH=Math.max(2,Math.round((fc/maxVal)*(chartH-24)));
                              const isCurrent=m===month;
                              return (
                                <div key={m} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                                  <div style={{ fontSize:9, color:isCurrent?C.text:C.muted, fontWeight:isCurrent?700:400, marginBottom:2 }}>
                                    {total>0?(total>=1000?`R${(total/1000).toFixed(0)}k`:`R${Math.round(total)}`):""}
                                  </div>
                                  <div style={{ width:"100%", display:"flex", flexDirection:"column", justifyContent:"flex-end", height:chartH-24 }}>
                                    {fc>0&&<div style={{ width:"100%", height:fH, background:isCurrent?C.warn:"#FCD34D", borderRadius:"2px 2px 0 0", opacity:isCurrent?1:0.7 }}/>}
                                    {mc>0&&<div style={{ width:"100%", height:mH, background:isCurrent?"#7c3aed":"#A78BFA", borderRadius:fc>0?"0":"2px 2px 0 0", opacity:isCurrent?1:0.7 }}/>}
                                    {total===0&&<div style={{ width:"100%", height:3, background:C.border, borderRadius:2 }}/>}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div style={{ display:"flex", gap:6, marginTop:6 }}>
                            {last6.map(m=>(
                              <div key={m} style={{ flex:1, fontSize:9, color:m===month?C.red:C.muted, textAlign:"center", fontWeight:m===month?700:400 }}>
                                {shortMonth(m)}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* FLEET STATUS DONUT */}
                <div style={{ background:C.white, borderRadius:10, border:`1px solid ${C.border}`, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div style={{ padding:"14px 20px 10px", borderBottom:`1px solid ${C.border}` }}>
                    <div style={{ fontSize:13, fontWeight:700, color:C.text }}>Fleet Status</div>
                    <div style={{ fontSize:11, color:C.muted }}>Asset distribution</div>
                  </div>
                  <div style={{ padding:"16px 20px" }}>
                    {(()=>{
                      const groups=[
                        { label:"Active",         count:assets.filter(a=>a.status==="Active").length,           color:C.success },
                        { label:"Maintenance",    count:assets.filter(a=>a.status==="Under Maintenance").length, color:C.warn },
                        { label:"Inactive",       count:assets.filter(a=>a.status==="Inactive").length,          color:C.muted },
                        { label:"Disposed",       count:assets.filter(a=>a.status==="Disposed").length,          color:"#D1D5DB" },
                      ].filter(g=>g.count>0);
                      const total=groups.reduce((s,g)=>s+g.count,0)||1;
                      // SVG donut
                      let cumPct=0;
                      const r=42, cx=60, cy=54, stroke=14;
                      const circumference=2*Math.PI*r;
                      const slices=groups.map(g=>{
                        const pct=g.count/total;
                        const offset=circumference*(1-cumPct);
                        const dash=circumference*pct;
                        cumPct+=pct;
                        return {...g,pct,offset,dash};
                      });
                      return (
                        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                          <svg width={120} height={108} style={{ flexShrink:0 }}>
                            <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth={stroke}/>
                            {slices.map((s,i)=>(
                              <circle key={i} cx={cx} cy={cy} r={r} fill="none"
                                stroke={s.color} strokeWidth={stroke}
                                strokeDasharray={`${s.dash} ${circumference-s.dash}`}
                                strokeDashoffset={s.offset}
                                style={{ transition:"all 0.5s", transform:"rotate(-90deg)", transformOrigin:`${cx}px ${cy}px` }}
                              />
                            ))}
                            <text x={cx} y={cy-6} textAnchor="middle" style={{ fontSize:18, fontWeight:800, fill:C.text, fontFamily:"'Barlow Condensed',sans-serif" }}>{total}</text>
                            <text x={cx} y={cy+10} textAnchor="middle" style={{ fontSize:9, fill:C.muted }}>ASSETS</text>
                          </svg>
                          <div style={{ flex:1, display:"flex", flexDirection:"column", gap:7 }}>
                            {slices.map(s=>(
                              <div key={s.label} style={{ display:"flex", alignItems:"center", gap:6 }}>
                                <div style={{ width:8, height:8, borderRadius:"50%", background:s.color, flexShrink:0 }}/>
                                <span style={{ fontSize:11, color:C.muted, flex:1 }}>{s.label}</span>
                                <span style={{ fontSize:12, fontWeight:700, color:C.text }}>{s.count}</span>
                                <span style={{ fontSize:10, color:C.mutedLt }}>{(s.pct*100).toFixed(0)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* ── CHARTS ROW 2: Fuel trend + Depreciation health + Labour ── */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:16 }}>

                {/* FUEL L/COST BY MONTH */}
                <div style={{ background:C.white, borderRadius:10, border:`1px solid ${C.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div style={{ padding:"14px 18px 10px", borderBottom:`1px solid ${C.border}` }}>
                    <div style={{ fontSize:13, fontWeight:700, color:C.text }}>Fuel Consumption</div>
                    <div style={{ fontSize:11, color:C.muted }}>Litres — last 6 months</div>
                  </div>
                  <div style={{ padding:"14px 18px 12px" }}>
                    {(()=>{
                      const data=last6.map(m=>({ label:shortMonth(m), litres:fuel.filter(f=>f.date?.startsWith(m)).reduce((s,f)=>s+Number(f.litres||0),0), cost:fuel.filter(f=>f.date?.startsWith(m)).reduce((s,f)=>s+Number(f.cost||0),0), isCurrentMonth:m===month }));
                      const maxL=Math.max(...data.map(d=>d.litres),1);
                      const h=80;
                      return (
                        <div>
                          <div style={{ display:"flex", alignItems:"flex-end", gap:5, height:h }}>
                            {data.map((d,i)=>{
                              const barH=Math.max(3,Math.round((d.litres/maxL)*(h-18)));
                              return (
                                <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center" }}>
                                  <div style={{ fontSize:8, color:d.isCurrentMonth?C.text:C.muted, marginBottom:2 }}>{d.litres>0?`${Math.round(d.litres)}L`:""}</div>
                                  <div style={{ width:"100%", height:h-18, display:"flex", alignItems:"flex-end" }}>
                                    <div style={{ width:"100%", height:barH, background:d.isCurrentMonth?C.warn:"#FCD34D", borderRadius:"3px 3px 0 0", opacity:d.isCurrentMonth?1:0.65 }}/>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div style={{ display:"flex", gap:5, marginTop:5 }}>
                            {data.map((d,i)=><div key={i} style={{ flex:1, fontSize:8.5, color:d.isCurrentMonth?C.red:C.muted, textAlign:"center", fontWeight:d.isCurrentMonth?700:400 }}>{d.label}</div>)}
                          </div>
                          <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between" }}>
                            <div><div style={{ fontSize:9, color:C.muted, textTransform:"uppercase", letterSpacing:0.5 }}>This Month</div><div style={{ fontSize:14, fontWeight:800, color:C.warn, fontFamily:"'Barlow Condensed',sans-serif" }}>{rF.reduce((s,f)=>s+Number(f.litres||0),0).toFixed(0)} L</div></div>
                            <div style={{ textAlign:"right" }}><div style={{ fontSize:9, color:C.muted, textTransform:"uppercase", letterSpacing:0.5 }}>Cost</div><div style={{ fontSize:14, fontWeight:800, color:C.warn, fontFamily:"'Barlow Condensed',sans-serif" }}>{fmt(rFC)}</div></div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* DEPRECIATION HEALTH BARS */}
                <div style={{ background:C.white, borderRadius:10, border:`1px solid ${C.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div style={{ padding:"14px 18px 10px", borderBottom:`1px solid ${C.border}` }}>
                    <div style={{ fontSize:13, fontWeight:700, color:C.text }}>Depreciation Health</div>
                    <div style={{ fontSize:11, color:C.muted }}>Per asset — % written off</div>
                  </div>
                  <div style={{ padding:"12px 18px" }}>
                    {assets.length===0?(
                      <div style={{ fontSize:12, color:C.mutedLt, textAlign:"center", padding:"20px 0" }}>No assets</div>
                    ):(
                      [...assets].slice(0,6).map((a,i)=>{
                        const d=depreciate(a);
                        const pct=Number(a.purchaseCost)>0?(d.accumulated/Number(a.purchaseCost))*100:0;
                        const barColor=pct>=100?C.red:pct>75?"#F97316":pct>50?C.warn:C.success;
                        return (
                          <div key={a.id} style={{ marginBottom:i<assets.slice(0,6).length-1?9:0 }}>
                            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                              <span style={{ fontSize:10, color:C.text, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:120 }}>{a.name}</span>
                              <span style={{ fontSize:10, fontWeight:700, color:barColor, flexShrink:0, marginLeft:4 }}>{pct.toFixed(0)}%</span>
                            </div>
                            <div style={{ height:6, background:C.border, borderRadius:3 }}>
                              <div style={{ height:"100%", width:`${Math.min(100,pct)}%`, background:barColor, borderRadius:3, transition:"width 0.5s" }}/>
                            </div>
                          </div>
                        );
                      })
                    )}
                    {assets.length>6&&<div style={{ fontSize:10, color:C.mutedLt, marginTop:8, textAlign:"center" }}>+{assets.length-6} more · <span onClick={()=>setTab("Depreciation")} style={{ color:C.info, cursor:"pointer" }}>View all</span></div>}
                  </div>
                </div>

                {/* LABOUR HOURS TREND */}
                <div style={{ background:C.white, borderRadius:10, border:`1px solid ${C.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div style={{ padding:"14px 18px 10px", borderBottom:`1px solid ${C.border}` }}>
                    <div style={{ fontSize:13, fontWeight:700, color:C.text }}>Labour Hours</div>
                    <div style={{ fontSize:11, color:C.muted }}>Hours worked — last 6 months</div>
                  </div>
                  <div style={{ padding:"14px 18px 12px" }}>
                    {(()=>{
                      const data=last6.map(m=>({ label:shortMonth(m), hours:ts.filter(t=>t.date?.startsWith(m)).reduce((s,t)=>s+Number(t.hours||0),0), isCurrent:m===month }));
                      const maxH2=Math.max(...data.map(d=>d.hours),1);
                      const h=80;
                      return (
                        <div>
                          <div style={{ display:"flex", alignItems:"flex-end", gap:5, height:h }}>
                            {data.map((d,i)=>{
                              const barH=Math.max(3,Math.round((d.hours/maxH2)*(h-18)));
                              return (
                                <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center" }}>
                                  <div style={{ fontSize:8, color:d.isCurrent?C.text:C.muted, marginBottom:2 }}>{d.hours>0?`${d.hours.toFixed(0)}h`:""}</div>
                                  <div style={{ width:"100%", height:h-18, display:"flex", alignItems:"flex-end" }}>
                                    <div style={{ width:"100%", height:barH, background:d.isCurrent?C.red:"#FCA5A5", borderRadius:"3px 3px 0 0", opacity:d.isCurrent?1:0.65 }}/>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div style={{ display:"flex", gap:5, marginTop:5 }}>
                            {data.map((d,i)=><div key={i} style={{ flex:1, fontSize:8.5, color:d.isCurrent?C.red:C.muted, textAlign:"center", fontWeight:d.isCurrent?700:400 }}>{d.label}</div>)}
                          </div>
                          <div style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between" }}>
                            <div><div style={{ fontSize:9, color:C.muted, textTransform:"uppercase", letterSpacing:0.5 }}>This Month</div><div style={{ fontSize:14, fontWeight:800, color:C.red, fontFamily:"'Barlow Condensed',sans-serif" }}>{rH.toFixed(1)} hrs</div></div>
                            <div style={{ textAlign:"right" }}><div style={{ fontSize:9, color:C.muted, textTransform:"uppercase", letterSpacing:0.5 }}>Employees</div><div style={{ fontSize:14, fontWeight:800, color:C.red, fontFamily:"'Barlow Condensed',sans-serif" }}>{new Set(ts.map(t=>t.employeeName)).size}</div></div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* ── ROW 3: Recent assets + Maintenance alerts + Alerts ── */}
              <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:16, marginBottom:16 }}>
                <Card title="Recent Assets" sub={`${assets.length} asset${assets.length!==1?"s":""} on register`}
                  action={<Btn onClick={()=>setTab("Assets")} variant="ghost" size="sm">View All →</Btn>}>
                  {assets.length===0?(
                    <div style={{ padding:"28px 20px", textAlign:"center", color:C.muted, fontSize:13 }}>No assets registered yet.</div>
                  ):(
                    <Tbl cols={["Asset","Category","Status","Book Value","Location"]}>
                      {[...assets].reverse().slice(0,5).map((a,i)=>{
                        const d=depreciate(a);
                        return (
                          <TR key={a.id} stripe={i%2!==0} cells={[
                            <span style={{ fontWeight:700,color:C.text }}>{a.name}</span>,
                            <span style={{ color:C.muted,fontSize:12 }}>{a.category}</span>,
                            <Pill text={a.status} color={a.status==="Active"?"green":a.status==="Under Maintenance"?"yellow":"gray"}/>,
                            <span style={{ fontWeight:700,fontFamily:"'Barlow Condensed',sans-serif",fontSize:15 }}>{fmt(d.bookValue)}</span>,
                            <span style={{ color:C.muted,fontSize:12 }}>{a.location}</span>,
                          ]}/>
                        );
                      })}
                    </Tbl>
                  )}
                </Card>

                <Card title="Maintenance Alerts" sub="Scheduled & overdue">
                  <div style={{ padding:"8px 16px" }}>
                    {maint.filter(m=>m.nextDueDate).length===0?(
                      <div style={{ padding:"24px 0", textAlign:"center", color:C.muted, fontSize:12 }}>No scheduled maintenance.</div>
                    ):(
                      [...maint].filter(m=>m.nextDueDate).sort((a,b)=>a.nextDueDate>b.nextDueDate?1:-1).slice(0,6).map(m=>{
                        const asset=assets.find(a=>a.id===m.assetId);
                        const od=m.nextDueDate<today();
                        const days=Math.round((new Date(m.nextDueDate)-new Date())/(1000*60*60*24));
                        return (
                          <div key={m.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:`1px solid ${C.surface}` }}>
                            <div>
                              <div style={{ fontWeight:700, fontSize:12, color:C.text }}>{asset?.name||"—"}</div>
                              <div style={{ fontSize:11, color:C.muted }}>{m.type}</div>
                            </div>
                            <Pill text={od?`Overdue ${Math.abs(days)}d`:days===0?"Today":`${days}d`} color={od?"red":days<=5?"yellow":"green"}/>
                          </div>
                        );
                      })
                    )}
                  </div>
                </Card>
              </div>

              {/* ── ALERTS BANNER ── */}
              {allAlerts.filter(a=>a.severity==="critical"||a.severity==="warning").length>0&&(
                <div style={{ background:C.redLight, border:`1px solid ${C.redBorder}`, borderRadius:10, padding:"14px 18px", marginBottom:16 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:C.red, textTransform:"uppercase", letterSpacing:1 }}>
                      ⚠ {allAlerts.filter(a=>a.severity==="critical").length} Critical · {allAlerts.filter(a=>a.severity==="warning").length} Warnings
                    </div>
                    <button onClick={()=>setTab("Alerts")} style={{ background:"none", border:`1px solid ${C.red}`, borderRadius:5, padding:"3px 10px", fontSize:11, color:C.red, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>View All →</button>
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {[...new Map(allAlerts.filter(a=>a.severity==="critical"||a.severity==="warning").map(a=>[a.tab+a.module,a])).values()].slice(0,8).map(a=>(
                      <AlertChip key={a.id} label={a.title} onClick={()=>setTab(a.tab)}/>
                    ))}
                  </div>
                </div>
              )}

              {/* ── QUICK STATS MINI TILES ── */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:10 }}>
                {[
                  { l:"Fuel Records",    v:fuel.length,                                                           s:`${fuel.reduce((s,f)=>s+Number(f.litres||0),0).toFixed(0)} L total`,  c:C.warn,    ico:"⛽", t:"Fuel" },
                  { l:"Maintenance",     v:maint.length,                                                          s:fmt(maint.reduce((s,m)=>s+Number(m.cost||0),0)),                        c:"#7c3aed", ico:"⊙", t:"Maintenance" },
                  { l:"Active Projects", v:projects.filter(p=>p.status==="Active").length,                        s:`of ${projects.length} total`,                                          c:C.info,    ico:"⊕", t:"Projects" },
                  { l:"Employees",       v:employees.filter(e=>e.status==="Active").length,                       s:"active on register",                                                   c:C.success, ico:"⊞", t:"Employees" },
                  { l:"Job Cards Open",  v:jobCards.filter(j=>!["Complete","Cancelled","Invoiced"].includes(j.status)).length, s:`${jobCards.filter(j=>j.priority==="Critical"&&!["Complete","Cancelled"].includes(j.status)).length} critical`, c:jobCards.filter(j=>j.priority==="Critical"&&!["Complete","Cancelled"].includes(j.status)).length>0?C.red:C.muted, ico:"🔧", t:"JobCards" },
                  { l:"Parts Out",       v:spares.filter(s=>Number(s.quantity||0)===0).length,                    s:`${spares.filter(s=>Number(s.quantity||0)<=Number(s.minStockLevel||0)&&Number(s.minStockLevel||0)>0).length} low stock`, c:spares.filter(s=>Number(s.quantity||0)===0).length>0?C.red:C.success, ico:"⊟", t:"Spares" },
                  { l:"Open Incidents",  v:incidents.filter(i=>i.resolved==="No").length,                         s:"unresolved",                                                           c:incidents.filter(i=>i.resolved==="No").length>0?C.red:C.success, ico:"⚠", t:"Incidents" },
                  { l:"Compliance",      v:compliance.filter(c=>c.expiryDate&&c.expiryDate<today()).length,        s:"expired documents",                                                    c:compliance.filter(c=>c.expiryDate&&c.expiryDate<today()).length>0?C.red:C.success, ico:"⊛", t:"Compliance" },
                  { l:"Purchase Orders", v:purchaseOrders.filter(p=>!["Fully Received","Cancelled"].includes(p.status)).length, s:"open / pending", c:C.muted, ico:"📦", t:"PurchaseOrders" },
                ].map(s=>(
                  <div key={s.l} onClick={()=>setTab(s.t)} style={{ background:C.white, borderRadius:8, padding:"11px 14px", border:`1px solid ${C.border}`, cursor:"pointer", position:"relative", overflow:"hidden", transition:"box-shadow 0.15s" }}
                    onMouseEnter={e=>e.currentTarget.style.boxShadow="0 4px 12px rgba(0,0,0,0.1)"}
                    onMouseLeave={e=>e.currentTarget.style.boxShadow=""}>
                    <div style={{ position:"absolute", top:0, left:0, width:3, height:"100%", background:s.c }}/>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <div>
                        <div style={{ fontSize:9.5, color:C.muted, fontWeight:600, textTransform:"uppercase", letterSpacing:0.6, marginBottom:3 }}>{s.l}</div>
                        <div style={{ fontSize:18, fontWeight:700, color:C.text, fontFamily:"'Barlow Condensed',sans-serif" }}>{s.v}</div>
                        <div style={{ fontSize:10, color:C.mutedLt, marginTop:2 }}>{s.s}</div>
                      </div>
                      <div style={{ fontSize:16, opacity:0.1 }}>{s.ico}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ASSETS */}
          {tab === "Assets" && (
            <div>
              <PageTitle
                title="ASSET REGISTER"
                sub={`${assets.length} asset${
                  assets.length !== 1 ? "s" : ""
                } registered`}
                action={
                  <Btn onClick={() => setModal("asset")}>＋ Register Asset</Btn>
                }
              />
              {assets.length === 0 ? (
                <Empty
                  icon="🚛"
                  title="Asset register is empty"
                  desc="Register your first asset to begin tracking values, depreciation and maintenance history."
                  btn={
                    <Btn onClick={() => setModal("asset")}>
                      Register First Asset
                    </Btn>
                  }
                />
              ) : (
                <Card>
                  <Tbl
                    cols={[
                      "Asset / Serial",
                      "Category",
                      "Purchase Date",
                      "Purchase Cost",
                      "Depr. Rate",
                      "Acc. Depreciation",
                      "Book Value",
                      "Location",
                      "Status",
                      "Condition",
                      "",
                    ]}
                    foot={
                      <FtRow
                        highlight
                        vals={[
                          `TOTALS — ${assets.length} Assets`,
                          "",
                          "",
                          fmt(totalCost),
                          "",
                          fmt(totalCost - totalBook),
                          fmt(totalBook),
                          "",
                          "",
                          "",
                          "",
                        ]}
                      />
                    }
                  >
                    {assets.map((a, i) => {
                      const d = depreciate(a);
                      return (
                        <TR
                          key={a.id}
                          stripe={i % 2 !== 0}
                          cells={[
                            <div>
                              <div style={{ fontWeight: 700, color: C.text }}>
                                {a.name}
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: C.mutedLt,
                                  fontFamily: "monospace",
                                }}
                              >
                                {a.serialNumber || "—"}
                              </div>
                            </div>,
                            <span style={{ color: C.muted, fontSize: 12 }}>
                              {a.category}
                            </span>,
                            <span style={{ color: C.muted, fontSize: 12 }}>
                              {a.purchaseDate}
                            </span>,
                            <span style={{ fontWeight: 600 }}>
                              {fmt(a.purchaseCost)}
                            </span>,
                            <span style={{ color: C.red, fontWeight: 700 }}>
                              {d.rate.toFixed(1)}%/yr
                            </span>,
                            <span style={{ color: C.warn, fontWeight: 700 }}>
                              {fmt(d.accumulated)}
                            </span>,
                            <span
                              style={{
                                fontWeight: 800,
                                color: d.bookValue > 0 ? C.success : C.muted,
                                fontFamily: "'Barlow Condensed',sans-serif",
                                fontSize: 15,
                              }}
                            >
                              {fmt(d.bookValue)}
                            </span>,
                            <span style={{ color: C.muted, fontSize: 12 }}>
                              {a.location}
                            </span>,
                            <Pill
                              text={a.status}
                              color={
                                a.status === "Active"
                                  ? "green"
                                  : a.status === "Under Maintenance"
                                  ? "yellow"
                                  : "gray"
                              }
                            />,
                            <div>
                              {(() => {
                                const latest = [...conditions]
                                  .filter((c) => c.assetId === a.id)
                                  .sort((x, y) =>
                                    y.assessmentDate > x.assessmentDate ? 1 : -1
                                  )[0];
                                return latest ? (
                                  <Pill
                                    text={latest.rating}
                                    color={
                                      CONDITION_COLORS[latest.rating] || "gray"
                                    }
                                  />
                                ) : (
                                  <span
                                    style={{ color: C.mutedLt, fontSize: 11 }}
                                  >
                                    Not assessed
                                  </span>
                                );
                              })()}
                            </div>,
                            <div
                              style={{
                                display: "flex",
                                gap: 6,
                                flexWrap: "wrap",
                              }}
                            >
                              {can(currentUser, "canEdit") && (
                                <button
                                  onClick={() => setEditAsset(a)}
                                  style={{
                                    color: C.info,
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: 12,
                                    padding: "4px 8px",
                                    borderRadius: 4,
                                    fontFamily: "'DM Sans',sans-serif",
                                    fontWeight: 600,
                                  }}
                                >
                                  Edit
                                </button>
                              )}
                              {can(currentUser, "canAdd") && (
                                <button
                                  onClick={() => {
                                    setAssF({ ...dAss, assetId: a.id });
                                    setModal("assignment");
                                  }}
                                  style={{
                                    color: "#7c3aed",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: 12,
                                    padding: "4px 8px",
                                    borderRadius: 4,
                                    fontFamily: "'DM Sans',sans-serif",
                                    fontWeight: 600,
                                  }}
                                >
                                  Assign
                                </button>
                              )}
                              {can(currentUser, "canAdd") &&
                                !disposals.find((d) => d.assetId === a.id) && (
                                  <button
                                    onClick={() => {
                                      setDisF({ ...dDis, assetId: a.id });
                                      setModal("disposal");
                                    }}
                                    style={{
                                      color: C.warn,
                                      background: "none",
                                      border: "none",
                                      cursor: "pointer",
                                      fontSize: 12,
                                      padding: "4px 8px",
                                      borderRadius: 4,
                                      fontFamily: "'DM Sans',sans-serif",
                                      fontWeight: 600,
                                    }}
                                  >
                                    Dispose
                                  </button>
                                )}
                              {disposals.find((d) => d.assetId === a.id) && (
                                <Pill text="Disposed" color="gray" />
                              )}
                              {can(currentUser, "canDelete") && (
                                <button
                                  onClick={() =>
                                    del("mcw_assets", setAssets, assets, a.id)
                                  }
                                  style={{
                                    color: C.muted,
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: 14,
                                    padding: "2px 6px",
                                    borderRadius: 4,
                                  }}
                                >
                                  ×
                                </button>
                              )}
                            </div>,
                          ]}
                        />
                      );
                    })}
                  </Tbl>
                </Card>
              )}
            </div>
          )}

          {/* DEPRECIATION */}
          {tab === "Depreciation" && (
            <div>
              <PageTitle
                title="DEPRECIATION SCHEDULE"
                sub="Straight-line method — auto-calculated per asset category"
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
                  gap: 14,
                  marginBottom: 22,
                }}
              >
                <KPI
                  label="Total Acquisition Cost"
                  value={fmt(totalCost)}
                  color={C.info}
                  icon="₽"
                />
                <KPI
                  label="Total Depreciated"
                  value={fmt(totalCost - totalBook)}
                  color={C.warn}
                  icon="↘"
                />
                <KPI
                  label="Net Book Value"
                  value={fmt(totalBook)}
                  color={C.success}
                  icon="≋"
                />
                <KPI
                  label="Portfolio Depreciation"
                  value={
                    totalCost > 0
                      ? `${(
                          ((totalCost - totalBook) / totalCost) *
                          100
                        ).toFixed(1)}%`
                      : "—"
                  }
                  color={C.red}
                  icon="⊘"
                />
              </div>
              {assets.length === 0 ? (
                <Empty
                  icon="📊"
                  title="No assets to depreciate"
                  desc="Add assets to the register to view depreciation schedules."
                  btn={
                    <Btn onClick={() => setTab("Assets")}>
                      Go to Asset Register
                    </Btn>
                  }
                />
              ) : (
                <Card
                  title="Asset Depreciation Summary"
                  sub="Values updated in real-time based on acquisition date"
                >
                  <Tbl
                    cols={[
                      "Asset",
                      "Category",
                      "Purchase Cost",
                      "Useful Life",
                      "Rate / Year",
                      "Years Elapsed",
                      "Annual Write-Off",
                      "Acc. Depreciation",
                      "Net Book Value",
                      "Health",
                    ]}
                    foot={
                      <FtRow
                        highlight
                        vals={[
                          "PORTFOLIO TOTAL",
                          "",
                          fmt(totalCost),
                          "",
                          "",
                          "",
                          fmt(totalCost / Math.max(1, assets.length)),
                          fmt(totalCost - totalBook),
                          fmt(totalBook),
                          "",
                        ]}
                      />
                    }
                  >
                    {assets.map((a, i) => {
                      const d = depreciate(a);
                      const pct =
                        Number(a.purchaseCost) > 0
                          ? (d.accumulated / Number(a.purchaseCost)) * 100
                          : 0;
                      return (
                        <TR
                          key={a.id}
                          stripe={i % 2 !== 0}
                          cells={[
                            <span style={{ fontWeight: 700, color: C.text }}>
                              {a.name}
                            </span>,
                            <span style={{ color: C.muted, fontSize: 12 }}>
                              {a.category}
                            </span>,
                            <span style={{ fontWeight: 600 }}>
                              {fmt(a.purchaseCost)}
                            </span>,
                            <span style={{ color: C.muted, fontSize: 12 }}>
                              {USEFUL_LIFE[a.category] || 5} yrs
                            </span>,
                            <span style={{ color: C.red, fontWeight: 700 }}>
                              {d.rate.toFixed(1)}%
                            </span>,
                            <span style={{ color: C.muted, fontSize: 12 }}>
                              {d.years.toFixed(1)} yrs
                            </span>,
                            <span style={{ fontWeight: 600 }}>
                              {fmt(
                                Number(a.purchaseCost) /
                                  (USEFUL_LIFE[a.category] || 5)
                              )}
                            </span>,
                            <div>
                              <div style={{ fontWeight: 700, color: C.warn }}>
                                {fmt(d.accumulated)}
                              </div>
                              <div
                                style={{
                                  height: 3,
                                  background: C.border,
                                  borderRadius: 2,
                                  marginTop: 5,
                                  width: 80,
                                }}
                              >
                                <div
                                  style={{
                                    height: "100%",
                                    background: pct > 75 ? C.red : C.warn,
                                    borderRadius: 2,
                                    width: `${Math.min(100, pct)}%`,
                                    transition: "width 0.4s",
                                  }}
                                />
                              </div>
                            </div>,
                            <span
                              style={{
                                fontWeight: 800,
                                color: d.bookValue > 0 ? C.success : C.muted,
                                fontFamily: "'Barlow Condensed',sans-serif",
                                fontSize: 15,
                              }}
                            >
                              {fmt(d.bookValue)}
                            </span>,
                            <Pill
                              text={
                                d.bookValue <= 0
                                  ? "Fully Depreciated"
                                  : pct > 75
                                  ? "Near End"
                                  : pct > 50
                                  ? "Mid-Life"
                                  : "Good"
                              }
                              color={
                                d.bookValue <= 0
                                  ? "red"
                                  : pct > 75
                                  ? "yellow"
                                  : pct > 50
                                  ? "blue"
                                  : "green"
                              }
                            />,
                          ]}
                        />
                      );
                    })}
                  </Tbl>
                </Card>
              )}
            </div>
          )}

          {/* MAINTENANCE */}
          {tab === "Maintenance" && (
            <div>
              <PageTitle
                title="MAINTENANCE RECORDS"
                sub="Service, repair and inspection history"
                action={
                  can(currentUser, "canAdd") && (
                    <Btn onClick={() => setModal("maint")}>
                      ＋ Log Maintenance
                    </Btn>
                  )
                }
              />
              {maint.length === 0 ? (
                <Empty
                  icon="🔧"
                  title="No maintenance records"
                  desc="Log services, repairs and inspections to track asset history and receive overdue alerts."
                  btn={
                    <Btn onClick={() => setModal("maint")}>
                      Log First Record
                    </Btn>
                  }
                />
              ) : (
                <Card>
                  <Tbl
                    cols={[
                      "Asset",
                      "Date",
                      "Type",
                      "Description",
                      "Cost (R)",
                      "Performed By",
                      "Next Due",
                      "",
                    ]}
                  >
                    {[...maint]
                      .sort((a, b) => (b.date > a.date ? 1 : -1))
                      .map((m, i) => {
                        const asset = assets.find((a) => a.id === m.assetId);
                        const od = m.nextDueDate && m.nextDueDate < today();
                        const days = m.nextDueDate
                          ? Math.round(
                              (new Date(m.nextDueDate) - new Date()) /
                                (1000 * 60 * 60 * 24)
                            )
                          : null;
                        return (
                          <TR
                            key={m.id}
                            stripe={i % 2 !== 0}
                            cells={[
                              <span style={{ fontWeight: 700, color: C.text }}>
                                {asset?.name || "—"}
                              </span>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {m.date}
                              </span>,
                              <Pill text={m.type} color="blue" />,
                              <span
                                style={{
                                  color: C.muted,
                                  fontSize: 12,
                                  display: "block",
                                  maxWidth: 160,
                                }}
                              >
                                {m.description || "—"}
                              </span>,
                              <span style={{ fontWeight: 700 }}>
                                {fmt(m.cost)}
                              </span>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {m.performedBy || "—"}
                              </span>,
                              m.nextDueDate ? (
                                <Pill
                                  text={
                                    od
                                      ? `Overdue ${Math.abs(days)}d`
                                      : days === 0
                                      ? "Today"
                                      : `In ${days}d`
                                  }
                                  color={
                                    od ? "red" : days <= 5 ? "yellow" : "green"
                                  }
                                />
                              ) : (
                                "—"
                              ),
                              <button
                                onClick={() =>
                                  del("mcw_maint", setMaint, maint, m.id)
                                }
                                style={{
                                  color: C.muted,
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: 14,
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                }}
                              >
                                ×
                              </button>,
                            ]}
                          />
                        );
                      })}
                  </Tbl>
                </Card>
              )}
            </div>
          )}

          {/* FUEL */}
          {tab === "Fuel" && (
            <div>
              <PageTitle
                title="FUEL & USAGE LOGS"
                sub="Consumption and operating hours per asset"
                action={
                  can(currentUser, "canAdd") && (
                    <Btn onClick={() => setModal("asset")}>
                      ＋ Register Asset
                    </Btn>
                  )
                }
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))",
                  gap: 14,
                  marginBottom: 22,
                }}
              >
                <KPI
                  label="Total Fuel Spend"
                  value={fmt(fuel.reduce((s, f) => s + Number(f.cost || 0), 0))}
                  color={C.warn}
                  icon="⛽"
                />
                <KPI
                  label="Total Litres"
                  value={`${fuel
                    .reduce((s, f) => s + Number(f.litres || 0), 0)
                    .toFixed(0)} L`}
                  color={C.info}
                  icon="◈"
                />
                <KPI
                  label="Fuel Records"
                  value={fuel.length}
                  color={C.muted}
                  icon="≡"
                />
                <KPI
                  label="Avg Cost per Litre"
                  value={
                    fuel.reduce((s, f) => s + Number(f.litres || 0), 0) > 0
                      ? fmt(
                          fuel.reduce((s, f) => s + Number(f.cost || 0), 0) /
                            fuel.reduce((s, f) => s + Number(f.litres || 0), 0)
                        )
                      : "—"
                  }
                  color={C.red}
                  icon="÷"
                />
              </div>
              {fuel.length === 0 ? (
                <Empty
                  icon="⛽"
                  title="No fuel records"
                  desc="Log fuel fills per asset to track consumption costs and identify inefficiencies."
                  btn={
                    <Btn onClick={() => setModal("fuel")}>Log First Fill</Btn>
                  }
                />
              ) : (
                <Card>
                  <Tbl
                    cols={[
                      "Asset",
                      "Date",
                      "Litres",
                      "Cost (R)",
                      "Cost/L",
                      "Odo / Hours",
                      "Site",
                      "",
                    ]}
                    foot={
                      <FtRow
                        highlight
                        vals={[
                          "TOTAL",
                          "",
                          `${fuel
                            .reduce((s, f) => s + Number(f.litres || 0), 0)
                            .toFixed(0)} L`,
                          fmt(
                            fuel.reduce((s, f) => s + Number(f.cost || 0), 0)
                          ),
                          "",
                          "",
                          "",
                        ]}
                      />
                    }
                  >
                    {[...fuel]
                      .sort((a, b) => (b.date > a.date ? 1 : -1))
                      .map((f, i) => {
                        const asset = assets.find((a) => a.id === f.assetId);
                        const cpl =
                          Number(f.litres) > 0
                            ? Number(f.cost) / Number(f.litres)
                            : 0;
                        return (
                          <TR
                            key={f.id}
                            stripe={i % 2 !== 0}
                            cells={[
                              <span style={{ fontWeight: 700, color: C.text }}>
                                {asset?.name || "—"}
                              </span>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {f.date}
                              </span>,
                              <span style={{ fontWeight: 700, color: C.info }}>
                                {f.litres} L
                              </span>,
                              <span style={{ fontWeight: 700 }}>
                                {fmt(f.cost)}
                              </span>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {cpl > 0 ? `R ${cpl.toFixed(2)}` : "—"}
                              </span>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {f.odometer || "—"}
                              </span>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {f.site}
                              </span>,
                              <button
                                onClick={() =>
                                  del("mcw_fuel", setFuel, fuel, f.id)
                                }
                                style={{
                                  color: C.muted,
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: 14,
                                  padding: "2px 6px",
                                  borderRadius: 4,
                                }}
                              >
                                ×
                              </button>,
                            ]}
                          />
                        );
                      })}
                  </Tbl>
                </Card>
              )}
            </div>
          )}

          {/* TIMESHEETS */}
          {tab === "Timesheets" && (
            <div>
              <PageTitle
                title="TIMESHEET MANAGEMENT"
                sub="Daily labour hours by employee, site and role"
                action={
                  can(currentUser, "canAdd") && (
                    <Btn onClick={() => setModal("time")}>＋ Log Hours</Btn>
                  )
                }
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))",
                  gap: 14,
                  marginBottom: 22,
                }}
              >
                <KPI
                  label="Total Hours Logged"
                  value={`${ts
                    .reduce((s, t) => s + Number(t.hours || 0), 0)
                    .toFixed(1)} hrs`}
                  color={C.red}
                  icon="◷"
                />
                <KPI
                  label="Unique Employees"
                  value={new Set(ts.map((t) => t.employeeName)).size}
                  color={C.info}
                  icon="⊞"
                />
                <KPI
                  label="Total Records"
                  value={ts.length}
                  color={C.muted}
                  icon="≡"
                />
                <KPI
                  label="Avg Hours / Entry"
                  value={
                    ts.length > 0
                      ? `${(
                          ts.reduce((s, t) => s + Number(t.hours || 0), 0) /
                          ts.length
                        ).toFixed(1)} hrs`
                      : "—"
                  }
                  color={C.success}
                  icon="÷"
                />
              </div>
              {ts.length === 0 ? (
                <Empty
                  icon="⏱"
                  title="No timesheet records"
                  desc="Track daily hours per employee across all sites and tasks."
                  btn={
                    <Btn onClick={() => setModal("time")}>Log First Entry</Btn>
                  }
                />
              ) : (
                <Card>
                  <Tbl
                    cols={[
                      "Employee",
                      "Date",
                      "Hours",
                      "Site",
                      "Task / Role",
                      "Notes",
                      "",
                    ]}
                    foot={
                      <FtRow
                        highlight
                        vals={[
                          "TOTAL",
                          "",
                          `${ts
                            .reduce((s, t) => s + Number(t.hours || 0), 0)
                            .toFixed(1)} hrs`,
                          "",
                          "",
                          "",
                          "",
                        ]}
                      />
                    }
                  >
                    {[...ts]
                      .sort((a, b) => (b.date > a.date ? 1 : -1))
                      .map((t, i) => (
                        <TR
                          key={t.id}
                          stripe={i % 2 !== 0}
                          cells={[
                            <span style={{ fontWeight: 700, color: C.text }}>
                              {t.employeeName}
                            </span>,
                            <span style={{ color: C.muted, fontSize: 12 }}>
                              {t.date}
                            </span>,
                            <span
                              style={{
                                fontWeight: 800,
                                color: C.red,
                                fontFamily: "'Barlow Condensed',sans-serif",
                                fontSize: 16,
                              }}
                            >
                              {t.hours}
                              <span
                                style={{
                                  fontSize: 10,
                                  fontWeight: 500,
                                  color: C.muted,
                                  marginLeft: 2,
                                }}
                              >
                                hrs
                              </span>
                            </span>,
                            <span style={{ color: C.muted, fontSize: 12 }}>
                              {t.site}
                            </span>,
                            <span style={{ fontSize: 12 }}>
                              {t.task || "—"}
                            </span>,
                            <span style={{ color: C.mutedLt, fontSize: 12 }}>
                              {t.notes || "—"}
                            </span>,
                            <button
                              onClick={() => del("mcw_ts", setTs, ts, t.id)}
                              style={{
                                color: C.muted,
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontSize: 14,
                                padding: "2px 6px",
                                borderRadius: 4,
                              }}
                            >
                              ×
                            </button>,
                          ]}
                        />
                      ))}
                  </Tbl>
                </Card>
              )}
            </div>
          )}
          {/* CONDITIONS */}
          {tab === "Conditions" && (
            <div>
              <PageTitle
                title="ASSET CONDITION RATINGS"
                sub="Formal condition assessments for all registered assets"
                action={
                  can(currentUser, "canAdd") && (
                    <Btn onClick={() => setModal("condition")}>
                      ＋ Log Assessment
                    </Btn>
                  )
                }
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))",
                  gap: 14,
                  marginBottom: 22,
                }}
              >
                <KPI
                  label="Assessments Logged"
                  value={conditions.length}
                  color={C.info}
                  icon="⊜"
                />
                <KPI
                  label="Poor Condition"
                  value={conditions.filter((c) => c.rating === "Poor").length}
                  color={C.red}
                  icon="⚑"
                />
                <KPI
                  label="Write-Off Recommended"
                  value={
                    conditions.filter(
                      (c) => c.rating === "Write-Off Recommended"
                    ).length
                  }
                  color={C.red}
                  icon="⚐"
                />
                <KPI
                  label="Assets Not Assessed"
                  value={
                    assets.filter(
                      (a) => !conditions.find((c) => c.assetId === a.id)
                    ).length
                  }
                  color={C.warn}
                  icon="?"
                />
              </div>
              {conditions.length === 0 ? (
                <Empty
                  icon="⊜"
                  title="No condition assessments"
                  desc="Log formal condition ratings for all assets to protect against legal liability and inform replacement decisions."
                  btn={
                    <Btn onClick={() => setModal("condition")}>
                      Log First Assessment
                    </Btn>
                  }
                />
              ) : (
                <Card>
                  <Tbl
                    cols={[
                      "Asset",
                      "Rating",
                      "Assessed By",
                      "Assessment Date",
                      "Action Required",
                      "Notes",
                      "",
                    ]}
                  >
                    {[...conditions]
                      .sort((a, b) =>
                        b.assessmentDate > a.assessmentDate ? 1 : -1
                      )
                      .map((c, i) => (
                        <TR
                          key={c.id}
                          stripe={i % 2 !== 0}
                          cells={[
                            <span style={{ fontWeight: 700, color: C.text }}>
                              {assets.find((a) => a.id === c.assetId)?.name ||
                                "—"}
                            </span>,
                            <Pill
                              text={c.rating}
                              color={CONDITION_COLORS[c.rating] || "gray"}
                            />,
                            <span style={{ color: C.muted, fontSize: 12 }}>
                              {c.assessedBy || "—"}
                            </span>,
                            <span style={{ color: C.muted, fontSize: 12 }}>
                              {c.assessmentDate}
                            </span>,
                            <span
                              style={{
                                color: c.actionRequired ? C.red : C.mutedLt,
                                fontSize: 12,
                                fontWeight: c.actionRequired ? 600 : 400,
                              }}
                            >
                              {c.actionRequired || "None"}
                            </span>,
                            <span style={{ color: C.mutedLt, fontSize: 12 }}>
                              {c.notes || "—"}
                            </span>,
                            <button
                              onClick={() =>
                                del(
                                  "mcw_conditions",
                                  setConditions,
                                  conditions,
                                  c.id
                                )
                              }
                              style={{
                                color: C.muted,
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontSize: 14,
                                padding: "2px 6px",
                              }}
                            >
                              ×
                            </button>,
                          ]}
                        />
                      ))}
                  </Tbl>
                </Card>
              )}
              {assets.filter((a) => !conditions.find((c) => c.assetId === a.id))
                .length > 0 && (
                <div
                  style={{
                    marginTop: 16,
                    background: C.warnBg,
                    border: `1px solid #FDE68A`,
                    borderRadius: 10,
                    padding: "14px 18px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: C.warn,
                      marginBottom: 8,
                    }}
                  >
                    ⚠ Assets Without a Condition Assessment
                  </div>
                  {assets
                    .filter((a) => !conditions.find((c) => c.assetId === a.id))
                    .map((a) => (
                      <div
                        key={a.id}
                        style={{
                          fontSize: 12,
                          color: C.text,
                          padding: "4px 0",
                          borderBottom: `1px solid #FDE68A`,
                        }}
                      >
                        {a.name}{" "}
                        <span style={{ color: C.muted }}>· {a.category}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* INCIDENTS */}
          {tab === "Incidents" && (
            <div>
              <PageTitle
                title="INCIDENT & BREAKDOWN LOG"
                sub="Record breakdowns, accidents and equipment failures"
                action={
                  can(currentUser, "canAdd") && (
                    <Btn onClick={() => setModal("incident")}>
                      ＋ Log Incident
                    </Btn>
                  )
                }
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))",
                  gap: 14,
                  marginBottom: 22,
                }}
              >
                <KPI
                  label="Total Incidents"
                  value={incidents.length}
                  color={C.info}
                  icon="⚠"
                />
                <KPI
                  label="Open / Unresolved"
                  value={incidents.filter((i) => i.resolved === "No").length}
                  color={
                    incidents.filter((i) => i.resolved === "No").length > 0
                      ? C.red
                      : C.success
                  }
                  icon="⚑"
                />
                <KPI
                  label="Total Downtime"
                  value={`${incidents
                    .reduce((s, i) => s + Number(i.downtimeHours || 0), 0)
                    .toFixed(1)} hrs`}
                  color={C.warn}
                  icon="◷"
                />
                <KPI
                  label="Total Repair Cost"
                  value={fmt(
                    incidents.reduce((s, i) => s + Number(i.repairCost || 0), 0)
                  )}
                  color={C.red}
                  icon="₽"
                />
              </div>
              {incidents.length === 0 ? (
                <Empty
                  icon="⚠"
                  title="No incidents logged"
                  desc="Record breakdowns, accidents and equipment failures to track downtime costs and identify problem assets."
                  btn={
                    <Btn onClick={() => setModal("incident")}>
                      Log First Incident
                    </Btn>
                  }
                />
              ) : (
                <Card>
                  <Tbl
                    cols={[
                      "Asset",
                      "Date",
                      "Type",
                      "Description",
                      "Operator",
                      "Downtime",
                      "Repair Cost",
                      "Reported By",
                      "Status",
                      "",
                    ]}
                  >
                    {[...incidents]
                      .sort((a, b) => (b.date > a.date ? 1 : -1))
                      .map((inc, i) => (
                        <TR
                          key={inc.id}
                          stripe={i % 2 !== 0}
                          cells={[
                            <span style={{ fontWeight: 700, color: C.text }}>
                              {assets.find((a) => a.id === inc.assetId)?.name ||
                                "—"}
                            </span>,
                            <span style={{ color: C.muted, fontSize: 12 }}>
                              {inc.date}
                            </span>,
                            <Pill text={inc.type} color="blue" />,
                            <span
                              style={{
                                color: C.muted,
                                fontSize: 12,
                                display: "block",
                                maxWidth: 160,
                              }}
                            >
                              {inc.description || "—"}
                            </span>,
                            <span style={{ color: C.muted, fontSize: 12 }}>
                              {inc.operatorName || "—"}
                            </span>,
                            <span style={{ fontWeight: 600, color: C.warn }}>
                              {inc.downtimeHours
                                ? `${inc.downtimeHours} hrs`
                                : "—"}
                            </span>,
                            <span style={{ fontWeight: 700 }}>
                              {inc.repairCost ? fmt(inc.repairCost) : "—"}
                            </span>,
                            <span style={{ color: C.muted, fontSize: 12 }}>
                              {inc.reportedBy || "—"}
                            </span>,
                            <Pill
                              text={
                                inc.resolved === "Yes" ? "Resolved" : "Open"
                              }
                              color={inc.resolved === "Yes" ? "green" : "red"}
                            />,
                            <button
                              onClick={() =>
                                del(
                                  "mcw_incidents",
                                  setIncidents,
                                  incidents,
                                  inc.id
                                )
                              }
                              style={{
                                color: C.muted,
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontSize: 14,
                                padding: "2px 6px",
                              }}
                            >
                              ×
                            </button>,
                          ]}
                        />
                      ))}
                  </Tbl>
                </Card>
              )}
            </div>
          )}

          {/* SUPPLIERS */}
          {tab === "Suppliers" && (
            <div>
              <PageTitle
                title="SUPPLIER & VENDOR REGISTER"
                sub="Verified suppliers for maintenance, fuel, parts and services"
                action={
                  can(currentUser, "canAdd") && (
                    <Btn onClick={() => setModal("supplier")}>
                      ＋ Add Supplier
                    </Btn>
                  )
                }
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))",
                  gap: 14,
                  marginBottom: 22,
                }}
              >
                <KPI
                  label="Total Suppliers"
                  value={suppliers.length}
                  color={C.info}
                  icon="⊡"
                />
                <KPI
                  label="Service & Repairs"
                  value={
                    suppliers.filter((s) => s.type === "Service & Repairs")
                      .length
                  }
                  color={C.muted}
                  icon="🔧"
                />
                <KPI
                  label="Fuel Suppliers"
                  value={
                    suppliers.filter((s) => s.type === "Fuel Supplier").length
                  }
                  color={C.warn}
                  icon="⛽"
                />
                <KPI
                  label="Parts & Spares"
                  value={
                    suppliers.filter((s) => s.type === "Parts & Spares").length
                  }
                  color={C.success}
                  icon="⊟"
                />
              </div>
              {suppliers.length === 0 ? (
                <Empty
                  icon="⊡"
                  title="No suppliers registered"
                  desc="Build a verified vendor register to support audits, procurement approvals and dispute resolution."
                  btn={
                    <Btn onClick={() => setModal("supplier")}>
                      Add First Supplier
                    </Btn>
                  }
                />
              ) : (
                <Card>
                  <Tbl
                    cols={[
                      "Supplier Name",
                      "Type",
                      "Contact Person",
                      "Phone",
                      "Email",
                      "Address",
                      "Notes",
                      "",
                    ]}
                  >
                    {suppliers.map((s, i) => (
                      <TR
                        key={s.id}
                        stripe={i % 2 !== 0}
                        cells={[
                          <span style={{ fontWeight: 700, color: C.text }}>
                            {s.name}
                          </span>,
                          <Pill text={s.type} color="blue" />,
                          <span style={{ color: C.muted, fontSize: 12 }}>
                            {s.contactPerson || "—"}
                          </span>,
                          <span style={{ color: C.muted, fontSize: 12 }}>
                            {s.phone || "—"}
                          </span>,
                          <span style={{ color: C.info, fontSize: 12 }}>
                            {s.email || "—"}
                          </span>,
                          <span style={{ color: C.muted, fontSize: 12 }}>
                            {s.address || "—"}
                          </span>,
                          <span style={{ color: C.mutedLt, fontSize: 12 }}>
                            {s.notes || "—"}
                          </span>,
                          <button
                            onClick={() =>
                              del(
                                "mcw_suppliers",
                                setSuppliers,
                                suppliers,
                                s.id
                              )
                            }
                            style={{
                              color: C.muted,
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontSize: 14,
                              padding: "2px 6px",
                            }}
                          >
                            ×
                          </button>,
                        ]}
                      />
                    ))}
                  </Tbl>
                </Card>
              )}
            </div>
          )}

          {/* COMPLIANCE */}
          {tab === "Compliance" && (
            <div>
              <PageTitle
                title="COMPLIANCE & LICENCES"
                sub="Track document expiry dates, roadworthy certificates and insurance"
                action={
                  can(currentUser, "canAdd") && (
                    <Btn onClick={() => setModal("compliance")}>
                      ＋ Add Record
                    </Btn>
                  )
                }
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))",
                  gap: 14,
                  marginBottom: 22,
                }}
              >
                <KPI
                  label="Total Records"
                  value={compliance.length}
                  color={C.info}
                  icon="⊛"
                />
                <KPI
                  label="Expired"
                  value={
                    compliance.filter(
                      (c) => c.expiryDate && c.expiryDate < today()
                    ).length
                  }
                  color={C.red}
                  icon="⚑"
                />
                <KPI
                  label="Expiring in 30 Days"
                  value={
                    compliance.filter((c) => {
                      if (!c.expiryDate) return false;
                      const d = Math.round(
                        (new Date(c.expiryDate) - new Date()) /
                          (1000 * 60 * 60 * 24)
                      );
                      return d >= 0 && d <= 30;
                    }).length
                  }
                  color={C.warn}
                  icon="⚐"
                />
                <KPI
                  label="Valid"
                  value={
                    compliance.filter(
                      (c) => c.expiryDate && c.expiryDate > today()
                    ).length
                  }
                  color={C.success}
                  icon="✓"
                />
              </div>
              {compliance.length === 0 ? (
                <Empty
                  icon="📋"
                  title="No compliance records"
                  desc="Track roadworthy certificates, licences and insurance expiry dates here."
                  btn={
                    <Btn onClick={() => setModal("compliance")}>
                      Add First Record
                    </Btn>
                  }
                />
              ) : (
                <Card>
                  <Tbl
                    cols={[
                      "Asset",
                      "Document Type",
                      "Doc Number",
                      "Issue Date",
                      "Expiry Date",
                      "Status",
                      "Notes",
                      "",
                    ]}
                  >
                    {[...compliance]
                      .sort((a, b) => (a.expiryDate > b.expiryDate ? 1 : -1))
                      .map((c, i) => {
                        const asset = assets.find((a) => a.id === c.assetId);
                        const days = c.expiryDate
                          ? Math.round(
                              (new Date(c.expiryDate) - new Date()) /
                                (1000 * 60 * 60 * 24)
                            )
                          : null;
                        const expired = days !== null && days < 0;
                        const soon = days !== null && days >= 0 && days <= 30;
                        return (
                          <TR
                            key={c.id}
                            stripe={i % 2 !== 0}
                            cells={[
                              <span style={{ fontWeight: 700, color: C.text }}>
                                {asset?.name || "—"}
                              </span>,
                              <span style={{ fontSize: 12 }}>{c.docType}</span>,
                              <span
                                style={{
                                  color: C.muted,
                                  fontSize: 12,
                                  fontFamily: "monospace",
                                }}
                              >
                                {c.docNumber || "—"}
                              </span>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {c.issueDate || "—"}
                              </span>,
                              <span
                                style={{
                                  fontWeight: 600,
                                  color: expired
                                    ? C.red
                                    : soon
                                    ? C.warn
                                    : C.text,
                                  fontSize: 12,
                                }}
                              >
                                {c.expiryDate || "—"}
                              </span>,
                              <Pill
                                text={
                                  expired
                                    ? "Expired"
                                    : soon
                                    ? `Expires in ${days}d`
                                    : "Valid"
                                }
                                color={
                                  expired ? "red" : soon ? "yellow" : "green"
                                }
                              />,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {c.notes || "—"}
                              </span>,
                              <button
                                onClick={() =>
                                  del(
                                    "mcw_compliance",
                                    setCompliance,
                                    compliance,
                                    c.id
                                  )
                                }
                                style={{
                                  color: C.muted,
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: 14,
                                  padding: "2px 6px",
                                }}
                              >
                                ×
                              </button>,
                            ]}
                          />
                        );
                      })}
                  </Tbl>
                </Card>
              )}
            </div>
          )}

          {/* PROJECTS */}
          {tab === "Projects" && (
            <div>
              <PageTitle
                title="PROJECT REGISTER"
                sub="Track active contracts and allocate costs per project"
                action={
                  can(currentUser, "canAdd") && (
                    <Btn onClick={() => setModal("project")}>
                      ＋ Add Project
                    </Btn>
                  )
                }
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))",
                  gap: 14,
                  marginBottom: 22,
                }}
              >
                <KPI
                  label="Total Projects"
                  value={projects.length}
                  color={C.info}
                  icon="⊕"
                />
                <KPI
                  label="Active"
                  value={projects.filter((p) => p.status === "Active").length}
                  color={C.success}
                  icon="▶"
                />
                <KPI
                  label="Total Contract Value"
                  value={fmt(
                    projects.reduce(
                      (s, p) => s + Number(p.contractValue || 0),
                      0
                    )
                  )}
                  color={C.muted}
                  icon="₽"
                />
                <KPI
                  label="Completed"
                  value={
                    projects.filter((p) => p.status === "Completed").length
                  }
                  color={C.warn}
                  icon="✓"
                />
              </div>
              {projects.length === 0 ? (
                <Empty
                  icon="🏗️"
                  title="No projects registered"
                  desc="Register your contracts and sites to allocate costs and track spending per project."
                  btn={
                    <Btn onClick={() => setModal("project")}>
                      Add First Project
                    </Btn>
                  }
                />
              ) : (
                <Card>
                  <Tbl
                    cols={[
                      "Project Name",
                      "Code",
                      "Site",
                      "Status",
                      "Start Date",
                      "Contract Value",
                      "Description",
                      "",
                    ]}
                  >
                    {projects.map((p, i) => (
                      <TR
                        key={p.id}
                        stripe={i % 2 !== 0}
                        cells={[
                          <span style={{ fontWeight: 700, color: C.text }}>
                            {p.name}
                          </span>,
                          <span
                            style={{
                              color: C.muted,
                              fontSize: 12,
                              fontFamily: "monospace",
                            }}
                          >
                            {p.code || "—"}
                          </span>,
                          <span style={{ color: C.muted, fontSize: 12 }}>
                            {p.site}
                          </span>,
                          <Pill
                            text={p.status}
                            color={
                              p.status === "Active"
                                ? "green"
                                : p.status === "Completed"
                                ? "blue"
                                : p.status === "On Hold"
                                ? "yellow"
                                : "gray"
                            }
                          />,
                          <span style={{ color: C.muted, fontSize: 12 }}>
                            {p.startDate || "—"}
                          </span>,
                          <span style={{ fontWeight: 700 }}>
                            {p.contractValue ? fmt(p.contractValue) : "—"}
                          </span>,
                          <span style={{ color: C.muted, fontSize: 12 }}>
                            {p.description || "—"}
                          </span>,
                          <button
                            onClick={() =>
                              del("mcw_projects", setProjects, projects, p.id)
                            }
                            style={{
                              color: C.muted,
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontSize: 14,
                              padding: "2px 6px",
                            }}
                          >
                            ×
                          </button>,
                        ]}
                      />
                    ))}
                  </Tbl>
                </Card>
              )}
            </div>
          )}

          {/* EMPLOYEES */}
          {tab === "Employees" && (
            <div>
              <PageTitle
                title="EMPLOYEE REGISTER"
                sub="Official register of all plant division employees"
                action={
                  can(currentUser, "canAdd") && (
                    <Btn onClick={() => setModal("employee")}>
                      ＋ Add Employee
                    </Btn>
                  )
                }
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))",
                  gap: 14,
                  marginBottom: 22,
                }}
              >
                <KPI
                  label="Total Employees"
                  value={employees.length}
                  color={C.info}
                  icon="⊞"
                />
                <KPI
                  label="Active"
                  value={employees.filter((e) => e.status === "Active").length}
                  color={C.success}
                  icon="▶"
                />
                <KPI
                  label="On Leave"
                  value={
                    employees.filter((e) => e.status === "On Leave").length
                  }
                  color={C.warn}
                  icon="◷"
                />
                <KPI
                  label="Roles Represented"
                  value={new Set(employees.map((e) => e.role)).size}
                  color={C.muted}
                  icon="≡"
                />
              </div>
              {employees.length === 0 ? (
                <Empty
                  icon="👷"
                  title="No employees registered"
                  desc="Build your employee register to ensure accurate timesheet tracking and payroll integrity."
                  btn={
                    <Btn onClick={() => setModal("employee")}>
                      Add First Employee
                    </Btn>
                  }
                />
              ) : (
                <Card>
                  <Tbl
                    cols={[
                      "Full Name",
                      "ID Number",
                      "Role",
                      "Site",
                      "Contact",
                      "Start Date",
                      "Status",
                      "Notes",
                      "",
                    ]}
                  >
                    {employees.map((e, i) => (
                      <TR
                        key={e.id}
                        stripe={i % 2 !== 0}
                        cells={[
                          <span style={{ fontWeight: 700, color: C.text }}>
                            {e.name}
                          </span>,
                          <span
                            style={{
                              color: C.muted,
                              fontSize: 12,
                              fontFamily: "monospace",
                            }}
                          >
                            {e.idNumber || "—"}
                          </span>,
                          <span style={{ fontSize: 12 }}>{e.role}</span>,
                          <span style={{ color: C.muted, fontSize: 12 }}>
                            {e.site}
                          </span>,
                          <span style={{ color: C.muted, fontSize: 12 }}>
                            {e.contactNumber || "—"}
                          </span>,
                          <span style={{ color: C.muted, fontSize: 12 }}>
                            {e.startDate || "—"}
                          </span>,
                          <Pill
                            text={e.status}
                            color={
                              e.status === "Active"
                                ? "green"
                                : e.status === "On Leave"
                                ? "yellow"
                                : "gray"
                            }
                          />,
                          <span style={{ color: C.mutedLt, fontSize: 12 }}>
                            {e.notes || "—"}
                          </span>,
                          <button
                            onClick={() =>
                              del(
                                "mcw_employees",
                                setEmployees,
                                employees,
                                e.id
                              )
                            }
                            style={{
                              color: C.muted,
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontSize: 14,
                              padding: "2px 6px",
                            }}
                          >
                            ×
                          </button>,
                        ]}
                      />
                    ))}
                  </Tbl>
                </Card>
              )}
            </div>
          )}

          {/* SCHEDULES */}
          {tab === "Schedules" && (
            <div>
              <PageTitle
                title="MAINTENANCE SCHEDULES"
                sub="Proactive service schedules based on operating hours or kilometres"
                action={
                  can(currentUser, "canAdd") && (
                    <Btn onClick={() => setModal("schedule")}>
                      ＋ Add Schedule
                    </Btn>
                  )
                }
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))",
                  gap: 14,
                  marginBottom: 22,
                }}
              >
                <KPI
                  label="Schedules Active"
                  value={schedules.length}
                  color={C.info}
                  icon="⊗"
                />
                <KPI
                  label="Alerts"
                  value={scheduleAlerts.length}
                  color={scheduleAlerts.length > 0 ? C.red : C.success}
                  icon="⚑"
                />
              </div>
              {schedules.length === 0 ? (
                <Empty
                  icon="🔧"
                  title="No maintenance schedules"
                  desc="Set proactive service intervals by hours or kilometres to prevent costly breakdowns."
                  btn={
                    <Btn onClick={() => setModal("schedule")}>
                      Add First Schedule
                    </Btn>
                  }
                />
              ) : (
                <Card>
                  <Tbl
                    cols={[
                      "Asset",
                      "Service Type",
                      "Interval (Hrs)",
                      "Interval (Km)",
                      "Last Service Date",
                      "Last Hrs",
                      "Last Km",
                      "Next Due Hrs",
                      "Next Due Km",
                      "Status",
                      "",
                    ]}
                  >
                    {schedules.map((s, i) => {
                      const asset = assets.find((a) => a.id === s.assetId);
                      const nextHrs = s.intervalHours
                        ? (
                            Number(s.lastServiceHours || 0) +
                            Number(s.intervalHours)
                          ).toFixed(0)
                        : "—";
                      const nextKm = s.intervalKm
                        ? (
                            Number(s.lastServiceKm || 0) + Number(s.intervalKm)
                          ).toFixed(0)
                        : "—";
                      const alert = scheduleAlerts.find((a) => a === s);
                      return (
                        <TR
                          key={s.id}
                          stripe={i % 2 !== 0}
                          cells={[
                            <span style={{ fontWeight: 700, color: C.text }}>
                              {asset?.name || "—"}
                            </span>,
                            <span style={{ fontSize: 12 }}>
                              {s.serviceType}
                            </span>,
                            <span style={{ color: C.muted, fontSize: 12 }}>
                              {s.intervalHours ? `${s.intervalHours} hrs` : "—"}
                            </span>,
                            <span style={{ color: C.muted, fontSize: 12 }}>
                              {s.intervalKm ? `${s.intervalKm} km` : "—"}
                            </span>,
                            <span style={{ color: C.muted, fontSize: 12 }}>
                              {s.lastServiceDate || "—"}
                            </span>,
                            <span style={{ color: C.muted, fontSize: 12 }}>
                              {s.lastServiceHours || "—"}
                            </span>,
                            <span style={{ color: C.muted, fontSize: 12 }}>
                              {s.lastServiceKm || "—"}
                            </span>,
                            <span
                              style={{
                                fontWeight: 600,
                                color: C.info,
                                fontSize: 12,
                              }}
                            >
                              {nextHrs !== "—" ? `${nextHrs} hrs` : "—"}
                            </span>,
                            <span
                              style={{
                                fontWeight: 600,
                                color: C.info,
                                fontSize: 12,
                              }}
                            >
                              {nextKm !== "—" ? `${nextKm} km` : "—"}
                            </span>,
                            <Pill
                              text={alert ? "Due Soon" : "On Track"}
                              color={alert ? "red" : "green"}
                            />,
                            <button
                              onClick={() =>
                                del(
                                  "mcw_schedules",
                                  setSchedules,
                                  schedules,
                                  s.id
                                )
                              }
                              style={{
                                color: C.muted,
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontSize: 14,
                                padding: "2px 6px",
                              }}
                            >
                              ×
                            </button>,
                          ]}
                        />
                      );
                    })}
                  </Tbl>
                </Card>
              )}
            </div>
          )}
          {/* BUDGETS */}
          {tab === "Budgets" && (
            <div>
              <PageTitle
                title="BUDGET TRACKER"
                sub="Set monthly budgets and track actual spend against them"
                action={
                  can(currentUser, "canAdd") && (
                    <Btn onClick={() => setModal("budget")}>＋ Add Budget</Btn>
                  )
                }
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))",
                  gap: 14,
                  marginBottom: 22,
                }}
              >
                <KPI
                  label="Budgets This Month"
                  value={budgets.filter((b) => b.month === month).length}
                  color={C.info}
                  icon="₿"
                />
                <KPI
                  label="Total Budgeted"
                  value={fmt(totalBudgeted)}
                  sub={`For ${monthLabel(month)}`}
                  color={C.muted}
                  icon="₽"
                />
                <KPI
                  label="Total Spent"
                  value={fmt(totalSpentAgainstBudget)}
                  sub="Against budget lines"
                  color={
                    totalSpentAgainstBudget > totalBudgeted ? C.red : C.success
                  }
                  icon="₽"
                />
                <KPI
                  label="Overspent Lines"
                  value={budgetsOverspent}
                  color={budgetsOverspent > 0 ? C.red : C.success}
                  icon="⚑"
                />
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 18,
                }}
                className="np"
              >
                <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>
                  Viewing:
                </span>
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  style={{
                    border: `1px solid ${C.border}`,
                    borderRadius: 7,
                    padding: "7px 12px",
                    fontSize: 13,
                    background: C.white,
                    fontFamily: "'DM Sans',sans-serif",
                    color: C.text,
                  }}
                />
              </div>
              {budgets.filter((b) => b.month === month).length === 0 ? (
                <Empty
                  icon="₿"
                  title="No budgets for this period"
                  desc="Set monthly budgets per category and site to track and control operational spending."
                  btn={
                    <Btn onClick={() => setModal("budget")}>
                      Add First Budget
                    </Btn>
                  }
                />
              ) : (
                <Card>
                  <Tbl
                    cols={[
                      "Month",
                      "Category",
                      "Site",
                      "Budget (R)",
                      "Spent (R)",
                      "Remaining (R)",
                      "Usage %",
                      "Status",
                      "Notes",
                      "",
                    ]}
                  >
                    {budgets
                      .filter((b) => b.month === month)
                      .map((b, i) => {
                        const spent = getBudgetSpent(b);
                        const budget = Number(b.budgetAmount || 0);
                        const remaining = budget - spent;
                        const pct =
                          budget > 0 ? Math.round((spent / budget) * 100) : 0;
                        const over = spent > budget;
                        return (
                          <TR
                            key={b.id}
                            stripe={i % 2 !== 0}
                            cells={[
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {monthLabel(b.month)}
                              </span>,
                              <Pill text={b.category} color="blue" />,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {b.site}
                              </span>,
                              <span style={{ fontWeight: 700 }}>
                                {fmt(budget)}
                              </span>,
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: over ? C.red : C.text,
                                }}
                              >
                                {fmt(spent)}
                              </span>,
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: remaining >= 0 ? C.success : C.red,
                                }}
                              >
                                {fmt(Math.abs(remaining))}{" "}
                                {remaining < 0 ? "over" : ""}
                              </span>,
                              <div style={{ minWidth: 100 }}>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: 11,
                                    color: C.muted,
                                    marginBottom: 3,
                                  }}
                                >
                                  <span>{pct}%</span>
                                </div>
                                <div
                                  style={{
                                    height: 6,
                                    background: C.border,
                                    borderRadius: 3,
                                  }}
                                >
                                  <div
                                    style={{
                                      height: "100%",
                                      background: over
                                        ? C.red
                                        : pct > 80
                                        ? C.warn
                                        : C.success,
                                      borderRadius: 3,
                                      width: `${Math.min(100, pct)}%`,
                                      transition: "width 0.4s",
                                    }}
                                  />
                                </div>
                              </div>,
                              <Pill
                                text={
                                  over
                                    ? "Over Budget"
                                    : pct > 80
                                    ? "Near Limit"
                                    : "On Track"
                                }
                                color={
                                  over ? "red" : pct > 80 ? "yellow" : "green"
                                }
                              />,
                              <span style={{ color: C.mutedLt, fontSize: 12 }}>
                                {b.notes || "—"}
                              </span>,
                              <button
                                onClick={() =>
                                  del("mcw_budgets", setBudgets, budgets, b.id)
                                }
                                style={{
                                  color: C.muted,
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: 14,
                                  padding: "2px 6px",
                                }}
                              >
                                ×
                              </button>,
                            ]}
                          />
                        );
                      })}
                  </Tbl>
                </Card>
              )}
              {budgets.filter((b) => b.month !== month).length > 0 && (
                <div style={{ marginTop: 22 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: C.text,
                      marginBottom: 12,
                    }}
                  >
                    All Budget Records
                  </div>
                  <Card>
                    <Tbl
                      cols={[
                        "Month",
                        "Category",
                        "Site",
                        "Budget (R)",
                        "Spent (R)",
                        "Status",
                        "",
                      ]}
                    >
                      {[...budgets]
                        .filter((b) => b.month !== month)
                        .sort((a, b) => (b.month > a.month ? 1 : -1))
                        .map((b, i) => {
                          const spent = getBudgetSpent(b);
                          const over = spent > Number(b.budgetAmount || 0);
                          return (
                            <TR
                              key={b.id}
                              stripe={i % 2 !== 0}
                              cells={[
                                <span style={{ color: C.muted, fontSize: 12 }}>
                                  {monthLabel(b.month)}
                                </span>,
                                <Pill text={b.category} color="blue" />,
                                <span style={{ color: C.muted, fontSize: 12 }}>
                                  {b.site}
                                </span>,
                                <span style={{ fontWeight: 700 }}>
                                  {fmt(b.budgetAmount)}
                                </span>,
                                <span
                                  style={{
                                    fontWeight: 700,
                                    color: over ? C.red : C.text,
                                  }}
                                >
                                  {fmt(spent)}
                                </span>,
                                <Pill
                                  text={over ? "Over Budget" : "On Track"}
                                  color={over ? "red" : "green"}
                                />,
                                <button
                                  onClick={() =>
                                    del(
                                      "mcw_budgets",
                                      setBudgets,
                                      budgets,
                                      b.id
                                    )
                                  }
                                  style={{
                                    color: C.muted,
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: 14,
                                    padding: "2px 6px",
                                  }}
                                >
                                  ×
                                </button>,
                              ]}
                            />
                          );
                        })}
                    </Tbl>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* HIRE */}
          {tab === "Hire" && (
            <div>
              <PageTitle
                title="EQUIPMENT HIRE REGISTER"
                sub="Track hired plant and equipment with daily costs and return dates"
                action={
                  can(currentUser, "canAdd") && (
                    <Btn onClick={() => setModal("hire")}>＋ Log Hire</Btn>
                  )
                }
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))",
                  gap: 14,
                  marginBottom: 22,
                }}
              >
                <KPI
                  label="Total Hire Records"
                  value={hires.length}
                  color={C.info}
                  icon="⊠"
                />
                <KPI
                  label="Currently Active"
                  value={hires.filter((h) => h.status === "Active Hire").length}
                  color={
                    hires.filter((h) => h.status === "Active Hire").length > 0
                      ? C.warn
                      : C.success
                  }
                  icon="▶"
                />
                <KPI
                  label="Daily Hire Cost"
                  value={fmt(
                    hires
                      .filter((h) => h.status === "Active Hire")
                      .reduce((s, h) => s + Number(h.dailyRate || 0), 0)
                  )}
                  sub="Current active hires"
                  color={C.warn}
                  icon="₽"
                />
                <KPI
                  label="Total Hire Spend"
                  value={fmt(
                    hires.reduce((s, h) => {
                      const days = h.actualReturnDate
                        ? Math.round(
                            (new Date(h.actualReturnDate) -
                              new Date(h.startDate)) /
                              (1000 * 60 * 60 * 24)
                          )
                        : Math.round(
                            (new Date() - new Date(h.startDate)) /
                              (1000 * 60 * 60 * 24)
                          );
                      return s + Number(h.dailyRate || 0) * Math.max(1, days);
                    }, 0)
                  )}
                  sub="All time"
                  color={C.red}
                  icon="₽"
                />
              </div>
              {hires.length === 0 ? (
                <Empty
                  icon="⊠"
                  title="No hire records"
                  desc="Track hired-in plant equipment with daily rates, return dates and project allocation for accurate job costing."
                  btn={
                    <Btn onClick={() => setModal("hire")}>Log First Hire</Btn>
                  }
                />
              ) : (
                <Card>
                  <Tbl
                    cols={[
                      "Equipment",
                      "Category",
                      "Hire Company",
                      "Daily Rate",
                      "Start Date",
                      "Expected Return",
                      "Actual Return",
                      "Days",
                      "Total Cost",
                      "Project",
                      "Status",
                      "",
                    ]}
                  >
                    {[...hires]
                      .sort((a, b) => (b.startDate > a.startDate ? 1 : -1))
                      .map((h, i) => {
                        const project = projects.find(
                          (p) => p.id === h.projectId
                        );
                        const days = h.actualReturnDate
                          ? Math.round(
                              (new Date(h.actualReturnDate) -
                                new Date(h.startDate)) /
                                (1000 * 60 * 60 * 24)
                            )
                          : Math.round(
                              (new Date() - new Date(h.startDate)) /
                                (1000 * 60 * 60 * 24)
                            );
                        const totalCostH =
                          Number(h.dailyRate || 0) * Math.max(1, days);
                        const overdue =
                          !h.actualReturnDate &&
                          h.expectedReturnDate &&
                          h.expectedReturnDate < today();
                        return (
                          <TR
                            key={h.id}
                            stripe={i % 2 !== 0}
                            cells={[
                              <span style={{ fontWeight: 700, color: C.text }}>
                                {h.assetDescription}
                              </span>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {h.category}
                              </span>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {h.hireCompany || "—"}
                              </span>,
                              <span style={{ fontWeight: 600 }}>
                                {fmt(h.dailyRate)}/day
                              </span>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {h.startDate}
                              </span>,
                              <span
                                style={{
                                  color: overdue ? C.red : C.muted,
                                  fontSize: 12,
                                  fontWeight: overdue ? 700 : 400,
                                }}
                              >
                                {h.expectedReturnDate || "—"}
                                {overdue ? " ⚠" : ""}
                              </span>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {h.actualReturnDate || "—"}
                              </span>,
                              <span style={{ fontWeight: 600, color: C.info }}>
                                {Math.max(1, days)}
                              </span>,
                              <span style={{ fontWeight: 700, color: C.red }}>
                                {fmt(totalCostH)}
                              </span>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {project?.name || "—"}
                              </span>,
                              <Pill
                                text={h.status}
                                color={
                                  h.status === "Active Hire"
                                    ? "yellow"
                                    : h.status === "Returned"
                                    ? "green"
                                    : "gray"
                                }
                              />,
                              <button
                                onClick={() =>
                                  del("mcw_hires", setHires, hires, h.id)
                                }
                                style={{
                                  color: C.muted,
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: 14,
                                  padding: "2px 6px",
                                }}
                              >
                                ×
                              </button>,
                            ]}
                          />
                        );
                      })}
                  </Tbl>
                </Card>
              )}
            </div>
          )}

          {/* DISPOSALS */}
          {tab === "Disposals" && (
            <div>
              <PageTitle
                title="ASSET DISPOSALS & WRITE-OFFS"
                sub="Formal records for sold, written-off or scrapped assets"
                action={
                  can(currentUser, "canAdd") && (
                    <Btn onClick={() => setModal("disposal")}>
                      ＋ Record Disposal
                    </Btn>
                  )
                }
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))",
                  gap: 14,
                  marginBottom: 22,
                }}
              >
                <KPI
                  label="Total Disposals"
                  value={disposals.length}
                  color={C.info}
                  icon="⊖"
                />
                <KPI
                  label="Total Recovered"
                  value={fmt(
                    disposals.reduce(
                      (s, d) => s + Number(d.disposalValue || 0),
                      0
                    )
                  )}
                  sub="From sales and trade-ins"
                  color={C.success}
                  icon="₽"
                />
                <KPI
                  label="Written Off"
                  value={
                    disposals.filter(
                      (d) =>
                        d.method === "Written Off" || d.method === "Scrapped"
                    ).length
                  }
                  color={C.warn}
                  icon="⚑"
                />
                <KPI
                  label="Sold"
                  value={
                    disposals.filter(
                      (d) => d.method === "Sold" || d.method === "Trade-In"
                    ).length
                  }
                  color={C.muted}
                  icon="✓"
                />
              </div>
              {disposals.length === 0 ? (
                <Empty
                  icon="⊖"
                  title="No disposal records"
                  desc="Formally record assets that have been sold, written off or scrapped to close their lifecycle in the register."
                  btn={
                    <Btn onClick={() => setModal("disposal")}>
                      Record First Disposal
                    </Btn>
                  }
                />
              ) : (
                <Card>
                  <Tbl
                    cols={[
                      "Asset",
                      "Disposal Date",
                      "Method",
                      "Disposal Value",
                      "Buyer / Party",
                      "Contact",
                      "Original Cost",
                      "Book Value at Disposal",
                      "Reason",
                      "Notes",
                      "",
                    ]}
                  >
                    {[...disposals]
                      .sort((a, b) =>
                        b.disposalDate > a.disposalDate ? 1 : -1
                      )
                      .map((d, i) => {
                        const asset = assets.find((a) => a.id === d.assetId);
                        const dep = asset
                          ? depreciate({
                              ...asset,
                              purchaseDate: asset.purchaseDate,
                              purchaseCost: asset.purchaseCost,
                            })
                          : null;
                        return (
                          <TR
                            key={d.id}
                            stripe={i % 2 !== 0}
                            cells={[
                              <div>
                                <div style={{ fontWeight: 700, color: C.text }}>
                                  {asset?.name || "—"}
                                </div>
                                <div style={{ fontSize: 11, color: C.mutedLt }}>
                                  {asset?.category || ""}
                                </div>
                              </div>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {d.disposalDate}
                              </span>,
                              <Pill
                                text={d.method}
                                color={
                                  d.method === "Sold" || d.method === "Trade-In"
                                    ? "green"
                                    : d.method === "Written Off" ||
                                      d.method === "Scrapped"
                                    ? "red"
                                    : "yellow"
                                }
                              />,
                              <span
                                style={{ fontWeight: 700, color: C.success }}
                              >
                                {d.disposalValue ? fmt(d.disposalValue) : "—"}
                              </span>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {d.buyerName || "—"}
                              </span>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {d.buyerContact || "—"}
                              </span>,
                              <span style={{ fontSize: 12 }}>
                                {asset ? fmt(asset.purchaseCost) : "—"}
                              </span>,
                              <span style={{ fontSize: 12, color: C.warn }}>
                                {dep ? fmt(dep.bookValue) : "—"}
                              </span>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {d.reason || "—"}
                              </span>,
                              <span style={{ color: C.mutedLt, fontSize: 12 }}>
                                {d.notes || "—"}
                              </span>,
                              <button
                                onClick={() =>
                                  del(
                                    "mcw_disposals",
                                    setDisposals,
                                    disposals,
                                    d.id
                                  )
                                }
                                style={{
                                  color: C.muted,
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: 14,
                                  padding: "2px 6px",
                                }}
                              >
                                ×
                              </button>,
                            ]}
                          />
                        );
                      })}
                  </Tbl>
                </Card>
              )}
            </div>
          )}
          {/* ANALYTICS */}
          {tab === "Analytics" && (
            <div>
              <PageTitle
                title="ANALYTICS DASHBOARD"
                sub="Visual trends and operational insights across all modules"
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 18,
                  marginBottom: 18,
                }}
              >
                <Card
                  title="Fuel Spend — Last 6 Months"
                  sub="Total monthly fuel cost"
                >
                  <div style={{ padding: "16px 20px 12px" }}>
                    {fuelByMonth.every((d) => d.value === 0) ? (
                      <div
                        style={{
                          textAlign: "center",
                          color: C.muted,
                          fontSize: 13,
                          padding: "24px 0",
                        }}
                      >
                        No fuel data yet
                      </div>
                    ) : (
                      <BarChart
                        data={fuelByMonth}
                        valueKey="value"
                        labelKey="label"
                        color={C.warn}
                        fmtFn={(v) =>
                          v >= 1000
                            ? "R" + Math.round(v / 1000) + "k"
                            : "R" + Math.round(v)
                        }
                      />
                    )}
                  </div>
                </Card>
                <Card
                  title="Maintenance Cost — Last 6 Months"
                  sub="Total monthly maintenance spend"
                >
                  <div style={{ padding: "16px 20px 12px" }}>
                    {maintByMonth.every((d) => d.value === 0) ? (
                      <div
                        style={{
                          textAlign: "center",
                          color: C.muted,
                          fontSize: 13,
                          padding: "24px 0",
                        }}
                      >
                        No maintenance data yet
                      </div>
                    ) : (
                      <BarChart
                        data={maintByMonth}
                        valueKey="value"
                        labelKey="label"
                        color="#7c3aed"
                        fmtFn={(v) =>
                          v >= 1000
                            ? "R" + Math.round(v / 1000) + "k"
                            : "R" + Math.round(v)
                        }
                      />
                    )}
                  </div>
                </Card>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 18,
                  marginBottom: 18,
                }}
              >
                <Card
                  title="Labour Hours — Last 6 Months"
                  sub="Total hours worked per month"
                >
                  <div style={{ padding: "16px 20px 12px" }}>
                    {hoursBy6Month.every((d) => d.value === 0) ? (
                      <div
                        style={{
                          textAlign: "center",
                          color: C.muted,
                          fontSize: 13,
                          padding: "24px 0",
                        }}
                      >
                        No timesheet data yet
                      </div>
                    ) : (
                      <BarChart
                        data={hoursBy6Month}
                        valueKey="value"
                        labelKey="label"
                        color={C.red}
                        fmtFn={(v) => v.toFixed(0) + "h"}
                      />
                    )}
                  </div>
                </Card>
                <Card
                  title="Hours by Site"
                  sub="All time labour hours per site"
                >
                  <div style={{ padding: "16px 20px 12px" }}>
                    {hoursBySite.length === 0 ? (
                      <div
                        style={{
                          textAlign: "center",
                          color: C.muted,
                          fontSize: 13,
                          padding: "24px 0",
                        }}
                      >
                        No site data yet
                      </div>
                    ) : (
                      <BarChart
                        data={hoursBySite}
                        valueKey="value"
                        labelKey="label"
                        color={C.info}
                        fmtFn={(v) => v.toFixed(0) + "h"}
                      />
                    )}
                  </div>
                </Card>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 18,
                  marginBottom: 18,
                }}
              >
                <Card
                  title="Top Assets by Maintenance Cost"
                  sub="All time spend per asset"
                >
                  <div style={{ padding: "16px 20px 12px" }}>
                    {topAssetsByMaint.length === 0 ? (
                      <div
                        style={{
                          textAlign: "center",
                          color: C.muted,
                          fontSize: 13,
                          padding: "24px 0",
                        }}
                      >
                        No data yet
                      </div>
                    ) : (
                      <HBarChart
                        data={topAssetsByMaint}
                        valueKey="value"
                        labelKey="label"
                        color="#7c3aed"
                        fmtFn={(v) =>
                          v >= 1000
                            ? "R" + Math.round(v / 1000) + "k"
                            : "R" + Math.round(v)
                        }
                      />
                    )}
                  </div>
                </Card>
                <Card
                  title="Top Assets by Fuel Cost"
                  sub="All time fuel spend per asset"
                >
                  <div style={{ padding: "16px 20px 12px" }}>
                    {topAssetsByFuel.length === 0 ? (
                      <div
                        style={{
                          textAlign: "center",
                          color: C.muted,
                          fontSize: 13,
                          padding: "24px 0",
                        }}
                      >
                        No data yet
                      </div>
                    ) : (
                      <HBarChart
                        data={topAssetsByFuel}
                        valueKey="value"
                        labelKey="label"
                        color={C.warn}
                        fmtFn={(v) =>
                          v >= 1000
                            ? "R" + Math.round(v / 1000) + "k"
                            : "R" + Math.round(v)
                        }
                      />
                    )}
                  </div>
                </Card>
              </div>
              {incidentsByType.length > 0 && (
                <Card
                  title="Incidents by Type"
                  sub="All time incident breakdown"
                >
                  <div style={{ padding: "16px 20px 12px" }}>
                    <HBarChart
                      data={incidentsByType}
                      valueKey="value"
                      labelKey="label"
                      color={C.red}
                      fmtFn={(v) => v + " incidents"}
                    />
                  </div>
                </Card>
              )}
              <div
                style={{
                  marginTop: 18,
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))",
                  gap: 14,
                }}
              >
                <KPI
                  label="Total Fuel Spend (All Time)"
                  value={fmt(fuel.reduce((s, f) => s + Number(f.cost || 0), 0))}
                  color={C.warn}
                  icon="⛽"
                />
                <KPI
                  label="Total Maint. Cost (All Time)"
                  value={fmt(
                    maint.reduce((s, m) => s + Number(m.cost || 0), 0)
                  )}
                  color="#7c3aed"
                  icon="🔧"
                />
                <KPI
                  label="Total Labour Hours (All Time)"
                  value={`${ts
                    .reduce((s, t) => s + Number(t.hours || 0), 0)
                    .toFixed(0)} hrs`}
                  color={C.red}
                  icon="◷"
                />
                <KPI
                  label="Total Incident Downtime"
                  value={`${incidents
                    .reduce((s, i) => s + Number(i.downtimeHours || 0), 0)
                    .toFixed(1)} hrs`}
                  color={C.info}
                  icon="⚠"
                />
                <KPI
                  label="Total Hire Spend"
                  value={fmt(
                    hires.reduce((s, h) => {
                      const d = h.actualReturnDate
                        ? Math.round(
                            (new Date(h.actualReturnDate) -
                              new Date(h.startDate)) /
                              (1000 * 60 * 60 * 24)
                          )
                        : Math.round(
                            (new Date() - new Date(h.startDate)) /
                              (1000 * 60 * 60 * 24)
                          );
                      return s + Number(h.dailyRate || 0) * Math.max(1, d);
                    }, 0)
                  )}
                  color={C.muted}
                  icon="⊠"
                />
                <KPI
                  label="Assets Fully Depreciated"
                  value={
                    assets.filter((a) => depreciate(a).bookValue <= 0).length
                  }
                  color={C.warn}
                  icon="⊘"
                />
              </div>
            </div>
          )}

          {/* FUEL RECONCILIATION */}
          {tab === "FuelRecon" && (
            <div>
              <PageTitle
                title="FUEL RECONCILIATION"
                sub="Cross-reference fuel purchased vs logged per asset — flag anomalies"
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 18,
                }}
                className="np"
              >
                <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>
                  Period:
                </span>
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  style={{
                    border: `1px solid ${C.border}`,
                    borderRadius: 7,
                    padding: "7px 12px",
                    fontSize: 13,
                    background: C.white,
                    fontFamily: "'DM Sans',sans-serif",
                    color: C.text,
                  }}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))",
                  gap: 14,
                  marginBottom: 22,
                }}
              >
                <KPI
                  label="Total Litres This Month"
                  value={`${totalFuelMonthLitres.toFixed(0)} L`}
                  color={C.info}
                  icon="⛽"
                />
                <KPI
                  label="Total Fuel Cost"
                  value={fmt(totalFuelMonthCost)}
                  color={C.warn}
                  icon="₽"
                />
                <KPI
                  label="Avg Cost per Litre"
                  value={
                    totalFuelMonthLitres > 0
                      ? fmt(totalFuelMonthCost / totalFuelMonthLitres)
                      : "—"
                  }
                  color={C.muted}
                  icon="÷"
                />
                <KPI
                  label="vs Previous Month"
                  value={
                    fuelVariance !== null
                      ? `${fuelVariance > 0 ? "+" : ""}${fuelVariance}%`
                      : "—"
                  }
                  sub={
                    prevFuelCost > 0
                      ? `Prev: ${fmt(prevFuelCost)}`
                      : "No prior data"
                  }
                  color={
                    fuelVariance !== null && Number(fuelVariance) > 10
                      ? C.red
                      : fuelVariance !== null && Number(fuelVariance) < -10
                      ? C.success
                      : C.muted
                  }
                  icon="≋"
                />
                <KPI
                  label="Assets With Fuel Logged"
                  value={fuelMonthAssets.filter((x) => x.hasFuel).length}
                  sub={`of ${assets.length} total assets`}
                  color={C.success}
                  icon="▤"
                />
                <KPI
                  label="Active Assets No Fuel"
                  value={assetsNoFuelButActive.length}
                  sub={
                    assetsNoFuelButActive.length > 0
                      ? "Maintenance logged — no fuel recorded"
                      : "All clear"
                  }
                  color={assetsNoFuelButActive.length > 0 ? C.red : C.success}
                  icon="⚑"
                />
              </div>

              {assetsNoFuelButActive.length > 0 && (
                <div
                  style={{
                    background: C.redLight,
                    border: `1px solid ${C.redBorder}`,
                    borderRadius: 10,
                    padding: "16px 20px",
                    marginBottom: 18,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: C.red,
                      marginBottom: 10,
                    }}
                  >
                    ⚠ Assets With Maintenance Recorded But No Fuel Logged —{" "}
                    {monthLabel(month)}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {assetsNoFuelButActive.map((x) => (
                      <div
                        key={x.asset.id}
                        style={{
                          background: C.white,
                          border: `1px solid ${C.redBorder}`,
                          borderRadius: 7,
                          padding: "6px 12px",
                          fontSize: 12,
                          color: C.text,
                          fontWeight: 600,
                        }}
                      >
                        {x.asset.name}{" "}
                        <span style={{ color: C.muted, fontWeight: 400 }}>
                          · {x.asset.category}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {fuelMonthAssets.filter((x) => x.hasFuel).length === 0 ? (
                <Empty
                  icon="⛽"
                  title={`No fuel logged for ${monthLabel(month)}`}
                  desc="Log fuel fills in the Fuel & Usage tab to see reconciliation data here."
                  btn={
                    <Btn onClick={() => setTab("Fuel")}>Go to Fuel Logs</Btn>
                  }
                />
              ) : (
                <Card
                  title={`Fuel Breakdown by Asset — ${monthLabel(month)}`}
                  sub="Detailed per-asset fuel analysis"
                >
                  <Tbl
                    cols={[
                      "Asset",
                      "Category",
                      "Records",
                      "Litres",
                      "Total Cost",
                      "Cost/Litre",
                      "vs Fleet Avg",
                      "Status",
                    ]}
                  >
                    {fuelMonthAssets
                      .filter((x) => x.hasFuel)
                      .sort((a, b) => b.cost - a.cost)
                      .map((x, i) => {
                        const fleetAvgCpl =
                          totalFuelMonthLitres > 0
                            ? totalFuelMonthCost / totalFuelMonthLitres
                            : 0;
                        const variance =
                          fleetAvgCpl > 0
                            ? (
                                ((x.cpl - fleetAvgCpl) / fleetAvgCpl) *
                                100
                              ).toFixed(1)
                            : null;
                        const high = variance !== null && Number(variance) > 15;
                        return (
                          <TR
                            key={x.asset.id}
                            stripe={i % 2 !== 0}
                            cells={[
                              <span style={{ fontWeight: 700, color: C.text }}>
                                {x.asset.name}
                              </span>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {x.asset.category}
                              </span>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {x.records} fill{x.records !== 1 ? "s" : ""}
                              </span>,
                              <span style={{ fontWeight: 600, color: C.info }}>
                                {x.litres.toFixed(1)} L
                              </span>,
                              <span style={{ fontWeight: 700 }}>
                                {fmt(x.cost)}
                              </span>,
                              <span
                                style={{
                                  fontWeight: 600,
                                  color: high ? C.red : C.text,
                                }}
                              >
                                {x.cpl > 0 ? `R ${x.cpl.toFixed(2)}/L` : "—"}
                              </span>,
                              <span
                                style={{
                                  fontSize: 12,
                                  color: high ? C.red : C.success,
                                  fontWeight: 600,
                                }}
                              >
                                {variance !== null
                                  ? `${
                                      Number(variance) > 0 ? "+" : ""
                                    }${variance}%`
                                  : "—"}
                              </span>,
                              <Pill
                                text={high ? "High Usage" : "Normal"}
                                color={high ? "red" : "green"}
                              />,
                            ]}
                          />
                        );
                      })}
                    <TR
                      stripe={false}
                      cells={[
                        <span
                          style={{
                            fontWeight: 800,
                            color: C.text,
                            fontSize: 12,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}
                        >
                          TOTAL
                        </span>,
                        <span />,
                        <span style={{ fontWeight: 700 }}>
                          {fuelMonthAssets
                            .filter((x) => x.hasFuel)
                            .reduce((s, x) => s + x.records, 0)}{" "}
                          fills
                        </span>,
                        <span style={{ fontWeight: 800, color: C.info }}>
                          {totalFuelMonthLitres.toFixed(1)} L
                        </span>,
                        <span style={{ fontWeight: 800 }}>
                          {fmt(totalFuelMonthCost)}
                        </span>,
                        <span style={{ fontWeight: 700, color: C.muted }}>
                          {totalFuelMonthLitres > 0
                            ? `R ${(
                                totalFuelMonthCost / totalFuelMonthLitres
                              ).toFixed(2)}/L (avg)`
                            : ""}
                        </span>,
                        <span />,
                        <span />,
                      ]}
                    />
                  </Tbl>
                </Card>
              )}

              {last6.length > 0 && fuel.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  <Card
                    title="6-Month Fuel Trend"
                    sub="Cost and volume trend over the past 6 months"
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 0,
                      }}
                    >
                      <div
                        style={{
                          padding: "20px 24px",
                          borderRight: `1px solid ${C.border}`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: C.text,
                            marginBottom: 12,
                          }}
                        >
                          Cost per Month
                        </div>
                        <BarChart
                          data={fuelByMonth}
                          valueKey="value"
                          labelKey="label"
                          color={C.warn}
                          fmtFn={(v) =>
                            v >= 1000
                              ? "R" + Math.round(v / 1000) + "k"
                              : "R" + Math.round(v)
                          }
                        />
                      </div>
                      <div style={{ padding: "20px 24px" }}>
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: C.text,
                            marginBottom: 12,
                          }}
                        >
                          Litres per Month
                        </div>
                        <BarChart
                          data={last6.map((m) => ({
                            label: shortMonth(m),
                            value: fuel
                              .filter((f) => f.date?.startsWith(m))
                              .reduce((s, f) => s + Number(f.litres || 0), 0),
                          }))}
                          valueKey="value"
                          labelKey="label"
                          color={C.info}
                          fmtFn={(v) => v.toFixed(0) + "L"}
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* AUDIT LOG */}
          {tab === "AuditLog" && (
            <div>
              <PageTitle
                title="AUDIT TRAIL"
                sub="Complete log of all system changes — who did what and when"
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))",
                  gap: 14,
                  marginBottom: 22,
                }}
              >
                <KPI
                  label="Total Events Logged"
                  value={auditLog.length}
                  color={C.info}
                  icon="⊙"
                />
                <KPI
                  label="Add Events"
                  value={auditLog.filter((a) => a.action === "ADD").length}
                  color={C.success}
                  icon="＋"
                />
                <KPI
                  label="Delete Events"
                  value={auditLog.filter((a) => a.action === "DELETE").length}
                  color={C.red}
                  icon="−"
                />
                <KPI
                  label="Update Events"
                  value={auditLog.filter((a) => a.action === "UPDATE").length}
                  color={C.warn}
                  icon="✎"
                />
                <KPI
                  label="Unique Users"
                  value={new Set(auditLog.map((a) => a.user)).size}
                  color={C.muted}
                  icon="⊞"
                />
                <KPI
                  label="Today's Events"
                  value={
                    auditLog.filter((a) => a.timestamp.startsWith(today()))
                      .length
                  }
                  color={C.info}
                  icon="◷"
                />
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginBottom: 16,
                  flexWrap: "wrap",
                }}
                className="np"
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}
                  >
                    Action:
                  </span>
                  <select
                    style={{
                      border: `1px solid ${C.border}`,
                      borderRadius: 7,
                      padding: "7px 12px",
                      fontSize: 12,
                      background: C.white,
                      color: C.text,
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                    value={auditFilter.action}
                    onChange={(e) =>
                      setAuditFilter((f) => ({ ...f, action: e.target.value }))
                    }
                  >
                    <option>All</option>
                    <option>ADD</option>
                    <option>UPDATE</option>
                    <option>DELETE</option>
                  </select>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}
                  >
                    Module:
                  </span>
                  <select
                    style={{
                      border: `1px solid ${C.border}`,
                      borderRadius: 7,
                      padding: "7px 12px",
                      fontSize: 12,
                      background: C.white,
                      color: C.text,
                      fontFamily: "'DM Sans',sans-serif",
                    }}
                    value={auditFilter.module}
                    onChange={(e) =>
                      setAuditFilter((f) => ({ ...f, module: e.target.value }))
                    }
                  >
                    <option>All</option>
                    {[...new Set(Object.values(MODULE_NAMES))]
                      .sort()
                      .map((m) => (
                        <option key={m}>{m}</option>
                      ))}
                  </select>
                </div>
                {(auditFilter.action !== "All" ||
                  auditFilter.module !== "All") && (
                  <Btn
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setAuditFilter({ action: "All", module: "All" })
                    }
                  >
                    Clear Filters
                  </Btn>
                )}
              </div>
              {auditLog.length === 0 ? (
                <Empty
                  icon="⊙"
                  title="No audit events yet"
                  desc="Every time a record is added, updated or deleted it will be logged here automatically."
                  btn={null}
                />
              ) : (
                <Card>
                  <Tbl
                    cols={[
                      "Timestamp",
                      "User",
                      "Role",
                      "Action",
                      "Module",
                      "Description",
                    ]}
                  >
                    {auditLog
                      .filter(
                        (a) =>
                          (auditFilter.action === "All" ||
                            a.action === auditFilter.action) &&
                          (auditFilter.module === "All" ||
                            a.module === auditFilter.module)
                      )
                      .slice(0, 200)
                      .map((a, i) => {
                        const ts2 = new Date(a.timestamp);
                        const isToday = a.timestamp.startsWith(today());
                        return (
                          <TR
                            key={a.id}
                            stripe={i % 2 !== 0}
                            cells={[
                              <div>
                                <div
                                  style={{
                                    fontSize: 12,
                                    fontWeight: 600,
                                    color: C.text,
                                  }}
                                >
                                  {isToday
                                    ? "Today"
                                    : ts2.toLocaleDateString("en-ZA", {
                                        day: "numeric",
                                        month: "short",
                                      })}
                                </div>
                                <div style={{ fontSize: 11, color: C.muted }}>
                                  {ts2.toLocaleTimeString("en-ZA", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    second: "2-digit",
                                  })}
                                </div>
                              </div>,
                              <span
                                style={{
                                  fontWeight: 600,
                                  color: C.text,
                                  fontSize: 12,
                                }}
                              >
                                {a.user}
                              </span>,
                              <Pill
                                text={
                                  a.role.charAt(0).toUpperCase() +
                                  a.role.slice(1)
                                }
                                color={
                                  a.role === "admin"
                                    ? "red"
                                    : a.role === "manager"
                                    ? "blue"
                                    : a.role === "operator"
                                    ? "yellow"
                                    : "gray"
                                }
                              />,
                              <Pill
                                text={a.action}
                                color={
                                  a.action === "ADD"
                                    ? "green"
                                    : a.action === "DELETE"
                                    ? "red"
                                    : "yellow"
                                }
                              />,
                              <span
                                style={{
                                  fontSize: 12,
                                  color: C.info,
                                  fontWeight: 500,
                                }}
                              >
                                {a.module}
                              </span>,
                              <span style={{ fontSize: 12, color: C.muted }}>
                                {a.description}
                              </span>,
                            ]}
                          />
                        );
                      })}
                  </Tbl>
                  {auditLog.filter(
                    (a) =>
                      (auditFilter.action === "All" ||
                        a.action === auditFilter.action) &&
                      (auditFilter.module === "All" ||
                        a.module === auditFilter.module)
                  ).length > 200 && (
                    <div
                      style={{
                        padding: "12px 20px",
                        borderTop: `1px solid ${C.border}`,
                        fontSize: 12,
                        color: C.muted,
                        textAlign: "center",
                      }}
                    >
                      Showing most recent 200 of{" "}
                      {
                        auditLog.filter(
                          (a) =>
                            (auditFilter.action === "All" ||
                              a.action === auditFilter.action) &&
                            (auditFilter.module === "All" ||
                              a.module === auditFilter.module)
                        ).length
                      }{" "}
                      events
                    </div>
                  )}
                </Card>
              )}
            </div>
          )}
          {/* LEAVE & OVERTIME */}
          {tab === "Leave" && (
            <div>
              <PageTitle
                title="LEAVE & OVERTIME REGISTER"
                sub="Track employee leave, absences and approved overtime"
                action={
                  can(currentUser, "canAdd") && (
                    <div style={{ display: "flex", gap: 8 }}>
                      <Btn
                        onClick={() => setModal("overtime")}
                        variant="outline"
                      >
                        ＋ Log Overtime
                      </Btn>
                      <Btn onClick={() => setModal("leave")}>
                        ＋ Record Leave
                      </Btn>
                    </div>
                  )
                }
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))",
                  gap: 14,
                  marginBottom: 22,
                }}
              >
                <KPI
                  label="Total Leave Records"
                  value={leaves.length}
                  color={C.info}
                  icon="◫"
                />
                <KPI
                  label="Currently on Leave"
                  value={employeesOnLeave}
                  color={employeesOnLeave > 0 ? C.warn : C.success}
                  icon="⊟"
                />
                <KPI
                  label="Leave Days This Month"
                  value={leaves
                    .filter(
                      (l) =>
                        l.startDate?.startsWith(month) ||
                        l.endDate?.startsWith(month)
                    )
                    .reduce((s, l) => s + Number(l.days || 0), 0)}
                  color={C.muted}
                  icon="◷"
                />
                <KPI
                  label="OT Hours This Month"
                  value={`${overtimeThisMonth.toFixed(1)} hrs`}
                  color={overtimeThisMonth > 0 ? C.warn : C.success}
                  icon="▲"
                />
              </div>

              <div style={{ marginBottom: 22 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: C.text,
                    marginBottom: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>Leave Records</span>
                  <span
                    style={{ fontSize: 12, color: C.muted, fontWeight: 400 }}
                  >
                    {leaves.length} records
                  </span>
                </div>
                {leaves.length === 0 ? (
                  <Empty
                    icon="◫"
                    title="No leave records"
                    desc="Record employee leave to track absences and ensure accurate payroll processing."
                    btn={
                      <Btn onClick={() => setModal("leave")}>
                        Record First Leave
                      </Btn>
                    }
                  />
                ) : (
                  <Card>
                    <Tbl
                      cols={[
                        "Employee",
                        "Leave Type",
                        "Start Date",
                        "End Date",
                        "Days",
                        "Status",
                        "Approved By",
                        "Notes",
                        "",
                      ]}
                    >
                      {[...leaves]
                        .sort((a, b) => (b.startDate > a.startDate ? 1 : -1))
                        .map((l, i) => {
                          const isActive =
                            l.status === "Approved" &&
                            l.startDate <= today() &&
                            (!l.endDate || l.endDate >= today());
                          return (
                            <TR
                              key={l.id}
                              stripe={i % 2 !== 0}
                              cells={[
                                <span
                                  style={{ fontWeight: 700, color: C.text }}
                                >
                                  {l.employeeName}
                                </span>,
                                <Pill text={l.leaveType} color="blue" />,
                                <span style={{ color: C.muted, fontSize: 12 }}>
                                  {l.startDate}
                                </span>,
                                <span style={{ color: C.muted, fontSize: 12 }}>
                                  {l.endDate || "—"}
                                </span>,
                                <span
                                  style={{ fontWeight: 600, color: C.info }}
                                >
                                  {l.days
                                    ? `${l.days} day${
                                        Number(l.days) !== 1 ? "s" : ""
                                      }`
                                    : "—"}
                                </span>,
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 4,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  <Pill
                                    text={l.status}
                                    color={
                                      l.status === "Approved"
                                        ? "green"
                                        : l.status === "Pending"
                                        ? "yellow"
                                        : "red"
                                    }
                                  />
                                  {isActive && (
                                    <Pill text="On Leave Now" color="yellow" />
                                  )}
                                </div>,
                                <span style={{ color: C.muted, fontSize: 12 }}>
                                  {l.approvedBy || "—"}
                                </span>,
                                <span
                                  style={{ color: C.mutedLt, fontSize: 12 }}
                                >
                                  {l.notes || "—"}
                                </span>,
                                <button
                                  onClick={() =>
                                    del("mcw_leaves", setLeaves, leaves, l.id)
                                  }
                                  style={{
                                    color: C.muted,
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: 14,
                                    padding: "2px 6px",
                                  }}
                                >
                                  ×
                                </button>,
                              ]}
                            />
                          );
                        })}
                    </Tbl>
                  </Card>
                )}
              </div>

              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: C.text,
                    marginBottom: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>Overtime Records</span>
                  <span
                    style={{ fontSize: 12, color: C.muted, fontWeight: 400 }}
                  >
                    {overtimes.length} records · {totalOvertimeHours.toFixed(1)}{" "}
                    hrs total
                  </span>
                </div>
                {overtimes.length === 0 ? (
                  <Empty
                    icon="▲"
                    title="No overtime records"
                    desc="Log approved overtime to track extra hours per employee for accurate payroll and cost allocation."
                    btn={
                      <Btn onClick={() => setModal("overtime")}>
                        Log First Overtime
                      </Btn>
                    }
                  />
                ) : (
                  <Card>
                    <Tbl
                      cols={[
                        "Employee",
                        "Date",
                        "Regular Hrs",
                        "Overtime Hrs",
                        "Total Hrs",
                        "Reason",
                        "Site",
                        "Approved By",
                        "",
                      ]}
                      foot={
                        <FtRow
                          highlight
                          vals={[
                            "TOTAL",
                            "",
                            "",
                            `${totalOvertimeHours.toFixed(1)} hrs`,
                            "",
                            "",
                            "",
                            "",
                            "",
                          ]}
                        />
                      }
                    >
                      {[...overtimes]
                        .sort((a, b) => (b.date > a.date ? 1 : -1))
                        .map((o, i) => (
                          <TR
                            key={o.id}
                            stripe={i % 2 !== 0}
                            cells={[
                              <span style={{ fontWeight: 700, color: C.text }}>
                                {o.employeeName}
                              </span>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {o.date}
                              </span>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {o.regularHours || 8} hrs
                              </span>,
                              <span style={{ fontWeight: 700, color: C.warn }}>
                                {o.overtimeHours} hrs
                              </span>,
                              <span
                                style={{
                                  fontWeight: 800,
                                  color: C.red,
                                  fontFamily: "'Barlow Condensed',sans-serif",
                                  fontSize: 15,
                                }}
                              >
                                {(
                                  Number(o.regularHours || 8) +
                                  Number(o.overtimeHours || 0)
                                ).toFixed(1)}{" "}
                                hrs
                              </span>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {o.reason || "—"}
                              </span>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {o.site}
                              </span>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {o.approvedBy || "—"}
                              </span>,
                              <button
                                onClick={() =>
                                  del(
                                    "mcw_overtimes",
                                    setOvertimes,
                                    overtimes,
                                    o.id
                                  )
                                }
                                style={{
                                  color: C.muted,
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: 14,
                                  padding: "2px 6px",
                                }}
                              >
                                ×
                              </button>,
                            ]}
                          />
                        ))}
                    </Tbl>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* ASSIGNMENTS */}
          {tab === "Assignments" && (
            <div>
              <PageTitle
                title="OPERATOR-ASSET ASSIGNMENT HISTORY"
                sub="Accountability trail — who was on which machine and when"
                action={
                  can(currentUser, "canAdd") && (
                    <Btn onClick={() => setModal("assignment")}>
                      ＋ Log Assignment
                    </Btn>
                  )
                }
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))",
                  gap: 14,
                  marginBottom: 22,
                }}
              >
                <KPI
                  label="Total Assignments"
                  value={assignments.length}
                  color={C.info}
                  icon="◴"
                />
                <KPI
                  label="Currently Active"
                  value={assignments.filter((a) => !a.endDate).length}
                  color={
                    assignments.filter((a) => !a.endDate).length > 0
                      ? C.warn
                      : C.success
                  }
                  icon="▶"
                />
                <KPI
                  label="Unique Operators"
                  value={new Set(assignments.map((a) => a.employeeName)).size}
                  color={C.muted}
                  icon="⊞"
                />
                <KPI
                  label="Assets Tracked"
                  value={new Set(assignments.map((a) => a.assetId)).size}
                  color={C.success}
                  icon="⊟"
                />
              </div>
              {assignments.length === 0 ? (
                <Empty
                  icon="◴"
                  title="No assignment records"
                  desc="Log operator-asset assignments to create an accountability trail. If a machine is damaged, you will know exactly who was operating it and when."
                  btn={
                    <Btn onClick={() => setModal("assignment")}>
                      Log First Assignment
                    </Btn>
                  }
                />
              ) : (
                <Card>
                  <Tbl
                    cols={[
                      "Asset",
                      "Category",
                      "Operator",
                      "Start Date",
                      "End Date",
                      "Duration",
                      "Site",
                      "Notes",
                      "",
                    ]}
                  >
                    {[...assignments]
                      .sort((a, b) => (b.startDate > a.startDate ? 1 : -1))
                      .map((a, i) => {
                        const asset = assets.find((x) => x.id === a.assetId);
                        const days = a.endDate
                          ? Math.round(
                              (new Date(a.endDate) - new Date(a.startDate)) /
                                (1000 * 60 * 60 * 24)
                            )
                          : Math.round(
                              (new Date() - new Date(a.startDate)) /
                                (1000 * 60 * 60 * 24)
                            );
                        const active = !a.endDate;
                        return (
                          <TR
                            key={a.id}
                            stripe={i % 2 !== 0}
                            cells={[
                              <div>
                                <div style={{ fontWeight: 700, color: C.text }}>
                                  {asset?.name || "—"}
                                </div>
                                {active && <Pill text="Active" color="green" />}
                              </div>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {asset?.category || "—"}
                              </span>,
                              <span style={{ fontWeight: 600, color: C.text }}>
                                {a.employeeName}
                              </span>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {a.startDate}
                              </span>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {a.endDate || "Current"}
                              </span>,
                              <span style={{ fontWeight: 600, color: C.info }}>
                                {Math.max(0, days)} day{days !== 1 ? "s" : ""}
                              </span>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {a.site}
                              </span>,
                              <span style={{ color: C.mutedLt, fontSize: 12 }}>
                                {a.notes || "—"}
                              </span>,
                              <button
                                onClick={() =>
                                  del(
                                    "mcw_assignments",
                                    setAssignments,
                                    assignments,
                                    a.id
                                  )
                                }
                                style={{
                                  color: C.muted,
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: 14,
                                  padding: "2px 6px",
                                }}
                              >
                                ×
                              </button>,
                            ]}
                          />
                        );
                      })}
                  </Tbl>
                </Card>
              )}
              {assignments.length > 0 && (
                <div style={{ marginTop: 18 }}>
                  <Card
                    title="Assignment History by Asset"
                    sub="All time — which operators have used each asset"
                  >
                    <div style={{ padding: "16px 20px" }}>
                      {[...new Set(assignments.map((a) => a.assetId))].map(
                        (assetId) => {
                          const asset = assets.find((x) => x.id === assetId);
                          const assetAssignments = assignments.filter(
                            (a) => a.assetId === assetId
                          );
                          return (
                            <div
                              key={assetId}
                              style={{
                                marginBottom: 16,
                                paddingBottom: 16,
                                borderBottom: `1px solid ${C.border}`,
                              }}
                            >
                              <div
                                style={{
                                  fontWeight: 700,
                                  fontSize: 13,
                                  color: C.text,
                                  marginBottom: 8,
                                }}
                              >
                                {asset?.name || "Unknown Asset"}{" "}
                                <span
                                  style={{
                                    color: C.muted,
                                    fontWeight: 400,
                                    fontSize: 12,
                                  }}
                                >
                                  · {asset?.category}
                                </span>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 6,
                                }}
                              >
                                {assetAssignments.map((a) => (
                                  <div
                                    key={a.id}
                                    style={{
                                      background: C.surface,
                                      border: `1px solid ${C.border}`,
                                      borderRadius: 7,
                                      padding: "6px 12px",
                                      fontSize: 12,
                                    }}
                                  >
                                    <span
                                      style={{ fontWeight: 600, color: C.text }}
                                    >
                                      {a.employeeName}
                                    </span>
                                    <span
                                      style={{ color: C.muted, marginLeft: 6 }}
                                    >
                                      {a.startDate}
                                      {a.endDate
                                        ? ` → ${a.endDate}`
                                        : " → Current"}
                                    </span>
                                    {!a.endDate && (
                                      <span
                                        style={{
                                          marginLeft: 6,
                                          color: C.success,
                                          fontWeight: 700,
                                        }}
                                      >
                                        ●
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}
          {/* SPARES */}
          {tab === "Spares" && (
            <div>
              <PageTitle
                title="PARTS & SPARES INVENTORY"
                sub="Track critical on-site spares with minimum stock level alerts"
                action={
                  can(currentUser, "canAdd") && (
                    <Btn onClick={() => setModal("spare")}>＋ Add Part</Btn>
                  )
                }
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))",
                  gap: 14,
                  marginBottom: 22,
                }}
              >
                <KPI
                  label="Total Parts"
                  value={spares.length}
                  color={C.info}
                  icon="⊟"
                />
                <KPI
                  label="Low Stock"
                  value={sparesLow}
                  color={sparesLow > 0 ? C.warn : C.success}
                  icon="⚑"
                />
                <KPI
                  label="Out of Stock"
                  value={sparesOut}
                  color={sparesOut > 0 ? C.red : C.success}
                  icon="⚐"
                />
                <KPI
                  label="Total Inventory Value"
                  value={fmt(
                    spares.reduce(
                      (s, x) =>
                        s + Number(x.quantity || 0) * Number(x.unitCost || 0),
                      0
                    )
                  )}
                  color={C.muted}
                  icon="₽"
                />
              </div>
              {sparesLow + sparesOut > 0 && (
                <div
                  style={{
                    background: C.redLight,
                    border: `1px solid ${C.redBorder}`,
                    borderRadius: 10,
                    padding: "14px 18px",
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: C.red,
                      marginBottom: 10,
                    }}
                  >
                    ⚠ Stock Alerts — {sparesLow + sparesOut} part
                    {sparesLow + sparesOut !== 1 ? "s" : ""} need attention
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {spares
                      .filter(
                        (s) =>
                          Number(s.quantity || 0) === 0 ||
                          s.status === "Out of Stock"
                      )
                      .map((s) => (
                        <div
                          key={s.id}
                          style={{
                            background: C.white,
                            border: `1px solid ${C.redBorder}`,
                            borderRadius: 7,
                            padding: "6px 12px",
                            fontSize: 12,
                            color: C.red,
                            fontWeight: 600,
                          }}
                        >
                          {s.partName} — Out of Stock
                        </div>
                      ))}
                    {spares
                      .filter(
                        (s) =>
                          Number(s.quantity || 0) > 0 &&
                          Number(s.quantity || 0) <=
                            Number(s.minStockLevel || 0)
                      )
                      .map((s) => (
                        <div
                          key={s.id}
                          style={{
                            background: C.warnBg,
                            border: `1px solid #FDE68A`,
                            borderRadius: 7,
                            padding: "6px 12px",
                            fontSize: 12,
                            color: C.warn,
                            fontWeight: 600,
                          }}
                        >
                          {s.partName} — Only {s.quantity} left (min:{" "}
                          {s.minStockLevel})
                        </div>
                      ))}
                  </div>
                </div>
              )}
              {spares.length === 0 ? (
                <Empty
                  icon="⊟"
                  title="No parts registered"
                  desc="Track critical spares kept on-site so you know when stock is low before a breakdown forces an emergency procurement."
                  btn={
                    <Btn onClick={() => setModal("spare")}>Add First Part</Btn>
                  }
                />
              ) : (
                <Card>
                  <Tbl
                    cols={[
                      "Part Name",
                      "Part Number",
                      "Category",
                      "Supplier",
                      "Qty",
                      "Min Stock",
                      "Unit Cost",
                      "Total Value",
                      "Location",
                      "Status",
                      "Notes",
                      "",
                    ]}
                  >
                    {[...spares]
                      .sort((a, b) => {
                        const aAlert =
                          Number(a.quantity || 0) <=
                          Number(a.minStockLevel || 0);
                        const bAlert =
                          Number(b.quantity || 0) <=
                          Number(b.minStockLevel || 0);
                        return bAlert - aAlert;
                      })
                      .map((s, i) => {
                        const low =
                          Number(s.quantity || 0) <=
                            Number(s.minStockLevel || 0) &&
                          Number(s.minStockLevel || 0) > 0;
                        const out =
                          Number(s.quantity || 0) === 0 ||
                          s.status === "Out of Stock";
                        return (
                          <TR
                            key={s.id}
                            stripe={i % 2 !== 0}
                            cells={[
                              <span style={{ fontWeight: 700, color: C.text }}>
                                {s.partName}
                              </span>,
                              <span
                                style={{
                                  color: C.muted,
                                  fontSize: 12,
                                  fontFamily: "monospace",
                                }}
                              >
                                {s.partNumber || "—"}
                              </span>,
                              <Pill text={s.category} color="blue" />,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {s.supplier || "—"}
                              </span>,
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: out ? C.red : low ? C.warn : C.success,
                                  fontSize: 15,
                                  fontFamily: "'Barlow Condensed',sans-serif",
                                }}
                              >
                                {s.quantity || 0}
                              </span>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {s.minStockLevel || "—"}
                              </span>,
                              <span style={{ fontSize: 12 }}>
                                {s.unitCost ? fmt(s.unitCost) : "—"}
                              </span>,
                              <span style={{ fontWeight: 600 }}>
                                {s.unitCost
                                  ? fmt(
                                      Number(s.quantity || 0) *
                                        Number(s.unitCost)
                                    )
                                  : "—"}
                              </span>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {s.location}
                              </span>,
                              <Pill
                                text={
                                  out
                                    ? "Out of Stock"
                                    : low
                                    ? "Low Stock"
                                    : s.status
                                }
                                color={
                                  out
                                    ? "red"
                                    : low
                                    ? "yellow"
                                    : s.status === "Ordered"
                                    ? "blue"
                                    : "green"
                                }
                              />,
                              <span style={{ color: C.mutedLt, fontSize: 12 }}>
                                {s.notes || "—"}
                              </span>,
                              <button
                                onClick={() =>
                                  del("mcw_spares", setSpares, spares, s.id)
                                }
                                style={{
                                  color: C.muted,
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: 14,
                                  padding: "2px 6px",
                                }}
                              >
                                ×
                              </button>,
                            ]}
                          />
                        );
                      })}
                  </Tbl>
                </Card>
              )}
            </div>
          )}

          {/* WARRANTIES */}
          {tab === "Warranties" && (
            <div>
              <PageTitle
                title="WARRANTY TRACKER"
                sub="Track asset warranties so repairs can be claimed instead of paid"
                action={
                  can(currentUser, "canAdd") && (
                    <Btn onClick={() => setModal("warranty")}>
                      ＋ Add Warranty
                    </Btn>
                  )
                }
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))",
                  gap: 14,
                  marginBottom: 22,
                }}
              >
                <KPI
                  label="Total Warranties"
                  value={warranties.length}
                  color={C.info}
                  icon="⊛"
                />
                <KPI
                  label="Active"
                  value={
                    warranties.filter(
                      (w) =>
                        w.status === "Active" &&
                        (!w.expiryDate || w.expiryDate >= today())
                    ).length
                  }
                  color={C.success}
                  icon="✓"
                />
                <KPI
                  label="Expiring in 60 Days"
                  value={warrantiesExpiringSoon}
                  color={warrantiesExpiringSoon > 0 ? C.warn : C.success}
                  icon="⚐"
                />
                <KPI
                  label="Expired / Claimed"
                  value={
                    warranties.filter(
                      (w) =>
                        w.status === "Expired" ||
                        w.status === "Claimed" ||
                        w.expiryDate < today()
                    ).length
                  }
                  color={C.muted}
                  icon="⚑"
                />
              </div>
              {warrantiesExpired > 0 && (
                <div
                  style={{
                    background: C.warnBg,
                    border: `1px solid #FDE68A`,
                    borderRadius: 10,
                    padding: "14px 18px",
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: C.warn,
                      marginBottom: 8,
                    }}
                  >
                    ⚠ {warrantiesExpired} warranty
                    {warrantiesExpired !== 1
                      ? " records have"
                      : "record has"}{" "}
                    expired and may still show as Active — please update their
                    status.
                  </div>
                </div>
              )}
              {warranties.length === 0 ? (
                <Empty
                  icon="⊛"
                  title="No warranties registered"
                  desc="Track warranties so you know when a repair should be claimed under warranty rather than paid out of pocket."
                  btn={
                    <Btn onClick={() => setModal("warranty")}>
                      Add First Warranty
                    </Btn>
                  }
                />
              ) : (
                <Card>
                  <Tbl
                    cols={[
                      "Asset",
                      "Supplier / Dealer",
                      "Warranty No.",
                      "Start Date",
                      "Expiry Date",
                      "Days Left",
                      "Coverage",
                      "Status",
                      "Notes",
                      "",
                    ]}
                  >
                    {[...warranties]
                      .sort((a, b) => (a.expiryDate > b.expiryDate ? 1 : -1))
                      .map((w, i) => {
                        const asset = assets.find((a) => a.id === w.assetId);
                        const days = w.expiryDate
                          ? Math.round(
                              (new Date(w.expiryDate) - new Date()) /
                                (1000 * 60 * 60 * 24)
                            )
                          : null;
                        const expired = days !== null && days < 0;
                        const soon = days !== null && days >= 0 && days <= 60;
                        return (
                          <TR
                            key={w.id}
                            stripe={i % 2 !== 0}
                            cells={[
                              <div>
                                <div style={{ fontWeight: 700, color: C.text }}>
                                  {asset?.name || "—"}
                                </div>
                                <div style={{ fontSize: 11, color: C.mutedLt }}>
                                  {asset?.category || ""}
                                </div>
                              </div>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {w.supplier || "—"}
                              </span>,
                              <span
                                style={{
                                  color: C.muted,
                                  fontSize: 12,
                                  fontFamily: "monospace",
                                }}
                              >
                                {w.warrantyNumber || "—"}
                              </span>,
                              <span style={{ color: C.muted, fontSize: 12 }}>
                                {w.startDate || "—"}
                              </span>,
                              <span
                                style={{
                                  fontWeight: 600,
                                  color: expired
                                    ? C.red
                                    : soon
                                    ? C.warn
                                    : C.text,
                                  fontSize: 12,
                                }}
                              >
                                {w.expiryDate || "—"}
                              </span>,
                              <span
                                style={{
                                  fontWeight: 700,
                                  color: expired
                                    ? C.red
                                    : soon
                                    ? C.warn
                                    : C.success,
                                }}
                              >
                                {days === null
                                  ? "—"
                                  : expired
                                  ? `Expired ${Math.abs(days)}d ago`
                                  : days === 0
                                  ? "Today"
                                  : `${days}d`}
                              </span>,
                              <span
                                style={{
                                  color: C.muted,
                                  fontSize: 12,
                                  maxWidth: 160,
                                  display: "block",
                                }}
                              >
                                {w.coverageDetails || "—"}
                              </span>,
                              <Pill
                                text={expired ? "Expired" : w.status}
                                color={
                                  expired || w.status === "Expired"
                                    ? "red"
                                    : w.status === "Claimed"
                                    ? "blue"
                                    : soon
                                    ? "yellow"
                                    : "green"
                                }
                              />,
                              <span style={{ color: C.mutedLt, fontSize: 12 }}>
                                {w.notes || "—"}
                              </span>,
                              <button
                                onClick={() =>
                                  del(
                                    "mcw_warranties",
                                    setWarranties,
                                    warranties,
                                    w.id
                                  )
                                }
                                style={{
                                  color: C.muted,
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: 14,
                                  padding: "2px 6px",
                                }}
                              >
                                ×
                              </button>,
                            ]}
                          />
                        );
                      })}
                  </Tbl>
                </Card>
              )}
            </div>
          )}

          {/* SARS REPORT */}
          {tab === "SARSReport" && (
            <div>
              <PageTitle
                title="SARS SECTION 11(e) DEPRECIATION REPORT"
                sub="Wear-and-tear allowances at SARS-prescribed rates for income tax purposes"
              />
              <div
                style={{
                  background: C.infoBg,
                  border: `1px solid #BFDBFE`,
                  borderRadius: 10,
                  padding: "14px 18px",
                  marginBottom: 20,
                  fontSize: 12,
                  color: C.info,
                }}
              >
                <strong>Note:</strong> Section 11(e) of the Income Tax Act
                allows wear-and-tear deductions on qualifying assets used for
                trade. Rates are prescribed by SARS and differ from
                straight-line accounting depreciation. Always confirm with your
                tax practitioner before filing.
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))",
                  gap: 14,
                  marginBottom: 22,
                }}
              >
                <KPI
                  label="Total Assets"
                  value={assets.length}
                  color={C.info}
                  icon="▤"
                />
                <KPI
                  label="Total Cost"
                  value={fmt(totalCost)}
                  color={C.muted}
                  icon="₽"
                />
                <KPI
                  label="Total SARS Allowance (Year)"
                  value={fmt(
                    assets.reduce(
                      (s, a) =>
                        s +
                        (Number(a.purchaseCost || 0) *
                          (SARS_RATES[a.category] || 20)) /
                          100,
                      0
                    )
                  )}
                  color={C.success}
                  icon="₴"
                />
                <KPI
                  label="Total Straight-Line (Year)"
                  value={fmt(
                    assets.reduce(
                      (s, a) =>
                        s +
                        Number(a.purchaseCost || 0) /
                          (USEFUL_LIFE[a.category] || 5),
                      0
                    )
                  )}
                  color={C.warn}
                  icon="≋"
                />
              </div>
              {assets.length === 0 ? (
                <Empty
                  icon="₴"
                  title="No assets registered"
                  desc="Register assets to generate the SARS Section 11(e) depreciation report."
                  btn={
                    <Btn onClick={() => setTab("Assets")}>
                      Go to Asset Register
                    </Btn>
                  }
                />
              ) : (
                <Card
                  title="SARS Section 11(e) Wear-and-Tear Schedule"
                  sub="For income tax submission purposes — Mapitsi Civil Works"
                >
                  <Tbl
                    cols={[
                      "Asset",
                      "Category",
                      "Purchase Date",
                      "Purchase Cost",
                      "SARS Rate",
                      "Annual Allowance",
                      "Straight-Line Rate",
                      "Straight-Line Annual",
                      "Difference",
                      "Note",
                    ]}
                  >
                    {assets.map((a, i) => {
                      const sarsRate = SARS_RATES[a.category] || 20;
                      const slRate = (1 / (USEFUL_LIFE[a.category] || 5)) * 100;
                      const sarsAnnual =
                        (Number(a.purchaseCost || 0) * sarsRate) / 100;
                      const slAnnual =
                        Number(a.purchaseCost || 0) /
                        (USEFUL_LIFE[a.category] || 5);
                      const diff = sarsAnnual - slAnnual;
                      return (
                        <TR
                          key={a.id}
                          stripe={i % 2 !== 0}
                          cells={[
                            <span style={{ fontWeight: 700, color: C.text }}>
                              {a.name}
                            </span>,
                            <span style={{ color: C.muted, fontSize: 12 }}>
                              {a.category}
                            </span>,
                            <span style={{ color: C.muted, fontSize: 12 }}>
                              {a.purchaseDate}
                            </span>,
                            <span style={{ fontWeight: 600 }}>
                              {fmt(a.purchaseCost)}
                            </span>,
                            <span style={{ color: C.success, fontWeight: 700 }}>
                              {sarsRate}%
                            </span>,
                            <span
                              style={{
                                fontWeight: 800,
                                color: C.success,
                                fontFamily: "'Barlow Condensed',sans-serif",
                                fontSize: 15,
                              }}
                            >
                              {fmt(sarsAnnual)}
                            </span>,
                            <span style={{ color: C.muted, fontSize: 12 }}>
                              {slRate.toFixed(1)}%
                            </span>,
                            <span style={{ color: C.warn, fontSize: 12 }}>
                              {fmt(slAnnual)}
                            </span>,
                            <span
                              style={{
                                fontWeight: 600,
                                color:
                                  diff > 0
                                    ? C.success
                                    : diff < 0
                                    ? C.red
                                    : C.muted,
                                fontSize: 12,
                              }}
                            >
                              {diff > 0 ? "+" : ""}
                              {fmt(diff)}
                            </span>,
                            <span style={{ color: C.mutedLt, fontSize: 11 }}>
                              {sarsRate > slRate
                                ? "SARS more favourable"
                                : sarsRate < slRate
                                ? "Straight-line more favourable"
                                : "Equal"}
                            </span>,
                          ]}
                        />
                      );
                    })}
                    <TR
                      stripe={false}
                      cells={[
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: 12,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                            color: C.text,
                          }}
                        >
                          TOTALS
                        </span>,
                        <span />,
                        <span />,
                        <span style={{ fontWeight: 800 }}>
                          {fmt(totalCost)}
                        </span>,
                        <span />,
                        <span style={{ fontWeight: 800, color: C.success }}>
                          {fmt(
                            assets.reduce(
                              (s, a) =>
                                s +
                                (Number(a.purchaseCost || 0) *
                                  (SARS_RATES[a.category] || 20)) /
                                  100,
                              0
                            )
                          )}
                        </span>,
                        <span />,
                        <span style={{ fontWeight: 800, color: C.warn }}>
                          {fmt(
                            assets.reduce(
                              (s, a) =>
                                s +
                                Number(a.purchaseCost || 0) /
                                  (USEFUL_LIFE[a.category] || 5),
                              0
                            )
                          )}
                        </span>,
                        <span style={{ fontWeight: 800, color: C.success }}>
                          {fmt(
                            assets.reduce(
                              (s, a) =>
                                s +
                                (Number(a.purchaseCost || 0) *
                                  (SARS_RATES[a.category] || 20)) /
                                  100 -
                                Number(a.purchaseCost || 0) /
                                  (USEFUL_LIFE[a.category] || 5),
                              0
                            )
                          )}
                        </span>,
                        <span />,
                      ]}
                    />
                  </Tbl>
                  <div
                    style={{
                      padding: "16px 20px",
                      borderTop: `1px solid ${C.border}`,
                      display: "flex",
                      gap: 10,
                    }}
                  >
                    <Btn onClick={() => window.print()} variant="outline">
                      ⬒ Print Report
                    </Btn>
                    <Btn
                      onClick={() => {
                        const wb = XLSX.utils.book_new();
                        const rows = assets.map((a) => {
                          const sarsRate = SARS_RATES[a.category] || 20;
                          const slRate =
                            (1 / (USEFUL_LIFE[a.category] || 5)) * 100;
                          const sarsAnnual =
                            (Number(a.purchaseCost || 0) * sarsRate) / 100;
                          const slAnnual =
                            Number(a.purchaseCost || 0) /
                            (USEFUL_LIFE[a.category] || 5);
                          return {
                            Asset: a.name,
                            Category: a.category,
                            "Purchase Date": a.purchaseDate,
                            "Purchase Cost (R)": Number(a.purchaseCost || 0),
                            "SARS Rate %": sarsRate,
                            "SARS Annual Allowance (R)": parseFloat(
                              sarsAnnual.toFixed(2)
                            ),
                            "Straight-Line Rate %": parseFloat(
                              slRate.toFixed(1)
                            ),
                            "Straight-Line Annual (R)": parseFloat(
                              slAnnual.toFixed(2)
                            ),
                            "Difference (R)": parseFloat(
                              (sarsAnnual - slAnnual).toFixed(2)
                            ),
                            Note:
                              sarsRate > slRate
                                ? "SARS more favourable"
                                : sarsRate < slRate
                                ? "Straight-line more favourable"
                                : "Equal",
                          };
                        });
                        XLSX.utils.book_append_sheet(
                          wb,
                          XLSX.utils.json_to_sheet(rows),
                          "SARS 11(e) Report"
                        );
                        XLSX.writeFile(wb, `Mapitsi_SARS_11e_${today()}.xlsx`);
                      }}
                      variant="ghost"
                    >
                      📊 Export to Excel
                    </Btn>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* BULK IMPORT */}
          {tab === "Import" && (
            <div>
              <PageTitle
                title="BULK EXCEL IMPORT"
                sub="Import existing records from a spreadsheet into the system"
              />
              <div
                style={{
                  background: C.infoBg,
                  border: `1px solid #BFDBFE`,
                  borderRadius: 10,
                  padding: "14px 18px",
                  marginBottom: 20,
                  fontSize: 12,
                  color: C.info,
                }}
              >
                <strong>How it works:</strong> Select a data type, download the
                template, fill it in, then upload it here. The system will
                preview your data before importing. All existing records are
                preserved — this only adds new ones.
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 18,
                  marginBottom: 22,
                }}
              >
                <Card
                  title="Step 1 — Download Template"
                  sub="Get the correct column format for your data type"
                >
                  <div style={{ padding: "20px" }}>
                    <Field label="Select Data Type">
                      <select
                        {...inp}
                        value={importType}
                        onChange={(e) => {
                          setImportType(e.target.value);
                          setImportPreview(null);
                          setImportStatus(null);
                        }}
                      >
                        <option value="assets">Assets</option>
                        <option value="employees">Employees</option>
                        <option value="suppliers">Suppliers</option>
                        <option value="spares">Parts & Spares</option>
                      </select>
                    </Field>
                    <Btn
                      variant="outline"
                      onClick={() => {
                        const templates = {
                          assets: [
                            {
                              "Asset Name": "Toyota Hilux",
                              Category: "Vehicle",
                              "Serial No": "DKT123GP",
                              "Purchase Date": "2022-01-15",
                              "Purchase Cost (R)": 450000,
                              Location: "Head Office",
                              "Assigned To": "John Smith",
                              Status: "Active",
                            },
                          ],
                          employees: [
                            {
                              "Full Name": "Sipho Dlamini",
                              "SA ID Number": "8001015009087",
                              Role: "TLB Operator",
                              Site: "Site A",
                              "Contact Number": "082 123 4567",
                              "Start Date": "2021-03-01",
                              Status: "Active",
                              Notes: "",
                            },
                          ],
                          suppliers: [
                            {
                              "Supplier Name": "ABC Auto Services",
                              Type: "Service & Repairs",
                              "Contact Person": "John Mokoena",
                              Phone: "011 123 4567",
                              Email: "john@abc.co.za",
                              Address: "12 Industrial Rd, Pretoria",
                              Notes: "",
                            },
                          ],
                          spares: [
                            {
                              "Part Name": "Oil Filter",
                              "Part Number": "OF-001",
                              Category: "Filters",
                              Supplier: "ABC Parts",
                              Quantity: 10,
                              "Min Stock Level": 3,
                              "Unit Cost (R)": 150,
                              Location: "Workshop",
                              Status: "In Stock",
                              Notes: "",
                            },
                          ],
                        };
                        const wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(
                          wb,
                          XLSX.utils.json_to_sheet(templates[importType]),
                          importType.charAt(0).toUpperCase() +
                            importType.slice(1)
                        );
                        XLSX.writeFile(
                          wb,
                          `Mapitsi_Import_Template_${importType}.xlsx`
                        );
                      }}
                    >
                      ⬇ Download Template
                    </Btn>
                  </div>
                </Card>
                <Card
                  title="Step 2 — Upload Your File"
                  sub="Select your filled-in template to preview"
                >
                  <div style={{ padding: "20px" }}>
                    <div
                      style={{
                        border: `2px dashed ${C.border}`,
                        borderRadius: 8,
                        padding: "28px 20px",
                        textAlign: "center",
                        marginBottom: 14,
                      }}
                    >
                      <div
                        style={{ fontSize: 28, marginBottom: 8, opacity: 0.3 }}
                      >
                        ⊕
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: C.muted,
                          marginBottom: 12,
                        }}
                      >
                        Select your completed Excel file
                      </div>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          setImportStatus("reading");
                          try {
                            const ab = await file.arrayBuffer();
                            const wb = XLSX.read(ab, { type: "array" });
                            const ws = wb.Sheets[wb.SheetNames[0]];
                            const data = XLSX.utils.sheet_to_json(ws);
                            setImportPreview(data.slice(0, 10));
                            setImportStatus(data.length > 0 ? "ready" : null);
                            e.target._fullData = data;
                          } catch {
                            setImportStatus("error");
                          }
                        }}
                        style={{
                          display: "block",
                          margin: "0 auto",
                          cursor: "pointer",
                          fontSize: 13,
                          fontFamily: "'DM Sans',sans-serif",
                        }}
                      />
                    </div>
                    {importStatus === "error" && (
                      <div
                        style={{
                          color: C.red,
                          fontSize: 12,
                          fontWeight: 600,
                          marginBottom: 8,
                        }}
                      >
                        ⚠ Could not read file. Make sure it is a valid .xlsx or
                        .csv file.
                      </div>
                    )}
                    {importStatus === "reading" && (
                      <div
                        style={{
                          color: C.muted,
                          fontSize: 12,
                          marginBottom: 8,
                        }}
                      >
                        Reading file...
                      </div>
                    )}
                  </div>
                </Card>
              </div>
              {importPreview && importPreview.length > 0 && (
                <Card
                  title={`Preview — First ${Math.min(
                    importPreview.length,
                    10
                  )} rows of your file`}
                  sub="Check the data looks correct before importing"
                >
                  <div style={{ overflowX: "auto", padding: "0 0 8px" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: 12,
                      }}
                    >
                      <thead>
                        <tr style={{ background: C.surface }}>
                          {Object.keys(importPreview[0]).map((k) => (
                            <th
                              key={k}
                              style={{
                                padding: "8px 12px",
                                textAlign: "left",
                                color: C.muted,
                                fontWeight: 700,
                                fontSize: 10,
                                textTransform: "uppercase",
                                borderBottom: `1px solid ${C.border}`,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {k}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.map((row, i) => (
                          <tr
                            key={i}
                            style={{
                              background: i % 2 === 0 ? C.white : C.surface,
                              borderBottom: `1px solid ${C.border}`,
                            }}
                          >
                            {Object.values(row).map((v, j) => (
                              <td
                                key={j}
                                style={{
                                  padding: "8px 12px",
                                  color: C.text,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {String(v || "—")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div
                    style={{
                      padding: "16px 20px",
                      borderTop: `1px solid ${C.border}`,
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <Btn
                      onClick={(e) => {
                        const input =
                          document.querySelector('input[type="file"]');
                        const fullData = input?._fullData || importPreview;
                        let imported = 0;
                        if (importType === "assets") {
                          const newItems = fullData.map((r) => ({
                            id:
                              Date.now().toString() +
                              Math.random().toString(36).slice(2),
                            name: r["Asset Name"] || "",
                            category: r["Category"] || "Vehicle",
                            serialNumber: r["Serial No"] || "",
                            purchaseDate: r["Purchase Date"]?.toString() || "",
                            purchaseCost: r["Purchase Cost (R)"] || 0,
                            location: r["Location"] || "Head Office",
                            assignedTo: r["Assigned To"] || "",
                            status: r["Status"] || "Active",
                          }));
                          const updated = [...assets, ...newItems];
                          setAssets(updated);
                          persist("mcw_assets", updated);
                          imported = newItems.length;
                        } else if (importType === "employees") {
                          const newItems = fullData.map((r) => ({
                            id:
                              Date.now().toString() +
                              Math.random().toString(36).slice(2),
                            name: r["Full Name"] || "",
                            idNumber: r["SA ID Number"]?.toString() || "",
                            role: r["Role"] || "General Worker",
                            site: r["Site"] || "Head Office",
                            contactNumber:
                              r["Contact Number"]?.toString() || "",
                            startDate: r["Start Date"]?.toString() || "",
                            status: r["Status"] || "Active",
                            notes: r["Notes"] || "",
                          }));
                          const updated = [...employees, ...newItems];
                          setEmployees(updated);
                          persist("mcw_employees", updated);
                          imported = newItems.length;
                        } else if (importType === "suppliers") {
                          const newItems = fullData.map((r) => ({
                            id:
                              Date.now().toString() +
                              Math.random().toString(36).slice(2),
                            name: r["Supplier Name"] || "",
                            type: r["Type"] || "Other",
                            contactPerson: r["Contact Person"] || "",
                            phone: r["Phone"]?.toString() || "",
                            email: r["Email"] || "",
                            address: r["Address"] || "",
                            notes: r["Notes"] || "",
                          }));
                          const updated = [...suppliers, ...newItems];
                          setSuppliers(updated);
                          persist("mcw_suppliers", updated);
                          imported = newItems.length;
                        } else if (importType === "spares") {
                          const newItems = fullData.map((r) => ({
                            id:
                              Date.now().toString() +
                              Math.random().toString(36).slice(2),
                            partName: r["Part Name"] || "",
                            partNumber: r["Part Number"]?.toString() || "",
                            category: r["Category"] || "Other",
                            supplier: r["Supplier"] || "",
                            quantity: r["Quantity"] || 0,
                            minStockLevel: r["Min Stock Level"] || 0,
                            unitCost: r["Unit Cost (R)"] || 0,
                            location: r["Location"] || "Workshop",
                            status: r["Status"] || "In Stock",
                            notes: r["Notes"] || "",
                          }));
                          const updated = [...spares, ...newItems];
                          setSpares(updated);
                          persist("mcw_spares", updated);
                          imported = newItems.length;
                        }
                        setImportStatus("done");
                        setImportPreview(null);
                        alert(
                          `✓ Successfully imported ${imported} ${importType} record${
                            imported !== 1 ? "s" : ""
                          }. All records have been added to the register.`
                        );
                      }}
                    >
                      ✓ Import {importPreview.length} Record
                      {importPreview.length !== 1 ? "s" : ""}
                    </Btn>
                    <Btn
                      variant="ghost"
                      onClick={() => {
                        setImportPreview(null);
                        setImportStatus(null);
                      }}
                    >
                      Cancel
                    </Btn>
                    <span
                      style={{ fontSize: 12, color: C.muted, marginLeft: 8 }}
                    >
                      This will add {importPreview.length} new record
                      {importPreview.length !== 1 ? "s" : ""} to {importType}.
                      Existing data will not be changed.
                    </span>
                  </div>
                </Card>
              )}
              {importStatus === "done" && !importPreview && (
                <div
                  style={{
                    background: C.successBg,
                    border: `1px solid #A7F3D0`,
                    borderRadius: 10,
                    padding: "16px 20px",
                    fontSize: 13,
                    color: C.success,
                    fontWeight: 600,
                  }}
                >
                  ✓ Import complete. Your records have been added to the system.
                  You can import more data above.
                </div>
              )}
            </div>
          )}
          {/* NOTIFICATION CENTRE */}
          {tab === "Alerts" && (
            <div>
              <PageTitle
                title="NOTIFICATION CENTRE"
                sub="Every alert across all modules — ranked by urgency"
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <KPI
                  label="Critical"
                  value={
                    allAlerts.filter((a) => a.severity === "critical").length
                  }
                  color={C.red}
                  icon="⚑"
                  sub="Requires immediate action"
                />
                <KPI
                  label="Warnings"
                  value={
                    allAlerts.filter((a) => a.severity === "warning").length
                  }
                  color={C.warn}
                  icon="⚐"
                  sub="Requires attention soon"
                />
                <KPI
                  label="Info"
                  value={allAlerts.filter((a) => a.severity === "info").length}
                  color={C.info}
                  icon="ℹ"
                  sub="For your awareness"
                />
                <KPI
                  label="Total Alerts"
                  value={allAlerts.length}
                  color={C.muted}
                  icon="≡"
                  sub="Across all modules"
                />
              </div>
              {allAlerts.length === 0 ? (
                <div
                  style={{
                    background: C.successBg,
                    border: `1px solid #A7F3D0`,
                    borderRadius: 10,
                    padding: "32px",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: C.success,
                      marginBottom: 6,
                    }}
                  >
                    All Clear
                  </div>
                  <div style={{ fontSize: 13, color: C.muted }}>
                    No alerts across any module. The system is fully up to date.
                  </div>
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {allAlerts.map((alert) => {
                    const sevStyle = {
                      critical: {
                        bg: C.redLight,
                        border: C.redBorder,
                        dot: C.red,
                        label: "CRITICAL",
                        labelBg: "#DC2626",
                      },
                      warning: {
                        bg: C.warnBg,
                        border: "#FDE68A",
                        dot: C.warn,
                        label: "WARNING",
                        labelBg: C.warn,
                      },
                      info: {
                        bg: C.infoBg,
                        border: "#BFDBFE",
                        dot: C.info,
                        label: "INFO",
                        labelBg: C.info,
                      },
                    }[alert.severity];
                    return (
                      <div
                        key={alert.id}
                        style={{
                          background: sevStyle.bg,
                          border: `1px solid ${sevStyle.border}`,
                          borderRadius: 10,
                          padding: "14px 18px",
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          cursor: "pointer",
                          transition: "box-shadow 0.15s",
                        }}
                        onClick={() => setTab(alert.tab)}
                      >
                        <div
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background: sevStyle.dot,
                            flexShrink: 0,
                          }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              marginBottom: 3,
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 700,
                                color: "white",
                                background: sevStyle.labelBg,
                                padding: "2px 8px",
                                borderRadius: 20,
                                letterSpacing: 0.5,
                              }}
                            >
                              {sevStyle.label}
                            </span>
                            <span
                              style={{
                                fontSize: 10,
                                fontWeight: 600,
                                color: sevStyle.dot,
                                background: "rgba(0,0,0,0.06)",
                                padding: "2px 8px",
                                borderRadius: 20,
                              }}
                            >
                              {alert.module}
                            </span>
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: C.text,
                              }}
                            >
                              {alert.title}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              color: C.muted,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {alert.desc}
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: C.mutedLt,
                            flexShrink: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span>{alert.tab}</span>
                          <span style={{ fontSize: 14 }}>→</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* PROJECT COST REPORT */}
          {tab === "ProjectCost" && (
            <div>
              <PageTitle
                title="PROJECT COST REPORT"
                sub="Total spend per contract vs contract value — fuel, maintenance and hire"
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <KPI
                  label="Active Projects"
                  value={projects.filter((p) => p.status === "Active").length}
                  color={C.info}
                  icon="⊕"
                />
                <KPI
                  label="Total Contract Value"
                  value={fmt(
                    projects.reduce(
                      (s, p) => s + Number(p.contractValue || 0),
                      0
                    )
                  )}
                  color={C.success}
                  icon="₽"
                />
                <KPI
                  label="Total Costs Allocated"
                  value={fmt(
                    projects.reduce((s, p) => {
                      const sp = getProjectSpend(p.id);
                      return s + sp.total;
                    }, 0)
                  )}
                  color={C.warn}
                  icon="₽"
                />
                <KPI
                  label="Projects Over Budget"
                  value={
                    projects.filter((p) => {
                      const sp = getProjectSpend(p.id);
                      return (
                        sp.total > Number(p.contractValue || 0) &&
                        Number(p.contractValue || 0) > 0
                      );
                    }).length
                  }
                  color={C.red}
                  icon="⚑"
                />
              </div>
              {projects.length === 0 ? (
                <Empty
                  icon="₱"
                  title="No projects registered"
                  desc="Register projects and allocate maintenance, fuel and hire costs to see per-project profitability."
                  btn={
                    <Btn onClick={() => setTab("Projects")}>Go to Projects</Btn>
                  }
                />
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  {[...projects]
                    .sort((a, b) => (a.status === "Active" ? -1 : 1))
                    .map((p, i) => {
                      const sp = getProjectSpend(p.id);
                      const contractVal = Number(p.contractValue || 0);
                      const margin =
                        contractVal > 0 ? contractVal - sp.total : null;
                      const marginPct =
                        contractVal > 0
                          ? ((contractVal - sp.total) / contractVal) * 100
                          : null;
                      const over = contractVal > 0 && sp.total > contractVal;
                      const usagePct =
                        contractVal > 0
                          ? Math.min(100, (sp.total / contractVal) * 100)
                          : 0;
                      return (
                        <Card key={p.id}>
                          <div style={{ padding: "18px 22px" }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                marginBottom: 14,
                                flexWrap: "wrap",
                                gap: 10,
                              }}
                            >
                              <div>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    marginBottom: 4,
                                  }}
                                >
                                  <span
                                    style={{
                                      fontSize: 16,
                                      fontWeight: 800,
                                      color: C.text,
                                    }}
                                  >
                                    {p.name}
                                  </span>
                                  {p.code && (
                                    <span
                                      style={{
                                        fontSize: 11,
                                        color: C.muted,
                                        fontFamily: "monospace",
                                        background: C.surface,
                                        padding: "2px 8px",
                                        borderRadius: 4,
                                      }}
                                    >
                                      {p.code}
                                    </span>
                                  )}
                                  <Pill
                                    text={p.status}
                                    color={
                                      p.status === "Active"
                                        ? "green"
                                        : p.status === "Completed"
                                        ? "blue"
                                        : p.status === "On Hold"
                                        ? "yellow"
                                        : "gray"
                                    }
                                  />
                                </div>
                                <div style={{ fontSize: 12, color: C.muted }}>
                                  {p.site}
                                  {p.startDate
                                    ? " · Started " + p.startDate
                                    : ""}
                                </div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                {contractVal > 0 ? (
                                  <>
                                    <div
                                      style={{
                                        fontSize: 11,
                                        color: C.muted,
                                        marginBottom: 2,
                                      }}
                                    >
                                      Contract Value
                                    </div>
                                    <div
                                      style={{
                                        fontSize: 20,
                                        fontWeight: 800,
                                        color: C.success,
                                        fontFamily:
                                          "'Barlow Condensed',sans-serif",
                                      }}
                                    >
                                      {fmt(contractVal)}
                                    </div>
                                  </>
                                ) : (
                                  <div
                                    style={{ fontSize: 12, color: C.mutedLt }}
                                  >
                                    No contract value set
                                  </div>
                                )}
                              </div>
                            </div>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(auto-fit,minmax(130px,1fr))",
                                gap: 10,
                                marginBottom: 14,
                              }}
                            >
                              {[
                                { l: "Maintenance", v: sp.maint, c: "#7c3aed" },
                                { l: "Fuel", v: sp.fuel, c: C.warn },
                                { l: "Equipment Hire", v: sp.hire, c: C.info },
                                {
                                  l: "Total Spend",
                                  v: sp.total,
                                  c: over ? C.red : C.text,
                                  bold: true,
                                },
                              ].map((s) => (
                                <div
                                  key={s.l}
                                  style={{
                                    background: C.surface,
                                    borderRadius: 7,
                                    padding: "10px 12px",
                                    borderLeft: `3px solid ${s.c}`,
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: 9,
                                      color: C.muted,
                                      textTransform: "uppercase",
                                      letterSpacing: 0.5,
                                      marginBottom: 3,
                                    }}
                                  >
                                    {s.l}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: 15,
                                      fontWeight: s.bold ? 800 : 600,
                                      color: s.c,
                                      fontFamily:
                                        "'Barlow Condensed',sans-serif",
                                    }}
                                  >
                                    {fmt(s.v)}
                                  </div>
                                </div>
                              ))}
                            </div>
                            {contractVal > 0 && (
                              <>
                                <div style={{ marginBottom: 8 }}>
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      fontSize: 11,
                                      color: C.muted,
                                      marginBottom: 4,
                                    }}
                                  >
                                    <span>Budget consumed</span>
                                    <span
                                      style={{
                                        fontWeight: 700,
                                        color: over ? C.red : C.success,
                                      }}
                                    >
                                      {usagePct.toFixed(1)}%
                                    </span>
                                  </div>
                                  <div
                                    style={{
                                      height: 8,
                                      background: C.border,
                                      borderRadius: 4,
                                    }}
                                  >
                                    <div
                                      style={{
                                        height: "100%",
                                        background: over
                                          ? C.red
                                          : usagePct > 80
                                          ? C.warn
                                          : C.success,
                                        borderRadius: 4,
                                        width: `${Math.min(100, usagePct)}%`,
                                        transition: "width 0.5s",
                                      }}
                                    />
                                  </div>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <div style={{ fontSize: 12, color: C.muted }}>
                                    {over ? (
                                      <span
                                        style={{
                                          color: C.red,
                                          fontWeight: 700,
                                        }}
                                      >
                                        ⚠ Over budget by{" "}
                                        {fmt(sp.total - contractVal)}
                                      </span>
                                    ) : (
                                      <span style={{ color: C.success }}>
                                        ✓ {fmt(margin || 0)} remaining (
                                        {marginPct?.toFixed(1)}% margin)
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: 11, color: C.muted }}>
                                    {
                                      maint.filter((m) => m.projectId === p.id)
                                        .length
                                    }{" "}
                                    maint ·{" "}
                                    {
                                      fuel.filter((f) => f.projectId === p.id)
                                        .length
                                    }{" "}
                                    fuel ·{" "}
                                    {
                                      hires.filter((h) => h.projectId === p.id)
                                        .length
                                    }{" "}
                                    hire records
                                  </div>
                                </div>
                              </>
                            )}
                            {sp.total === 0 && (
                              <div
                                style={{
                                  fontSize: 12,
                                  color: C.mutedLt,
                                  fontStyle: "italic",
                                }}
                              >
                                No costs allocated to this project yet. Link
                                maintenance, fuel and hire records to this
                                project when logging them.
                              </div>
                            )}
                          </div>
                        </Card>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* ASSET UTILISATION */}
          {tab === "Utilisation" && (
            <div>
              <PageTitle
                title="ASSET UTILISATION REPORT"
                sub="Cost per operating hour, total spend and downtime per asset"
              />
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <KPI
                  label="Assets Tracked"
                  value={assets.filter((a) => a.status === "Active").length}
                  color={C.info}
                  icon="▤"
                />
                <KPI
                  label="Total Fleet Cost"
                  value={fmt(
                    assets.reduce((a, x) => {
                      const u = getAssetUtilisation(x.id);
                      return a + u.totalCostAsset;
                    }, 0)
                  )}
                  color={C.muted}
                  icon="₽"
                  sub="fuel + maintenance"
                />
                <KPI
                  label="Total Downtime"
                  value={`${assets
                    .reduce((a, x) => {
                      const u = getAssetUtilisation(x.id);
                      return a + u.downtime;
                    }, 0)
                    .toFixed(1)} hrs`}
                  color={C.warn}
                  icon="◷"
                />
                <KPI
                  label="Idle Assets"
                  value={
                    assets.filter((a) => {
                      const u = getAssetUtilisation(a.id);
                      return (
                        u.fuelRecords === 0 &&
                        u.maintRecords === 0 &&
                        a.status === "Active"
                      );
                    }).length
                  }
                  color={C.red}
                  sub="no fuel or maint logged"
                  icon="⊘"
                />
              </div>
              {assets.length === 0 ? (
                <Empty
                  icon="◎"
                  title="No assets registered"
                  desc="Register assets and log fuel and maintenance to see utilisation analysis."
                  btn={<Btn onClick={() => setTab("Assets")}>Go to Assets</Btn>}
                />
              ) : (
                <Card>
                  <Tbl
                    cols={[
                      "Asset",
                      "Category",
                      "Status",
                      "Fuel Cost",
                      "Maint. Cost",
                      "Total Cost",
                      "Odometer / Hrs",
                      "Cost / Hour",
                      "Downtime",
                      "Records",
                      "Efficiency",
                    ]}
                  >
                    {[...assets].map((a) => {
                      const u = getAssetUtilisation(a.id);
                      const idle =
                        u.fuelRecords === 0 &&
                        u.maintRecords === 0 &&
                        a.status === "Active";
                      const highCost =
                        u.costPerHour > 0 &&
                        u.costPerHour >
                          assets
                            .filter((x) => {
                              const y = getAssetUtilisation(x.id);
                              return y.costPerHour > 0;
                            })
                            .reduce((s, x, _, arr) => {
                              const y = getAssetUtilisation(x.id);
                              return s + y.costPerHour / arr.length;
                            }, 0) *
                            1.5;
                      return (
                        <TR
                          key={a.id}
                          stripe={assets.indexOf(a) % 2 !== 0}
                          cells={[
                            <div>
                              <div
                                style={{
                                  fontWeight: 700,
                                  color: C.text,
                                  fontSize: 12,
                                }}
                              >
                                {a.name}
                              </div>
                              <div
                                style={{
                                  fontSize: 10,
                                  color: C.mutedLt,
                                  fontFamily: "monospace",
                                }}
                              >
                                {a.serialNumber || ""}
                              </div>
                            </div>,
                            <span style={{ color: C.muted, fontSize: 11 }}>
                              {a.category}
                            </span>,
                            <Pill
                              text={a.status}
                              color={
                                a.status === "Active"
                                  ? "green"
                                  : a.status === "Under Maintenance"
                                  ? "yellow"
                                  : "gray"
                              }
                            />,
                            <span
                              style={{
                                fontWeight: 600,
                                color: C.warn,
                                fontSize: 12,
                              }}
                            >
                              {u.fuelCost > 0 ? fmt(u.fuelCost) : "—"}
                            </span>,
                            <span
                              style={{
                                fontWeight: 600,
                                color: "#7c3aed",
                                fontSize: 12,
                              }}
                            >
                              {u.maintCost > 0 ? fmt(u.maintCost) : "—"}
                            </span>,
                            <span
                              style={{
                                fontWeight: 800,
                                color:
                                  u.totalCostAsset > 0 ? C.text : C.mutedLt,
                                fontSize: 12,
                              }}
                            >
                              {u.totalCostAsset > 0
                                ? fmt(u.totalCostAsset)
                                : "—"}
                            </span>,
                            <span style={{ color: C.muted, fontSize: 11 }}>
                              {u.hoursReading > 0
                                ? u.hoursReading.toLocaleString()
                                : "—"}
                            </span>,
                            <span
                              style={{
                                fontWeight: 700,
                                color: highCost
                                  ? C.red
                                  : u.costPerHour > 0
                                  ? C.success
                                  : C.mutedLt,
                                fontSize: 12,
                              }}
                            >
                              {u.costPerHour > 0
                                ? `R ${u.costPerHour.toFixed(0)}/hr`
                                : "—"}
                            </span>,
                            <span
                              style={{
                                color: u.downtime > 0 ? C.warn : C.muted,
                                fontWeight: u.downtime > 0 ? 700 : 400,
                                fontSize: 12,
                              }}
                            >
                              {u.downtime > 0
                                ? `${u.downtime.toFixed(1)} hrs`
                                : "—"}
                            </span>,
                            <div style={{ fontSize: 11, color: C.muted }}>
                              <div>{u.fuelRecords} fuel</div>
                              <div>{u.maintRecords} maint</div>
                            </div>,
                            idle ? (
                              <Pill text="Idle" color="gray" />
                            ) : highCost ? (
                              <Pill text="High Cost" color="red" />
                            ) : u.totalCostAsset > 0 ? (
                              <Pill text="Active" color="green" />
                            ) : (
                              <span style={{ color: C.mutedLt, fontSize: 11 }}>
                                No data
                              </span>
                            ),
                          ]}
                        />
                      );
                    })}
                  </Tbl>
                </Card>
              )}
              {assets.filter((a) => {
                const u = getAssetUtilisation(a.id);
                return (
                  u.fuelRecords === 0 &&
                  u.maintRecords === 0 &&
                  a.status === "Active"
                );
              }).length > 0 && (
                <div
                  style={{
                    marginTop: 14,
                    background: C.warnBg,
                    border: `1px solid #FDE68A`,
                    borderRadius: 10,
                    padding: "14px 18px",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: C.warn,
                      marginBottom: 8,
                    }}
                  >
                    ⚠ Idle Assets — No fuel or maintenance logged
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {assets
                      .filter((a) => {
                        const u = getAssetUtilisation(a.id);
                        return (
                          u.fuelRecords === 0 &&
                          u.maintRecords === 0 &&
                          a.status === "Active"
                        );
                      })
                      .map((a) => (
                        <div
                          key={a.id}
                          style={{
                            background: C.white,
                            border: `1px solid #FDE68A`,
                            borderRadius: 7,
                            padding: "6px 12px",
                            fontSize: 12,
                          }}
                        >
                          <span style={{ fontWeight: 600, color: C.text }}>
                            {a.name}
                          </span>
                          <span style={{ color: C.muted, marginLeft: 6 }}>
                            {a.category}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* ASSET TRANSFER LOG */}
          {tab === "Transfers" && (
            <div>
              <PageTitle
                title="ASSET TRANSFER LOG"
                sub="Full site-to-site movement history for every asset in the fleet"
                action={
                  can(currentUser,"canAdd") && (
                    <Btn onClick={()=>{ setTransF(dTrans); setModal("transfer"); }}>
                      ＋ Log Transfer
                    </Btn>
                  )
                }
              />

              {/* KPI STRIP */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",gap:12,marginBottom:20}}>
                <KPI
                  label="Total Transfers"
                  value={transfers.length}
                  color={C.info} icon="⇄"
                  sub="all time"
                />
                <KPI
                  label="This Month"
                  value={transfers.filter(t=>t.transferDate?.startsWith(month)).length}
                  color={C.muted} icon="◷"
                  sub={monthLabel(month)}
                />
                <KPI
                  label="Stationary 6+ Months"
                  value={assets.filter(a=>{
                    if(a.status!=="Active") return false;
                    const days=getDaysSinceLastTransfer(a.id);
                    return days!==null && days>180;
                  }).length}
                  color={C.warn} icon="⊘"
                  sub="may need redeployment"
                />
                <KPI
                  label="Condition Issues"
                  value={transfers.filter(t=>t.conditionAtTransfer==="Poor — Noted"||t.conditionAtTransfer==="Damaged — Report Filed").length}
                  color={transfers.filter(t=>t.conditionAtTransfer==="Poor — Noted"||t.conditionAtTransfer==="Damaged — Report Filed").length>0?C.red:C.success}
                  icon="⚑"
                  sub="transfers with damage noted"
                />
                <KPI
                  label="Assets With History"
                  value={new Set(transfers.map(t=>t.assetId)).size}
                  color={C.success} icon="▤"
                  sub="tracked assets"
                />
              </div>

              {/* CURRENT FLEET POSITIONS */}
              <div style={{marginBottom:20}}>
                <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:12}}>
                  Current Fleet Positions
                  <span style={{fontSize:11,color:C.muted,fontWeight:400,marginLeft:8}}>
                    — based on most recent transfer or registered location
                  </span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:10}}>
                  {siteNames.map(site=>{
                    const assetsAtSite = assets.filter(a=>{
                      if(a.status==="Disposed") return false;
                      return getAssetCurrentSite(a) === site;
                    });
                    if(assetsAtSite.length===0) return null;
                    return (
                      <div key={site} style={{background:C.white,borderRadius:9,border:`1px solid ${C.border}`,padding:"13px 15px",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                          <div style={{fontWeight:700,fontSize:12,color:C.text}}>{site}</div>
                          <span style={{background:C.infoBg,color:C.info,border:`1px solid #BFDBFE`,borderRadius:20,padding:"1px 8px",fontSize:11,fontWeight:700}}>{assetsAtSite.length}</span>
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:4}}>
                          {assetsAtSite.slice(0,4).map(a=>{
                            const days=getDaysSinceLastTransfer(a.id);
                            const longStay=days!==null&&days>180;
                            return (
                              <div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                <span style={{fontSize:11,color:longStay?C.warn:C.muted,fontWeight:longStay?600:400}}>{a.name}</span>
                                {longStay&&<span style={{fontSize:9,color:C.warn,fontWeight:700}}>{days}d</span>}
                              </div>
                            );
                          })}
                          {assetsAtSite.length>4&&(
                            <div style={{fontSize:10,color:C.mutedLt}}>+{assetsAtSite.length-4} more</div>
                          )}
                        </div>
                      </div>
                    );
                  }).filter(Boolean)}
                </div>
              </div>

              {/* ASSET MOVEMENT SUMMARY */}
              {assets.filter(a=>getAssetTransferHistory(a.id).length>0).length>0&&(
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:12}}>Asset Movement Summary</div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {assets
                      .filter(a=>getAssetTransferHistory(a.id).length>0)
                      .map(a=>{
                        const history=getAssetTransferHistory(a.id);
                        const current=getAssetCurrentSite(a);
                        const days=getDaysSinceLastTransfer(a.id);
                        const longStay=days!==null&&days>180;
                        const hasDamage=history.some(t=>t.conditionAtTransfer==="Poor — Noted"||t.conditionAtTransfer==="Damaged — Report Filed");
                        return (
                          <div key={a.id} style={{background:C.white,borderRadius:9,border:`1px solid ${longStay?"#FDE68A":hasDamage?C.redBorder:C.border}`,overflow:"hidden",boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
                            {/* ASSET ROW */}
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:C.surface,borderBottom:`1px solid ${C.border}`,flexWrap:"wrap",gap:8}}>
                              <div style={{display:"flex",alignItems:"center",gap:10}}>
                                <div style={{fontWeight:700,fontSize:13,color:C.text}}>{a.name}</div>
                                <span style={{fontSize:11,color:C.muted}}>{a.category}</span>
                                {longStay&&<Pill text={`${days}d at ${current}`} color="yellow"/>}
                                {hasDamage&&<Pill text="Damage on Record" color="red"/>}
                              </div>
                              <div style={{display:"flex",alignItems:"center",gap:8}}>
                                <span style={{fontSize:11,color:C.muted}}>Current location:</span>
                                <span style={{fontSize:12,fontWeight:700,color:C.info}}>{current}</span>
                                <span style={{fontSize:11,color:C.mutedLt}}>{history.length} transfer{history.length!==1?"s":""}</span>
                              </div>
                            </div>
                            {/* TRANSFER TIMELINE */}
                            <div style={{padding:"10px 16px",overflowX:"auto"}}>
                              <div style={{display:"flex",alignItems:"center",gap:0,minWidth:"max-content"}}>
                                {/* ORIGIN */}
                                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                                  <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:6,padding:"4px 10px",fontSize:11,fontWeight:600,color:C.muted}}>
                                    {a.location}
                                  </div>
                                  <div style={{fontSize:9,color:C.mutedLt}}>Origin</div>
                                </div>
                                {/* TRANSFERS */}
                                {[...history].reverse().map((t,idx)=>(
                                  <div key={t.id} style={{display:"flex",alignItems:"center"}}>
                                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"0 4px"}}>
                                      <div style={{height:2,width:32,background:t.conditionAtTransfer==="Damaged — Report Filed"?C.red:t.conditionAtTransfer==="Poor — Noted"?C.warn:C.border}}/>
                                      <div style={{fontSize:8,color:C.mutedLt,marginTop:2,whiteSpace:"nowrap"}}>{t.transferDate}</div>
                                    </div>
                                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                                      <div style={{
                                        background:idx===history.length-1?C.infoBg:C.surface,
                                        border:`1px solid ${idx===history.length-1?"#BFDBFE":C.border}`,
                                        borderRadius:6,padding:"4px 10px",fontSize:11,fontWeight:600,
                                        color:idx===history.length-1?C.info:C.text,whiteSpace:"nowrap"
                                      }}>
                                        {t.toSite}
                                      </div>
                                      <div style={{fontSize:9,color:C.mutedLt}}>{t.reason.split(" ")[0]}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* FULL HISTORY TABLE */}
              <Card
                title="Full Transfer History"
                sub={`${transfers.length} total movements`}
                action={
                  transfers.length>0&&(
                    <Btn variant="outline" size="sm" onClick={()=>{
                      const wb=XLSX.utils.book_new();
                      const rows=[...transfers]
                        .sort((a,b)=>b.transferDate>a.transferDate?1:-1)
                        .map(t=>{
                          const asset=assets.find(a=>a.id===t.assetId);
                          return {
                            "Date":t.transferDate,
                            "Asset Name":asset?.name||"—",
                            "Category":asset?.category||"",
                            "Serial / Reg":asset?.serialNumber||"",
                            "From Site":t.fromSite,
                            "To Site":t.toSite,
                            "Reason":t.reason,
                            "Transport Method":t.transportMethod,
                            "Condition at Transfer":t.conditionAtTransfer,
                            "Odometer / Hours":t.odometerAtTransfer||"",
                            "Authorised By":t.authorisedBy||"",
                            "Transported By":t.transportedBy||"",
                            "Notes":t.notes||"",
                          };
                        });
                      const ws=XLSX.utils.json_to_sheet(rows);
                      ws["!cols"]=[12,28,14,16,16,16,20,18,22,16,20,20,35].map(w=>({wch:w}));
                      ws["!freeze"]={xSplit:0,ySplit:1,topLeftCell:"A2",activePane:"bottomLeft",state:"frozen"};
                      XLSX.utils.book_append_sheet(wb,ws,"Asset Transfer Log");
                      XLSX.writeFile(wb,`Mapitsi_Asset_Transfer_Log_${today()}.xlsx`);
                      toast("Transfer log exported.");
                    }}>📊 Export Excel</Btn>
                  )
                }
              >
                {transfers.length===0?(
                  <Empty
                    icon="⇄"
                    title="No transfer records yet"
                    desc="Log every site-to-site movement to build a complete asset location history. This protects you in insurance claims and internal disputes."
                    btn={<Btn onClick={()=>setModal("transfer")}>Log First Transfer</Btn>}
                  />
                ):(
                  <Tbl cols={["Date","Asset","From","To","Reason","Transport","Condition","Authorised By","Odometer","Notes",""]}>
                    {[...transfers]
                      .sort((a,b)=>b.transferDate>a.transferDate?1:b.transferDate===a.transferDate?0:-1)
                      .map((t,i)=>{
                        const asset=assets.find(a=>a.id===t.assetId);
                        const isDamage=t.conditionAtTransfer==="Damaged — Report Filed";
                        const isPoor=t.conditionAtTransfer==="Poor — Noted";
                        return (
                          <TR key={t.id} stripe={i%2!==0} cells={[
                            <div>
                              <div style={{fontSize:12,fontWeight:600,color:C.text}}>{t.transferDate}</div>
                              {t.transferDate===today()&&<Pill text="Today" color="blue"/>}
                            </div>,
                            <div>
                              <div style={{fontWeight:700,fontSize:12,color:C.text}}>{asset?.name||"—"}</div>
                              <div style={{fontSize:10,color:C.mutedLt}}>{asset?.category||""}</div>
                            </div>,
                            <div style={{display:"flex",alignItems:"center",gap:4}}>
                              <span style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:5,padding:"2px 8px",fontSize:11,fontWeight:600,color:C.muted,whiteSpace:"nowrap"}}>{t.fromSite}</span>
                            </div>,
                            <div style={{display:"flex",alignItems:"center",gap:4}}>
                              <span style={{fontSize:11,color:C.mutedLt}}>→</span>
                              <span style={{background:C.infoBg,border:`1px solid #BFDBFE`,borderRadius:5,padding:"2px 8px",fontSize:11,fontWeight:600,color:C.info,whiteSpace:"nowrap"}}>{t.toSite}</span>
                            </div>,
                            <span style={{fontSize:11,color:C.muted}}>{t.reason}</span>,
                            <span style={{fontSize:11,color:C.muted}}>{t.transportMethod}</span>,
                            <Pill
                              text={t.conditionAtTransfer}
                              color={isDamage?"red":isPoor?"yellow":"green"}
                            />,
                            <span style={{fontSize:11,color:C.muted}}>{t.authorisedBy||"—"}</span>,
                            <span style={{fontSize:11,color:C.muted}}>{t.odometerAtTransfer||"—"}</span>,
                            <span style={{fontSize:11,color:C.mutedLt,maxWidth:120,display:"block",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.notes||"—"}</span>,
                            <button onClick={()=>del("mcw_transfers",setTransfers,transfers,t.id)} style={{color:C.muted,background:"none",border:"none",cursor:"pointer",fontSize:14,padding:"2px 6px"}}>×</button>
                          ]}/>
                        );
                      })}
                  </Tbl>
                )}
              </Card>
            </div>
          )}
          {/* CONTRACTOR REGISTER */}
          {tab === "Contractors" && (
            <div>
              <PageTitle
                title="CONTRACTOR REGISTER"
                sub="Subcontractor compliance vetting — CIDB, tax clearance, insurance and COIDA"
                action={
                  can(currentUser,"canAdd")&&(
                    <Btn onClick={()=>{setConF(dCon);setConSettingsTab("details");setModal("contractor");}}>＋ Add Contractor</Btn>
                  )
                }
              />

              {/* KPI STRIP */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",gap:12,marginBottom:20}}>
                <KPI label="Total Contractors" value={contractors.length} color={C.info} icon="⊡" sub="on register"/>
                <KPI
                  label="Fully Compliant"
                  value={contractors.filter(c=>getContractorCompliance(c).overallStatus==="compliant").length}
                  color={C.success} icon="✓"
                  sub="all documents valid"
                />
                <KPI
                  label="Expiring Soon"
                  value={contractors.filter(c=>getContractorCompliance(c).overallStatus==="expiring").length}
                  color={C.warn} icon="⚐"
                  sub="within 30 days"
                />
                <KPI
                  label="Expired / Non-Compliant"
                  value={contractors.filter(c=>getContractorCompliance(c).overallStatus==="expired").length}
                  color={contractors.filter(c=>getContractorCompliance(c).overallStatus==="expired").length>0?C.red:C.success}
                  icon="⚑"
                  sub="immediate attention"
                />
                <KPI
                  label="Incomplete Records"
                  value={contractors.filter(c=>getContractorCompliance(c).overallStatus==="incomplete").length}
                  color={C.muted} icon="?"
                  sub="missing documents"
                />
              </div>

              {/* NON-COMPLIANT BANNER */}
              {contractors.filter(c=>getContractorCompliance(c).overallStatus==="expired").length>0&&(
                <div style={{background:C.redLight,border:`1px solid ${C.redBorder}`,borderRadius:10,padding:"14px 18px",marginBottom:18}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.red,marginBottom:10}}>
                    ⚠ Non-Compliant Contractors — Do Not Award Work
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                    {contractors.filter(c=>getContractorCompliance(c).overallStatus==="expired").map(c=>{
                      const comp=getContractorCompliance(c);
                      return (
                        <div key={c.id} style={{background:C.white,border:`1px solid ${C.redBorder}`,borderRadius:7,padding:"8px 14px"}}>
                          <div style={{fontWeight:700,fontSize:12,color:C.text}}>{c.name}</div>
                          <div style={{fontSize:11,color:C.red,marginTop:2}}>
                            {comp.issues.filter(i=>i.status==="expired").map(i=>i.label).join(" · ")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* CONTRACTOR CARDS */}
              {contractors.length===0?(
                <Empty
                  icon="⊡"
                  title="No contractors registered"
                  desc="Register subcontractors and track their CIDB grading, tax clearance, insurance and COIDA compliance before awarding any work."
                  btn={<Btn onClick={()=>setModal("contractor")}>Add First Contractor</Btn>}
                />
              ):(
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {[...contractors]
                    .sort((a,b)=>{
                      const order={expired:0,expiring:1,incomplete:2,compliant:3};
                      return order[getContractorCompliance(a).overallStatus]-order[getContractorCompliance(b).overallStatus];
                    })
                    .map(c=>{
                      const comp=getContractorCompliance(c);
                      const statusColor=comp.overallStatus==="compliant"?C.success:comp.overallStatus==="expiring"?C.warn:comp.overallStatus==="expired"?C.red:C.muted;
                      const statusBg=comp.overallStatus==="compliant"?C.successBg:comp.overallStatus==="expiring"?C.warnBg:comp.overallStatus==="expired"?C.redLight:C.surface;
                      const statusBorder=comp.overallStatus==="compliant"?"#A7F3D0":comp.overallStatus==="expiring"?"#FDE68A":comp.overallStatus==="expired"?C.redBorder:C.border;
                      const docChecks=[
                        {label:"CIDB",         expiry:c.cidbExpiryDate,           value:c.cidbGrade?`Grade ${c.cidbGrade}`:null},
                        {label:"Tax Clearance",expiry:c.taxClearanceExpiry,       value:c.taxClearanceNumber||null},
                        {label:"Public Liability",expiry:c.publicLiabilityExpiry, value:c.publicLiabilityAmount?`R${Number(c.publicLiabilityAmount).toLocaleString()}`:null},
                        {label:"COIDA",        expiry:c.coidaExpiryDate,          value:c.coidaRegistrationNumber||null},
                      ];
                      return (
                        <div key={c.id} style={{background:C.white,borderRadius:10,border:`1px solid ${comp.overallStatus==="expired"?C.redBorder:comp.overallStatus==="expiring"?"#FDE68A":C.border}`,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                          {/* CARD HEADER */}
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 18px",borderBottom:`1px solid ${C.border}`,background:C.surface,flexWrap:"wrap",gap:10}}>
                            <div style={{display:"flex",alignItems:"center",gap:12}}>
                              <div style={{width:40,height:40,background:statusBg,border:`1px solid ${statusBorder}`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                                <span style={{fontSize:15,fontWeight:900,color:statusColor,fontFamily:"'Barlow Condensed',sans-serif"}}>{c.cidbGrade||"?"}</span>
                              </div>
                              <div>
                                <div style={{fontWeight:700,fontSize:14,color:C.text}}>{c.name}</div>
                                <div style={{fontSize:11,color:C.muted}}>
                                  {c.tradingName&&<span>t/a {c.tradingName} · </span>}
                                  {c.cidbClass} · {c.contactPerson||"No contact"}
                                  {c.registrationNumber&&<span style={{fontFamily:"monospace",marginLeft:6}}>Reg: {c.registrationNumber}</span>}
                                </div>
                              </div>
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <div style={{textAlign:"right",marginRight:4}}>
                                <div style={{fontSize:10,color:C.muted,marginBottom:2}}>Compliance Score</div>
                                <div style={{fontSize:20,fontWeight:800,color:statusColor,fontFamily:"'Barlow Condensed',sans-serif"}}>{comp.score}%</div>
                              </div>
                              <Pill
                                text={comp.overallStatus==="compliant"?"Compliant":comp.overallStatus==="expiring"?"Expiring Soon":comp.overallStatus==="expired"?"Non-Compliant":"Incomplete"}
                                color={comp.overallStatus==="compliant"?"green":comp.overallStatus==="expiring"?"yellow":comp.overallStatus==="expired"?"red":"gray"}
                              />
                              <Pill
                                text={c.status}
                                color={c.status==="Active"?"green":c.status==="Blacklisted"?"red":"gray"}
                              />
                              {can(currentUser,"canEdit")&&(
                                <button onClick={()=>{setConF({...dCon,...c});setConSettingsTab("details");setModal("contractor");}} style={{color:C.info,background:"none",border:"none",cursor:"pointer",fontSize:12,padding:"4px 8px",fontFamily:"'DM Sans',sans-serif",fontWeight:600}}>Edit</button>
                              )}
                              {can(currentUser,"canDelete")&&(
                                <button onClick={()=>del("mcw_contractors",setContractors,contractors,c.id)} style={{color:C.muted,background:"none",border:"none",cursor:"pointer",fontSize:14,padding:"2px 6px"}}>×</button>
                              )}
                            </div>
                          </div>

                          {/* DOCUMENT COMPLIANCE GRID */}
                          <div style={{padding:"14px 18px"}}>
                            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10,marginBottom:comp.issues.length>0?14:0}}>
                              {docChecks.map(doc=>{
                                const days=doc.expiry?Math.round((new Date(doc.expiry)-new Date())/(1000*60*60*24)):null;
                                const expired=days!==null&&days<0;
                                const soon=days!==null&&days>=0&&days<=30;
                                const color=!doc.expiry?"#6B7280":expired?C.red:soon?C.warn:C.success;
                                const bg=!doc.expiry?"#F3F4F6":expired?C.redLight:soon?C.warnBg:C.successBg;
                                const border=!doc.expiry?C.border:expired?C.redBorder:soon?"#FDE68A":"#A7F3D0";
                                return (
                                  <div key={doc.label} style={{background:bg,borderRadius:7,padding:"10px 12px",border:`1px solid ${border}`}}>
                                    <div style={{fontSize:9,color:C.muted,textTransform:"uppercase",letterSpacing:0.5,marginBottom:3,fontWeight:700}}>{doc.label}</div>
                                    {doc.value&&<div style={{fontSize:11,color:C.text,fontWeight:600,marginBottom:3}}>{doc.value}</div>}
                                    {doc.expiry?(
                                      <div style={{fontSize:12,fontWeight:700,color}}>
                                        {expired?`Expired ${Math.abs(days)}d ago`:soon?`Expires in ${days}d`:`Valid · ${doc.expiry}`}
                                      </div>
                                    ):(
                                      <div style={{fontSize:11,color:C.muted,fontStyle:"italic"}}>Not captured</div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* ISSUES LIST */}
                            {comp.issues.length>0&&(
                              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
                                {comp.issues.map(issue=>(
                                  <span key={issue.label} style={{background:issue.status==="expired"?C.redLight:issue.status==="soon"?C.warnBg:"#F3F4F6",border:`1px solid ${issue.status==="expired"?C.redBorder:issue.status==="soon"?"#FDE68A":C.border}`,borderRadius:20,padding:"2px 10px",fontSize:11,color:issue.status==="expired"?C.red:issue.status==="soon"?C.warn:C.muted,fontWeight:600}}>
                                    {issue.status==="expired"?`⚠ ${issue.label} expired ${issue.days}d ago`:issue.status==="soon"?`⚐ ${issue.label} — ${issue.days}d left`:`? ${issue.label} not captured`}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* CONTACT & WORK TYPES ROW */}
                            <div style={{display:"flex",gap:16,flexWrap:"wrap",fontSize:12,color:C.muted,paddingTop:comp.issues.length>0?10:0,borderTop:comp.issues.length>0?`1px solid ${C.border}`:"none"}}>
                              {c.phone&&<span>📞 {c.phone}</span>}
                              {c.email&&<span>✉ {c.email}</span>}
                              {c.address&&<span>📍 {c.address}</span>}
                              {c.workTypes&&c.workTypes.length>0&&(
                                <span style={{color:C.info}}>🔧 {c.workTypes.join(", ")}</span>
                              )}
                            </div>
                            {c.notes&&<div style={{fontSize:11,color:C.mutedLt,marginTop:8,fontStyle:"italic"}}>"{c.notes}"</div>}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* EXPORT */}
              {contractors.length>0&&(
                <div style={{marginTop:18,display:"flex",justifyContent:"flex-end"}}>
                  <Btn variant="outline" onClick={()=>{
                    const wb=XLSX.utils.book_new();
                    const rows=contractors.map(c=>{
                      const comp=getContractorCompliance(c);
                      return {
                        "Company Name":c.name,
                        "Trading Name":c.tradingName||"",
                        "Registration No":c.registrationNumber||"",
                        "VAT Number":c.vatNumber||"",
                        "CIDB Grade":c.cidbGrade||"",
                        "CIDB Class":c.cidbClass||"",
                        "CIDB Expiry":c.cidbExpiryDate||"",
                        "Work Types":(c.workTypes||[]).join(", "),
                        "Contact Person":c.contactPerson||"",
                        "Phone":c.phone||"",
                        "Email":c.email||"",
                        "Address":c.address||"",
                        "Status":c.status,
                        "Tax Clearance No":c.taxClearanceNumber||"",
                        "Tax Clearance Expiry":c.taxClearanceExpiry||"",
                        "Public Liability Insurer":c.publicLiabilityInsurer||"",
                        "Public Liability Expiry":c.publicLiabilityExpiry||"",
                        "Public Liability Amount (R)":c.publicLiabilityAmount||"",
                        "COIDA Reg No":c.coidaRegistrationNumber||"",
                        "COIDA Expiry":c.coidaExpiryDate||"",
                        "Bank":c.bankName||"",
                        "Account No":c.bankAccountNumber||"",
                        "Branch Code":c.bankBranchCode||"",
                        "Compliance Score %":comp.score,
                        "Overall Status":comp.overallStatus.toUpperCase(),
                        "Notes":c.notes||"",
                      };
                    });
                    const ws=XLSX.utils.json_to_sheet(rows);
                    ws["!cols"]=[28,20,18,14,10,20,14,35,20,16,28,30,12,18,14,24,14,18,16,14,16,18,12,14,16,40].map(w=>({wch:w}));
                    ws["!freeze"]={xSplit:0,ySplit:1,topLeftCell:"A2",activePane:"bottomLeft",state:"frozen"};
                    XLSX.utils.book_append_sheet(wb,ws,"Contractor Register");
                    XLSX.writeFile(wb,`Mapitsi_Contractor_Register_${today()}.xlsx`);
                    toast("Contractor register exported.");
                  }}>📊 Export to Excel</Btn>
                </div>
              )}
            </div>
          )}
          {/* PRE-OP CHECKLISTS */}
          {tab === "PreOp" && (
            <div>
              <PageTitle
                title="DAILY PRE-OPERATION CHECKLISTS"
                sub="Operator sign-off before machine start — legally protective, operationally critical"
                action={
                  can(currentUser,"canAdd") && (
                    <Btn onClick={()=>{ setPreopF({...dPreop, date:today(), time:new Date().toTimeString().slice(0,5)}); setModal("preop"); }}>
                      ＋ New Checklist
                    </Btn>
                  )
                }
              />

              {/* KPI STRIP */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(155px,1fr))",gap:12,marginBottom:20}}>
                <KPI label="Total Checklists" value={preops.length} color={C.info} icon="☑" sub="all time"/>
                <KPI
                  label="Completed Today"
                  value={preops.filter(p=>p.date===today()).length}
                  color={C.success}
                  icon="✓"
                  sub={`of ${assets.filter(a=>a.status==="Active").length} active assets`}
                />
                <KPI
                  label="Defects Today"
                  value={preops.filter(p=>p.date===today()&&PREOP_CHECKS.some(c=>p.checks?.[c.id]==="fail")).length}
                  color={preops.filter(p=>p.date===today()&&PREOP_CHECKS.some(c=>p.checks?.[c.id]==="fail")).length>0?C.red:C.success}
                  icon="⚠"
                  sub="machines with faults found"
                />
                <KPI
                  label="Not Checked Today"
                  value={assets.filter(a=>a.status==="Active"&&!preops.find(p=>p.assetId===a.id&&p.date===today())).length}
                  color={assets.filter(a=>a.status==="Active"&&!preops.find(p=>p.assetId===a.id&&p.date===today())).length>0?C.warn:C.success}
                  icon="⊘"
                  sub="active assets pending"
                />
                <KPI
                  label="Total Defects Found"
                  value={preops.filter(p=>PREOP_CHECKS.some(c=>p.checks?.[c.id]==="fail")).length}
                  color={C.warn}
                  icon="⚑"
                  sub="across all time"
                />
              </div>

              {/* TODAY STATUS PANEL */}
              {assets.filter(a=>a.status==="Active").length > 0 && (
                <div style={{marginBottom:20}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.text,marginBottom:12}}>
                    Today's Status — {new Date().toLocaleDateString("en-ZA",{weekday:"long",day:"numeric",month:"long"})}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
                    {assets.filter(a=>a.status==="Active").map(a=>{
                      const todayCheck = [...preops].filter(p=>p.assetId===a.id&&p.date===today()).sort((x,y)=>y.time>x.time?1:-1)[0];
                      const hasDefect = todayCheck && PREOP_CHECKS.some(c=>todayCheck.checks?.[c.id]==="fail");
                      const failCount = todayCheck ? PREOP_CHECKS.filter(c=>todayCheck.checks?.[c.id]==="fail").length : 0;
                      return (
                        <div key={a.id} style={{
                          background:C.white, borderRadius:9, border:`1px solid ${hasDefect?C.redBorder:todayCheck?"#A7F3D0":C.border}`,
                          padding:"13px 15px", display:"flex", alignItems:"center", gap:12,
                          boxShadow:"0 1px 3px rgba(0,0,0,0.04)"
                        }}>
                          <div style={{
                            width:36, height:36, borderRadius:8, flexShrink:0,
                            background:hasDefect?C.redLight:todayCheck?C.successBg:"#F3F4F6",
                            display:"flex", alignItems:"center", justifyContent:"center", fontSize:16,
                            border:`1px solid ${hasDefect?C.redBorder:todayCheck?"#A7F3D0":C.border}`
                          }}>
                            {hasDefect?"⚠":todayCheck?"✓":"☐"}
                          </div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontWeight:700,fontSize:12,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.name}</div>
                            <div style={{fontSize:10,color:C.muted}}>{a.category}</div>
                            {todayCheck&&(
                              <div style={{fontSize:10,marginTop:2,color:hasDefect?C.red:C.success,fontWeight:600}}>
                                {hasDefect?`${failCount} defect${failCount!==1?"s":""} — ${todayCheck.operatorName}`:`✓ Cleared — ${todayCheck.operatorName}`}
                              </div>
                            )}
                            {!todayCheck&&(
                              <div style={{fontSize:10,marginTop:2,color:C.warn,fontWeight:600}}>Not checked yet</div>
                            )}
                          </div>
                          {!todayCheck && can(currentUser,"canAdd") && (
                            <button
                              onClick={()=>{ setPreopF({...dPreop,assetId:a.id,date:today(),time:new Date().toTimeString().slice(0,5)}); setModal("preop"); }}
                              style={{background:C.red,color:"white",border:"none",borderRadius:6,padding:"5px 10px",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",flexShrink:0}}
                            >
                              Check →
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* DEFECTS PANEL */}
              {preops.filter(p=>PREOP_CHECKS.some(c=>p.checks?.[c.id]==="fail")).length > 0 && (
                <div style={{background:C.redLight,border:`1px solid ${C.redBorder}`,borderRadius:10,padding:"16px 20px",marginBottom:20}}>
                  <div style={{fontSize:13,fontWeight:700,color:C.red,marginBottom:12}}>
                    ⚠ Defects on Record — {preops.filter(p=>PREOP_CHECKS.some(c=>p.checks?.[c.id]==="fail")).length} checklist{preops.filter(p=>PREOP_CHECKS.some(c=>p.checks?.[c.id]==="fail")).length!==1?"s":""} with faults
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {[...preops]
                      .filter(p=>PREOP_CHECKS.some(c=>p.checks?.[c.id]==="fail"))
                      .sort((a,b)=>b.date>a.date?1:-1)
                      .slice(0,5)
                      .map(p=>{
                        const asset=assets.find(a=>a.id===p.assetId);
                        const failedChecks=PREOP_CHECKS.filter(c=>p.checks?.[c.id]==="fail");
                        return (
                          <div key={p.id} style={{background:C.white,borderRadius:7,padding:"10px 14px",border:`1px solid ${C.redBorder}`}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:6}}>
                              <div>
                                <span style={{fontWeight:700,fontSize:12,color:C.text}}>{asset?.name||"—"}</span>
                                <span style={{fontSize:11,color:C.muted,marginLeft:8}}>{p.date} {p.time&&`at ${p.time}`} · {p.operatorName}</span>
                              </div>
                              <Pill text={`${failedChecks.length} defect${failedChecks.length!==1?"s":""}`} color="red"/>
                            </div>
                            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:8}}>
                              {failedChecks.map(c=>(
                                <span key={c.id} style={{background:C.redLight,border:`1px solid ${C.redBorder}`,borderRadius:20,padding:"2px 10px",fontSize:11,color:C.red,fontWeight:600}}>
                                  {c.icon} {c.label}
                                </span>
                              ))}
                            </div>
                            {p.defectNotes&&(
                              <div style={{fontSize:11,color:C.muted,marginTop:8,fontStyle:"italic"}}>"{p.defectNotes}"</div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* FULL HISTORY TABLE */}
              <Card
                title="Checklist History"
                sub={`${preops.length} total records`}
                action={
                  <Btn variant="outline" size="sm" onClick={()=>{
                    const wb = XLSX.utils.book_new();
                    const rows = [...preops].sort((a,b)=>b.date>a.date?1:-1).map(p=>{
                      const asset=assets.find(a=>a.id===p.assetId);
                      const failedChecks=PREOP_CHECKS.filter(c=>p.checks?.[c.id]==="fail").map(c=>c.label).join(", ");
                      const row={
                        "Date":p.date, "Time":p.time||"", "Asset":asset?.name||"—",
                        "Category":asset?.category||"", "Operator":p.operatorName,
                        "Odometer / Hours":p.odometerReading||"", "Fuel Level":p.fuelLevel||"",
                        "Supervisor":p.supervisorName||"",
                      };
                      PREOP_CHECKS.forEach(c=>{ row[c.label]=p.checks?.[c.id]||"pass"; });
                      row["Defects Found"]=failedChecks||"None";
                      row["Defect Notes"]=p.defectNotes||"";
                      row["Overall"]=PREOP_CHECKS.some(c=>p.checks?.[c.id]==="fail")?"DEFECT":"PASS";
                      return row;
                    });
                    const ws=XLSX.utils.json_to_sheet(rows.length?rows:[{Note:"No checklist records"}]);
                    ws["!cols"]=[12,8,28,14,22,16,12,20,...PREOP_CHECKS.map(()=>({wch:8})),30,40,10].map((w,i)=>typeof w==="number"?{wch:w}:w);
                    ws["!freeze"]={xSplit:0,ySplit:1,topLeftCell:"A2",activePane:"bottomLeft",state:"frozen"};
                    XLSX.utils.book_append_sheet(wb,ws,"Pre-Op Checklists");
                    XLSX.writeFile(wb,`Mapitsi_PreOp_Checklists_${today()}.xlsx`);
                  }}>📊 Export Excel</Btn>
                }
              >
                {preops.length===0?(
                  <Empty icon="☑" title="No checklists completed yet" desc="Complete a daily pre-operation checklist for each active asset before it starts work." btn={<Btn onClick={()=>setModal("preop")}>Complete First Checklist</Btn>}/>
                ):(
                  <Tbl cols={["Date","Time","Asset","Category","Operator","Fuel","Odometer","Checks","Defects","Supervisor",""]}>
                    {[...preops].sort((a,b)=>b.date>a.date?1:b.date===a.date?b.time>a.time?1:-1:-1).map((p,i)=>{
                      const asset=assets.find(a=>a.id===p.assetId);
                      const failCount=PREOP_CHECKS.filter(c=>p.checks?.[c.id]==="fail").length;
                      const passCount=PREOP_CHECKS.filter(c=>p.checks?.[c.id]==="pass").length;
                      const naCount=PREOP_CHECKS.filter(c=>p.checks?.[c.id]==="na").length;
                      const hasDefect=failCount>0;
                      return (
                        <TR key={p.id} stripe={i%2!==0} cells={[
                          <div>
                            <div style={{fontWeight:600,fontSize:12,color:C.text}}>{p.date}</div>
                            {p.date===today()&&<Pill text="Today" color="blue"/>}
                          </div>,
                          <span style={{color:C.muted,fontSize:12}}>{p.time||"—"}</span>,
                          <span style={{fontWeight:700,color:C.text}}>{asset?.name||"—"}</span>,
                          <span style={{color:C.muted,fontSize:12}}>{asset?.category||"—"}</span>,
                          <span style={{fontSize:12}}>{p.operatorName}</span>,
                          <span style={{fontSize:12,color:C.muted}}>{p.fuelLevel||"—"}</span>,
                          <span style={{fontSize:12,color:C.muted}}>{p.odometerReading||"—"}</span>,
                          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                            <Pill text={`${passCount} ✓`} color="green"/>
                            {failCount>0&&<Pill text={`${failCount} ✗`} color="red"/>}
                            {naCount>0&&<Pill text={`${naCount} N/A`} color="gray"/>}
                          </div>,
                          <div>
                            {hasDefect?(
                              <div>
                                <Pill text="Defects Found" color="red"/>
                                {p.defectNotes&&<div style={{fontSize:10,color:C.muted,marginTop:3,maxWidth:160}}>{p.defectNotes}</div>}
                              </div>
                            ):(
                              <Pill text="All Clear" color="green"/>
                            )}
                          </div>,
                          <span style={{fontSize:12,color:C.muted}}>{p.supervisorName||"—"}</span>,
                          <button onClick={()=>del("mcw_preops",setPreops,preops,p.id)} style={{color:C.muted,background:"none",border:"none",cursor:"pointer",fontSize:14,padding:"2px 6px"}}>×</button>
                        ]}/>
                      );
                    })}
                  </Tbl>
                )}
              </Card>
            </div>
          )}
          {/* ASSET EXPENSES */}
          {tab === "AssetExpenses" && (
            <div>
              <PageTitle
                title="ASSET EXPENSE REPORT"
                sub="Full cost breakdown per asset — maintenance, fuel, incident repairs and total lifetime spend"
                action={
                  <div style={{ display: "flex", gap: 8 }}>
                    <Btn
                      variant="outline"
                      onClick={() => {
                        const wb = XLSX.utils.book_new();
                        const rows = assets.map((a) => {
                          const e = getAssetExpenses(a.id);
                          const d = depreciate(a);
                          const purchaseCost = Number(a.purchaseCost || 0);
                          const totalLifetime = e.totalExpenses;
                          const expenseRatio =
                            purchaseCost > 0
                              ? (totalLifetime / purchaseCost) * 100
                              : 0;
                          const stability =
                            totalLifetime === 0
                              ? "No Data"
                              : expenseRatio > 75
                              ? "High Risk"
                              : expenseRatio > 40
                              ? "Monitor"
                              : "Stable";
                          return {
                            "Asset Name": a.name,
                            Category: a.category,
                            "Serial / Reg": a.serialNumber || "",
                            Location: a.location,
                            Status: a.status,
                            "Purchase Date": a.purchaseDate,
                            "Purchase Cost (R)": purchaseCost,
                            "Current Book Value (R)": parseFloat(
                              d.bookValue.toFixed(2)
                            ),
                            "Acc. Depreciation (R)": parseFloat(
                              d.accumulated.toFixed(2)
                            ),
                            "Maintenance Records": e.maintCount,
                            "Total Maintenance Cost (R)": parseFloat(
                              e.maintCost.toFixed(2)
                            ),
                            "Fuel Records": e.fuelCount,
                            "Total Fuel Cost (R)": parseFloat(
                              e.fuelCost.toFixed(2)
                            ),
                            "Total Litres": parseFloat(e.fuelLitres.toFixed(1)),
                            "Incident Records": e.incidentCount,
                            "Incident Repair Cost (R)": parseFloat(
                              e.incidentCost.toFixed(2)
                            ),
                            "Downtime (hrs)": e.downtimeHrs,
                            "TOTAL LIFETIME EXPENSE (R)": parseFloat(
                              totalLifetime.toFixed(2)
                            ),
                            "Expense vs Purchase Cost %": parseFloat(
                              expenseRatio.toFixed(1)
                            ),
                            "Total Cost of Ownership (R)": parseFloat(
                              (purchaseCost + totalLifetime).toFixed(2)
                            ),
                            "Stability Rating": stability,
                          };
                        });
                        rows.sort(
                          (a, b) =>
                            b["TOTAL LIFETIME EXPENSE (R)"] -
                            a["TOTAL LIFETIME EXPENSE (R)"]
                        );
                        rows.push({
                          "Asset Name": "FLEET TOTALS",
                          Category: "",
                          "Serial / Reg": "",
                          Location: "",
                          Status: "",
                          "Purchase Date": "",
                          "Purchase Cost (R)": assets.reduce(
                            (s, a) => s + Number(a.purchaseCost || 0),
                            0
                          ),
                          "Current Book Value (R)": parseFloat(
                            assets
                              .reduce((s, a) => s + depreciate(a).bookValue, 0)
                              .toFixed(2)
                          ),
                          "Acc. Depreciation (R)": parseFloat(
                            assets
                              .reduce(
                                (s, a) => s + depreciate(a).accumulated,
                                0
                              )
                              .toFixed(2)
                          ),
                          "Maintenance Records": maint.length,
                          "Total Maintenance Cost (R)": parseFloat(
                            maint
                              .reduce((s, m) => s + Number(m.cost || 0), 0)
                              .toFixed(2)
                          ),
                          "Fuel Records": fuel.length,
                          "Total Fuel Cost (R)": parseFloat(
                            fuel
                              .reduce((s, f) => s + Number(f.cost || 0), 0)
                              .toFixed(2)
                          ),
                          "Total Litres": parseFloat(
                            fuel
                              .reduce((s, f) => s + Number(f.litres || 0), 0)
                              .toFixed(1)
                          ),
                          "Incident Records": incidents.length,
                          "Incident Repair Cost (R)": parseFloat(
                            incidents
                              .reduce(
                                (s, i) => s + Number(i.repairCost || 0),
                                0
                              )
                              .toFixed(2)
                          ),
                          "Downtime (hrs)": incidents.reduce(
                            (s, i) => s + Number(i.downtimeHours || 0),
                            0
                          ),
                          "TOTAL LIFETIME EXPENSE (R)": parseFloat(
                            assets
                              .reduce(
                                (s, a) =>
                                  s + getAssetExpenses(a.id).totalExpenses,
                                0
                              )
                              .toFixed(2)
                          ),
                          "Expense vs Purchase Cost %": "",
                          "Total Cost of Ownership (R)": parseFloat(
                            assets
                              .reduce(
                                (s, a) =>
                                  s +
                                  Number(a.purchaseCost || 0) +
                                  getAssetExpenses(a.id).totalExpenses,
                                0
                              )
                              .toFixed(2)
                          ),
                          "Stability Rating": "",
                        });
                        const ws = XLSX.utils.json_to_sheet(rows);
                        ws["!cols"] = [
                          28, 14, 16, 14, 12, 14, 18, 18, 18, 13, 20, 11, 16,
                          12, 13, 20, 13, 22, 22, 22, 14,
                        ].map((w) => ({ wch: w }));
                        ws["!freeze"] = {
                          xSplit: 0,
                          ySplit: 1,
                          topLeftCell: "A2",
                          activePane: "bottomLeft",
                          state: "frozen",
                        };
                        Object.keys(ws)
                          .filter((k) => !k.startsWith("!"))
                          .forEach((k) => {
                            if (ws[k]?.t === "n") ws[k].z = "R #,##0.00";
                          });
                        XLSX.utils.book_append_sheet(
                          wb,
                          ws,
                          "Asset Expense Report"
                        );

                        // SUMMARY SHEET
                        const categories = [
                          ...new Set(assets.map((a) => a.category)),
                        ];
                        const catRows = categories
                          .map((cat) => {
                            const catAssets = assets.filter(
                              (a) => a.category === cat
                            );
                            const catExpenses = catAssets.reduce(
                              (s, a) =>
                                s + getAssetExpenses(a.id).totalExpenses,
                              0
                            );
                            const catMaint = catAssets.reduce(
                              (s, a) => s + getAssetExpenses(a.id).maintCost,
                              0
                            );
                            const catFuel = catAssets.reduce(
                              (s, a) => s + getAssetExpenses(a.id).fuelCost,
                              0
                            );
                            const catInc = catAssets.reduce(
                              (s, a) => s + getAssetExpenses(a.id).incidentCost,
                              0
                            );
                            const catCost = catAssets.reduce(
                              (s, a) => s + Number(a.purchaseCost || 0),
                              0
                            );
                            return {
                              Category: cat,
                              Assets: catAssets.length,
                              "Total Purchase Cost (R)": parseFloat(
                                catCost.toFixed(2)
                              ),
                              "Total Maintenance (R)": parseFloat(
                                catMaint.toFixed(2)
                              ),
                              "Total Fuel (R)": parseFloat(catFuel.toFixed(2)),
                              "Incident Repairs (R)": parseFloat(
                                catInc.toFixed(2)
                              ),
                              "Total Expenses (R)": parseFloat(
                                catExpenses.toFixed(2)
                              ),
                              "Expense Ratio %":
                                catCost > 0
                                  ? parseFloat(
                                      ((catExpenses / catCost) * 100).toFixed(1)
                                    )
                                  : 0,
                            };
                          })
                          .sort(
                            (a, b) =>
                              b["Total Expenses (R)"] - a["Total Expenses (R)"]
                          );
                        const ws2 = XLSX.utils.json_to_sheet(catRows);
                        ws2["!cols"] = [18, 8, 20, 18, 16, 18, 16, 14].map(
                          (w) => ({ wch: w })
                        );
                        Object.keys(ws2)
                          .filter((k) => !k.startsWith("!"))
                          .forEach((k) => {
                            if (ws2[k]?.t === "n") ws2[k].z = "R #,##0.00";
                          });
                        XLSX.utils.book_append_sheet(
                          wb,
                          ws2,
                          "Expenses by Category"
                        );

                        XLSX.writeFile(
                          wb,
                          `Mapitsi_Asset_Expense_Report_${today()}.xlsx`
                        );
                      }}
                    >
                      📊 Export Full Report
                    </Btn>
                  </div>
                }
              />

              {/* FLEET SUMMARY STRIP */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))",
                  gap: 12,
                  marginBottom: 20,
                }}
              >
                <KPI
                  label="Total Maintenance"
                  value={fmt(
                    maint.reduce((s, m) => s + Number(m.cost || 0), 0)
                  )}
                  sub={`${maint.length} records all time`}
                  color="#7c3aed"
                  icon="⊙"
                />
                <KPI
                  label="Total Fuel Cost"
                  value={fmt(fuel.reduce((s, f) => s + Number(f.cost || 0), 0))}
                  sub={`${fuel
                    .reduce((s, f) => s + Number(f.litres || 0), 0)
                    .toFixed(0)} L total`}
                  color={C.warn}
                  icon="⛽"
                />
                <KPI
                  label="Incident Repair Cost"
                  value={fmt(
                    incidents.reduce((s, i) => s + Number(i.repairCost || 0), 0)
                  )}
                  sub={`${incidents
                    .reduce((s, i) => s + Number(i.downtimeHours || 0), 0)
                    .toFixed(1)} hrs downtime`}
                  color={C.red}
                  icon="⚠"
                />
                <KPI
                  label="Total Fleet Expenses"
                  value={fmt(
                    assets.reduce(
                      (s, a) => s + getAssetExpenses(a.id).totalExpenses,
                      0
                    )
                  )}
                  sub="maint + fuel + repairs"
                  color={C.text}
                  icon="₽"
                />
                <KPI
                  label="Total Cost of Ownership"
                  value={fmt(
                    assets.reduce(
                      (s, a) =>
                        s +
                        Number(a.purchaseCost || 0) +
                        getAssetExpenses(a.id).totalExpenses,
                      0
                    )
                  )}
                  sub="purchase + all expenses"
                  color={C.muted}
                  icon="≋"
                />
              </div>

              {assets.length === 0 ? (
                <Empty
                  icon="₽"
                  title="No assets registered"
                  desc="Register assets and log fuel, maintenance and incidents to see expense analysis."
                  btn={<Btn onClick={() => setTab("Assets")}>Go to Assets</Btn>}
                />
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {[...assets]
                    .map((a) => {
                      const e = getAssetExpenses(a.id);
                      const d = depreciate(a);
                      const purchaseCost = Number(a.purchaseCost || 0);
                      const expenseRatio =
                        purchaseCost > 0
                          ? (e.totalExpenses / purchaseCost) * 100
                          : 0;
                      const stability =
                        e.totalExpenses === 0
                          ? null
                          : expenseRatio > 75
                          ? "High Risk"
                          : expenseRatio > 40
                          ? "Monitor"
                          : "Stable";
                      const stabilityColor =
                        stability === "High Risk"
                          ? C.red
                          : stability === "Monitor"
                          ? C.warn
                          : C.success;
                      return (
                        <div
                          key={a.id}
                          style={{
                            background: C.white,
                            borderRadius: 10,
                            border: `1px solid ${C.border}`,
                            overflow: "hidden",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                          }}
                        >
                          {/* ASSET HEADER */}
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "14px 18px",
                              borderBottom: `1px solid ${C.border}`,
                              background: C.surface,
                              flexWrap: "wrap",
                              gap: 10,
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                              }}
                            >
                              <div
                                style={{
                                  width: 36,
                                  height: 36,
                                  background:
                                    e.totalExpenses === 0
                                      ? "#F3F4F6"
                                      : expenseRatio > 75
                                      ? C.redLight
                                      : expenseRatio > 40
                                      ? C.warnBg
                                      : C.successBg,
                                  borderRadius: 8,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  fontSize: 16,
                                  border: `1px solid ${
                                    e.totalExpenses === 0
                                      ? C.border
                                      : expenseRatio > 75
                                      ? C.redBorder
                                      : expenseRatio > 40
                                      ? "#FDE68A"
                                      : "#A7F3D0"
                                  }`,
                                }}
                              >
                                ₽
                              </div>
                              <div>
                                <div
                                  style={{
                                    fontWeight: 700,
                                    color: C.text,
                                    fontSize: 14,
                                  }}
                                >
                                  {a.name}
                                </div>
                                <div style={{ fontSize: 11, color: C.muted }}>
                                  {a.category} · {a.location} ·{" "}
                                  <span style={{ fontFamily: "monospace" }}>
                                    {a.serialNumber || "No serial"}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                              }}
                            >
                              <Pill
                                text={a.status}
                                color={
                                  a.status === "Active"
                                    ? "green"
                                    : a.status === "Under Maintenance"
                                    ? "yellow"
                                    : "gray"
                                }
                              />
                              {stability && (
                                <Pill
                                  text={stability}
                                  color={
                                    stability === "High Risk"
                                      ? "red"
                                      : stability === "Monitor"
                                      ? "yellow"
                                      : "green"
                                  }
                                />
                              )}
                              {e.totalExpenses === 0 && (
                                <Pill text="No Expenses Logged" color="gray" />
                              )}
                            </div>
                          </div>
                          {/* COST BREAKDOWN */}
                          <div style={{ padding: "14px 18px" }}>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(auto-fit,minmax(130px,1fr))",
                                gap: 10,
                                marginBottom: e.totalExpenses > 0 ? 14 : 0,
                              }}
                            >
                              <div
                                style={{
                                  background: "#F5F3FF",
                                  borderRadius: 7,
                                  padding: "10px 12px",
                                  borderLeft: `3px solid #7c3aed`,
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 9,
                                    color: C.muted,
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                    marginBottom: 2,
                                  }}
                                >
                                  Maintenance
                                </div>
                                <div
                                  style={{
                                    fontSize: 16,
                                    fontWeight: 800,
                                    color: "#7c3aed",
                                    fontFamily: "'Barlow Condensed',sans-serif",
                                  }}
                                >
                                  {e.maintCost > 0 ? fmt(e.maintCost) : "—"}
                                </div>
                                <div style={{ fontSize: 10, color: C.mutedLt }}>
                                  {e.maintCount} record
                                  {e.maintCount !== 1 ? "s" : ""}
                                </div>
                              </div>
                              <div
                                style={{
                                  background: C.warnBg,
                                  borderRadius: 7,
                                  padding: "10px 12px",
                                  borderLeft: `3px solid ${C.warn}`,
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 9,
                                    color: C.muted,
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                    marginBottom: 2,
                                  }}
                                >
                                  Fuel
                                </div>
                                <div
                                  style={{
                                    fontSize: 16,
                                    fontWeight: 800,
                                    color: C.warn,
                                    fontFamily: "'Barlow Condensed',sans-serif",
                                  }}
                                >
                                  {e.fuelCost > 0 ? fmt(e.fuelCost) : "—"}
                                </div>
                                <div style={{ fontSize: 10, color: C.mutedLt }}>
                                  {e.fuelCount} fill
                                  {e.fuelCount !== 1 ? "s" : ""} ·{" "}
                                  {e.fuelLitres.toFixed(0)} L
                                </div>
                              </div>
                              <div
                                style={{
                                  background: C.redLight,
                                  borderRadius: 7,
                                  padding: "10px 12px",
                                  borderLeft: `3px solid ${C.red}`,
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 9,
                                    color: C.muted,
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                    marginBottom: 2,
                                  }}
                                >
                                  Incident Repairs
                                </div>
                                <div
                                  style={{
                                    fontSize: 16,
                                    fontWeight: 800,
                                    color: C.red,
                                    fontFamily: "'Barlow Condensed',sans-serif",
                                  }}
                                >
                                  {e.incidentCost > 0
                                    ? fmt(e.incidentCost)
                                    : "—"}
                                </div>
                                <div style={{ fontSize: 10, color: C.mutedLt }}>
                                  {e.incidentCount} incident
                                  {e.incidentCount !== 1 ? "s" : ""} ·{" "}
                                  {e.downtimeHrs.toFixed(1)} hrs down
                                </div>
                              </div>
                              <div
                                style={{
                                  background: C.surface,
                                  borderRadius: 7,
                                  padding: "10px 12px",
                                  borderLeft: `3px solid ${C.text}`,
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 9,
                                    color: C.muted,
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                    marginBottom: 2,
                                  }}
                                >
                                  Total Expenses
                                </div>
                                <div
                                  style={{
                                    fontSize: 16,
                                    fontWeight: 800,
                                    color: C.text,
                                    fontFamily: "'Barlow Condensed',sans-serif",
                                  }}
                                >
                                  {e.totalExpenses > 0
                                    ? fmt(e.totalExpenses)
                                    : "—"}
                                </div>
                                <div style={{ fontSize: 10, color: C.mutedLt }}>
                                  maint + fuel + repairs
                                </div>
                              </div>
                              <div
                                style={{
                                  background: C.successBg,
                                  borderRadius: 7,
                                  padding: "10px 12px",
                                  borderLeft: `3px solid ${C.success}`,
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 9,
                                    color: C.muted,
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                    marginBottom: 2,
                                  }}
                                >
                                  Book Value
                                </div>
                                <div
                                  style={{
                                    fontSize: 16,
                                    fontWeight: 800,
                                    color:
                                      d.bookValue > 0 ? C.success : C.muted,
                                    fontFamily: "'Barlow Condensed',sans-serif",
                                  }}
                                >
                                  {fmt(d.bookValue)}
                                </div>
                                <div style={{ fontSize: 10, color: C.mutedLt }}>
                                  of {fmt(purchaseCost)}
                                </div>
                              </div>
                              <div
                                style={{
                                  background: C.infoBg,
                                  borderRadius: 7,
                                  padding: "10px 12px",
                                  borderLeft: `3px solid ${C.info}`,
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: 9,
                                    color: C.muted,
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                    marginBottom: 2,
                                  }}
                                >
                                  Total Cost of Ownership
                                </div>
                                <div
                                  style={{
                                    fontSize: 16,
                                    fontWeight: 800,
                                    color: C.info,
                                    fontFamily: "'Barlow Condensed',sans-serif",
                                  }}
                                >
                                  {fmt(purchaseCost + e.totalExpenses)}
                                </div>
                                <div style={{ fontSize: 10, color: C.mutedLt }}>
                                  purchase + all expenses
                                </div>
                              </div>
                            </div>
                            {e.totalExpenses > 0 && purchaseCost > 0 && (
                              <div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontSize: 11,
                                    color: C.muted,
                                    marginBottom: 4,
                                  }}
                                >
                                  <span>
                                    Expense-to-purchase ratio — how much has
                                    been spent on this asset vs what it cost
                                  </span>
                                  <span
                                    style={{
                                      fontWeight: 700,
                                      color: stabilityColor,
                                    }}
                                  >
                                    {expenseRatio.toFixed(1)}%
                                  </span>
                                </div>
                                <div
                                  style={{
                                    height: 7,
                                    background: C.border,
                                    borderRadius: 4,
                                  }}
                                >
                                  <div
                                    style={{
                                      height: "100%",
                                      background:
                                        expenseRatio > 75
                                          ? C.red
                                          : expenseRatio > 40
                                          ? C.warn
                                          : C.success,
                                      borderRadius: 4,
                                      width: `${Math.min(100, expenseRatio)}%`,
                                      transition: "width 0.5s",
                                    }}
                                  />
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginTop: 6,
                                    fontSize: 11,
                                  }}
                                >
                                  <span style={{ color: C.mutedLt }}>
                                    0% · No expenses
                                  </span>
                                  <span style={{ color: C.success }}>
                                    40% · Stable
                                  </span>
                                  <span style={{ color: C.warn }}>
                                    75% · Monitor
                                  </span>
                                  <span style={{ color: C.red }}>
                                    100%+ · High Risk
                                  </span>
                                </div>
                              </div>
                            )}
                            {e.totalExpenses === 0 && (
                              <div
                                style={{
                                  fontSize: 12,
                                  color: C.mutedLt,
                                  fontStyle: "italic",
                                  marginTop: 4,
                                }}
                              >
                                No expenses logged for this asset yet. Log
                                maintenance, fuel and incidents to see cost
                                analysis.
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                    .sort((a, b) => {
                      const eA = getAssetExpenses(
                        assets.find((x) => x.id === a.key || a.key === x.id)
                          ?.id || ""
                      );
                      const eB = getAssetExpenses(
                        assets.find((x) => x.id === b.key || b.key === x.id)
                          ?.id || ""
                      );
                      return eB.props?.children?.[1]?.props?.children?.[0]
                        ?.props?.children
                        ? 1
                        : -1;
                    })}
                </div>
              )}
            </div>
          )}
          {/* PURCHASE ORDERS */}
          {tab === "PurchaseOrders" && (
            <PurchaseOrdersTab
              purchaseOrders={purchaseOrders} setPurchaseOrders={setPurchaseOrders}
              suppliers={suppliers} spares={spares} projects={projects}
              currentUser={currentUser} persist={persist} add={add} update={update} del={del}
              logAudit={logAudit} toast={toast} can={can} fmt={fmt} today={today}
              C={C} inp={inp} Field={Field} Row2={Row2} Btn={Btn} Card={Card}
              Tbl={Tbl} TR={TR} Empty={Empty} KPI={KPI} Pill={Pill} PageTitle={PageTitle}
            />
          )}

          {/* JOB CARDS */}
          {tab === "JobCards" && (
            <JobCardsTab
              assets={assets} jobCards={jobCards} setJobCards={setJobCards}
              spares={spares} setSpares={setSpares} maint={maint} setMaint={setMaint}
              suppliers={suppliers} employees={employees} projects={projects}
              siteNames={siteNames} currentUser={currentUser}
              persist={persist} add={add} update={update} del={del}
              logAudit={logAudit} toast={toast} can={can} fmt={fmt}
              today={today} C={C} inp={inp} Field={Field} Row2={Row2}
              Btn={Btn} Card={Card} Tbl={Tbl} TR={TR} Empty={Empty}
              KPI={KPI} Pill={Pill} PageTitle={PageTitle} depreciate={depreciate}
            />
          )}

          {/* AI PLANT ASSISTANT */}
          {tab === "AIAssist" && (
            <AIAssistTab
              assets={assets} maint={maint} fuel={fuel} incidents={incidents}
              compliance={compliance} spares={spares} jobCards={jobCards}
              projects={projects} employees={employees} company={company}
              currentUser={currentUser} getProjectSpend={getProjectSpend}
              depreciate={depreciate} allAlerts={allAlerts}
              expiringSoon={expiringSoon} employeesOnLeave={employeesOnLeave}
              totalCost={totalCost} totalBook={totalBook}
              fmt={fmt} today={today} monthLabel={monthLabel}
              C={C} Btn={Btn} KPI={KPI}
            />
          )}

          {/* FLEET VISUAL MAP */}
          {tab === "FleetMap" && (
            <FleetMapTab
              assets={assets} maint={maint} fuel={fuel} incidents={incidents}
              conditions={conditions} transfers={transfers} preops={preops}
              assignments={assignments} spares={spares} jobCards={jobCards}
              siteNames={siteNames} today={today} fmt={fmt}
              depreciate={depreciate}
              getDaysSinceLastTransfer={getDaysSinceLastTransfer}
              getAssetCurrentSite={getAssetCurrentSite}
              C={C} Btn={Btn} Pill={Pill} KPI={KPI} PageTitle={PageTitle}
              setTab={setTab}
            />
          )}

          {/* ASSET INTELLIGENCE */}
          {tab === "AssetIntel" && (
            <AssetIntelTab
              assets={assets} maint={maint} fuel={fuel} incidents={incidents}
              conditions={conditions} preops={preops} spares={spares}
              jobCards={jobCards} assignments={assignments} employees={employees}
              ts={ts} company={company} today={today} fmt={fmt}
              depreciate={depreciate} getAssetExpenses={getAssetExpenses}
              C={C} Btn={Btn} Pill={Pill} KPI={KPI} PageTitle={PageTitle}
            />
          )}

          {/* SETTINGS */}
          {tab === "Settings" && (
            <div>
              <PageTitle
                title="SETTINGS"
                sub="Configure company profile, site names, notification thresholds and data management"
              />
              {/* SETTINGS TABS */}
              <div
                className="np"
                style={{
                  display: "flex",
                  gap: 4,
                  marginBottom: 24,
                  borderBottom: `1px solid ${C.border}`,
                  paddingBottom: 0,
                }}
              >
                {[
                  { id: "company", label: "Company Profile" },
                  { id: "sites", label: "Site Names" },
                  { id: "notifications", label: "Alerts & Thresholds" },
                  { id: "data", label: "Data Management" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSettingsTab(t.id)}
                    style={{
                      padding: "9px 18px",
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: settingsTab === t.id ? 700 : 400,
                      color: settingsTab === t.id ? C.red : C.muted,
                      borderBottom: `2px solid ${
                        settingsTab === t.id ? C.red : "transparent"
                      }`,
                      fontFamily: "'DM Sans',sans-serif",
                      transition: "all 0.15s",
                      marginBottom: -1,
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* COMPANY PROFILE */}
              {settingsTab === "company" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 24,
                    alignItems: "start",
                  }}
                >
                  <Card
                    title="Company Details"
                    sub="These details appear on all reports and exports"
                  >
                    <div style={{ padding: "20px 24px" }}>
                      <Field label="Company Name">
                        <input
                          {...inp}
                          value={company.name}
                          onChange={(e) =>
                            setCompany({ ...company, name: e.target.value })
                          }
                          placeholder="e.g. Mapitsi Civil Works"
                        />
                      </Field>
                      <Field label="Tagline / Division">
                        <input
                          {...inp}
                          value={company.tagline}
                          onChange={(e) =>
                            setCompany({ ...company, tagline: e.target.value })
                          }
                          placeholder="e.g. Plant Management Division"
                        />
                      </Field>
                      <Row2>
                        <Field label="Registration Number">
                          <input
                            {...inp}
                            value={company.regNumber}
                            onChange={(e) =>
                              setCompany({
                                ...company,
                                regNumber: e.target.value,
                              })
                            }
                            placeholder="e.g. 2015/123456/07"
                          />
                        </Field>
                        <Field label="VAT Number">
                          <input
                            {...inp}
                            value={company.vatNumber}
                            onChange={(e) =>
                              setCompany({
                                ...company,
                                vatNumber: e.target.value,
                              })
                            }
                            placeholder="e.g. 4123456789"
                          />
                        </Field>
                      </Row2>
                      <Field label="Physical Address">
                        <input
                          {...inp}
                          value={company.address}
                          onChange={(e) =>
                            setCompany({ ...company, address: e.target.value })
                          }
                          placeholder="e.g. 12 Industrial Road, Pretoria"
                        />
                      </Field>
                      <Field label="City / Province">
                        <input
                          {...inp}
                          value={company.city}
                          onChange={(e) =>
                            setCompany({ ...company, city: e.target.value })
                          }
                          placeholder="e.g. Pretoria, Gauteng"
                        />
                      </Field>
                      <Row2>
                        <Field label="Phone Number">
                          <input
                            {...inp}
                            value={company.phone}
                            onChange={(e) =>
                              setCompany({ ...company, phone: e.target.value })
                            }
                            placeholder="e.g. 012 345 6789"
                          />
                        </Field>
                        <Field label="Email Address">
                          <input
                            {...inp}
                            value={company.email}
                            onChange={(e) =>
                              setCompany({ ...company, email: e.target.value })
                            }
                            placeholder="e.g. info@mapitsi.co.za"
                          />
                        </Field>
                      </Row2>
                      <Field label="Website">
                        <input
                          {...inp}
                          value={company.website}
                          onChange={(e) =>
                            setCompany({ ...company, website: e.target.value })
                          }
                          placeholder="e.g. www.mapitsi.co.za"
                        />
                      </Field>
                      <Field label="Report Footer Text">
                        <input
                          {...inp}
                          value={company.reportFooter}
                          onChange={(e) =>
                            setCompany({
                              ...company,
                              reportFooter: e.target.value,
                            })
                          }
                          placeholder="e.g. Confidential — For Internal Use Only"
                        />
                      </Field>
                      <Btn
                        onClick={async () => {
                          localStorage.setItem("mcw_company", JSON.stringify(company));
                          try { await setDoc(doc(db,"company","singleton"), company); } catch(e){ console.error(e); }
                          toast("Company profile saved.");
                        }}
                        style={{ width: "100%", justifyContent: "center" }}
                      >
                        Save Company Profile
                      </Btn>
                    </div>
                  </Card>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 18,
                    }}
                  >
                    <Card
                      title="Company Logo"
                      sub="Logo appears on login screen, topbar and all reports"
                    >
                      <div style={{ padding: "20px 24px" }}>
                        <Field label="Logo URL">
                          <input
                            {...inp}
                            value={company.logoUrl}
                            onChange={(e) =>
                              setCompany({
                                ...company,
                                logoUrl: e.target.value,
                              })
                            }
                            placeholder="https://yoursite.com/logo.png or Google Drive direct link"
                          />
                        </Field>
                        {company.logoUrl && (
                          <div
                            style={{
                              background: C.surface,
                              borderRadius: 8,
                              padding: 16,
                              textAlign: "center",
                              marginBottom: 16,
                            }}
                          >
                            <img
                              src={company.logoUrl}
                              alt="Preview"
                              style={{
                                maxHeight: 80,
                                maxWidth: "100%",
                                objectFit: "contain",
                              }}
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                            <div
                              style={{
                                fontSize: 11,
                                color: C.muted,
                                marginTop: 8,
                              }}
                            >
                              Logo preview
                            </div>
                          </div>
                        )}
                        {!company.logoUrl && (
                          <div
                            style={{
                              background: C.surface,
                              border: `1px dashed ${C.border}`,
                              borderRadius: 8,
                              padding: "24px 16px",
                              textAlign: "center",
                              marginBottom: 16,
                            }}
                          >
                            <div
                              style={{
                                width: 56,
                                height: 56,
                                background: C.red,
                                borderRadius: 10,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto 8px",
                              }}
                            >
                              <span
                                style={{
                                  color: "white",
                                  fontSize: 22,
                                  fontWeight: 900,
                                  fontFamily: "'Barlow Condensed',sans-serif",
                                }}
                              >
                                MC
                              </span>
                            </div>
                            <div style={{ fontSize: 12, color: C.muted }}>
                              Default logo — paste a URL above to use your own
                            </div>
                          </div>
                        )}
                        <div
                          style={{
                            background: C.infoBg,
                            border: `1px solid #BFDBFE`,
                            borderRadius: 7,
                            padding: "10px 14px",
                            fontSize: 11,
                            color: C.info,
                            marginBottom: 14,
                          }}
                        >
                          <strong>How to get a URL:</strong> Upload your logo to
                          Google Drive, right-click → Share → Anyone with link →
                          Copy link. Then convert to direct URL using a tool
                          like gdirect.net, or use any image hosting service
                          like Imgur.
                        </div>
                        <Btn
                          onClick={async () => {
                            localStorage.setItem("mcw_company", JSON.stringify(company));
                            try { await setDoc(doc(db,"company","singleton"), company); } catch(e){ console.error(e); }
                            toast(
                              "Logo saved. Refresh to see it in the topbar."
                            );
                          }}
                          style={{ width: "100%", justifyContent: "center" }}
                        >
                          Save Logo
                        </Btn>
                      </div>
                    </Card>
                    <Card
                      title="Financial Settings"
                      sub="Affects report grouping and budget periods"
                    >
                      <div style={{ padding: "20px 24px" }}>
                        <Field label="Financial Year Start Month">
                          <select
                            {...inp}
                            value={company.financialYearStart}
                            onChange={(e) =>
                              setCompany({
                                ...company,
                                financialYearStart: e.target.value,
                              })
                            }
                          >
                            {[
                              "01",
                              "02",
                              "03",
                              "04",
                              "05",
                              "06",
                              "07",
                              "08",
                              "09",
                              "10",
                              "11",
                              "12",
                            ].map((m, i) => (
                              <option key={m} value={m}>
                                {new Date(2024, i, 1).toLocaleDateString(
                                  "en-ZA",
                                  { month: "long" }
                                )}
                              </option>
                            ))}
                          </select>
                        </Field>
                        <Btn
                          onClick={async () => {
                            localStorage.setItem("mcw_company", JSON.stringify(company));
                            try { await setDoc(doc(db,"company","singleton"), company); } catch(e){ console.error(e); }
                            toast("Financial settings saved.");
                          }}
                          style={{ width: "100%", justifyContent: "center" }}
                        >
                          Save Settings
                        </Btn>
                      </div>
                    </Card>
                  </div>
                </div>
              )}

              {/* SITE NAMES */}
              {settingsTab === "sites" && (
                <Card
                  title="Site Names"
                  sub="Customise the site names used throughout the system — these appear in all dropdowns and reports"
                >
                  <div style={{ padding: "24px" }}>
                    <div
                      style={{
                        background: C.warnBg,
                        border: `1px solid #FDE68A`,
                        borderRadius: 8,
                        padding: "12px 16px",
                        marginBottom: 20,
                        fontSize: 12,
                        color: C.warn,
                      }}
                    >
                      <strong>Important:</strong> Changing site names will not
                      update existing records that used the old names. It only
                      affects new entries going forward.
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 14,
                        marginBottom: 20,
                      }}
                    >
                      {siteNames.map((site, i) => (
                        <Field key={i} label={`Site ${i + 1}`}>
                          <input
                            {...inp}
                            value={site}
                            onChange={(e) => {
                              const u = [...siteNames];
                              u[i] = e.target.value;
                              setSiteNames(u);
                            }}
                            placeholder={DEFAULT_SITES[i] || `Site ${i + 1}`}
                          />
                        </Field>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <Btn
                        onClick={async () => {
                          localStorage.setItem("mcw_sites", JSON.stringify(siteNames));
                          try { await setDoc(doc(db,"sites","singleton"), {names:siteNames}); } catch(e){ console.error(e); }
                          toast("Site names saved.");
                        }}
                        style={{ flex: 1, justifyContent: "center" }}
                      >
                        Save Site Names
                      </Btn>
                      <Btn
                        variant="ghost"
                        onClick={async () => {
                          setSiteNames(DEFAULT_SITES);
                          localStorage.setItem("mcw_sites", JSON.stringify(DEFAULT_SITES));
                          try { await setDoc(doc(db,"sites","singleton"), {names:DEFAULT_SITES}); } catch(e){ console.error(e); }
                          toast("Site names reset to defaults.", "warn");
                        }}
                      >
                        Reset to Defaults
                      </Btn>
                    </div>
                  </div>
                </Card>
              )}

              {/* NOTIFICATIONS */}
              {settingsTab === "notifications" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 18,
                  }}
                >
                  <Card
                    title="Alert Thresholds"
                    sub="When should the system start showing warnings"
                  >
                    <div style={{ padding: "20px 24px" }}>
                      <Field label="Compliance Document Alert (days before expiry)">
                        <input
                          type="number"
                          {...inp}
                          value={company.complianceAlertDays}
                          onChange={(e) =>
                            setCompany({
                              ...company,
                              complianceAlertDays: e.target.value,
                            })
                          }
                          placeholder="30"
                        />
                        <div
                          style={{ fontSize: 11, color: C.muted, marginTop: 4 }}
                        >
                          Currently: flag documents expiring within{" "}
                          <strong>
                            {company.complianceAlertDays || 30} days
                          </strong>
                        </div>
                      </Field>
                      <Field label="Warranty Alert (days before expiry)">
                        <input
                          type="number"
                          {...inp}
                          value={company.warrantyAlertDays}
                          onChange={(e) =>
                            setCompany({
                              ...company,
                              warrantyAlertDays: e.target.value,
                            })
                          }
                          placeholder="60"
                        />
                        <div
                          style={{ fontSize: 11, color: C.muted, marginTop: 4 }}
                        >
                          Currently: flag warranties expiring within{" "}
                          <strong>
                            {company.warrantyAlertDays || 60} days
                          </strong>
                        </div>
                      </Field>
                      <Field label="Session Timeout (minutes of inactivity)">
                        <input
                          type="number"
                          {...inp}
                          value={company.sessionTimeout}
                          onChange={(e) =>
                            setCompany({
                              ...company,
                              sessionTimeout: e.target.value,
                            })
                          }
                          placeholder="60"
                        />
                        <div
                          style={{ fontSize: 11, color: C.muted, marginTop: 4 }}
                        >
                          Set to 0 to disable auto-logout
                        </div>
                      </Field>
                      <Btn
                        onClick={async () => {
                          localStorage.setItem("mcw_company", JSON.stringify(company));
                          try { await setDoc(doc(db,"company","singleton"), company); } catch(e){ console.error(e); }
                          toast("Notification settings saved.");
                        }}
                        style={{ width: "100%", justifyContent: "center" }}
                      >
                        Save Thresholds
                      </Btn>
                    </div>
                  </Card>
                  <Card
                    title="Current Alert Summary"
                    sub="Live count of active alerts across all modules"
                  >
                    <div style={{ padding: "20px 24px" }}>
                      {[
                        {
                          l: "Critical Alerts",
                          v: allAlerts.filter((a) => a.severity === "critical")
                            .length,
                          c: C.red,
                        },
                        {
                          l: "Warnings",
                          v: allAlerts.filter((a) => a.severity === "warning")
                            .length,
                          c: C.warn,
                        },
                        {
                          l: "Info Alerts",
                          v: allAlerts.filter((a) => a.severity === "info")
                            .length,
                          c: C.info,
                        },
                        {
                          l: "Compliance Expiring",
                          v: expiringSoon.length,
                          c: expiringSoon.length > 0 ? C.red : C.success,
                        },
                        {
                          l: "Warranties Expiring",
                          v: warrantiesExpiringSoon,
                          c: warrantiesExpiringSoon > 0 ? C.warn : C.success,
                        },
                        {
                          l: "Spares Out of Stock",
                          v: sparesOut,
                          c: sparesOut > 0 ? C.red : C.success,
                        },
                        {
                          l: "Open Incidents",
                          v: openIncidents,
                          c: openIncidents > 0 ? C.red : C.success,
                        },
                        {
                          l: "Budgets Overspent",
                          v: budgetsOverspent,
                          c: budgetsOverspent > 0 ? C.red : C.success,
                        },
                      ].map((s) => (
                        <div
                          key={s.l}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "8px 0",
                            borderBottom: `1px solid ${C.border}`,
                          }}
                        >
                          <span style={{ fontSize: 12, color: C.muted }}>
                            {s.l}
                          </span>
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: s.c,
                              fontFamily: "'Barlow Condensed',sans-serif",
                            }}
                          >
                            {s.v}
                          </span>
                        </div>
                      ))}
                      <div style={{ marginTop: 14 }}>
                        <Btn
                          onClick={() => setTab("Alerts")}
                          variant="outline"
                          style={{ width: "100%", justifyContent: "center" }}
                        >
                          View All Alerts →
                        </Btn>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              {/* DATA MANAGEMENT */}
              {settingsTab === "data" && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 18,
                  }}
                >
                  <Card
                    title="Backup & Restore"
                    sub="Export all data to a file or restore from a previous backup"
                  >
                    <div style={{ padding: "20px 24px" }}>
                      <div style={{ marginBottom: 20 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: C.text,
                            marginBottom: 6,
                          }}
                        >
                          Export Full Backup
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: C.muted,
                            marginBottom: 12,
                          }}
                        >
                          Downloads a complete JSON backup of all records —
                          assets, maintenance, fuel, employees, compliance, and
                          every other module. Store it safely.
                        </div>
                        <Btn
                          onClick={() => {
                            const keys = [
                              "mcw_assets",
                              "mcw_maint",
                              "mcw_fuel",
                              "mcw_ts",
                              "mcw_conditions",
                              "mcw_incidents",
                              "mcw_suppliers",
                              "mcw_compliance",
                              "mcw_projects",
                              "mcw_employees",
                              "mcw_schedules",
                              "mcw_budgets",
                              "mcw_hires",
                              "mcw_disposals",
                              "mcw_leaves",
                              "mcw_overtimes",
                              "mcw_assignments",
                              "mcw_spares",
                              "mcw_warranties",
                              "mcw_users",
                              "mcw_company",
                              "mcw_sites",
                              "mcw_audit",
                            ];
                            const backup = {
                              version: "1.0",
                              exported: new Date().toISOString(),
                              data: {},
                            };
                            keys.forEach((k) => {
                              try {
                                const r = localStorage.getItem(k);
                                if (r) backup.data[k] = JSON.parse(r);
                              } catch {}
                            });
                            const blob = new Blob(
                              [JSON.stringify(backup, null, 2)],
                              { type: "application/json" }
                            );
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `Mapitsi_AMS_Backup_${today()}.json`;
                            a.click();
                            URL.revokeObjectURL(url);
                            toast("Backup downloaded successfully.");
                          }}
                          style={{ width: "100%", justifyContent: "center" }}
                        >
                          ⬇ Download Full Backup
                        </Btn>
                      </div>
                      <div
                        style={{
                          borderTop: `1px solid ${C.border}`,
                          paddingTop: 20,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: C.text,
                            marginBottom: 6,
                          }}
                        >
                          Restore from Backup
                        </div>
                        <div
                          style={{
                            fontSize: 12,
                            color: C.muted,
                            marginBottom: 12,
                          }}
                        >
                          Upload a previously exported backup file. This will
                          overwrite all current data.
                        </div>
                        <div
                          style={{
                            background: C.redLight,
                            border: `1px solid ${C.redBorder}`,
                            borderRadius: 7,
                            padding: "10px 14px",
                            fontSize: 12,
                            color: C.red,
                            fontWeight: 600,
                            marginBottom: 12,
                          }}
                        >
                          ⚠ This will permanently replace all current data with
                          the backup contents. Export a fresh backup first.
                        </div>
                        <input
                          type="file"
                          accept=".json"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            if (
                              !window.confirm(
                                "Are you sure? This will replace ALL current data with the backup. This cannot be undone."
                              )
                            )
                              return;
                            try {
                              const text = await file.text();
                              const backup = JSON.parse(text);
                              if (!backup.data)
                                throw new Error("Invalid backup format");
                              Object.entries(backup.data).forEach(([k, v]) => {
                                try {
                                  localStorage.setItem(k, JSON.stringify(v));
                                } catch {}
                              });
                              toast("Backup restored. Reloading...", "warn");
                              setTimeout(() => window.location.reload(), 1500);
                            } catch {
                              toast(
                                "Could not read backup file. Make sure it is a valid Mapitsi backup.",
                                "error"
                              );
                            }
                            e.target.value = "";
                          }}
                          style={{
                            display: "block",
                            fontSize: 12,
                            fontFamily: "'DM Sans',sans-serif",
                            cursor: "pointer",
                          }}
                        />
                      </div>
                    </div>
                  </Card>
                  <Card
                    title="Clear Data"
                    sub="Remove specific module data — useful for clearing test entries"
                  >
                    <div style={{ padding: "20px 24px" }}>
                      <div
                        style={{
                          background: C.warnBg,
                          border: `1px solid #FDE68A`,
                          borderRadius: 7,
                          padding: "10px 14px",
                          fontSize: 12,
                          color: C.warn,
                          fontWeight: 600,
                          marginBottom: 16,
                        }}
                      >
                        ⚠ Clearing data cannot be undone. Export a backup first.
                      </div>
                      {[
                        {
                          label: "Clear Fuel Logs",
                          key: "mcw_fuel",
                          setter: () => {
                            setFuel([]);
                            persist("mcw_fuel", []);
                          },
                        },
                        {
                          label: "Clear Maintenance Records",
                          key: "mcw_maint",
                          setter: () => {
                            setMaint([]);
                            persist("mcw_maint", []);
                          },
                        },
                        {
                          label: "Clear Timesheets",
                          key: "mcw_ts",
                          setter: () => {
                            setTs([]);
                            persist("mcw_ts", []);
                          },
                        },
                        {
                          label: "Clear Incidents",
                          key: "mcw_incidents",
                          setter: () => {
                            setIncidents([]);
                            persist("mcw_incidents", []);
                          },
                        },
                        {
                          label: "Clear Audit Trail",
                          key: "mcw_audit",
                          setter: () => {
                            setAuditLog([]);
                            persist("mcw_audit", []);
                          },
                        },
                      ].map((item) => (
                        <div
                          key={item.key}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px 0",
                            borderBottom: `1px solid ${C.border}`,
                          }}
                        >
                          <span style={{ fontSize: 12, color: C.text }}>
                            {item.label}
                          </span>
                          <button
                            onClick={() => {
                              if (
                                !window.confirm(
                                  `Clear all ${item.label.replace(
                                    "Clear ",
                                    ""
                                  )}? This cannot be undone.`
                                )
                              )
                                return;
                              item.setter();
                              toast(
                                `${item.label.replace("Clear ", "")} cleared.`,
                                "warn"
                              );
                            }}
                            style={{
                              color: C.red,
                              background: "none",
                              border: `1px solid ${C.redBorder}`,
                              borderRadius: 5,
                              padding: "4px 12px",
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: "pointer",
                              fontFamily: "'DM Sans',sans-serif",
                            }}
                          >
                            Clear
                          </button>
                        </div>
                      ))}
                      <div
                        style={{
                          marginTop: 20,
                          paddingTop: 16,
                          borderTop: `2px solid ${C.border}`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: C.red,
                            marginBottom: 10,
                          }}
                        >
                          Danger Zone
                        </div>
                        <button
                          onClick={() => {
                            if (
                              !window.confirm(
                                "⚠ RESET ALL DATA? This will permanently delete every record in the system. There is no undo. Are you absolutely sure?"
                              )
                            )
                              return;
                            if (
                              !window.confirm(
                                "Final confirmation — this will delete EVERYTHING. Type OK to confirm."
                              )
                            )
                              return;
                            const keepKeys = [
                              "mcw_users",
                              "mcw_company",
                              "mcw_sites",
                            ];
                            const allKeys = Object.keys(localStorage).filter(
                              (k) => k.startsWith("mcw_")
                            );
                            allKeys
                              .filter((k) => !keepKeys.includes(k))
                              .forEach((k) => localStorage.removeItem(k));
                            toast("All data cleared. Reloading...", "warn");
                            setTimeout(() => window.location.reload(), 1500);
                          }}
                          style={{
                            width: "100%",
                            padding: "10px",
                            background: C.redLight,
                            border: `1px solid ${C.redBorder}`,
                            borderRadius: 7,
                            color: C.red,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "'DM Sans',sans-serif",
                          }}
                        >
                          ⚠ Reset All System Data
                        </button>
                      </div>
                    </div>
                  </Card>
                  <Card title="System Information" sub="Current system status">
                    <div style={{ padding: "20px 24px" }}>
                      {[
                        { l: "Assets", v: assets.length },
                        { l: "Maintenance Records", v: maint.length },
                        { l: "Fuel Logs", v: fuel.length },
                        { l: "Timesheet Entries", v: ts.length },
                        { l: "Employees", v: employees.length },
                        { l: "Compliance Documents", v: compliance.length },
                        { l: "Incidents", v: incidents.length },
                        { l: "Audit Events", v: auditLog.length },
                        { l: "Total System Users", v: users.length },
                      ].map((s) => (
                        <div
                          key={s.l}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "7px 0",
                            borderBottom: `1px solid ${C.border}`,
                            fontSize: 12,
                          }}
                        >
                          <span style={{ color: C.muted }}>{s.l}</span>
                          <span style={{ fontWeight: 700, color: C.text }}>
                            {s.v.toLocaleString()}
                          </span>
                        </div>
                      ))}
                      <div
                        style={{
                          marginTop: 16,
                          fontSize: 11,
                          color: C.mutedLt,
                          textAlign: "center",
                        }}
                      >
                        Mapitsi AMS · Built for Mapitsi Civil Works
                        <br />
                        All data stored locally in your browser
                      </div>
                    </div>
                  </Card>
                  <Card
                    title="Change Password"
                    sub="Update password for the currently logged-in user"
                  >
                    <div style={{ padding: "20px 24px" }}>
                      <Field label="Current Password">
                        <input
                          type="password"
                          {...inp}
                          value={pwForm.current}
                          onChange={(e) =>
                            setPwForm({ ...pwForm, current: e.target.value })
                          }
                          placeholder="Enter current password"
                        />
                      </Field>
                      <Field label="New Password">
                        <input
                          type="password"
                          {...inp}
                          value={pwForm.newPw}
                          onChange={(e) =>
                            setPwForm({ ...pwForm, newPw: e.target.value })
                          }
                          placeholder="Enter new password (min 6 characters)"
                        />
                      </Field>
                      <Field label="Confirm New Password">
                        <input
                          type="password"
                          {...inp}
                          value={pwForm.confirm}
                          onChange={(e) =>
                            setPwForm({ ...pwForm, confirm: e.target.value })
                          }
                          placeholder="Confirm new password"
                        />
                      </Field>
                      <Btn
                        style={{ width: "100%", justifyContent: "center" }}
                        onClick={() => {
                          const u = users.find((x) => x.id === currentUser.id);
                          if (!u) return;
                          if (pwForm.current !== u.password) {
                            toast("Current password is incorrect.", "error");
                            return;
                          }
                          if (!pwForm.newPw || pwForm.newPw.length < 6) {
                            toast(
                              "New password must be at least 6 characters.",
                              "error"
                            );
                            return;
                          }
                          if (pwForm.newPw !== pwForm.confirm) {
                            toast("Passwords do not match.", "error");
                            return;
                          }
                          const updated = users.map((x) =>
                            x.id === u.id ? { ...x, password: pwForm.newPw } : x
                          );
                          setUsers(updated);
                          persist("mcw_users", updated);
                          setPwForm({ current: "", newPw: "", confirm: "" });
                          toast("Password updated successfully.");
                        }}
                      >
                        Update Password
                      </Btn>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}
          {/* REPORTS */}
          {tab === "Reports" && !can(currentUser, "canViewReports") && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 300,
                color: C.muted,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              ⛔ You do not have permission to view reports.
            </div>
          )}
          {tab === "Reports" && can(currentUser, "canViewReports") && (
            <div>
              {/* CONTROLS */}
              <div
                className="np"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginBottom: 22,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 800,
                      color: C.text,
                      letterSpacing: -0.5,
                      fontFamily: "'Barlow Condensed',sans-serif",
                    }}
                  >
                    MONTHLY REPORT
                  </div>
                  <div style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>
                    Select period · Generate management report · Export to PDF
                    or Excel
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    style={{
                      border: `1px solid ${C.border}`,
                      borderRadius: 7,
                      padding: "9px 13px",
                      fontSize: 13,
                      background: C.white,
                      fontFamily: "'DM Sans',sans-serif",
                      color: C.text,
                    }}
                  />
                  <Btn onClick={() => window.print()}>⬒ Export PDF</Btn>
                  <Btn onClick={exportExcel} variant="outline">
                    📊 Export Excel
                  </Btn>
                </div>
              </div>

              {/* REPORT DOCUMENT */}
              <div
                style={{
                  background: C.white,
                  borderRadius: 12,
                  border: `1px solid ${C.border}`,
                  overflow: "hidden",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                }}
              >
                {/* ── COVER PAGE ── */}
                <div
                  style={{
                    background: `linear-gradient(135deg, ${C.dark} 0%, #1C2030 100%)`,
                    padding: "48px 48px 40px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: 320,
                      height: 320,
                      background: "rgba(140,20,20,0.06)",
                      borderRadius: "50%",
                      transform: "translate(80px,-80px)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: 200,
                      height: 200,
                      background: "rgba(140,20,20,0.04)",
                      borderRadius: "50%",
                      transform: "translate(-60px,60px)",
                    }}
                  />
                  <div style={{ position: "relative" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        marginBottom: 36,
                      }}
                    >
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          background: C.red,
                          borderRadius: 10,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          boxShadow: "0 4px 16px rgba(140,20,20,0.4)",
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            color: "white",
                            fontSize: 22,
                            fontWeight: 900,
                            fontFamily: "'Barlow Condensed',sans-serif",
                          }}
                        >
                          MC
                        </span>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 26,
                            fontWeight: 900,
                            color: C.white,
                            fontFamily: "'Barlow Condensed',sans-serif",
                            letterSpacing: 1.5,
                            lineHeight: 1,
                          }}
                        >
                          {(
                            company.name || "Mapitsi Civil Works"
                          ).toUpperCase()}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: "#4B5563",
                            letterSpacing: 2.5,
                            textTransform: "uppercase",
                            marginTop: 4,
                          }}
                        >
                          {company.tagline || "Plant Management Division"}
                        </div>
                        {(company.address || company.regNumber) && (
                          <div
                            style={{
                              fontSize: 9,
                              color: "#374151",
                              marginTop: 4,
                              letterSpacing: 0.5,
                            }}
                          >
                            {company.address && (
                              <span>
                                {company.address}
                                {company.city ? ", " + company.city : ""}
                              </span>
                            )}
                            {company.regNumber && (
                              <span style={{ marginLeft: 8 }}>
                                Reg: {company.regNumber}
                              </span>
                            )}
                            {company.vatNumber && (
                              <span style={{ marginLeft: 8 }}>
                                VAT: {company.vatNumber}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      style={{
                        borderLeft: `4px solid ${C.red}`,
                        paddingLeft: 20,
                        marginBottom: 36,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 32,
                          fontWeight: 800,
                          color: C.white,
                          fontFamily: "'Barlow Condensed',sans-serif",
                          letterSpacing: 0.5,
                          lineHeight: 1.1,
                        }}
                      >
                        Asset Management
                      </div>
                      <div
                        style={{
                          fontSize: 32,
                          fontWeight: 800,
                          color: C.white,
                          fontFamily: "'Barlow Condensed',sans-serif",
                          letterSpacing: 0.5,
                          lineHeight: 1.1,
                        }}
                      >
                        Monthly Report
                      </div>
                      <div
                        style={{
                          fontSize: 18,
                          color: "#6B7280",
                          marginTop: 10,
                          fontFamily: "'Barlow Condensed',sans-serif",
                          letterSpacing: 1,
                        }}
                      >
                        {monthLabel(month).toUpperCase()}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3,1fr)",
                        gap: 12,
                      }}
                    >
                      {[
                        {
                          l: "Generated",
                          v: new Date().toLocaleDateString("en-ZA", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }),
                        },
                        { l: "Prepared By", v: currentUser?.name || "System" },
                        { l: "Classification", v: "CONFIDENTIAL" },
                      ].map((item) => (
                        <div
                          key={item.l}
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 8,
                            padding: "12px 16px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: 9,
                              color: "#4B5563",
                              textTransform: "uppercase",
                              letterSpacing: 1.5,
                              marginBottom: 4,
                            }}
                          >
                            {item.l}
                          </div>
                          <div
                            style={{
                              fontSize: 13,
                              color: C.white,
                              fontWeight: 600,
                            }}
                          >
                            {item.v}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── EXECUTIVE SUMMARY ── */}
                <div
                  style={{
                    padding: "36px 48px",
                    borderBottom: `1px solid ${C.border}`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 24,
                    }}
                  >
                    <div
                      style={{
                        width: 4,
                        height: 28,
                        background: C.red,
                        borderRadius: 2,
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: C.text,
                        textTransform: "uppercase",
                        letterSpacing: 1.2,
                      }}
                    >
                      1. Executive Summary — {monthLabel(month)}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
                      gap: 12,
                      marginBottom: 28,
                    }}
                  >
                    {[
                      {
                        l: "Assets on Register",
                        v: assets.length.toString(),
                        c: C.info,
                        sub: "registered",
                      },
                      {
                        l: "Current Book Value",
                        v: fmt(totalBook),
                        c: C.success,
                        sub: "after depreciation",
                      },
                      {
                        l: "Maintenance Cost",
                        v: fmt(rMC),
                        c: "#7c3aed",
                        sub: monthLabel(month),
                      },
                      {
                        l: "Fuel Cost",
                        v: fmt(rFC),
                        c: C.warn,
                        sub: monthLabel(month),
                      },
                      {
                        l: "Labour Hours",
                        v: `${rH.toFixed(1)} hrs`,
                        c: C.red,
                        sub: monthLabel(month),
                      },
                      {
                        l: "Total Operating Cost",
                        v: fmt(rMC + rFC),
                        c: C.text,
                        sub: "maint + fuel",
                      },
                    ].map((s) => (
                      <div
                        key={s.l}
                        style={{
                          background: C.surface,
                          borderRadius: 8,
                          padding: "16px 18px",
                          borderTop: `3px solid ${s.c}`,
                          printColorAdjust: "exact",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 9,
                            color: C.muted,
                            marginBottom: 6,
                            textTransform: "uppercase",
                            letterSpacing: 0.8,
                            fontWeight: 600,
                          }}
                        >
                          {s.l}
                        </div>
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: 800,
                            color: s.c,
                            fontFamily: "'Barlow Condensed',sans-serif",
                            letterSpacing: -0.3,
                          }}
                        >
                          {s.v}
                        </div>
                        <div
                          style={{
                            fontSize: 10,
                            color: C.mutedLt,
                            marginTop: 3,
                          }}
                        >
                          {s.sub}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))",
                      gap: 10,
                    }}
                  >
                    {[
                      {
                        l: "Overdue Maintenance",
                        v: overdue,
                        alert: overdue > 0,
                      },
                      {
                        l: "Compliance Alerts",
                        v: expiringSoon.length,
                        alert: expiringSoon.length > 0,
                      },
                      {
                        l: "Open Incidents",
                        v: openIncidents,
                        alert: openIncidents > 0,
                      },
                      {
                        l: "Poor Condition Assets",
                        v: poorConditionAssets,
                        alert: poorConditionAssets > 0,
                      },
                      {
                        l: "Budgets Overspent",
                        v: budgetsOverspent,
                        alert: budgetsOverspent > 0,
                      },
                      {
                        l: "Spares Low / Out",
                        v: sparesLow + sparesOut,
                        alert: sparesLow + sparesOut > 0,
                      },
                    ].map((s) => (
                      <div
                        key={s.l}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "10px 14px",
                          background: s.alert ? C.redLight : C.successBg,
                          borderRadius: 7,
                          border: `1px solid ${
                            s.alert ? C.redBorder : "#A7F3D0"
                          }`,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 12,
                            color: s.alert ? C.red : C.success,
                            fontWeight: 600,
                          }}
                        >
                          {s.l}
                        </span>
                        <span
                          style={{
                            fontSize: 16,
                            fontWeight: 800,
                            color: s.alert ? C.red : C.success,
                            fontFamily: "'Barlow Condensed',sans-serif",
                          }}
                        >
                          {s.v}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── DEPRECIATION ── */}
                <div
                  style={{
                    padding: "36px 48px",
                    borderBottom: `1px solid ${C.border}`,
                  }}
                  className="print-no-break"
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{
                        width: 4,
                        height: 28,
                        background: C.red,
                        borderRadius: 2,
                        flexShrink: 0,
                      }}
                    />
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: C.text,
                        textTransform: "uppercase",
                        letterSpacing: 1.2,
                      }}
                    >
                      2. Depreciation Schedule — Straight-Line Method
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4,1fr)",
                      gap: 10,
                      marginBottom: 20,
                    }}
                  >
                    {[
                      { l: "Total Cost", v: fmt(totalCost), c: C.muted },
                      {
                        l: "Total Depreciated",
                        v: fmt(totalCost - totalBook),
                        c: C.warn,
                      },
                      { l: "Net Book Value", v: fmt(totalBook), c: C.success },
                      {
                        l: "Portfolio Depr. %",
                        v:
                          totalCost > 0
                            ? `${(
                                ((totalCost - totalBook) / totalCost) *
                                100
                              ).toFixed(1)}%`
                            : "—",
                        c: C.red,
                      },
                    ].map((s) => (
                      <div
                        key={s.l}
                        style={{
                          background: C.surface,
                          borderRadius: 7,
                          padding: "12px 14px",
                          borderLeft: `3px solid ${s.c}`,
                        }}
                      >
                        <div
                          style={{
                            fontSize: 9,
                            color: C.muted,
                            textTransform: "uppercase",
                            letterSpacing: 0.6,
                            marginBottom: 4,
                          }}
                        >
                          {s.l}
                        </div>
                        <div
                          style={{
                            fontSize: 17,
                            fontWeight: 800,
                            color: s.c,
                            fontFamily: "'Barlow Condensed',sans-serif",
                          }}
                        >
                          {s.v}
                        </div>
                      </div>
                    ))}
                  </div>
                  {assets.length === 0 ? (
                    <p style={{ color: C.muted, fontSize: 13 }}>
                      No assets on record.
                    </p>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          fontSize: 11.5,
                        }}
                      >
                        <thead>
                          <tr style={{ background: C.dark }}>
                            {[
                              "Asset Name",
                              "Category",
                              "Purchase Cost",
                              "Useful Life",
                              "Rate/yr",
                              "Yrs Elapsed",
                              "Annual Depr.",
                              "Acc. Depreciation",
                              "Net Book Value",
                              "Status",
                            ].map((h) => (
                              <th
                                key={h}
                                style={{
                                  padding: "10px 12px",
                                  textAlign: "left",
                                  color: "#9CA3AF",
                                  fontWeight: 700,
                                  fontSize: 9.5,
                                  textTransform: "uppercase",
                                  letterSpacing: 0.6,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {assets.map((a, i) => {
                            const d = depreciate(a);
                            const pct =
                              Number(a.purchaseCost) > 0
                                ? (d.accumulated / Number(a.purchaseCost)) * 100
                                : 0;
                            return (
                              <tr
                                key={a.id}
                                style={{
                                  background: i % 2 === 0 ? C.white : C.surface,
                                  borderBottom: `1px solid ${C.border}`,
                                }}
                              >
                                <td
                                  style={{
                                    padding: "9px 12px",
                                    fontWeight: 700,
                                    color: C.text,
                                  }}
                                >
                                  {a.name}
                                </td>
                                <td
                                  style={{
                                    padding: "9px 12px",
                                    color: C.muted,
                                    fontSize: 11,
                                  }}
                                >
                                  {a.category}
                                </td>
                                <td
                                  style={{
                                    padding: "9px 12px",
                                    fontWeight: 600,
                                  }}
                                >
                                  {fmt(a.purchaseCost)}
                                </td>
                                <td
                                  style={{
                                    padding: "9px 12px",
                                    color: C.muted,
                                    fontSize: 11,
                                  }}
                                >
                                  {USEFUL_LIFE[a.category] || 5} yrs
                                </td>
                                <td
                                  style={{
                                    padding: "9px 12px",
                                    color: C.red,
                                    fontWeight: 700,
                                  }}
                                >
                                  {d.rate.toFixed(1)}%
                                </td>
                                <td
                                  style={{
                                    padding: "9px 12px",
                                    color: C.muted,
                                    fontSize: 11,
                                  }}
                                >
                                  {d.years.toFixed(1)}
                                </td>
                                <td style={{ padding: "9px 12px" }}>
                                  {fmt(
                                    Number(a.purchaseCost) /
                                      (USEFUL_LIFE[a.category] || 5)
                                  )}
                                </td>
                                <td style={{ padding: "9px 12px" }}>
                                  <div
                                    style={{ fontWeight: 700, color: C.warn }}
                                  >
                                    {fmt(d.accumulated)}
                                  </div>
                                  <div
                                    style={{
                                      height: 3,
                                      background: C.border,
                                      borderRadius: 2,
                                      marginTop: 4,
                                      width: 70,
                                    }}
                                  >
                                    <div
                                      style={{
                                        height: "100%",
                                        background: pct > 75 ? C.red : C.warn,
                                        borderRadius: 2,
                                        width: `${Math.min(100, pct)}%`,
                                      }}
                                    />
                                  </div>
                                </td>
                                <td
                                  style={{
                                    padding: "9px 12px",
                                    fontWeight: 800,
                                    color:
                                      d.bookValue > 0 ? C.success : C.muted,
                                    fontFamily: "'Barlow Condensed',sans-serif",
                                    fontSize: 14,
                                  }}
                                >
                                  {fmt(d.bookValue)}
                                </td>
                                <td style={{ padding: "9px 12px" }}>
                                  <span
                                    style={{
                                      background:
                                        d.bookValue <= 0
                                          ? C.redLight
                                          : pct > 75
                                          ? C.warnBg
                                          : C.successBg,
                                      color:
                                        d.bookValue <= 0
                                          ? C.red
                                          : pct > 75
                                          ? C.warn
                                          : C.success,
                                      border: `1px solid ${
                                        d.bookValue <= 0
                                          ? C.redBorder
                                          : pct > 75
                                          ? "#FDE68A"
                                          : "#A7F3D0"
                                      }`,
                                      padding: "2px 8px",
                                      borderRadius: 20,
                                      fontSize: 10,
                                      fontWeight: 600,
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {d.bookValue <= 0
                                      ? "Fully Depr."
                                      : pct > 75
                                      ? "Near End"
                                      : pct > 50
                                      ? "Mid-Life"
                                      : "Good"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr style={{ background: C.dark }}>
                            <td
                              colSpan={2}
                              style={{
                                padding: "10px 12px",
                                fontWeight: 800,
                                color: C.white,
                                fontSize: 11,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                              }}
                            >
                              Portfolio Total
                            </td>
                            <td
                              style={{
                                padding: "10px 12px",
                                fontWeight: 800,
                                color: C.white,
                              }}
                            >
                              {fmt(totalCost)}
                            </td>
                            <td colSpan={3} />
                            <td
                              style={{
                                padding: "10px 12px",
                                fontWeight: 800,
                                color: C.white,
                              }}
                            >
                              {fmt(totalCost / Math.max(1, assets.length))}
                            </td>
                            <td
                              style={{
                                padding: "10px 12px",
                                fontWeight: 800,
                                color: "#FDE68A",
                              }}
                            >
                              {fmt(totalCost - totalBook)}
                            </td>
                            <td
                              style={{
                                padding: "10px 12px",
                                fontWeight: 800,
                                color: "#6EE7B7",
                              }}
                            >
                              {fmt(totalBook)}
                            </td>
                            <td />
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>

                {/* ── MAINTENANCE ── */}
                <div
                  style={{
                    padding: "36px 48px",
                    borderBottom: `1px solid ${C.border}`,
                  }}
                  className="print-break print-no-break"
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          width: 4,
                          height: 28,
                          background: C.red,
                          borderRadius: 2,
                          flexShrink: 0,
                        }}
                      />
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: C.text,
                          textTransform: "uppercase",
                          letterSpacing: 1.2,
                        }}
                      >
                        3. Maintenance — {monthLabel(month)}
                      </div>
                    </div>
                    <div
                      style={{
                        background: "#F3F0FF",
                        border: "1px solid #DDD6FE",
                        borderRadius: 7,
                        padding: "8px 16px",
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: "#7c3aed", fontWeight: 700 }}>
                        {rM.length} records
                      </span>
                      <span style={{ color: C.muted, marginLeft: 8 }}>
                        Total:{" "}
                        <strong style={{ color: "#7c3aed" }}>{fmt(rMC)}</strong>
                      </span>
                    </div>
                  </div>
                  {rM.length === 0 ? (
                    <p style={{ color: C.muted, fontSize: 13 }}>
                      No maintenance records for this period.
                    </p>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          fontSize: 11.5,
                        }}
                      >
                        <thead>
                          <tr style={{ background: C.surface }}>
                            {[
                              "Asset",
                              "Date",
                              "Type",
                              "Description",
                              "Cost",
                              "Performed By",
                            ].map((h) => (
                              <th
                                key={h}
                                style={{
                                  padding: "9px 12px",
                                  textAlign: "left",
                                  color: C.muted,
                                  fontWeight: 700,
                                  fontSize: 9.5,
                                  textTransform: "uppercase",
                                  letterSpacing: 0.6,
                                  borderBottom: `2px solid ${C.border}`,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rM.map((m, i) => {
                            const asset = assets.find(
                              (a) => a.id === m.assetId
                            );
                            return (
                              <tr
                                key={m.id}
                                style={{
                                  background: i % 2 === 0 ? C.white : C.surface,
                                  borderBottom: `1px solid ${C.border}`,
                                }}
                              >
                                <td
                                  style={{
                                    padding: "9px 12px",
                                    fontWeight: 700,
                                    color: C.text,
                                  }}
                                >
                                  {asset?.name || "—"}
                                </td>
                                <td
                                  style={{
                                    padding: "9px 12px",
                                    color: C.muted,
                                    fontSize: 11,
                                  }}
                                >
                                  {m.date}
                                </td>
                                <td style={{ padding: "9px 12px" }}>
                                  <span
                                    style={{
                                      background: "#EFF6FF",
                                      color: C.info,
                                      border: "1px solid #BFDBFE",
                                      padding: "2px 8px",
                                      borderRadius: 20,
                                      fontSize: 10,
                                      fontWeight: 600,
                                    }}
                                  >
                                    {m.type}
                                  </span>
                                </td>
                                <td
                                  style={{
                                    padding: "9px 12px",
                                    color: C.muted,
                                    maxWidth: 200,
                                  }}
                                >
                                  {m.description || "—"}
                                </td>
                                <td
                                  style={{
                                    padding: "9px 12px",
                                    fontWeight: 700,
                                    color: "#7c3aed",
                                  }}
                                >
                                  {fmt(m.cost)}
                                </td>
                                <td
                                  style={{
                                    padding: "9px 12px",
                                    color: C.muted,
                                    fontSize: 11,
                                  }}
                                >
                                  {m.performedBy || "—"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr style={{ background: C.dark }}>
                            <td
                              colSpan={4}
                              style={{
                                padding: "10px 12px",
                                fontWeight: 800,
                                color: C.white,
                                fontSize: 11,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                              }}
                            >
                              Total Maintenance Cost — {monthLabel(month)}
                            </td>
                            <td
                              style={{
                                padding: "10px 12px",
                                fontWeight: 800,
                                color: "#DDD6FE",
                                fontSize: 14,
                                fontFamily: "'Barlow Condensed',sans-serif",
                              }}
                            >
                              {fmt(rMC)}
                            </td>
                            <td />
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>

                {/* ── FUEL ── */}
                <div
                  style={{
                    padding: "36px 48px",
                    borderBottom: `1px solid ${C.border}`,
                  }}
                  className="print-no-break"
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          width: 4,
                          height: 28,
                          background: C.red,
                          borderRadius: 2,
                          flexShrink: 0,
                        }}
                      />
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: C.text,
                          textTransform: "uppercase",
                          letterSpacing: 1.2,
                        }}
                      >
                        4. Fuel Usage — {monthLabel(month)}
                      </div>
                    </div>
                    <div
                      style={{
                        background: C.warnBg,
                        border: "1px solid #FDE68A",
                        borderRadius: 7,
                        padding: "8px 16px",
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: C.warn, fontWeight: 700 }}>
                        {rF.length} records ·{" "}
                        {rF
                          .reduce((s, f) => s + Number(f.litres || 0), 0)
                          .toFixed(0)}{" "}
                        L
                      </span>
                      <span style={{ color: C.muted, marginLeft: 8 }}>
                        Total:{" "}
                        <strong style={{ color: C.warn }}>{fmt(rFC)}</strong>
                      </span>
                    </div>
                  </div>
                  {rF.length === 0 ? (
                    <p style={{ color: C.muted, fontSize: 13 }}>
                      No fuel records for this period.
                    </p>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          fontSize: 11.5,
                        }}
                      >
                        <thead>
                          <tr style={{ background: C.surface }}>
                            {[
                              "Asset",
                              "Date",
                              "Litres",
                              "Cost (R)",
                              "Cost / Litre",
                              "Odometer / Hours",
                              "Site",
                            ].map((h) => (
                              <th
                                key={h}
                                style={{
                                  padding: "9px 12px",
                                  textAlign: "left",
                                  color: C.muted,
                                  fontWeight: 700,
                                  fontSize: 9.5,
                                  textTransform: "uppercase",
                                  letterSpacing: 0.6,
                                  borderBottom: `2px solid ${C.border}`,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rF.map((f, i) => {
                            const asset = assets.find(
                              (a) => a.id === f.assetId
                            );
                            const cpl =
                              Number(f.litres) > 0
                                ? Number(f.cost) / Number(f.litres)
                                : 0;
                            return (
                              <tr
                                key={f.id}
                                style={{
                                  background: i % 2 === 0 ? C.white : C.surface,
                                  borderBottom: `1px solid ${C.border}`,
                                }}
                              >
                                <td
                                  style={{
                                    padding: "9px 12px",
                                    fontWeight: 700,
                                    color: C.text,
                                  }}
                                >
                                  {asset?.name || "—"}
                                </td>
                                <td
                                  style={{
                                    padding: "9px 12px",
                                    color: C.muted,
                                    fontSize: 11,
                                  }}
                                >
                                  {f.date}
                                </td>
                                <td
                                  style={{
                                    padding: "9px 12px",
                                    fontWeight: 700,
                                    color: C.info,
                                  }}
                                >
                                  {f.litres} L
                                </td>
                                <td
                                  style={{
                                    padding: "9px 12px",
                                    fontWeight: 700,
                                    color: C.warn,
                                  }}
                                >
                                  {fmt(f.cost)}
                                </td>
                                <td
                                  style={{
                                    padding: "9px 12px",
                                    color: C.muted,
                                    fontSize: 11,
                                  }}
                                >
                                  {cpl > 0 ? `R ${cpl.toFixed(2)}` : "—"}
                                </td>
                                <td
                                  style={{
                                    padding: "9px 12px",
                                    color: C.muted,
                                    fontSize: 11,
                                  }}
                                >
                                  {f.odometer || "—"}
                                </td>
                                <td
                                  style={{
                                    padding: "9px 12px",
                                    color: C.muted,
                                    fontSize: 11,
                                  }}
                                >
                                  {f.site}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr style={{ background: C.dark }}>
                            <td
                              colSpan={2}
                              style={{
                                padding: "10px 12px",
                                fontWeight: 800,
                                color: C.white,
                                fontSize: 11,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                              }}
                            >
                              Totals
                            </td>
                            <td
                              style={{
                                padding: "10px 12px",
                                fontWeight: 800,
                                color: "#93C5FD",
                                fontFamily: "'Barlow Condensed',sans-serif",
                                fontSize: 14,
                              }}
                            >
                              {rF
                                .reduce((s, f) => s + Number(f.litres || 0), 0)
                                .toFixed(0)}{" "}
                              L
                            </td>
                            <td
                              style={{
                                padding: "10px 12px",
                                fontWeight: 800,
                                color: "#FDE68A",
                                fontFamily: "'Barlow Condensed',sans-serif",
                                fontSize: 14,
                              }}
                            >
                              {fmt(rFC)}
                            </td>
                            <td colSpan={3} />
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>

                {/* ── TIMESHEETS ── */}
                <div
                  style={{
                    padding: "36px 48px",
                    borderBottom: `1px solid ${C.border}`,
                  }}
                  className="print-break print-no-break"
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <div
                        style={{
                          width: 4,
                          height: 28,
                          background: C.red,
                          borderRadius: 2,
                          flexShrink: 0,
                        }}
                      />
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: C.text,
                          textTransform: "uppercase",
                          letterSpacing: 1.2,
                        }}
                      >
                        5. Labour Hours — {monthLabel(month)}
                      </div>
                    </div>
                    <div
                      style={{
                        background: C.redLight,
                        border: `1px solid ${C.redBorder}`,
                        borderRadius: 7,
                        padding: "8px 16px",
                        fontSize: 12,
                      }}
                    >
                      <span style={{ color: C.red, fontWeight: 700 }}>
                        {new Set(rT.map((t) => t.employeeName)).size} employees
                      </span>
                      <span style={{ color: C.muted, marginLeft: 8 }}>
                        Total:{" "}
                        <strong style={{ color: C.red }}>
                          {rH.toFixed(1)} hrs
                        </strong>
                      </span>
                    </div>
                  </div>
                  {rT.length === 0 ? (
                    <p style={{ color: C.muted, fontSize: 13 }}>
                      No timesheet records for this period.
                    </p>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          fontSize: 11.5,
                        }}
                      >
                        <thead>
                          <tr style={{ background: C.surface }}>
                            {[
                              "Employee",
                              "Date",
                              "Hours",
                              "Site",
                              "Task / Role",
                              "Notes",
                            ].map((h) => (
                              <th
                                key={h}
                                style={{
                                  padding: "9px 12px",
                                  textAlign: "left",
                                  color: C.muted,
                                  fontWeight: 700,
                                  fontSize: 9.5,
                                  textTransform: "uppercase",
                                  letterSpacing: 0.6,
                                  borderBottom: `2px solid ${C.border}`,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rT.map((t, i) => (
                            <tr
                              key={t.id}
                              style={{
                                background: i % 2 === 0 ? C.white : C.surface,
                                borderBottom: `1px solid ${C.border}`,
                              }}
                            >
                              <td
                                style={{
                                  padding: "9px 12px",
                                  fontWeight: 700,
                                  color: C.text,
                                }}
                              >
                                {t.employeeName}
                              </td>
                              <td
                                style={{
                                  padding: "9px 12px",
                                  color: C.muted,
                                  fontSize: 11,
                                }}
                              >
                                {t.date}
                              </td>
                              <td
                                style={{
                                  padding: "9px 12px",
                                  fontWeight: 800,
                                  color: C.red,
                                  fontFamily: "'Barlow Condensed',sans-serif",
                                  fontSize: 15,
                                }}
                              >
                                {t.hours}{" "}
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 500,
                                    color: C.muted,
                                  }}
                                >
                                  hrs
                                </span>
                              </td>
                              <td
                                style={{
                                  padding: "9px 12px",
                                  color: C.muted,
                                  fontSize: 11,
                                }}
                              >
                                {t.site}
                              </td>
                              <td style={{ padding: "9px 12px" }}>
                                {t.task || "—"}
                              </td>
                              <td
                                style={{
                                  padding: "9px 12px",
                                  color: C.mutedLt,
                                  fontSize: 11,
                                }}
                              >
                                {t.notes || "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr style={{ background: C.dark }}>
                            <td
                              colSpan={2}
                              style={{
                                padding: "10px 12px",
                                fontWeight: 800,
                                color: C.white,
                                fontSize: 11,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                              }}
                            >
                              Total Hours — {monthLabel(month)}
                            </td>
                            <td
                              style={{
                                padding: "10px 12px",
                                fontWeight: 800,
                                color: "#FCA5A5",
                                fontFamily: "'Barlow Condensed',sans-serif",
                                fontSize: 16,
                              }}
                            >
                              {rH.toFixed(1)} hrs
                            </td>
                            <td colSpan={3} />
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>

                {/* ── COMPLIANCE SNAPSHOT ── */}
                {(compliance.length > 0 || incidents.length > 0) && (
                  <div
                    style={{
                      padding: "36px 48px",
                      borderBottom: `1px solid ${C.border}`,
                    }}
                    className="print-no-break"
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 20,
                      }}
                    >
                      <div
                        style={{
                          width: 4,
                          height: 28,
                          background: C.red,
                          borderRadius: 2,
                          flexShrink: 0,
                        }}
                      />
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: C.text,
                          textTransform: "uppercase",
                          letterSpacing: 1.2,
                        }}
                      >
                        6. Compliance & Risk Snapshot
                      </div>
                    </div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 20,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: C.muted,
                            textTransform: "uppercase",
                            letterSpacing: 0.8,
                            marginBottom: 12,
                          }}
                        >
                          Compliance Status
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 8,
                          }}
                        >
                          {[
                            {
                              l: "Total Documents",
                              v: compliance.length,
                              c: C.info,
                            },
                            {
                              l: "Valid",
                              v: compliance.filter(
                                (c) => c.expiryDate && c.expiryDate >= today()
                              ).length,
                              c: C.success,
                            },
                            {
                              l: "Expired",
                              v: compliance.filter(
                                (c) => c.expiryDate && c.expiryDate < today()
                              ).length,
                              c: C.red,
                            },
                            {
                              l: "Expiring (30d)",
                              v: expiringSoon.length,
                              c: C.warn,
                            },
                          ].map((s) => (
                            <div
                              key={s.l}
                              style={{
                                background: C.surface,
                                borderRadius: 7,
                                padding: "12px 14px",
                                borderLeft: `3px solid ${s.c}`,
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 9,
                                  color: C.muted,
                                  textTransform: "uppercase",
                                  letterSpacing: 0.5,
                                  marginBottom: 3,
                                }}
                              >
                                {s.l}
                              </div>
                              <div
                                style={{
                                  fontSize: 20,
                                  fontWeight: 800,
                                  color: s.c,
                                  fontFamily: "'Barlow Condensed',sans-serif",
                                }}
                              >
                                {s.v}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: C.muted,
                            textTransform: "uppercase",
                            letterSpacing: 0.8,
                            marginBottom: 12,
                          }}
                        >
                          Incident Summary
                        </div>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 8,
                          }}
                        >
                          {[
                            {
                              l: "Total Incidents",
                              v: incidents.length,
                              c: C.info,
                            },
                            {
                              l: "Open",
                              v: openIncidents,
                              c: openIncidents > 0 ? C.red : C.success,
                            },
                            {
                              l: "Downtime (hrs)",
                              v: incidents
                                .reduce(
                                  (s, i) => s + Number(i.downtimeHours || 0),
                                  0
                                )
                                .toFixed(1),
                              c: C.warn,
                            },
                            {
                              l: "Repair Cost",
                              v: fmt(
                                incidents.reduce(
                                  (s, i) => s + Number(i.repairCost || 0),
                                  0
                                )
                              ),
                              c: C.red,
                            },
                          ].map((s) => (
                            <div
                              key={s.l}
                              style={{
                                background: C.surface,
                                borderRadius: 7,
                                padding: "12px 14px",
                                borderLeft: `3px solid ${s.c}`,
                              }}
                            >
                              <div
                                style={{
                                  fontSize: 9,
                                  color: C.muted,
                                  textTransform: "uppercase",
                                  letterSpacing: 0.5,
                                  marginBottom: 3,
                                }}
                              >
                                {s.l}
                              </div>
                              <div
                                style={{
                                  fontSize: s.l === "Repair Cost" ? 13 : 20,
                                  fontWeight: 800,
                                  color: s.c,
                                  fontFamily: "'Barlow Condensed',sans-serif",
                                }}
                              >
                                {s.v}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── REPORT FOOTER ── */}
                <div
                  style={{
                    background: C.surface,
                    padding: "20px 48px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontSize: 11, color: C.mutedLt }}>
                    {company.name || "Mapitsi Civil Works"} —{" "}
                    {monthLabel(month)} — Generated{" "}
                    {new Date().toLocaleDateString("en-ZA")}
                    {company.regNumber && ` · Reg: ${company.regNumber}`}
                  </div>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <div
                      style={{
                        width: 24,
                        height: 24,
                        background: C.red,
                        borderRadius: 4,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          color: "white",
                          fontSize: 10,
                          fontWeight: 900,
                          fontFamily: "'Barlow Condensed',sans-serif",
                        }}
                      >
                        MC
                      </span>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: C.text,
                          fontFamily: "'Barlow Condensed',sans-serif",
                          letterSpacing: 0.5,
                        }}
                      >
                        {(company.name || "Mapitsi Civil Works").toUpperCase()}
                      </div>
                      <div
                        style={{
                          fontSize: 9,
                          color: C.mutedLt,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                        }}
                      >
                        {company.reportFooter ||
                          "CONFIDENTIAL — INTERNAL USE ONLY"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODALS */}
      {modal === "asset" && (
        <Modal
          title="Register New Asset"
          subtitle="Add a new asset to the Mapitsi Civil Works register"
          onClose={() => setModal(null)}
        >
          <Field label="Asset Name" required>
            <input
              {...inp}
              value={af.name}
              onChange={(e) => setAf({ ...af, name: e.target.value })}
              placeholder="e.g. TLB 001 · Toyota Hilux DKT 123 GP"
            />
          </Field>
          <Row2>
            <Field label="Category" required>
              <select
                {...inp}
                value={af.category}
                onChange={(e) => setAf({ ...af, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                {...inp}
                value={af.status}
                onChange={(e) => setAf({ ...af, status: e.target.value })}
              >
                {ASSET_STATUS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </Row2>
          <Field label="Registration / Serial No.">
            <input
              {...inp}
              value={af.serialNumber}
              onChange={(e) => setAf({ ...af, serialNumber: e.target.value })}
              placeholder="e.g. DKT 123 GP or SN-456789"
            />
          </Field>
          <Row2>
            <Field label="Purchase Date" required>
              <input
                type="date"
                {...inp}
                value={af.purchaseDate}
                onChange={(e) => setAf({ ...af, purchaseDate: e.target.value })}
              />
            </Field>
            <Field label="Purchase Cost (R)" required>
              <input
                type="number"
                {...inp}
                value={af.purchaseCost}
                onChange={(e) => setAf({ ...af, purchaseCost: e.target.value })}
                placeholder="0.00"
              />
            </Field>
          </Row2>
          <Row2>
            <Field label="Location">
              <select
                {...inp}
                value={af.location}
                onChange={(e) => setAf({ ...af, location: e.target.value })}
              >
                {siteNames.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Assigned To">
              <input
                {...inp}
                value={af.assignedTo}
                onChange={(e) => setAf({ ...af, assignedTo: e.target.value })}
                placeholder="Driver or operator name"
              />
            </Field>
          </Row2>
          {af.purchaseCost && af.category && (
            <div
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 8,
                padding: "12px 14px",
                marginBottom: 16,
                fontSize: 12,
                color: C.muted,
              }}
            >
              <strong style={{ color: C.text }}>Depreciation preview:</strong>{" "}
              {USEFUL_LIFE[af.category] || 5}-yr straight-line @{" "}
              {((1 / (USEFUL_LIFE[af.category] || 5)) * 100).toFixed(1)}%/yr ·
              Annual write-off:{" "}
              <strong style={{ color: C.red }}>
                {fmt(
                  (Number(af.purchaseCost) || 0) /
                    (USEFUL_LIFE[af.category] || 5)
                )}
              </strong>
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <Btn
              style={{ flex: 1 }}
              onClick={() => {
                if (!af.name || !af.purchaseDate || !af.purchaseCost) {
                  toast(
                    "Fill in Asset Name, Purchase Date and Purchase Cost.",
                    "error"
                  );
                  return;
                }
                add("mcw_assets", setAssets, assets, af);
                setAf(dA);
                setModal(null);
                toast("Asset registered successfully.");
              }}
            >
              Save Asset to Register
            </Btn>
            <Btn variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Btn>
          </div>
        </Modal>
      )}

      {modal === "maint" && (
        <Modal
          title="Log Maintenance Record"
          subtitle="Record a service, repair or inspection"
          onClose={() => setModal(null)}
        >
          <Field label="Asset" required>
            <select
              {...inp}
              value={mf.assetId}
              onChange={(e) => setMf({ ...mf, assetId: e.target.value })}
            >
              <option value="">— Select Asset —</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </Field>
          <Row2>
            <Field label="Date" required>
              <input
                type="date"
                {...inp}
                value={mf.date}
                onChange={(e) => setMf({ ...mf, date: e.target.value })}
              />
            </Field>
            <Field label="Type" required>
              <select
                {...inp}
                value={mf.type}
                onChange={(e) => setMf({ ...mf, type: e.target.value })}
              >
                {MAINT_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
          </Row2>
          {mf.type === "Other" && (
            <Field label="Describe the Maintenance Type" required>
              <input
                {...inp}
                value={mf.customType || ""}
                onChange={(e) => setMf({ ...mf, customType: e.target.value })}
                placeholder="e.g. Hydraulic pump replacement..."
              />
            </Field>
          )}
          <Field label="Description / Work Done">
            <input
              {...inp}
              value={mf.description}
              onChange={(e) => setMf({ ...mf, description: e.target.value })}
              placeholder="e.g. Changed engine oil and filter, replaced front tyres"
            />
          </Field>
          <Row2>
            <Field label="Cost (R)">
              <input
                type="number"
                {...inp}
                value={mf.cost}
                onChange={(e) => setMf({ ...mf, cost: e.target.value })}
                placeholder="0.00"
              />
            </Field>
            <Field label="Performed By">
              {suppliers.length > 0 ? (
                <select
                  {...inp}
                  value={mf.performedBy}
                  onChange={(e) =>
                    setMf({ ...mf, performedBy: e.target.value })
                  }
                >
                  <option value="">— Select Supplier or type below —</option>
                  {suppliers
                    .filter(
                      (s) =>
                        s.type === "Service & Repairs" ||
                        s.type === "General Maintenance" ||
                        s.type === "Electrical" ||
                        s.type === "Hydraulics" ||
                        s.type === "Tyre Supplier"
                    )
                    .map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  <option value="__other__">Other (not in register)</option>
                </select>
              ) : (
                <input
                  {...inp}
                  value={mf.performedBy}
                  onChange={(e) =>
                    setMf({ ...mf, performedBy: e.target.value })
                  }
                  placeholder="Technician or service provider"
                />
              )}
              {mf.performedBy === "__other__" && (
                <input
                  {...inp}
                  style={{ ...inp.style, marginTop: 8 }}
                  value={mf.customPerformedBy || ""}
                  onChange={(e) =>
                    setMf({ ...mf, customPerformedBy: e.target.value })
                  }
                  placeholder="Enter name manually..."
                />
              )}
            </Field>
          </Row2>
          <Field label="Allocate to Project (optional)">
            <select
              {...inp}
              value={mf.projectId || ""}
              onChange={(e) => setMf({ ...mf, projectId: e.target.value })}
            >
              <option value="">— No Project Allocation —</option>
              {projects
                .filter((p) => p.status === "Active")
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.code ? " (" + p.code + ")" : ""}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Next Service Due Date (optional)">
            <input
              type="date"
              {...inp}
              value={mf.nextDueDate}
              onChange={(e) => setMf({ ...mf, nextDueDate: e.target.value })}
            />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn
              style={{ flex: 1 }}
              onClick={() => {
                if (!mf.assetId || !mf.date) {
                  toast("Select an asset and date.", "error");
                  return;
                }
                add("mcw_maint", setMaint, maint, {
                  ...mf,
                  type:
                    mf.type === "Other" && mf.customType
                      ? mf.customType
                      : mf.type,
                  performedBy:
                    mf.performedBy === "__other__" && mf.customPerformedBy
                      ? mf.customPerformedBy
                      : mf.performedBy,
                });

                setMf(dM);
                setModal(null);
                toast("Maintenance record saved.");
              }}
            >
              Save Maintenance Record
            </Btn>
            <Btn variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Btn>
          </div>
        </Modal>
      )}

      {modal === "fuel" && (
        <Modal
          title="Log Fuel & Usage"
          subtitle="Record a fuel fill or usage reading"
          onClose={() => setModal(null)}
        >
          <Field label="Asset" required>
            <select
              {...inp}
              value={ff.assetId}
              onChange={(e) => setFf({ ...ff, assetId: e.target.value })}
            >
              <option value="">— Select Asset —</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Date" required>
            <input
              type="date"
              {...inp}
              value={ff.date}
              onChange={(e) => setFf({ ...ff, date: e.target.value })}
            />
          </Field>
          <Row2>
            <Field label="Litres" required>
              <input
                type="number"
                {...inp}
                value={ff.litres}
                onChange={(e) => setFf({ ...ff, litres: e.target.value })}
                placeholder="e.g. 80"
              />
            </Field>
            <Field label="Total Cost (R)" required>
              <input
                type="number"
                {...inp}
                value={ff.cost}
                onChange={(e) => setFf({ ...ff, cost: e.target.value })}
                placeholder="0.00"
              />
            </Field>
          </Row2>
          <Field label="Allocate to Project (optional)">
            <select
              {...inp}
              value={ff.projectId || ""}
              onChange={(e) => setFf({ ...ff, projectId: e.target.value })}
            >
              <option value="">— No Project Allocation —</option>
              {projects
                .filter((p) => p.status === "Active")
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.code ? " (" + p.code + ")" : ""}
                  </option>
                ))}
            </select>
          </Field>
          <Row2>
            <Field label="Odometer / Hours Reading">
              <input
                {...inp}
                value={ff.odometer}
                onChange={(e) => setFf({ ...ff, odometer: e.target.value })}
                placeholder="e.g. 45 000 km or 1 200 hrs"
              />
            </Field>
            <Field label="Site">
              <select
                {...inp}
                value={ff.site}
                onChange={(e) => setFf({ ...ff, site: e.target.value })}
              >
                {SITES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </Row2>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn
              style={{ flex: 1 }}
              onClick={() => {
                if (!ff.assetId || !ff.litres || !ff.cost) {
                  toast("Fill in all required fields.", "error");
                  return;
                }
                add("mcw_fuel", setFuel, fuel, ff);
                setFf(dF);
                setModal(null);
                toast("Fuel log saved.");
              }}
            >
              Save Fuel Log
            </Btn>
            <Btn variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Btn>
          </div>
        </Modal>
      )}

      {modal === "time" && (
        <Modal
          title="Log Timesheet Entry"
          subtitle="Record daily hours for an employee"
          onClose={() => setModal(null)}
        >
          <Field label="Employee" required>
            {employees.length > 0 ? (
              <select
                {...inp}
                value={tf.employeeName}
                onChange={(e) => setTf({ ...tf, employeeName: e.target.value })}
              >
                <option value="">— Select Employee —</option>
                {employees
                  .filter((e) => e.status === "Active")
                  .map((e) => (
                    <option key={e.id} value={e.name}>
                      {e.name} · {e.role}
                    </option>
                  ))}
              </select>
            ) : (
              <input
                {...inp}
                value={tf.employeeName}
                onChange={(e) => setTf({ ...tf, employeeName: e.target.value })}
                placeholder="e.g. Sipho Dlamini (add employees in the Employees tab)"
              />
            )}
          </Field>
          <Row2>
            <Field label="Date" required>
              <input
                type="date"
                {...inp}
                value={tf.date}
                onChange={(e) => setTf({ ...tf, date: e.target.value })}
              />
            </Field>
            <Field label="Hours Worked" required>
              <input
                type="number"
                {...inp}
                value={tf.hours}
                onChange={(e) => setTf({ ...tf, hours: e.target.value })}
                placeholder="8"
                step="0.5"
              />
            </Field>
          </Row2>
          <Row2>
            <Field label="Site">
              <select
                {...inp}
                value={tf.site}
                onChange={(e) => setTf({ ...tf, site: e.target.value })}
              >
                {SITES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Task / Role">
              <input
                {...inp}
                value={tf.task}
                onChange={(e) => setTf({ ...tf, task: e.target.value })}
                placeholder="e.g. TLB Operator, Site Supervisor"
              />
            </Field>
          </Row2>
          <Field label="Notes (optional)">
            <input
              {...inp}
              value={tf.notes}
              onChange={(e) => setTf({ ...tf, notes: e.target.value })}
              placeholder="Additional information..."
            />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn
              style={{ flex: 1 }}
              onClick={() => {
                if (!tf.employeeName || !tf.hours) {
                  toast("Enter employee name and hours.", "error");
                  return;
                }
                add("mcw_ts", setTs, ts, tf);
                setTf(dT);
                setModal(null);
                toast("Timesheet entry saved.");
              }}
            >
              Save Timesheet Entry
            </Btn>
            <Btn variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Btn>
          </div>
        </Modal>
      )}
      {modal === "transfer" && (
        <Modal
          title="Log Asset Transfer"
          subtitle="Record a site-to-site movement — builds a permanent location history"
          onClose={()=>setModal(null)}
        >
          <Field label="Asset" required>
            <select {...inp} value={transF.assetId} onChange={e=>{
              const asset=assets.find(a=>a.id===e.target.value);
              setTransF({...transF,assetId:e.target.value,fromSite:asset?getAssetCurrentSite(asset):""});
            }}>
              <option value="">— Select Asset —</option>
              {assets.filter(a=>a.status!=="Disposed").map(a=>(
                <option key={a.id} value={a.id}>{a.name} · {a.category} · currently at {getAssetCurrentSite(a)}</option>
              ))}
            </select>
          </Field>

          {transF.assetId&&(()=>{
            const asset=assets.find(a=>a.id===transF.assetId);
            const history=getAssetTransferHistory(transF.assetId);
            return (
              <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:12}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:6}}>
                  <div>
                    <span style={{color:C.muted}}>Currently at: </span>
                    <strong style={{color:C.info}}>{getAssetCurrentSite(asset)}</strong>
                  </div>
                  <div>
                    <span style={{color:C.muted}}>Transfer history: </span>
                    <strong style={{color:C.text}}>{history.length} previous movement{history.length!==1?"s":""}</strong>
                  </div>
                  {getDaysSinceLastTransfer(transF.assetId)!==null&&(
                    <div>
                      <span style={{color:C.muted}}>Last moved: </span>
                      <strong style={{color:C.text}}>{getDaysSinceLastTransfer(transF.assetId)} days ago</strong>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          <Row2>
            <Field label="Transfer Date" required>
              <input type="date" {...inp} value={transF.transferDate} onChange={e=>setTransF({...transF,transferDate:e.target.value})}/>
            </Field>
            <Field label="Reason for Transfer" required>
              <select {...inp} value={transF.reason} onChange={e=>setTransF({...transF,reason:e.target.value})}>
                {TRANSFER_REASONS.map(r=><option key={r}>{r}</option>)}
              </select>
            </Field>
          </Row2>

          <Row2>
            <Field label="From Site" required>
              <select {...inp} value={transF.fromSite} onChange={e=>setTransF({...transF,fromSite:e.target.value})}>
                <option value="">— Select Site —</option>
                {siteNames.map(s=><option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="To Site" required>
              <select {...inp} value={transF.toSite} onChange={e=>setTransF({...transF,toSite:e.target.value})}>
                <option value="">— Select Site —</option>
                {siteNames.filter(s=>s!==transF.fromSite).map(s=><option key={s}>{s}</option>)}
              </select>
            </Field>
          </Row2>

          <Row2>
            <Field label="Transport Method">
              <select {...inp} value={transF.transportMethod} onChange={e=>setTransF({...transF,transportMethod:e.target.value})}>
                {TRANSFER_TRANSPORT.map(t=><option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Condition at Transfer" required>
              <select {...inp} value={transF.conditionAtTransfer} onChange={e=>setTransF({...transF,conditionAtTransfer:e.target.value})}>
                {TRANSFER_CONDITION.map(c=><option key={c}>{c}</option>)}
              </select>
            </Field>
          </Row2>

          {(transF.conditionAtTransfer==="Poor — Noted"||transF.conditionAtTransfer==="Damaged — Report Filed")&&(
            <div style={{background:C.redLight,border:`1px solid ${C.redBorder}`,borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:12,color:C.red,fontWeight:600}}>
              ⚠ Condition issue noted — this transfer will be flagged in the Notification Centre and appear on reports. Document all damage clearly in the notes field below.
            </div>
          )}

          <Row2>
            <Field label="Authorised By">
              <input {...inp} value={transF.authorisedBy} onChange={e=>setTransF({...transF,authorisedBy:e.target.value})} placeholder="Name of approving manager"/>
            </Field>
            <Field label="Transported By / Driver">
              <input {...inp} value={transF.transportedBy} onChange={e=>setTransF({...transF,transportedBy:e.target.value})} placeholder="Name of driver or transport company"/>
            </Field>
          </Row2>

          <Field label="Odometer / Hours at Transfer">
            <input {...inp} value={transF.odometerAtTransfer} onChange={e=>setTransF({...transF,odometerAtTransfer:e.target.value})} placeholder="e.g. 45 230 km or 1 340 hrs"/>
          </Field>

          <Field label="Notes">
            <input {...inp} value={transF.notes} onChange={e=>setTransF({...transF,notes:e.target.value})} placeholder="Reason for transfer, condition details, special instructions..."/>
          </Field>

          <div style={{display:"flex",gap:10}}>
            <Btn style={{flex:1,justifyContent:"center"}} onClick={()=>{
              if(!transF.assetId||!transF.fromSite||!transF.toSite||!transF.transferDate){
                toast("Select an asset, transfer date, and both sites.","error"); return;
              }
              if(transF.fromSite===transF.toSite){
                toast("From site and To site cannot be the same.","error"); return;
              }
              if((transF.conditionAtTransfer==="Poor — Noted"||transF.conditionAtTransfer==="Damaged — Report Filed")&&!transF.notes){
                toast("Condition issue noted — please describe the damage in the notes field.","error"); return;
              }
              const newTransfer={...transF,id:Date.now().toString()+Math.random().toString(36).slice(2)};
              const updated=[...transfers,newTransfer];
              setTransfers(updated);
              try{localStorage.setItem("mcw_transfers",JSON.stringify(updated));}catch{}
              update("mcw_assets",setAssets,assets,transF.assetId,{location:transF.toSite});
              logAudit("ADD","Asset Transfer Log",`${assets.find(a=>a.id===transF.assetId)?.name||"Asset"} transferred from ${transF.fromSite} to ${transF.toSite}`);
              setTransF(dTrans);
              setModal(null);
              toast(`Transfer logged — asset moved to ${transF.toSite}.`);
            }}>Log Transfer</Btn>
            <Btn variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn>
          </div>
        </Modal>
      )}
      {modal === "contractor" && (
        <div style={{position:"fixed",inset:0,background:"rgba(17,19,24,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:20,backdropFilter:"blur(3px)"}}>
          <div style={{background:C.white,borderRadius:14,width:"100%",maxWidth:680,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 24px 80px rgba(0,0,0,0.3)",border:`1px solid ${C.border}`}}>
            <div style={{padding:"20px 28px",borderBottom:`1px solid ${C.border}`,background:C.surface,display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"sticky",top:0,zIndex:10}}>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:C.text}}>{conF.id?"Edit Contractor":"Register New Contractor"}</div>
                <div style={{fontSize:12,color:C.muted,marginTop:2}}>CIDB grading, compliance documents and contact details</div>
              </div>
              <button onClick={()=>setModal(null)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:C.mutedLt,padding:"0 4px"}}>✕</button>
            </div>

            {/* MODAL TABS */}
            <div style={{display:"flex",gap:0,borderBottom:`1px solid ${C.border}`,background:C.surface,padding:"0 28px"}}>
              {[
                {id:"details",label:"Company Details"},
                {id:"compliance",label:"Compliance Docs"},
                {id:"banking",label:"Banking"},
              ].map(t=>(
                <button key={t.id} onClick={()=>setConSettingsTab(t.id)} style={{padding:"10px 18px",border:"none",background:"none",cursor:"pointer",fontSize:12,fontWeight:conSettingsTab===t.id?700:400,color:conSettingsTab===t.id?C.red:C.muted,borderBottom:`2px solid ${conSettingsTab===t.id?C.red:"transparent"}`,fontFamily:"'DM Sans',sans-serif",marginBottom:-1}}>
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{padding:"22px 28px"}}>
              {/* DETAILS TAB */}
              {conSettingsTab==="details"&&(
                <div>
                  <Row2>
                    <Field label="Registered Company Name" required>
                      <input {...inp} value={conF.name} onChange={e=>setConF({...conF,name:e.target.value})} placeholder="e.g. ABC Construction Pty Ltd"/>
                    </Field>
                    <Field label="Trading Name (if different)">
                      <input {...inp} value={conF.tradingName} onChange={e=>setConF({...conF,tradingName:e.target.value})} placeholder="e.g. ABC Civil"/>
                    </Field>
                  </Row2>
                  <Row2>
                    <Field label="Company Registration No.">
                      <input {...inp} value={conF.registrationNumber} onChange={e=>setConF({...conF,registrationNumber:e.target.value})} placeholder="e.g. 2018/123456/07"/>
                    </Field>
                    <Field label="VAT Number">
                      <input {...inp} value={conF.vatNumber} onChange={e=>setConF({...conF,vatNumber:e.target.value})} placeholder="e.g. 4123456789"/>
                    </Field>
                  </Row2>
                  <Row2>
                    <Field label="CIDB Grade" required>
                      <select {...inp} value={conF.cidbGrade} onChange={e=>setConF({...conF,cidbGrade:e.target.value})}>
                        {CIDB_GRADES.map(g=><option key={g} value={g}>Grade {g}</option>)}
                      </select>
                    </Field>
                    <Field label="CIDB Class" required>
                      <select {...inp} value={conF.cidbClass} onChange={e=>setConF({...conF,cidbClass:e.target.value})}>
                        {CIDB_CLASSES.map(c=><option key={c}>{c}</option>)}
                      </select>
                    </Field>
                  </Row2>
                  <Field label="Types of Work Performed">
                    <div style={{display:"flex",flexWrap:"wrap",gap:8,padding:"10px 12px",border:`1px solid ${C.border}`,borderRadius:7,background:C.white,minHeight:44}}>
                      {CONTRACTOR_WORK_TYPES.map(wt=>{
                        const selected=(conF.workTypes||[]).includes(wt);
                        return (
                          <button key={wt} onClick={()=>{
                            const cur=conF.workTypes||[];
                            setConF({...conF,workTypes:selected?cur.filter(x=>x!==wt):[...cur,wt]});
                          }} style={{padding:"3px 12px",borderRadius:20,border:`1px solid ${selected?C.red:C.border}`,background:selected?C.redLight:"transparent",color:selected?C.red:C.muted,fontSize:11,fontWeight:selected?700:400,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.1s"}}>
                            {wt}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                  <Row2>
                    <Field label="Contact Person">
                      <input {...inp} value={conF.contactPerson} onChange={e=>setConF({...conF,contactPerson:e.target.value})} placeholder="e.g. John Mokoena"/>
                    </Field>
                    <Field label="Phone Number">
                      <input {...inp} value={conF.phone} onChange={e=>setConF({...conF,phone:e.target.value})} placeholder="e.g. 082 123 4567"/>
                    </Field>
                  </Row2>
                  <Row2>
                    <Field label="Email Address">
                      <input {...inp} value={conF.email} onChange={e=>setConF({...conF,email:e.target.value})} placeholder="e.g. john@abccivil.co.za"/>
                    </Field>
                    <Field label="Status">
                      <select {...inp} value={conF.status} onChange={e=>setConF({...conF,status:e.target.value})}>
                        {CONTRACTOR_STATUS.map(s=><option key={s}>{s}</option>)}
                      </select>
                    </Field>
                  </Row2>
                  <Field label="Physical Address">
                    <input {...inp} value={conF.address} onChange={e=>setConF({...conF,address:e.target.value})} placeholder="e.g. 12 Industrial Road, Pretoria"/>
                  </Field>
                  <Field label="Notes">
                    <input {...inp} value={conF.notes} onChange={e=>setConF({...conF,notes:e.target.value})} placeholder="Performance history, special conditions, blacklist reason if applicable..."/>
                  </Field>
                </div>
              )}

              {/* COMPLIANCE TAB */}
              {conSettingsTab==="compliance"&&(
                <div>
                  <div style={{background:C.infoBg,border:`1px solid #BFDBFE`,borderRadius:8,padding:"12px 16px",marginBottom:20,fontSize:12,color:C.info}}>
                    <strong>Legal requirement:</strong> All four documents must be valid before awarding any work. Expired documents expose Mapitsi Civil Works to joint liability under the Construction Industry Development Board Act.
                  </div>

                  {/* CIDB */}
                  <div style={{background:C.surface,borderRadius:9,border:`1px solid ${C.border}`,padding:"16px 18px",marginBottom:14}}>
                    <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:12}}>CIDB Certificate</div>
                    <Row2>
                      <Field label="Certificate Expiry Date" required>
                        <input type="date" {...inp} value={conF.cidbExpiryDate} onChange={e=>setConF({...conF,cidbExpiryDate:e.target.value})}/>
                      </Field>
                      <Field label="CIDB Grade">
                        <select {...inp} value={conF.cidbGrade} onChange={e=>setConF({...conF,cidbGrade:e.target.value})}>
                          {CIDB_GRADES.map(g=><option key={g} value={g}>Grade {g}</option>)}
                        </select>
                      </Field>
                    </Row2>
                    {conF.cidbExpiryDate&&(()=>{
                      const days=Math.round((new Date(conF.cidbExpiryDate)-new Date())/(1000*60*60*24));
                      return <div style={{fontSize:11,color:days<0?C.red:days<=30?C.warn:C.success,fontWeight:600}}>{days<0?`⚠ Expired ${Math.abs(days)} days ago`:days<=30?`⚐ Expires in ${days} days`:`✓ Valid for ${days} days`}</div>;
                    })()}
                  </div>

                  {/* TAX CLEARANCE */}
                  <div style={{background:C.surface,borderRadius:9,border:`1px solid ${C.border}`,padding:"16px 18px",marginBottom:14}}>
                    <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:12}}>Tax Clearance Certificate</div>
                    <Row2>
                      <Field label="Reference Number">
                        <input {...inp} value={conF.taxClearanceNumber} onChange={e=>setConF({...conF,taxClearanceNumber:e.target.value})} placeholder="e.g. TCC-2024-123456"/>
                      </Field>
                      <Field label="Expiry Date" required>
                        <input type="date" {...inp} value={conF.taxClearanceExpiry} onChange={e=>setConF({...conF,taxClearanceExpiry:e.target.value})}/>
                      </Field>
                    </Row2>
                    {conF.taxClearanceExpiry&&(()=>{
                      const days=Math.round((new Date(conF.taxClearanceExpiry)-new Date())/(1000*60*60*24));
                      return <div style={{fontSize:11,color:days<0?C.red:days<=30?C.warn:C.success,fontWeight:600}}>{days<0?`⚠ Expired ${Math.abs(days)} days ago`:days<=30?`⚐ Expires in ${days} days`:`✓ Valid for ${days} days`}</div>;
                    })()}
                  </div>

                  {/* PUBLIC LIABILITY */}
                  <div style={{background:C.surface,borderRadius:9,border:`1px solid ${C.border}`,padding:"16px 18px",marginBottom:14}}>
                    <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:12}}>Public Liability Insurance</div>
                    <Row2>
                      <Field label="Insurer Name">
                        <input {...inp} value={conF.publicLiabilityInsurer} onChange={e=>setConF({...conF,publicLiabilityInsurer:e.target.value})} placeholder="e.g. Santam, Old Mutual"/>
                      </Field>
                      <Field label="Cover Amount (R)">
                        <input type="number" {...inp} value={conF.publicLiabilityAmount} onChange={e=>setConF({...conF,publicLiabilityAmount:e.target.value})} placeholder="e.g. 5000000"/>
                      </Field>
                    </Row2>
                    <Field label="Policy Expiry Date" required>
                      <input type="date" {...inp} value={conF.publicLiabilityExpiry} onChange={e=>setConF({...conF,publicLiabilityExpiry:e.target.value})}/>
                    </Field>
                    {conF.publicLiabilityExpiry&&(()=>{
                      const days=Math.round((new Date(conF.publicLiabilityExpiry)-new Date())/(1000*60*60*24));
                      return <div style={{fontSize:11,color:days<0?C.red:days<=30?C.warn:C.success,fontWeight:600}}>{days<0?`⚠ Expired ${Math.abs(days)} days ago`:days<=30?`⚐ Expires in ${days} days`:`✓ Valid for ${days} days`}</div>;
                    })()}
                  </div>

                  {/* COIDA */}
                  <div style={{background:C.surface,borderRadius:9,border:`1px solid ${C.border}`,padding:"16px 18px",marginBottom:14}}>
                    <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:12}}>COIDA — Workman's Compensation</div>
                    <Row2>
                      <Field label="Registration Number">
                        <input {...inp} value={conF.coidaRegistrationNumber} onChange={e=>setConF({...conF,coidaRegistrationNumber:e.target.value})} placeholder="e.g. W12345678"/>
                      </Field>
                      <Field label="Letter of Good Standing Expiry" required>
                        <input type="date" {...inp} value={conF.coidaExpiryDate} onChange={e=>setConF({...conF,coidaExpiryDate:e.target.value})}/>
                      </Field>
                    </Row2>
                    {conF.coidaExpiryDate&&(()=>{
                      const days=Math.round((new Date(conF.coidaExpiryDate)-new Date())/(1000*60*60*24));
                      return <div style={{fontSize:11,color:days<0?C.red:days<=30?C.warn:C.success,fontWeight:600}}>{days<0?`⚠ Expired ${Math.abs(days)} days ago`:days<=30?`⚐ Expires in ${days} days`:`✓ Valid for ${days} days`}</div>;
                    })()}
                  </div>
                </div>
              )}

              {/* BANKING TAB */}
              {conSettingsTab==="banking"&&(
                <div>
                  <div style={{background:C.warnBg,border:`1px solid #FDE68A`,borderRadius:8,padding:"12px 16px",marginBottom:20,fontSize:12,color:C.warn}}>
                    <strong>Security note:</strong> Banking details are stored locally on this device only. Verify banking details directly with the contractor before any payment — never update based on email or phone requests.
                  </div>
                  <Field label="Bank Name">
                    <input {...inp} value={conF.bankName} onChange={e=>setConF({...conF,bankName:e.target.value})} placeholder="e.g. First National Bank, Standard Bank"/>
                  </Field>
                  <Row2>
                    <Field label="Account Number">
                      <input {...inp} value={conF.bankAccountNumber} onChange={e=>setConF({...conF,bankAccountNumber:e.target.value})} placeholder="e.g. 62123456789"/>
                    </Field>
                    <Field label="Branch Code">
                      <input {...inp} value={conF.bankBranchCode} onChange={e=>setConF({...conF,bankBranchCode:e.target.value})} placeholder="e.g. 250655"/>
                    </Field>
                  </Row2>
                </div>
              )}

              {/* SAVE BUTTON */}
              <div style={{display:"flex",gap:10,marginTop:20,paddingTop:16,borderTop:`1px solid ${C.border}`}}>
                <Btn style={{flex:1,justifyContent:"center"}} onClick={()=>{
                  if(!conF.name){toast("Enter the company name.","error");return;}
                  if(!conF.cidbGrade||!conF.cidbClass){toast("CIDB grade and class are required.","error");return;}
                  if(conF.id){
                    update("mcw_contractors",setContractors,contractors,conF.id,conF);
                    toast("Contractor record updated.");
                  } else {
                    add("mcw_contractors",setContractors,contractors,conF);
                    toast("Contractor registered successfully.");
                  }
                  setConF(dCon);
                  setModal(null);
                }}>
                  {conF.id?"Save Changes":"Register Contractor"}
                </Btn>
                <Btn variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn>
              </div>
            </div>
          </div>
        </div>
      )}
      {modal === "preop" && (
        <div style={{position:"fixed",inset:0,background:"rgba(17,19,24,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:9999,padding:20,backdropFilter:"blur(3px)"}}>
          <div style={{background:C.white,borderRadius:14,width:"100%",maxWidth:680,maxHeight:"92vh",overflowY:"auto",boxShadow:"0 24px 80px rgba(0,0,0,0.3)",border:`1px solid ${C.border}`}}>
            {/* MODAL HEADER */}
            <div style={{padding:"20px 28px",borderBottom:`1px solid ${C.border}`,background:C.surface,display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:C.text}}>Daily Pre-Operation Checklist</div>
                <div style={{fontSize:12,color:C.muted,marginTop:2}}>Complete before starting any machine — operator sign-off required</div>
              </div>
              <button onClick={()=>setModal(null)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:C.mutedLt,padding:"0 4px"}}>✕</button>
            </div>
            <div style={{padding:"22px 28px"}}>
              {/* ASSET & OPERATOR */}
              <Row2>
                <Field label="Asset" required>
                  <select {...inp} value={preopF.assetId} onChange={e=>setPreopF({...preopF,assetId:e.target.value})}>
                    <option value="">— Select Asset —</option>
                    {assets.filter(a=>a.status==="Active"||a.status==="Under Maintenance").map(a=>(
                      <option key={a.id} value={a.id}>{a.name} · {a.category}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Operator Name" required>
                  {employees.length>0?(
                    <select {...inp} value={preopF.operatorName} onChange={e=>setPreopF({...preopF,operatorName:e.target.value})}>
                      <option value="">— Select Operator —</option>
                      {employees.filter(e=>e.status==="Active").map(e=>(
                        <option key={e.id} value={e.name}>{e.name} · {e.role}</option>
                      ))}
                    </select>
                  ):(
                    <input {...inp} value={preopF.operatorName} onChange={e=>setPreopF({...preopF,operatorName:e.target.value})} placeholder="Operator full name"/>
                  )}
                </Field>
              </Row2>
              <Row2>
                <Field label="Date" required>
                  <input type="date" {...inp} value={preopF.date} onChange={e=>setPreopF({...preopF,date:e.target.value})}/>
                </Field>
                <Field label="Time">
                  <input type="time" {...inp} value={preopF.time} onChange={e=>setPreopF({...preopF,time:e.target.value})}/>
                </Field>
              </Row2>
              <Row2>
                <Field label="Odometer / Hours Reading">
                  <input {...inp} value={preopF.odometerReading} onChange={e=>setPreopF({...preopF,odometerReading:e.target.value})} placeholder="e.g. 12 450 km or 890 hrs"/>
                </Field>
                <Field label="Fuel Level">
                  <select {...inp} value={preopF.fuelLevel} onChange={e=>setPreopF({...preopF,fuelLevel:e.target.value})}>
                    {["Full","3/4","1/2","1/4","Low — Needs Refuel"].map(f=><option key={f}>{f}</option>)}
                  </select>
                </Field>
              </Row2>

              {/* INSPECTION ITEMS */}
              <div style={{background:C.surface,borderRadius:10,border:`1px solid ${C.border}`,marginBottom:18,overflow:"hidden"}}>
                <div style={{padding:"12px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{fontSize:12,fontWeight:700,color:C.text,textTransform:"uppercase",letterSpacing:0.8}}>Inspection Items</div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={()=>setPreopF({...preopF,checks:Object.fromEntries(PREOP_CHECKS.map(c=>[c.id,"pass"]))})} style={{background:C.successBg,border:`1px solid #A7F3D0`,borderRadius:5,padding:"4px 12px",fontSize:11,color:C.success,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>✓ All Pass</button>
                    <button onClick={()=>setPreopF({...preopF,checks:Object.fromEntries(PREOP_CHECKS.map(c=>[c.id,"na"]))})} style={{background:"#F3F4F6",border:`1px solid ${C.border}`,borderRadius:5,padding:"4px 12px",fontSize:11,color:C.muted,fontWeight:700,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>All N/A</button>
                  </div>
                </div>
                <div>
                  {PREOP_CHECKS.map((check,idx)=>{
                    const val=preopF.checks?.[check.id]||"pass";
                    const isFail=val==="fail";
                    return (
                      <div key={check.id} style={{display:"flex",alignItems:"center",gap:14,padding:"11px 16px",borderBottom:idx<PREOP_CHECKS.length-1?`1px solid ${C.border}`:"none",background:isFail?C.redLight:"transparent",transition:"background 0.15s"}}>
                        <span style={{fontSize:18,flexShrink:0}}>{check.icon}</span>
                        <div style={{flex:1,fontSize:13,fontWeight:isFail?700:400,color:isFail?C.red:C.text}}>{check.label}</div>
                        <div style={{display:"flex",gap:6,flexShrink:0}}>
                          {[
                            {v:"pass",label:"Pass",bg:val==="pass"?C.success:"#F3F4F6",c:val==="pass"?"white":C.muted,bc:val==="pass"?"transparent":C.border},
                            {v:"fail",label:"Fail",bg:val==="fail"?C.red:"#F3F4F6",c:val==="fail"?"white":C.muted,bc:val==="fail"?"transparent":C.border},
                            {v:"na",  label:"N/A", bg:val==="na"?C.muted:"#F3F4F6",c:val==="na"?"white":C.muted,bc:val==="na"?"transparent":C.border},
                          ].map(btn=>(
                            <button key={btn.v} onClick={()=>setPreopF({...preopF,checks:{...preopF.checks,[check.id]:btn.v}})} style={{background:btn.bg,color:btn.c,border:`1px solid ${btn.bc}`,borderRadius:5,padding:"5px 12px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.1s",minWidth:44}}>
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* DEFECT NOTES — only shown if any fail */}
              {PREOP_CHECKS.some(c=>preopF.checks?.[c.id]==="fail")&&(
                <div style={{background:C.redLight,border:`1px solid ${C.redBorder}`,borderRadius:8,padding:"14px 16px",marginBottom:18}}>
                  <div style={{fontSize:12,fontWeight:700,color:C.red,marginBottom:8}}>
                    ⚠ Defects found — {PREOP_CHECKS.filter(c=>preopF.checks?.[c.id]==="fail").map(c=>c.label).join(", ")}
                  </div>
                  <Field label="Defect Description / Notes" required>
                    <input {...inp} value={preopF.defectNotes} onChange={e=>setPreopF({...preopF,defectNotes:e.target.value})} placeholder="Describe each defect in detail — what was found, estimated severity, any immediate action taken..."/>
                  </Field>
                </div>
              )}

              <Field label="Supervisor / Witness Name (optional)">
                <input {...inp} value={preopF.supervisorName} onChange={e=>setPreopF({...preopF,supervisorName:e.target.value})} placeholder="Name of supervisor who witnessed the check"/>
              </Field>

              {/* SUBMIT */}
              <div style={{display:"flex",gap:10,marginTop:4}}>
                <Btn style={{flex:1,justifyContent:"center"}} onClick={()=>{
                  if(!preopF.assetId||!preopF.operatorName){
                    toast("Select an asset and operator.","error"); return;
                  }
                  if(PREOP_CHECKS.some(c=>preopF.checks?.[c.id]==="fail")&&!preopF.defectNotes){
                    toast("Defects were found — please describe them in the notes field.","error"); return;
                  }
                  const newRecord={...preopF,id:Date.now().toString()+Math.random().toString(36).slice(2)};
                  const updated=[...preops,newRecord];
                  setPreops(updated);
                  try{localStorage.setItem("mcw_preops",JSON.stringify(updated));}catch{}
                  logAudit("ADD","Pre-Op Checklists",`Pre-op checklist completed for ${assets.find(a=>a.id===preopF.assetId)?.name||"asset"} by ${preopF.operatorName}`);
                  const hasDefect=PREOP_CHECKS.some(c=>preopF.checks?.[c.id]==="fail");
                  setPreopF({...dPreop,date:today(),time:new Date().toTimeString().slice(0,5)});
                  setModal(null);
                  toast(hasDefect?"Checklist saved — defects logged and flagged for attention.":"Checklist saved — all checks passed. ✓",hasDefect?"warn":"success");
                }}>
                  {PREOP_CHECKS.some(c=>preopF.checks?.[c.id]==="fail")?"⚠ Submit with Defects":"✓ Submit — All Clear"}
                </Btn>
                <Btn variant="ghost" onClick={()=>setModal(null)}>Cancel</Btn>
              </div>
            </div>
          </div>
        </div>
      )}
      {modal === "budget" && (
        <Modal
          title="Add Budget Line"
          subtitle="Set a monthly spending budget for a category and site"
          onClose={() => setModal(null)}
        >
          <Row2>
            <Field label="Month" required>
              <input
                type="month"
                {...inp}
                value={bF.month}
                onChange={(e) => setBF({ ...bF, month: e.target.value })}
              />
            </Field>
            <Field label="Category" required>
              <select
                {...inp}
                value={bF.category}
                onChange={(e) => setBF({ ...bF, category: e.target.value })}
              >
                {BUDGET_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          </Row2>
          <Row2>
            <Field label="Site">
              <select
                {...inp}
                value={bF.site}
                onChange={(e) => setBF({ ...bF, site: e.target.value })}
              >
                {SITES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Budget Amount (R)" required>
              <input
                type="number"
                {...inp}
                value={bF.budgetAmount}
                onChange={(e) => setBF({ ...bF, budgetAmount: e.target.value })}
                placeholder="0.00"
              />
            </Field>
          </Row2>
          <Field label="Notes">
            <input
              {...inp}
              value={bF.notes}
              onChange={(e) => setBF({ ...bF, notes: e.target.value })}
              placeholder="e.g. Increased for Q2 planned maintenance..."
            />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn
              style={{ flex: 1 }}
              onClick={() => {
                if (!bF.budgetAmount || !bF.month) {
                  toast("Enter a month and budget amount.", "error");
                  return;
                }
                add("mcw_budgets", setBudgets, budgets, bF);
                setBF(dB);
                setModal(null);
              }}
            >
              Save Budget
            </Btn>
            <Btn variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Btn>
          </div>
        </Modal>
      )}

      {modal === "hire" && (
        <Modal
          title="Log Equipment Hire"
          subtitle="Record hired-in plant equipment"
          onClose={() => setModal(null)}
        >
          <Row2>
            <Field label="Equipment Description" required>
              <input
                {...inp}
                value={hF.assetDescription}
                onChange={(e) =>
                  setHF({ ...hF, assetDescription: e.target.value })
                }
                placeholder="e.g. 20T Excavator, 14T Roller"
              />
            </Field>
            <Field label="Category">
              <select
                {...inp}
                value={hF.category}
                onChange={(e) => setHF({ ...hF, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          </Row2>
          <Row2>
            <Field label="Hire Company">
              <input
                {...inp}
                value={hF.hireCompany}
                onChange={(e) => setHF({ ...hF, hireCompany: e.target.value })}
                placeholder="e.g. Rent-A-Plant Pty Ltd"
              />
            </Field>
            <Field label="Daily Rate (R)" required>
              <input
                type="number"
                {...inp}
                value={hF.dailyRate}
                onChange={(e) => setHF({ ...hF, dailyRate: e.target.value })}
                placeholder="0.00"
              />
            </Field>
          </Row2>
          <Row2>
            <Field label="Hire Start Date" required>
              <input
                type="date"
                {...inp}
                value={hF.startDate}
                onChange={(e) => setHF({ ...hF, startDate: e.target.value })}
              />
            </Field>
            <Field label="Expected Return Date">
              <input
                type="date"
                {...inp}
                value={hF.expectedReturnDate}
                onChange={(e) =>
                  setHF({ ...hF, expectedReturnDate: e.target.value })
                }
              />
            </Field>
          </Row2>
          <Row2>
            <Field label="Actual Return Date (if returned)">
              <input
                type="date"
                {...inp}
                value={hF.actualReturnDate}
                onChange={(e) =>
                  setHF({ ...hF, actualReturnDate: e.target.value })
                }
              />
            </Field>
            <Field label="Status">
              <select
                {...inp}
                value={hF.status}
                onChange={(e) => setHF({ ...hF, status: e.target.value })}
              >
                {HIRE_STATUS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </Row2>
          <Field label="Allocate to Project (optional)">
            <select
              {...inp}
              value={hF.projectId || ""}
              onChange={(e) => setHF({ ...hF, projectId: e.target.value })}
            >
              <option value="">— No Project Allocation —</option>
              {projects
                .filter((p) => p.status === "Active")
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.code ? " (" + p.code + ")" : ""}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Notes">
            <input
              {...inp}
              value={hF.notes}
              onChange={(e) => setHF({ ...hF, notes: e.target.value })}
              placeholder="Hire agreement number, special conditions..."
            />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn
              style={{ flex: 1 }}
              onClick={() => {
                if (!hF.assetDescription || !hF.dailyRate || !hF.startDate) {
                  toast(
                    "Fill in equipment description, daily rate and start date.",
                    "error"
                  );
                  return;
                }
                add("mcw_hires", setHires, hires, hF);
                setHF(dH);
                setModal(null);
              }}
            >
              Save Hire Record
            </Btn>
            <Btn variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Btn>
          </div>
        </Modal>
      )}

      {modal === "disposal" && (
        <Modal
          title="Record Asset Disposal / Write-Off"
          subtitle="Formally close an asset's lifecycle in the register"
          onClose={() => setModal(null)}
        >
          <Field label="Asset" required>
            <select
              {...inp}
              value={disF.assetId}
              onChange={(e) => setDisF({ ...disF, assetId: e.target.value })}
            >
              <option value="">— Select Asset —</option>
              {assets
                .filter((a) => !disposals.find((d) => d.assetId === a.id))
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} · {a.category}
                  </option>
                ))}
            </select>
          </Field>
          {disF.assetId &&
            (() => {
              const a = assets.find((x) => x.id === disF.assetId);
              const d = a ? depreciate(a) : null;
              return d ? (
                <div
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    borderRadius: 8,
                    padding: "12px 14px",
                    marginBottom: 16,
                    fontSize: 12,
                    color: C.muted,
                  }}
                >
                  <strong style={{ color: C.text }}>Original Cost:</strong>{" "}
                  {fmt(a.purchaseCost)} &nbsp;|&nbsp;{" "}
                  <strong style={{ color: C.text }}>Current Book Value:</strong>{" "}
                  <span style={{ color: C.warn, fontWeight: 700 }}>
                    {fmt(d.bookValue)}
                  </span>
                </div>
              ) : null;
            })()}
          <Row2>
            <Field label="Disposal Date" required>
              <input
                type="date"
                {...inp}
                value={disF.disposalDate}
                onChange={(e) =>
                  setDisF({ ...disF, disposalDate: e.target.value })
                }
              />
            </Field>
            <Field label="Disposal Method" required>
              <select
                {...inp}
                value={disF.method}
                onChange={(e) => setDisF({ ...disF, method: e.target.value })}
              >
                {DISPOSAL_METHODS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
          </Row2>
          {(disF.method === "Sold" ||
            disF.method === "Trade-In" ||
            disF.method === "Donated") && (
            <Row2>
              <Field label="Disposal / Sale Value (R)">
                <input
                  type="number"
                  {...inp}
                  value={disF.disposalValue}
                  onChange={(e) =>
                    setDisF({ ...disF, disposalValue: e.target.value })
                  }
                  placeholder="0.00"
                />
              </Field>
              <Field label="Buyer / Recipient Name">
                <input
                  {...inp}
                  value={disF.buyerName}
                  onChange={(e) =>
                    setDisF({ ...disF, buyerName: e.target.value })
                  }
                  placeholder="Full name or company"
                />
              </Field>
            </Row2>
          )}
          {(disF.method === "Sold" || disF.method === "Trade-In") && (
            <Field label="Buyer Contact Number">
              <input
                {...inp}
                value={disF.buyerContact}
                onChange={(e) =>
                  setDisF({ ...disF, buyerContact: e.target.value })
                }
                placeholder="e.g. 082 123 4567"
              />
            </Field>
          )}
          <Field label="Reason for Disposal">
            <input
              {...inp}
              value={disF.reason}
              onChange={(e) => setDisF({ ...disF, reason: e.target.value })}
              placeholder="e.g. End of useful life, Replaced with newer model, Accident damage..."
            />
          </Field>
          <Field label="Notes">
            <input
              {...inp}
              value={disF.notes}
              onChange={(e) => setDisF({ ...disF, notes: e.target.value })}
              placeholder="Any additional information..."
            />
          </Field>
          {(disF.method === "Written Off" || disF.method === "Scrapped") && (
            <div
              style={{
                background: C.warnBg,
                border: `1px solid #FDE68A`,
                borderRadius: 8,
                padding: "12px 14px",
                marginBottom: 16,
                fontSize: 12,
                color: C.warn,
                fontWeight: 600,
              }}
            >
              ⚠ This asset will be marked as disposed in the register. The asset
              record is preserved for audit purposes but will show as disposed
              on all reports.
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <Btn
              style={{ flex: 1 }}
              onClick={() => {
                if (!disF.assetId || !disF.disposalDate || !disF.method) {
                  toast("Select an asset, date and method.", "error");
                  return;
                }
                add("mcw_disposals", setDisposals, disposals, disF);
                update("mcw_assets", setAssets, assets, disF.assetId, {
                  status: "Disposed",
                });
                setDisF(dDis);
                setModal(null);
              }}
            >
              Record Disposal
            </Btn>
            <Btn variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Btn>
          </div>
        </Modal>
      )}
      {modal === "condition" && (
        <Modal
          title="Log Condition Assessment"
          subtitle="Record a formal condition rating for an asset"
          onClose={() => setModal(null)}
        >
          <Field label="Asset" required>
            <select
              {...inp}
              value={condF.assetId}
              onChange={(e) => setCondF({ ...condF, assetId: e.target.value })}
            >
              <option value="">— Select Asset —</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} · {a.category}
                </option>
              ))}
            </select>
          </Field>
          <Row2>
            <Field label="Condition Rating" required>
              <select
                {...inp}
                value={condF.rating}
                onChange={(e) => setCondF({ ...condF, rating: e.target.value })}
              >
                {CONDITION_RATINGS.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>
            <Field label="Assessment Date" required>
              <input
                type="date"
                {...inp}
                value={condF.assessmentDate}
                onChange={(e) =>
                  setCondF({ ...condF, assessmentDate: e.target.value })
                }
              />
            </Field>
          </Row2>
          <Field label="Assessed By">
            <input
              {...inp}
              value={condF.assessedBy}
              onChange={(e) =>
                setCondF({ ...condF, assessedBy: e.target.value })
              }
              placeholder="Name of person conducting the assessment"
            />
          </Field>
          <Field label="Action Required">
            <input
              {...inp}
              value={condF.actionRequired}
              onChange={(e) =>
                setCondF({ ...condF, actionRequired: e.target.value })
              }
              placeholder="e.g. Replace hydraulic seals, Schedule major service, Decommission"
            />
          </Field>
          <Field label="Notes">
            <input
              {...inp}
              value={condF.notes}
              onChange={(e) => setCondF({ ...condF, notes: e.target.value })}
              placeholder="Detailed observations..."
            />
          </Field>
          {condF.rating === "Write-Off Recommended" && (
            <div
              style={{
                background: C.redLight,
                border: `1px solid ${C.redBorder}`,
                borderRadius: 8,
                padding: "12px 14px",
                marginBottom: 16,
                fontSize: 12,
                color: C.red,
                fontWeight: 600,
              }}
            >
              ⚠ Write-Off Recommended — This record will appear on management
              reports and flag this asset for disposal review.
            </div>
          )}
          {condF.rating === "Poor" && (
            <div
              style={{
                background: C.warnBg,
                border: `1px solid #FDE68A`,
                borderRadius: 8,
                padding: "12px 14px",
                marginBottom: 16,
                fontSize: 12,
                color: C.warn,
                fontWeight: 600,
              }}
            >
              ⚠ Poor Condition — This asset requires urgent attention. Ensure
              action required is documented above.
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <Btn
              style={{ flex: 1 }}
              onClick={() => {
                if (!condF.assetId) {
                  toast("Select an asset.", "error");
                  return;
                }
                add("mcw_conditions", setConditions, conditions, condF);
                setCondF(dCond);
                setModal(null);
              }}
            >
              Save Assessment
            </Btn>
            <Btn variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Btn>
          </div>
        </Modal>
      )}

      {modal === "incident" && (
        <Modal
          title="Log Incident / Breakdown"
          subtitle="Record a breakdown, accident or equipment failure"
          onClose={() => setModal(null)}
        >
          <Field label="Asset" required>
            <select
              {...inp}
              value={incF.assetId}
              onChange={(e) => setIncF({ ...incF, assetId: e.target.value })}
            >
              <option value="">— Select Asset —</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} · {a.category}
                </option>
              ))}
            </select>
          </Field>
          <Row2>
            <Field label="Date" required>
              <input
                type="date"
                {...inp}
                value={incF.date}
                onChange={(e) => setIncF({ ...incF, date: e.target.value })}
              />
            </Field>
            <Field label="Incident Type" required>
              <select
                {...inp}
                value={incF.type}
                onChange={(e) => setIncF({ ...incF, type: e.target.value })}
              >
                {INCIDENT_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
          </Row2>
          <Field label="Description" required>
            <input
              {...inp}
              value={incF.description}
              onChange={(e) =>
                setIncF({ ...incF, description: e.target.value })
              }
              placeholder="What happened? Describe the incident in detail..."
            />
          </Field>
          <Row2>
            <Field label="Operator on Machine">
              <input
                {...inp}
                value={incF.operatorName}
                onChange={(e) =>
                  setIncF({ ...incF, operatorName: e.target.value })
                }
                placeholder="Name of operator"
              />
            </Field>
            <Field label="Reported By">
              <input
                {...inp}
                value={incF.reportedBy}
                onChange={(e) =>
                  setIncF({ ...incF, reportedBy: e.target.value })
                }
                placeholder="Name of person reporting"
              />
            </Field>
          </Row2>
          <Row2>
            <Field label="Downtime Hours">
              <input
                type="number"
                {...inp}
                value={incF.downtimeHours}
                onChange={(e) =>
                  setIncF({ ...incF, downtimeHours: e.target.value })
                }
                placeholder="Hours machine was out of service"
                step="0.5"
              />
            </Field>
            <Field label="Repair Cost (R)">
              <input
                type="number"
                {...inp}
                value={incF.repairCost}
                onChange={(e) =>
                  setIncF({ ...incF, repairCost: e.target.value })
                }
                placeholder="0.00"
              />
            </Field>
          </Row2>
          <Field label="Resolved?">
            <select
              {...inp}
              value={incF.resolved}
              onChange={(e) => setIncF({ ...incF, resolved: e.target.value })}
            >
              <option value="No">No — Still Open</option>
              <option value="Yes">Yes — Resolved</option>
            </select>
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn
              style={{ flex: 1 }}
              onClick={() => {
                if (!incF.assetId || !incF.description) {
                  toast("Select an asset and describe the incident.", "error");
                  return;
                }
                add("mcw_incidents", setIncidents, incidents, incF);
                setIncF(dInc);
                setModal(null);
              }}
            >
              Save Incident
            </Btn>
            <Btn variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Btn>
          </div>
        </Modal>
      )}

      {modal === "supplier" && (
        <Modal
          title="Add Supplier / Vendor"
          subtitle="Register a verified supplier or service provider"
          onClose={() => setModal(null)}
        >
          <Row2>
            <Field label="Supplier Name" required>
              <input
                {...inp}
                value={supF.name}
                onChange={(e) => setSupF({ ...supF, name: e.target.value })}
                placeholder="e.g. ABC Auto Services"
              />
            </Field>
            <Field label="Supplier Type" required>
              <select
                {...inp}
                value={supF.type}
                onChange={(e) => setSupF({ ...supF, type: e.target.value })}
              >
                {SUPPLIER_TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
          </Row2>
          <Row2>
            <Field label="Contact Person">
              <input
                {...inp}
                value={supF.contactPerson}
                onChange={(e) =>
                  setSupF({ ...supF, contactPerson: e.target.value })
                }
                placeholder="e.g. John Mokoena"
              />
            </Field>
            <Field label="Phone Number">
              <input
                {...inp}
                value={supF.phone}
                onChange={(e) => setSupF({ ...supF, phone: e.target.value })}
                placeholder="e.g. 011 123 4567"
              />
            </Field>
          </Row2>
          <Row2>
            <Field label="Email Address">
              <input
                {...inp}
                value={supF.email}
                onChange={(e) => setSupF({ ...supF, email: e.target.value })}
                placeholder="e.g. john@abcauto.co.za"
              />
            </Field>
            <Field label="Physical Address">
              <input
                {...inp}
                value={supF.address}
                onChange={(e) => setSupF({ ...supF, address: e.target.value })}
                placeholder="e.g. 12 Industrial Rd, Pretoria"
              />
            </Field>
          </Row2>
          <Field label="Notes">
            <input
              {...inp}
              value={supF.notes}
              onChange={(e) => setSupF({ ...supF, notes: e.target.value })}
              placeholder="Any additional information, specialisations, payment terms..."
            />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn
              style={{ flex: 1 }}
              onClick={() => {
                if (!supF.name || !supF.type) {
                  toast("Enter supplier name and type.", "error");
                  return;
                }
                add("mcw_suppliers", setSuppliers, suppliers, supF);
                setSupF(dSup);
                setModal(null);
              }}
            >
              Save Supplier
            </Btn>
            <Btn variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Btn>
          </div>
        </Modal>
      )}
      {modal === "compliance" && (
        <Modal
          title="Add Compliance Record"
          subtitle="Track a licence, certificate or insurance document"
          onClose={() => setModal(null)}
        >
          <Field label="Asset" required>
            <select
              {...inp}
              value={cf.assetId}
              onChange={(e) => setCf({ ...cf, assetId: e.target.value })}
            >
              <option value="">— Select Asset —</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Document Type" required>
            <select
              {...inp}
              value={cf.docType}
              onChange={(e) => setCf({ ...cf, docType: e.target.value })}
            >
              {COMPLIANCE_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Document / Reference Number">
            <input
              {...inp}
              value={cf.docNumber}
              onChange={(e) => setCf({ ...cf, docNumber: e.target.value })}
              placeholder="e.g. RWC-2024-00123"
            />
          </Field>
          <Row2>
            <Field label="Issue Date">
              <input
                type="date"
                {...inp}
                value={cf.issueDate}
                onChange={(e) => setCf({ ...cf, issueDate: e.target.value })}
              />
            </Field>
            <Field label="Expiry Date" required>
              <input
                type="date"
                {...inp}
                value={cf.expiryDate}
                onChange={(e) => setCf({ ...cf, expiryDate: e.target.value })}
              />
            </Field>
          </Row2>
          <Field label="Notes">
            <input
              {...inp}
              value={cf.notes}
              onChange={(e) => setCf({ ...cf, notes: e.target.value })}
              placeholder="Any additional notes..."
            />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn
              style={{ flex: 1 }}
              onClick={() => {
                if (!cf.assetId || !cf.expiryDate) {
                  toast("Select an asset and expiry date.", "error");
                  return;
                }
                add("mcw_compliance", setCompliance, compliance, cf);
                setCf(dC);
                setModal(null);
              }}
            >
              Save Record
            </Btn>
            <Btn variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Btn>
          </div>
        </Modal>
      )}

      {modal === "project" && (
        <Modal
          title="Register New Project"
          subtitle="Add a contract or site to track costs against"
          onClose={() => setModal(null)}
        >
          <Row2>
            <Field label="Project Name" required>
              <input
                {...inp}
                value={pf.name}
                onChange={(e) => setPf({ ...pf, name: e.target.value })}
                placeholder="e.g. N1 Road Rehabilitation"
              />
            </Field>
            <Field label="Project Code">
              <input
                {...inp}
                value={pf.code}
                onChange={(e) => setPf({ ...pf, code: e.target.value })}
                placeholder="e.g. PRJ-001"
              />
            </Field>
          </Row2>
          <Row2>
            <Field label="Primary Site">
              <select
                {...inp}
                value={pf.site}
                onChange={(e) => setPf({ ...pf, site: e.target.value })}
              >
                {SITES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                {...inp}
                value={pf.status}
                onChange={(e) => setPf({ ...pf, status: e.target.value })}
              >
                {PROJECT_STATUS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </Row2>
          <Row2>
            <Field label="Start Date">
              <input
                type="date"
                {...inp}
                value={pf.startDate}
                onChange={(e) => setPf({ ...pf, startDate: e.target.value })}
              />
            </Field>
            <Field label="Contract Value (R)">
              <input
                type="number"
                {...inp}
                value={pf.contractValue}
                onChange={(e) =>
                  setPf({ ...pf, contractValue: e.target.value })
                }
                placeholder="0.00"
              />
            </Field>
          </Row2>
          <Field label="Description">
            <input
              {...inp}
              value={pf.description}
              onChange={(e) => setPf({ ...pf, description: e.target.value })}
              placeholder="Brief description of scope of work..."
            />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn
              style={{ flex: 1 }}
              onClick={() => {
                if (!pf.name) {
                  toast("Enter a project name.", "error");
                  return;
                }
                add("mcw_projects", setProjects, projects, pf);
                setPf(dP);
                setModal(null);
              }}
            >
              Save Project
            </Btn>
            <Btn variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Btn>
          </div>
        </Modal>
      )}

      {modal === "employee" && (
        <Modal
          title="Add Employee"
          subtitle="Add an employee to the official register"
          onClose={() => setModal(null)}
        >
          <Row2>
            <Field label="Full Name" required>
              <input
                {...inp}
                value={ef.name}
                onChange={(e) => setEf({ ...ef, name: e.target.value })}
                placeholder="e.g. Sipho Dlamini"
              />
            </Field>
            <Field label="SA ID Number">
              <input
                {...inp}
                value={ef.idNumber}
                onChange={(e) => setEf({ ...ef, idNumber: e.target.value })}
                placeholder="13-digit ID number"
                maxLength={13}
              />
            </Field>
          </Row2>
          <Row2>
            <Field label="Role" required>
              <select
                {...inp}
                value={ef.role}
                onChange={(e) => setEf({ ...ef, role: e.target.value })}
              >
                {EMPLOYEE_ROLES.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>
            <Field label="Primary Site">
              <select
                {...inp}
                value={ef.site}
                onChange={(e) => setEf({ ...ef, site: e.target.value })}
              >
                {SITES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </Row2>
          <Row2>
            <Field label="Contact Number">
              <input
                {...inp}
                value={ef.contactNumber}
                onChange={(e) =>
                  setEf({ ...ef, contactNumber: e.target.value })
                }
                placeholder="e.g. 082 123 4567"
              />
            </Field>
            <Field label="Start Date">
              <input
                type="date"
                {...inp}
                value={ef.startDate}
                onChange={(e) => setEf({ ...ef, startDate: e.target.value })}
              />
            </Field>
          </Row2>
          <Field label="Status">
            <select
              {...inp}
              value={ef.status}
              onChange={(e) => setEf({ ...ef, status: e.target.value })}
            >
              {EMPLOYEE_STATUS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Notes">
            <input
              {...inp}
              value={ef.notes}
              onChange={(e) => setEf({ ...ef, notes: e.target.value })}
              placeholder="Any relevant notes..."
            />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn
              style={{ flex: 1 }}
              onClick={() => {
                if (!ef.name || !ef.role) {
                  toast("Enter employee name and role.", "error");
                  return;
                }
                add("mcw_employees", setEmployees, employees, ef);
                setEf(dE);
                setModal(null);
              }}
            >
              Save Employee
            </Btn>
            <Btn variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Btn>
          </div>
        </Modal>
      )}

      {modal === "schedule" && (
        <Modal
          title="Add Maintenance Schedule"
          subtitle="Set a proactive service interval for an asset"
          onClose={() => setModal(null)}
        >
          <Field label="Asset" required>
            <select
              {...inp}
              value={sf.assetId}
              onChange={(e) => setSf({ ...sf, assetId: e.target.value })}
            >
              <option value="">— Select Asset —</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Service Type" required>
            <select
              {...inp}
              value={sf.serviceType}
              onChange={(e) => setSf({ ...sf, serviceType: e.target.value })}
            >
              {MAINT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Row2>
            <Field label="Service Interval (Hours)">
              <input
                type="number"
                {...inp}
                value={sf.intervalHours}
                onChange={(e) =>
                  setSf({ ...sf, intervalHours: e.target.value })
                }
                placeholder="e.g. 500"
              />
            </Field>
            <Field label="Service Interval (Km)">
              <input
                type="number"
                {...inp}
                value={sf.intervalKm}
                onChange={(e) => setSf({ ...sf, intervalKm: e.target.value })}
                placeholder="e.g. 10000"
              />
            </Field>
          </Row2>
          <Field label="Last Service Date">
            <input
              type="date"
              {...inp}
              value={sf.lastServiceDate}
              onChange={(e) =>
                setSf({ ...sf, lastServiceDate: e.target.value })
              }
            />
          </Field>
          <Row2>
            <Field label="Hours at Last Service">
              <input
                type="number"
                {...inp}
                value={sf.lastServiceHours}
                onChange={(e) =>
                  setSf({ ...sf, lastServiceHours: e.target.value })
                }
                placeholder="e.g. 1200"
              />
            </Field>
            <Field label="Km at Last Service">
              <input
                type="number"
                {...inp}
                value={sf.lastServiceKm}
                onChange={(e) =>
                  setSf({ ...sf, lastServiceKm: e.target.value })
                }
                placeholder="e.g. 45000"
              />
            </Field>
          </Row2>
          <Field label="Notes">
            <input
              {...inp}
              value={sf.notes}
              onChange={(e) => setSf({ ...sf, notes: e.target.value })}
              placeholder="Any additional notes..."
            />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn
              style={{ flex: 1 }}
              onClick={() => {
                if (!sf.assetId || !sf.serviceType) {
                  toast("Select an asset and service type.", "error");
                  return;
                }
                if (!sf.intervalHours && !sf.intervalKm) {
                  toast(
                    "Enter at least one service interval (hours or km).",
                    "error"
                  );
                  return;
                }
                add("mcw_schedules", setSchedules, schedules, sf);
                setSf(dSch);
                setModal(null);
              }}
            >
              Save Schedule
            </Btn>
            <Btn variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Btn>
          </div>
        </Modal>
      )}
      {modal === "spare" && (
        <Modal
          title="Add Part / Spare"
          subtitle="Register a part or spare kept in stock on-site"
          onClose={() => setModal(null)}
        >
          <Row2>
            <Field label="Part Name" required>
              <input
                {...inp}
                value={spF.partName}
                onChange={(e) => setSpF({ ...spF, partName: e.target.value })}
                placeholder="e.g. Oil Filter, Hydraulic Seal Kit"
              />
            </Field>
            <Field label="Part Number">
              <input
                {...inp}
                value={spF.partNumber}
                onChange={(e) => setSpF({ ...spF, partNumber: e.target.value })}
                placeholder="e.g. OF-CAT-001"
              />
            </Field>
          </Row2>
          <Row2>
            <Field label="Category" required>
              <select
                {...inp}
                value={spF.category}
                onChange={(e) => setSpF({ ...spF, category: e.target.value })}
              >
                {SPARE_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Supplier">
              <input
                {...inp}
                value={spF.supplier}
                onChange={(e) => setSpF({ ...spF, supplier: e.target.value })}
                placeholder="e.g. ABC Parts"
              />
            </Field>
          </Row2>
          <Row2>
            <Field label="Quantity in Stock" required>
              <input
                type="number"
                {...inp}
                value={spF.quantity}
                onChange={(e) => setSpF({ ...spF, quantity: e.target.value })}
                placeholder="0"
              />
            </Field>
            <Field label="Minimum Stock Level">
              <input
                type="number"
                {...inp}
                value={spF.minStockLevel}
                onChange={(e) =>
                  setSpF({ ...spF, minStockLevel: e.target.value })
                }
                placeholder="Alert when below this number"
              />
            </Field>
          </Row2>
          <Row2>
            <Field label="Unit Cost (R)">
              <input
                type="number"
                {...inp}
                value={spF.unitCost}
                onChange={(e) => setSpF({ ...spF, unitCost: e.target.value })}
                placeholder="0.00"
              />
            </Field>
            <Field label="Storage Location">
              <select
                {...inp}
                value={spF.location}
                onChange={(e) => setSpF({ ...spF, location: e.target.value })}
              >
                {SITES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </Row2>
          <Field label="Status">
            <select
              {...inp}
              value={spF.status}
              onChange={(e) => setSpF({ ...spF, status: e.target.value })}
            >
              {SPARE_STATUS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Notes">
            <input
              {...inp}
              value={spF.notes}
              onChange={(e) => setSpF({ ...spF, notes: e.target.value })}
              placeholder="Compatible assets, storage notes..."
            />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn
              style={{ flex: 1 }}
              onClick={() => {
                if (!spF.partName) {
                  toast("Enter a part name.", "error");
                  return;
                }
                add("mcw_spares", setSpares, spares, spF);
                setSpF(dSp);
                setModal(null);
              }}
            >
              Save Part
            </Btn>
            <Btn variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Btn>
          </div>
        </Modal>
      )}

      {modal === "warranty" && (
        <Modal
          title="Add Warranty Record"
          subtitle="Track an asset warranty for potential claims"
          onClose={() => setModal(null)}
        >
          <Field label="Asset" required>
            <select
              {...inp}
              value={wF.assetId}
              onChange={(e) => setWF({ ...wF, assetId: e.target.value })}
            >
              <option value="">— Select Asset —</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} · {a.category}
                </option>
              ))}
            </select>
          </Field>
          <Row2>
            <Field label="Supplier / Dealer">
              <input
                {...inp}
                value={wF.supplier}
                onChange={(e) => setWF({ ...wF, supplier: e.target.value })}
                placeholder="e.g. Toyota SA, ABC Equipment"
              />
            </Field>
            <Field label="Warranty Reference No.">
              <input
                {...inp}
                value={wF.warrantyNumber}
                onChange={(e) =>
                  setWF({ ...wF, warrantyNumber: e.target.value })
                }
                placeholder="e.g. WRN-2024-001"
              />
            </Field>
          </Row2>
          <Row2>
            <Field label="Warranty Start Date">
              <input
                type="date"
                {...inp}
                value={wF.startDate}
                onChange={(e) => setWF({ ...wF, startDate: e.target.value })}
              />
            </Field>
            <Field label="Expiry Date" required>
              <input
                type="date"
                {...inp}
                value={wF.expiryDate}
                onChange={(e) => setWF({ ...wF, expiryDate: e.target.value })}
              />
            </Field>
          </Row2>
          <Field label="Coverage Details">
            <input
              {...inp}
              value={wF.coverageDetails}
              onChange={(e) =>
                setWF({ ...wF, coverageDetails: e.target.value })
              }
              placeholder="e.g. Full mechanical warranty, Engine and drivetrain only..."
            />
          </Field>
          <Field label="Status">
            <select
              {...inp}
              value={wF.status}
              onChange={(e) => setWF({ ...wF, status: e.target.value })}
            >
              {WARRANTY_STATUS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Notes">
            <input
              {...inp}
              value={wF.notes}
              onChange={(e) => setWF({ ...wF, notes: e.target.value })}
              placeholder="Claim history, conditions, exclusions..."
            />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn
              style={{ flex: 1 }}
              onClick={() => {
                if (!wF.assetId || !wF.expiryDate) {
                  toast("Select an asset and expiry date.", "error");
                  return;
                }
                add("mcw_warranties", setWarranties, warranties, wF);
                setWF(dW);
                setModal(null);
              }}
            >
              Save Warranty
            </Btn>
            <Btn variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Btn>
          </div>
        </Modal>
      )}
      {modal === "leave" && (
        <Modal
          title="Record Employee Leave"
          subtitle="Log an approved leave request"
          onClose={() => setModal(null)}
        >
          <Field label="Employee" required>
            {employees.length > 0 ? (
              <select
                {...inp}
                value={lF.employeeName}
                onChange={(e) => setLF({ ...lF, employeeName: e.target.value })}
              >
                <option value="">— Select Employee —</option>
                {employees
                  .filter(
                    (e) => e.status === "Active" || e.status === "On Leave"
                  )
                  .map((e) => (
                    <option key={e.id} value={e.name}>
                      {e.name} · {e.role}
                    </option>
                  ))}
              </select>
            ) : (
              <input
                {...inp}
                value={lF.employeeName}
                onChange={(e) => setLF({ ...lF, employeeName: e.target.value })}
                placeholder="Employee full name"
              />
            )}
          </Field>
          <Field label="Leave Type" required>
            <select
              {...inp}
              value={lF.leaveType}
              onChange={(e) => setLF({ ...lF, leaveType: e.target.value })}
            >
              {LEAVE_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Row2>
            <Field label="Start Date" required>
              <input
                type="date"
                {...inp}
                value={lF.startDate}
                onChange={(e) => setLF({ ...lF, startDate: e.target.value })}
              />
            </Field>
            <Field label="End Date">
              <input
                type="date"
                {...inp}
                value={lF.endDate}
                onChange={(e) => setLF({ ...lF, endDate: e.target.value })}
              />
            </Field>
          </Row2>
          <Row2>
            <Field label="Number of Days">
              <input
                type="number"
                {...inp}
                value={lF.days}
                onChange={(e) => setLF({ ...lF, days: e.target.value })}
                placeholder="e.g. 5"
              />
            </Field>
            <Field label="Status">
              <select
                {...inp}
                value={lF.status}
                onChange={(e) => setLF({ ...lF, status: e.target.value })}
              >
                {LEAVE_STATUS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </Row2>
          <Field label="Approved By">
            <input
              {...inp}
              value={lF.approvedBy}
              onChange={(e) => setLF({ ...lF, approvedBy: e.target.value })}
              placeholder="Name of approving manager"
            />
          </Field>
          <Field label="Notes">
            <input
              {...inp}
              value={lF.notes}
              onChange={(e) => setLF({ ...lF, notes: e.target.value })}
              placeholder="Reason or additional details..."
            />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn
              style={{ flex: 1 }}
              onClick={() => {
                if (!lF.employeeName || !lF.startDate || !lF.leaveType) {
                  toast("Enter employee, leave type and start date.", "error");
                  return;
                }
                add("mcw_leaves", setLeaves, leaves, lF);
                setLF(dL);
                setModal(null);
              }}
            >
              Save Leave Record
            </Btn>
            <Btn variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Btn>
          </div>
        </Modal>
      )}

      {modal === "overtime" && (
        <Modal
          title="Log Overtime"
          subtitle="Record approved overtime hours for an employee"
          onClose={() => setModal(null)}
        >
          <Field label="Employee" required>
            {employees.length > 0 ? (
              <select
                {...inp}
                value={otF.employeeName}
                onChange={(e) =>
                  setOtF({ ...otF, employeeName: e.target.value })
                }
              >
                <option value="">— Select Employee —</option>
                {employees
                  .filter((e) => e.status === "Active")
                  .map((e) => (
                    <option key={e.id} value={e.name}>
                      {e.name} · {e.role}
                    </option>
                  ))}
              </select>
            ) : (
              <input
                {...inp}
                value={otF.employeeName}
                onChange={(e) =>
                  setOtF({ ...otF, employeeName: e.target.value })
                }
                placeholder="Employee full name"
              />
            )}
          </Field>
          <Row2>
            <Field label="Date" required>
              <input
                type="date"
                {...inp}
                value={otF.date}
                onChange={(e) => setOtF({ ...otF, date: e.target.value })}
              />
            </Field>
            <Field label="Site">
              <select
                {...inp}
                value={otF.site}
                onChange={(e) => setOtF({ ...otF, site: e.target.value })}
              >
                {SITES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </Row2>
          <Row2>
            <Field label="Regular Hours">
              <input
                type="number"
                {...inp}
                value={otF.regularHours}
                onChange={(e) =>
                  setOtF({ ...otF, regularHours: e.target.value })
                }
                placeholder="8"
                step="0.5"
              />
            </Field>
            <Field label="Overtime Hours" required>
              <input
                type="number"
                {...inp}
                value={otF.overtimeHours}
                onChange={(e) =>
                  setOtF({ ...otF, overtimeHours: e.target.value })
                }
                placeholder="e.g. 3"
                step="0.5"
              />
            </Field>
          </Row2>
          {otF.overtimeHours && (
            <div
              style={{
                background: C.warnBg,
                border: `1px solid #FDE68A`,
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 16,
                fontSize: 12,
                color: C.warn,
                fontWeight: 600,
              }}
            >
              Total hours for this day:{" "}
              {(
                Number(otF.regularHours || 8) + Number(otF.overtimeHours || 0)
              ).toFixed(1)}{" "}
              hrs
            </div>
          )}
          <Field label="Reason for Overtime" required>
            <input
              {...inp}
              value={otF.reason}
              onChange={(e) => setOtF({ ...otF, reason: e.target.value })}
              placeholder="e.g. Emergency repair, Project deadline, Storm damage cleanup..."
            />
          </Field>
          <Field label="Approved By">
            <input
              {...inp}
              value={otF.approvedBy}
              onChange={(e) => setOtF({ ...otF, approvedBy: e.target.value })}
              placeholder="Name of approving manager"
            />
          </Field>
          <Field label="Notes">
            <input
              {...inp}
              value={otF.notes}
              onChange={(e) => setOtF({ ...otF, notes: e.target.value })}
              placeholder="Any additional notes..."
            />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn
              style={{ flex: 1 }}
              onClick={() => {
                if (!otF.employeeName || !otF.overtimeHours || !otF.reason) {
                  toast("Enter employee, overtime hours and reason.", "error");
                  return;
                }
                add("mcw_overtimes", setOvertimes, overtimes, otF);
                setOtF(dOT);
                setModal(null);
              }}
            >
              Save Overtime Record
            </Btn>
            <Btn variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Btn>
          </div>
        </Modal>
      )}

      {modal === "assignment" && (
        <Modal
          title="Log Operator-Asset Assignment"
          subtitle="Record which operator is assigned to which machine"
          onClose={() => setModal(null)}
        >
          <Field label="Asset" required>
            <select
              {...inp}
              value={assF.assetId}
              onChange={(e) => setAssF({ ...assF, assetId: e.target.value })}
            >
              <option value="">— Select Asset —</option>
              {assets
                .filter(
                  (a) =>
                    a.status === "Active" || a.status === "Under Maintenance"
                )
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} · {a.category}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Operator / Employee" required>
            {employees.length > 0 ? (
              <select
                {...inp}
                value={assF.employeeName}
                onChange={(e) =>
                  setAssF({ ...assF, employeeName: e.target.value })
                }
              >
                <option value="">— Select Employee —</option>
                {employees
                  .filter((e) => e.status === "Active")
                  .map((e) => (
                    <option key={e.id} value={e.name}>
                      {e.name} · {e.role}
                    </option>
                  ))}
              </select>
            ) : (
              <input
                {...inp}
                value={assF.employeeName}
                onChange={(e) =>
                  setAssF({ ...assF, employeeName: e.target.value })
                }
                placeholder="Operator or employee name"
              />
            )}
          </Field>
          <Row2>
            <Field label="Assignment Start Date" required>
              <input
                type="date"
                {...inp}
                value={assF.startDate}
                onChange={(e) =>
                  setAssF({ ...assF, startDate: e.target.value })
                }
              />
            </Field>
            <Field label="End Date (leave blank if current)">
              <input
                type="date"
                {...inp}
                value={assF.endDate}
                onChange={(e) => setAssF({ ...assF, endDate: e.target.value })}
              />
            </Field>
          </Row2>
          <Field label="Site">
            <select
              {...inp}
              value={assF.site}
              onChange={(e) => setAssF({ ...assF, site: e.target.value })}
            >
              {SITES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Notes">
            <input
              {...inp}
              value={assF.notes}
              onChange={(e) => setAssF({ ...assF, notes: e.target.value })}
              placeholder="e.g. Temporary cover, Primary operator, Standing assignment..."
            />
          </Field>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn
              style={{ flex: 1 }}
              onClick={() => {
                if (!assF.assetId || !assF.employeeName || !assF.startDate) {
                  toast("Select an asset, operator and start date.", "error");
                  return;
                }
                add("mcw_assignments", setAssignments, assignments, assF);
                setAssF(dAss);
                setModal(null);
              }}
            >
              Save Assignment
            </Btn>
            <Btn variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Btn>
          </div>
        </Modal>
      )}
      {showUserMgmt && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(17,19,24,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20,
            backdropFilter: "blur(3px)",
          }}
        >
          <div
            style={{
              background: C.white,
              borderRadius: 14,
              width: "100%",
              maxWidth: 600,
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 24px 80px rgba(0,0,0,0.3)",
            }}
          >
            <div
              style={{
                padding: "22px 28px",
                borderBottom: `1px solid ${C.border}`,
                background: C.surface,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
                  User Management
                </div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>
                  Add, remove and manage system users
                </div>
              </div>
              <button
                onClick={() => setShowUserMgmt(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 18,
                  cursor: "pointer",
                  color: C.mutedLt,
                }}
              >
                ✕
              </button>
            </div>
            <div style={{ padding: "24px 28px" }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.text,
                  marginBottom: 14,
                }}
              >
                Add New User
              </div>
              <Row2>
                <Field label="Full Name">
                  <input
                    {...inp}
                    value={newUser.name}
                    onChange={(e) =>
                      setNewUser({ ...newUser, name: e.target.value })
                    }
                    placeholder="e.g. Thabo Nkosi"
                  />
                </Field>
                <Field label="Username">
                  <input
                    {...inp}
                    value={newUser.username}
                    onChange={(e) =>
                      setNewUser({ ...newUser, username: e.target.value })
                    }
                    placeholder="e.g. thabo.nkosi"
                  />
                </Field>
              </Row2>
              <Row2>
                <Field label="Password">
                  <input
                    type="password"
                    {...inp}
                    value={newUser.password}
                    onChange={(e) =>
                      setNewUser({ ...newUser, password: e.target.value })
                    }
                    placeholder="Temporary password"
                  />
                </Field>
                <Field label="Role">
                  <select
                    {...inp}
                    value={newUser.role}
                    onChange={(e) =>
                      setNewUser({ ...newUser, role: e.target.value })
                    }
                  >
                    {Object.entries(ROLES).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </Field>
              </Row2>
              <Btn
                size="sm"
                onClick={async () => {
                  if (!newUser.name || !newUser.username || !newUser.password) {
                    toast("Fill in all fields.", "error");
                    return;
                  }
                  if (users.find((u) => u.username === newUser.username)) {
                    toast("Username already exists.", "error");
                    return;
                  }
                  const newUserWithId = { ...newUser, id: Date.now().toString() };
                  const updated = [...users, newUserWithId];
                  setUsers(updated);
                  localStorage.setItem("mcw_users", JSON.stringify(updated));
                  try { 
                    await setDoc(doc(db, "users", newUserWithId.id), newUserWithId);
                    toast("User added and synced to cloud.");
                  } catch(e) { 
                    console.error("Firebase user save failed:", e);
                    toast("User saved locally but cloud sync failed: " + e.message, "error");
                  }
                  setNewUser({
                    username: "",
                    password: "",
                    name: "",
                    role: "operator",
                  });
                }}
              >
                Add User
              </Btn>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: C.text,
                  margin: "24px 0 14px",
                }}
              >
                All Users ({users.length})
              </div>
              {users.map((u) => (
                <div
                  key={u.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 14px",
                    background: C.surface,
                    borderRadius: 8,
                    marginBottom: 8,
                    border: `1px solid ${C.border}`,
                  }}
                >
                  <div>
                    <div
                      style={{ fontWeight: 700, fontSize: 13, color: C.text }}
                    >
                      {u.name}{" "}
                      <span
                        style={{
                          fontSize: 11,
                          color: C.muted,
                          fontWeight: 400,
                        }}
                      >
                        @{u.username}
                      </span>
                    </div>
                    <Pill
                      text={ROLES[u.role]}
                      color={
                        u.role === "admin"
                          ? "red"
                          : u.role === "manager"
                          ? "blue"
                          : u.role === "operator"
                          ? "yellow"
                          : "gray"
                      }
                    />
                  </div>
                  {u.id !== "1" ? (
                    <button
                      onClick={() => {
                        if (!window.confirm(`Remove ${u.name}?`)) return;
                        const updated = users.filter((x) => x.id !== u.id);
                        setUsers(updated);
                        persist("mcw_users", updated);
                      }}
                      style={{
                        color: C.red,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 600,
                        fontFamily: "'DM Sans',sans-serif",
                      }}
                    >
                      Remove
                    </button>
                  ) : (
                    <span style={{ fontSize: 11, color: C.mutedLt }}>
                      Protected
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {editAsset && (
        <Modal
          title="Edit Asset"
          subtitle="Update asset details"
          onClose={() => setEditAsset(null)}
        >
          <Field label="Asset Name" required>
            <input
              {...inp}
              value={editAsset.name}
              onChange={(e) =>
                setEditAsset({ ...editAsset, name: e.target.value })
              }
            />
          </Field>
          <Row2>
            <Field label="Category">
              <select
                {...inp}
                value={editAsset.category}
                onChange={(e) =>
                  setEditAsset({ ...editAsset, category: e.target.value })
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                {...inp}
                value={editAsset.status}
                onChange={(e) =>
                  setEditAsset({ ...editAsset, status: e.target.value })
                }
              >
                {ASSET_STATUS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </Row2>
          <Field label="Registration / Serial No.">
            <input
              {...inp}
              value={editAsset.serialNumber || ""}
              onChange={(e) =>
                setEditAsset({ ...editAsset, serialNumber: e.target.value })
              }
            />
          </Field>
          <Row2>
            <Field label="Purchase Date" required>
              <input
                type="date"
                {...inp}
                value={editAsset.purchaseDate}
                onChange={(e) =>
                  setEditAsset({ ...editAsset, purchaseDate: e.target.value })
                }
              />
            </Field>
            <Field label="Purchase Cost (R)" required>
              <input
                type="number"
                {...inp}
                value={editAsset.purchaseCost}
                onChange={(e) =>
                  setEditAsset({ ...editAsset, purchaseCost: e.target.value })
                }
              />
            </Field>
          </Row2>
          <Row2>
            <Field label="Location">
              <select
                {...inp}
                value={editAsset.location}
                onChange={(e) =>
                  setEditAsset({ ...editAsset, location: e.target.value })
                }
              >
                {siteNames.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Assigned To">
              <input
                {...inp}
                value={editAsset.assignedTo || ""}
                onChange={(e) =>
                  setEditAsset({ ...editAsset, assignedTo: e.target.value })
                }
              />
            </Field>
          </Row2>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn
              style={{ flex: 1 }}
              onClick={() => {
                if (
                  !editAsset.name ||
                  !editAsset.purchaseDate ||
                  !editAsset.purchaseCost
                ) {
                  toast("Fill in required fields.", "error");
                  return;
                }
                update(
                  "mcw_assets",
                  setAssets,
                  assets,
                  editAsset.id,
                  editAsset
                );
                setEditAsset(null);
              }}
            >
              Save Changes
            </Btn>
            <Btn variant="ghost" onClick={() => setEditAsset(null)}>
              Cancel
            </Btn>
          </div>
        </Modal>
      )}
      <Toast toasts={toasts} remove={removeToast} />
    </div>
  );
}