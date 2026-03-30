'use client';
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const handwriting = {
    fontFamily: "'Caveat', cursive",
    color: "#1a237e",
    fontSize: "17px",
    lineHeight: "1.5",
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div
        className="bg-gray-100 relative flex flex-col"
        style={{
          width: "640px",
          minHeight: "860px",
          fontFamily: "'Times New Roman', Times, serif",
          padding: "48px 56px 56px 56px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header Row: Rx logo + Patient/Address fields */}
        <div className="flex items-start gap-3 mb-2">
          {/* Rx Symbol */}
          <div
            className="flex-shrink-0 select-none"
            style={{
              fontSize: "110px",
              fontWeight: "900",
              lineHeight: 1,
              fontFamily: "'Times New Roman', Times, serif",
              marginTop: "-10px",
              letterSpacing: "-3px",
            }}
          >
            R
            <span
              style={{
                fontSize: "80px",
                verticalAlign: "sub",
                marginLeft: "-6px",
              }}
            >
              x
            </span>
          </div>

          {/* Patient + Address */}
          <div
            className="flex-1 flex flex-col gap-1"
            style={{ paddingTop: "4px" }}
          >
            {/* Patient row */}
            <div className="flex items-end gap-1">
              <span
                className="font-semibold whitespace-nowrap"
                style={{ fontSize: "14px" }}
              >
                Patient:
              </span>
              <div
                className="flex-1 relative"
                style={{ minWidth: "220px", height: "26px" }}
              >
                <span
                  style={{
                    ...handwriting,
                    fontSize: "19px",
                    fontWeight: "600",
                    position: "absolute",
                    bottom: "2px",
                    left: "6px",
                    whiteSpace: "nowrap",
                  }}
                >
                  James R. Whitfield
                </span>
                <div
                  style={{
                    borderBottom: "1px solid #555",
                    width: "100%",
                    position: "absolute",
                    bottom: 0,
                  }}
                />
              </div>
            </div>

            {/* 2nd line (age / extra info) */}
            <div
              className="relative"
              style={{ marginTop: "10px", height: "26px" }}
            >
              <span
                style={{
                  ...handwriting,
                  fontSize: "16px",
                  position: "absolute",
                  bottom: "2px",
                  left: "0px",
                }}
              >
                Age: 34 &nbsp;&nbsp; M
              </span>
              <div
                style={{
                  borderBottom: "1px solid #555",
                  width: "100%",
                  position: "absolute",
                  bottom: 0,
                }}
              />
            </div>

            {/* Address row */}
            <div className="flex items-end gap-1" style={{ marginTop: "10px" }}>
              <span
                className="font-semibold whitespace-nowrap"
                style={{ fontSize: "14px" }}
              >
                Address:
              </span>
              <div
                className="flex-1 relative"
                style={{ minWidth: "190px", height: "26px" }}
              >
                <span
                  style={{
                    ...handwriting,
                    fontSize: "17px",
                    position: "absolute",
                    bottom: "2px",
                    left: "6px",
                    whiteSpace: "nowrap",
                  }}
                >
                  47 Elmwood Ave, Brooklyn, NY
                </span>
                <div
                  style={{
                    borderBottom: "1px solid #555",
                    width: "100%",
                    position: "absolute",
                    bottom: 0,
                  }}
                />
              </div>
            </div>

            {/* Address line 2 */}
            <div
              className="relative"
              style={{ marginTop: "10px", height: "26px" }}
            >
              <span
                style={{
                  ...handwriting,
                  fontSize: "16px",
                  position: "absolute",
                  bottom: "2px",
                  left: "0px",
                }}
              >
                New York – 11201
              </span>
              <div
                style={{
                  borderBottom: "1px solid #555",
                  width: "100%",
                  position: "absolute",
                  bottom: 0,
                }}
              />
            </div>
          </div>
        </div>

        {/* Two full-width separator lines */}
        <div
          style={{
            borderBottom: "1px solid #555",
            width: "100%",
            marginTop: "20px",
          }}
        />
        <div
          style={{
            borderBottom: "1px solid #555",
            width: "100%",
            marginTop: "14px",
          }}
        />

        {/* Prescription Label */}
        <div className="mt-6 mb-4">
          <span
            className="font-bold"
            style={{
              fontSize: "16px",
              fontFamily: "'Times New Roman', Times, serif",
            }}
          >
            Prescription:
          </span>
        </div>

        {/* Prescription content — handwritten style */}
        <div className="flex flex-col gap-5" style={{ flex: 1 }}>
          {/* Rx 1 */}
          <div>
            <p
              style={{
                ...handwriting,
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "2px",
              }}
            >
              ① Tab. Amoxicillin 500mg
            </p>
            <p
              style={{
                ...handwriting,
                fontSize: "16px",
                marginLeft: "22px",
                color: "#283593",
              }}
            >
              1 tab — TDS × 7 days &nbsp;(after meals)
            </p>
          </div>

          {/* Rx 2 */}
          <div>
            <p
              style={{
                ...handwriting,
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "2px",
              }}
            >
              ② Tab. Paracetamol 650mg
            </p>
            <p
              style={{
                ...handwriting,
                fontSize: "16px",
                marginLeft: "22px",
                color: "#283593",
              }}
            >
              1 tab — SOS &nbsp;(if fever &gt; 101°F)
            </p>
          </div>

          {/* Rx 3 */}
          <div>
            <p
              style={{
                ...handwriting,
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "2px",
              }}
            >
              ③ Syp. Benadryl 10ml
            </p>
            <p
              style={{
                ...handwriting,
                fontSize: "16px",
                marginLeft: "22px",
                color: "#283593",
              }}
            >
              BD × 5 days &nbsp;(for dry cough)
            </p>
          </div>

          {/* Rx 4 */}
          <div>
            <p
              style={{
                ...handwriting,
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "2px",
              }}
            >
              ④ Tab. Vitamin C 1000mg
            </p>
            <p
              style={{
                ...handwriting,
                fontSize: "16px",
                marginLeft: "22px",
                color: "#283593",
              }}
            >
              OD × 14 days &nbsp;(after breakfast)
            </p>
          </div>

          {/* Advice note */}
          <div
            style={{
              marginTop: "8px",
              borderTop: "1px dashed #9e9e9e",
              paddingTop: "12px",
            }}
          >
            <p
              style={{
                ...handwriting,
                fontSize: "15px",
                color: "#37474f",
                fontStyle: "italic",
              }}
            >
              Advice: Plenty of fluids. Bed rest for 2 days. Review after 1
              week.
            </p>
          </div>
        </div>

        {/* Footer: Signature + Date */}
        <div className="flex items-end justify-between mt-8">
          <div className="flex items-end gap-2">
            <span
              style={{
                fontSize: "14px",
                fontFamily: "'Times New Roman', Times, serif",
                whiteSpace: "nowrap",
              }}
            >
              Signature:
            </span>
            <div
              className="relative"
              style={{ width: "200px", height: "28px" }}
            >
              <span
                style={{
                  ...handwriting,
                  fontSize: "20px",
                  fontWeight: "700",
                  position: "absolute",
                  bottom: "2px",
                  left: "4px",
                  color: "#0d1b6e",
                  fontStyle: "italic",
                  transform: "rotate(-3deg)",
                  display: "inline-block",
                }}
              >
                Dr. A. Mehta
              </span>
              <div
                style={{
                  borderBottom: "1px solid #555",
                  width: "100%",
                  position: "absolute",
                  bottom: 0,
                }}
              />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span
              style={{
                fontSize: "14px",
                fontFamily: "'Times New Roman', Times, serif",
                whiteSpace: "nowrap",
              }}
            >
              Date:
            </span>
            <div
              className="relative"
              style={{ width: "130px", height: "28px" }}
            >
              <span
                style={{
                  ...handwriting,
                  fontSize: "17px",
                  position: "absolute",
                  bottom: "2px",
                  left: "4px",
                  color: "#1a237e",
                }}
              >
                05 / 03 / 2026
              </span>
              <div
                style={{
                  borderBottom: "1px solid #555",
                  width: "100%",
                  position: "absolute",
                  bottom: 0,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
