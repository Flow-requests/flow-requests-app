import { memo } from "react";
import { Handle, Position } from "reactflow";
import { Play } from "lucide-react";

export const StartNode = memo(({ data, isConnectable }) => {
  return (
    <div className="rounded-md border bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <Play className="h-5 w-5 text-blue-500" />
        <div className="font-medium">{data.label}</div>
      </div>
      <div className="text-xs font-medium text-muted-foreground">
        {data.name || "Unnamed Step"}
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        {data.url ? data.url : "Start workflow..."}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="!bg-blue-500"
      />
    </div>
  );
});

StartNode.displayName = "StartNode";
