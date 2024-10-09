import React from "react";
import {
  IconBusinessplan,
  IconChartHistogram,
  IconHammer,
  IconHome,
} from "@tabler/icons-react";
import { FloatingVerticalDock } from "../ui/acternity/floating-vertical-dock";

export function ToolBar() {
  const links = [
    {
      title: "Home",
      icon: (
        <IconHome className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/",
    },

    {
      title: "Projects",
      icon: (
        <IconHammer className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/projects",
    },
    {
      title: "Contribute",
      icon: (
        <IconBusinessplan className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/contribute",
    },
    {
      title: "Dashboard",
      icon: (
        <IconChartHistogram className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/dashboard",
    },
    {
      title: "Switch Theme",
      icon: (
        <IconChartHistogram className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      href: "/theme",
    },
  ];
  return (
    <FloatingVerticalDock mobileClassName="translate-y-20" items={links} />
  );
}
