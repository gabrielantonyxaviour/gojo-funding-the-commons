import Image from "next/image";
import Title from "./title";
import { SearchBar } from "./search-bar";

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center h-full space-y-4">
      <Image
        src="/logo-nouns.png"
        alt="logo"
        width={80}
        height={80}
        className="rounded-full opacity-90"
      />
      <Title />
      <SearchBar />
    </div>
  );
}
