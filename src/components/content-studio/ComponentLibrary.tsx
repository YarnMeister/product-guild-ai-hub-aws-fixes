/**
 * Component Library
 * 
 * Displays available custom markdown directives for content authors.
 * Visual reference only - no copy buttons per requirement.
 */

import { Play, Copy, Image, type LucideIcon } from "lucide-react";
import { directiveRegistry } from "@/lib/directiveRegistry";

// Icon lookup map for known directive icons
const iconMap: Record<string, LucideIcon> = {
  Play,
  Copy,
};

export function ComponentLibrary() {
  return (
    <div className="mt-6 pt-6 border-t border-border space-y-3">
      <h3 className="text-sm font-semibold text-muted-foreground">
        Available Components
      </h3>
      <div className="space-y-3">
        {directiveRegistry.map((directive) => {
          const IconComponent = iconMap[directive.icon];
          
          return (
            <div
              key={directive.name}
              className="rounded-lg border border-border bg-muted/30 p-4 space-y-2"
            >
              {/* Header row with icon and name */}
              <div className="flex items-center gap-2">
                {IconComponent && (
                  <IconComponent className="h-4 w-4 text-accent" />
                )}
                <span className="text-sm font-semibold text-foreground">
                  {directive.displayName}
                </span>
              </div>
              
              {/* Description */}
              <p className="text-xs text-muted-foreground">
                {directive.description}
              </p>
              
              {/* Syntax block - visual reference only, no copy button */}
              <div className="rounded-md bg-muted px-3 py-2 font-mono text-xs text-foreground">
                {directive.syntax}
              </div>
            </div>
          );
        })}
      </div>

      {/* Standard Markdown Components section */}
      <h3 className="text-sm font-semibold text-muted-foreground pt-2">
        Standard Markdown Components
      </h3>
      <div className="space-y-3">
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
          {/* Header row with icon and name */}
          <div className="flex items-center gap-2">
            <Image className="h-4 w-4 text-accent" />
            <span className="text-sm font-semibold text-foreground">
              Screenshot / Image
            </span>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground">
            Embed images and screenshots using standard markdown notation.
          </p>

          {/* Syntax block */}
          <div className="rounded-md bg-muted px-3 py-2 font-mono text-xs text-foreground">
            {`![Caption text](url)`}
          </div>

          {/* Usage note */}
          <p className="text-xs text-muted-foreground">
            During authoring/preview use{" "}
            <code className="font-mono">/sample-screenshot.svg</code> as the
            URL for a visual placeholder. For publishing, replace with a real
            hosted image URL.
          </p>
        </div>
      </div>
    </div>
  );
}

