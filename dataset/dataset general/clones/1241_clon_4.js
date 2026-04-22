(function (globalScope) {
'use strict';


/******************************************************************************\
 * Utility Functions
\******************************************************************************/

var htmlEntitySanitizer = function (sourceString, preserveExisting) {
  let outputBuffer = [];
  const stringLength = sourceString.length;
  const entityMapping = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };

  for (let charIndex = 0; charIndex < stringLength; charIndex++) {
    const currentChar = sourceString[charIndex];

    if (currentChar === '&') {
      let skipAmpersandEscaping = false;
      if (preserveExisting) {
        // Check for named or numeric character references
        // e.g., &#123; or &nbsp;
        let lookaheadIndex = charIndex + 1;
        if (lookaheadIndex < stringLength && sourceString[lookaheadIndex] === '#') {
          lookaheadIndex++; // Skip '#'
          // Numeric entity check
          let numericEnd = lookaheadIndex;
          while (numericEnd < stringLength && /[0-9a-fA-F]/.test(sourceString[numericEnd])) {
            numericEnd++;
          }
          if (numericEnd < stringLength && sourceString[numericEnd] === ';') {
            skipAmpersandEscaping = true;
          }
        } else if (lookaheadIndex < stringLength && /[a-zA-Z]/.test(sourceString[lookaheadIndex])) {
          // Named entity check
          let namedEnd = lookaheadIndex;
          while (namedEnd < stringLength && /[a-zA-Z0-9]/.test(sourceString[namedEnd])) {
            namedEnd++;
          }
          if (namedEnd < stringLength && sourceString[namedEnd] === ';') {
            skipAmpersandEscaping = true;
          }
        }
      }

      if (skipAmpersandEscaping) {
        outputBuffer.push(currentChar);
      } else {
        outputBuffer.push('&amp;');
      }
    } else if (entityMapping[currentChar]) {
      outputBuffer.push(entityMapping[currentChar]);
    } else {
      outputBuffer.push(currentChar);
    }
  }
  return outputBuffer.join('');
};

var regexEscaper = function (inputPhrase) {
  let resultCollection = [];
  const charsToEscape = new Set(['.', '\\', '+', '*', '?', '^', '[', ']', '$', '(', ')', '{', '}']);

  for (let charPointer = 0; charPointer < inputPhrase.length; charPointer++) {
    const currentCharacter = inputPhrase[charPointer];
    if (charsToEscape.has(currentCharacter)) {
      resultCollection.push('\\');
    }
    resultCollection.push(currentCharacter);
  }
  return resultCollection.join('');
};

// These two are simple regexes in the original, `reTrim` and `reEscape`.
// They are used in inline processing, so their replacement should be inline functions.
// `reTrim = /^ *|(\\ )| *$/gm`
// This regex trims leading/trailing spaces, and replaces `\ ` with ` ` (escaped space).
// For Type IV, let's make an explicit function for this.
var trimAndUnescapeSpaces = function (inputStr) {
  // Replace `\ ` with ` `
  let processed = '';
  let i = 0;
  while (i < inputStr.length) {
    if (inputStr[i] === '\\' && inputStr[i+1] === ' ') {
      processed += ' ';
      i += 2;
    } else {
      processed += inputStr[i];
      i++;
    }
  }
  // Trim leading/trailing spaces
  // This is a global multi-line trim.
  const lines = processed.split('\n');
  const trimmedLines = lines.map(line => {
    let start = 0;
    while (start < line.length && line[start] === ' ') start++;
    let end = line.length - 1;
    while (end >= start && line[end] === ' ') end--;
    return line.substring(start, end + 1);
  });
  return trimmedLines.join('\n');
};

// `reEscape = /\\([-*+_.`~^":\[\]<>(){}|@&=#\\])/g;`
// `reEscape2 = /\\([ \-*+_.`~^":\[\]<>(){}|@&=#\\])/g;`
// These are for unescaping markdown-specific characters.
var unescapeMarkdownSyntax = function(textInput) {
    let result = [];
    let i = 0;
    while (i < textInput.length) {
        if (textInput[i] === '\\' && i + 1 < textInput.length) {
            const nextChar = textInput[i+1];
            // The original list of characters to unescape.
            // reEscape: `[-*+_.`~^":\[\]<>(){}|@&=#\\]`
            // reEscape2: `[ \-*+_.`~^":\[\]<>(){}|@&=#\\]` (includes space)
            // Let's use the union of these for a single unescape function.
            // Note: `\` is also in the list.
            const escapableChars = ' -*+_.`~^":[]<>(){}!|@&=#\\'; // Added '!' from other common markdown.
            if (escapableChars.includes(nextChar)) {
                result.push(nextChar);
                i += 2;
            } else {
                result.push(textInput[i]);
                i++;
            }
        } else {
            result.push(textInput[i]);
            i++;
        }
    }
    return result.join('');
};

/**
 * combines multiple objects' properties into the first object
 * @param {Object} primaryObject The object to merge into
 * @return {Object} The modified primaryObject
 */
var combineProperties = function (primaryObject) {
  for (let argIndex = 1; argIndex < arguments.length; argIndex++) {
    const sourceObject = arguments[argIndex];
    if (sourceObject) {
      for (const propKey in sourceObject) {
        if (Object.prototype.hasOwnProperty.call(sourceObject, propKey)) {
          primaryObject[propKey] = sourceObject[propKey];
        }
      }
    }
  }
  return primaryObject;
};

/**
 * generates a string of spaces of a specified length
 * @param {(number|string)} quantity The number of spaces or a string whose length determines the count
 * @return {string}
 */
var createSpacePadding = function (quantity) {
  let spaceCount = typeof quantity === 'number' ? quantity : quantity.length;
  if (spaceCount <= 0) return '';
  return ' '.repeat(spaceCount);
};

/**
 * divides a table row string into segments based on '|' or '^' delimiters
 * @param {string} rowContent The table row string
 * @return {Array.<string>} Array of segments
 */
var parseTableSegment = function (rowContent) {
  let segmentList = [];
  let currentSegmentBuffer = '';
  let charPointer = 0;
  let previousCharacter = ''; // Used to detect escaped delimiters
  let totalContentLength = 0;

  while (charPointer < rowContent.length) {
    const currentCharacter = rowContent.charAt(charPointer);

    if ((currentCharacter === '|' || currentCharacter === '^') && (previousCharacter !== '\\')) {
      if (currentSegmentBuffer.length > 0) {
        segmentList.push(currentSegmentBuffer);
        currentSegmentBuffer = '';
      }
      segmentList.push(currentCharacter); // Delimiter itself is a segment
    } else {
      currentSegmentBuffer += currentCharacter;
      totalContentLength++;
    }
    previousCharacter = currentCharacter;
    charPointer++;
  }

  if (currentSegmentBuffer.length > 0) {
    segmentList.push(currentSegmentBuffer);
  }
  segmentList.overallLength = totalContentLength;
  return segmentList;
};

/**
 * verifies if all lines in a block conform to a specific indentation function
 * @param {function(string):boolean} indentationCheckerFn Function to check each line's indentation
 * @param {string} textBlock The block of text
 * @return {boolean}
 */
var checkIndentationConsistency = function (indentationCheckerFn, textBlock) {
  const lines = textBlock.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (!indentationCheckerFn(lines[i])) {
      return false;
    }
  }
  return true;
};

