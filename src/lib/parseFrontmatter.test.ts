import { describe, it, expect } from "vitest";
import { parseFrontmatter } from "./parseFrontmatter";

describe("parseFrontmatter", () => {
  it("should parse all frontmatter fields dynamically", () => {
    const markdown = `---
type: "challenge"
title: "Test Challenge"
description: "A test challenge"
badgeId: "test-badge"
badgeName: "Test Badge"
badgeStatement: "I completed the test"
difficulty: 2
estimatedTime: "30 mins"
requiredRank: 1
category: "Testing"
icon: "TestIcon"
module: "test-module"
isRequired: true
customField: "custom value"
---

# Challenge Content

This is the challenge content.`;

    const result = parseFrontmatter(markdown);

    // Check known fields
    expect(result.metadata.type).toBe("challenge");
    expect(result.metadata.title).toBe("Test Challenge");
    expect(result.metadata.description).toBe("A test challenge");
    expect(result.metadata.estimatedTime).toBe("30 mins");
    
    // Check challenge-specific fields
    expect(result.metadata.badgeId).toBe("test-badge");
    expect(result.metadata.badgeName).toBe("Test Badge");
    expect(result.metadata.badgeStatement).toBe("I completed the test");
    expect(result.metadata.difficulty).toBe(2);
    expect(result.metadata.requiredRank).toBe(1);
    expect(result.metadata.category).toBe("Testing");
    expect(result.metadata.icon).toBe("TestIcon");
    
    // Check lesson-specific fields
    expect(result.metadata.module).toBe("test-module");
    expect(result.metadata.isRequired).toBe(true);
    
    // Check custom field
    expect(result.metadata.customField).toBe("custom value");
    
    // Check content
    expect(result.content).toContain("# Challenge Content");
    expect(result.content).toContain("This is the challenge content.");
  });

  it("should parse boolean values correctly", () => {
    const markdown = `---
isRequired: true
isOptional: false
---

Content`;

    const result = parseFrontmatter(markdown);
    
    expect(result.metadata.isRequired).toBe(true);
    expect(result.metadata.isOptional).toBe(false);
  });

  it("should parse numeric values correctly", () => {
    const markdown = `---
difficulty: 3
unlocksRank: 5
order: 10
---

Content`;

    const result = parseFrontmatter(markdown);
    
    expect(result.metadata.difficulty).toBe(3);
    expect(result.metadata.unlocksRank).toBe(5);
    expect(result.metadata.order).toBe(10);
  });

  it("should handle quoted strings", () => {
    const markdown = `---
title: "Quoted Title"
description: "Quoted Description"
---

Content`;

    const result = parseFrontmatter(markdown);
    
    expect(result.metadata.title).toBe("Quoted Title");
    expect(result.metadata.description).toBe("Quoted Description");
  });

  it("should handle markdown without frontmatter", () => {
    const markdown = `# Just Content

No frontmatter here.`;

    const result = parseFrontmatter(markdown);
    
    expect(result.metadata).toEqual({});
    expect(result.content).toBe(markdown);
  });

  it("should maintain backward compatibility with existing code", () => {
    const markdown = `---
type: "lesson"
title: "Test Lesson"
description: "A test lesson"
estimatedTime: "1 hour"
unlocksRank: 1
---

Content`;

    const result = parseFrontmatter(markdown);

    // These are the original 4 fields that were always extracted
    expect(result.metadata.type).toBe("lesson");
    expect(result.metadata.title).toBe("Test Lesson");
    expect(result.metadata.description).toBe("A test lesson");
    expect(result.metadata.estimatedTime).toBe("1 hour");
    expect(result.metadata.unlocksRank).toBe(1);
  });

  it("should parse multiline strings with pipe syntax", () => {
    const markdown = `---
title: "Test"
description: |
  This is a multiline
  description that spans
  multiple lines
type: "lesson"
---

Content here.`;

    const result = parseFrontmatter(markdown);

    expect(result.metadata.title).toBe("Test");
    expect(result.metadata.description).toBe("This is a multiline\ndescription that spans\nmultiple lines\n");
    expect(result.metadata.type).toBe("lesson");
  });

  it("should parse multiline strings with greater-than syntax", () => {
    const markdown = `---
title: "Test"
description: >
  This is a folded
  multiline description
  that becomes one line
---

Content here.`;

    const result = parseFrontmatter(markdown);

    expect(result.metadata.title).toBe("Test");
    expect(result.metadata.description).toBe("This is a folded multiline description that becomes one line\n");
  });

  it("should parse arrays", () => {
    const markdown = `---
title: "Test"
tags:
  - tag1
  - tag2
  - tag3
---

Content here.`;

    const result = parseFrontmatter(markdown);

    expect(result.metadata.title).toBe("Test");
    expect(result.metadata.tags).toEqual(["tag1", "tag2", "tag3"]);
  });

  it("should parse nested objects", () => {
    const markdown = `---
title: "Test"
metadata:
  author: "John Doe"
  date: "2024-01-01"
  nested:
    key: "value"
---

Content here.`;

    const result = parseFrontmatter(markdown);

    expect(result.metadata.title).toBe("Test");
    expect(result.metadata.metadata).toEqual({
      author: "John Doe",
      date: "2024-01-01",
      nested: {
        key: "value"
      }
    });
  });

  it("should handle CRLF line endings", () => {
    const markdown = "---\r\ntype: \"challenge\"\r\ntitle: \"Test\"\r\n---\r\n\r\n## Content";
    const result = parseFrontmatter(markdown);
    expect(result.metadata.type).toBe("challenge");
    expect(result.metadata.title).toBe("Test");
    expect(result.content).toContain("## Content");
  });

  it("should handle leading zero-width space", () => {
    const markdown = "\u200B---\ntype: \"lesson\"\n---\n\nContent";
    const result = parseFrontmatter(markdown);
    expect(result.metadata.type).toBe("lesson");
    expect(result.content).toBe("Content");
  });

  it("should handle leading BOM", () => {
    const markdown = "\uFEFF---\ntype: \"lesson\"\n---\n\nContent";
    const result = parseFrontmatter(markdown);
    expect(result.metadata.type).toBe("lesson");
    expect(result.content).toBe("Content");
  });

  it("should handle complex YAML with CRLF including nested objects and arrays", () => {
    const markdown = "---\r\ntype: \"challenge\"\r\nrecommendedFor:\r\n  role: \"dev\"\r\ntrackPrereqs: []\r\napproval: \"REA Approved\"\r\n---\r\n\r\n## Overview";
    const result = parseFrontmatter(markdown);
    expect(result.metadata.type).toBe("challenge");
    expect(result.metadata.recommendedFor).toEqual({ role: "dev" });
    expect(result.metadata.trackPrereqs).toEqual([]);
    expect(result.metadata.approval).toBe("REA Approved");
    expect(result.content).toContain("## Overview");
  });

  it("should handle invalid YAML gracefully", () => {
    const markdown = `---
title: "Test"
invalid: [unclosed array
---

Content here.`;

    const result = parseFrontmatter(markdown);

    // Should fallback to empty metadata on parse error
    expect(result.metadata).toEqual({});
    expect(result.content).toBe("Content here.");
  });
});

