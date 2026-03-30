'use client'
import { useState, useRef, useCallback, useEffect } from "react";

const TW = 288;
const RH = 25;
const HH = 42;
const PAD = 6;
const getH = (f) => HH + f.length * RH + PAD;

const DOMAIN = {
  auth:       { color: "#3B82F6", dim: "#1E3A5F22", label: "🔐 Auth & Access Control" },
  healthcare: { color: "#10B981", dim: "#065F4622", label: "🏥 Core Healthcare" },
  scheduling: { color: "#F59E0B", dim: "#78350F22", label: "📅 Scheduling" },
  clinical:   { color: "#A855F7", dim: "#4C1D9522", label: "🩺 Clinical" },
  billing:    { color: "#EF4444", dim: "#7F1D1D22", label: "💳 Billing" },
  system:     { color: "#64748B", dim: "#1E293B22", label: "🔔 System" },
};

const TABLES = [
  // ── AUTH ──────────────────────────────────────────────────────
  { id:"Role", domain:"auth", x:20, y:20, fields:[
    { n:"role_id",     t:"INT",         k:"PK", d:"Primary Key" },
    { n:"role_name",   t:"VARCHAR(50)", k:"",   d:"UNIQUE NOT NULL" },
    { n:"description", t:"TEXT",        k:"",   d:"" },
    { n:"created_at",  t:"TIMESTAMP",   k:"",   d:"DEFAULT NOW()" },
    { n:"updated_at",  t:"TIMESTAMP",   k:"",   d:"" },
  ]},
  { id:"Permission", domain:"auth", x:340, y:20, fields:[
    { n:"permission_id", t:"INT",          k:"PK", d:"Primary Key" },
    { n:"name",          t:"VARCHAR(100)", k:"",   d:"UNIQUE NOT NULL" },
    { n:"module",        t:"VARCHAR(100)", k:"",   d:"e.g. dashboard" },
    { n:"action",        t:"VARCHAR(50)",  k:"",   d:"view/edit/delete/create" },
    { n:"description",   t:"TEXT",         k:"",   d:"" },
    { n:"created_at",    t:"TIMESTAMP",    k:"",   d:"" },
  ]},
  { id:"User", domain:"auth", x:20, y:210, fields:[
    { n:"user_id",       t:"INT",          k:"PK", d:"Primary Key" },
    { n:"full_name",     t:"VARCHAR(100)", k:"",   d:"NOT NULL" },
    { n:"email",         t:"VARCHAR(150)", k:"",   d:"UNIQUE NOT NULL" },
    { n:"password_hash", t:"VARCHAR(255)", k:"",   d:"NOT NULL" },
    { n:"phone",         t:"VARCHAR(20)",  k:"",   d:"" },
    { n:"profile_photo", t:"VARCHAR(255)", k:"",   d:"" },
    { n:"gender",        t:"ENUM",         k:"",   d:"Male/Female/Other" },
    { n:"date_of_birth", t:"DATE",         k:"",   d:"" },
    { n:"is_active",     t:"BOOLEAN",      k:"",   d:"DEFAULT TRUE" },
    { n:"is_verified",   t:"BOOLEAN",      k:"",   d:"DEFAULT FALSE" },
    { n:"created_at",    t:"TIMESTAMP",    k:"",   d:"DEFAULT NOW()" },
    { n:"updated_at",    t:"TIMESTAMP",    k:"",   d:"" },
    { n:"last_login",    t:"TIMESTAMP",    k:"",   d:"" },
    { n:"created_by",    t:"INT",          k:"FK", d:"→ User.user_id" },
  ]},
  { id:"UserRole", domain:"auth", x:340, y:210, fields:[
    { n:"user_role_id", t:"INT",       k:"PK", d:"Mapping: User ↔ Role" },
    { n:"user_id",      t:"INT",       k:"FK", d:"→ User.user_id" },
    { n:"role_id",      t:"INT",       k:"FK", d:"→ Role.role_id" },
    { n:"assigned_by",  t:"INT",       k:"FK", d:"→ User.user_id" },
    { n:"assigned_at",  t:"TIMESTAMP", k:"",   d:"DEFAULT NOW()" },
    { n:"is_active",    t:"BOOLEAN",   k:"",   d:"DEFAULT TRUE" },
  ]},
  { id:"RolePermission", domain:"auth", x:340, y:430, fields:[
    { n:"role_permission_id", t:"INT",       k:"PK", d:"Mapping: Role ↔ Permission" },
    { n:"role_id",            t:"INT",       k:"FK", d:"→ Role.role_id" },
    { n:"permission_id",      t:"INT",       k:"FK", d:"→ Permission.permission_id" },
    { n:"granted_by",         t:"INT",       k:"FK", d:"→ User.user_id" },
    { n:"created_at",         t:"TIMESTAMP", k:"",   d:"" },
  ]},
  { id:"FeatureToggle", domain:"auth", x:660, y:20, fields:[
    { n:"toggle_id",   t:"INT",          k:"PK", d:"Primary Key" },
    { n:"feature_key", t:"VARCHAR(100)", k:"",   d:"e.g. dashboard:settings_tab" },
    { n:"label",       t:"VARCHAR(150)", k:"",   d:"Human-readable label" },
    { n:"scope",       t:"ENUM",         k:"",   d:"global/per_role/per_user" },
    { n:"role_id",     t:"INT",          k:"FK", d:"→ Role.role_id (nullable)" },
    { n:"user_id",     t:"INT",          k:"FK", d:"→ User.user_id (override)" },
    { n:"is_enabled",  t:"BOOLEAN",      k:"",   d:"DEFAULT TRUE" },
    { n:"reason",      t:"TEXT",         k:"",   d:"Why toggle changed" },
    { n:"changed_by",  t:"INT",          k:"FK", d:"→ User.user_id (audit)" },
    { n:"created_at",  t:"TIMESTAMP",    k:"",   d:"" },
    { n:"updated_at",  t:"TIMESTAMP",    k:"",   d:"" },
  ]},

  // ── CORE HEALTHCARE ───────────────────────────────────────────
  { id:"Specialty", domain:"healthcare", x:980, y:20, fields:[
    { n:"specialty_id", t:"INT",          k:"PK", d:"Primary Key" },
    { n:"name",         t:"VARCHAR(100)", k:"",   d:"UNIQUE NOT NULL" },
    { n:"description",  t:"TEXT",         k:"",   d:"" },
    { n:"created_at",   t:"TIMESTAMP",    k:"",   d:"" },
  ]},
  { id:"Patient", domain:"healthcare", x:980, y:196, fields:[
    { n:"patient_id",               t:"INT",          k:"PK", d:"Primary Key" },
    { n:"user_id",                  t:"INT",          k:"FK", d:"→ User.user_id (1:1)" },
    { n:"blood_type",               t:"VARCHAR(5)",   k:"",   d:"A+/A-/B+/B-/O+/O-/AB+/AB-" },
    { n:"allergies",                t:"TEXT",         k:"",   d:"" },
    { n:"chronic_conditions",       t:"TEXT",         k:"",   d:"" },
    { n:"address",                  t:"TEXT",         k:"",   d:"" },
    { n:"city",                     t:"VARCHAR(100)", k:"",   d:"" },
    { n:"country",                  t:"VARCHAR(100)", k:"",   d:"" },
    { n:"insurance_provider",       t:"VARCHAR(100)", k:"",   d:"" },
    { n:"insurance_id",             t:"VARCHAR(100)", k:"",   d:"" },
    { n:"emergency_contact_name",   t:"VARCHAR(100)", k:"",   d:"" },
    { n:"emergency_contact_phone",  t:"VARCHAR(20)",  k:"",   d:"" },
    { n:"created_at",               t:"TIMESTAMP",    k:"",   d:"" },
    { n:"updated_at",               t:"TIMESTAMP",    k:"",   d:"" },
    { n:"created_by",               t:"INT",          k:"FK", d:"→ User.user_id" },
  ]},
  { id:"Doctor", domain:"healthcare", x:1300, y:20, fields:[
    { n:"doctor_id",                  t:"INT",          k:"PK", d:"Primary Key" },
    { n:"user_id",                    t:"INT",          k:"FK", d:"→ User.user_id (1:1)" },
    { n:"specialty_id",               t:"INT",          k:"FK", d:"→ Specialty.specialty_id" },
    { n:"medical_title",              t:"VARCHAR(50)",  k:"",   d:"MD / PhD / MBBS / DO" },
    { n:"sub_specialty",              t:"VARCHAR(100)", k:"",   d:"" },
    { n:"years_experience",           t:"INT",          k:"",   d:"" },
    { n:"license_number",             t:"VARCHAR(100)", k:"",   d:"UNIQUE NOT NULL" },
    { n:"board_certifications",       t:"TEXT",         k:"",   d:"" },
    { n:"medical_school",             t:"VARCHAR(150)", k:"",   d:"" },
    { n:"graduation_year",            t:"YEAR",         k:"",   d:"" },
    { n:"hospital_affiliation",       t:"VARCHAR(150)", k:"",   d:"" },
    { n:"clinic_name",                t:"VARCHAR(150)", k:"",   d:"" },
    { n:"consultation_fee",           t:"DECIMAL(10,2)",k:"",   d:"" },
    { n:"consultation_duration_min",  t:"INT",          k:"",   d:"DEFAULT 30" },
    { n:"is_online_available",        t:"BOOLEAN",      k:"",   d:"DEFAULT FALSE" },
    { n:"avg_rating",                 t:"DECIMAL(2,1)", k:"",   d:"DEFAULT 0.0" },
    { n:"availability_status",        t:"ENUM",         k:"",   d:"Available/Busy/Off-duty" },
    { n:"is_approved",                t:"BOOLEAN",      k:"",   d:"DEFAULT FALSE" },
    { n:"created_at",                 t:"TIMESTAMP",    k:"",   d:"" },
    { n:"created_by",                 t:"INT",          k:"FK", d:"→ User.user_id" },
  ]},
  { id:"DoctorProfileVisibility", domain:"healthcare", x:1300, y:572, fields:[
    { n:"visibility_id", t:"INT",       k:"PK", d:"Admin toggle per doctor" },
    { n:"doctor_id",     t:"INT",       k:"FK", d:"→ Doctor.doctor_id (1:1)" },
    { n:"is_visible",    t:"BOOLEAN",   k:"",   d:"FALSE = hidden from patients" },
    { n:"toggled_by",    t:"INT",       k:"FK", d:"→ User.user_id (Admin only)" },
    { n:"reason",        t:"TEXT",      k:"",   d:"Required audit reason" },
    { n:"created_at",    t:"TIMESTAMP", k:"",   d:"" },
    { n:"updated_at",    t:"TIMESTAMP", k:"",   d:"" },
  ]},
  { id:"Document", domain:"healthcare", x:1300, y:810, fields:[
    { n:"document_id",      t:"INT",          k:"PK", d:"Primary Key" },
    { n:"patient_id",       t:"INT",          k:"FK", d:"→ Patient.patient_id" },
    { n:"prescription_id",  t:"INT",          k:"FK", d:"→ Prescription (nullable)" },
    { n:"record_id",        t:"INT",          k:"FK", d:"→ MedicalRecord (nullable)" },
    { n:"uploaded_by",      t:"INT",          k:"FK", d:"→ User.user_id" },
    { n:"file_name",        t:"VARCHAR(255)", k:"",   d:"NOT NULL" },
    { n:"file_url",         t:"VARCHAR(500)", k:"",   d:"NOT NULL" },
    { n:"file_type",        t:"VARCHAR(50)",  k:"",   d:"pdf/jpg/png/dicom" },
    { n:"file_size_kb",     t:"INT",          k:"",   d:"" },
    { n:"created_at",       t:"TIMESTAMP",    k:"",   d:"" },
  ]},

  // ── SCHEDULING ────────────────────────────────────────────────
  { id:"Slot", domain:"scheduling", x:1620, y:20, fields:[
    { n:"slot_id",      t:"INT",       k:"PK", d:"Primary Key" },
    { n:"doctor_id",    t:"INT",       k:"FK", d:"→ Doctor.doctor_id" },
    { n:"slot_date",    t:"DATE",      k:"",   d:"NOT NULL" },
    { n:"start_time",   t:"TIME",      k:"",   d:"NOT NULL" },
    { n:"end_time",     t:"TIME",      k:"",   d:"NOT NULL" },
    { n:"is_booked",    t:"BOOLEAN",   k:"",   d:"DEFAULT FALSE" },
    { n:"is_available", t:"BOOLEAN",   k:"",   d:"FALSE = blocked by doctor" },
    { n:"created_at",   t:"TIMESTAMP", k:"",   d:"" },
    { n:"updated_at",   t:"TIMESTAMP", k:"",   d:"" },
  ]},
  { id:"Appointment", domain:"scheduling", x:1620, y:310, fields:[
    { n:"appointment_id",   t:"INT",        k:"PK", d:"Primary Key" },
    { n:"patient_id",       t:"INT",        k:"FK", d:"→ Patient.patient_id" },
    { n:"doctor_id",        t:"INT",        k:"FK", d:"→ Doctor.doctor_id" },
    { n:"slot_id",          t:"INT",        k:"FK", d:"→ Slot.slot_id (1:1)" },
    { n:"type",             t:"ENUM",       k:"",   d:"in-person / online" },
    { n:"reason",           t:"TEXT",       k:"",   d:"" },
    { n:"status",           t:"ENUM",       k:"",   d:"pending/confirmed/done/cancelled" },
    { n:"notes",            t:"TEXT",       k:"",   d:"" },
    { n:"follow_up_date",   t:"DATE",       k:"",   d:"" },
    { n:"created_at",       t:"TIMESTAMP",  k:"",   d:"" },
    { n:"updated_at",       t:"TIMESTAMP",  k:"",   d:"" },
    { n:"created_by",       t:"INT",        k:"FK", d:"→ User.user_id" },
  ]},

  // ── CLINICAL ──────────────────────────────────────────────────
  { id:"MedicalRecord", domain:"clinical", x:980, y:704, fields:[
    { n:"record_id",      t:"INT",       k:"PK", d:"Primary Key" },
    { n:"appointment_id", t:"INT",       k:"FK", d:"→ Appointment (1:1)" },
    { n:"patient_id",     t:"INT",       k:"FK", d:"→ Patient.patient_id" },
    { n:"doctor_id",      t:"INT",       k:"FK", d:"→ Doctor.doctor_id" },
    { n:"diagnosis",      t:"TEXT",      k:"",   d:"" },
    { n:"symptoms",       t:"TEXT",      k:"",   d:"" },
    { n:"treatment_plan", t:"TEXT",      k:"",   d:"" },
    { n:"lab_results",    t:"TEXT",      k:"",   d:"" },
    { n:"visit_date",     t:"DATE",      k:"",   d:"NOT NULL" },
    { n:"follow_up_date", t:"DATE",      k:"",   d:"" },
    { n:"notes",          t:"TEXT",      k:"",   d:"" },
    { n:"created_at",     t:"TIMESTAMP", k:"",   d:"" },
    { n:"updated_at",     t:"TIMESTAMP", k:"",   d:"" },
    { n:"created_by",     t:"INT",       k:"FK", d:"→ User.user_id" },
  ]},
  { id:"Prescription", domain:"clinical", x:1620, y:700, fields:[
    { n:"prescription_id", t:"INT",          k:"PK", d:"Primary Key" },
    { n:"appointment_id",  t:"INT",          k:"FK", d:"→ Appointment.appointment_id" },
    { n:"patient_id",      t:"INT",          k:"FK", d:"→ Patient.patient_id" },
    { n:"doctor_id",       t:"INT",          k:"FK", d:"→ Doctor.doctor_id" },
    { n:"pharmacy_id",     t:"INT",          k:"FK", d:"→ Pharmacy.pharmacy_id" },
    { n:"drug_name",       t:"VARCHAR(150)", k:"",   d:"NOT NULL" },
    { n:"dosage",          t:"VARCHAR(100)", k:"",   d:"" },
    { n:"frequency",       t:"VARCHAR(100)", k:"",   d:"e.g. twice daily" },
    { n:"duration",        t:"VARCHAR(100)", k:"",   d:"e.g. 7 days" },
    { n:"quantity",        t:"INT",          k:"",   d:"" },
    { n:"refills_allowed", t:"INT",          k:"",   d:"DEFAULT 0" },
    { n:"refills_used",    t:"INT",          k:"",   d:"DEFAULT 0" },
    { n:"status",          t:"ENUM",         k:"",   d:"pending/dispensed/expired" },
    { n:"issue_date",      t:"DATE",         k:"",   d:"" },
    { n:"expiry_date",     t:"DATE",         k:"",   d:"" },
    { n:"created_at",      t:"TIMESTAMP",    k:"",   d:"" },
    { n:"updated_at",      t:"TIMESTAMP",    k:"",   d:"" },
    { n:"created_by",      t:"INT",          k:"FK", d:"→ User.user_id" },
  ]},

  // ── BILLING ───────────────────────────────────────────────────
  { id:"Pharmacy", domain:"billing", x:660, y:376, fields:[
    { n:"pharmacy_id",    t:"INT",          k:"PK", d:"Primary Key" },
    { n:"user_id",        t:"INT",          k:"FK", d:"→ User.user_id (1:1)" },
    { n:"pharmacy_name",  t:"VARCHAR(150)", k:"",   d:"NOT NULL" },
    { n:"license_number", t:"VARCHAR(100)", k:"",   d:"UNIQUE NOT NULL" },
    { n:"address",        t:"TEXT",         k:"",   d:"" },
    { n:"city",           t:"VARCHAR(100)", k:"",   d:"" },
    { n:"phone",          t:"VARCHAR(20)",  k:"",   d:"" },
    { n:"operating_hours",t:"VARCHAR(100)", k:"",   d:"" },
    { n:"is_active",      t:"BOOLEAN",      k:"",   d:"DEFAULT TRUE" },
    { n:"is_approved",    t:"BOOLEAN",      k:"",   d:"DEFAULT FALSE" },
    { n:"created_at",     t:"TIMESTAMP",    k:"",   d:"" },
    { n:"updated_at",     t:"TIMESTAMP",    k:"",   d:"" },
  ]},
  { id:"Payment", domain:"billing", x:660, y:716, fields:[
    { n:"payment_id",       t:"INT",           k:"PK", d:"Primary Key" },
    { n:"appointment_id",   t:"INT",           k:"FK", d:"→ Appointment (1:1)" },
    { n:"patient_id",       t:"INT",           k:"FK", d:"→ Patient.patient_id" },
    { n:"amount",           t:"DECIMAL(10,2)", k:"",   d:"NOT NULL" },
    { n:"currency",         t:"VARCHAR(10)",   k:"",   d:"DEFAULT USD" },
    { n:"method",           t:"ENUM",          k:"",   d:"card/cash/insurance/wallet" },
    { n:"status",           t:"ENUM",          k:"",   d:"pending/paid/failed/refunded" },
    { n:"transaction_id",   t:"VARCHAR(255)",  k:"",   d:"UNIQUE" },
    { n:"insurance_claim",  t:"BOOLEAN",       k:"",   d:"DEFAULT FALSE" },
    { n:"insurance_amount", t:"DECIMAL(10,2)", k:"",   d:"" },
    { n:"patient_amount",   t:"DECIMAL(10,2)", k:"",   d:"" },
    { n:"paid_at",          t:"TIMESTAMP",     k:"",   d:"" },
    { n:"created_at",       t:"TIMESTAMP",     k:"",   d:"" },
  ]},

  // ── SYSTEM ────────────────────────────────────────────────────
  { id:"Notification", domain:"system", x:20, y:714, fields:[
    { n:"notification_id", t:"INT",          k:"PK", d:"Primary Key" },
    { n:"user_id",         t:"INT",          k:"FK", d:"→ User.user_id" },
    { n:"type",            t:"VARCHAR(50)",  k:"",   d:"appointment/message/payment/system" },
    { n:"title",           t:"VARCHAR(150)", k:"",   d:"" },
    { n:"body",            t:"TEXT",         k:"",   d:"" },
    { n:"reference_id",    t:"INT",          k:"",   d:"Related record ID" },
    { n:"reference_type",  t:"VARCHAR(50)",  k:"",   d:"appointment/prescription/..." },
    { n:"channel",         t:"ENUM",         k:"",   d:"push/email/sms/in-app" },
    { n:"is_read",         t:"BOOLEAN",      k:"",   d:"DEFAULT FALSE" },
    { n:"sent_at",         t:"TIMESTAMP",    k:"",   d:"" },
    { n:"read_at",         t:"TIMESTAMP",    k:"",   d:"" },
  ]},
];

