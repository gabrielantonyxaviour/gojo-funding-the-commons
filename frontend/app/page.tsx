// "u2143 `v`1f23se client";

// import dynamic from "next/dynamic";
// const XmtpWrapper = dynamic(() => import("@/components/home/xmtp-wrapper"), {
//   ssr: false,
// });
// export default function HomePage() {
//   return <XmtpWrapper />;
// }
"use client";
import Home from "@/components/home";

export default function HomePage() {
  return <Home />;
}
