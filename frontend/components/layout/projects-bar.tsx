"use client";

import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useEnvironmentStore } from "../context";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Separator } from "../ui/separator";
import { IconChevronLeft, IconPlus } from "@tabler/icons-react";

export function ProjectsBar() {
  const { openProjectsBar, setOpenProjectsBar } = useEnvironmentStore(
    (state) => state
  );

  const pathName = usePathname();

  const projects = [
    {
      id: 1,
      projectId: "dckadtgfjert",
      name: "Chainlink Protocol x Chiliz Chain",
    },
    {
      id: 2,
      projectId: "ackaddffaflo",
      name: "Base and Arbitrum using Hyperlane",
    },
    {
      id: 3,
      projectId: "xxxxckadtgdrt",
      name: "SKALE Network x Chainlink Protocol",
    },
  ];

  return (
    <Sheet
      open={openProjectsBar}
      onOpenChange={(val: any) => {
        setOpenProjectsBar(val);
      }}
    >
      <SheetContent side={"left"} className="p-0">
        <SheetHeader className="p-6">
          <div className="flex justify-between">
            <SheetTitle className="2xl:text-xl text-lg text-black dark:text-neutral-300">
              All Projects
            </SheetTitle>
            <IconChevronLeft
              className="text-black dark:text-white cursor-pointer"
              onClick={() => {
                setOpenProjectsBar(false);
              }}
            />
          </div>
        </SheetHeader>
        <Separator className="mb-4" />
        {projects.map((project, idx) => (
          <Link
            key={idx}
            href={"/projects/" + project.projectId}
            onClick={() => {
              setOpenProjectsBar(false);
            }}
            className={cn(
              buttonVariants({ variant: "secondary" }),
              pathName == "/projects/" + project.projectId
                ? " dark:bg-muted dark:text-white dark:hover:bg-muted dark:hover:text-white hover:bg-muted font-medium"
                : " bg-transparent text-white hover:bg",
              "text-neutral-500 dark:text-neutral-300 justify-start w-full p-6 2xl:text-lg text-md rounded-none "
            )}
          >
            {project.name}
          </Link>
        ))}
        <Separator className="my-4" />
        <div className="flex justify-center ">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "flex space-x-2 px-8 py-6"
            )}
            onClick={() => {
              setOpenProjectsBar(false);
            }}
          >
            <IconPlus className="text-black dark:text-neutral-300" />
            <p className="2xl:text-lg text-md font-medium text-black dark:text-neutral-300">
              Create new project
            </p>
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