const CONNECTIONS = [
  // Auth
  { from:"Role", to:"UserRole", label:"1:N" },
  { from:"User", to:"UserRole", label:"1:N" },
  { from:"Role", to:"RolePermission", label:"1:N" },
  { from:"Permission", to:"RolePermission", label:"1:N" },
  { from:"Role", to:"FeatureToggle", label:"1:N" },
  { from:"User", to:"FeatureToggle", label:"1:N" },
  // User → entities
  { from:"User", to:"Patient", label:"1:1" },
  { from:"User", to:"Doctor", label:"1:1" },
  { from:"User", to:"Pharmacy", label:"1:1" },
  { from:"User", to:"Notification", label:"1:N" },
  // Healthcare
  { from:"Specialty", to:"Doctor", label:"1:N" },
  { from:"Doctor", to:"DoctorProfileVisibility", label:"1:1" },
  // Scheduling
  { from:"Doctor", to:"Slot", label:"1:N" },
  { from:"Patient", to:"Appointment", label:"1:N" },
  { from:"Doctor", to:"Appointment", label:"1:N" },
  { from:"Slot", to:"Appointment", label:"1:1" },
  // Clinical
  { from:"Appointment", to:"MedicalRecord", label:"1:1" },
  { from:"Appointment", to:"Prescription", label:"1:N" },
  { from:"Appointment", to:"Payment", label:"1:1" },
  { from:"Patient", to:"MedicalRecord", label:"1:N" },
  { from:"Doctor", to:"MedicalRecord", label:"1:N" },
  { from:"Patient", to:"Prescription", label:"1:N" },
  { from:"Doctor", to:"Prescription", label:"1:N" },
  { from:"Pharmacy", to:"Prescription", label:"1:N" },
  // Documents
  { from:"Patient", to:"Document", label:"1:N" },
  { from:"Prescription", to:"Document", label:"1:N" },
  { from:"MedicalRecord", to:"Document", label:"1:N" },
  // Billing
  { from:"Patient", to:"Payment", label:"1:N" },
];

