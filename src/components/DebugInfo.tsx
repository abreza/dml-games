import React from "react";

interface DebugInfoProps {
  tg: any;
  user: any;
  gameParams: any;
}

export const DebugInfo: React.FC<DebugInfoProps> = ({
  tg,
  user,
  gameParams,
}) => {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-100 p-2 text-xs z-50 max-h-32 overflow-auto">
      <div>
        <strong>Debug Info:</strong>
      </div>
      <div>
        initData:{" "}
        {tg?.initData ? `Present (${tg.initData.length} chars)` : "Missing"}
      </div>
      <div>initDataUnsafe: {JSON.stringify(tg?.initDataUnsafe || {})}</div>
      <div>URL Params: {JSON.stringify(gameParams)}</div>
      <div>User: {JSON.stringify(user)}</div>
      <div>Platform: {tg?.platform}</div>
      <div>Version: {tg?.version}</div>
    </div>
  );
};
