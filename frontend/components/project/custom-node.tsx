import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Card, CardContent } from "@/components/ui/card";

function CustomNode({ data }: { data: any }) {
  return (
    <Card>
      <CardContent className="w-[200px] h-[200px]">
        <p>Hello</p>
      </CardContent>
      <Handle
        type="target"
        position={Position.Top}
        className="w-16 bg-secondary"
      />
      <div
        style={{
          display: "flex",
          position: "absolute",
          bottom: 0,
          width: "100%",
          justifyContent: "space-evenly",
          left: 0,
        }}
      >
        <Handle
          style={{ position: "relative", left: 0, transform: "none" }}
          id="a"
          type="source"
          position={Position.Bottom}
        />
        <Handle
          style={{ position: "relative", left: 0, transform: "none" }}
          id="b"
          type="source"
          position={Position.Bottom}
        />
      </div>
      {/* <Handle
        type="source"
        position={Position.Left}
        className="h-16 bg-secondary"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="h-16 bg-secondary"
      /> */}
    </Card>
  );
}

export default memo(CustomNode);
