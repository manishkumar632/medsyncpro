"use client";
import { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Heart,
  Droplets,
  Wind,
  Thermometer,
  Weight,
  Activity,
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Info,
  Zap,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  createHealthTrackerEntryAction,
  fetchHealthTrackerEntriesAction,
} from "@/actions/medicationAction";

// ─── Backend enum ↔ frontend vital-id mapping ────────────────────────────────
const METRIC_TYPE_MAP = {
  bp: "BLOOD_PRESSURE",
  heartRate: "HEART_RATE",
  spo2: "OXYGEN_SATURATION",
  glucose: "BLOOD_SUGAR",
  weight: "WEIGHT",
  temp: "TEMPERATURE",
};

const REVERSE_METRIC_MAP = {
  BLOOD_PRESSURE: "bp",
  HEART_RATE: "heartRate",
  OXYGEN_SATURATION: "spo2",
  BLOOD_SUGAR: "glucose",
  WEIGHT: "weight",
  TEMPERATURE: "temp",
};

// ─── Transform one backend entry → chart-ready data point ────────────────────
function entryToChartPoint(entry) {
  const date = new Date(entry.recordedAt);
  const dateLabel = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const vitalId = REVERSE_METRIC_MAP[entry.metricType];

  if (vitalId === "bp") {
    // metricValue stored as "systolic/diastolic" e.g. "120/80"
    const parts = (entry.metricValue ?? "0/0").split("/").map(Number);
    return {
      date: dateLabel,
      systolic: parts[0] ?? 0,
      diastolic: parts[1] ?? 0,
      recordedAt: entry.recordedAt,
    };
  }
  if (vitalId === "glucose") {
    // metricValue stored as "fasting/postMeal" e.g. "92/128"
    const parts = (entry.metricValue ?? "0/0").split("/").map(Number);
    return {
      date: dateLabel,
      fasting: parts[0] ?? 0,
      postMeal: parts[1] ?? parts[0] ?? 0,
      recordedAt: entry.recordedAt,
    };
  }
  return {
    date: dateLabel,
    value: parseFloat(entry.metricValue ?? "0"),
    recordedAt: entry.recordedAt,
  };
}

// ─── Group a flat list of entries into the vitalsData shape ──────────────────
function buildVitalsData(entries) {
  const grouped = {
    bp: [],
    heartRate: [],
    spo2: [],
    glucose: [],
    weight: [],
    temp: [],
  };

  const sorted = [...entries].sort(
    (a, b) => new Date(a.recordedAt) - new Date(b.recordedAt),
  );

  for (const entry of sorted) {
    const vitalId = REVERSE_METRIC_MAP[entry.metricType];
    if (vitalId && Object.prototype.hasOwnProperty.call(grouped, vitalId)) {
      grouped[vitalId].push(entryToChartPoint(entry));
    }
  }

  return grouped;
}

// ─── Empty state per vital (no entries yet) ───────────────────────────────────
const EMPTY_VITALS = {
  bp: [],
  heartRate: [],
  spo2: [],
  glucose: [],
  weight: [],
  temp: [],
};

// ─── Config for each vital ───────────────────────────────────────────────────
const VITALS_CONFIG = {
  bp: {
    id: "bp",
    label: "Blood Pressure",
    unit: "mmHg",
    icon: Activity,
    color: "#ef4444",
    bg: "#fff1f1",
    refMin: 90,
    refMax: 120,
    fields: [
      { key: "systolic", label: "Systolic" },
      { key: "diastolic", label: "Diastolic" },
    ],
  },
  heartRate: {
    id: "heartRate",
    label: "Heart Rate",
    unit: "bpm",
    icon: Heart,
    color: "#f97316",
    bg: "#fff7ed",
    refMin: 60,
    refMax: 100,
    fields: [{ key: "value", label: "BPM" }],
  },
  spo2: {
    id: "spo2",
    label: "Oxygen Saturation",
    unit: "%",
    icon: Wind,
    color: "#0ea5e9",
    bg: "#f0f9ff",
    refMin: 95,
    refMax: 100,
    fields: [{ key: "value", label: "SpO₂ %" }],
  },
  glucose: {
    id: "glucose",
    label: "Blood Glucose",
    unit: "mg/dL",
    icon: Droplets,
    color: "#8b5cf6",
    bg: "#f5f3ff",
    refMin: 70,
    refMax: 100,
    fields: [
      { key: "fasting", label: "Fasting" },
      { key: "postMeal", label: "Post-Meal" },
    ],
  },
  weight: {
    id: "weight",
    label: "Body Weight",
    unit: "kg",
    icon: Weight,
    color: "#0d9488",
    bg: "#f0fdfa",
    refMin: 50,
    refMax: 90,
    fields: [{ key: "value", label: "kg" }],
  },
  temp: {
    id: "temp",
    label: "Body Temperature",
    unit: "°C",
    icon: Thermometer,
    color: "#d97706",
    bg: "#fffbeb",
    refMin: 36.1,
    refMax: 37.2,
    fields: [{ key: "value", label: "°C" }],
  },
};

