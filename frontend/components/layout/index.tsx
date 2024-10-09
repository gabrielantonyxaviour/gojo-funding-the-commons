"use client";

import { Navigation } from "./navigation";
import { ProjectsBar } from "./projects-bar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-screen select-text">
      {children}
      <ProjectsBar />
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="flex justify-center">
          <Navigation />
        </div>
      </div>
    </div>
  );
}
