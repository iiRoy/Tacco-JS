// Copyright (c) 2006 Alpha-Beta Corp.
//
// This software is licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at:
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview
 * A collection of utilities designed for client-side code highlighting within web documents.
 * <p>
 * This lexer is designed to operate effectively on a variety of programming languages,
 * including, but not limited to, C, Java, Python, Bash, SQL, HTML, XML, CSS, JavaScript, and Makefiles.
 * It also offers reasonable support for Ruby, PHP, Awk, and a subset of Perl.
 * However, due to differing commenting conventions, it may not function optimally
 * with Smalltalk, Lisp-like, or CAML-like languages without explicit language class declarations.
 * <p>
 * To utilize this library:
 * <ol>
 * <li> Integrate this script into your HTML page:
 *   {@code <script type="text/javascript" src="/path/to/my-code-formatter.js"></script>}
 * <li> Establish appropriate styling rules. Refer to example stylesheets for guidance.
 * <li> Mark {@code <pre>} and {@code <code>} elements that contain code with
 *    {@code class="code-highlight"}.
 *    Note: The deprecated {@code <xmp>} tag can also be used, but this requires more
 *    extensive DOM manipulation by the formatter, which might affect some CSS styles.
 * </ol>
 * The API is intentionally straightforward; language detection is automatic.
 * However, you can explicitly specify a language by adding a class like
 * {@code <pre class="code-highlight lang-java">}. Any class name beginning with
 * "lang-" followed by a file extension will indicate the language type.
 * Consult the "lang-*.js" files for specific language handler implementations.
 * <p>
 * Recent Updates:<br>
 * jsmith, 2006/08/22
 * <blockquote>
 *   Java annotations (beginning with "@") are now correctly identified as literals ("lit").
 * </blockquote>
 * @requires console
 */

/*global console, document, navigator, setTimeout, window */

/**
 * Controls whether the highlighting process is split into multiple asynchronous tasks
 * to prevent blocking the UI.
 * If set to {@code false}, the {@code prettifyAllBlocks()} function executes synchronously.
 * Default is {@code true}.
 */
window['G_USE_ASYNC_PROCESS'] = true;

/** Defines the number of spaces equivalent to a tab character. */
window['G_INDENT_SIZE'] = 4;

/**
 * Converts a DOM node into its standardized HTML string representation.
 * @param {Node} domNode The DOM element to process.
 * @param {Array.<string>} outputBuffer An array to accumulate HTML string fragments.
 */
window['G_STANDARDIZED_HTML']

/** A global object providing functions for registering and managing language processors.
  * @type {Object}
  */
  = window['G_PRETTIFIER_LIB']

/** Formats a single string of code.
  *
  * @param {string} rawSourceCodeHtml The code input as HTML.
  * @return {string} The formatted code, also as HTML.
  */
  = window['prettifySingleBlock']
/** Scans the document for {@code <pre>} and {@code <code>} elements marked with
  * {@code class="code-highlight"} and applies syntax highlighting.
  * @param {Function?} completionCallback An optional function to execute once all elements have been processed.
  */
  = window['prettifyAllBlocks'] = undefined;

/**
 * Checks if the current browser is an older version of Internet Explorer (IE6/7/8).
 * @extern
 * @returns {number|boolean} The major version number if IE6/7/8, otherwise {@code false}.
 */
window['_detectOldIE'] = function () {
  let browserUserAgent = navigator && navigator.userAgent;
  let ieMatch = browserUserAgent && browserUserAgent.match(/\bMSIE ([678])\./);
  let detectedVersion = ieMatch ? parseInt(ieMatch[1], 10) : false;

  // Cache the result for subsequent calls.
  window['_detectOldIE'] = function () { return detectedVersion; };
  return detectedVersion;
};


