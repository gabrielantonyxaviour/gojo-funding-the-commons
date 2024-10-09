import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { Card, CardContent } from "@/components/ui/card";

function CustomNode({ data }: { data: any }) {
  return (
    <Card className="border-[2px] border-secondary">
      <CardContent className="w-[200px] h-[200px] relative">
        <p>Hello</p>
        <Handle
          type="target"
          position={Position.Top}
          // className="w-full h-full absolute top-0 left-0 transform-none rounded-none opacity-0"
        />
      </CardContent>

      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
}

export default memo(CustomNode);