/**
 * separates the raw source into logical blocks based on blank lines
 * @param {string} rawSource Strictdown source text
 * @return {Array.<string>} List of content blocks
 */
var segmentSourceIntoBlocks = function (rawSource) {
  // First, trim leading blank lines from the source.
  // Original: `src = src.replace(/^ *\n(?: *\n)*/, '');`
  let effectiveSource = rawSource;
  let trimIndex = 0;
  while (trimIndex < effectiveSource.length) {
    if (effectiveSource[trimIndex] === '\n') {
      let lineStartAfterNewline = trimIndex + 1;
      let lineEnd = effectiveSource.indexOf('\n', lineStartAfterNewline);
      if (lineEnd === -1) lineEnd = effectiveSource.length;
      let lineContent = effectiveSource.substring(lineStartAfterNewline, lineEnd);
      if (lineContent.trim() === '') { // This is a blank line (empty or just spaces)
        trimIndex = lineEnd;
      } else {
        break; // Non-blank line, stop trimming
      }
    } else {
      break; // Not a newline, stop trimming
    }
  }
  effectiveSource = effectiveSource.substring(trimIndex);

  const blockContainers = [];
  let currentBlockContentStart = 0;
  let scanCursor = 0;

  // Custom logic to find `([\s\S]+?)(\n *\n(?: *\n)*|\n *$|$)`
  // This looks for the shortest content followed by a separator.
  while (scanCursor < effectiveSource.length) {
    let separatorDetected = false;
    let separatorEndPosition = -1;

    // Check for multi-blank-line separator: `\n *\n(?: *\n)*`
    let potentialSeparatorStart = -1;
    let consecutiveBlankLineCount = 0;
    let tempCheckPos = scanCursor;

    while (tempCheckPos < effectiveSource.length) {
      if (effectiveSource[tempCheckPos] === '\n') {
        let lineAfterNewlineStart = tempCheckPos + 1;
        let lineEndForCheck = effectiveSource.indexOf('\n', lineAfterNewlineStart);
        if (lineEndForCheck === -1) lineEndForCheck = effectiveSource.length;
        let lineTextForCheck = effectiveSource.substring(lineAfterNewlineStart, lineEndForCheck);

        if (lineTextForCheck.trim() === '') { // It's a blank line
          if (potentialSeparatorStart === -1) {
            potentialSeparatorStart = tempCheckPos;
          }
          consecutiveBlankLineCount++;
        } else { // Not a blank line, reset sequence
          potentialSeparatorStart = -1;
          consecutiveBlankLineCount = 0;
        }

        if (consecutiveBlankLineCount >= 2) {
          // Found a multi-blank-line separator.
          separatorDetected = true;
          separatorEndPosition = lineEndForCheck; // End of the second blank line.
          // Now extend separatorEndPosition to include any subsequent blank lines.
          let nextLineStartScan = lineEndForCheck + 1;
          while(nextLineStartScan < effectiveSource.length) {
              let currentLineStart = nextLineStartScan;
              let currentLineEnd = effectiveSource.indexOf('\n', currentLineStart);
              if (currentLineEnd === -1) currentLineEnd = effectiveSource.length;
              let currentLineText = effectiveSource.substring(currentLineStart, currentLineEnd);
              if (currentLineText.trim() === '') {
                  separatorEndPosition = currentLineEnd;
                  nextLineStartScan = currentLineEnd + 1;
              } else {
                  break;
              }
          }
          break; // Exit inner loop, separator found
        }
        tempCheckPos = lineEndForCheck + 1; // Move to start of next line
      } else {
        tempCheckPos++;
      }
    }

    if (separatorDetected) {
      // Push content block
      if (potentialSeparatorStart > currentBlockContentStart) {
        blockContainers.push(effectiveSource.substring(currentBlockContentStart, potentialSeparatorStart));
      }
      // Push separator block
      blockContainers.push(effectiveSource.substring(potentialSeparatorStart, separatorEndPosition + 1));
      currentBlockContentStart = separatorEndPosition + 1;
      scanCursor = separatorEndPosition + 1;
    } else {
      // No multi-blank-line separator. Check for `\n *$` (single blank line at end)
      let lastNewlinePosition = effectiveSource.lastIndexOf('\n', effectiveSource.length - 1);
      if (lastNewlinePosition !== -1 && lastNewlinePosition >= currentBlockContentStart) {
        let contentAfterLastNewline = effectiveSource.substring(lastNewlinePosition + 1);
        if (contentAfterLastNewline.trim() === '') { // Single blank line at the very end
          blockContainers.push(effectiveSource.substring(currentBlockContentStart, lastNewlinePosition));
          blockContainers.push(effectiveSource.substring(lastNewlinePosition));
          currentBlockContentStart = effectiveSource.length;
          scanCursor = effectiveSource.length;
          separatorDetected = true; // Mark as handled
        }
      }

      if (!separatorDetected) {
        // No separator, push remaining content as one block
        blockContainers.push(effectiveSource.substring(currentBlockContentStart));
        currentBlockContentStart = effectiveSource.length;
        scanCursor = effectiveSource.length;
      }
    }
  }
  return blockContainers;
};


