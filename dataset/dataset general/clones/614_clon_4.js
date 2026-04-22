(function () {
  const kernelSettings = {
    continueExecution: true, // Equivalent to PR_SHOULD_USE_CONTINUATION
    indentSize: 4          // Equivalent to PR_TAB_WIDTH
  };

  // Browser version check, re-implemented
  const retrieveLegacyBrowserIdentifier = function () {
    let browserAgent = navigator && navigator.userAgent;
    if (!browserAgent) return false;
    let versionMatch = browserAgent.match(/\bMSIE (\d+)\./);
    let identifiedVersion = versionMatch ? parseInt(versionMatch[1], 10) : false;
    // Memoize the result to avoid re-computation
    retrieveLegacyBrowserIdentifier = () => identifiedVersion;
    return identifiedVersion;
  };

  // Lexical category keywords (using arrays for definition)
  const structuralKeywords = [
    "break", "continue", "do", "else", "for", "if", "return", "while"
  ];
  const cStyleKeywords = structuralKeywords.concat([
    "auto", "case", "char", "const", "default", "double", "enum", "extern",
    "float", "goto", "int", "long", "register", "short", "signed", "sizeof",
    "static", "struct", "switch", "typedef", "union", "unsigned", "void", "volatile"
  ]);
  const generalKeywords = cStyleKeywords.concat([
    "catch", "class", "delete", "false", "import", "new", "operator", "private",
    "protected", "public", "this", "throw", "true", "try", "typeof"
  ]);
  const cPlusPlusKeywords = generalKeywords.concat([
    "alignof", "align_union", "asm", "axiom", "bool", "concept", "concept_map",
    "const_cast", "constexpr", "decltype", "dynamic_cast", "explicit", "export",
    "friend", "inline", "late_check", "mutable", "namespace", "nullptr",
    "reinterpret_cast", "static_assert", "static_cast", "template", "typeid",
    "typename", "using", "virtual", "wchar_t", "where"
  ]);
  const javaKeywords = generalKeywords.concat([
    "abstract", "boolean", "byte", "extends", "final", "finally", "implements",
    "import", "instanceof", "null", "native", "package", "strictfp", "super",
    "synchronized", "throws", "transient"
  ]);
  const cSharpKeywords = javaKeywords.concat([
    "as", "base", "by", "checked", "decimal", "delegate", "descending", "event",
    "fixed", "foreach", "from", "group", "implicit", "in", "interface", "internal",
    "into", "is", "lock", "object", "out", "override", "orderby", "params",
    "partial", "readonly", "ref", "sbyte", "sealed", "stackalloc", "string",
    "select", "uint", "ulong", "unchecked", "unsafe", "ushort", "var"
  ]);
  const javaScriptKeywords = generalKeywords.concat([
    "debugger", "eval", "export", "function", "get", "null", "set", "undefined",
    "var", "with", "Infinity", "NaN"
  ]);
  const perlKeywords = [
    "caller", "delete", "die", "do", "dump", "elsif", "eval", "exit", "foreach",
    "for", "goto", "if", "import", "last", "local", "my", "next", "no", "our",
    "print", "package", "redo", "require", "sub", "undef", "unless", "until",
    "use", "wantarray", "while", "BEGIN", "END"
  ];
  const pythonKeywords = structuralKeywords.concat([
    "and", "as", "assert", "class", "def", "del", "elif", "except", "exec",
    "finally", "from", "global", "import", "in", "is", "lambda", "nonlocal",
    "not", "or", "pass", "print", "raise", "try", "with", "yield",
    "False", "True", "None"
  ]);
  const rubyKeywords = structuralKeywords.concat([
    "alias", "and", "begin", "case", "class", "def", "defined", "elsif", "end",
    "ensure", "false", "in", "module", "next", "nil", "not", "or", "redo",
    "rescue", "retry", "self", "super", "then", "true", "undef", "unless",
    "until", "when", "yield", "BEGIN", "END"
  ]);
  const shellKeywords = structuralKeywords.concat([
    "case", "done", "elif", "esac", "eval", "fi", "function", "in", "local",
    "set", "then", "until"
  ]);

  // All keywords combined (not used in this snippet, but for completeness)
  const allKnownKeywords = new Set([].concat(
    cPlusPlusKeywords, cSharpKeywords, javaScriptKeywords, perlKeywords,
    pythonKeywords, rubyKeywords, shellKeywords
  ));

  // Style class aliases (using object literal)
  const elementStyles = {
    stringLiteral: 'st',
    keywordCode: 'kw',
    codeComment: 'co',
typeDefinition: 'ty',
    numericLiteral: 'li',
    punctuationChar: 'pn',
    plainContent: 'pl',
    htmlTag: 'ta',
    markupDeclaration: 'de',
    embeddedScript: 'sr',
    attributeName: 'an',
    attributeValue: 'av',
    nonCodeBlock: 'nc'
  };

  // Symbols that can precede a regular expression literal in JavaScript
  const regexPrecedingSymbols = new Set([
    "!", "!=", "!==", "#", "%", "%=", "&", "&&", "&&=", "&=", "(", "*", "*=", "+=", ",", "-=",
    "->", "/", "/=", ":", "::", ";", "<", "<<", "<<=", "<=", "=", "==", "===", ">",
    ">=", ">>", ">>=", ">>>", ">>>=", "?", "@", "[", "^", "^=", "^^", "^^=", "{", "|", "|=", "||",
    "||=", "~", "break", "case", "continue", "delete", "do", "else", "finally",
    "instanceof", "return", "throw", "try", "typeof"
  ]);

  // Constructs a regex pattern for the preceders
  const createPrecederRegex = function () {
    let patternParts = ['(?:^^|[+-]']; // Start of input or +/-
    for (let symbol of regexPrecedingSymbols) {
      // Escape special characters in the symbol string for regex
      patternParts.push(symbol.replace(/([\\^$*+?.()|[\]{}])/g, '\\$1'));
    }
    return patternParts.join('|') + ')\\s*';
  };
  const regexLiteralPrecederPattern = createPrecederRegex();

  // HTML character escaping utilities (using maps and single replace)
  const defaultHtmlEscapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
  };
  const attributeHtmlEscapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  };

  function applyCharacterEscaping(textInput, escapeLookupMap) {
    return textInput.replace(/[&<>"]/g, char => escapeLookupMap[char]);
  }

  function escapeForAttributeValue(content) {
    return applyCharacterEscaping(content, attributeHtmlEscapeMap);
  }

  function escapeForHtmlText(content) {
    return applyCharacterEscaping(content, defaultHtmlEscapeMap);
  }

  const htmlEntityUnescapeMap = {
    '&lt;': '<',
    '&gt;': '>',
    '&apos;': "'",
    '&quot;': '"',
    '&nbsp;': ' ',
    '&amp;': '&'
  };
  const htmlEntityUnescapeRegex = /&(?:lt|gt|apos|quot|nbsp|amp);/g;

  function unescapeHtmlToPlainText(encodedHtml) {
    let currentContent = encodedHtml;
    let currentPos;
    // Numeric entities first (e.g., &#123; &#xAB;)
    for (currentPos = currentContent.indexOf('&#'); currentPos >= 0; currentPos = currentContent.indexOf('&#', currentPos + 1)) {
      let endPos = currentContent.indexOf(';', currentPos);
      if (endPos >= 0) {
        let numberSegment = currentContent.substring(currentPos + 3, endPos);
        let numericBase = 10;
        if (numberSegment && numberSegment.charAt(0) === 'x') {
          numberSegment = numberSegment.substring(1);
          numericBase = 16;
        }
        let charCodeValue = parseInt(numberSegment, numericBase);
        if (!isNaN(charCodeValue)) {
          currentContent = currentContent.substring(0, currentPos) + String.fromCharCode(charCodeValue) + currentContent.substring(endPos + 1);
        }
      }
    }
    // Named entities
    return currentContent.replace(htmlEntityUnescapeRegex, entity => htmlEntityUnescapeMap[entity]);
  }

  // DOM content type checks
  function isNodeRawContent(domNode) {
    return domNode.tagName === 'XMP';
  }

  const newlineDetector = /[\r\n]/g;
  function isNodePreformatted(domNode, nodeTextContent) {
    if (domNode.tagName === 'PRE') { return true; }
    if (!newlineDetector.test(nodeTextContent)) { return true; } // No newlines, so preformatting doesn't matter
    let styleProperty = '';
    if (domNode.currentStyle) { // For older IE
      styleProperty = domNode.currentStyle.whiteSpace;
    } else if (window.getComputedStyle) { // Modern browsers
      styleProperty = window.getComputedStyle(domNode, null).whiteSpace;
    }
    return !styleProperty || styleProperty === 'pre';
  }

  // DOM traversal and serialization
  function convertDomToSerializableHtml(domElement, outputCollector, sortElementAttributes) {
    switch (domElement.nodeType) {
      case 1: // Element node
        let elementName = domElement.tagName.toLowerCase();
        outputCollector.push('<', elementName);

        let attributesArray = Array.from(domElement.attributes);
        if (attributesArray.length) {
          if (sortElementAttributes) {
            attributesArray.sort((a, b) => (a.name < b.name) ? -1 : (a.name === b.name ? 0 : 1));
          }
          for (let attr of attributesArray) {
            if (!attr.specified) { continue; } // Only include explicitly set attributes
            outputCollector.push(' ', attr.name.toLowerCase(), '="', escapeForAttributeValue(attr.value), '"');
          }
        }
        outputCollector.push('>');

        for (let childElement = domElement.firstChild; childElement; childElement = childElement.nextSibling) {
          convertDomToSerializableHtml(childElement, outputCollector, sortElementAttributes);
        }

        // Close tag for non-self-closing elements or if it has children
        if (domElement.firstChild || !/^(?:br|link|img)$/.test(elementName)) {
          outputCollector.push('</', elementName, '>');
        }
        break;
      case 3: // Text node
      case 4: // CDATA section node
        outputCollector.push(escapeForHtmlText(domElement.nodeValue));
        break;
    }
  }

  // --- Advanced Regex Construction Logic (Type IV Clone) ---

  // Decodes a regex escape sequence (e.g., '\t', '\x20', '\u1234') to its character code.
  const decodeEscapeToCharCode = (escapeSequence) => {
    if (escapeSequence.length === 0 || escapeSequence.charAt(0) !== '\\') {
        return escapeSequence.charCodeAt(0);
    }
    const charAfterBackslash = escapeSequence.charAt(1);
    switch (charAfterBackslash) {
      case 'b': return 8; case 't': return 9; case 'n': return 0xA;
      case 'v': return 0xB; case 'f': return 0xC; case 'r': return 0xD;
      case 'u': case 'x':
        return parseInt(escapeSequence.substring(2), 16) || charAfterBackslash.charCodeAt(0);
      case '0': case '1': case '2': case '3': case '4': case '5': case '6': case '7':
        // If it's a multi-digit octal, parse it. Otherwise, assume it's a literal char.
        if (escapeSequence.length > 2 && /[0-7]/.test(escapeSequence.charAt(2))) {
            return parseInt(escapeSequence.substring(1), 8);
        }
        return charAfterBackslash.charCodeAt(0);
      default: return charAfterBackslash.charCodeAt(0);
    }
  };

  // Encodes a character code back into a regex-safe string.
  const encodeCharCodeToEscape = (charCode) => {
    if (charCode < 0x20) {
      return (charCode < 0x10 ? '\\x0' : '\\x') + charCode.toString(16);
    }
    const charValue = String.fromCharCode(charCode);
    // Escape regex meta-characters that might appear in a literal context
    if ('\\-[]^$*+?.()|{}<>'.includes(charValue)) {
      return '\\' + charValue;
    }
    return charValue;
  };

  // Expands character ranges for case-folding (e.g., 'a-z' becomes 'a-zA-Z')
  function expandCharCaseRanges(characterRanges) {
    const expandedList = [];
    for (const [startCode, endCode] of characterRanges) {
      expandedList.push([startCode, endCode]);
      if (!(endCode < 65 || startCode > 122)) { // Check if range intersects with ASCII letters
        // Add lowercase for uppercase letters
        if (!(endCode < 65 || startCode > 90)) { // Intersects 'A'-'Z'
          expandedList.push([Math.max(65, startCode) | 32, Math.min(endCode, 90) | 32]);
        }
        // Add uppercase for lowercase letters
        if (!(endCode < 97 || startCode > 122)) { // Intersects 'a'-'z'
          expandedList.push([Math.max(97, startCode) & ~32, Math.min(endCode, 122) & ~32]);
        }
      }
    }
    return expandedList;
  }

  // Merges overlapping or adjacent character ranges.
  function mergeOverlappingRanges(rangesInput) {
    if (rangesInput.length === 0) return [];
    rangesInput.sort((a, b) => (a[0] - b[0]) || (b[1] - a[1]));
    const mergedOutput = [];
    let currentMergedRange = rangesInput[0];
    for (let i = 1; i < rangesInput.length; i++) {
      if (rangesInput[i][0] <= currentMergedRange[1] + 1) { // Overlap or adjacent
        currentMergedRange[1] = Math.max(currentMergedRange[1], rangesInput[i][1]);
      } else {
        mergedOutput.push(currentMergedRange);
        currentMergedRange = rangesInput[i];
      }
    }
    mergedOutput.push(currentMergedRange);
    return mergedOutput;
  }

  // Parses a character set string and applies case folding if required.
  function processCharsetForCaseFolding(charSetText) {
    let isInverse = charSetText.charAt(1) === '^';
    let innerContent = charSetText.substring(1, charSetText.length - 1);
    if (isInverse) innerContent = innerContent.substring(1);

    const specificCharClasses = []; // For \d, \s, \w, \D, \S, \W
    const individualCharRanges = []; // For 'a', 'z', '\x20', 'a-z'

    let scanIdx = 0;
    while (scanIdx < innerContent.length) {
      let char = innerContent.charAt(scanIdx);
      if (char === '\\') {
        let escapeLength = 2; // Default for most escapes
        let escapeValue = innerContent.substring(scanIdx, scanIdx + 2);
        if (escapeValue.charAt(1) === 'u' && innerContent.length >= scanIdx + 6) {
          escapeValue = innerContent.substring(scanIdx, scanIdx + 6); escapeLength = 6;
        } else if (escapeValue.charAt(1) === 'x' && innerContent.length >= scanIdx + 4) {
          escapeValue = innerContent.substring(scanIdx, scanIdx + 4); escapeLength = 4;
        } else if (/[0-7]/.test(escapeValue.charAt(1))) { // Octal
            let octalSeqMatch = innerContent.substring(scanIdx + 1).match(/^[0-7]{1,3}/);
            if (octalSeqMatch) { escapeValue = '\\' + octalSeqMatch[0]; escapeLength = 1 + octalSeqMatch[0].length; }
        }

        if (['\\D', '\\S', '\\W', '\\d', '\\s', '\\w'].includes(escapeValue)) {
          specificCharClasses.push(escapeValue);
        } else {
          let charCode = decodeEscapeToCharCode(escapeValue);
          individualCharRanges.push([charCode, charCode]);
        }
        scanIdx += escapeLength;

      } else if (char === '-' && scanIdx > 0 && scanIdx < innerContent.length - 1) {
        // This is a range, e.g., 'a-z'. Modify the last added range.
        if (individualCharRanges.length > 0) {
          let previousRange = individualCharRanges[individualCharRanges.length - 1];
          let nextChar = innerContent.charAt(scanIdx + 1);
          let endCharCode;
          let endCharLength = 1;

          if (nextChar === '\\') { // The end of range is an escape
            let nextEscapeValue = innerContent.substring(scanIdx + 1, scanIdx + 3);
            if (nextEscapeValue.charAt(1) === 'u' && innerContent.length >= scanIdx + 7) {
                nextEscapeValue = innerContent.substring(scanIdx + 1, scanIdx + 7); endCharLength = 6;
            } else if (nextEscapeValue.charAt(1) === 'x' && innerContent.length >= scanIdx + 5) {
                nextEscapeValue = innerContent.substring(scanIdx + 1, scanIdx + 5); endCharLength = 4;
            } else if (/[0-7]/.test(nextEscapeValue.charAt(1))) {
                let octalSeqMatch = innerContent.substring(scanIdx + 2).match(/^[0-7]{1,3}/);
                if (octalSeqMatch) { nextEscapeValue = '\\' + octalSeqMatch[0]; endCharLength = 1 + octalSeqMatch[0].length; }
            }
            endCharCode = decodeEscapeToCharCode(nextEscapeValue);
          } else {
            endCharCode = nextChar.charCodeAt(0);
          }
          previousRange[1] = endCharCode; // Update the end of the range
          scanIdx += 1 + endCharLength; // Skip '-' and the end char
        } else { // '-' is a literal character
          individualCharRanges.push([char.charCodeAt(0), char.charCodeAt(0)]);
          scanIdx++;
        }
      } else { // Literal character
        individualCharRanges.push([char.charCodeAt(0), char.charCodeAt(0)]);
        scanIdx++;
      }
    }

    let casesExpandedRanges = expandCharCaseRanges(individualCharRanges);
    let consolidatedRanges = mergeOverlappingRanges(casesExpandedRanges);

    let resultBuffer = ['['];
    if (isInverse) { resultBuffer.push('^'); }
    resultBuffer.push(...specificCharClasses);
    for (const [start, end] of consolidatedRanges) {
      resultBuffer.push(encodeCharCodeToEscape(start));
      if (end > start) {
        if (end > start + 1) { resultBuffer.push('-'); }
        resultBuffer.push(encodeCharCodeToEscape(end));
      }
    }
    resultBuffer.push(']');
    return resultBuffer.join('');
  }

  // Scans and transforms a single regex source string.
  function transformSingleRegexSource(sourceText, requiresCaseFolding, groupRenameOffset) {
    let outputSegments = [];
    let currentCapturingGroups = 0;
    let currentPosition = 0;
    const sourceLength = sourceText.length;

    while (currentPosition < sourceLength) {
      let char = sourceText.charAt(currentPosition);

      if (char === '\\') {
        let escapeValue;
        let escapeLen = 2; // Default for most escapes like \., \s
        let nextChar = sourceText.charAt(currentPosition + 1);

        if (nextChar === 'u' && sourceLength >= currentPosition + 6) { // \uXXXX
          escapeValue = sourceText.substring(currentPosition, currentPosition + 6); escapeLen = 6;
        } else if (nextChar === 'x' && sourceLength >= currentPosition + 4) { // \xXX
          escapeValue = sourceText.substring(currentPosition, currentPosition + 4); escapeLen = 4;
        } else if (/[0-7]/.test(nextChar)) { // Octal or backreference
          let octalMatch = sourceText.substring(currentPosition + 1).match(/^[0-7]{1,3}/);
          if (octalMatch) {
              // Ambiguity: \1 could be octal \001 or backreference.
              // Assuming single digit \1-\7 are backreferences, others are octal for char code.
              if (octalMatch[0].length === 1 && nextChar !== '0') {
                  let refNum = parseInt(nextChar, 10);
                  outputSegments.push('\\' + (refNum + groupRenameOffset));
                  currentPosition += 2;
                  continue; // Skip the default push and increment
              } else { // Octal like \0, \07, \012
                  escapeValue = sourceText.substring(currentPosition, currentPosition + 1 + octalMatch[0].length);
                  escapeLen = 1 + octalMatch[0].length;
              }
          } else { // Just \ followed by non-octal digit
              escapeValue = sourceText.substring(currentPosition, currentPosition + 2);
          }
        } else if (/[1-9]/.test(nextChar)) { // Definite backreference \1, \2 etc.
            let refNum = parseInt(nextChar, 10);
            outputSegments.push('\\' + (refNum + groupRenameOffset));
            currentPosition += 2;
            continue; // Skip the default push and increment
        } else { // Other generic escapes like \. \* \[
            escapeValue = sourceText.substring(currentPosition, currentPosition + 2);
        }
        outputSegments.push(escapeValue);
        currentPosition += escapeLen;

      } else if (char === '[') {
        let closingBracketIdx = currentPosition;
        let bracketDepth = 0; // Simple depth counter for brackets
        while (closingBracketIdx < sourceLength) {
            if (sourceText.charAt(closingBracketIdx) === '\\') {
                closingBracketIdx++; // Skip next char if escaped
            } else if (sourceText.charAt(closingBracketIdx) === '[') {
                bracketDepth++;
            } else if (sourceText.charAt(closingBracketIdx) === ']') {
                bracketDepth--;
                if (bracketDepth === 0) break;
            }
            closingBracketIdx++;
        }
        if (closingBracketIdx >= sourceLength) { // Unclosed bracket, treat rest as literal
             outputSegments.push(sourceText.substring(currentPosition));
             currentPosition = sourceLength;
             continue;
        }

        const charSetSegment = sourceText.substring(currentPosition, closingBracketIdx + 1);
        if (requiresCaseFolding) {
          outputSegments.push(processCharsetForCaseFolding(charSetSegment));
        } else {
          outputSegments.push(charSetSegment);
        }
        currentPosition = closingBracketIdx + 1;

      } else if (char === '(') {
        if (sourceText.charAt(currentPosition + 1) === '?' && (':!=').includes(sourceText.charAt(currentPosition + 2))) {
          // Non-capturing group (?:, (?!, (?=
          outputSegments.push(sourceText.substring(currentPosition, currentPosition + 3));
          currentPosition += 3;
        } else {
          // Capturing group
          outputSegments.push('(');
          currentCapturingGroups++;
          currentPosition++;
        }
      } else if (char === '^' && currentPosition === 0) { // Start of input anchor, ignore for combined regex
        currentPosition++;
      } else {
        outputSegments.push(char);
        currentPosition++;
      }
    }
    return {
      modifiedSource: outputSegments.join(''),
      countOfCapturingGroups: currentCapturingGroups
    };
  }

  // Combines multiple regex objects into a single global regex.
  function constructCombinedRegex(regexList) {
    let totalCaptureGroupCount = 0;
    let globalIgnoreCaseFlag = false;
    let needsCharsetFolding = false;

    for (const regexObject of regexList) {
      if (regexObject.ignoreCase) {
        globalIgnoreCaseFlag = true;
      }
      // Check if any regex contains case-sensitive letters that would need folding.
      // Filter out escapes that might contain letters but aren't actual letters for folding check.
      const cleanedPattern = regexObject.source.replace(/\\u[0-9a-f]{4}|\\x[0-9a-f]{2}|\\[^ux]/gi, '');
      if (/[a-z]/i.test(cleanedPattern) && !regexObject.ignoreCase) {
          needsCharsetFolding = true;
      }
    }

    const processedExpressions = [];
    for (const regexObject of regexList) {
      const transformationResult = transformSingleRegexSource(
        regexObject.source,
        needsCharsetFolding,
        totalCaptureGroupCount
      );
      processedExpressions.push(`(?:${transformationResult.modifiedSource})`);
      totalCaptureGroupCount += transformationResult.countOfCapturingGroups;
    }

    const finalCombinedPattern = processedExpressions.join('|');
    return new RegExp(finalCombinedPattern, 'g' + (globalIgnoreCaseFlag ? 'i' : ''));
  }

  // Expose specific functions/variables globally as required by the original API structure
  window['PR_SHOULD_USE_CONTINUATION'] = kernelSettings.continueExecution;
  window['PR_TAB_WIDTH'] = kernelSettings.indentSize;

  // These are initialized to `void 0` in the original snippet, meaning they are defined later.
  window['PR_normalizedHtml'] = void 0;
  window['PR'] = void 0;
  window['prettyPrintOne'] = void 0;
  window['prettyPrint'] = void 0;

  // The `_pr_isIE6` function is directly assigned in the original snippet.
  window['_pr_isIE6'] = retrieveLegacyBrowserIdentifier;

  // Internal utilities, not exposed globally by the provided snippet, but are part of the clone.
  const internalUtility = {};
  internalUtility.convertDomToHtml = function(element, sortAttrs = false) {
    let output = [];
    convertDomToSerializableHtml(element, output, sortAttrs);
    return output.join('');
  };
  internalUtility.createUnifiedPattern = constructCombinedRegex;
  internalUtility.regexPreceders = regexLiteralPrecederPattern;

})();