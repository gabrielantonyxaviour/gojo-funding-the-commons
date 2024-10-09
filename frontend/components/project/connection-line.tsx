import React from "react";
import { getSmoothStepPath, getStraightPath } from "@xyflow/react";

function CustomConnectionLine({
  fromX,
  fromY,
  toX,
  toY,
  connectionLineStyle,
}: any) {
  const [edgePath] = getSmoothStepPath({
    sourceX: fromX,
    sourceY: fromY,
    targetX: toX,
    targetY: toY,
  });

  return (
    <g>
      <path
        className="stroke-1 stroke-black dark:stroke-white"
        fill="none"
        d={edgePath}
      />
      <circle
        cx={toX}
        cy={toY}
        r={3}
        strokeWidth={1.5}
        className="fill-secondary stroke-secondary"
      />
    </g>
  );
}

export default CustomConnectionLine;
