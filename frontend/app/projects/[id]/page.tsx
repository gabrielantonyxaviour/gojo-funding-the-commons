import Project from "@/components/project";

export default function ProjectPage({ params }: { params: { id: string } }) {
  return <Project name={params.id} />;
}
