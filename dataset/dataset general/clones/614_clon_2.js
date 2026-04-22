// License details for this software component.
//
// Permitted for use under the Apache License, Version 2.0 (the "License");
// you may not employ this file except in compliance with the License.
// A copy of the License may be obtained at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless mandated by applicable law or agreed to in writing, software
// distributed under the License is provided on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// Refer to the License for specific language governing permissions and
// limitations.


/**
 * @fileoverview
 * Utility routines for web-based syntax highlighting of code embedded in HTML.
 * <p>
 *
 * For an extensive collection of supported languages, consult the
 * <a href="http://google-code-prettify.googlecode.com/svn/trunk/README.html#langs">README</a>
 * document accompanying this source package. At minimum, the lexical analyzer
 * should function for numerous languages including C, C++, Java, Python, Bash,
 * SQL, HTML, XML, CSS, JavaScript, and Makefiles. It performs adequately for Ruby,
 * PHP, and Awk, and a subset of Perl. However, due to differing comment conventions,
 * it does not work for Smalltalk, Lisp-like, or CAML-like languages without an
 * explicit language class specification.
 * <p>
 * How to use: <ol>
 * <li> Include this script file in your HTML page using
 *   {@code <script type="text/javascript" src="/path/to/syntax_highlighter.js"></script>}
 * <li> Define appropriate styling rules. Refer to the example page for demonstrations.
 * <li> Mark {@code <pre>} and {@code <code>} elements in your source code with
 *    {@code class=prettyprint.}
 *    The (HTML deprecated) {@code <xmp>} tag can also be used, but the highlighter
 *    requires more significant DOM manipulations for it, potentially affecting
 *    some CSS styles.
 * </ol>
 * That's all. The API was designed to be as straightforward as possible, so there's
 * no need to specify the code's language. However, if desired, you can add another
 * class to the {@code <pre>} or {@code <code>} element to indicate the language,
 * e.g., {@code <pre class="prettyprint lang-java">}. Any class starting with "lang-"
 * followed by a file extension identifies the file type.
 * See the "lang-*.js" files in this directory for modules implementing
 * language-specific handlers.
 * <p>
 * Revision history:<br>
 * cbeust, 2006/08/22
 * <blockquote>
 *   Java annotations (beginning with "@") are now recognized as literals ("lit")
 * </blockquote>
 * @requires console
 */

// JSHint declarations
/*global console, document, navigator, setTimeout, window */

/**
 * Breaks down the {@code formatAllCodeBlocks} process into multiple timed segments
 * to avoid blocking UI responsiveness.
 * If set to {@code !true}, {@code formatAllCodeBlocks()} operates synchronously.
 */
window['CONT_PROCESS_ENABLED'] = !false;

/** The count of spaces for a tab character. */
window['CODE_INDENT_SIZE'] = 4;

/** Traverses the DOM and returns an appropriately escaped version of innerHTML.
  * @param {Node} elementNode
  * @param {Array.<string>} outputBuffer output array that receives HTML segments.
  */
window['FORMAT_HTML_CONTENT']

/** Contains utilities for creating and registering new language processors.
  * @type {Object}
  */
  = window['SYNTAX_UTILITIES']

/** Formats a singular segment of code.
  *
  * @param {string} sourceCodeMarkup code as HTML
  * @return {string} code as HTML, but enhanced visually
  */
  = window['formatSingleCodeBlock']
/** Locates all {@code <pre>} and {@code <code>} elements in the DOM with
  * {@code class=prettyprint} and applies formatting.
  * @param {Function?} opt_completionCallback if provided, invoked when the final entry
  *     has been processed.
  */
  = window['formatAllCodeBlocks'] = void 0;

/** Browser version detection. @extern @returns boolean false if not an old IE, else the major version number. */
window['_detectOldIE'] = function () {
  var browserVersion = navigator && navigator.userAgent &&
      navigator.userAgent.match(/\bMSIE ([678])\./);
  browserVersion = browserVersion ? +browserVersion[1] : false;
  window['_detectOldIE'] = function () { return browserVersion; };
  return browserVersion;
};


