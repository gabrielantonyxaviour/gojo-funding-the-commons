import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CodeBlockProps {
  language: string;
  children: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, children }) => {
  return (
    <SyntaxHighlighter
      language={language}
      style={atomDark}
      customStyle={{
        height: "400px",
        width: "700px", // Set a max-width for larger screens
        paddingLeft: "20px", // Add left padding
        overflowX: "auto", // Enable horizontal scrolling if needed
      }}
    >
      {children}
    </SyntaxHighlighter>
  );
};

export function CodeBlockComponent({ solidityCode }: { solidityCode: string }) {
  return <CodeBlock language="solidity">{solidityCode}</CodeBlock>;
}
