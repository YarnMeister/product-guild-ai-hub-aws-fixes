import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkDirective from "remark-directive";
import { visit } from "unist-util-visit";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoEmbed } from "./VideoEmbed";
import { CopyButton } from "./CopyButton";
import { directiveRegistry } from "@/lib/directiveRegistry";
import { copyToClipboard } from "@/lib/clipboard";

interface MarkdownRendererProps {
  content: string;
  onDirectiveWarnings?: (warnings: string[]) => void;
}

function CodeBlock({ children, className }: { children: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  
  // Extract language from className (format: language-xxx)
  const language = className?.replace(/language-/, "") || "text";
  
  const handleCopy = async () => {
    try {
      await copyToClipboard(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
      // Still show copied state briefly to indicate the attempt
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    }
  };

  return (
    <div className="my-6 rounded-lg border bg-muted/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-muted border-b">
        <span className="text-sm font-medium text-muted-foreground">{language}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-1 text-primary" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-1" />
              Copy
            </>
          )}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

// Custom remark plugin to transform directives into div elements with data attributes
function remarkCustomDirectives(onWarning?: (directiveName: string) => void) {
  // Get list of valid directive names from registry
  const validDirectives = new Set(directiveRegistry.map(d => d.name));

  return (tree: any) => {
    visit(tree, (node: any) => {
      if (node.type === 'textDirective' || node.type === 'leafDirective' || node.type === 'containerDirective') {
        const data = node.data || (node.data = {});

        if (node.name === 'video') {
          data.hName = 'div';
          data.hProperties = {
            'data-directive': 'video',
            'data-url': node.attributes?.url || '',
            'data-title': node.attributes?.title || '',
          };
        } else if (node.name === 'copy-button') {
          data.hName = 'div';
          data.hProperties = {
            'data-directive': 'copy-button',
            'data-text': node.attributes?.text || '',
            'data-label': node.attributes?.label || '',
          };
        } else {
          // Unrecognized directive - emit warning
          if (onWarning && !validDirectives.has(node.name)) {
            onWarning(node.name);
          }
        }
      }
    });
  };
}

export function MarkdownRenderer({ content, onDirectiveWarnings }: MarkdownRendererProps) {
  // Collect unrecognized directives
  const unrecognizedDirectives = new Set<string>();

  const handleDirectiveWarning = (directiveName: string) => {
    unrecognizedDirectives.add(directiveName);
  };

  // After processing, notify parent of warnings
  if (onDirectiveWarnings && unrecognizedDirectives.size > 0) {
    // Use setTimeout to avoid state updates during render
    setTimeout(() => {
      onDirectiveWarnings(Array.from(unrecognizedDirectives));
    }, 0);
  }

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkDirective, [remarkCustomDirectives, handleDirectiveWarning]]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold mt-8 mb-4 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold mt-8 mb-4 first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-bold mt-6 mb-3">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-semibold mt-4 mb-2">{children}</h4>
          ),
          
          // Directive handler - dispatches to VideoEmbed or CopyButton
          div: ({ node, children, ...props }) => {
            const directive = (props as any)['data-directive'];

            if (directive === 'video') {
              // Render VideoEmbed and then any children (content inside an unclosed
              // :::video{} container directive falls here as children — pass it through
              // so content after the directive is not silently discarded)
              return (
                <>
                  <VideoEmbed
                    url={(props as any)['data-url']}
                    title={(props as any)['data-title']}
                  />
                  {children}
                </>
              );
            }

            if (directive === 'copy-button') {
              const text = ((props as any)['data-text'] || '').replace(/\\n/g, '\n');
              // Same treatment: pass children through so unclosed :::copy-button{}
              // containers don't swallow subsequent content
              return (
                <>
                  <CopyButton
                    text={text}
                    label={(props as any)['data-label'] || undefined}
                  />
                  {children}
                </>
              );
            }

            return <div {...props}>{children}</div>;
          },

          // Paragraphs
          p: ({ children }) => (
            <p className="text-muted-foreground leading-relaxed mb-4">{children}</p>
          ),
          
          // Lists
          ul: ({ children }) => (
            <ul className="my-4 space-y-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-4 space-y-2 list-decimal list-inside">{children}</ol>
          ),
          li: ({ children, node, ...props }) => {
            // Check if parent is an ordered list
            const isOrderedList = node?.position ? false : false;

            if (isOrderedList) {
              // For ordered lists, don't add bullet - just render the content
              return (
                <li className="text-muted-foreground" {...props}>
                  {children}
                </li>
              );
            }

            // For unordered lists, render with bullet dot
            return (
              <li className="flex items-start gap-2 text-muted-foreground" {...props}>
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                <span>{children}</span>
              </li>
            );
          },
          
          // Code blocks
          code: ({ className, children, ...props }) => {
            const codeString = String(children).replace(/\n$/, "");
            const isInline = !className;
            
            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono text-foreground"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            
            return <CodeBlock className={className}>{codeString}</CodeBlock>;
          },
          
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/30 pl-4 my-4 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          
          // Images
          img: ({ src, alt }) => (
            <div className="my-6 rounded-lg border bg-muted/30 overflow-hidden">
              <div className="aspect-video flex items-center justify-center">
                {src === "placeholder" ? (
                  <div className="text-center text-muted-foreground">
                    <p className="text-sm">{alt || "Image placeholder"}</p>
                  </div>
                ) : (
                  <img src={src} alt={alt} className="w-full h-full object-cover" />
                )}
              </div>
            </div>
          ),
          
          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