// ─── Status helpers ──────────────────────────────────────────────────────────
function getStatus(id, data) {
  if (!data || data.length === 0) return "normal";
  const last = data[data.length - 1];
  const cfg = VITALS_CONFIG[id];
  if (!last) return "normal";
  const val =
    id === "bp" ? last.systolic : id === "glucose" ? last.fasting : last.value;
  if (val == null) return "normal";
  if (val < cfg.refMin * 0.92 || val > cfg.refMax * 1.08) return "critical";
  if (val < cfg.refMin || val > cfg.refMax) return "warning";
  return "normal";
}

const STATUS_META = {
  normal: {
    label: "Normal",
    color: "#22c55e",
    bg: "#f0fdf4",
    Icon: CheckCircle2,
  },
  warning: {
    label: "Watch",
    color: "#f59e0b",
    bg: "#fffbeb",
    Icon: AlertTriangle,
  },
  critical: {
    label: "High",
    color: "#ef4444",
    bg: "#fef2f2",
    Icon: AlertTriangle,
  },
};

function getTrend(arr, key = "value") {
  if (!arr || arr.length < 3) return "flat";
  const last = arr[arr.length - 1][key];
  const prev = arr[arr.length - 4]?.[key] ?? arr[0][key];
  const diff = last - prev;
  if (Math.abs(diff) < 1) return "flat";
  return diff > 0 ? "up" : "down";
}

// ─── Mini sparkline for cards ────────────────────────────────────────────────
function Sparkline({ data, color, dataKey = "value" }) {
  if (!data || data.length === 0) return <div style={{ height: 48 }} />;
  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart
        data={data.slice(-7)}
        margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
      >
        <defs>
          <linearGradient
            id={`sg-${color.replace("#", "")}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#sg-${color.replace("#", "")})`}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Custom chart tooltip ────────────────────────────────────────────────────
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: "8px 12px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
        fontSize: "0.78rem",
      }}
    >
      <div style={{ color: "#94a3b8", marginBottom: 4, fontWeight: 600 }}>
        {label}
      </div>
      {payload.map((p, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "#1e293b",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: p.color,
              flexShrink: 0,
            }}
          />
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
}

