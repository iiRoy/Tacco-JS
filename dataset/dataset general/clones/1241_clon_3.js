(function (globalScope) {
'use strict';

// This module provides utilities for parsing a structured text format.
// Original author: Jak Wings, circa 2014.
// Adapted and refactored for improved readability and maintainability.

/*
 * Section: Core Utility Methods
 * These functions handle common text manipulation tasks like escaping,
 * string formatting, object merging, and basic string splitting.
 */

const textSanitizer = function (inputString, allowPartialEntities = false) {
  // Converts special characters in a string to their HTML entity equivalents.
  // If `allowPartialEntities` is true, it preserves existing, valid named
  // or numeric entities, only escaping lone ampersands.
  return inputString
    .replace(allowPartialEntities ? /&(?!#?\w+;)/g : /&/g, '&amp;') // Safeguard against bare ampersands first.
    .replace(/[<>"']/g, function (charToReplace) {
      switch (charToReplace) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case '\'': return '&#39;'; // Using numeric entity for apostrophe.
        default: return charToReplace; // Should not happen.
      }
    });
};

const regexLiteralEscaper = function (inputStr) {
  // Escapes characters that have special meaning in regular expressions.
  // This ensures a string can be used directly within a RegExp constructor.
  return inputStr.replace(/([.\\+*?[\]$(){}^])/g, '\\$1');
};

const lineEndTrim = /^  *|(\\ )|  *$/gm; // Matches leading/trailing spaces, or escaped spaces.

const backslashEscape = /\\([-*+_.`~^":\[\]<>(){}|@&=#\\])/g;
const backslashEscapeWithSpace = /\\([ \-*+_.`~^":\[\]<>(){}|@&=#\\])/g; // Includes space in escaped chars.

/**
 * Consolidates properties from one or more source objects into a target object.
 * This performs a shallow merge, prioritizing properties from later arguments.
 * @param {object} primaryObject The object to which properties will be merged.
 * @param {...object} sourceObjects The objects whose properties will be copied.
 * @returns {object} The modified `primaryObject`.
 */
const combineObjects = function (primaryObject, ...sourceObjects) {
  if (typeof primaryObject !== 'object' || primaryObject === null) {
    throw new TypeError("First argument to combineObjects must be an object.");
  }
  for (const currentSource of sourceObjects) {
    if (typeof currentSource !== 'object' || currentSource === null) {
      continue; // Skip non-object sources.
    }
    for (const propKey in currentSource) {
      if (Object.prototype.hasOwnProperty.call(currentSource, propKey)) {
        primaryObject[propKey] = currentSource[propKey];
      }
    }
  }
  return primaryObject;
};

/**
 * Generates a string of spaces of a specified length.
 * @param {number|string} lengthOrString The desired number of spaces, or a string
 *   whose length will be used.
 * @returns {string} A string consisting solely of spaces.
 */
const createSpacePadding = function (lengthOrString) {
  let spaceCount;
  if (typeof lengthOrString === 'number') {
    spaceCount = Math.floor(lengthOrString);
  } else if (typeof lengthOrString === 'string') {
    spaceCount = lengthOrString.length;
  } else {
    return ''; // Invalid input, return empty string.
  }

  if (spaceCount <= 0) {
    return '';
  }

  // Using String.prototype.repeat for efficiency in modern environments.
  return ' '.repeat(spaceCount);
};

/**
 * Breaks down a table row string into individual cell components,
 * respecting `|` and `^` delimiters, and escaped delimiters.
 * @param {string} rowString The input string representing a table row.
 * @returns {Array<string>} An array of cell content strings and delimiters.
 *   Includes a custom `totalContentLength` property.
 */
const decomposeTableRow = function (rowString) {
  const partsArray = [];
  let currentPart = '';
  let lastChar = '';
  let contentLen = 0; // Tracks length of non-delimiter content.

  for (let idx = 0; idx < rowString.length; idx++) {
    const char = rowString.charAt(idx);

    // Check for unescaped delimiters.
    if ((char === '|' || char === '^') && lastChar !== '\\') {
      if (currentPart.length > 0) {
        partsArray.push(currentPart);
        currentPart = ''; // Reset for next part.
      }
      partsArray.push(char); // Add the delimiter itself.
    } else {
      currentPart += char;
      contentLen++; // Only count content characters.
    }
    lastChar = char; // Remember last character for escape checks.
  }

  if (currentPart.length > 0) {
    partsArray.push(currentPart);
  }

  // Attach a non-enumerable property for total content length.
  Object.defineProperty(partsArray, 'totalContentLength', {
    value: contentLen,
    writable: false,
    enumerable: false
  });

  return partsArray;
};

/**
 * Determines if all lines within a given text block match a specific indentation pattern.
 * @param {RegExp} indentPattern The regular expression to test each line against.
 * @param {string} textBlock A string that represents a block of text (potentially multiline).
 * @returns {boolean} True if every line in the block matches the indentation pattern, false otherwise.
 */
const checkBlockIndentation = function (indentPattern, textBlock) {
  // Split the block into lines and check if all lines pass the regex test.
  // An empty block or block with only blank lines might need special handling depending on `indentPattern`.
  const lines = textBlock.split('\n');
  if (lines.length === 0) return true; // Or false, depending on desired strictness for empty blocks.

  // Use `every` to ensure all lines conform.
  return lines.every(line => indentPattern.test(line));
};

/**
 * Divides a source string into an array of distinct "blocks".
 * Blocks are separated by one or more empty lines.
 * @param {string} sourceInput The raw string content to be processed.
 * @returns {Array<string>} An array where each element is either a content block
 *   or a block of blank lines.
 */
const segmentSourceIntoBlocks = function (sourceInput) {
  // Normalize line endings and remove leading blank lines from the whole source.
  let processedSource = sourceInput.replace(/\r\n|\r/g, '\n').replace(/^\s*\n(?:\s*\n)*/, '');

  // Regex to capture content followed by blank lines, or content at EOF.
  // `[\s\S]` is used for any character including newlines.
  const blockSeparatorRegex = /([\s\S]+?)(\n\s*\n(?:\s*\n)*|\n\s*$|$)/g;
  const collectedBlocks = [];
  let currentMatch;

  while ((currentMatch = blockSeparatorRegex.exec(processedSource)) !== null) {
    // `currentMatch[1]` contains the content block (non-blank lines).
    // `currentMatch[2]` contains the blank line separator (or end of string).
    if (currentMatch[1]) {
      collectedBlocks.push(currentMatch[1]);
    }
    if (currentMatch[2]) {
      collectedBlocks.push(currentMatch[2]);
    }
  }
  return collectedBlocks;
};


/*
 * Section: Block-Level Syntax Definitions
 * This section defines the regular expressions used to identify and parse
 * various block-level elements in the structured text format.
 * All `\r` and `\r\n` characters are assumed to have been normalized to `\n`.
 * Indentation must use space characters (U+0020).
 */
const blockSyntax = {
  // Regex for identifying a block composed solely of blank lines.
  // A blank line is one that contains only spaces or is entirely empty.
  emptyLines: /^\n/, // Simplified: Any line break signifies a potential blank line start.

  // End-of-block marker: A caret followed by optional spaces.
  blockTerminator: /^\^ *$/,

  // Macro definition: `<[content]>`
  // Content can include escaped characters.
  inlineMacro: /^<\[((?:\\.|[^\\\]])+?)\]> *$/,
  // For multi-line macros, capture the start and end separately.
  macroStart: /^<\[([\s\S]*)/,
  macroEnd: /(?:^|\n)\]> *$/,

  // Code blocks: Lines indented with 4 spaces.
  // Multiple such blocks separated by blank lines are conceptually joined.
  codeIndented: /^( {4})[^\n][^\n]*(?:\n\1[^\n][^\n]*)*$/,

  // Fenced code blocks: Delimited by three or more tildes (`~~~`).
  // The opening fence can specify a language. The closing fence must match
  // or exceed the length of the opening fence.
  // The block content is optional.
  delimitedCode: /^(~{3,})([^\n]*)(?:\n([\s\S]+?))?\n\1~* *$/,
  delimitedCodeStart: /^(~{3,})([^\n]*)/,
  delimitedCodeEnd: /(?:^|\n)(~{3,}) *$/,

  // Setext-style headings: Title followed by a line of `===` (level 1) or `---` (level 2).
  // Lazy syntax (line breaks in title) is supported.
  setextHeading: /^([\s\S]+?)\n(?:=+|---+)\s*$/,

  // ATX-style headings: One to six hash symbols (`#`) followed by the title.
  // Optional closing hashes are ignored.
  atxHeading: /^(#{1,6})(?!#)\s*((?:\\.|[^\\\#])+?)(?:#+\s*)?$/,

  // Blockquotes: Lines prefixed with `>`.
  // Subsequent lines can either start with `>` or be indented to the same
  // level as the content of the first line.
  blockQuotation: /^>\s*([^\n]*)(?:\n>(?:\s*\1[^\n]*|))*$/,

  // Horizontal rules: Three or more hyphens or asterisks, optionally separated by spaces.
  horizontalRule: /^(?:(?:- *){3,}|(?:\* *){3,})$/,

  // Unordered lists: Items starting with `+`, `-`, or `*`.
  unorderedList: /^[+\-*]\s/,

  // Ordered lists: Items starting with digits followed by a period.
  orderedList: /^\d+\.\s/,

  // Definition lists: Terms followed by definitions.
  // A term can span multiple lines if subsequent lines are not definitions.
  // Definitions start with `: `
  definitionList: /^([^: ][^\n]*(?:\n[^: ][^\n]*)*)\n(: [\s\S]*)$/,
  definitionEntry: /^:( {1,})[^\n]*(?:\n \1[^\n]*)*$/, // Specific definition line.
  definitionEntryPedantic: /^: {2,}[^\n]*(?:\n {4}[^\n]*)*$/, // Stricter definition style.

  // Link definitions: `:[id]: url "title"`
  // ID is case-insensitive, cannot start with `^`, `!`, or `*`.
  // URL cannot contain spaces. Title is optional, in double quotes.
  linkReference: /^:\[(?![\^*@])([^\[\]\n\\]+?)\]:\s*([^\s\n]+)(?:\n?\s*"((?:\\.|[^"\\\n])*)"\s*)?$/,
  // Compact link list (for initial matching).
  compactLinkRef: /^:\[(?![\^*@])[^\[\]\n\\]+?\]:\s/,

  // Abbreviation definitions: `*[id]: full phrase`
  // ID is case-sensitive. Full phrase can span multiple lines with indentation.
  abbreviationRef: /^\*\[([^\[\]\n\\]+?)\]:\s*([^\n]+(?:\n\s[^\n]+)*)$/,
  // Compact abbreviation list.
  compactAbbrRef: /^\*\[[^\[\]\n\\]+?\]:\s/,

  // Footnote definitions: `^[id]: content`
  // ID is case-insensitive. Content can be inline or block-level (indented 4 spaces).
  blockFootnote: /^\^\[([^\[\]\n\\]+?)\]:\s*((?:\n {4}[^\n]+)+)$/, // Block-level content.
  inlineFootnote: /^\^\[([^\[\]\n\\]+?)\]:\s*([^\n]+(?:\n\s[^\n]+)*)$/, // Inline content.
  // Compact footnote list.
  compactFootnoteRef: /^\^\[[^\[\]\n\\]+?\]:\s/,

  // Image definitions: `@![id]: url [size][:float] "title"`
  // ID is case-insensitive. Size and float are optional. Title optional.
  imageReference: /^@\[([^\[\]\n\\]+?)\]:\s*([^\s\n]+)(?:\n?\s*([^"',:;\n\}]+,[^"',:;\n\}]+)?(:left|:right)?)?(?:\n?\s*"((?:\\.|[^"\\\n])*)"\s*)?$/,
  // Compact image list.
  compactImageRef: /^@\[[^\[\]\n\\]+?\]:\s/,

  // Standalone figures (image with caption, outside paragraph).
  // `[caption]@<url [size][:float] "title">`
  figureBlock: /^\[((?:\\.|[^\\\]])+?)\]@<([^\s\n]+)(?:\s*\n?\s*([^"',:;\n\}]+,[^"',:;\n\}]+)?(:left|:right)?)?(?:\s*\n?\s*"((?:\\.|[^"\\\n])*)"\s*)?>\s*$/,
  compactFigureBlock: /^\[(?:\\.|[^\\\]])+?\]@<[^\s\n]/,

  // Tables: A complex structure combining DokuWiki and PHP Markdown Extra features.
  // Simplified match for the overall table structure.
  // It starts and ends with `+---` or `+===` lines, and contains rows with `|` or `^`.
  tableBlock: /^\+(?:-+|=+)\+(?:\s*\n[\^|][^\n]+[\^|]\s*)*\n\+(?:-+)\+\s*$/,
  tableLineSeparator: /^([\^|+])(?:-+|=+)([\^|+])\s*$/,

  // Paragraphs: Any consecutive lines that are not part of another block element.
  paragraphText: /^[^\n][^\n]*(?:\n[^\n][^\n]*)*$/,

  // Sub-indented blocks: Generic block indented by some number of spaces.
  // The indentation level is captured and reused for subsequent lines.
  subIndentedContent: /^( {1,})[^\n][^\n]*(?:\n\1[^\n][^\n]*)*$/
};

/*
 * Section: Lexical Analysis Rules (Block-Level)
 * Defines the order in which block-level syntax patterns are attempted.
 * Rules are prioritized to avoid ambiguity (e.g., code blocks before paragraphs).
 */
blockSyntax.processingOrder = {
  // Higher priority rules first.
  codeIndented: [0, blockSyntax.codeIndented],
  blockTerminator: [1, blockSyntax.blockTerminator],
  delimitedCode: [2, blockSyntax.delimitedCodeStart],
  setextHeading: [3, blockSyntax.setextHeading],
  atxHeading: [4, blockSyntax.atxHeading],
  blockQuotation: [5, blockSyntax.blockQuotation],
  horizontalRule: [6, blockSyntax.horizontalRule],
  unorderedList: [7, blockSyntax.unorderedList],
  orderedList: [8, blockSyntax.orderedList],
  compactLinkRef: [9, blockSyntax.compactLinkRef], // Match compact first, then full.
  compactImageRef: [10, blockSyntax.compactImageRef],
  compactFigureBlock: [11, blockSyntax.compactFigureBlock],
  blockFootnote: [12, blockSyntax.blockFootnote], // Block-level footnotes before inline.
  compactFootnoteRef: [13, blockSyntax.compactFootnoteRef],
  abbreviationRef: [14, blockSyntax.compactAbbrRef], // Compact first.
  tableBlock: [15, blockSyntax.tableBlock],
  definitionList: [16, blockSyntax.definitionList],
  inlineMacro: [17, blockSyntax.macroStart], // Macro start before full macro.
  paragraphText: [18, blockSyntax.paragraphText] // Paragraph is catch-all, lowest priority.
};


/*
 * Section: Block Lexer Implementation
 * The main component responsible for tokenizing the input source into
 * block-level elements based on the defined syntax rules.
 */

/**
 * Creates a new BlockLexer instance.
 * @class
 * @param {object} [lexerOptions] Configuration options for the lexer.
 */
const BlockStructureLexer = function (lexerOptions) {
  // Validate input options, or use a default empty object.
  if (typeof lexerOptions !== 'object' || lexerOptions === null) {
    lexerOptions = {};
  }

  // Merge provided options with global defaults (assuming `strictdown` exists globally).
  // If `strictdown` or `strictdown.defaults` is not available, fall back to an empty object.
  this.parserConfig = combineObjects({}, globalScope.strictdown?.defaults || {}, lexerOptions);

  this.blockRules = blockSyntax.processingOrder; // Reference to the prioritized rules.
  this.generatedTokens = []; // Array to store the lexed tokens.

  // Initialize special token storage.
  this.generatedTokens.linkDefinitions = {};
  this.generatedTokens.imageDefinitions = {};
  this.generatedTokens.abbrDefinitions = {};
  this.generatedTokens.footnoteDefinitions = {};
  this.generatedTokens.headingList = []; // To track headings for TOC generation.

  // For debugging or introspection: collect rule names.
  const activeRuleNames = [];
  for (const ruleKey in this.blockRules) {
    if (Object.prototype.hasOwnProperty.call(this.blockRules, ruleKey)) {
      activeRuleNames.push(ruleKey);
    }
  }
  // This `activeRuleNames` array is currently unused but demonstrates an added fragment.
};

// ... further methods for BlockStructureLexer would follow here ...
// (e.g., `tokenize`, `parseBlock`, etc.)

// Expose the lexer and its components globally or via a module pattern.
// Assuming the original `strictdown` object exists.
// This part mimics the original IIFE structure.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BlockStructureLexer,
    blockSyntax,
    textSanitizer,
    regexLiteralEscaper,
    combineObjects,
    createSpacePadding,
    decomposeTableRow,
    checkBlockIndentation,
    segmentSourceIntoBlocks
  };
} else {
  // Attach to the global object if not using CommonJS.
  // If 'strictdown' is not defined, create a stub or throw an error.
  globalScope.strictdown = globalScope.strictdown || {};
  globalScope.strictdown.BlockStructureLexer = BlockStructureLexer;
  globalScope.strictdown.blockSyntax = blockSyntax;
  // Expose helpers if they are intended to be public.
  globalScope.strictdown.helpers = {
    textSanitizer,
    regexLiteralEscaper,
    combineObjects,
    createSpacePadding,
    decomposeTableRow,
    checkBlockIndentation,
    segmentSourceIntoBlocks
  };
}

}(typeof window !== 'undefined' ? window : global));