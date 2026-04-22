// Copyright (C) 2006 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.



/*
 * @fileoverview
 * This file contains a collection of JavaScript functions for the browser-side
 * pretty printing of source code embedded within HTML documents.
 *
 * It supports a wide array of programming languages.
 * For a comprehensive list of supported languages, please refer to the
 * <a href="http://google-code-prettify.googlecode.com/svn/trunk/README.html#langs">README</a>
 * document that accompanies this source code distribution.
 *
 * The core lexer is designed to work effectively with languages such as
 * C, Java, Python, Bash, SQL, HTML, XML, CSS, JavaScript, and Makefiles.
 * It also offers passable support for Ruby, PHP, Awk, and a subset of Perl.
 * However, due to differing commenting conventions, it may not function
 * optimally with Smalltalk, Lisp-like, or CAML-like languages unless an
 * explicit language class is provided.
 *
 * <p>
 *
 * To use this library:
 * <ol>
 * <li> Integrate this source file into your HTML page by using a script tag:
 *   {@code <script type="text/javascript" src="/path/to/prettify.js"></script>}
 * </li>
 * <li> Define appropriate CSS style rules. Consult the example page for demonstrations.
 * </li>
 * <li> Mark the {@code <pre>} and {@code <code>} elements that contain your
 *    code with the {@code class="prettyprint"} attribute.
 *    The (HTML deprecated) {@code <xmp>} tag can also be used, but note that
 *    the pretty printer requires more extensive DOM manipulations for this tag,
 *    which might affect the preservation of certain CSS styles.
 * </li>
 * </ol>
 * That's all that is required. The API is designed for simplicity, eliminating
 * the need to explicitly specify the language of the code. Nevertheless, if
 * you wish to do so, you can add an additional class to the {@code <pre>} or
 * {@code <code>} element, for example: {@code <pre class="prettyprint lang-java">}.
 * Any class name beginning with "lang-" followed by a file extension will
 * specify the language type. Refer to the "lang-*.js" files in this directory
 * for implementations of language-specific handlers.
 * <p>
 *
 * Change log:<br>
 * cbeust, 2006/08/22
 * <blockquote>
 *   Java annotations (which begin with "@") are now correctly identified as
 *   literals ("lit") by the lexer.
 * </blockquote>
 *
 * @requires console
 */

// JSLint declarations to suppress warnings about global variables.
/*global console, document, navigator, setTimeout, window */


/**
 * A flag indicating whether {@code prettyPrint} should be split into multiple
 * timeouts. This prevents interference with UI events during long operations.
 * If set to {@code false}, {@code prettyPrint()} executes synchronously.
 */
window['PR_SHOULD_USE_CONTINUATION'] = true;

/**
 * Defines the number of characters between tab columns for display purposes.
 */
window['PR_TAB_WIDTH'] = 4;

/**
 * This function walks the DOM and returns a properly escaped version of the
 * innerHTML content of a given node.
 * @param {Node} node The DOM node to process.
 * @param {Array.<string>} out An output buffer that receives chunks of HTML.
 */
window['PR_normalizedHtml']

/**
 * A global object that contains functions for creating and registering new
 * language handlers for the pretty printer.
 * @type {Object}
 */
  = window['PR']

/**
 * This function pretty prints a single chunk of code.
 *
 * @param {string} sourceCodeHtml The code provided as an HTML string.
 * @return {string} The code as an HTML string, but with syntax highlighting.
 */
  = window['prettyPrintOne']

/**
 * This function finds all {@code <pre>} and {@code <code>} tags in the DOM
 * that have {@code class="prettyprint"} and applies syntax highlighting to them.
 * @param {Function?} opt_whenDone An optional callback function to be executed
 *     when the last entry has been processed and pretty printed.
 */
  = window['prettyPrint'] = void 0;

/**
 * Performs browser detection to determine if the current browser is IE6.
 * This function is memoized after the first call.
 * @extern
 * @returns {number|boolean} Returns the major version number if IE (e.g., 6, 7, 8),
 *     otherwise returns {@code false}.
 */
window['_pr_isIE6'] = function ( ) {
  var ieVersion = navigator && navigator.userAgent &&
      navigator.userAgent.match( /\bMSIE ([678])\./ );

  // Convert to number if matched, otherwise false.
  ieVersion = ieVersion ? +ieVersion[1] : false;

  // Memoize the function for subsequent calls.
  window['_pr_isIE6'] = function () { return ieVersion; };

  return ieVersion;
};