// ─── Log reading modal ────────────────────────────────────────────────────────
function LogModal({ vitalId, onClose, onSave }) {
  const cfg = VITALS_CONFIG[vitalId];
  const [vals, setVals] = useState(
    Object.fromEntries(cfg.fields.map((f) => [f.key, ""])),
  );
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const handleSave = async () => {
    const hasEmpty = cfg.fields.some((f) => !vals[f.key]);
    if (hasEmpty || saving) return;
    setSaving(true);
    await onSave(vitalId, {
      ...Object.fromEntries(
        Object.entries(vals).map(([k, v]) => [k, parseFloat(v)]),
      ),
      date: today,
      note,
    });
    setSaving(false);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.45)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: 28,
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          animation: "hv-modal-in 0.2s ease",
        }}
      >
        {/* Modal header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: cfg.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: cfg.color,
              }}
            >
              <cfg.icon size={18} />
            </div>
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  color: "#0f172a",
                }}
              >
                Log {cfg.label}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                Today · {today}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              cursor: "pointer",
              width: 32,
              height: 32,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {cfg.fields.map((f) => (
            <div key={f.key}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "#475569",
                  marginBottom: 6,
                }}
              >
                {f.label}{" "}
                <span style={{ color: "#94a3b8", fontWeight: 400 }}>
                  ({cfg.unit})
                </span>
              </label>
              <input
                type="number"
                value={vals[f.key]}
                onChange={(e) =>
                  setVals((v) => ({ ...v, [f.key]: e.target.value }))
                }
                placeholder={`Enter ${f.label.toLowerCase()}…`}
                style={{
                  width: "100%",
                  border: "1.5px solid #e2e8f0",
                  borderRadius: 10,
                  padding: "10px 14px",
                  fontSize: "0.9rem",
                  outline: "none",
                  fontFamily: "inherit",
                  color: "#1e293b",
                  background: "#f8fafc",
                  boxSizing: "border-box",
                  transition: "border 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = cfg.color)}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>
          ))}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.78rem",
                fontWeight: 600,
                color: "#475569",
                marginBottom: 6,
              }}
            >
              Note{" "}
              <span style={{ color: "#94a3b8", fontWeight: 400 }}>
                (optional)
              </span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any symptoms or context…"
              rows={2}
              style={{
                width: "100%",
                border: "1.5px solid #e2e8f0",
                borderRadius: 10,
                padding: "10px 14px",
                fontSize: "0.85rem",
                outline: "none",
                fontFamily: "inherit",
                color: "#1e293b",
                background: "#f8fafc",
                resize: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button
            onClick={onClose}
            disabled={saving}
            style={{
              flex: 1,
              padding: "11px",
              borderRadius: 10,
              border: "1.5px solid #e2e8f0",
              background: "#fff",
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              fontWeight: 600,
              fontSize: "0.85rem",
              color: "#64748b",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 2,
              padding: "11px",
              borderRadius: 10,
              border: "none",
              background: saving ? "#94a3b8" : cfg.color,
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              fontWeight: 700,
              fontSize: "0.85rem",
              color: "#fff",
              boxShadow: saving ? "none" : `0 4px 12px ${cfg.color}40`,
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            {saving ? (
              <>
                <Loader2 size={14} className="hv-spin" /> Saving…
              </>
            ) : (
              "Save Reading"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Vital card ───────────────────────────────────────────────────────────────
function VitalCard({ id, data, onClick, onLog }) {
  const cfg = VITALS_CONFIG[id];
  const isEmpty = !data || data.length === 0;
  const last = isEmpty ? null : data[data.length - 1];
  const status = getStatus(id, data);
  const sm = STATUS_META[status];
  const mainKey =
    id === "bp" ? "systolic" : id === "glucose" ? "fasting" : "value";
  const trend = isEmpty ? "flat" : getTrend(data, mainKey);
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const displayVal = isEmpty
    ? "—"
    : id === "bp"
      ? `${last?.systolic ?? "—"}/${last?.diastolic ?? "—"}`
      : id === "glucose"
        ? `${last?.fasting ?? "—"}`
        : `${last?.value ?? "—"}`;

  return (
    <div
      className="hv-vital-card"
      onClick={onClick}
      style={{ "--card-color": cfg.color, "--card-bg": cfg.bg }}
    >
      <div className="hv-vc-top">
        <div
          className="hv-vc-icon"
          style={{ background: cfg.bg, color: cfg.color }}
        >
          <cfg.icon size={18} />
        </div>
        <span
          className="hv-vc-status"
          style={{ background: sm.bg, color: sm.color }}
        >
          <sm.Icon size={10} />
          {isEmpty ? "No data" : sm.label}
        </span>
      </div>
      <div className="hv-vc-value">
        {displayVal}
        {!isEmpty && <span className="hv-vc-unit">{cfg.unit}</span>}
      </div>
      <div className="hv-vc-label">{cfg.label}</div>
      {isEmpty ? (
        <div
          style={{
            fontSize: "0.72rem",
            color: "#94a3b8",
            margin: "6px 0 8px",
            fontStyle: "italic",
          }}
        >
          No readings yet — log your first!
        </div>
      ) : (
        <>
          <div className="hv-vc-trend">
            <TrendIcon
              size={12}
              style={{
                color:
                  trend === "up"
                    ? "#f59e0b"
                    : trend === "down"
                      ? "#22c55e"
                      : "#94a3b8",
              }}
            />
            <span>vs last reading</span>
          </div>
          <div className="hv-vc-spark">
            <Sparkline data={data} color={cfg.color} dataKey={mainKey} />
          </div>
        </>
      )}
      <button
        className="hv-vc-log-btn"
        onClick={(e) => {
          e.stopPropagation();
          onLog(id);
        }}
        style={{ "--btn-color": cfg.color }}
      >
        <Plus size={13} /> Log
      </button>
    </div>
  );
}

// ─── Detail chart panel ───────────────────────────────────────────────────────
function DetailPanel({ id, data, onClose, onLog }) {
  const cfg = VITALS_CONFIG[id];
  const isEmpty = !data || data.length === 0;
  const last = isEmpty ? null : data[data.length - 1];
  const status = getStatus(id, data);
  const sm = STATUS_META[status];
  const rangeLabel = `Normal: ${cfg.refMin}–${cfg.refMax} ${cfg.unit}`;

  return (
    <div className="hv-detail-panel">
      <div className="hv-dp-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: cfg.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: cfg.color,
            }}
          >
            <cfg.icon size={20} />
          </div>
          <div>
            <div
              style={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a" }}
            >
              {cfg.label}
            </div>
            <div style={{ fontSize: "0.74rem", color: "#94a3b8" }}>
              {rangeLabel}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="hv-btn hv-btn-outline" onClick={() => onLog(id)}>
            <Plus size={14} /> Log Reading
          </button>
          <button
            onClick={onClose}
            style={{
              background: "#f1f5f9",
              border: "none",
              cursor: "pointer",
              width: 36,
              height: 36,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748b",
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {isEmpty ? (
        <div
          style={{
            height: 180,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "#94a3b8",
            gap: 10,
          }}
        >
          <cfg.icon size={32} color={cfg.color} opacity={0.3} />
          <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>
            No readings yet for {cfg.label}.
          </div>
          <button
            className="hv-btn hv-btn-outline"
            onClick={() => onLog(id)}
            style={{ fontSize: "0.8rem" }}
          >
            <Plus size={13} /> Log First Reading
          </button>
        </div>
      ) : (
        <>
          {/* Chart */}
          <div style={{ height: 220, marginTop: 8 }}>
            <ResponsiveContainer width="100%" height="100%">
              {id === "bp" || id === "glucose" ? (
                <LineChart
                  data={data}
                  margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                  />
                  <Tooltip content={<ChartTip />} />
                  <ReferenceLine
                    y={cfg.refMax}
                    stroke="#fca5a5"
                    strokeDasharray="4 4"
                    label={{
                      value: "Max",
                      position: "insideTopRight",
                      fill: "#fca5a5",
                      fontSize: 10,
                    }}
                  />
                  <ReferenceLine
                    y={cfg.refMin}
                    stroke="#86efac"
                    strokeDasharray="4 4"
                    label={{
                      value: "Min",
                      position: "insideBottomRight",
                      fill: "#86efac",
                      fontSize: 10,
                    }}
                  />
                  {id === "bp" && (
                    <>
                      <Line
                        type="monotone"
                        dataKey="systolic"
                        stroke={cfg.color}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: cfg.color }}
                        name="Systolic"
                      />
                      <Line
                        type="monotone"
                        dataKey="diastolic"
                        stroke="#f97316"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: "#f97316" }}
                        name="Diastolic"
                      />
                    </>
                  )}
                  {id === "glucose" && (
                    <>
                      <Line
                        type="monotone"
                        dataKey="fasting"
                        stroke={cfg.color}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: cfg.color }}
                        name="Fasting"
                      />
                      <Line
                        type="monotone"
                        dataKey="postMeal"
                        stroke="#ec4899"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: "#ec4899" }}
                        name="Post-Meal"
                      />
                    </>
                  )}
                </LineChart>
              ) : (
                <AreaChart
                  data={data}
                  margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id={`dp-${id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor={cfg.color}
                        stopOpacity={0.18}
                      />
                      <stop
                        offset="100%"
                        stopColor={cfg.color}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    domain={["auto", "auto"]}
                  />
                  <Tooltip content={<ChartTip />} />
                  <ReferenceLine
                    y={cfg.refMax}
                    stroke="#fca5a5"
                    strokeDasharray="4 4"
                  />
                  <ReferenceLine
                    y={cfg.refMin}
                    stroke="#86efac"
                    strokeDasharray="4 4"
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={cfg.color}
                    strokeWidth={2.5}
                    fill={`url(#dp-${id})`}
                    dot={{
                      r: 3,
                      fill: cfg.color,
                      stroke: "#fff",
                      strokeWidth: 2,
                    }}
                    name={cfg.label}
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Recent readings table */}
          <div style={{ marginTop: 20 }}>
            <div
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "#475569",
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Recent Readings
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                maxHeight: 220,
                overflowY: "auto",
              }}
            >
              {[...data]
                .reverse()
                .slice(0, 10)
                .map((row, i) => {
                  const vals = cfg.fields
                    .map((f) => `${f.label}: ${row[f.key] ?? "—"}`)
                    .join("  ·  ");
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "9px 12px",
                        background: i === 0 ? cfg.bg : "#f8fafc",
                        borderRadius: 10,
                        border: `1px solid ${i === 0 ? cfg.color + "25" : "#f1f5f9"}`,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Calendar size={13} color="#94a3b8" />
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "#475569",
                            fontWeight: 500,
                          }}
                        >
                          {row.date}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          color: i === 0 ? cfg.color : "#1e293b",
                        }}
                      >
                        {vals}{" "}
                        <span style={{ fontWeight: 400, color: "#94a3b8" }}>
                          {cfg.unit}
                        </span>
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Health Score ────────────────────────────────────────────────────────────
function HealthScore({ vitalsData }) {
  const scores = Object.keys(VITALS_CONFIG).map((id) => {
    const data = vitalsData[id];
    if (!data || data.length === 0) return 100; // no data = neutral
    const s = getStatus(id, data);
    return s === "normal" ? 100 : s === "warning" ? 65 : 30;
  });
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const color = avg >= 85 ? "#22c55e" : avg >= 60 ? "#f59e0b" : "#ef4444";
  const label =
    avg >= 85 ? "Excellent" : avg >= 60 ? "Fair" : "Needs Attention";
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (avg / 100) * circumference;

  return (
    <div className="hv-score-card">
      <div className="hv-score-ring-wrap">
        <svg width={110} height={110} viewBox="0 0 110 110">
          <circle
            cx={55}
            cy={55}
            r={42}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={10}
          />
          <circle
            cx={55}
            cy={55}
            r={42}
            fill="none"
            stroke={color}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 55 55)"
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
          <text
            x={55}
            y={52}
            textAnchor="middle"
            fill={color}
            fontSize={22}
            fontWeight={800}
            fontFamily="Sora, sans-serif"
          >
            {avg}
          </text>
          <text
            x={55}
            y={67}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize={10}
            fontFamily="Sora, sans-serif"
          >
            /100
          </text>
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontWeight: 800,
            fontSize: "1.1rem",
            color,
            marginBottom: 4,
          }}
        >
          {label}
        </div>
        <div
          style={{ fontSize: "0.74rem", color: "#94a3b8", marginBottom: 10 }}
        >
          Overall health score
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px" }}>
          {Object.keys(VITALS_CONFIG).map((id) => {
            const data = vitalsData[id];
            const s =
              !data || data.length === 0 ? "normal" : getStatus(id, data);
            const m = STATUS_META[s];
            return (
              <span
                key={id}
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  color: m.color,
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                <m.Icon size={9} />
                {VITALS_CONFIG[id].label.split(" ")[0]}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── BMI Calculator ──────────────────────────────────────────────────────────
function BmiWidget({ weight }) {
  const [height, setHeight] = useState(170);
  const bmi = weight ? +(weight / (height / 100) ** 2).toFixed(1) : 0;
  const bmiLabel =
    bmi < 18.5
      ? "Underweight"
      : bmi < 25
        ? "Normal"
        : bmi < 30
          ? "Overweight"
          : "Obese";
  const bmiColor =
    bmi < 18.5
      ? "#0ea5e9"
      : bmi < 25
        ? "#22c55e"
        : bmi < 30
          ? "#f59e0b"
          : "#ef4444";
  const bmiPct = Math.min(100, Math.max(0, ((bmi - 10) / 30) * 100));

  return (
    <div className="hv-bmi-card">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <Zap size={16} color="#6366f1" />
        <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>
          BMI Calculator
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <label
          style={{
            fontSize: "0.78rem",
            color: "#64748b",
            whiteSpace: "nowrap",
            fontWeight: 500,
          }}
        >
          Height (cm)
        </label>
        <input
          type="range"
          min={140}
          max={210}
          value={height}
          onChange={(e) => setHeight(+e.target.value)}
          style={{ flex: 1, accentColor: "#6366f1" }}
        />
        <span
          style={{
            fontWeight: 700,
            color: "#0f172a",
            fontSize: "0.88rem",
            minWidth: 36,
          }}
        >
          {height}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              height: 8,
              background:
                "linear-gradient(to right, #0ea5e9, #22c55e, #f59e0b, #ef4444)",
              borderRadius: 999,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -3,
                left: `${bmiPct}%`,
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: bmiColor,
                border: "2px solid #fff",
                boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                transform: "translateX(-50%)",
                transition: "left 0.3s",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 5,
              fontSize: "0.65rem",
              color: "#94a3b8",
            }}
          >
            <span>Under</span>
            <span>Normal</span>
            <span>Over</span>
            <span>Obese</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: bmiColor,
              lineHeight: 1,
            }}
          >
            {bmi}
          </div>
          <div
            style={{ fontSize: "0.72rem", color: bmiColor, fontWeight: 600 }}
          >
            {bmiLabel}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tips panel ──────────────────────────────────────────────────────────────
const TIPS = [
  {
    icon: "💧",
    title: "Hydration",
    tip: "Drink 8–10 glasses of water daily to maintain blood pressure and kidney health.",
  },
  {
    icon: "🚶",
    title: "Activity",
    tip: "30 minutes of moderate exercise 5 days a week improves heart rate and weight.",
  },
  {
    icon: "😴",
    title: "Sleep",
    tip: "7–9 hours of sleep regulates glucose levels and reduces cardiovascular risk.",
  },
  {
    icon: "🥗",
    title: "Diet",
    tip: "Low sodium, high fibre diet keeps blood pressure and glucose in check.",
  },
];

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function VitalsLoadingSkeleton() {
  return (
    <div className="hv-vitals-grid">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: 16,
            border: "1.5px solid #f1f5f9",
            animation: "hv-pulse 1.5s ease-in-out infinite",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "#f1f5f9",
              }}
            />
            <div
              style={{
                width: 56,
                height: 22,
                borderRadius: 999,
                background: "#f1f5f9",
              }}
            />
          </div>
          <div
            style={{
              width: "60%",
              height: 28,
              borderRadius: 8,
              background: "#f1f5f9",
              marginBottom: 8,
            }}
          />
          <div
            style={{
              width: "40%",
              height: 14,
              borderRadius: 6,
              background: "#f1f5f9",
              marginBottom: 8,
            }}
          />
          <div
            style={{
              width: "100%",
              height: 48,
              borderRadius: 8,
              background: "#f1f5f9",
              marginBottom: 10,
            }}
          />
          <div
            style={{
              width: "100%",
              height: 34,
              borderRadius: 9,
              background: "#f1f5f9",
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
export default function PatientHealthVitals() {
  const [vitalsData, setVitalsData] = useState(EMPTY_VITALS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeVital, setActiveVital] = useState(null);
  const [logModal, setLogModal] = useState(null);

  // ── Fetch all entries from backend on mount ───────────────────────────────
  const fetchAllVitals = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchHealthTrackerEntriesAction();
      if (result.success && Array.isArray(result.data)) {
        setVitalsData(buildVitalsData(result.data));
      } else {
        setError(result.message || "Failed to load vitals. Please try again.");
      }
    } catch (err) {
      setError("Unexpected error loading vitals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllVitals();
  }, []);

  // ── Latest weight for BMI widget (from real data) ─────────────────────────
  const latestWeight =
    vitalsData.weight.length > 0
      ? vitalsData.weight[vitalsData.weight.length - 1]?.value
      : null;

  // ── Handle logging a new reading ──────────────────────────────────────────
  const handleLog = async (id, entry) => {
    // Build backend payload
    const metricType = METRIC_TYPE_MAP[id];
    const cfg = VITALS_CONFIG[id];
    let metricValue;

    if (id === "bp") {
      metricValue = `${entry.systolic}/${entry.diastolic}`;
    } else if (id === "glucose") {
      metricValue = `${entry.fasting}/${entry.postMeal}`;
    } else {
      metricValue = String(entry.value);
    }

    // Optimistic UI — append the new point immediately
    setVitalsData((prev) => ({
      ...prev,
      [id]: [...prev[id], { ...entry }],
    }));

    // Persist to backend
    const payload = {
      metricType,
      metricValue,
      unit: cfg.unit,
      recordedAt: new Date().toISOString(),
      notes: entry.note || null,
    };

    const result = await createHealthTrackerEntryAction(payload);
    if (!result.success) {
      // Roll back optimistic update and re-fetch real state
      fetchAllVitals();
    }
  };

  // ── Derived counts for summary bar ────────────────────────────────────────
  const normalCount = Object.keys(VITALS_CONFIG).filter(
    (id) =>
      vitalsData[id]?.length > 0 && getStatus(id, vitalsData[id]) === "normal",
  ).length;
  const warningCount = Object.keys(VITALS_CONFIG).filter(
    (id) =>
      vitalsData[id]?.length > 0 && getStatus(id, vitalsData[id]) === "warning",
  ).length;
  const criticalCount = Object.keys(VITALS_CONFIG).filter(
    (id) =>
      vitalsData[id]?.length > 0 &&
      getStatus(id, vitalsData[id]) === "critical",
  ).length;
  const loggedCount = Object.keys(VITALS_CONFIG).filter(
    (id) => vitalsData[id]?.length > 0,
  ).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');

        .hv-root { font-family: 'Sora', sans-serif; color: #1e293b; min-height: 100%; }

        /* ── Header ── */
        .hv-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
        .hv-header h1 { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0 0 4px; display: flex; align-items: center; gap: 10px; }
        .hv-header p { margin: 0; font-size: 0.83rem; color: #64748b; }

        /* ── Summary bar ── */
        .hv-summary-bar { display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; }
        .hv-sum-pill { display: flex; align-items: center; gap: 7px; padding: 9px 16px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; border: 1.5px solid transparent; }

        /* ── Main grid ── */
        .hv-main-grid { display: grid; grid-template-columns: 1fr 360px; gap: 20px; align-items: start; }
        @media (max-width: 1100px) { .hv-main-grid { grid-template-columns: 1fr; } }

        /* ── Vitals grid ── */
        .hv-vitals-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 20px; }
        @media (max-width: 900px) { .hv-vitals-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .hv-vitals-grid { grid-template-columns: 1fr; } }

        /* ── Vital card ── */
        .hv-vital-card { background: #fff; border-radius: 16px; padding: 16px; border: 1.5px solid #f1f5f9; cursor: pointer; transition: all 0.18s ease; position: relative; overflow: hidden; }
        .hv-vital-card:hover { border-color: var(--card-color); box-shadow: 0 8px 24px rgba(0,0,0,0.08); transform: translateY(-2px); }
        .hv-vital-card::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--card-color); border-radius: 16px 16px 0 0; opacity: 0; transition: opacity 0.18s; }
        .hv-vital-card:hover::before { opacity: 1; }

        .hv-vc-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .hv-vc-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .hv-vc-status { display: flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 999px; font-size: 0.68rem; font-weight: 700; }
        .hv-vc-value { font-size: 1.6rem; font-weight: 800; color: #0f172a; line-height: 1; }
        .hv-vc-unit { font-size: 0.8rem; font-weight: 500; color: #94a3b8; margin-left: 3px; }
        .hv-vc-label { font-size: 0.76rem; color: #64748b; margin: 4px 0 6px; font-weight: 500; }
        .hv-vc-trend { display: flex; align-items: center; gap: 4px; font-size: 0.7rem; color: #94a3b8; margin-bottom: 8px; }
        .hv-vc-spark { margin: 0 -4px; }
        .hv-vc-log-btn { margin-top: 10px; width: 100%; display: flex; align-items: center; justify-content: center; gap: 5px; padding: 7px; border-radius: 9px; border: 1.5px solid var(--btn-color); background: transparent; color: var(--btn-color); font-size: 0.76rem; font-weight: 700; cursor: pointer; transition: all 0.15s; font-family: inherit; }
        .hv-vc-log-btn:hover { background: var(--btn-color); color: #fff; }

        /* ── Detail panel ── */
        .hv-detail-panel { background: #fff; border-radius: 16px; padding: 20px; border: 1.5px solid #f1f5f9; margin-bottom: 20px; animation: hv-slide-in 0.2s ease; }
        @keyframes hv-slide-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .hv-dp-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }

        /* ── Right sidebar cards ── */
        .hv-score-card { background: #fff; border-radius: 16px; padding: 20px; border: 1.5px solid #f1f5f9; display: flex; align-items: center; gap: 16px; margin-bottom: 14px; }
        .hv-score-ring-wrap { flex-shrink: 0; }
        .hv-bmi-card { background: #fff; border-radius: 16px; padding: 18px; border: 1.5px solid #f1f5f9; margin-bottom: 14px; }
        .hv-tips-card { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; padding: 18px; color: #fff; }
        .hv-tips-card h4 { margin: 0 0 14px; font-size: 0.88rem; font-weight: 700; opacity: 0.9; }
        .hv-tip-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.07); }
        .hv-tip-item:last-child { border-bottom: none; padding-bottom: 0; }
        .hv-tip-icon { font-size: 18px; flex-shrink: 0; line-height: 1.2; }
        .hv-tip-title { font-size: 0.78rem; font-weight: 700; margin-bottom: 2px; }
        .hv-tip-text { font-size: 0.72rem; opacity: 0.65; line-height: 1.5; }

        /* ── Buttons ── */
        .hv-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 10px; font-size: 0.82rem; font-weight: 600; cursor: pointer; transition: all 0.15s; font-family: inherit; }
        .hv-btn-primary { background: #0f172a; color: #fff; border: none; box-shadow: 0 4px 12px rgba(15,23,42,0.2); }
        .hv-btn-primary:hover { background: #1e293b; transform: translateY(-1px); }
        .hv-btn-outline { background: #fff; color: #475569; border: 1.5px solid #e2e8f0; }
        .hv-btn-outline:hover { background: #f8fafc; border-color: #cbd5e1; }

        /* ── Animations ── */
        @keyframes hv-modal-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes hv-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes hv-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .hv-spin { animation: hv-spin 0.8s linear infinite; }
      `}</style>

      <div className="hv-root">
        {/* ── Header ── */}
        <div className="hv-header">
          <div>
            <h1>
              <Activity size={22} color="#6366f1" /> Health Vitals
            </h1>
            <p>Track and monitor your key health metrics over time</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {!loading && (
              <button
                className="hv-btn hv-btn-outline"
                onClick={fetchAllVitals}
                title="Refresh"
              >
                <RefreshCw size={14} />
              </button>
            )}
            <button
              className="hv-btn hv-btn-primary"
              onClick={() => setLogModal(activeVital || "bp")}
            >
              <Plus size={15} /> Log New Reading
            </button>
          </div>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1.5px solid #fecaca",
              borderRadius: 12,
              padding: "12px 16px",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#dc2626",
                fontSize: "0.84rem",
                fontWeight: 600,
              }}
            >
              <AlertTriangle size={16} />
              {error}
            </div>
            <button
              onClick={fetchAllVitals}
              style={{
                background: "#dc2626",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}

        {/* ── Summary bar ── */}
        {!loading && (
          <div className="hv-summary-bar">
            {loggedCount === 0 ? (
              <div
                className="hv-sum-pill"
                style={{
                  background: "#f8fafc",
                  color: "#64748b",
                  borderColor: "#e2e8f0",
                }}
              >
                <Info size={14} /> No readings logged yet
              </div>
            ) : (
              <>
                {normalCount > 0 && (
                  <div
                    className="hv-sum-pill"
                    style={{
                      background: "#f0fdf4",
                      color: "#16a34a",
                      borderColor: "#bbf7d0",
                    }}
                  >
                    <CheckCircle2 size={14} /> {normalCount} Normal
                  </div>
                )}
                {warningCount > 0 && (
                  <div
                    className="hv-sum-pill"
                    style={{
                      background: "#fffbeb",
                      color: "#d97706",
                      borderColor: "#fde68a",
                    }}
                  >
                    <AlertTriangle size={14} /> {warningCount} Watch
                  </div>
                )}
                {criticalCount > 0 && (
                  <div
                    className="hv-sum-pill"
                    style={{
                      background: "#fef2f2",
                      color: "#dc2626",
                      borderColor: "#fecaca",
                    }}
                  >
                    <AlertTriangle size={14} /> {criticalCount} Needs Attention
                  </div>
                )}
              </>
            )}
            <div
              className="hv-sum-pill"
              style={{
                background: "#f8fafc",
                color: "#64748b",
                borderColor: "#e2e8f0",
                marginLeft: "auto",
              }}
            >
              <Calendar size={13} /> Last 14 days
            </div>
          </div>
        )}

        {/* ── Main grid ── */}
        <div className="hv-main-grid">
          {/* Left: vitals + detail */}
          <div>
            {loading ? (
              <VitalsLoadingSkeleton />
            ) : (
              <>
                <div className="hv-vitals-grid">
                  {Object.keys(VITALS_CONFIG).map((id) => (
                    <VitalCard
                      key={id}
                      id={id}
                      data={vitalsData[id]}
                      onClick={() =>
                        setActiveVital(activeVital === id ? null : id)
                      }
                      onLog={setLogModal}
                    />
                  ))}
                </div>

                {activeVital && (
                  <DetailPanel
                    id={activeVital}
                    data={vitalsData[activeVital]}
                    onClose={() => setActiveVital(null)}
                    onLog={setLogModal}
                  />
                )}
              </>
            )}
          </div>

          {/* Right sidebar */}
          <div>
            {loading ? (
              <div>
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#fff",
                      borderRadius: 16,
                      padding: 20,
                      border: "1.5px solid #f1f5f9",
                      marginBottom: 14,
                      height: i === 2 ? 160 : 130,
                      animation: "hv-pulse 1.5s ease-in-out infinite",
                    }}
                  />
                ))}
              </div>
            ) : (
              <>
                <HealthScore vitalsData={vitalsData} />
                <BmiWidget weight={latestWeight} />
                <div className="hv-tips-card">
                  <h4>🩺 Health Tips</h4>
                  {TIPS.map((t, i) => (
                    <div key={i} className="hv-tip-item">
                      <span className="hv-tip-icon">{t.icon}</span>
                      <div>
                        <div className="hv-tip-title">{t.title}</div>
                        <div className="hv-tip-text">{t.tip}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Log modal ── */}
      {logModal && (
        <LogModal
          vitalId={logModal}
          onClose={() => setLogModal(null)}
          onSave={handleLog}
        />
      )}
    </>
  );
}
