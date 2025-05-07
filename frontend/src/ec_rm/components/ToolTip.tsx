import React from "react";

interface TooltipProps {
  visible: boolean;
  content: React.ReactNode;
  position: { x: number; y: number };
  onClose: () => void;
}

const Tooltip: React.FC<TooltipProps> = ({
  visible,
  content,
  position,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: position.y,
        left: position.x,
        backgroundColor: "#2A2A2A",
        color: "#fff",
        padding: "10px",
        borderRadius: "8px",
        zIndex: 9999,
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
        fontSize: "14px",
        minWidth: "200px",
      }}
    >
      {content}
      <button
        onClick={onClose}
        style={{
          background: "transparent",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          float: "right",
        }}
      >
        &times;
      </button>
    </div>
  );
};

export default Tooltip;