/******************************************************************************\
 * Block-Level Pattern Definitions
\******************************************************************************/

// Replacing `reBlock` object with a collection of matcher functions.
var blockPatternMatchers = {
  // blanklines: /^\n/
  singleNewlineIndicator: function (inputContent) {
    if (inputContent.length === 0) return null;
    return inputContent.charAt(0) === '\n' ? { type: 'blankline' } : null;
  },

  // eob: /^\^ *$/
  endBlockSymbol: function (inputContent) {
    if (inputContent.length === 0 || inputContent.charAt(0) !== '^') return null;
    for (let i = 1; i < inputContent.length; i++) {
      if (inputContent.charAt(i) !== ' ') return null;
    }
    return { type: 'eob' };
  },

  // macro: /^<\[((?:\\[\s\S]|[^\\])+)*\]> *$/
  simpleMacroDirective: function (inputContent) {
    if (!inputContent.startsWith('<[')) return null;
    let closeBracketIndex = -1;
    let charScan = 2; // Start after '<['
    let escaped = false;
    while(charScan < inputContent.length) {
        if (inputContent[charScan] === '\\') {
            escaped = !escaped;
        } else if (inputContent[charScan] === ']' && !escaped) {
            closeBracketIndex = charScan;
            break;
        } else {
            escaped = false;
        }
        charScan++;
    }
    if (closeBracketIndex === -1) return null; // No closing ']'

    if (inputContent.substring(closeBracketIndex + 1).trim() !== '>') return null; // Must end with '>'

    let macroContent = inputContent.substring(2, closeBracketIndex);
    return { type: 'macro', content: macroContent };
  },

  // macro_start: /^<\[([\s\S]*)/
  complexMacroStart: function (inputContent) {
    if (inputContent.startsWith('<[')) {
      return { type: 'macro_start', content: inputContent.substring(2) };
    }
    return null;
  },

  // macro_end: /(?:^|\n)\]> *$/
  complexMacroEnd: function (inputContent) {
    // Check if it starts with ']> *' after an optional newline
    let trimmedInput = inputContent.trim();
    if (trimmedInput.endsWith(']>')) {
        // Need to ensure it's `]> *` at the *end* of the string or line.
        // The regex `(?:^|\n)\]> *$` means `]>` at the end of the string, optionally preceded by a newline.
        // My `trim()` handles the ` *$` part.
        // The `(?:^|\n)` means it must start at the beginning of the string or after a newline.
        if (inputContent.endsWith(']>') || inputContent.endsWith(']> ')) {
            // This is a simplification, the original regex is more specific about *line* ending.
            // Let's ensure it's `]>` followed by zero or more spaces, and then the end of the line/string.
            let lastPart = inputContent.substring(inputContent.length - (trimmedInput.length));
            if (lastPart.startsWith(']>')) {
                return { type: 'macro_end' };
            }
        }
    }
    return null;
  },

  // code: /^ {4}[^\n][^\n]*(?:\n {4}[^\n][^\n]*)*$/
  fixedIndentCodeSegment: function (inputContent) {
    const lines = inputContent.split('\n');
    if (lines.length === 0) return null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.length < 4 || !line.startsWith('    ')) {
        return null; // Not enough spaces or doesn't start with 4 spaces
      }
      if (line.length === 4 && i < lines.length - 1) {
          // A line with only 4 spaces is not allowed if it's not the last line,
          // because `[^\n]` means it must have at least one non-newline character after the spaces.
          return null;
      }
    }
    return { type: 'code', content: inputContent.replace(/^ {4}/gm, '') };
  },

  // fences_start: /^(~~~~*)([^\n]*)/  (Comment suggests ~{3,}, actual regex is ~{4,})
  fencedCodeBlockStart: function (inputContent) {
    let tildeCharCount = 0;
    let cursor = 0;
    while (cursor < inputContent.length && inputContent[cursor] === '~') {
        tildeCharCount++;
        cursor++;
    }
    if (tildeCharCount < 3) return null; // Based on comment, 3 or more tildes

    // `(~~~~*)` captures the actual fence marker.
    // The given regex `(~~~~*)` means `~` then `~~~` then `~*`, so actually 4 or more tildes.
    // Let's stick to the regex `(~~~~*)` for the marker capture, meaning >=4 tildes.
    if (tildeCharCount < 4) return null;

    const fenceMarker = inputContent.substring(0, tildeCharCount);
    let languageSpec = '';
    const newlinePos = inputContent.indexOf('\n', cursor);
    if (newlinePos === -1) {
        languageSpec = inputContent.substring(cursor);
    } else {
        languageSpec = inputContent.substring(cursor, newlinePos);
    }
    return { type: 'fences_start', marker: fenceMarker, language: languageSpec.trim() };
  },

  // fences_end: /(?:^|\n)(~~~~*) *$/
  fencedCodeBlockEnd: function (inputContent) {
    const trimmedLine = inputContent.trim();
    if (trimmedLine.length < 4) return null; // Needs at least 4 tildes

    let tildeCount = 0;
    let cursor = 0;
    while (cursor < trimmedLine.length && trimmedLine[cursor] === '~') {
        tildeCount++;
        cursor++;
    }
    if (tildeCount < 4 || cursor !== trimmedLine.length) return null; // Must be only tildes

    return { type: 'fences_end', marker: trimmedLine };
  },

  // setext: /^([\s\S]+?)\n(?:(=)=*|--*) *$/
  levelUnderlineHeader: function (inputContent) {
    const lines = inputContent.split('\n');
    if (lines.length < 2) return null;

    const lastLine = lines[lines.length - 1];
    const underlineChar = lastLine.charAt(0);
    if (underlineChar !== '=' && underlineChar !== '-') return null;

    let hasNonSpaceChar = false;
    for (let i = 0; i < lastLine.length; i++) {
        if (lastLine[i] !== underlineChar && lastLine[i] !== ' ') {
            return null; // Invalid character in underline
        }
        if (lastLine[i] === underlineChar) {
            hasNonSpaceChar = true;
        }
    }
    if (!hasNonSpaceChar) return null; // Must contain at least one underline char

    const headerText = lines.slice(0, lines.length - 1).join('\n');
    return {
      type: 'setext',
      level: underlineChar === '=' ? 1 : 2,
      text: headerText
    };
  },

  // atx: /^(##{0,5})(?!#)((?:\\[\s\S]|[^\\])+?)(?:##* *)?$/
  hashMarkedHeader: function (inputContent) {
    if (inputContent.length === 0 || inputContent.charAt(0) !== '#') return null;

    let hashCount = 0;
    let cursor = 0;
    while (cursor < inputContent.length && inputContent.charAt(cursor) === '#') {
      hashCount++;
      cursor++;
    }

    if (hashCount === 0 || hashCount > 6) return null;
    if (cursor < inputContent.length && inputContent.charAt(cursor) === '#') return null; // Negative lookahead `(?!#)`

    // Skip leading spaces after hashes
    while (cursor < inputContent.length && inputContent.charAt(cursor) === ' ') {
      cursor++;
    }

    let textContentStart = cursor;
    let textContentEnd = inputContent.length;

    // Check for optional trailing hashes `(?:##* *)?`
    let scanBack = inputContent.length - 1;
    let trailingHashesFound = false;

    // Trim trailing spaces before checking for hashes
    while (scanBack >= textContentStart && inputContent[scanBack] === ' ') {
        scanBack--;
    }

    let potentialHashEnd = scanBack + 1; // Position after trailing spaces
    let tempHashScan = scanBack;
    let currentTrailingHashCount = 0;
    while (tempHashScan >= textContentStart && inputContent[tempHashScan] === '#') {
        currentTrailingHashCount++;
        tempHashScan--;
    }

    if (currentTrailingHashCount > 0) {
        // Trailing hashes detected.
        trailingHashesFound = true;
        textContentEnd = tempHashScan + 1; // Content ends before these hashes
        // Trim any spaces between content and trailing hashes.
        while (textContentEnd > textContentStart && inputContent[textContentEnd - 1] === ' ') {
            textContentEnd--;
        }
    }

    let headerContent = inputContent.substring(textContentStart, textContentEnd);
    headerContent = unescapeMarkdownSyntax(headerContent); // Apply unescaping

    return {
      type: 'atx',
      level: hashCount,
      text: headerContent.trim()
    };
  },

  // blockquote: /^>( *)[^\n]*(?:\n>(?:\1[^\n]*|))*$/
  quotedBlock: function (inputContent) {
    const lines = inputContent.split('\n');
    if (lines.length === 0 || !lines[0].startsWith('>')) return null;

    // Capture the indentation after the first `>`.
    let firstLineIndentSpaces = '';
    let firstLineCursor = 1;
    while (firstLineCursor < lines[0].length && lines[0].charAt(firstLineCursor) === ' ') {
        firstLineIndentSpaces += ' ';
        firstLineCursor++;
    }

    const collectedContentLines = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.startsWith('>')) return null; // All lines must start with `>`

      let currentLineIndentSpaces = '';
      let currentLineCursor = 1;
      while (currentLineCursor < line.length && line.charAt(currentLineCursor) === ' ') {
          currentLineIndentSpaces += ' ';
          currentLineCursor++;
      }

      if (currentLineIndentSpaces !== firstLineIndentSpaces) {
          return null; // Indentation mismatch
      }
      collectedContentLines.push(line.substring(1 + firstLineIndentSpaces.length));
    }

    return {
        type: 'blockquote',
        content: collectedContentLines.join('\n')
    };
  },

  // hr: /^(?:- *- *- *(?:- *)*|\* *\* *\* *(?:\* *)*)$/
  horizontalRule: function (inputContent) {
    const trimmed = inputContent.trim();
    if (trimmed.length < 3) return null; // At least three characters

    const firstChar = trimmed.charAt(0);
    if (firstChar !== '-' && firstChar !== '*') return null;

    let charCount = 0;
    for (let i = 0; i < trimmed.length; i++) {
      if (trimmed[i] === firstChar) {
        charCount++;
      } else {
        return null; // Must be all the same character
      }
    }
    if (charCount >= 3) {
      return { type: 'hr' };
    }
    return null;
  },

  // ul: /^[+\-*] /
  unorderedListItemStart: function (inputContent) {
    if (inputContent.length < 2) return null;
    const firstChar = inputContent.charAt(0);
    if ((firstChar === '+' || firstChar === '-' || firstChar === '*') && inputContent.charAt(1) === ' ') {
      return { type: 'ul_start', marker: firstChar };
    }
    return null;
  },

  // ol: /^\d\d*\. /
  orderedListItemStart: function (inputContent) {
    let cursor = 0;
    while (cursor < inputContent.length && inputContent.charAt(cursor) >= '0' && inputContent.charAt(cursor) <= '9') {
      cursor++;
    }
    if (cursor === 0) return null; // No digits
    if (inputContent.charAt(cursor) === '.' && inputContent.charAt(cursor + 1) === ' ') {
      return { type: 'ol_start', start: parseInt(inputContent.substring(0, cursor), 10) };
    }
    return null;
  },

  // links: /^:\[(?![\^*@])[^\[\]\n\\][^\[\]\n\\]*\]: /
  linkDefinitionStart: function (inputContent) {
    if (!inputContent.startsWith(':[')) return null;
    if (inputContent.length < 4) return null; // Needs at least `:[]: `

    const thirdChar = inputContent.charAt(2);
    if (thirdChar === '^' || thirdChar === '*' || thirdChar === '@') return null; // `(?![\^*@])`

    let closeBracketIdx = inputContent.indexOf(']', 2);
    if (closeBracketIdx === -1) return null;

    if (inputContent.substring(closeBracketIdx + 1, closeBracketIdx + 3) === ': ') {
      return { type: 'links_start' };
    }
    return null;
  },

  // images: /^@\[[^\[\]\n\\][^\[\]\n\\]*\]: /
  imageDefinitionStart: function (inputContent) {
    if (!inputContent.startsWith('@[')) return null;
    let closeBracketIdx = inputContent.indexOf(']', 2);
    if (closeBracketIdx === -1) return null;
    if (inputContent.substring(closeBracketIdx + 1, closeBracketIdx + 3) === ': ') {
      return { type: 'images_start' };
    }
    return null;
  },

  // figures: /^\[(?:\\[\s\S]|[^\\\]])+?\]@<[^ \n]/
  figureBlockStart: function (inputContent) {
    if (!inputContent.startsWith('[')) return null;
    let closeBracketIdx = -1;
    let charScan = 1;
    let escaped = false;
    while(charScan < inputContent.length) {
        if (inputContent[charScan] === '\\') {
            escaped = !escaped;
        } else if (inputContent[charScan] === ']' && !escaped) {
            closeBracketIdx = charScan;
            break;
        } else {
            escaped = false;
        }
        charScan++;
    }
    if (closeBracketIdx === -1) return null;

    if (inputContent.substring(closeBracketIdx + 1).startsWith('@<')) {
      // Check for `[^ \n]` after `@<`.
      if (inputContent.length > closeBracketIdx + 3 && inputContent[closeBracketIdx + 3] !== ' ' && inputContent[closeBracketIdx + 3] !== '\n') {
          return { type: 'figures_start' };
      }
    }
    return null;
  },

  // footnotex: /^\^\[([^\[\]\n\\][^\[\]\n\\]*)\]: *((?:\n {4}[^\n][^\n]*)+)$/
  complexFootnoteDefinition: function (inputContent) {
    if (!inputContent.startsWith('^[')) return null;
    let idEnd = inputContent.indexOf(']', 2);
    if (idEnd === -1) return null;

    if (inputContent.substring(idEnd + 1, idEnd + 3) === ': ') {
        // Now check for `((?:\n {4}[^\n][^\n]*)+)`
        const contentPart = inputContent.substring(idEnd + 3);
        const lines = contentPart.split('\n');
        if (lines.length === 0) return null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.length < 4 || !line.startsWith('    ')) {
                return null; // Must start with 4 spaces
            }
            if (line.length === 4 && i < lines.length - 1) { // A line with only 4 spaces and not the last line
                return null;
            }
        }
        return { type: 'footnotex' };
    }
    return null;
  },

  // footnotes: /^\^\[[^\[\]\n\\][^\[\]\n\\]*\]: /
  simpleFootnoteDefinitionStart: function (inputContent) {
    if (!inputContent.startsWith('^[')) return null;
    let closeBracketIdx = inputContent.indexOf(']', 2);
    if (closeBracketIdx === -1) return null;
    if (inputContent.substring(closeBracketIdx + 1, closeBracketIdx + 3) === ': ') {
      return { type: 'footnotes_start' };
    }
    return null;
  },

  // abbrs: /^\*\[[^\[\]\n\\][^\[\]\n\\]*\]: /
  abbreviationDefinitionStart: function (inputContent) {
    if (!inputContent.startsWith('*[')) return null;
    let closeBracketIdx = inputContent.indexOf(']', 2);
    if (closeBracketIdx === -1) return null;
    if (inputContent.substring(closeBracketIdx + 1, closeBracketIdx + 3) === ': ') {
      return { type: 'abbrs_start' };
    }
    return null;
  },

  // table: /^\+(?:==*|--*)\+ *(?:\n[\^|][^\n][^\n]*[\^|] *)*\n\+--*\+ *$/
  tableBlock: function (inputContent) {
    if (!inputContent.startsWith('+')) return null;
    let firstLineEnd = inputContent.indexOf('\n');
    if (firstLineEnd === -1) return null;
    const firstLine = inputContent.substring(0, firstLineEnd);

    // `^\+(?:==*|--*)\+ *`
    if (firstLine.charAt(0) !== '+') return null;
    let charScan = 1;
    let borderChar = '';
    while (charScan < firstLine.length) {
        if (firstLine[charScan] === '=' || firstLine[charScan] === '-') {
            if (!borderChar) borderChar = firstLine[charScan];
            if (firstLine[charScan] !== borderChar) return null; // Mixed border chars
            charScan++;
        } else {
            break;
        }
    }
    if (!borderChar) return null; // No border chars
    if (firstLine[charScan] !== '+') return null; // Must end with '+'
    if (firstLine.substring(charScan + 1).trim().length > 0) return null; // Only spaces after last '+'

    // Check for `\n\+--*\+ *$` at the end.
    let lastLineStart = inputContent.lastIndexOf('\n');
    if (lastLineStart === -1) return null;
    const lastLine = inputContent.substring(lastLineStart + 1);

    if (lastLine.charAt(0) !== '+') return null;
    charScan = 1;
    borderChar = ''; // Reset
    while (charScan < lastLine.length) {
        if (lastLine[charScan] === '-') { // Only '-' for bottom border
            if (!borderChar) borderChar = '-';
            if (lastLine[charScan] !== borderChar) return null;
            charScan++;
        } else {
            break;
        }
    }
    if (!borderChar) return null; // No border chars
    if (lastLine[charScan] !== '+') return null;
    if (lastLine.substring(charScan + 1).trim().length > 0) return null;

    return { type: 'table' };
  },

  // dl: /^([^: ][^\n]*(?:\n[^: ][^\n]*)*)\n(: [\s\S]*)$/
  definitionListBlock: function (inputContent) {
    let firstColonLine = inputContent.indexOf('\n: ');
    if (firstColonLine === -1) return null;

    const termsPart = inputContent.substring(0, firstColonLine);
    const defsPart = inputContent.substring(firstColonLine + 1); // Skip the first `\n`

    const termLines = termsPart.split('\n');
    for (const line of termLines) {
        if (line.startsWith(':') || line.startsWith(' ')) return null; // Must not start with ':' or ' '
    }

    if (!defsPart.startsWith(': ')) return null; // Definitions must start with `: `
    return { type: 'dl' };
  },

  // dd: /^:(  *)[^\n]*(?:\n \1[^\n]*)*$/
  definitionDescription: function (inputContent) {
    if (!inputContent.startsWith(':')) return null;
    let firstLineMatch = inputContent.match(/^:(  *)/); // Capture spaces
    if (!firstLineMatch) return null;

    const indentSpaces = firstLineMatch[1];
    const lines = inputContent.split('\n');
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.startsWith(' ' + indentSpaces)) return null; // Must continue with ` <indent>`
    }
    return { type: 'dd' };
  },

  // dd_pedantic: /^:  *[^\n]*(?:\n    [^\n]*)*$/
  pedanticDefinitionDescription: function (inputContent) {
    if (!inputContent.startsWith(':')) return null;
    let firstLineMatch = inputContent.match(/^:  */);
    if (!firstLineMatch) return null;

    const lines = inputContent.split('\n');
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.startsWith('    ')) return null; // Must continue with 4 spaces
    }
    return { type: 'dd_pedantic' };
  },

  // paragraph: /^[^\n][^\n]*(?:\n[^\n][^\n]*)*$/
  genericParagraph: function (inputContent) {
    // A paragraph is any block that doesn't start with a newline
    // and doesn't match any other block types.
    if (inputContent.length === 0 || inputContent.charAt(0) === '\n') return null;
    // It's a fallback, so it should always match if nothing else did.
    // The check for `[^\n][^\n]*` means it must have content.
    return { type: 'paragraph', content: inputContent };
  }
};

