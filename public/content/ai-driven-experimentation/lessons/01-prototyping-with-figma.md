---
type: "lesson"
id: 1 
title: "Use Figma Make to Build Interactive Prototypes Within Minutes"
description: "Learn how to use Figma Make's AI-powered features to generate, iterate, and share real working prototypes in minutes — from blank canvas to branded, multi-screen app."
estimatedTime: "45 mins"
estimatedMinutes: 45 
order: 1 
module: "ai-driven-experimentation"
track: "prototyping"
isRequired: true 
status: "live" 
videoUrl: "https://reaglobal.sharepoint.com/sites/ProductCommunity/_layouts/15/embed.aspx?UniqueId=e29d9f52-578d-4ecd-9fca-bcbc1e3744a9&embed=%7B%22ust%22%3Afalse%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create" 
badgeName: "Prototype Maker"
unlockMessage: "You've unlocked: Prototype Maker!"
toolTags:
  - "figma"
  - "figma-ai"
  - "miro"
  - "omnia" 
recommendedFor:
  tool_specialist: 0.9
  explorer: 0.8
  completionist: 0.9
  pragmatist: 1.0
trackPrereqs: []
approval: "REA Approved" 
---

## Overview

Figma Make is an AI-powered feature released by Figma in August 2025 that lets you generate real, interactive, code-backed prototypes directly inside Figma — no separate dev environment required. Whether you're starting from a blank prompt, remixing a community template, or converting a Miro wireframe into a functioning app, Figma Make compresses the gap between idea and shareable prototype from days to minutes.

In this lesson you'll learn how the tool works end-to-end: choosing the right AI model, writing prompts that actually land, connecting REA's ConstructKit design system for brand consistency, navigating the code editor, and publishing your prototype to a public URL. By the end, you'll have the mental model and the hands-on instincts to use Figma Make confidently in your own work.

## Watch the masterclass

::video{url="https://reaglobal.sharepoint.com/sites/ProductCommunity/_layouts/15/embed.aspx?UniqueId=e29d9f52-578d-4ecd-9fca-bcbc1e3744a9&embed=%7B%22ust%22%3Afalse%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create" title="Use Figma Make to Build Interactive Prototypes Within Minutes"}

---

## What is Figma Make?


Figma Make is  an AI-powered, prompt-to-app tool inside Figma, that generates functional prototypes, interactive UI, and web apps from text prompts. It allows product teams to rapidly turn ideas or static designs into clickable prototypes, with the ability to edit layouts, styles, and interactions through conversation with AI.

Key features of Figma Make include:

-   **Prompt-to-App:**  Generates complete, functional web applications or UI screens based on written descriptions.
-   **Rapid Prototyping:**  Converts static design screens into clickable, interactive prototypes.
-   **AI Editing & Refinement:**  Users can edit components, change colors, or update fonts directly within the interface using natural language.
-   **Context-Aware:**  Integrates existing design systems, styles, and components from Figma, ensuring consistency.
-   **Real-Time Data:**  Supports creating functional apps, potentially including data persistence, by connecting to backends like Supabase.

Key things to know before you start:

- Prototypes are **code-backed**, not just visually linked frames.
- You get a **public shareable URL** with no login required for viewers.
- The model can pick up your **design system** automatically if you connect it.
- Hover states, micro-animations, and responsive layouts often appear **without you asking** — inspect them and keep or override as needed.
- **Unsplash placeholder images** are used automatically when the model needs imagery; swap in real assets when ready.

---

## Choosing Your AI Model

When you open a new Figma Make canvas, you'll be prompted to select a model. The choice affects speed and output quality:

Available AI Models

-   **Claude 4.6 Sonnet**: This high-performance model from Anthropic offers a balance of versatility and efficiency for most design tasks.
-   **Claude 4.6 Opus**: This is Anthropic's flagship intelligence model, suitable for challenging, dynamic projects and complex logical generation.
-   **Gemini 3 Pro**: This Google model is optimized for complex and creative work, handling multi-step reasoning well.
-   **Gemini 3 Flash**: Designed for a faster and more iterative process, it provides quick results for rapid prototyping.

---

## Starting a Prototype: Three Entry Points

### From a blank prompt

Type a plain-English description of what you want to build. You don't need to specify the tech stack - Figma Make handles that.

> *"Build a property search results page with a filter sidebar, listing cards, and a map view on the right."*

The model will generate a full screen. From there, iterate in smaller steps (see Prompt Best Practices below).

### From a pre-built template

Two template sources are available:

- **Ignite** — REA's internal template library. These are already wired to familiar product patterns and are the fastest way to produce something on-brand from the first frame.
- **Community templates** — Browse the Figma Make community for publicly shared prototypes. You can **Remix** any community prototype, which forks it into your own canvas and gives you full access to its **prompt history** — an excellent way to reverse-engineer how a result was achieved.

### From a Miro wireframe

If your ideation started in Miro (e.g. using the Miro wireframe kit), you can translate it directly into Figma Make:

1. Complete your wireframe layout in Miro using the wireframe component kit.
2. Select all frames and right click to send your frames to Figma.
4. Open Figma Make and reference the frame in your first prompt: *"Use the attached wireframe as the layout structure and build it as a working prototype."*
5. Figma Make will interpret the wireframe shapes as layout intent and generate code-backed screens to match.

> **Tip:** The cleaner and more labelled your Miro wireframe, the more accurately Figma Make can interpret the intended structure.

---

## Multi-Screen Prototypes

Figma Make supports **multi-screen / multi-frame prototypes**. To build more than one screen:

- Create separate frames in your Figma file for each screen (e.g. Home, Search Results, Property Detail).
- Send all frames to Figma Make together — it will wire up navigation between them.
- **Mobile vs desktop viewport** is auto-detected from frame size. A 390×844 frame is treated as a mobile screen; a 1440px-wide frame as desktop. Use this to generate responsive variants of the same prototype.

---

## Connecting ConstructKit (REA Design System)

ConstructKit is REA's internal design system. Connecting it ensures Figma Make uses REA's colour tokens, typography, spacing, and component patterns — not generic defaults.

-   Open a  Figma Make  file.
-   In the AI chat or file settings, click  **Select a Library**.
-   Choose the exported library from the list to set it as the "style context".

Once connected, the model will:

- Pull REA brand colours and typography automatically.
- Use ConstructKit component names when generating UI (e.g. `<Button variant="primary">`).
- Reduce the amount of manual visual correction needed after generation.

> **Tip:** Even with ConstructKit connected, check your first output and nudge the model if it's drifted from expected styles: *"Use the ConstructKit primary button style, not a custom one."*

---

## The `guidelines.md` File

For more fine-grained brand and tone control, you can add a `guidelines.md` file to your Figma Make canvas. This is a markdown file where you paste your brand guidelines — writing principles, component naming conventions, colour rules, tone of voice, etc.

The model reads this file as a persistent instruction set for the session. Use it when:

- You're building something that needs to feel unmistakably REA-branded.
- You want to enforce specific constraints (e.g. "never use red for interactive elements").
- You're collaborating with others who will continue prompting in the same canvas.

---

## Prompt Best Practices

This is the most important skill to develop. The model performs best when prompts are **small, specific, and incremental**.

**Do:**
- One change or feature per prompt
- Reference specific elements by name: *"Update the listing card component to show a Save button on hover"*
- Be explicit about what should stay the same: *"Keep the navigation bar exactly as it is"*

**Avoid:**
- Long prompts that describe the entire app in one go — this is the primary cause of hallucinations and structural drift
- Vague directives like *"make it better"* or *"fix the layout"*
- Asking for multiple distinct features in a single message

> **Tip:** Think of prompting like a conversation with a junior developer. Small, well-scoped tickets produce better work than a 10-requirement spec dropped all at once.

---

## Point and Edit

Point and Edit is Figma Make's direct-manipulation mode. Instead of writing a prompt, you click on any element in the rendered prototype and describe the change you want in context.

This is the fastest way to:

- Fix a specific component without re-describing the whole screen
- Adjust copy, spacing, or colours on a targeted element
- Test micro-interactions on individual elements

Use Point and Edit for **surgical edits** after the overall structure is in place. Switch back to the prompt bar for **structural changes** (new sections, new screens, new interactions).

---

## The Code Editor

Every Figma Make prototype has a **TypeScript/React code editor** accessible from the canvas. Inside it:

- You can navigate the **file tree** to see how the prototype is structured.
- You can **move components** between files manually if the model has nested things awkwardly.
- You can make **direct code edits** - useful if you know exactly what change you want and don't want to risk the model interpreting a prompt imprecisely.
- The editor shows the actual running code - what you see in the preview is exactly what the code produces.

You don't need to be an engineer to use this effectively. Even being able to read the component names and file structure helps you write better prompts.

---

## Version History and Rollback

Every prompt creates a checkpoint in the version history. If an iteration moves in the wrong direction:

1. Open the version history panel.
2. Find the checkpoint before the unwanted change.
3. Roll back - the canvas reverts to that state, and you can branch in a different direction.

> **Tip:** Use version history deliberately as a creative tool, not just a safety net. Branch before a risky experiment, explore freely, and roll back if it doesn't work. This removes the fear of breaking something.

---

## Integrations: Supabase for Data Collection

If your prototype includes a form (e.g. a lead capture or contact form), Figma Make supports **Supabase integration** to actually collect and store submissions. This means you can demo a fully working form to stakeholders - not a fake one.

---

## Sharing and Publishing

Once your prototype is ready:

- **Publish to a public URL** - Figma Make generates a shareable link that anyone can open in a browser, no Figma account required.
- **Collaborator access** - Invite teammates with either editor access (they can prompt and modify) or view-only access (they can interact with the prototype but not change it).
- The public URL updates live as you make changes- there's no separate "re-publish" step for most updates.

>
