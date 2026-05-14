"use client";
import React from "react";
import { useRouter } from "next/navigation";

interface VehicleSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VehicleSelectModal({ isOpen, onClose }: VehicleSelectModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleSelect = (type: "2" | "4") => {
    localStorage.setItem("lexdrive_vehicle_type", type);
    onClose();
    if (type === "4") {
      router.push("/car");
    } else {
      router.push("/drive");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.7)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in-up"
        style={{
          background: "#080c12",
          padding: "2.5rem 2rem",
          borderRadius: "24px",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
          width: "90%",
          maxWidth: "400px",
          textAlign: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ color: "#ffffff", marginBottom: "0.5rem", fontSize: "1.5rem", fontWeight: 800 }}>
          Select Vehicle Type
        </h2>
        <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "2rem", fontSize: "0.95rem" }}>
          Choose your vehicle to tailor LexDrive's speed alerts and compliance checks.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <button
            onClick={() => handleSelect("2")}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
              padding: "1.5rem 1rem",
              color: "#ffffff",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.75rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)";
              e.currentTarget.style.borderColor = "#3b82f6";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.transform = "none";
            }}
          >
            <span style={{ fontSize: "2.5rem" }}>🏍️</span>
            <span style={{ fontWeight: 700, fontSize: "1rem" }}>2-Wheeler</span>
          </button>

          <button
            onClick={() => handleSelect("4")}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "16px",
              padding: "1.5rem 1rem",
              color: "#ffffff",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.75rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)";
              e.currentTarget.style.borderColor = "#3b82f6";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.transform = "none";
            }}
          >
            <span style={{ fontSize: "2.5rem" }}>🚗</span>
            <span style={{ fontWeight: 700, fontSize: "1rem" }}>4-Wheeler</span>
          </button>
        </div>
      </div>
    </div>
  );
}