// Domain bounding boxes (for background zones)
const ZONES = [
  { domain:"auth",       x:10,  y:10,  w:940,  h:700, label:"Auth & Access Control" },
  { domain:"billing",    x:640, y:356, w:330,  h:700, label:"Billing" },
  { domain:"healthcare", x:960, y:10,  w:660,  h:1130, label:"Core Healthcare" },
  { domain:"scheduling", x:1600,y:10,  w:330,  h:700, label:"Scheduling" },
  { domain:"clinical",   x:960, y:680, w:680,  h:590, label:"Clinical" },
  { domain:"system",     x:10,  y:694, w:310,  h:400, label:"System" },
];

const tableMap = Object.fromEntries(TABLES.map(t => [t.id, t]));

function getEdges(t) {
  const h = getH(t.fields);
  return {
    cx: t.x + TW / 2, cy: t.y + h / 2,
    right:  { x: t.x + TW,     y: t.y + h / 2 },
    left:   { x: t.x,          y: t.y + h / 2 },
    top:    { x: t.x + TW / 2, y: t.y },
    bottom: { x: t.x + TW / 2, y: t.y + h },
  };
}

function makePath(from, to) {
  const fe = getEdges(from), te = getEdges(to);
  const dx = te.cx - fe.cx, dy = te.cy - fe.cy;
  let p1, p2, cp1, cp2;
  if (Math.abs(dx) >= Math.abs(dy)) {
    if (dx >= 0) { p1 = fe.right; p2 = te.left; }
    else         { p1 = fe.left;  p2 = te.right; }
    const cx = (p1.x + p2.x) / 2;
    cp1 = { x: cx, y: p1.y }; cp2 = { x: cx, y: p2.y };
  } else {
    if (dy >= 0) { p1 = fe.bottom; p2 = te.top; }
    else         { p1 = fe.top;    p2 = te.bottom; }
    const cy = (p1.y + p2.y) / 2;
    cp1 = { x: p1.x, y: cy }; cp2 = { x: p2.x, y: cy };
  }
  return {
    d: `M ${p1.x} ${p1.y} C ${cp1.x} ${cp1.y} ${cp2.x} ${cp2.y} ${p2.x} ${p2.y}`,
    midX: (p1.x + p2.x) / 2,
    midY: (p1.y + p2.y) / 2,
    p2,
  };
}

