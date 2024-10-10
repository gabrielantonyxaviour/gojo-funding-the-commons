import React from "react";
import {
  IconBusinessplan,
  IconChartHistogram,
  IconDownload,
  IconHammer,
  IconHome,
  IconPlus,
  IconRobot,
  IconSettings,
  IconTestPipe,
  IconWand,
} from "@tabler/icons-react";
import { FloatingVerticalDock } from "../ui/acternity/floating-vertical-dock";

export function ToolBar({
  setOpenCreateNodeModal,
  setOpenAskGojoSheet,
  setOpenExportModal,
}: {
  setOpenCreateNodeModal: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenAskGojoSheet: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenExportModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const links = [
    {
      title: "Add Node",
      icon: (
        <IconPlus className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      onClick: () => setOpenCreateNodeModal(true),
    },
    {
      title: "Ask Gojo",
      icon: (
        <IconWand className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      onClick: () => setOpenAskGojoSheet(true),
    },
    {
      title: "AI Agents",
      icon: (
        <IconRobot className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      onClick: () => console.log("Add Node"),
    },
    {
      title: "App Testing",
      icon: (
        <IconSettings className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      onClick: () => console.log("Add Node"),
    },

    {
      title: "App Export",
      icon: (
        <IconDownload className="h-full w-full text-neutral-500 dark:text-neutral-300" />
      ),
      onClick: () => setOpenExportModal(true),
    },
  ];
  return (
    <FloatingVerticalDock mobileClassName="translate-y-20" items={links} />
  );
}