/**
 * Ordered list of block pattern matchers, by precedence.
 * The `blockPatternMatchers` object contains the functions.
 * This array defines the order of application.
 */
var orderedBlockMatchers = [
  { name: 'fixedIndentCodeSegment', check: blockPatternMatchers.fixedIndentCodeSegment },
  { name: 'endBlockSymbol', check: blockPatternMatchers.endBlockSymbol },
  { name: 'fencedCodeBlockStart', check: blockPatternMatchers.fencedCodeBlockStart },
  { name: 'levelUnderlineHeader', check: blockPatternMatchers.levelUnderlineHeader },
  { name: 'hashMarkedHeader', check: blockPatternMatchers.hashMarkedHeader },
  { name: 'quotedBlock', check: blockPatternMatchers.quotedBlock },
  { name: 'horizontalRule', check: blockPatternMatchers.horizontalRule },
  { name: 'unorderedListItemStart', check: blockPatternMatchers.unorderedListItemStart },
  { name: 'orderedListItemStart', check: blockPatternMatchers.orderedListItemStart },
  { name: 'linkDefinitionStart', check: blockPatternMatchers.linkDefinitionStart },
  { name: 'imageDefinitionStart', check: blockPatternMatchers.imageDefinitionStart },
  { name: 'figureBlockStart', check: blockPatternMatchers.figureBlockStart },
  { name: 'complexFootnoteDefinition', check: blockPatternMatchers.complexFootnoteDefinition },
  { name: 'simpleFootnoteDefinitionStart', check: blockPatternMatchers.simpleFootnoteDefinitionStart },
  { name: 'abbreviationDefinitionStart', check: blockPatternMatchers.abbreviationDefinitionStart },
  { name: 'tableBlock', check: blockPatternMatchers.tableBlock },
  { name: 'definitionListBlock', check: blockPatternMatchers.definitionListBlock },
  { name: 'simpleMacroDirective', check: blockPatternMatchers.simpleMacroDirective },
  { name: 'complexMacroStart', check: blockPatternMatchers.complexMacroStart },
  { name: 'complexMacroEnd', check: blockPatternMatchers.complexMacroEnd },
  { name: 'definitionDescription', check: blockPatternMatchers.definitionDescription }, // dd and dd_pedantic are used by dl
  { name: 'pedanticDefinitionDescription', check: blockPatternMatchers.pedanticDefinitionDescription },
  { name: 'singleNewlineIndicator', check: blockPatternMatchers.singleNewlineIndicator }, // blanklines
  { name: 'genericParagraph', check: blockPatternMatchers.genericParagraph } // Paragraph is the last fallback
];