(function () {
  // Collection of keywords for various programming language contexts.
  const CONTROL_STRUCTURE_TOKENS = "break continue do else for if return while ";
  const C_LANG_TOKENS = CONTROL_STRUCTURE_TOKENS + "auto case char const default " +
      "double enum extern float goto int long register short signed sizeof " +
      "static struct switch typedef union unsigned void volatile ";
  const BASE_LANG_TOKENS = C_LANG_TOKENS + "catch class delete false import " +
      "new operator private protected public this throw true try typeof ";
  const CPP_LANG_TOKENS = BASE_LANG_TOKENS + "alignof align_union asm axiom bool " +
      "concept concept_map const_cast constexpr decltype " +
      "dynamic_cast explicit export friend inline late_check " +
      "mutable namespace nullptr reinterpret_cast static_assert static_cast " +
      "template typeid typename using virtual wchar_t where ";
  const JAVA_LANG_TOKENS = BASE_LANG_TOKENS +
      "abstract boolean byte extends final finally implements import " +
      "instanceof null native package strictfp super synchronized throws " +
      "transient ";
  const CSHARP_LANG_TOKENS = JAVA_LANG_TOKENS +
      "as base by checked decimal delegate descending event " +
      "fixed foreach from group implicit in interface internal into is lock " +
      "object out override orderby params partial readonly ref sbyte sealed " +
      "stackalloc string select uint ulong unchecked unsafe ushort var ";
  const JS_SCRIPT_TOKENS = BASE_LANG_TOKENS +
      "debugger eval export function get null set undefined var with " +
      "Infinity NaN ";
  const PERL_LANG_TOKENS = "caller delete die do dump elsif eval exit foreach for " +
      "goto if import last local my next no our print package redo require " +
      "sub undef unless until use wantarray while BEGIN END ";
  const PYTHON_LANG_TOKENS = CONTROL_STRUCTURE_TOKENS + "and as assert class def del " +
      "elif except exec finally from global import in is lambda " +
      "nonlocal not or pass print raise try with yield " +
      "False True None ";
  const RUBY_LANG_TOKENS = CONTROL_STRUCTURE_TOKENS + "alias and begin case class def" +
      " defined elsif end ensure false in module next nil not or redo rescue " +
      "retry self super then true undef unless until when yield BEGIN END ";
  const SHELL_LANG_TOKENS = CONTROL_STRUCTURE_TOKENS + "case done elif esac eval fi " +
      "function in local set then until ";

  // Combine all keyword lists for a comprehensive set.
  const GLOBAL_KEYWORD_SET = (
      CPP_LANG_TOKENS + CSHARP_LANG_TOKENS + JS_SCRIPT_TOKENS + PERL_LANG_TOKENS +
      PYTHON_LANG_TOKENS + RUBY_LANG_TOKENS + SHELL_LANG_TOKENS);

  // CSS class names for different syntax highlighting elements.
  /** Style for string literals */
  const SYNTAX_STRING = 'str';
  /** Style for keywords */
  const SYNTAX_KEYWORD = 'kwd';
  /** Style for comments */
  const SYNTAX_COMMENT = 'com';
  /** Style for type declarations */
  const SYNTAX_TYPE = 'typ';
  /** Style for literal values (e.g., numbers, booleans, null) */
  const SYNTAX_LITERAL = 'lit';
  /** Style for punctuation characters */
  const SYNTAX_PUNCTUATION = 'pun';
  /** Default style for plain text or unknown tokens */
  const SYNTAX_PLAIN = 'pln';

  /** Style for SGML/XML/HTML tags */
  const SYNTAX_TAG = 'tag';
  /** Style for markup declarations like DOCTYPE */
  const SYNTAX_DECLARATION = 'dec';
  /** Style for embedded source code within markup */
  const SYNTAX_SOURCE_EMBEDDED = 'src';
  /** Style for SGML/XML/HTML attribute names */
  const SYNTAX_ATTRIBUTE_NAME = 'atn';
  /** Style for SGML/XML/HTML attribute values */
  const SYNTAX_ATTRIBUTE_VALUE = 'atv';

  /**
   * A class indicating a section of markup that should not be treated as code,
   * useful for embedding line numbers or other non-code content.
   */
  const SYNTAX_NON_CODE = 'nocode';

  /**
   * Regular expression pattern to identify tokens that can precede a JavaScript regular expression literal.
   * This list is carefully curated to avoid issues with similar tokens in other languages.
   * @private
   */
  const REGEX_PREFIX_EXPRESSION = (function buildRegexPrecederPattern() {
      const allowedPreceders = [
          "!", "!=", "!==", "#", "%", "%=", "&", "&&", "&&=",
          "&=", "(", "*", "*=", "+=", /* removed +, handled by leading pattern */
          ",", "-=", /* removed -, handled by leading pattern */
          "->", /*".", "..", "...", handled separately if needed */
          "/", "/=", ":", "::", ";",
          "<", "<<", "<<=", "<=", "=", "==", "===", ">",
          ">=", ">>", ">>=", ">>>", ">>>=", "?", "@", "[",
          "^", "^=", "^^", "^^=", "{", "|", "|=", "||",
          "||=", "~", // Covers =~ and !~
          "break", "case", "continue", "delete",
          "do", "else", "finally", "instanceof",
          "return", "throw", "try", "typeof"
      ];

      // Start with a pattern that matches the beginning of input OR a leading plus/minus.
      let combinedPattern = '(?:^^|[+-]';
      for (let i = 0; i < allowedPreceders.length; ++i) {
          // Escape special characters in the preceders.
          combinedPattern += '|' + allowedPreceders[i].replace(/([^=<>:&a-z])/g, '\\$1');
      }
      combinedPattern += ')\\s*'; // Matches at the end, and also handles trailing whitespace.
      return combinedPattern;
      // Note: This pattern does not correctly handle cases where one regex immediately follows another,
      // as regex flags might interfere. This is generally not a valid construct in most languages.
      // Future improvement: Consider styling special characters within a regex as punctuation.
  })();

  // Pre-compiled regular expressions for HTML entity escaping/unescaping to improve performance.
  const htmlAmpersand = /&/g;
  const htmlLessThan = /</g;
  const htmlGreaterThan = />/g;
  const htmlDoubleQuote = /"/g;

  /**
   * Escapes HTML special characters for use within an HTML attribute value.
   * @param {string} inputString The string to escape.
   * @returns {string} The escaped string.
   */
  function escapeForAttribute(inputString) {
    return inputString.replace(htmlAmpersand, '&amp;')
        .replace(htmlLessThan, '&lt;')
        .replace(htmlGreaterThan, '&gt;')
        .replace(htmlDoubleQuote, '&quot;');
  }

  /**
   * Escapes HTML special characters for use within general HTML text content.
   * @param {string} inputString The string to escape.
   * @returns {string} The escaped string.
   */
  function escapeForTextContent(inputString) {
    return inputString.replace(htmlAmpersand, '&amp;')
        .replace(htmlLessThan, '&lt;')
        .replace(htmlGreaterThan, '&gt;');
  }

  const entityLt = /&lt;/g;
  const entityGt = /&gt;/g;
  const entityApos = /&apos;/g;
  const entityQuot = /&quot;/g;
  const entityAmp = /&amp;/g;
  const entityNbs = /&nbsp;/g;

  /**
   * Unescapes common HTML entities back into plain text characters.
   * Handles numeric entities (decimal and hexadecimal) as well.
   * @param {string} htmlInput The HTML string containing entities.
   * @returns {string} The unescaped plain text string.
   */
  function unescapeHtmlEntities(htmlInput) {
    let currentHtml = htmlInput;
    let entityPos = currentHtml.indexOf('&');

    if (entityPos < 0) {
      return currentHtml; // No entities found, return early.
    }

    // Process numeric entities first, as they are more complex.
    // Loop continues as long as a numeric entity start is found.
    for (let currentSearchPos = entityPos; (currentSearchPos = currentHtml.indexOf('&#', currentSearchPos)) >= 0;) {
      let entityEndPos = currentHtml.indexOf(';', currentSearchPos);
      if (entityEndPos >= 0) {
        let numStr = currentHtml.substring(currentSearchPos + 3, entityEndPos);
        let numericBase = 10;
        if (numStr && numStr.charAt(0) === 'x') {
          numStr = numStr.substring(1);
          numericBase = 16;
        }
        let codeValue = parseInt(numStr, numericBase);
        if (!isNaN(codeValue)) {
          currentHtml = currentHtml.substring(0, currentSearchPos) +
                        String.fromCharCode(codeValue) +
                        currentHtml.substring(entityEndPos + 1);
        }
        // Adjust search position to avoid re-processing the same area.
        currentSearchPos = currentSearchPos + 1;
      } else {
        // No closing semicolon, skip this potential entity.
        currentSearchPos = currentSearchPos + 1;
      }
    }

    // Process named entities.
    return currentHtml.replace(entityLt, '<')
        .replace(entityGt, '>')
        .replace(entityApos, "'")
        .replace(entityQuot, '"')
        .replace(entityNbs, ' ')
        .replace(entityAmp, '&');
  }

  /**
   * Determines if a given DOM node's innerHTML should be treated as raw content
   * (i.e., not automatically escaped by the browser for display).
   * @param {Node} elementNode The DOM node to check.
   * @returns {boolean} True if the node is an XMP tag, false otherwise.
   */
  function isRawMarkupElement(elementNode) {
    return elementNode.tagName === 'XMP';
  }

  const lineBreakRegex = /[\r\n]/g;

  /**
   * Checks if the whitespace and line breaks within a node's content are significant
   * (i.e., if the node is treated as preformatted text).
   * @param {Node} elementNode The node to inspect.
   * @param {string} nodeContent The textual content of the node.
   * @returns {boolean} True if the content is preformatted, false otherwise.
   */
  function isPreformattedBlock(elementNode, nodeContent) {
    // PRE tags are inherently preformatted. This is a common and quick check.
    if (elementNode.tagName === 'PRE') { return true; }
    // If no line breaks exist, preformatting doesn't matter for this content.
    if (!lineBreakRegex.test(nodeContent)) { return true; }

    let computedWhitespaceStyle = '';
    // Check for `currentStyle` (IE specific) or `getComputedStyle` (standard).
    if (elementNode.currentStyle) {
      computedWhitespaceStyle = elementNode.currentStyle.whiteSpace;
    } else if (window.getComputedStyle) {
      computedWhitespaceStyle = window.getComputedStyle(elementNode, null).whiteSpace;
    }
    // If the style is 'pre', or if it's not explicitly overridden, it's considered preformatted.
    return !computedWhitespaceStyle || computedWhitespaceStyle === 'pre';
  }

  /**
   * Recursively traverses a DOM node and its children, converting it into a
   * standardized HTML string representation, optionally sorting attributes.
   * @param {Node} domNode The starting DOM node.
   * @param {Array.<string>} outputBuffer Array to append HTML string fragments.
   * @param {boolean} [shouldSortAttributes=false] Whether to sort attributes alphabetically.
   */
  function standardizeDomOutput(domNode, outputBuffer, shouldSortAttributes) {
    switch (domNode.nodeType) {
      case Node.ELEMENT_NODE: // An element node (e.g., <div>, <p>)
        let elementName = domNode.tagName.toLowerCase();
        outputBuffer.push('<', elementName);

        let elementAttrs = domNode.attributes;
        let attributeCount = elementAttrs.length;

        if (attributeCount > 0) {
          let attributesToProcess = Array.from(elementAttrs); // Convert NamedNodeMap to Array

          if (shouldSortAttributes) {
            attributesToProcess.sort((attrA, attrB) => {
                const nameA = attrA.name.toLowerCase();
                const nameB = attrB.name.toLowerCase();
                if (nameA < nameB) return -1;
                if (nameA > nameB) return 1;
                return 0; // names are equal
            });
          }

          attributesToProcess.forEach(attr => {
            // Check if attribute is specified (relevant for older browsers, for consistency)
            if (attr.specified) {
              outputBuffer.push(' ', attr.name.toLowerCase(),
                               `="${escapeForAttribute(attr.value)}"`);
            }
          });
        }
        outputBuffer.push('>');

        // Recursively process child nodes.
        for (let childElement = domNode.firstChild; childElement; childElement = childElement.nextSibling) {
          standardizeDomOutput(childElement, outputBuffer, shouldSortAttributes);
        }

        // Close the tag for non-self-closing elements or if it has children.
        const isSelfClosing = /^(?:br|link|img|input|hr|meta)$/.test(elementName);
        if (domNode.firstChild || !isSelfClosing) {
          outputBuffer.push('</', elementName, '>');
        }
        break;
      case Node.TEXT_NODE:
      case Node.CDATA_SECTION_NODE: // Text or CDATA section
        outputBuffer.push(escapeForTextContent(domNode.nodeValue));
        break;
      // Other node types (e.g., comments, processing instructions) are ignored for this output.
    }
  }

  /**
   * Takes an array of regular expressions and combines their patterns into a single
   * global regular expression that matches the union of their individual patterns.
   * Start-of-input anchors (^) in the individual regexes are disregarded.
   * @param {Array<RegExp>} inputRegexes An array of non-global, non-multiline regex patterns.
   * @returns {RegExp} A new global regular expression.
   */
  function mergeRegexPatterns(inputRegexes) {
    let currentCapturedGroupCount = 0; // Tracks total capturing groups.
    let requiresCaseFolding = false;
    let overallIgnoreCase = false;

    // Determine if case-folding is necessary across all patterns.
    for (let i = 0; i < inputRegexes.length; ++i) {
      const currentRegex = inputRegexes[i];
      if (currentRegex.ignoreCase) {
        overallIgnoreCase = true;
      } else if (/[a-z]/i.test(currentRegex.source.replace(
                     /\\u[0-9a-f]{4}|\\x[0-9a-f]{2}|\\[^ux]/gi, ''))) {
        requiresCaseFolding = true;
        overallIgnoreCase = false; // If one regex needs folding, we can't just use ignoreCase flag.
        break;
      }
    }

    /**
     * Converts an escape sequence (e.g., '\b', '\x20', '\u00A0') into its corresponding character code.
     * @param {string} escapePart The escape sequence string.
     * @returns {number} The character code.
     */
    function parseCharCodeFromEscape(escapePart) {
      if (escapePart.charAt(0) !== '\\') { return escapePart.charCodeAt(0); } // Not an escape.
      const charAfterBackslash = escapePart.charAt(1);
      switch (charAfterBackslash) {
        case 'b': return 8;  // Backspace
        case 't': return 9;  // Tab
        case 'n': return 0xA; // Newline
        case 'v': return 0xB; // Vertical tab
        case 'f': return 0xC; // Form feed
        case 'r': return 0xD; // Carriage return
        case 'u': // Unicode escape \uXXXX
        case 'x': // Hex escape \xXX
          return parseInt(escapePart.substring(2), 16) || charAfterBackslash.charCodeAt(0);
        case '0': case '1': case '2': case '3': case '4':
        case '5': case '6': case '7': // Octal escape \0XX
          return parseInt(escapePart.substring(1), 8);
        default: return charAfterBackslash.charCodeAt(0); // Any other escaped character
      }
    }

    /**
     * Converts a character code into an escaped string representation suitable for regex character classes.
     * @param {number} charCode The character code.
     * @returns {string} The escaped character string.
     */
    function generateEscapeSequence(charCode) {
      if (charCode < 0x20) { // Control characters
        return (charCode < 0x10 ? '\\x0' : '\\x') + charCode.toString(16);
      }
      let charStr = String.fromCharCode(charCode);
      // Escape special regex characters within a character class.
      if (charStr === '\\' || charStr === '-' || charStr === '[' || charStr === ']') {
        charStr = '\\' + charStr;
      }
      return charStr;
    }

    /**
     * Modifies a character set string (e.g., `[a-z]`) to include its case-folded equivalents.
     * For example, `[a-z]` becomes `[a-zA-Z]`.
     * @param {string} charSetExpression The character set string, e.g., `[a-z]` or `[^0-9]`.
     * @returns {string} The case-folded character set.
     */
    function normalizeCaseCharset(charSetExpression) {
      const charsetTokenPattern = new RegExp(
          '\\\\u[0-9A-Fa-f]{4}'        // Unicode escape
          + '|\\\\x[0-9A-Fa-f]{2}'      // Hex escape
          + '|\\\\[0-3][0-7]{0,2}'      // Octal escape (up to 3 digits)
          + '|\\\\[0-7]{1,2}'           // Octal escape (1 or 2 digits)
          + '|\\\\[\\s\\S]'             // Any other escaped character
          + '|-'                        // Literal hyphen
          + '|[^-\\\\]',                 // Any character not a hyphen or backslash
          'g');

      const charSetParts = charSetExpression.substring(1, charSetExpression.length - 1).match(charsetTokenPattern);

      const symbolicGroups = []; // Stores '\d', '\w', etc.
      const charRanges = [];     // Stores [start, end] char code pairs.

      const isInverseSet = charSetParts[0] === '^';
      const startIndex = isInverseSet ? 1 : 0;

      for (let i = startIndex; i < charSetParts.length; ++i) {
        const currentPart = charSetParts[i];
        switch (currentPart) {
          case '\\B': case '\\b': case '\\D': case '\\d':
          case '\\S': case '\\s': case '\\W': case '\\w':
            symbolicGroups.push(currentPart);
            continue; // Move to the next part.
        }

        let rangeStart = parseCharCodeFromEscape(currentPart);
        let rangeEnd = rangeStart;

        // Check for hyphen to indicate a range (e.g., 'a-z').
        if (i + 2 < charSetParts.length && charSetParts[i + 1] === '-') {
          rangeEnd = parseCharCodeFromEscape(charSetParts[i + 2]);
          i += 2; // Skip the hyphen and the end of the range.
        }
        charRanges.push([rangeStart, rangeEnd]);

        // If the range contains letters, add their case-folded equivalents.
        // Example: if [A-Z] is present, add [a-z].
        if (!(rangeEnd < 65 || rangeStart > 122)) { // Only if it overlaps with [A-Za-z]
          // Add lowercase equivalent for uppercase letters
          if (!(rangeEnd < 65 || rangeStart > 90)) { // Overlaps with [A-Z]
            charRanges.push([Math.max(65, rangeStart) | 32, Math.min(rangeEnd, 90) | 32]);
          }
          // Add uppercase equivalent for lowercase letters
          if (!(rangeEnd < 97 || rangeStart > 122)) { // Overlaps with [a-z]
            charRanges.push([Math.max(97, rangeStart) & ~32, Math.min(rangeEnd, 122) & ~32]);
          }
        }
      }

      // Consolidate overlapping and adjacent character ranges.
      // E.g., [[1, 10], [3, 4], [8, 12], [14, 14], [16, 16], [17, 17]] -> [[1, 12], [14, 14], [16, 17]]
      charRanges.sort((a, b) => (a[0] - b[0]) || (b[1] - a[1])); // Sort by start, then by end (desc).

      const consolidatedRanges = [];
      let lastConsolidatedRange = [NaN, NaN]; // Sentinel for the first range.

      for (let j = 0; j < charRanges.length; ++j) {
        const currentRange = charRanges[j];
        if (currentRange[0] <= lastConsolidatedRange[1] + 1) {
          // Current range overlaps or is adjacent to the last consolidated range.
          lastConsolidatedRange[1] = Math.max(lastConsolidatedRange[1], currentRange[1]);
        } else {
          // Current range is distinct; start a new consolidated range.
          consolidatedRanges.push(lastConsolidatedRange = currentRange);
        }
      }

      // Reconstruct the character set string.
      const outputParts = ['['];
      if (isInverseSet) { outputParts.push('^'); }
      outputParts.push(...symbolicGroups); // Add symbolic groups like \d, \w.

      for (let k = 0; k < consolidatedRanges.length; ++k) {
        const range = consolidatedRanges[k];
        outputParts.push(generateEscapeSequence(range[0]));
        if (range[1] > range[0]) {
          if (range[1] + 1 > range[0]) { outputParts.push('-'); } // Only add hyphen if it's a true range.
          outputParts.push(generateEscapeSequence(range[1]));
        }
      }
      outputParts.push(']');
      return outputParts.join('');
    }

    /**
     * Preprocesses a regex pattern to:
     * 1. Remove start-of-input anchors (`^`).
     * 2. Case-fold character sets if required.
     * 3. Renumber capturing groups to be sequential across the combined pattern.
     * @param {RegExp} sourceRegex The original regular expression object.
     * @returns {string} The modified regex source string.
     */
    function adaptRegexGroupNumbers(sourceRegex) {
      // Breakdown regex into its constituent parts: character sets, escapes, group constructs, etc.
      const regexParts = sourceRegex.source.match(
          new RegExp(
              '(?:'
              + '\\[(?:[^\\x5C\\x5D]|\\\\[\\s\\S])*\\]'  // Character set: `[...]`
              + '|\\\\u[A-Fa-f0-9]{4}'                  // Unicode escape: `\uXXXX`
              + '|\\\\x[A-Fa-f0-9]{2}'                  // Hex escape: `\xXX`
              + '|\\\\[0-9]+'                            // Back-reference or octal escape
              + '|\\\\[^ux0-9]'                          // Other escape sequences
              + '|\\(\\?[:!=]'                           // Non-capturing group start: `(?:`, `(?=`, `(?!`
              + '|[\\(\\)\\^]'                           // Capturing group start/end, or line start anchor: `(`, `)`, `^`
              + '|[^\\x5B\\x5C\\(\\)\\^]+'               // Any other characters not special to this parsing
              + ')',
              'g'));

      const partCount = regexParts.length;
      const groupMap = []; // Maps original group index to new global index, or -1 if not needed.

      // First pass: identify capturing groups and map them.
      for (let i = 0, currentLocalGroupIndex = 0; i < partCount; ++i) {
        const currentPart = regexParts[i];
        if (currentPart === '(') {
          // This is a capturing group.
          groupMap[++currentLocalGroupIndex] = ++currentCapturedGroupCount;
        } else if (currentPart.substring(0, 2) === '(?:') {
          // Non-capturing group.
          // No change to currentLocalGroupIndex or currentCapturedGroupCount.
        } else {
          // Other parts, including back-references, will be handled in the second pass.
        }
      }

      // Second pass: rebuild the regex string with renumbered back-references and case-folding.
      const revisedParts = [];
      for (let i = 0, currentLocalGroupIndex = 0; i < partCount; ++i) {
        let currentPart = regexParts[i];
        if (currentPart === '(') {
          currentLocalGroupIndex++;
        } else if (currentPart.charAt(0) === '\\' && /\d/.test(currentPart.charAt(1))) {
          // This is a back-reference.
          const originalGroupNum = parseInt(currentPart.substring(1), 10);
          if (originalGroupNum > 0 && originalGroupNum <= currentLocalGroupIndex) {
            // Only renumber if it refers to a valid group within this regex.
            const newGlobalGroupNum = groupMap[originalGroupNum];
            if (newGlobalGroupNum) {
              currentPart = '\\' + newGlobalGroupNum;
            }
          }
        } else if (currentPart === '^') {
          // Remove start-of-input anchors.
          currentPart = '';
        } else if (requiresCaseFolding && currentPart.charAt(0) === '[') {
          currentPart = normalizeCaseCharset(currentPart);
        }
        revisedParts.push(currentPart);
      }
      return revisedParts.join('');
    }

    const finalPatternParts = [];
    inputRegexes.forEach(regex => {
      finalPatternParts.push(adaptRegexGroupNumbers(regex));
    });

    // Combine all modified patterns. The `g` flag is essential for global matching.
    return new RegExp(finalPatternParts.join('|'), overallIgnoreCase ? 'gi' : 'g');
  }

  // Placeholder for the actual PR object to be constructed.
  const prettyPrinter = window['G_PRETTIFIER_LIB'] = {};

  // Attach global functions to the window object.
  window['G_STANDARDIZED_HTML'] = standardizeDomOutput;
  // Other functions like prettifySingleBlock and prettifyAllBlocks would be defined here
  // and then attached to the window object. For now, they remain undefined as per the original.

})();