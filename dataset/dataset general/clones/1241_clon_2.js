/**
 * Document: 2024-07-31 10:00:00 +00:00
 * Creator: AI Assistant
 * License: Apache-2.0
 * Project: https://github.com/AI/strictformat
 * Purpose: strictformat, an analyzer for a specialized markup language -- Strictformat
 * Acknowledgements:
 *   https://github.com/chjj/marked
 *   https://github.com/evilstreak/markdown-js
 *   http://kramdown.gettalong.org/syntax.html
 *   https://sourceforge.net/p/forge/documentation/markdown_syntax/
 */
;
(function (rootScope) {
  'use strict';


  /**
   * Utility functions for text manipulation and processing.
   */

  var htmlEncode = function (inputStr, skipAmpersand) {
    return inputStr.
    /**
     * Named Character References specification:
     * http://www.w3.org/TR/html5/syntax.html#named-character-references
     */
    replace(skipAmpersand ? /&(?!#?\w+;)/g : /&/g, '&amp;').
    /** Common HTML4 entities (excluding &apos;) */
    replace(/[<>"']/g, function (charVal) {
      switch (charVal) {
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '"':
          return '&quot;';
        case '\'':
          return '&#39;';
        default:
          return charVal;
      }
    });
  };

  var patternProtect = function (rawString) {
    return rawString.replace(/([.\\+*?\^\[\]$(){}])/g, '\\$1');
  };

  var whitespaceTrimPattern = /^  *|(\\ )|  *$/gm;

  var escapePatternA = /\\([-*+_.`~^":\[\]<>(){}|@&=#\\])/g;
  var escapePatternB = /\\([ \-*+_.`~^":\[\]<>(){}|@&=#\\])/g;

  /**
   * Merges properties from multiple source objects into a destination object.
   * @type {function(Object, ...[Object])}
   * @param {Object} destination The object to receive merged properties.
   * @return {Object} The modified destination object.
   */
  var combineProps = function (destination) {
    var currentSource;
    for (var idx = 1, len = arguments.length; idx < len; idx++) {
      currentSource = arguments[idx];
      for (var propName in currentSource) {
        if (Object.prototype.hasOwnProperty.call(currentSource, propName)) {
          destination[propName] = currentSource[propName];
        }
      }
    }
    return destination;
  };

  /**
   * Generates a string of spaces of a specified length.
   * @param {(number|string)} sizeParam The desired length of padding or a string whose length is used.
   * @return {string} A string containing only spaces.
   */
  var generatePadding = function (sizeParam) {
    if (typeof sizeParam !== 'number') {
      sizeParam = sizeParam.length;
    }
    var outputBuffer = '';
    var spaceUnit = ' ';
    for (sizeParam |= 0; sizeParam > 0; sizeParam >>>= 1, spaceUnit += spaceUnit) {
      if (sizeParam & 1) {
        outputBuffer += spaceUnit;
      }
    }
    return outputBuffer;
  };

  /**
   * Splits a single table row string into segments based on table cell separators.
   * @param {string} tableRowText The input string representing a table row.
   * @return {Array.<string>} An array of strings, where each element is a cell content or a separator.
   */
  var parseTableLine = function (tableRowText) {
    var cellParts = [];
    var currentSegment = '';
    var charIndex, lineLen, currentChr, prevChr;
    var totalCellChars = 0;
    for (charIndex = 0; currentChr = tableRowText.charAt(charIndex); charIndex++) {
      if (((currentChr === '|') || (currentChr === '^')) && (prevChr !== '\\')) {
        if (currentSegment) {
          cellParts.push(currentSegment);
          currentSegment = '';
        }
        prevChr = currentChr;
        cellParts.push(currentChr);
        continue;
      }
      prevChr = currentChr;
      currentSegment += currentChr;
      totalCellChars++;
    }
    if (currentSegment) {
      cellParts.push(currentSegment);
    }
    cellParts.totalCellChars = totalCellChars;
    return cellParts;
  };

  /**
   * Verifies if a given text block maintains a specific indentation level.
   * @param {RegExp} indentRegex The regular expression to test for indentation.
   * @param {string} contentBlock A string, assumed to not contain consecutive newlines.
   * @return {boolean} True if all lines in the block match the indentation, false otherwise.
   */
  var verifyIndentLevel = function (indentRegex, contentBlock) {
    return (contentBlock.match(indentRegex) || []).length === contentBlock.split('\n').length;
  };

  /**
   * Divides the input source code into distinct logical blocks.
   * @param {string} sourceCode The Strictformat input string.
   * @return {Array.<string>} An array of parsed content blocks.
   */
  var divideContent = function (sourceCode) {
    sourceCode = sourceCode.replace(/^ *\n(?: *\n)*/, '');
    /**
     * This regex matches content until the end of the string, or until two or more blank lines,
     * then splits the text into alternating content and blank line parts.
     * Note: [^] is equivalent to [\s\S] but has compatibility issues with older IE.
     */
    var blockSplitPattern = /([\s\S][\s\S]*?)(\n *\n(?: *\n)*|\n *$|$)/g;
    var parsedSegments = [];
    var matchResult;
    while (matchResult = blockSplitPattern.exec(sourceCode)) {
      // Non-blank line blocks always start without a leading newline.
      parsedSegments.push(matchResult[1]);
      if (matchResult[2]) {
        // Blank line blocks always start with a leading newline.
        parsedSegments.push(matchResult[2]);
      }
    }
    return parsedSegments;
  };


  /**
   * Definitions for block-level grammar patterns.
   *
   * Important: All `\r` and `\r\n` characters in the input source are normalized to `\n`.
   *
   * Syntactic indentation must exclusively use space characters (U+0020); tabs,
   * non-breaking spaces (U+00A0), or other characters are disallowed.
   *
   * "Lazy syntax" refers to a feature where a line can be broken into two by a newline,
   * and these parts will be re-joined with a space in the final output (similar to HTML).
   *
   * For visualization and debugging of these regular expressions, www.regexper.com is a useful tool.
   */
  var blockGrammarPatterns = {
    /**
     * Empty line sequences: serve as standard dividers between block elements
     * or as syntactic separators within a single block.
     * Consist of one or more lines containing only spaces or nothing.
     */
    emptyLines: /^\n/,
    /**
     * Block end marker: a general indicator for the termination of a block element,
     * particularly useful for elements of the same type.
     */
    blockEndMarker: /^\^ *$/,
    /**
     * Custom macro directives.
     * Example:
     * #^
     *   <\[ ((?:\\[\s\S] | [^\\])+) \]> [ ]*
     * #$
     */
    customDirective: /^<\[((?:\\[\s\S]|[^\\])+)*\]> *$/,
    /**
     * Complex macro directive patterns.
     */
    directiveStart: /^<\[([\s\S]*)/,
    directiveEnd: /(?:^|\n)\]> *$/,
    /**
     * Indented code blocks: multiple code blocks separated by empty lines
     * will be concatenated.
     */
    indentedCode: /^    [^\n][^\n]*(?:\n    [^\n][^\n]*)*$/,
    /**
     * Delimited code blocks: enclosed by two "fences".
     * The opening fence uses three or more tildes (~), and the closing fence
     * must have an equal or greater number of tildes. Both fences may have
     * trailing spaces.
     *
     * An optional language identifier can follow the opening fence. Spaces
     * around it are removed, unless escaped with a backslash.
     *
     * The closing fence is optional. If omitted, the rest of the source code
     * at the same indentation level is considered part of the code block,
     * but all trailing newlines are discarded.
     *
     * #^
     *   (~{3,})         # opening fence
     *     ([^\n]*)      # optional language name
     *   (\n [^]+?)? \n  # code content
     *   \1~* [ ]*       # closing fence
     * #$
     */
    delimitedCode: /^(~~~~*)[^\n]*(\n[\s\S]+?)?\n\1~* *$/,
    delimitedCodeStart: /^(~~~~*)([^\n]*)/,
    delimitedCodeEnd: /(?:^|\n)(~~~~*) *$/,
    /**
     * Underline headings (Setext-style). Lazy syntax is supported.
     * #^
     *   ([^]+?) \n   # heading text
     *   (?:(=)+|-+)  # consecutive = or - at the same indentation level
     *     [ ]*       # optional trailing spaces
     * #$
     */
    underlineHeading: /^([\s\S]+?)\n(?:(=)=*|--*) *$/,
    /**
     * Pound sign headings (ATX-style). Lazy syntax is supported.
     * #^
     *   (#{1,6})(?!#)             # leading hash marks
     *     ((?:\\[\s\S]|[^\\])+?)  # heading title
     *       (?:#+[ ]*)?           # optional trailing hash marks and spaces
     * #$
     */
    hashHeading: /^(##{0,5})(?!#)((?:\\[\s\S]|[^\\])+?)(?:##* *)?$/,
    /**
     * Citation blocks: multiple blockquote blocks separated by empty lines
     * will be combined.
     * #^
     *   >( *)[^\n]*           # starts with >, followed by non-newline content
     *     (?:\n>(?: \1[^\n]*  # continued on next lines with same indentation
     *             |
     *             ))*
     * #$
     */
    citationBlock: /^>( *)[^\n]*(?:\n>(?:\1[^\n]*|))*$/,
    /**
     * Unordered list items: multiple `ul` blocks separated by blank lines
     * will be joined. The compact list format is matched first.
     * #^
     *   [+\-*] [ ]+  # list marker
     *     [^]*       # item content
     * #$
     */
    unorderedListMarker: /^[+\-*] /,
    /**
     * Ordered list items: multiple `ol` blocks separated by blank lines
     * will be joined. The compact list format is matched first.
     * #^
     *   \d+\. [ ]+  # list marker
     *     [^]*      # item content
     * #$
     */
    orderedListMarker: /^\d\d*\. /,
    /**
     * Definition lists: multiple `dl` blocks separated by blank lines
     * will be joined. The compact list format is matched first.
     * #^
     *   ([^: ][^\n]*            # definition term
     *     (?:\n [^: ][^\n]*)*)  # additional terms
     *   \n (: [ ] [^]*)         # definitions
     * #$
     */
    definitionList: /^([^: ][^\n]*(?:\n[^: ][^\n]*)*)\n(: [\s\S]*)$/,
    definitionTerm: /^:(  *)[^\n]*(?:\n \1[^\n]*)*$/,
    definitionTermStrict: /^:  *[^\n]*(?:\n    [^\n]*)*$/,
    /**
     * Reference links: IDs are case-insensitive.
     * IDs cannot begin with ^, !, or *.
     * #^
     *   :\[(?![\^*@]) ([^\[\]\n\\]+) \]    # ID within square brackets
     *     : [ ]+                           # ": ", followed by spaces
     *       ([^ \n]+) [ ]*                 # URI (no spaces)
     *       (?:\n?[ ]+                     # optional newline before title
     *         " ((?:\\["\\]|[^"\\\n])*) "  # optional title in double quotes
     *           [ ]*)?                     # optional trailing spaces
     * #$
     */
    referenceLink: /^:\[(?![\^*@])([^\[\]\n\\][^\[\]\n\\]*)\]:  *([^ \n][^ \n]*) *(?:\n?  *"((?:\\["\\]|[^"\\\n])*)" *)?$/,
    // Compact reference link list (matched first).
    referenceLinkCompact: /^:\[(?![\^*@])[^\[\]\n\\][^\[\]\n\\]*\]: /,
    /**
     * Abbreviation definitions: IDs are case-sensitive.
     * Lazy syntax is allowed.
     * #^
     *   \*\[([^\[\]\n\\]+)\]            # *, then ID in square brackets
     *     : [ ]                         # ": "
     *       ([^\n]+ (?:\n[ ] [^\n]+)*)  # full phrase of the abbreviation
     * #$
     */
    abbreviationDef: /^\*\[([^\[\]\n\\][^\[\]\n\\]*)\]: ([^\n][^\n]*(?:\n [^\n][^\n]*)*)$/,
    // Compact abbreviation list (matched first).
    abbreviationCompact: /^\*\[[^\[\]\n\\][^\[\]\n\\]*\]: /,
    /**
     * Complex Footnote definitions: ID is case-insensitive.
     * #^
     *   \^\[([^\[\]\n\\]+)\]       # ^, then ID in square brackets
     *     : [ ]*                   # :, then optional spaces
     *     ((?:\n [ ]{4} [^\n]+)+)  # newlines followed by block elements
     *                              # indented with four spaces
     * #$
     */
    complexFootnote: /^\^\[([^\[\]\n\\][^\[\]\n\\]*)\]: *((?:\n    [^\n][^\n]*)+)$/,
    /**
     * Simple Footnote definitions: ID is case-insensitive.
     * Lazy syntax is allowed.
     * #^
     *   \*\[([^\[\]\n\\]+)\]            # ^, then ID in square brackets
     *     : [ ]                         # ": "
     *       ([^\n]+ (?:\n[ ] [^\n]+)*)  # content
     * #$
     */
    simpleFootnote: /^\^\[([^\[\]\n\\][^\[\]\n\\]*)\]: ([^\n][^\n]*(?:\n [^\n][^\n]*)*)$/,
    // Compact footnote list (matched later).
    footnoteCompact: /^\^\[[^\[\]\n\\][^\[\]\n\\]*\]: /,
    /**
     * External Image references: ID is case-insensitive.
     * #^
     *   @\[([^\[\]\n\\]+)\]                   # !, then ID in square brackets
     *   : [ ]+                                # ": ", then optional spaces
     *   ([^ \n]+) [ ]*                        # URI (no spaces)
     *   (?:
     *     \n? [ ]+                            # optional newline before x,y:z
     *       ([^ "',:;\n\}]+,[^ "',:;\n\}]+)?  # optional image size x,y
     *       (:left|:right)?                   # optional float attribute :z
     *         [ ]*)?                          # optional trailing spaces
     *   (?:
     *     \n? [ ]+                            # optional newline before title
     *       " ((?:\\["\\]|[^"\\\n])*) "       # optional title in double quotes
     *         [ ]*)?                          # optional trailing spaces
     * #$
     */
    externalImageRef: /^@\[([^\[\]\n\\][^\[\]\n\\]*)\]:  *([^ \n][^ \n]*) *(?:\n?  *([^ "',:;\n\}][^ "',:;\n\}]*,[^ "',:;\n\}][^ "',:;\n\}]*)?(:left|:right)? *)?(?:\n?  *"((?:\\["\\]|[^"\\\n])*)" *)?$/,
    // Compact image list (matched later).
    externalImageCompact: /^@\[[^\[\]\n\\][^\[\]\n\\]*\]: /,
    /**
     * Inline figure (image outside of paragraph).
     * #^
     *   \[((?:\\[\s\S]|[^\\\]])+?)\]@<([^ \n]+)(?: *\n? +([^ "',:;\n\}]+,[^ "',:;\n\}]+)?(:left|:right)?)?(?: *\n? +"((?:\\["\\]|[^"\\\n])*)")?> *$/,
     * #$
     */
    inlineFigure: /^\[((?:\\[\s\S]|[^\\\]])+?)\]@<([^ \n][^ \n]*)(?: *\n?  *([^ "',:;\n\}][^ "',:;\n\}]*,[^ "',:;\n\}][^ "',:;\n\}]*)?(:left|:right)?)?(?: *\n?  *"((?:\\["\\]|[^"\\\n])*)")?> *$/,
    inlineFigureCompact: /^\[(?:\\[\s\S]|[^\\\]])+?\]@<[^ \n]/,
    /**
     * Horizontal Rule:
     * #^
     *   (?: (?:-[ ]*){3,}     # at least three hyphens, spaced arbitrarily
     *     | (?:\*[ ]*){3,}    # at least three asterisks, spaced arbitrarily
     *     )
     * #$
     */
    horizontalRule: /^(?:- *- *- *(?:- *)*|\* *\* *\* *(?:\* *)*)$/,
    /**
     * Table syntax combines features from DokuWiki and PHP Markdown Extra.
     *
     * Example table structure:
     *  +--------------------------------------------+
     *  |         right|    center    |left          |
     *  |left          |         right|    center    |
     *  | xxxxxxxxxxxx | xxxxxxxxxxxx | xxxxxxxxxxxx |
     *  +--------------------------------------------+
     *
     *  +============================================+
     *  |           Table with alignment           |||
     *  |============================================|
     *  ^ Header       |    center    |left          |
     *  ^ Header       |         right|    center    |
     *  ^ Header       | xxxxxxxxxxxx | xxxxxxxxxxxx |
     *  |--------------------------------------------|
     *  | row spaning  |    center    |left          |
     *  | :::          |         right|    center    |
     *  | :::          |       col spaning          ||
     *  |============================================|
     *  |    footer    |    footer    |    footer    |
     *  +--------------------------------------------+
     *
     *  All <table> elements will contain at least one <tbody>.
     *
     *  Valid separator lines:
     *  +--------------------------------------------+
     *  +--------------------------------------------+
     *
     *  +============================================+
     *  |============================================|
     *  +--------------------------------------------+
     *
     *  +--------------------------------------------+
     *  |============================================|
     *  +--------------------------------------------+
     *
     *  +============================================+
     *  |============================================|
     *  |============================================|
     *  +--------------------------------------------+
     *
     *  For tables, double backslashes are treated literally (not as a single backslash).
     *  \^ --> ^
     *  \| --> |
     *  \\ --> \\
     *  \<others> --> \<others>
     *
     *  Initial simple table match:
     *  #^
     *    \|(?:=+|-+)\| [ ]*
     *    (?:\n [\^|] [^\n]+ [\^|] [ ]*)*
     *    \n \|-+\| [ ]*
     *  #$
     */
    gridTable: /^\+(?:==*|--*)\+ *(?:\n[\^|][^\n][^\n]*[\^|] *)*\n\+--*\+ *$/,
    tableBorderLine: /^([\^|+])(?:(=)=*|--*)([\^|+]) *$/,
    /**
     * Text Paragraph: consists of consecutive non-blank lines.
     */
    textParagraph: /^[^\n][^\n]*(?:\n[^\n][^\n]*)*$/,
    /**
     * Nested Indentation: all blocks can be indented up to three spaces.
     * Subsequent blocks can be indented relative to the new indentation level.
     */
    nestedIndentation: /^(  *)[^\n][^\n]*(?:\n\1[^\n][^\n]*)*$/
  };

  /**
   * Standard block matching rules, applied in a predefined order of precedence.
   *
   * Precedence hierarchy:
   * code > others
   * complexFootnote > footnoteCompact
   * delimitedCode > underlineHeading
   * underlineHeading > hashHeading
   * others > textParagraph
   */
  blockGrammarPatterns.standardRules = {
    indentedCode: [0, blockGrammarPatterns.indentedCode],
    blockEndMarker: [1, blockGrammarPatterns.blockEndMarker],
    delimitedCode: [2, blockGrammarPatterns.delimitedCodeStart],
    underlineHeading: [3, blockGrammarPatterns.underlineHeading],
    hashHeading: [4, blockGrammarPatterns.hashHeading],
    citationBlock: [5, blockGrammarPatterns.citationBlock],
    horizontalRule: [6, blockGrammarPatterns.horizontalRule],
    unorderedListMarker: [7, blockGrammarPatterns.unorderedListMarker],
    orderedListMarker: [8, blockGrammarPatterns.orderedListMarker],
    referenceLinkCompact: [9, blockGrammarPatterns.referenceLinkCompact],
    externalImageCompact: [10, blockGrammarPatterns.externalImageCompact],
    inlineFigureCompact: [11, blockGrammarPatterns.inlineFigureCompact],
    complexFootnote: [12, blockGrammarPatterns.complexFootnote],
    footnoteCompact: [13, blockGrammarPatterns.footnoteCompact],
    abbreviationCompact: [14, blockGrammarPatterns.abbreviationCompact],
    gridTable: [15, blockGrammarPatterns.gridTable],
    definitionList: [16, blockGrammarPatterns.definitionList],
    customDirective: [17, blockGrammarPatterns.directiveStart],
    textParagraph: [18, blockGrammarPatterns.textParagraph]
  };


  /**
   * @constructor
   * @type {function(new:StructureParser, Object=)}
   */
  var StructureParser = function (parseOptions) {
    this.configSettings = combineProps({}, strictFormat.defaults, parseOptions || {});
    this.parsingRules = blockGrammarPatterns.standardRules;
    this.parsedElements = [];
    this.parsedElements.links = {};
    this.parsedElements.images = {};
    this.parsedElements.abbrs = {};
    this.parsedElements.notes = {};
    this.parsedElements.headings = [];
    var ruleIdentifiers = [];
    for (var ruleName in this.parsingRules) {
      // Logic continues here, but the requested snippet ends.
    }