( function ( ) {
  // Define keyword lists for various programming languages.

  var FLOW_CONTROL_KEYWORDS =
      "break continue do else for if return while ";

  var C_KEYWORDS = FLOW_CONTROL_KEYWORDS + "auto case char const default " +
      "double enum extern float goto int long register short signed sizeof " +
      "static struct switch typedef union unsigned void volatile ";

  var COMMON_KEYWORDS = C_KEYWORDS + "catch class delete false import " +
      "new operator private protected public this throw true try typeof ";

  var CPP_KEYWORDS = COMMON_KEYWORDS + "alignof align_union asm axiom bool " +
      "concept concept_map const_cast constexpr decltype " +
      "dynamic_cast explicit export friend inline late_check " +
      "mutable namespace nullptr reinterpret_cast static_assert static_cast " +
      "template typeid typename using virtual wchar_t where ";

  var JAVA_KEYWORDS = COMMON_KEYWORDS +
      "abstract boolean byte extends final finally implements import " +
      "instanceof null native package strictfp super synchronized throws " +
      "transient ";

  var CSHARP_KEYWORDS = JAVA_KEYWORDS +
      "as base by checked decimal delegate descending event " +
      "fixed foreach from group implicit in interface internal into is lock " +
      "object out override orderby params partial readonly ref sbyte sealed " +
      "stackalloc string select uint ulong unchecked unsafe ushort var ";

  var JSCRIPT_KEYWORDS = COMMON_KEYWORDS +
      "debugger eval export function get null set undefined var with " +
      "Infinity NaN ";

  var PERL_KEYWORDS = "caller delete die do dump elsif eval exit foreach for " +
      "goto if import last local my next no our print package redo require " +
      "sub undef unless until use wantarray while BEGIN END ";

  var PYTHON_KEYWORDS = FLOW_CONTROL_KEYWORDS + "and as assert class def del " +
      "elif except exec finally from global import in is lambda " +
      "nonlocal not or pass print raise try with yield " +
      "False True None ";

  var RUBY_KEYWORDS = FLOW_CONTROL_KEYWORDS + "alias and begin case class def" +
      " defined elsif end ensure false in module next nil not or redo rescue " +
      "retry self super then true undef unless until when yield BEGIN END ";

  var SH_KEYWORDS = FLOW_CONTROL_KEYWORDS + "case done elif esac eval fi " +
      "function in local set then until ";

  // Concatenate all language-specific keywords into a single large string.
  var ALL_KEYWORDS = (
      CPP_KEYWORDS + CSHARP_KEYWORDS + JSCRIPT_KEYWORDS + PERL_KEYWORDS +
      PYTHON_KEYWORDS + RUBY_KEYWORDS + SH_KEYWORDS );

  // Define token style names, which correspond to CSS class names used for styling.
  /** Token style for a string literal. */
  var PR_STRING = 'str';
  /** Token style for a keyword. */
  var PR_KEYWORD = 'kwd';
  /** Token style for a comment block or line. */
  var PR_COMMENT = 'com';
  /** Token style for a type identifier. */
  var PR_TYPE = 'typ';
  /** Token style for a literal value, such as numbers, null, or boolean true/false. */
  var PR_LITERAL = 'lit';
  /** Token style for punctuation symbols. */
  var PR_PUNCTUATION = 'pun';
  /** Token style for plain text that doesn't fit other categories. */
  var PR_PLAIN = 'pln';

  /** Token style for an SGML tag (e.g., HTML, XML tags). */
  var PR_TAG = 'tag';
  /** Token style for a markup declaration, like DOCTYPE. */
  var PR_DECLARATION = 'dec';
  /** Token style for embedded source code within another language (e.g., JS in HTML). */
  var PR_SOURCE = 'src';
  /** Token style for an SGML attribute name. */
  var PR_ATTRIB_NAME = 'atn';
  /** Token style for an SGML attribute value. */
  var PR_ATTRIB_VALUE = 'atv';

  /**
   * A CSS class name used to indicate a section of markup that should not be
   * treated as code, for example, to allow embedding of line numbers within
   * code listings without them being highlighted as code.
   */
  var PR_NOCODE = 'nocode';

  /**
   * Defines a set of tokens that can legally precede a regular expression
   * literal in JavaScript. This is crucial for distinguishing division
   * operators from regex literals.
   *
   * <p>The full list of preceding tokens is derived from
   * <a href="http://www.mozilla.org/js/language/js20/rationale/syntax.html">Mozilla's JS20 rationale</a>,
   * but has been curated to remove problematic tokens that might appear in
   * languages not supporting regex literals (e.g., "in" keyword used as a unit).
   *
   * <p>Note: The linked document does not fully cover EcmaScript rules,
   * specifically the distinction between `(a=++/b/i)` and `(a++/b/i)`.
   * However, this pattern works well in practice for most cases.
   *
   * @private
   */
  var REGEXP_PRECEDER_PATTERN = ( function ( ) {
      var preceders = [
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
      var pattern = '(?:^^|[+-]';
      for ( var i = 0; i < preceders.length; ++i ) {
        pattern += '|' + preceders[i].replace( /([^=<>:&a-z])/g, '\\$1' );
      }
      pattern += ')\\s*'; // Matches at the end of the string, and also matches empty string.
      return pattern;
      // CAVEAT: This implementation does not correctly handle cases where a
      // regular expression immediately follows another, as a regular expression
      // can have flags (e.g., for case-sensitivity). However, having adjacent
      // regex tokens is generally not valid syntax in any language known,
      // so this edge case is currently overlooked.
      // TODO: Consider styling special characters within a regex as punctuation.
    } )();

  // Define regular expressions here to avoid creating new objects each time
  // the functions containing them are called. This optimization improves performance,
  // as the language specification requires a new object even if '$1' members are not accessed.
  var pr_amp = /&/g;
  var pr_lt = /</g;
  var pr_gt = />/g;
  var pr_quot = /\"/g;

  /**
   * Converts a string to HTML, escaping characters that are special in HTML
   * attributes, specifically double quotes.
   * @param {string} str The input string.
   * @return {string} The HTML-escaped string suitable for attribute values.
   */
  function attribToHtml ( str ) {
    return str.replace( pr_amp, '&amp;' )
        .replace( pr_lt, '&lt;' )
        .replace( pr_gt, '&gt;' )
        .replace( pr_quot, '&quot;' );
  }

  /**
   * Converts a plain text string to HTML, escaping common HTML special characters.
   * @param {string} str The input string.
   * @return {string} The HTML-escaped string.
   */
  function textToHtml ( str ) {
    return str.replace( pr_amp, '&amp;' )
        .replace( pr_lt, '&lt;' )
        .replace( pr_gt, '&gt;' );
  }


  var pr_ltEnt = /&lt;/g;
  var pr_gtEnt = /&gt;/g;
  var pr_aposEnt = /&apos;/g;
  var pr_quotEnt = /&quot;/g;
  var pr_ampEnt = /&amp;/g;
  var pr_nbspEnt = /&nbsp;/g;

  /**
   * Converts an HTML string back to plain text by unescaping HTML entities.
   * Handles numeric entities, named entities, and basic HTML character escapes.
   * @param {string} html The input HTML string.
   * @return {string} The unescaped plain text string.
   */
  function htmlToText ( html ) {
    var pos = html.indexOf( '&' );

    // If no '&' character is found, no unescaping is needed.
    if ( pos < 0 ) { return html; }

    // Handle numeric entities specially. Functional substitution methods
    // might not work in older browser versions (e.g., Safari).
    // These entities are expected to be rare as most browsers convert them.
    for ( --pos; ( pos = html.indexOf( '&#', pos + 1 ) ) >= 0; ) {
      var end = html.indexOf( ';', pos );
      if ( end >= 0 ) {
        var num = html.substring( pos + 3, end );
        var radix = 10;
        if ( num && num.charAt( 0 ) === 'x' ) {
          num = num.substring( 1 );
          radix = 16;
        }
        var codePoint = parseInt( num, radix );
        if ( !isNaN( codePoint ) ) {
          html = ( html.substring( 0, pos ) + String.fromCharCode( codePoint ) +
                  html.substring( end + 1 ) );
        }
      }
    }

    return html.replace( pr_ltEnt, '<' )
        .replace( pr_gtEnt, '>' )
        .replace( pr_aposEnt, "'" )
        .replace( pr_quotEnt, '"' )
        .replace( pr_nbspEnt, ' ' )
        .replace( pr_ampEnt, '&' );
  }

  /**
   * Determines if the innerHTML of a given node is normally unescaped.
   * Currently, this only applies to the XMP tag.
   * @param {Node} node The DOM node to check.
   * @return {boolean} True if the content is raw, false otherwise.
   */
  function isRawContent ( node ) {
    return 'XMP' === node.tagName;
  }

  var newlineRe = /[\r\n]/g;

  /**
   * Checks if newlines and adjacent spaces are significant within the given
   * node's innerHTML, based on its computed style.
   * @param {Node} node The DOM node to check.
   * @param {string} content The textual content of the node.
   * @return {boolean} True if the content is preformatted, false otherwise.
   */
  function isPreformatted ( node, content ) {
    // 'PRE' tag explicitly means preformatted, and is a common case.
    // Avoid unnecessary computed style object creation for this.
    if ( 'PRE' === node.tagName ) { return true; }

    // If there are no newlines, significance doesn't matter.
    if ( !newlineRe.test( content ) ) { return true; }

    var whitespace = '';
    // For disconnected nodes, IE's currentStyle is unavailable.
    if ( node.currentStyle ) {
      whitespace = node.currentStyle.whiteSpace;
    } else if ( window.getComputedStyle ) {
      // Firefox makes a best guess for disconnected nodes; Safari returns empty string.
      whitespace = window.getComputedStyle( node, null ).whiteSpace;
    }

    // If 'white-space' style is not set or is 'pre', it's preformatted.
    return !whitespace || whitespace === 'pre';
  }

  /**
   * Recursively traverses a DOM node and appends its normalized HTML
   * representation to an output array. Attributes can optionally be sorted.
   * @param {Node} node The current DOM node to process.
   * @param {Array.<string>} out The array to which HTML chunks are appended.
   * @param {boolean?} opt_sortAttrs Optional flag to sort attributes alphabetically.
   */
  function normalizedHtml ( node, out, opt_sortAttrs ) {
    switch ( node.nodeType ) {
      case 1:  // This case handles an element node.
        var name = node.tagName.toLowerCase( );

        out.push( '<', name );
        var attrs = node.attributes;
        var n = attrs.length;
        if ( n ) {
          if ( opt_sortAttrs ) {
            var sortedAttrs = [];
            for ( var i = n; --i >= 0; ) { sortedAttrs[i] = attrs[i]; }
            sortedAttrs.sort( function ( a, b ) {
                return ( a.name < b.name ) ? -1 : a.name === b.name ? 0 : 1;
              } );
            attrs = sortedAttrs;
          }
          for ( var i = 0; i < n; ++i ) {
            var attr = attrs[i];
            if ( !attr.specified ) { continue; }
            out.push( ' ', attr.name.toLowerCase( ),
                     '="', attribToHtml( attr.value ), '"' );
          }
        }
        out.push( '>' );
        for ( var child = node.firstChild; child; child = child.nextSibling ) {
          normalizedHtml( child, out, opt_sortAttrs );
        }
        // Self-closing tags should not have closing tags unless they have content.
        if ( node.firstChild || !/^(?:br|link|img)$/.test( name ) ) {
          out.push( '<\/', name, '>' );
        }
        break;

      case 3: // This case handles a text node.
      case 4: // This case handles a CDATA section node.
        out.push( textToHtml( node.nodeValue ) );
        break;
    }
  }

  /**
   * Given an array of {@link RegExp} objects, this function returns a single
   * {@code RegExp} that globally matches the union of all strings matched by
   * the input {@code RegExp}s. If an input {@code RegExp} contains a
   * start-of-input anchor (/^.../), it is ignored for the purpose of unioning.
   * @param {Array.<RegExp>} regexs An array of non-multiline, non-global regexs.
   * @return {RegExp} A new global regex representing the union.
   */
  function combinePrefixPatterns ( regexs ) {
    var capturedGroupIndex = 0;

    var needToFoldCase = false;
    var ignoreCase = false;

    // Determine if case folding is necessary across the set of regexs.
    for ( var i = 0, n = regexs.length; i < n; ++i ) {
      var regex = regexs[i];
      if ( regex.ignoreCase ) {
        ignoreCase = true;
      } else if ( /[a-z]/i.test( regex.source.replace(
                     /\\u[0-9a-f]{4}|\\x[0-9a-f]{2}|\\[^ux]/gi, '' ) ) ) {
        needToFoldCase = true;
        ignoreCase = false;
        break;
      }
    }

    /**
     * Decodes an escape sequence from a character set part into its character code.
     * @param {string} charsetPart The escape sequence string (e.g., '\n', '\x41', '\u0041').
     * @return {number} The character code.
     */
    function decodeEscape ( charsetPart ) {
      if ( charsetPart.charAt( 0 ) !== '\\' ) { return charsetPart.charCodeAt( 0 ); }
      switch ( charsetPart.charAt( 1 ) ) {
        case 'b': return 8;  // Backspace
        case 't': return 9;  // Tab
        case 'n': return 0xa; // Newline
        case 'v': return 0xb; // Vertical Tab
        case 'f': return 0xc; // Form Feed
        case 'r': return 0xd; // Carriage Return
        case 'u': // Unicode escape
        case 'x': // Hex escape
          return parseInt( charsetPart.substring( 2 ), 16 )
              || charsetPart.charCodeAt( 1 ); // Fallback if parsing fails.
        case '0': // Octal escape (up to 3 digits)
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
          return parseInt( charsetPart.substring( 1 ), 8 );
        default: // Other escaped characters (e.g., '\.')
          return charsetPart.charCodeAt( 1 );
      }
    }

    /**
     * Encodes a character code into an escape sequence if necessary, or returns
     * the character itself. Handles special regex characters.
     * @param {number} charCode The character code to encode.
     * @return {string} The encoded character or escape sequence.
     */
    function encodeEscape ( charCode ) {
      if ( charCode < 0x20 ) {
        return ( charCode < 0x10 ? '\\x0' : '\\x' ) + charCode.toString( 16 );
      }
      var ch = String.fromCharCode( charCode );
      // Escape characters that have special meaning within regex character sets.
      if ( ch === '\\' || ch === '-' || ch === '[' || ch === ']' ) {
        ch = '\\' + ch;
      }
      return ch;
    }

    /**
     * Performs case folding on a regular expression character set.
     * This expands ranges to include both upper and lower case equivalents.
     * @param {string} charSet The character set string (e.g., '[a-zA-Z]').
     * @return {string} The case-folded character set string.
     */
    function caseFoldCharset ( charSet ) {
      // Split the character set into individual parts:
      // - a character set (e.g., `[\s\S]`)
      // - unicode escapes (`\uXXXX`)
      // - hex escapes (`\xXX`)
      // - back-references or octal escapes (`\d`, `\077`)
      // - other escape sequences (`\.`, `\t`)
      // - literal hyphen (`-`)
      // - any other character not part of an escape or special regex token
      var charsetParts = charSet.substring( 1, charSet.length - 1 ).match(
          new RegExp(
              '\\\\u[0-9A-Fa-f]{4}' // Unicode escape
              + '|\\\\x[0-9A-Fa-f]{2}' // Hex escape
              + '|\\\\[0-3][0-7]{0,2}' // Octal escape (e.g., \0, \07, \077)
              + '|\\\\[0-7]{1,2}' // Shorter octal (e.g., \1, \17)
              + '|\\\\[\\s\\S]' // Other escapes (e.g., \., \+, \n)
              + '|-' // Literal hyphen
              + '|[^-\\-\\\\]', // Any other character not a hyphen or backslash
              'g' ) );
      var groups = [];
      var ranges = [];
      var inverse = charsetParts[0] === '^';

      for ( var i = inverse ? 1 : 0, n = charsetParts.length; i < n; ++i ) {
        var p = charsetParts[i];
        switch ( p ) {
          case '\\B': case '\\b': // Word boundary
          case '\\D': case '\\d': // Non-digit, digit
          case '\\S': case '\\s': // Non-whitespace, whitespace
          case '\\W': case '\\w': // Non-word, word
            groups.push( p );
            continue;
        }

        var start = decodeEscape( p );
        var end;

        // Check for range (e.g., 'a-z')
        if ( i + 2 < n && '-' === charsetParts[i + 1] ) {
          end = decodeEscape( charsetParts[i + 2] );
          i += 2;
        } else {
          end = start;
        }
        ranges.push( [start, end] );

        // If the range includes letters, expand it to include both cases.
        if ( !( end < 65 || start > 122 ) ) { // If range intersects with A-Z or a-z
          if ( !( end < 65 || start > 90 ) ) { // If range intersects with A-Z
            ranges.push( [Math.max( 65, start ) | 32, Math.min( end, 90 ) | 32] );
          }
          if ( !( end < 97 || start > 122 ) ) { // If range intersects with a-z
            ranges.push( [Math.max( 97, start ) & ~32, Math.min( end, 122 ) & ~32] );
          }
        }
      }

      // Consolidate overlapping and adjacent ranges:
      // Example: [[1, 10], [3, 4], [8, 12], [14, 14], [16, 16], [17, 17]]
      //   becomes -> [[1, 12], [14, 14], [16, 17]]
      ranges.sort( function ( a, b ) { return ( a[0] - b[0] ) || ( b[1] - a[1] ); } );
      var consolidatedRanges = [];
      var lastRange = [NaN, NaN]; // Initialize with invalid range.
      for ( var i = 0; i < ranges.length; ++i ) {
        var range = ranges[i];
        // If current range overlaps or is adjacent to the last consolidated range, merge them.
        if ( range[0] <= lastRange[1] + 1 ) {
          lastRange[1] = Math.max( lastRange[1], range[1] );
        } else {
          // Otherwise, start a new consolidated range.
          consolidatedRanges.push( lastRange = range );
        }
      }

      var out = ['['];
      if ( inverse ) { out.push( '^' ); } // If the original charset was inverted.
      out.push.apply( out, groups ); // Add back the special groups (\d, \s, etc.).

      for ( var i = 0; i < consolidatedRanges.length; ++i ) {
        var range = consolidatedRanges[i];
        out.push( encodeEscape( range[0] ) );
        if ( range[1] > range[0] ) {
          if ( range[1] + 1 > range[0] ) { out.push( '-' ); } // Only add '-' if it's a true range.
          out.push( encodeEscape( range[1] ) );
        }
      }
      out.push( ']' );
      return out.join( '' );
    }

    /**
     * Transforms a given regular expression for use in a combined pattern.
     * This function splits the regex into parts, handles case folding if needed,
     * and renumbers captured groups to avoid conflicts in the combined regex.
     * @param {RegExp} regex The regular expression to process.
     * @return {string} The transformed regex source string.
     */
    function allowAnywhereFoldCaseAndRenumberGroups ( regex ) {
      // Split the regex source into distinct components:
      // - character sets (e.g., `[a-z]`, `[^0-9]`)
      // - unicode escapes (`\uXXXX`)
      // - hex escapes (`\xXX`)
      // - octal escapes or back-references (`\1`, `\077`)
      // - other escape sequences (`\.`, `\t`)
      // - non-capturing group starts (`(?:`, `(?=`, `(?!`)
      // - group delimiters or line start/end anchors (`(`, `)`, `^`)
      // - runs of other characters that are not special regex tokens
      var parts = regex.source.match(
          new RegExp(
              '(?:'
              + '\\[(?:[^\\x5C\\x5D]|\\\\[\\s\\S])*\\]' // A character set (`[...]`)
              + '|\\\\u[A-Fa-f0-9]{4}' // A unicode escape (`\uXXXX`)
              + '|\\\\x[A-Fa-f0-9]{2}' // A hex escape (`\xXX`)
              + '|\\\\[0-9]+' // A back-reference or octal escape (`\1`, `\077`)
              + '|\\\\[^ux0-9]' // Other escape sequence (`\.`, `\t`)
              + '|\\(\\?[:!=]' // Start of a non-capturing group (`(?:`, `(?=`, `(?!`)
              + '|[\\(\\)\\^]' // Start/end of a group, or line start (`(`, `)`, `^`)
              + '|[^\\x5B\\x5C\\(\\)\\^]+' // Run of other characters
              + ')',
              'g' ) );
      var n = parts.length;

      // This array maps captured group numbers from the original regex
      // to their new numbers in the output regex.
      // A value of -1 means not yet determined.
      // Undefined means it doesn't need to be a capturing group in the output.
      var capturedGroups = [];

      // First pass: Identify back-references and build the `capturedGroups` mapping.
      for ( var i = 0, groupIndex = 0; i < n; ++i ) {