function TableCard({ table, selected, highlighted, dimmed, onClick }) {
  const h = getH(table.fields + 200);
  const dc = DOMAIN[table.domain].color;
  const isActive = selected === table.id;
  const opacity = dimmed ? 0.25 : 1;

  return (
    <div
      data-table="true"
      onClick={() => onClick(table.id)}
      style={{
        position: "absolute", left: table.x, top: table.y,
        width: TW, height: h,
        background: "#0D1525",
        border: `1.5px solid ${isActive ? dc : highlighted ? dc+"99" : "#1E2D45"}`,
        borderRadius: 6,
        boxShadow: isActive ? `0 0 0 2px ${dc}55, 0 4px 24px #00000088` : "0 2px 12px #00000066",
        cursor: "pointer",
        overflow: "hidden",
        transition: "opacity 0.2s, border-color 0.2s, box-shadow 0.2s",
        opacity,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
        marginBottom: "10px",
      }}
    >
      {/* Header */}
      <div style={{
        background: dc,
        height: HH,
        display: "flex", alignItems: "center",
        padding: "0 10px",
        gap: 12,
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.05em", flex: 1 }}>
          {table.id}
        </span>
        <span style={{
          fontSize: 9, background: "#00000033", color: "#ffffffcc",
          borderRadius: 3, padding: "1px 5px", fontWeight: 500,
        }}>
          {DOMAIN[table.domain].label.split(" ").slice(1).join(" ")}
        </span>
      </div>
      {/* Column headers */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 90px 32px",
        padding: "3px 8px 2px",
        borderBottom: "1px solid #1E2D45",
      }}>
        {["field","type","key"].map(h => (
          <span key={h} style={{ fontSize: 8.5, color: "#475569", fontWeight: 600, letterSpacing:"0.08em", textTransform:"uppercase" }}>{h}</span>
        ))}
      </div>
      {/* Rows */}
      {table.fields.map((f, i) => (
        <div key={f.n} style={{
          display: "grid", gridTemplateColumns: "1fr 90px 32px",
          padding: "0 8px",
          height: RH,
          alignItems: "center",
          background: i % 2 === 0 ? "#0A111E" : "#0D1525",
          borderBottom: "1px solid #111827",
        }}>
          <span style={{
            fontSize: 10, fontWeight: f.k ? 600 : 400,
            color: f.k === "PK" ? "#FBBF24" : f.k === "FK" ? "#38BDF8" : "#94A3B8",
            overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
          }}>{f.n}</span>
          <span style={{
            fontSize: 9, color: "#4B6080",
            overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
          }}>{f.t}</span>
          {f.k ? (
            <span style={{
              fontSize: 8, fontWeight: 700,
              color: f.k === "PK" ? "#FBBF24" : "#38BDF8",
              background: f.k === "PK" ? "#78350F44" : "#0C4A6E44",
              borderRadius: 3, padding: "1px 4px",
              textAlign: "center", letterSpacing: "0.04em",
            }}>{f.k}</span>
          ) : <span />}
        </div>
      ))}
    </div>
  );
}

export default function HealthcareERD() {
  const [zoom, setZoom] = useState(0.6);
  const [pan, setPan] = useState({ x: 20, y: 20 });
  const [selected, setSelected] = useState(null);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const canvasW = 1980, canvasH = 1390;

  // Google Fonts
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const onDown = useCallback((e) => {
    if (e.target.closest("[data-table]")) return;
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
  }, []);
  const onMove = useCallback((e) => {
    if (!dragging.current) return;
    setPan(p => ({ x: p.x + e.clientX - last.current.x, y: p.y + e.clientY - last.current.y }));
    last.current = { x: e.clientX, y: e.clientY };
  }, []);
  const onUp = useCallback(() => { dragging.current = false; }, []);

  const handleClick = useCallback((id) => {
    setSelected(s => s === id ? null : id);
  }, []);

  // Compute which tables are highlighted/dimmed
  const relatedTables = selected
    ? new Set(CONNECTIONS.filter(c => c.from === selected || c.to === selected).flatMap(c => [c.from, c.to]))
    : null;

  const relatedConns = selected
    ? new Set(CONNECTIONS.filter(c => c.from === selected || c.to === selected).map((_, i) => i))
    : null;

  return (
    <div
      style={{ width:"100vw", height:"100vh", overflow:"hidden", background:"#060C18",
        userSelect:"none", cursor: dragging.current ? "grabbing" : "grab",
        fontFamily:"'JetBrains Mono', monospace",
      }}
      onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
    >
      {/* Header */}
      <div style={{
        position:"fixed", top:0, left:0, right:0, zIndex:100,
        background:"#060C1899", backdropFilter:"blur(12px)",
        borderBottom:"1px solid #1E2D45",
        padding:"0 20px", height:52,
        display:"flex", alignItems:"center", gap:16,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:"#10B981", boxShadow:"0 0 8px #10B981" }}/>
          <span style={{ color:"#E2E8F0", fontSize:13, fontWeight:700, letterSpacing:"0.06em" }}>
            HEALTHCARE ERD
          </span>
          <span style={{ color:"#334155", fontSize:12 }}>·</span>
          <span style={{ color:"#475569", fontSize:11 }}>Production Schema · {TABLES.length} tables · {CONNECTIONS.length} relations</span>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:8, alignItems:"center" }}>
          {/* Domain legend */}
          {Object.entries(DOMAIN).map(([k, v]) => (
            <div key={k} style={{ display:"flex", alignItems:"center", gap:4 }}>
              <div style={{ width:8, height:8, borderRadius:2, background:v.color }}/>
              <span style={{ color:"#64748B", fontSize:9, letterSpacing:"0.05em" }}>{k.toUpperCase()}</span>
            </div>
          ))}
          <div style={{ width:1, height:20, background:"#1E2D45", margin:"0 4px" }}/>
          {/* Key legend */}
          {[["PK","#FBBF24","#78350F44"],["FK","#38BDF8","#0C4A6E44"]].map(([k,c,bg]) => (
            <span key={k} style={{ fontSize:9, fontWeight:700, color:c, background:bg,
              borderRadius:3, padding:"2px 6px", letterSpacing:"0.04em" }}>{k}</span>
          ))}
          <div style={{ width:1, height:20, background:"#1E2D45", margin:"0 4px" }}/>
          {/* Zoom */}
          {[["−", -0.1],["reset", null],["+", 0.1]].map(([label, delta]) => (
            <button key={label} onClick={() => setZoom(z => delta === null ? 0.6 : Math.min(1.6, Math.max(0.3, z + delta)))}
              style={{
                background:"#0D1525", border:"1px solid #1E2D45", color:"#94A3B8",
                borderRadius:4, padding:"4px 10px", fontSize:11, cursor:"pointer",
                fontFamily:"inherit",
              }}>{label}</button>
          ))}
          <span style={{ color:"#334155", fontSize:11, minWidth:36, textAlign:"right" }}>
            {Math.round(zoom * 100)}%
          </span>
          {selected && (
            <button onClick={() => setSelected(null)}
              style={{ background:"#EF444422", border:"1px solid #EF444444", color:"#EF4444",
                borderRadius:4, padding:"4px 10px", fontSize:11, cursor:"pointer", fontFamily:"inherit" }}>
              ✕ clear
            </button>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div style={{ position:"absolute", top:52, left:0, right:0, bottom:0, overflow:"hidden" }}>
        <div style={{
          position:"absolute",
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin:"0 0",
          width: canvasW, height: canvasH,
        }}>
          {/* Domain zones */}
          <svg style={{ position:"absolute", top:0, left:0, width:canvasW, height:canvasH, pointerEvents:"none" }}>
            {ZONES.map(z => (
              <g key={z.domain}>
                <rect x={z.x} y={z.y} width={z.w} height={z.h}
                  rx={10} fill={DOMAIN[z.domain].dim} stroke={DOMAIN[z.domain].color}
                  strokeWidth={1} strokeDasharray="4 4" strokeOpacity={0.4}/>
                <text x={z.x + 12} y={z.y + 18}
                  fill={DOMAIN[z.domain].color} fontSize={10} fontWeight={700}
                  fontFamily="'JetBrains Mono',monospace" opacity={0.7} letterSpacing="0.08em">
                  {DOMAIN[z.domain].label.toUpperCase()}
                </text>
              </g>
            ))}

            {/* Connectors */}
            {CONNECTIONS.map((conn, i) => {
              const ft = tableMap[conn.from], tt = tableMap[conn.to];
              if (!ft || !tt) return null;
              const { d, midX, midY, p2 } = makePath(ft, tt);
              const isActive = selected && (conn.from === selected || conn.to === selected);
              const color = isActive ? DOMAIN[ft.domain].color : "#1E3A5F";
              const opacity = selected ? (isActive ? 1 : 0.1) : 0.55;
              return (
                <g key={i} opacity={opacity} style={{ transition:"opacity 0.2s" }}>
                  <path d={d} fill="none" stroke={color} strokeWidth={isActive ? 1.5 : 1}/>
                  {/* Arrow at target */}
                  <circle cx={p2.x} cy={p2.y} r={3} fill={color}/>
                  {/* Label */}
                  <rect x={midX - 12} y={midY - 8} width={24} height={14} rx={3}
                    fill="#060C18" stroke={color} strokeWidth={0.5} opacity={0.9}/>
                  <text x={midX} y={midY + 3.5} textAnchor="middle"
                    fill={color} fontSize={8} fontWeight={700}
                    fontFamily="'JetBrains Mono',monospace">{conn.label}</text>
                </g>
              );
            })}
          </svg>

          {/* Tables */}
          <div className="m-20">
            {TABLES.map(t => (
            <TableCard
              key={t.id}
              table={t}
              selected={selected}
              highlighted={relatedTables ? relatedTables.has(t.id) : false}
              dimmed={selected && !relatedTables.has(t.id) && selected !== t.id}
              onClick={handleClick}
            />
          ))}
          </div>
        </div>
      </div>

      {/* Selected info panel */}
      {selected && (
        <div style={{
          position:"fixed", bottom:16, right:16, zIndex:200,
          background:"#0D1525ee", backdropFilter:"blur(12px)",
          border:`1px solid ${DOMAIN[tableMap[selected]?.domain]?.color}55`,
          borderRadius:8, padding:"12px 16px", minWidth:220,
        }}>
          <div style={{ color:DOMAIN[tableMap[selected]?.domain]?.color, fontSize:11,
            fontWeight:700, marginBottom:6, fontFamily:"'JetBrains Mono',monospace",
            letterSpacing:"0.06em" }}>
            {selected}
          </div>
          <div style={{ color:"#475569", fontSize:10, fontFamily:"'JetBrains Mono',monospace" }}>
            {tableMap[selected]?.fields.length} fields ·{" "}
            {CONNECTIONS.filter(c => c.from===selected||c.to===selected).length} relationships
          </div>
          <div style={{ marginTop:8, display:"flex", flexDirection:"column", gap:3 }}>
            {CONNECTIONS.filter(c=>c.from===selected||c.to===selected).map((c,i)=>(
              <div key={i} style={{ fontSize:9, color:"#334155", fontFamily:"'JetBrains Mono',monospace" }}>
                <span style={{ color: c.from===selected?"#38BDF8":"#A855F7" }}>
                  {c.from===selected?"→":"←"}
                </span>{" "}
                <span style={{ color:"#64748B" }}>{c.from===selected?c.to:c.from}</span>{" "}
                <span style={{ color:"#1E3A5F" }}>({c.label})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hint */}
      <div style={{
        position:"fixed", bottom:16, left:16, zIndex:200,
        color:"#1E3A5F", fontSize:10, fontFamily:"'JetBrains Mono',monospace",
      }}>
        drag to pan · scroll buttons to zoom · click table to highlight relations
      </div>
    </div>
  );
}