/**
 * Directive Registry
 *
 * Single source of truth for all custom markdown directives.
 * This registry drives the Component Library UI in ContentStudio.
 *
 * When adding a new directive:
 * 1. Add handler in MarkdownRenderer.tsx remarkCustomDirectives()
 * 2. Add entry to this registry
 * 3. Component library will automatically display the new directive
 *
 * IMPORTANT: The build process automatically validates that this registry
 * matches the handlers in MarkdownRenderer.tsx. If you add a directive to
 * one but not the other, the build will fail with a clear error message.
 * See scripts/validate-directive-registry.ts for validation logic.
 */

export interface DirectiveAttribute {
  name: string;        // e.g., "url"
  required: boolean;
  description: string; // e.g., "Video URL (SharePoint embed or .mp4)"
}

export interface DirectiveDefinition {
  name: string;              // e.g., "video" (matches remark-directive name)
  displayName: string;       // e.g., "Video Embed"
  description: string;       // Human-readable purpose
  icon: string;              // lucide-react icon name, e.g., "Play"
  syntax: string;            // e.g., '::video{url="URL" title="Title"}'
  attributes: DirectiveAttribute[];
  example: string;           // Full markdown example
  directiveType: 'leaf';     // Currently only leaf directives
}

export const directiveRegistry: DirectiveDefinition[] = [
  {
    name: 'video',
    displayName: 'Video Embed',
    description: 'Embeds video players. Supports SharePoint iframe embeds and direct .mp4 URLs.',
    icon: 'Play',
    syntax: '::video{url="VIDEO_URL" title="Video Title"}',
    attributes: [
      { name: 'url', required: true, description: 'Video URL (SharePoint or .mp4)' },
      { name: 'title', required: false, description: 'Video title for accessibility' },
    ],
    example: '::video{url="https://example.com/video.mp4" title="Demo Video"}',
    directiveType: 'leaf',
  },
  {
    name: 'copy-button',
    displayName: 'Copy Button',
    description: 'Creates a button that copies text to clipboard when clicked.',
    icon: 'Copy',
    syntax: '::copy-button{text="TEXT" label="Label"}',
    attributes: [
      { name: 'text', required: true, description: 'Text to copy to clipboard' },
      { name: 'label', required: false, description: 'Button label (defaults to "Copy")' },
    ],
    example: '::copy-button{text="npm install something" label="Copy command"}',
    directiveType: 'leaf',
  },
];

