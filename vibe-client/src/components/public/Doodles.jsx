import React from "react";

// Hand-drawn curved underline for highlighted hero words
export const HandUnderline = ({ color = "#7540F5", className = "" }) => (
  <svg
    className={`w-full h-3 md:h-4 overflow-visible ${className}`}
    viewBox="0 0 200 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3 11C45 4 155 3 197 9C165 14 60 15 15 13"
      stroke={color}
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Yellow/orange 3-ray spark
export const SparkDoodle = ({ color = "#FBBF24", className = "", size = 28 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    className={`inline-block ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16 4V10" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <path d="M7 11L12 15" stroke={color} strokeWidth="3" strokeLinecap="round" />
    <path d="M25 11L20 15" stroke={color} strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// Pink / Purple loop doodle
export const LoopDoodle = ({ color = "#F472B6", className = "", size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 36 36"
    fill="none"
    className={`inline-block ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M8 28C8 18 18 10 24 16C30 22 18 30 14 20C10 10 24 6 30 10"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Purple spiral doodle
export const SpiralDoodle = ({ color = "#7540F5", className = "", size = 28 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    className={`inline-block ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16 16C13 16 12 14 12 12C12 9 15 8 18 9C22 10 23 15 21 19C19 23 13 24 9 21C5 18 5 10 9 6"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

// 4-point star sparkle
export const StarDoodle = ({ color = "#38BDF8", className = "", size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    className={`inline-block ${className}`}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12 0L14 9L23 12L14 15L12 24L10 15L1 12L10 9L12 0Z" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// PureConnector – Clean, non-overlapping dashed connector
//
// Perfectly bridges the whitespace between consecutive storytelling sections:
// - Starts at the bottom edge of the previous section's content (y = 0)
// - Ends at the top edge of the next section's circular icon badge (y = 100)
// - Lives entirely in the gap between sections (NO negative margins over content)
// - Never crosses cards, photos, text, or buttons
// ─────────────────────────────────────────────────────────────────────────────
export const PureConnector = ({
  variant = "center-wave", // "right-arc", "left-arc", "center-wave"
  className = "",
}) => {
  // viewBox: "0 0 400 120"
  // y=0: exact top of container (touching bottom edge of previous content)
  // y=120: exact bottom of container (touching top edge of next circular icon pill at x=200)

  let desktopPath = "M 200,0 C 200,40 200,80 200,120"; // default
  let mobilePath = "M 100,0 C 100,30 100,60 100,90";

  if (variant === "right-arc") {
    // Starts near right-of-center (x=240, under right card/content),
    // curves out slightly to the right in the whitespace (x=270),
    // then swoops smoothly back to center (x=200) at y=120 to meet the icon badge.
    desktopPath = "M 230,0 C 275,35 255,85 200,120";
    mobilePath = "M 115,0 C 135,25 125,65 100,90";
  } else if (variant === "left-arc") {
    // Starts near left-of-center (x=170, under left card/content),
    // curves out gently to the left in the whitespace (x=130),
    // then swoops smoothly back to center (x=200) at y=120 to meet the icon badge.
    desktopPath = "M 170,0 C 125,35 145,85 200,120";
    mobilePath = "M 85,0 C 65,25 75,65 100,90";
  } else if (variant === "center-wave") {
    // Starts at center (x=200), makes a graceful playful S-curve in the open whitespace,
    // and returns directly to center (x=200) at y=120 to meet the icon badge.
    desktopPath = "M 200,0 C 235,35 165,85 200,120";
    mobilePath = "M 100,0 C 115,25 85,65 100,90";
  }

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none relative z-0 w-full flex items-center justify-center my-2 sm:my-3 ${className}`}
    >
      {/* Desktop / Tablet Connector */}
      <svg
        className="hidden sm:block w-full max-w-md md:max-w-lg h-24 md:h-28 overflow-visible"
        viewBox="0 0 400 120"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d={desktopPath}
          stroke="#7540F5"
          strokeWidth="2.2"
          strokeDasharray="6 7"
          strokeOpacity="0.45"
          strokeLinecap="round"
        />
      </svg>

      {/* Mobile Streamlined Connector */}
      <svg
        className="block sm:hidden w-44 h-16 overflow-visible"
        viewBox="0 0 200 90"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d={mobilePath}
          stroke="#7540F5"
          strokeWidth="2"
          strokeDasharray="5 6"
          strokeOpacity="0.45"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

// Backward-compatible aliases
export const BridgeConnector = PureConnector;
export const WavyConnector = PureConnector;