/******************************************************************************\
 * Block-Level Analyzer
\******************************************************************************/

/**
 * @constructor
 * @type {function(new:BlockContentAnalyzer, Object=)}
 */
var BlockContentAnalyzer = function (analyzerConfig) {
  this.defaultParsingOptions = { /* default options would go here, mimicking `strictdown.defaults` */ };
  this.options = combineProperties({}, this.defaultParsingOptions, analyzerConfig || {});
  this.parsingRules = orderedBlockMatchers; // Use the new ordered matcher array
  this.collectedElements = [];
  this.collectedElements.linkDefinitions = {};
  this.collectedElements.imageDefinitions = {};
  this.collectedElements.abbreviationDefinitions = {};
  this.collectedElements.footnoteDefinitions = {};
  this.collectedElements.documentHeadings = [];

  var ruleIdentifiers = [];
  for (const ruleDefinition of this.parsingRules) {
    ruleIdentifiers.push(ruleDefinition.name);
  }
  // This `ruleIdentifiers` array would typically be used for debugging or dynamic rule management.
};

// ... the rest of the BlockContentAnalyzer (equivalent to BlockLexer) methods would follow,
// implementing the parsing logic using `segmentSourceIntoBlocks` and `orderedBlockMatchers`.

// Example of how the `BlockContentAnalyzer` might use the `parsingRules`
// (This part is not asked for, but shows the usage)
/*
BlockContentAnalyzer.prototype.processSource = function(sourceInput) {
    const rawBlocks = segmentSourceIntoBlocks(sourceInput);
    for (const blockText of rawBlocks) {
        let matched = false;
        for (const rule of this.parsingRules) {
            const matchResult = rule.check(blockText);
            if (matchResult) {
                this.collectedElements.push({ type: matchResult.type, data: matchResult });
                matched = true;
                break; // Found a match, move to next block
            }
        }
        if (!matched) {
            // Fallback for unhandled blocks, or error handling
            this.collectedElements.push({ type: 'unknown', data: blockText });
        }
    }
    return this.collectedElements;
};
*/

// Exposing a placeholder 'strictdown' object for `combineProperties` to use `strictdown.defaults`
globalScope.strictdown = globalScope.strictdown || {};
globalScope.strictdown.defaults = globalScope.strictdown.defaults || {};

globalScope.strictdown.BlockContentAnalyzer = BlockContentAnalyzer;
// Other helper functions might be exposed or kept internal as per original design.

})(this);