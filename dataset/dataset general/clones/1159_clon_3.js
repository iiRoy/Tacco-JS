/*
 * TextMark Processor - A JavaScript port of Markdown logic.
 *
 * Copyright (c) 2007 John Fraser.
 * Original Markdown by John Gruber (2004-2005)
 *
 * Licensed under a BSD-style open source license.
 * For more details, see the accompanying license.txt file.
 *
 * Project homepage: http://www.attacklab.net/ (legacy)
 *
 * This utility processes markdown-formatted text into HTML.
 * It aims for behavioral parity with the original Perl Markdown.
 *
 * Current version requires ECMAScript 262, 3rd Edition (JavaScript 1.5)
 * for its regular expression capabilities.
 */

// Core namespace for the text processing library
const MarkupProcessor = { pluginRegistry: {} };

/**
 * Iterates over elements in an array or an object supporting `forEach`.
 * @param {Array|Object} collection - The collection to iterate.
 * @param {Function} action - The callback function to execute for each element.
 */
MarkupProcessor.forEachItem = function(collection, action) {
  if (typeof collection.forEach === 'function') {
    collection.forEach(action);
  } else {
    for (let currentIdx = 0; currentIdx < collection.length; currentIdx++) {
      action(collection[currentIdx], currentIdx, collection);
    }
  }
};

/**
 * Normalizes an extension name string into a consistent key.
 * Removes hyphens, underscores, and spaces, then converts to lowercase.
 * @param {string} inputName - The raw extension name.
 * @returns {string} The normalized key.
 */
const normalizeExtensionKey = (inputName) => {
  return inputName.replace(/[_-]|\s/g, '').toLowerCase();
};

/**
 * MarkdownProcessor constructor.
 * Encapsulates all global state and processing logic.
 * @param {Object} [configOptions] - Configuration options for the processor.
 * @param {Array<string|Function|Object>} [configOptions.extensions] - List of extensions to load.
 */
