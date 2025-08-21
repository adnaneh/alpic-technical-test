import dynamic from "next/dynamic";
import React from "react";

const ClientApp = dynamic(() => import("./ClientApp"), { ssr: false, loading: () => null });

export default function Home() {
  return <ClientApp />;
}