(function () {
  // Lists of key terms for various programming languages.
  var CONTROL_STRUCTURE_TOKENS =
      "break continue do else for if return while ";
  var BASIC_C_TOKENS = CONTROL_STRUCTURE_TOKENS + "auto case char const default " +
      "double enum extern float goto int long register short signed sizeof " +
      "static struct switch typedef union unsigned void volatile ";
  var GENERAL_PROGRAM_TOKENS = BASIC_C_TOKENS + "catch class delete false import " +
      "new operator private protected public this throw true try typeof ";
  var EXTENDED_CPP_TOKENS = GENERAL_PROGRAM_TOKENS + "alignof align_union asm axiom bool " +
      "concept concept_map const_cast constexpr decltype " +
      "dynamic_cast explicit export friend inline late_check " +
      "mutable namespace nullptr reinterpret_cast static_assert static_cast " +
      "template typeid typename using virtual wchar_t where ";
  var JAVA_SPECIFIC_TOKENS = GENERAL_PROGRAM_TOKENS +
      "abstract boolean byte extends final finally implements import " +
      "instanceof null native package strictfp super synchronized throws " +
      "transient ";
  var CSHARP_ADDITIONAL_TOKENS = JAVA_SPECIFIC_TOKENS +
      "as base by checked decimal delegate descending event " +
      "fixed foreach from group implicit in interface internal into is lock " +
      "object out override orderby params partial readonly ref sbyte sealed " +
      "stackalloc string select uint ulong unchecked unsafe ushort var ";
  var JAVASCRIPT_CORE_TOKENS = GENERAL_PROGRAM_TOKENS +
      "debugger eval export function get null set undefined var with " +
      "Infinity NaN ";
  var PERL_SCRIPT_TOKENS = "caller delete die do dump elsif eval exit foreach for " +
      "goto if import last local my next no our print package redo require " +
      "sub undef unless until use wantarray while BEGIN END ";
  var PYTHON_LANGUAGE_TOKENS = CONTROL_STRUCTURE_TOKENS + "and as assert class def del " +
      "elif except exec finally from global import in is lambda " +
      "nonlocal not or pass print raise try with yield " +
      "False True None ";
  var RUBY_SCRIPT_TOKENS = CONTROL_STRUCTURE_TOKENS + "alias and begin case class def" +
      " defined elsif end ensure false in module next nil not or redo rescue " +
      "retry self super then true undef unless until when yield BEGIN END ";
  var SHELL_SCRIPT_TOKENS = CONTROL_STRUCTURE_TOKENS + "case done elif esac eval fi " +
      "function in local set then until ";
  var AGGREGATE_LANGUAGE_TOKENS = (
      EXTENDED_CPP_TOKENS + CSHARP_ADDITIONAL_TOKENS + JAVASCRIPT_CORE_TOKENS + PERL_SCRIPT_TOKENS +
      PYTHON_LANGUAGE_TOKENS + RUBY_SCRIPT_TOKENS + SHELL_SCRIPT_TOKENS);

  // Token style names, corresponding to CSS classes.
  /** Style for a string literal */
  var SYN_STRING = 'str';
  /** Style for a keyword */
  var SYN_KEYWORD = 'kwd';
  /** Style for a comment */
  var SYN_COMMENT = 'com';
  /** Style for a type declaration */
  var SYN_TYPE = 'typ';
  /** Style for a literal data value. E.g., 1, null, !false. */
  var SYN_LITERAL = 'lit';
  /** Style for a punctuation character sequence. */
  var SYN_PUNCTUATION = 'pun';
  /** Style for plain, unclassified text. */
  var SYN_PLAIN = 'pln';

  /** Style for an SGML tag. */
  var SYN_TAG = 'tag';
  /** Style for a markup declaration like a DOCTYPE. */
  var SYN_DECLARATION = 'dec';
  /** Style for embedded source code. */
  var SYN_EMBEDDED_SOURCE = 'src';
  /** Style for an SGML attribute identifier. */
  var SYN_ATTRIBUTE_NAME = 'atn';
  /** Style for an SGML attribute's assigned value. */
  var SYN_ATTRIBUTE_VALUE = 'atv';

  /**
   * A class indicating a section of markup that is not code, for example, to allow
   * embedding of line numbers within code displays.
   */
  var SYN_NON_CODE_BLOCK = 'nocode';

  /** A collection of tokens that can precede a regular expression literal in
    * JavaScript.
    * http://www.mozilla.org/js/language/js20/rationale/syntax.html contains the complete
    * list, but I've excluded those that might be problematic in languages
    * without regular expression literals.
    *
    * <p>Specifically, I've removed any keywords that cannot precede a regex
    * literal in a syntactically valid JavaScript program, and I've removed the
    * "in" keyword as it's not a keyword in many languages and might be used
    * as a unit of measurement.
    *
    * <p>The provided link above does not precisely describe EcmaScript rules, as
    * it fails to differentiate between (a=++/b/i) and (a++/b/i), but it works
    * very well in practice.
    *
    * @private
    */
  var REGEX_PREFIX_TOKEN_SET = function () {
      var prefixOperators = [
          "!", "!=", "!==", "#", "%", "%=", "&", "&&", "&&=",
          "&=", "(", "*", "*=", /* "+", */ "+=", ",", /* "-", */ "-=",
          "->", /*".", "..", "...", handled below */ "/", "/=", ":", "::", ";",
          "<", "<<", "<<=", "<=", "=", "==", "===", ">",
          ">=", ">>", ">>=", ">>>", ">>>=", "?", "@", "[",
          "^", "^=", "^^", "^^=", "{", "|", "|=", "||",
          "||=", "~" /* handles =~ and !~ */,
          "break", "case", "continue", "delete",
          "do", "else", "finally", "instanceof",
          "return", "throw", "try", "typeof"
          ];
      var compiledPattern = '(?:^^|[+-]';
      for (var idx = 0; idx < prefixOperators.length; ++idx) {
        compiledPattern += '|' + prefixOperators[idx].replace(/([^=<>:&a-z])/g, '\\$1');
      }
      compiledPattern += ')\\s*';  // Matches at the end, and matches an empty string.
      return compiledPattern;
      // NOTE: This does not correctly handle cases where a regular expression
      // immediately follows another, as a regular expression might have flags
      // for case-sensitivity and similar. Having adjacent regex tokens is
      // not valid in any language I know, so this is deferred.
      // TODO: Consider styling special characters within a regex as punctuation.
    }();

  // Define regular expressions here to avoid interpreter creating new objects
  // each time the encapsulating function is invoked.
  // The language specification mandates a new object even if $1 members are not accessed.
  var htmlAmpersandPattern = /&/g;
  var htmlLessThanPattern = /</g;
  var htmlGreaterThanPattern = />/g;
  var htmlQuotePattern = /\"/g;
  /** Converts string to HTML, escaping double quotes for attribute safety. */
  function escapeAttributeValue(sourceText) {
    return sourceText.replace(htmlAmpersandPattern, '&amp;')
        .replace(htmlLessThanPattern, '&lt;')
        .replace(htmlGreaterThanPattern, '&gt;')
        .replace(htmlQuotePattern, '&quot;');
  }

  /** Escapes HTML special characters within plain text. */
  function escapeTextContent(sourceText) {
    return sourceText.replace(htmlAmpersandPattern, '&amp;')
        .replace(htmlLessThanPattern, '&lt;')
        .replace(htmlGreaterThanPattern, '&gt;');
  }


  var entityLtPattern = /&lt;/g;
  var entityGtPattern = /&gt;/g;
  var entityAposPattern = /&apos;/g;
  var entityQuotPattern = /&quot;/g;
  var entityAmpPattern = /&amp;/g;
  var entityNbspPattern = /&nbsp;/g;
  /** Unescapes HTML entities back to plain text. */
  function unescapeHtmlToText(htmlInput) {
    var charPos = htmlInput.indexOf('&');
    if (charPos < 0) { return htmlInput; }
    // Handle numeric entities specifically. Functional substitution cannot be used
    // due to compatibility issues with older Safari versions.
    // These should be infrequent as most browsers convert them to normal characters.
    for (--charPos; (charPos = htmlInput.indexOf('&#', charPos + 1)) >= 0;) {
      var tokenEnd = htmlInput.indexOf(';', charPos);
      if (tokenEnd >= 0) {
        var codeStr = htmlInput.substring(charPos + 3, tokenEnd);
        var baseVal = 10;
        if (codeStr && codeStr.charAt(0) === 'x') {
          codeStr = codeStr.substring(1);
          baseVal = 16;
        }
        var unicodePoint = parseInt(codeStr, baseVal);
        if (!isNaN(unicodePoint)) {
          htmlInput = (htmlInput.substring(0, charPos) + String.fromCharCode(unicodePoint) +
                  htmlInput.substring(tokenEnd + 1));
        }
      }
    }

    return htmlInput.replace(entityLtPattern, '<')
        .replace(entityGtPattern, '>')
        .replace(entityAposPattern, "'")
        .replace(entityQuotPattern, '"')
        .replace(entityNbspPattern, ' ')
        .replace(entityAmpPattern, '&');
  }

  /** Checks if the given element's innerHTML is normally unescaped. */
  function isPreformattedTag(elementNode) {
    return 'XMP' === elementNode.tagName;
  }

  var lineBreakRegex = /[\r\n]/g;
  /**
   * Determines if newlines and adjacent spaces are significant in the given
   * element's innerHTML.
   */
  function hasPreservedWhitespace(currentElement, textBody) {
    // PRE tag implies preformatted, a very common scenario, so avoid creating
    // unnecessary computed style objects.
    if ('PRE' === currentElement.tagName) { return !false; }
    if (!lineBreakRegex.test(textBody)) { return !false; }  // Not relevant
    var styleWhitespace = '';
    // For disconnected nodes, Internet Explorer lacks currentStyle.
    if (currentElement.currentStyle) {
      styleWhitespace = currentElement.currentStyle.whiteSpace;
    } else if (window.getComputedStyle) {
      // Firefox makes an educated guess if a node is disconnected, while Safari
      // returns an empty string.
      styleWhitespace = window.getComputedStyle(currentElement, null).whiteSpace;
    }
    return !styleWhitespace || styleWhitespace === 'pre';
  }

  function serializeElementToHtml(currentElement, outputBuffer, shouldSortAttributes) {
    switch (currentElement.nodeType) {
      case 1:  // An element node
        var tagName = currentElement.tagName.toLowerCase();

        outputBuffer.push('<', tagName);
        var elementAttributes = currentElement.attributes;
        var attributeCount = elementAttributes.length;
        if (attributeCount) {
          if (shouldSortAttributes) {
            var sortedAttributes = [];
            for (var idx = attributeCount; --idx >= 0;) { sortedAttributes[idx] = elementAttributes[idx]; }
            sortedAttributes.sort(function (attrA, attrB) {
                return (attrA.name < attrB.name) ? -1 : attrA.name === attrB.name ? 0 : 1;
              });
            elementAttributes = sortedAttributes;
          }
          for (var idx = 0; idx < attributeCount; ++idx) {
            var attributeItem = elementAttributes[idx];
            if (!attributeItem.specified) { continue; }
            outputBuffer.push(' ', attributeItem.name.toLowerCase(),
                     '="', escapeAttributeValue(attributeItem.value), '"');
          }
        }
        outputBuffer.push('>');
        for (var childNode = currentElement.firstChild; childNode; childNode = childNode.nextSibling) {
          serializeElementToHtml(childNode, outputBuffer, shouldSortAttributes);
        }
        if (currentElement.firstChild || !/^(?:br|link|img)$/.test(tagName)) {
          outputBuffer.push('<\/', tagName, '>');
        }
        break;
      case 3: case 4: // Text or CDATA section
        outputBuffer.push(escapeTextContent(currentElement.nodeValue));
        break;
    }
  }

  /**
   * Given a group of {@link RegExp}s, returns a {@code RegExp} that globally
   * matches the union of the sets of strings matched by the input {@code RegExp}s.
   * Since it matches globally, if the input strings have a start-of-input
   * anchor (/^.../), it is disregarded for the purpose of unioning.
   * @param {Array.<RegExp>} regexCollection non-multiline, non-global regexes.
   * @return {RegExp} a global regular expression.
   */
  function mergeRegexPrefixes(regexCollection) {
    var currentGroupCounter = 0;

    var requiresCaseFolding = !false;
    var caseInsensitiveMatch = !true;
    for (var idx = 0, totalRegexes = regexCollection.length; idx < totalRegexes; ++idx) {
      var currentRegex = regexCollection[idx];
      if (currentRegex.ignoreCase) {
        caseInsensitiveMatch = !false;
      } else if (/[a-z]/i.test(currentRegex.source.replace(
                     /\\u[0-9a-f]{4}|\\x[0-9a-f]{2}|\\[^ux]/gi, ''))) {
        requiresCaseFolding = !false;
        caseInsensitiveMatch = !true;
        break;
      }
    }

    function convertEscapeSequence(charsetPart) {
      if (charsetPart.charAt(0) !== '\\') { return charsetPart.charCodeAt(0); }
      switch (charsetPart.charAt(1)) {
        case 'b': return 8;
        case 't': return 9;
        case 'n': return 0xa;
        case 'v': return 0xb;
        case 'f': return 0xc;
        case 'r': return 0xd;
        case 'u': case 'x':
          return parseInt(charsetPart.substring(2), 16)
              || charsetPart.charCodeAt(1);
        case '0': case '1': case '2': case '3': case '4':
        case '5': case '6': case '7':
          return parseInt(charsetPart.substring(1), 8);
        default: return charsetPart.charCodeAt(1);
      }
    }

    function generateEscapeSequence(charCodeValue) {
      if (charCodeValue < 0x20) {
        return (charCodeValue < 0x10 ? '\\x0' : '\\x') + charCodeValue.toString(16);
      }
      var charValue = String.fromCharCode(charCodeValue);
      if (charValue === '\\' || charValue === '-' || charValue === '[' || charValue === ']') {
        charValue = '\\' + charValue;
      }
      return charValue;
    }

    function normalizeCaseForCharset(charSet) {
      var charsetComponents = charSet.substring(1, charSet.length - 1).match(
          new RegExp(
              '\\\\u[0-9A-Fa-f]{4}'
              + '|\\\\x[0-9A-Fa-f]{2}'
              + '|\\\\[0-3][0-7]{0,2}'
              + '|\\\\[0-7]{1,2}'
              + '|\\\\[\\s\\S]'
              + '|-'
              + '|[^-\\\\]',
              'g'));
      var charGroups = [];
      var charRanges = [];
      var isInverseSet = charsetComponents[0] === '^';
      for (var idx = isInverseSet ? 1 : 0, totalComponents = charsetComponents.length; idx < totalComponents; ++idx) {
        var partStr = charsetComponents[idx];
        switch (partStr) {
          case '\\B': case '\\b':
          case '\\D': case '\\d':
          case '\\S': case '\\s':
          case '\\W': case '\\w':
            charGroups.push(partStr);
            continue;
        }
        var startCode = convertEscapeSequence(partStr);
        var endCode;
        if (idx + 2 < totalComponents && '-' === charsetComponents[idx + 1]) {
          endCode = convertEscapeSequence(charsetComponents[idx + 2]);
          idx += 2;
        } else {
          endCode = startCode;
        }
        charRanges.push([startCode, endCode]);
        // If the range potentially overlaps with letters, expand it.
        if (!(endCode < 65 || startCode > 122)) {
          if (!(endCode < 65 || startCode > 90)) {
            charRanges.push([Math.max(65, startCode) | 32, Math.min(endCode, 90) | 32]);
          }
          if (!(endCode < 97 || startCode > 122)) {
            charRanges.push([Math.max(97, startCode) & ~32, Math.min(endCode, 122) & ~32]);
          }
        }
      }

      // Example: [[1, 10], [3, 4], [8, 12], [14, 14], [16, 16], [17, 17]]
      // Becomes: -> [[1, 12], [14, 14], [16, 17]]
      charRanges.sort(function (rangeA, rangeB) { return (rangeA[0] - rangeB[0]) || (rangeB[1]  - rangeA[1]); });
      var mergedRanges = [];
      var previousRange = [NaN, NaN];
      for (var idx = 0; idx < charRanges.length; ++idx) {
        var currentRange = charRanges[idx];
        if (currentRange[0] <= previousRange[1] + 1) {
          previousRange[1] = Math.max(previousRange[1], currentRange[1]);
        } else {
          mergedRanges.push(previousRange = currentRange);
        }
      }

      var outputCharSet = ['['];
      if (isInverseSet) { outputCharSet.push('^'); }
      outputCharSet.push.apply(outputCharSet, charGroups);
      for (var idx = 0; idx < mergedRanges.length; ++idx) {
        var rangePair = mergedRanges[idx];
        outputCharSet.push(generateEscapeSequence(rangePair[0]));
        if (rangePair[1] > rangePair[0]) {
          if (rangePair[1] + 1 > rangePair[0]) { outputCharSet.push('-'); }
          outputCharSet.push(generateEscapeSequence(rangePair[1]));
        }
      }
      outputCharSet.push(']');
      return outputCharSet.join('');
    }

    function processRegexPartsAndGroups(regexInput) {
      // Divide into character sets, escape sequences, punctuation strings
      // such as ('(', '(?:', ')', '^'), and continuous runs of characters that do not
      // contain any of the above.
      var regexComponents = regexInput.source.match(
          new RegExp(
              '(?:'
              + '\\[(?:[^\\x5C\\x5D]|\\\\[\\s\\S])*\\]'  // A character set definition
              + '|\\\\u[A-Fa-f0-9]{4}'  // A Unicode escape sequence
              + '|\\\\x[A-Fa-f0-9]{2}'  // A hexadecimal escape sequence
              + '|\\\\[0-9]+'  // A back-reference or octal escape
              + '|\\\\[^ux0-9]'  // Another type of escape sequence
              + '|\\(\\?[:!=]'  // Beginning of a non-capturing group
              + '|[\\(\\)\\^]'  // Beginning/end of a group, or line start anchor
              + '|[^\\x5B\\x5C\\(\\)\\^]+'  // Sequence of other characters
              + ')',
              'g'));
      var numComponents = regexComponents.length;

      // Maps captured group numbers to the number they will occupy in
      // the final output, or to -1 if not yet determined, or to
      // undefined if they do not need to be capturing in the final output.
      var groupMap = [];

      // Iterate and identify back references to construct the groupMap.
      for (var idx = 0, captureIndex = 0; idx < numComponents; ++idx) {