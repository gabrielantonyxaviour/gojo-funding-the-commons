import Project from "@/components/project";
export const metadata = {
  title: "Project | Gojo",
  description: "Build your prototype in 10 mins or get your money back.",
};

export default function ProjectPage({ params }: { params: { id: string } }) {
  return <Project id={params.id} />;
}