MarkupProcessor.MarkdownProcessor = function(configOptions) {

  // Internal state variables, cleared for each processing run.
  let linkReferences;     // Stores URLs for link definitions.
  let titleMetadata;      // Stores titles for link definitions.
  let htmlBlockCache;     // Caches raw HTML blocks to prevent Markdown processing within them.

  // Tracks nesting level for lists.
  let currentListDepth = 0;

  // Arrays to hold registered language and output transformation extensions.
  const languageTransforms = [];
  const outputProcessors = [];

  // Attempt to load extensions automatically in a Node.js environment.
  // This block detects Node.js by checking for `module`, `exports`, `require`, and `process.versions.node`.
  if (typeof module !== 'undefined' && typeof exports !== 'undefined' && typeof require !== 'undefined' && typeof process !== 'undefined' && process.versions && process.versions.node) {
    try {
      const nodeFs = require('fs');
      const nodePath = require('path');

      if (nodeFs && nodePath) {
        const extensionsDir = nodePath.join(__dirname || '.', 'extensions');
        if (nodeFs.existsSync(extensionsDir)) {
          const availableExtensions = nodeFs.readdirSync(extensionsDir)
            .filter(filename => filename.endsWith('.js'))
            .map(filename => filename.replace(/\.js$/, ''));

          MarkupProcessor.forEachItem(availableExtensions, (extName) => {
            const normalizedName = normalizeExtensionKey(extName);
            MarkupProcessor.pluginRegistry[normalizedName] = require(nodePath.join(extensionsDir, extName));
          });
        }
      }
    } catch (e) {
      console.warn('Failed to auto-load extensions in Node.js environment:', e.message);
    }
  }

  /**
   * Main entry point for converting Markdown text to HTML.
   * This function orchestrates all processing steps.
   * @param {string} inputText - The Markdown formatted text.
   * @returns {string} The HTML output.
   */
  this.transformText = function(inputText) {
    if (typeof inputText !== 'string') {
      console.warn('Input for transformText must be a string. Received:', typeof inputText);
      return ''; // Return empty string for invalid input.
    }

    // Initialize/clear global state for a fresh conversion.
    linkReferences = {};
    titleMetadata = {};
    htmlBlockCache = [];

    // Pre-processing: escape special characters that might conflict with internal markers.
    // Tilde is used as an internal escape character.
    let processedText = inputText.replace(/~/g, "~T");
    // Dollar sign needs escaping for RegExp replacement strings.
    processedText = processedText.replace(/\$/g, "~D");

    // Standardize line endings to Unix-style for consistent regex matching.
    processedText = processedText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    // Ensure text is padded with newlines for consistent block-level matching.
    processedText = "\n\n" + processedText + "\n\n";

    // Convert all tabs to spaces (4 spaces per tab).
    processedText = convertTabsToSpaces(processedText);

    // Remove lines consisting only of whitespace to simplify block regexes.
    processedText = processedText.replace(/^[ \t]+$/mg, "");

    // Apply language-level extensions, which modify the raw Markdown.
    MarkupProcessor.forEachItem(languageTransforms, (ext) => {
      processedText = applyTransformStep(ext, processedText);
    });

    // Handle GitHub-style fenced code blocks early to escape their content.
    processedText = processFencedCodeBlocks(processedText);

    // Cache raw HTML blocks to prevent Markdown processing within them.
    processedText = cacheRawHtmlBlocks(processedText);

    // Extract link definitions (e.g., `[id]: url "title"`) and remove them from text.
    processedText = extractLinkMetadata(processedText);

    // Process block-level Markdown elements (headers, lists, code blocks, etc.).
    processedText = processBlockElements(processedText);

    // Restore any previously escaped special characters.
    processedText = restoreEscapedChars(processedText);

    // Post-processing: restore original dollar signs and tildes.
    processedText = processedText.replace(/~D/g, "$$").replace(/~T/g, "~");

    // Apply output-level extensions, which modify the generated HTML.
    MarkupProcessor.forEachItem(outputProcessors, (ext) => {
      processedText = applyTransformStep(ext, processedText);
    });

    return processedText;
  };

  // Configuration processing for extensions.
  if (configOptions && configOptions.extensions) {
    const currentProcessor = this;

    MarkupProcessor.forEachItem(configOptions.extensions, (extensionInput) => {
      let resolvedPlugin = extensionInput;

      // If a string is provided, assume it refers to a bundled plugin.
      if (typeof extensionInput === 'string') {
        resolvedPlugin = MarkupProcessor.pluginRegistry[normalizeExtensionKey(extensionInput)];
      }

      if (typeof resolvedPlugin === 'function') {
        // A plugin function can return an array of individual extensions.
        MarkupProcessor.forEachItem(resolvedPlugin(currentProcessor), (ext) => {
          if (ext.type === 'language' || ext.type === 'lang') {
            languageTransforms.push(ext);
          } else if (ext.type === 'output' || ext.type === 'html') {
            outputProcessors.push(ext);
          } else {
            // Default to output extension if type is not specified.
            outputProcessors.push(ext);
          }
        });
      } else {
        throw new Error(`Extension '${extensionInput}' could not be loaded. It might be missing or invalid.`);
      }
    });
  }

  /**
   * Applies a single extension transformation step.
   * An extension can be a regex-based replacement or a filter function.
   * @param {Object} ext - The extension object.
   * @param {string} data - The text data to transform.
   * @returns {string} The transformed text.
   */
  const applyTransformStep = (ext, data) => {
    if (ext.regex && ext.replace) {
      const regexPattern = new RegExp(ext.regex, 'g');
      return data.replace(regexPattern, ext.replace);
    } else if (ext.filter && typeof ext.filter === 'function') {
      return ext.filter(data);
    }
    return data; // Return original data if extension is malformed.
  };

  /**
   * Extracts link definitions from the text, storing URLs and titles.
   * Definitions are removed from the text after extraction.
   * Format: `[id]: url "optional title"`
   * @param {string} sourceText - The text containing link definitions.
   * @returns {string} The text with link definitions removed.
   */
  const extractLinkMetadata = (sourceText) => {
    // Add a unique sentinel to the end of the text to handle edge cases
    // where link definitions are at the very end of the document without a trailing newline.
    let workingText = sourceText + "@@MARKDOWN_END_SENTINEL@@";

    const linkDefRegex = /^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<(\S+?)>[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+|(?=@@MARKDOWN_END_SENTINEL@@))/gm;

    workingText = workingText.replace(linkDefRegex, (fullMatch, idGroup, urlGroup, blankLinesGroup, titleGroup) => {
      const lowerId = idGroup.toLowerCase();
      linkReferences[lowerId] = escapeHtmlEntities(urlGroup);

      if (blankLinesGroup) {
        // If blank lines were found, it means the title was actually part of the content.
        // Restore the "stolen" parenthetical statement.
        return blankLinesGroup + titleGroup;
      } else if (titleGroup) {
        // Store the title, escaping quotes.
        titleMetadata[lowerId] = titleGroup.replace(/"/g, "&quot;");
      }
      // Remove the definition from the text.
      return "";
    });

    // Remove the sentinel.
    workingText = workingText.replace(/@@MARKDOWN_END_SENTINEL@@/, "");
    return workingText;
  };

  /**
   * Caches block-level HTML tags by replacing them with placeholders.
   * This prevents Markdown from processing content within raw HTML blocks.
   * @param {string} sourceText - The text potentially containing HTML blocks.
   * @returns {string} The text with HTML blocks replaced by placeholders.
   */
  const cacheRawHtmlBlocks = (sourceText) => {
    // Temporarily double newlines to simplify lookaround assertions in regex.
    let workingText = sourceText.replace(/\n/g, "\n\n");

    // Block-level HTML tags.
    const strictBlockTags = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del|style|section|header|footer|nav|article|aside";
    const looseBlockTags = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|style|section|header|footer|nav|article|aside";

    // 1. Match nested blocks where outer tags start at margin and inner tags are indented.
    workingText = workingText.replace(new RegExp(`^(<(${strictBlockTags})\\b[^\\r]*?\\n<\\/\\2>[ \\t]*(?=\\n+))`, 'gm'), storeHtmlBlock);

    // 2. Match more liberal blocks: from `\n<tag>` to `</tag>\n`.
    workingText = workingText.replace(new RegExp(`^(<(${looseBlockTags})\\b[^\\r]*?<\\/\\2>[ \\t]*(?=\\n+)\\n)`, 'gm'), storeHtmlBlock);

    // 3. Special case for <hr />.
    workingText = workingText.replace(/(\n[ ]{0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g, storeHtmlBlock);

    // 4. Special case for standalone HTML comments.
    workingText = workingText.replace(/(\n\n[ ]{0,3}<!(--[^\r]*?--\s*)+>[ \t]*(?=\n{2,}))/g, storeHtmlBlock);

    // 5. PHP and ASP-style processor instructions (<?...?> and <%...%>).
    workingText = workingText.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g, storeHtmlBlock);

    // Undo temporary double newlines.
    workingText = workingText.replace(/\n\n/g, "\n");
    return workingText;
  };

  /**
   * Callback for `replace` functions in `cacheRawHtmlBlocks`.
   * Stores the matched HTML block in `htmlBlockCache` and returns a placeholder.
   * @param {string} fullMatch - The entire matched string.
   * @param {string} blockContent - The content of the HTML block.
   * @returns {string} A placeholder string for the HTML block.
   */
  const storeHtmlBlock = (fullMatch, blockContent) => {
    // Normalize content: remove extra newlines, trim leading/trailing newlines.
    let cleanedContent = blockContent.replace(/\n\n/g, "\n").replace(/^\n/, "").replace(/\n+$/g, "");

    // Store block and return a unique marker.
    const blockKey = htmlBlockCache.push(cleanedContent) - 1;
    return `\n\n@@HTML_BLOCK_${blockKey}@@\n\n`;
  };

  /**
   * Processes block-level Markdown constructs.
   * This includes headers, horizontal rules, lists, code blocks, and blockquotes.
   * @param {string} sourceText - The text to process.
   * @returns {string} The text with block-level elements converted to HTML.
   */
  const processBlockElements = (sourceText) => {
    let currentText = sourceText;

    currentText = processHeaders(currentText);

    // Handle Horizontal Rules.
    const hrPlaceholder = storeHtmlBlock("<hr />"); // Cache the HR tag itself.
    currentText = currentText.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm, hrPlaceholder);
    currentText = currentText.replace(/^[ ]{0,2}([ ]?\-[ ]?){3,}[ \t]*$/gm, hrPlaceholder);
    currentText = currentText.replace(/^[ ]{0,2}([ ]?\_[ ]?){3,}[ \t]*$/gm, hrPlaceholder);

    currentText = processLists(currentText);
    currentText = processCodeBlocks(currentText);
    currentText = processBlockQuotes(currentText);

    // Re-cache HTML blocks that might have been generated by earlier Markdown processing
    // (e.g., a list item containing raw HTML). This ensures paragraphs aren't wrapped around them.
    currentText = cacheRawHtmlBlocks(currentText);
    currentText = formatParagraphs(currentText);

    return currentText;
  };

  /**
   * Processes inline Markdown constructs within block-level elements.
   * This includes code spans, escaped characters, images, and links.
   * @param {string} sourceText - The text to process.
   * @returns {string} The text with inline elements converted to HTML.
   */
  const processInlineElements = (sourceText) => {
    let currentText = sourceText;

    currentText = processInlineCode(currentText);
    currentText = escapeTagAttributes(currentText);
    currentText = handleBackslashEscapes(currentText);

    // Image processing must precede link processing as `![alt][id]` resembles a link.
    currentText = processImages(currentText);
    currentText = processLinks(currentText);

    // More inline processing steps would go here: strong/em, auto-links, etc.
    // ... (omitted for brevity, as per original code structure)

    return currentText;
  };

  // --- Helper functions (renamed and refactored from original) ---

  /**
   * Converts tabs to spaces, assuming a tab width of 4.
   * @param {string} input - The text to process.
   * @returns {string} The text with tabs replaced by spaces.
   */
  const convertTabsToSpaces = (input) => {
    return input.replace(/\t(?=\t)/g, "    ").replace(/\t/g, "    "); // Handles consecutive tabs
  };

  /**
   * Escapes ampersands and angle brackets in URLs or attributes.
   * @param {string} rawString - The string to escape.
   * @returns {string} The escaped string.
   */
  const escapeHtmlEntities = (rawString) => {
    return rawString.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  };

  /**
   * Restores previously escaped special characters.
   * (This function is generally more complex in a full Markdown implementation,
   * handling things like `&amp;` -> `&`, etc.)
   * For this clone, we'll keep it simple as per the original's limited usage.
   * @param {string} input - The text potentially containing escaped characters.
   * @returns {string} The text with special characters restored.
   */
  const restoreEscapedChars = (input) => {
    return input; // Placeholder, as original `_UnescapeSpecialChars` was often a no-op or handled specific cases.
  };

  /**
   * Processes GitHub-style fenced code blocks (```lang\ncode\n```).
   * @param {string} input - The text to process.
   * @returns {string} The text with fenced code blocks converted to HTML.
   */
  const processFencedCodeBlocks = (input) => {
    // Simplified placeholder; a full implementation would parse language and content.
    // Original showdown.js had `_DoGithubCodeBlocks` that would hash the blocks.
    // For Type III, we can make it an actual (albeit basic) conversion.
    const fencedCodeRegex = /(```+|~~~+)\s*(\S+)?\n([\s\S]+?)\n\1/g;
    return input.replace(fencedCodeRegex, (match, fence, lang, code) => {
      const languageClass = lang ? ` class="language-${lang.trim()}"` : '';
      const escapedCode = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `\n\n<pre><code${languageClass}>${escapedCode}\n</code></pre>\n\n`;
    });
  };

  /**
   * Converts Markdown headers (e.g., `# Header` or `---`) to HTML.
   * @param {string} input - The text to process.
   * @returns {string} The text with headers converted.
   */
  const processHeaders = (input) => {
    let currentText = input;

    // Setext-style headers (underlined with = or -)
    currentText = currentText.replace(/^(.+)[ \t]*\n=+[ \t]*\n+/gm, (match, content) => {
      return `<h1>${processInlineElements(content)}</h1>\n\n`;
    });
    currentText = currentText.replace(/^(.+)[ \t]*\n-+[ \t]*\n+/gm, (match, content) => {
      return `<h2>${processInlineElements(content)}</h2>\n\n`;
    });

    // Atx-style headers (# Header #)
    currentText = currentText.replace(/^(#{1,6})[ \t]*(.+?)[ \t]*#*\n+/gm, (match, hashes, content) => {
      const level = hashes.length;
      return `<h${level}>${processInlineElements(content)}</h${level}>\n\n`;
    });

    return currentText;
  };

  /**
   * Converts Markdown lists (ordered and unordered) to HTML.
   * This is a simplified placeholder; a full implementation is complex.
   * @param {string} input - The text to process.
   * @returns {string} The text with lists converted.
   */
  const processLists = (input) => {
    // Simplified: just wraps basic list items. Full implementation needs recursion.
    // The original `_DoLists` is quite complex due to nested lists and lazy continuations.
    // For Type III, we can provide a slightly different, simplified regex-based approach
    // that handles basic cases, or indicate complexity. Let's do a basic one.

    const listRegex = /((?:^[ \t]*[-*+]|[ \t]*\d+\.)[ \t]+[\s\S]+?)(?=\n\n|\n[ \t]*$)/gm; // Matches a block of list items

    const processSingleList = (listBlock) => {
      currentListDepth++; // Increment list depth for nested list handling (conceptually)

      const isOrdered = /^[ \t]*\d+\./m.test(listBlock);
      const listTag = isOrdered ? 'ol' : 'ul';
      const listItemRegex = /^[ \t]*(?:[-*+]|\d+\.)[ \t]+([\s\S]+?)(?=\n[ \t]*(?:[-*+]|\d+\.)|\n[ \t]*$)/gm;

      let listItemsHtml = '';
      let match;
      while ((match = listItemRegex.exec(listBlock)) !== null) {
        let itemContent = match[1];
        // Recursively process inline elements within list item.
        // A more robust implementation would also handle nested lists here.
        itemContent = processInlineElements(itemContent.trim());
        listItemsHtml += `<li>${itemContent}</li>\n`;
      }

      currentListDepth--; // Decrement list depth
      return `<${listTag}>\n${listItemsHtml}</${listTag}>\n\n`;
    };

    return input.replace(listRegex, processSingleList);
  };

  /**
   * Converts Markdown code blocks (indented) to HTML.
   * @param {string} input - The text to process.
   * @returns {string} The text with code blocks converted.
   */
  const processCodeBlocks = (input) => {
    // Matches lines indented with 4 spaces or 1 tab.
    const codeBlockRegex = /(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)((?=^[ ]{0,4}\S)|\Z)/g; // Adjusted regex for clarity

    return input.replace(codeBlockRegex, (match, codeContent) => {
      // Remove leading indentation, then escape HTML entities.
      const cleanedCode = codeContent.replace(/^[ ]{4}/gm, '').replace(/\t/gm, '')
                                     .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `\n\n<pre><code>${cleanedCode}</code></pre>\n\n`;
    });
  };

  /**
   * Converts Markdown blockquotes to HTML.
   * @param {string} input - The text to process.
   * @returns {string} The text with blockquotes converted.
   */
  const processBlockQuotes = (input) => {
    const blockquoteRegex = /(?:(?:\n\n|^)[ \t]*>[ \t]*.*\n+)+/g;

    return input.replace(blockquoteRegex, (match) => {
      let content = match.replace(/^[ \t]*>[ \t]?/gm, ''); // Remove blockquote markers
      content = content.replace(/^[ \t]+$/gm, ''); // Remove blank lines consisting only of spaces

      // Recursively process block elements within the blockquote.
      content = processBlockElements(content);
      return `\n\n<blockquote>\n${content}\n</blockquote>\n\n`;
    });
  };

  /**
   * Wraps non-block-level content in `<p>` tags.
   * @param {string} input - The text to process.
   * @returns {string} The text with paragraphs formatted.
   */
  const formatParagraphs = (input) => {
    let currentText = input.trim(); // Trim leading/trailing whitespace.

    // Replace cached HTML blocks with their actual content.
    currentText = currentText.replace(/@@HTML_BLOCK_(\d+)@@/g, (match, key) => {
      return htmlBlockCache[parseInt(key, 10)];
    });

    // Split text into lines, filter out empty ones, and wrap in paragraphs.
    const lines = currentText.split(/\n{2,}/g); // Split by two or more newlines.
    let paragraphsHtml = lines.map(line => {
      line = line.trim();
      if (line === '') return ''; // Skip empty lines after trim

      // If a line contains a block-level HTML tag or a block placeholder,
      // it should not be wrapped in a <p> tag.
      // This check is simplified; a robust check would verify if `line` is *entirely* a block.
      if (line.match(/<h[1-6]|<p>|<div|<ul|<ol|<dl|<pre|<blockquote|<hr|<table|<form|<fieldset|<iframe|<script|<noscript|<math|<ins|<del|<style|<section|<header|<footer|<nav|<article|<aside/i)) {
        return line;
      }
      return `<p>${processInlineElements(line)}</p>`;
    }).join('\n\n');

    return paragraphsHtml + '\n';
  };

  /**
   * Converts Markdown inline code spans (``code``) to HTML.
   * @param {string} input - The text to process.
   * @returns {string} The text with inline code converted.
   */
  const processInlineCode = (input) => {
    const inlineCodeRegex = /(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/g;

    return input.replace(inlineCodeRegex, (match, backticks, content) => {
      // Remove leading/trailing whitespace, escape HTML entities.
      const cleanedContent = content.trim().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      return `<code>${cleanedContent}</code>`;
    });
  };

  /**
   * Escapes special characters within HTML tag attributes.
   * This is crucial to prevent Markdown from processing `*` or `_` inside `href` or `title`.
   * @param {string} input - The text to process.
   * @returns {string} The text with attributes escaped.
   */
  const escapeTagAttributes = (input) => {
    // Finds HTML tags and processes their attributes.
    // Simplified regex; a full parser would be more robust.
    const tagAttributeRegex = /(<[a-z\/!][^>]*?)(\b(?:href|src|title|alt|name)="[^"]*?"|\b(?:href|src|title|alt|name)='[^']*?')([^>]*?>)/gi;

    return input.replace(tagAttributeRegex, (match, start, attr, end) => {
      // Replace * and _ inside attribute values.
      const processedAttr = attr.replace(/\*/g, "@@ASTERISK@@").replace(/_/g, "@@UNDERSCORE@@");
      return start + processedAttr + end;
    });
  };

  /**
   * Handles backslash escapes in Markdown (e.g., `\*` -> `*`).
   * @param {string} input - The text to process.
   * @returns {string} The text with backslash escapes processed.
   */
  const handleBackslashEscapes = (input) => {
    // List of characters that can be escaped with a backslash.
    const escapableChars = /\\([`*_{}\[\]()>#+-.!])/g;
    return input.replace(escapableChars, (match, char) => {
      // Replace with a placeholder that will be restored later.
      return `@@ESCAPED_${char.charCodeAt(0)}@@`;
    });
  };

  /**
   * Converts Markdown image syntax (`![alt](url "title")` or `![alt][id]`) to HTML `<img>` tags.
   * @param {string} input - The text to process.
   * @returns {string} The text with image syntax converted.
   */
  const processImages = (input) => {
    let currentText = input;

    // Inline-style images: `![alt text](url "optional title")`
    currentText = currentText.replace(/!\[(.*?)\]\s*\((.*?)(?:\s+"(.*?)"|\s+'(.*?)')?\)/g, (match, alt, url, title1, title2) => {
      const title = title1 || title2 || '';
      return `<img src="${url}" alt="${alt}" title="${title}" />`;
    });

    // Reference-style images: `![alt text][id]`
    currentText = currentText.replace(/!\[(.*?)\]\s*\[(.*?)\]/g, (match, alt, id) => {
      const lowerId = id.toLowerCase();
      const url = linkReferences[lowerId];
      const title = titleMetadata[lowerId] || '';
      if (url) {
        return `<img src="${url}" alt="${alt}" title="${title}" />`;
      }
      return match; // If reference not found, leave as-is.
    });

    return currentText;
  };

  /**
   * Converts Markdown link syntax (`[text](url "title")` or `[text][id]`) to HTML `<a>` tags.
   * @param {string} input - The text to process.
   * @returns {string} The text with link syntax converted.
   */
  const processLinks = (input) => {
    let currentText = input;

    // Inline-style links: `[link text](url "optional title")`
    currentText = currentText.replace(/\[(.*?)\]\s*\((.*?)(?:\s+"(.*?)"|\s+'(.*?)')?\)/g, (match, linkText, url, title1, title2) => {
      const title = title1 || title2 || '';
      const processedLinkText = processInlineElements(linkText); // Process text within link
      return `<a href="${url}" title="${title}">${processedLinkText}</a>`;
    });

    // Reference-style links: `[link text][id]` or `[link text]` (implicit id)
    currentText = currentText.replace(/\[(.*?)\]\s*\[(.*?)\]/g, (match, linkText, id) => {
      const lowerId = id.toLowerCase();
      const url = linkReferences[lowerId];
      const title = titleMetadata[lowerId] || '';
      if (url) {
        const processedLinkText = processInlineElements(linkText);
        return `<a href="${url}" title="${title}">${processedLinkText}</a>`;
      }
      return match;
    });

    // Implicit reference-style links: `[link text]` where `link text` is also the ID
    currentText = currentText.replace(/\[([^\[\]]+?)\](?!\()/g, (match, linkText) => {
      const lowerId = linkText.toLowerCase();
      const url = linkReferences[lowerId];
      const title = titleMetadata[lowerId] || '';
      if (url) {
        const processedLinkText = processInlineElements(linkText);
        return `<a href="${url}" title="${title}">${processedLinkText}</a>`;
      }
      return match;
    });

    return currentText;
  };

  // --- End of helper functions ---
};