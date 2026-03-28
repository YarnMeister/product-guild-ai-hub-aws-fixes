import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyToClipboard } from "@/lib/clipboard";

interface CopyButtonProps {
  text: string;
  label?: string;
}

export function CopyButton({ text, label = "Copy" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await copyToClipboard(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
      // Still show copied state briefly to indicate the attempt
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    }
  };

  return (
    <div className="my-4 inline-flex max-w-full">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="h-9 px-3 text-sm font-mono gap-2 max-w-full"
        title={label} // Show full text on hover
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-primary shrink-0" />
            <span className="text-primary truncate">Copied!</span>
          </>
        ) : (
          <>
            <Copy className="h-4 w-4 shrink-0" />
            <span className="truncate">{label}</span>
          </>
        )}
      </Button>
    </div>
  );
}

