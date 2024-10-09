"use client";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { IconArrowUp, IconArrowUpRight } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "../ui/badge";
import { useState } from "react";
import Suggestions from "./suggestions";

export function SearchBar() {
  const [prompt, setPrompt] = useState("");
  return (
    <div className="xl:w-[1000px] lg:w-[800px] w-[600px]">
      <Card>
        <CardContent className="p-0">
          <Input
            value={prompt}
            onChange={(e) => [setPrompt(e.target.value)]}
            placeholder="Ask a question or search for answers..."
            className="2xl:text-lg text-md font-medium p-4 bg-transparent border-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-0"
          />
          <div className="flex justify-end">
            <Button variant={"secondary"} className="px-3 py-4 m-2">
              <IconArrowUp className="h-5 w-5"></IconArrowUp>
            </Button>
          </div>
        </CardContent>
      </Card>
      <Suggestions setPrompt={setPrompt} />
    </div>
  );
}
