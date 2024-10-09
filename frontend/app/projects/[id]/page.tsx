import Flow from "@/components/project/flow";

export default function ProjectPage({ params }: { params: { id: string } }) {
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
    <div className="h-full flex flex-col">
      <div className="w-full flex-1">
        <Flow />
      </div>
      <div className="fixed top-0 left-0 right-0 select-none ">
        <div className="flex justify-center">
          <p className="text-center text-lg font-semibold py-2 px-4 dark:bg-secondary bg-black dark:text-zinc-200 text-white rounded-b-lg">
            {projects[0].name}
          </p>
        </div>
      </div>
    </div>
  );
}
