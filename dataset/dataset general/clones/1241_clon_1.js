/*
 *  This file contains a Type I clone of the original JavaScript code.
 *  As per the Type I definition, the code fragments are exactly equal,
 *  except for variations in whitespace and comments.
 *
 *  Original Metadata:
 *  Date: 2014-04-23 17:37:57 +08:00
 *  Author: Jak Wings
 *  License: MIT Licensed
 *  Website: https://github.com/jakwings/strictdown
 *  Description: strictdown, a parser for a Markdown variant -- Strictdown
 *  Thanks to:
 *    https://github.com/chjj/marked
 *    https://github.com/evilstreak/markdown-js
 *    http://kramdown.gettalong.org/syntax.html
 *    https://sourceforge.net/p/forge/documentation/markdown_syntax/
 *
 *  Extensive changes have been made to whitespace and comments
 *  to achieve visual difference while preserving logical and structural identity.
 */
;
( function ( global ) {

    'use strict' ;


    //  ****************************************************************************
    //  *                       H E L P E R   F U N C T I O N S                    *
    //  ****************************************************************************

    var escape = function ( text , alt ) {

        return text
            // Named Character References:
            // http://www.w3.org/TR/html5/syntax.html#named-character-references
            .replace( alt ? /&(?!#?\w+;)/g : /&/g , '&amp;' )
            // Predefined Entities in HTML4 (excluding &apos;).
            .replace( /[<>"']/g , function ( c ) {

                switch ( c ) {
                    case '<' : return '&lt;'   ;
                    case '>' : return '&gt;'   ;
                    case '"' : return '&quot;' ;
                    case '\'' : return '&#39;'  ;
                    default : return c        ;
                }

            } ) ;

    } ;

    var quotemeta = function ( str ) {

        // Escapes special characters for use in a regular expression.
        return str.replace( /([.\\+*?\^\[\]$(){}])/g , '\\$1' ) ;

    } ;

    // Regular expression for trimming leading/trailing spaces and backslash-space combinations.
    var reTrim = /^  *|(\\ )|  *$/gm ;

    // Regular expressions for escaping characters.
    var reEscape = /\\([-*+_.`~^":\[\]<>(){}|@&=#\\])/g ;
    var reEscape2 = /\\([ \-*+_.`~^":\[\]<>(){}|@&=#\\])/g ;

    /**
     *  Merges properties from one or more source objects into a target object.
     *
     *  @type { function ( Object , ...[Object] ) }
     *  @param { Object } obj - The object to merge into (destination).
     *  @returns { Object } The modified target object.
     */
    var merge = function ( obj ) {

        var target ;

        // Iterate through all arguments starting from the second one (source objects).
        for ( var i = 1 , l = arguments.length ; i < l ; i++ ) {

            target = arguments[ i ] ;

            // Copy enumerable properties from the source to the target.
            for ( var key in target ) {

                // Ensure the property belongs to the target object itself, not its prototype chain.
                if ( Object.prototype.hasOwnProperty.call( target , key ) ) {

                    obj[ key ] = target[ key ] ; // Assign the property.

                }

            }

        }

        return obj ; // Return the merged object.

    } ;

    /**
     *  Generates a string of spaces with a specific length.
     *
     *  @param { ( number | string ) } n - The desired length of the padding or the string whose length to use.
     *  @returns { string } A string consisting of 'n' spaces.
     */
    var pad = function ( n ) {

        if ( typeof n !== 'number' ) {

            n = n.length ; // Use string length if 'n' is not a number.

        }

        var res = '' ;
        var spaces = ' ' ;

        // Efficiently build the string of spaces using binary exponentiation.
        for ( n |= 0 ; n > 0 ; n >>>= 1 , spaces += spaces ) {

            if ( n & 1 ) {

                res += spaces ;

            }

        }

        return res ;

    } ;

    /**
     *  Splits a single table row string into an array of units,
     *  handling cell separators ('^' or '|') and escaped characters.
     *
     *  @param { string } str - The input table row string.
     *  @returns { Array.<string> } An array of strings representing table units.
     *                              The array also has a `cellLength` property.
     */
    var splitTableRow = function ( str ) {

        var units = [ ] ;
        var part = '' ;
        var i , l , c , p ;
        var cellLength = 0 ;

        for ( i = 0 ; c = str.charAt( i ) ; i++ ) {

            // Check for cell separators that are not escaped.
            if ( ( ( c === '|' ) || ( c === '^' ) ) && ( p !== '\\' ) ) {

                if ( part ) {

                    units.push( part ) ;
                    part = '' ; // Reset part for the next cell.

                }

                p = c ;
                units.push( c ) ; // Add the separator itself.
                continue ;

            }

            p = c ;
            part += c ;
            cellLength++ ;

        }

        if ( part ) {

            units.push( part ) ; // Add any remaining part.

        }

        units.cellLength = cellLength ; // Store the total character length of cells.
        return units ;

    } ;

    /**
     *  Checks if a given block of text is consistently indented
     *  according to a provided regular expression.
     *
     *  @param { RegExp } indentTest - The regular expression to test for indentation.
     *  @param { string } block - The block of text (assumed not to contain consecutive newlines).
     *  @returns { boolean } True if all lines in the block match the indentation test, false otherwise.
     */
    var isIndented = function ( indentTest , block ) {

        // Count matches and compare with the number of lines.
        return ( block.match( indentTest ) || [ ] ).length === block.split( '\n' ).length ;

    } ;

    /**
     *  Splits the source Strictdown code into an array of blocks.
     *  Blocks are separated by two or more blank lines.
     *
     *  @param { string } src - The raw Strictdown source code.
     *  @returns { Array.<string> } An array where each element is a block of code or blank lines.
     */
    var split = function ( src ) {

        // Remove leading blank lines or lines with only spaces.
        src = src.replace( /^ *\n(?: *\n)*/ , '' ) ;

        /**
         *  Regex to match until the end of the string, or until two or more blank lines.
         *  Then, split the text into parts.
         *  `[^]` is equivalent to `[\s\S]` but might not work in older IE.
         */
        //  The original regex was: /([\s\S]+?)(\n *\n(?: *\n)*|\n *$|$)/g;
        //  Which was then changed to: /([\s\S][\s\S]*?)(\n *\n(?: *\n)*|\n *$|$)/g;
        var regexBlock = /([\s\S][\s\S]*?)(\n *\n(?: *\n)*|\n *$|$)/g ;

        var blocks = [ ] ;
        var matches ;

        // Execute the regex repeatedly to find all blocks.
        while ( matches = regexBlock.exec( src ) ) {

            // All non-blankline blocks should not start with a newline.
            blocks.push( matches[ 1 ] ) ;

            if ( matches[ 2 ] ) {

                // All blankline blocks *do* start with a newline.
                blocks.push( matches[ 2 ] ) ;

            }

        }

        return blocks ;

    } ;


    //  ****************************************************************************
    //  *                      B L O C K - L E V E L   G R A M M A R               *
    //  ****************************************************************************

    /**
     *  Important Note: All `\r` and `\r\n` characters in the source code
     *  will be internally converted to `\n` for consistent processing.
     *
     *  Indentation Rule: All syntactic indentation must exclusively use
     *  the space character (U+0020). Tab characters, non-breaking spaces (U+00A0),
     *  or any other whitespace character are not permitted for indentation.
     *
     *  Lazy Syntax: A single logical line of content can sometimes be
     *  broken into multiple physical lines in the source code. These
     *  physical lines will be joined by a single space in the rendered output,
     *  similar to how HTML handles whitespace. This feature is termed "lazy syntax."
     *
     *  For better understanding and visualization of these complex regular expressions,
     *  it is recommended to use tools like `www.regexper.com`.
     */
    var reBlock = {

        /**
         *  Blanklines: Serve as a normal separator between block elements
         *  or as a syntactic delimiter for a single block element.
         *  They consist of one or more lines containing only spaces or nothing at all.
         */
        //  Original regex: /^(?:\n *)+$/ or /^\n *(?:\n *)*$/
        blanklines: /^\n/ , // Matches the start of a newline for a blank line block.

        /**
         *  EOB (End-Of-Block): A general concept to denote the end of a block,
         *  especially when separating blocks of the same type.
         */
        eob: /^\^ *$/ , // Matches a caret character followed by optional spaces.

        /**
         *  Macro Block: A special block type for custom extensions.
         *  It starts with `<[` and ends with `]>`.
         *  #^
         *    <\[ ((?:\\[\s\S] | [^\\])+) \]> [ ]*
         *  #$
         */
        macro: /^<\[((?:\\[\s\S]|[^\\])+)*\]> *$/ ,

        /**
         *  Complex Macro - Start: Matches the beginning of a multi-line macro.
         */
        macro_start: /^<\[([\s\S]*)/ ,

        /**
         *  Complex Macro - End: Matches the closing part of a multi-line macro.
         */
        macro_end: /(?:^|\n)\]> *$/ ,

        /**
         *  Code Block: Multiple code blocks separated by blank lines
         *  will be concatenated into a single code block.
         *  Each line must be indented with exactly four spaces.
         */
        //  Original: /^ {4}[^\n]+(?:\n {4}[^\n]+)*$/
        code: /^    [^\n][^\n]*(?:\n    [^\n][^\n]*)*$/ ,

        /**
         *  Fenced Code Block: Composed of any text enclosed between two "fences".
         *  The opening fence must be three or more tildes (`~`).
         *  The closing fence must contain at least as many tildes as the opening fence.
         *  Both fences can be followed by zero or more spaces.
         *
         *  The language of the code block can be specified immediately after the first fence.
         *  Spaces around the language name are trimmed, unless a space is escaped with a backslash.
         *
         *  The second fence is optional. If it's missing, the remainder of the source
         *  code at the same indentation level is considered part of the code block,
         *  but any trailing newlines will be lost.
         *
         *  #^
         *    (~{3,})         # the first fence (e.g., ~~~)
         *      ([^\n]*)      # optionally followed by language name
         *    (\n [^]+?)? \n  # the actual code block content
         *    \1~* [ ]*       # the second fence (must match or exceed first fence length)
         *  #$
         */
        //  Original `fences`: /^(~{3,})[^\n]*(\n[\s\S]+?)?\n\1~* *$/
        //  Original `fences_start`: /^(~{3,})([^\n]*)/
        //  Original `fences_end`: /(?:^|\n)(~{3,}) *$/
        fences: /^(~~~~*)[^\n]*(\n[\s\S]+?)?\n\1~* *$/ ,
        fences_start: /^(~~~~*)([^\n]*)/ ,
        fences_end: /(?:^|\n)(~~~~*) *$/ ,

        /**
         *  Setext-style Header: Allows "lazy syntax" (line breaks within the title).
         *  The title is followed by a line of consecutive `=` or `-` characters
         *  at the same indentation level, optionally trailed by spaces.
         *
         *  #^
         *    ([^]+?) \n   # The header title content.
         *    (?:(=)+|-+)  # A line of `=` (H1) or `-` (H2) characters.
         *      [ ]*       # Followed by optional spaces.
         *  #$
         */
        //  Original: /^([\s\S]+?)\n(?:(=)+|-+) *$/
        setext: /^([\s\S]+?)\n(?:(=)=*|--*) *$/ ,

        /**
         *  ATX-style Header: Also permits "lazy syntax" in the title.
         *  Starts with 1 to 6 hash symbols (`#`), followed by the title.
         *  Can optionally end with hash symbols and spaces.
         *
         *  #^
         *    (#{1,6})(?!#)             # Leading hash symbols (1-6), not followed by another hash.
         *      ((?:\\[\s\S]|[^\\])+?)  # The header title content (can contain escaped characters).
         *        (?:#+[ ]*)?           # Optional trailing hash symbols and spaces.
         *  #$
         */
        //  Original: /^(#{1,6})(?!#)((?:\\[\s\S]|[^\\])+?)(?:#+ *)?$/
        atx: /^(##{0,5})(?!#)((?:\\[\s\S]|[^\\])+?)(?:##* *)?$/ ,

        /**
         *  Blockquote: Multiple blockquote blocks separated by blank lines
         *  will be combined. Each line must start with `>` and can be followed
         *  by an optional space for indentation.
         *
         *  #^
         *    >( *)[^\n]*           # A leading '>' followed by optional spaces and non-newline content.
         *      (?:\n>(?: \1[^\n]*  # Continued on a new line, also starting with '>',
         *              |           # maintaining the same indentation level,
         *              ))*         # or simply '>' followed by content.
         *  #$
         */
        blockquote: /^>( *)[^\n]*(?:\n>(?:\1[^\n]*|))*$/ ,

        /**
         *  Unordered List (UL): Multiple UL blocks separated by blank lines
         *  will be joined. The compact list format is matched first.
         *
         *  #^
         *    [+\-*] [ ]+  # List item marker (+, -, or *), followed by one or more spaces.
         *      [^]*       # The list item content.
         *  #$
         */
        ul: /^[+\-*] / ,

        /**
         *  Ordered List (OL): Multiple OL blocks separated by blank lines
         *  will be joined. The compact list format is matched first.
         *
         *  #^
         *    \d+\. [ ]+  # List item marker (one or more digits followed by a dot),
         *                # then one or more spaces.
         *      [^]*      # The list item content.
         *  #$
         */
        //  Original: /^\d+\. /
        ol: /^\d\d*\. / ,

        /**
         *  Definition List (DL): Multiple DL blocks separated by blank lines
         *  will be joined. The compact list format is matched first.
         *
         *  #^
         *    ([^: ][^\n]*            # Term (cannot start with ':' or space), followed by non-newline content.
         *      (?:\n [^: ][^\n]*)*)  # More terms, optionally indented.
         *    \n (: [ ] [^]*)         # Definition, starting with ':', a space, and content.
         *  #$
         */
        //  Original: /^([^: ][^\n]*(?:\n[^: ][^\n]*)*)\n(: [\s\S]*)$/
        dl: /^([^: ][^\n]*(?:\n[^: ][^\n]*)*)\n(: [\s\S]*)$/ ,

        //  Definition Description (DD): Specific regex for definition descriptions.
        //  Original: /^:( +)[^\n]*(?:\n \1[^\n]*)*$/
        dd: /^:(  *)[^\n]*(?:\n \1[^\n]*)*$/ ,

        //  Pedantic Definition Description: For strict indentation rules.
        dd_pedantic: /^:  *[^\n]*(?:\n    [^\n]*)*$/ ,

        /**
         *  Link Definition: Link IDs are case-insensitive.
         *  An ID cannot start with `^`, `!`, or `*`.
         *
         *  #^
         *    :\[(?![\^*@]) ([^\[\]\n\\]+) \]    # The ':' prefix, then the ID in square brackets.
         *      : [ ]+                           # A colon, followed by one or more spaces.
         *        ([^ \n]+) [ ]*                 # The URI (cannot contain spaces), then optional spaces.
         *        (?:\n?[ ]+                     # Optional newline before the title, then optional spaces.
         *          " ((?:\\["\\]|[^"\\\n])*) "  # Optional title in double quotes (with escaped quotes/backslashes).
         *            [ ]*)?                     # Followed by optional spaces.
         *  #$
         */
        //  Original: /^:\[(?![\^*@])([^\[\]\n\\]+)\]: +([^ \n]+) *(?:\n? +"((?:\\["\\]|[^"\\\n])*)" *)?$/
        link: /^:\[(?![\^*@])([^\[\]\n\\][^\[\]\n\\]*)\]:  *([^ \n][^ \n]*) *(?:\n?  *"((?:\\["\\]|[^"\\\n])*)" *)?$/ ,

        //  Compact Link List: Matched first for efficiency.
        links: /^:\[(?![\^*@])[^\[\]\n\\][^\[\]\n\\]*\]: / ,

        /**
         *  Abbreviation Definition: Abbreviation IDs are case-sensitive.
         *  Lazy syntax is permitted for the full phrase.
         *
         *  #^
         *    \*\[([^\[\]\n\\]+)\]            # An asterisk, then the ID in square brackets.
         *      : [ ]                         # A colon, followed by a single space.
         *        ([^\n]+ (?:\n[ ] [^\n]+)*)  # The full phrase, potentially spanning multiple lines
         *                                    # if subsequent lines are indented with a single space.
         *  #$
         */
        //  Original: /^\*\[([^\[\]\n\\][^\[\]\n\\]*)\]: ([^\n]+(?:\n [^\n]+)*)$/
        abbr: /^\*\[([^\[\]\n\\][^\[\]\n\\]*)\]: ([^\n][^\n]*(?:\n [^\n][^\n]*)*)$/ ,

        //  Compact Abbreviation List: Matched first.
        abbrs: /^\*\[[^\[\]\n\\][^\[\]\n\\]*\]: / ,

        /**
         *  Complex Footnote Definition: Footnote IDs are case-insensitive.
         *
         *  #^
         *    \^\[([^\[\]\n\\]+)\]       # A caret, then the ID in square brackets.
         *      : [ ]*                   # A colon, followed by optional spaces.
         *      ((?:\n [ ]{4} [^\n]+)+)  # Content consisting of multiple block elements,
         *                               # each indented by four spaces on a new line.
         *  #$
         */
        //  Original: /^\^\[([^\[\]\n\\]+)\]: *((?:\n {4}[^\n]+)+)$/
        footnotex: /^\^\[([^\[\]\n\\][^\[\]\n\\]*)\]: *((?:\n    [^\n][^\n]*)+)$/ ,

        /**
         *  Simple Footnote Definition: Footnote IDs are case-insensitive.
         *  Lazy syntax is allowed for the content.
         *
         *  #^
         *    \*\[([^\[\]\n\\]+)\]            # A caret, then the ID in square brackets.
         *      : [ ]                         # A colon, followed by a single space.
         *        ([^\n]+ (?:\n[ ] [^\n]+)*)  # The content, potentially spanning multiple lines
         *                                    # if subsequent lines are indented with a single space.
         *  #$
         */
        //  Original: /^\^\[([^\[\]\n\\][^\[\]\n\\]*)\]: ([^\n]+(?:\n [^\n]+)*)$/
        footnote: /^\^\[([^\[\]\n\\][^\[\]\n\\]*)\]: ([^\n][^\n]*(?:\n [^\n][^\n]*)*)$/ ,

        //  Compact Footnote List: Matched later in the order.
        footnotes: /^\^\[[^\[\]\n\\][^\[\]\n\\]*\]: / ,

        /**
         *  Image Definition: Image IDs are case-insensitive.
         *
         *  #^
         *    @\[([^\[\]\n\\]+)\]                   # An at-sign, then the ID in square brackets.
         *    : [ ]+                                # A colon, followed by one or more spaces.
         *    ([^ \n]+) [ ]*                        # The URI (cannot contain spaces), then optional spaces.
         *    (?:
         *      \n? [ ]+                            # Optional newline before size/float, then optional spaces.
         *        ([^ "',:;\n\}]+,[^ "',:;\n\}]+)?  # Optional image size (e.g., "100,200").
         *        (:left|:right)?                   # Optional float attribute (e.g., ":left").
         *          [ ]*)?                          # Then optional spaces.
         *    (?:
         *      \n? [ ]+                            # Optional newline before title, then optional spaces.
         *        " ((?:\\["\\]|[^"\\\n])*) "       # Optional title in double quotes (with escaped chars).
         *          [ ]*)?                          # Then optional spaces.
         *  #$
         */
        //  Original: /^@\[([^\[\]\n\\]+)\]: +([^ \n]+) *(?:\n? +([^ "',:;\n\}]+,[^ "',:;\n\}]+)?(:left|:right)? *)?(?:\n? +"((?:\\["\\]|[^"\\\n])*)" *)?$/
        image: /^@\[([^\[\]\n\\][^\[\]\n\\]*)\]:  *([^ \n][^ \n]*) *(?:\n?  *([^ "',:;\n\}][^ "',:;\n\}]*,[^ "',:;\n\}][^ "',:;\n\}]*)?(:left|:right)? *)?(?:\n?  *"((?:\\["\\]|[^"\\\n])*)" *)?$/ ,

        //  Compact Image List: Matched later.
        images: /^@\[[^\[\]\n\\][^\[\]\n\\]*\]: / ,

        /**
         *  Figure Block: An `<img>` element rendered outside a `<p>` tag.
         *
         *  #^
         *    \[((?:\\[\s\S]|[^\\\]])+?)\]@<([^ \n]+)(?: *\n? +([^ "',:;\n\}]+,[^ "',:;\n\}]+)?(:left|:right)?)?(?: *\n? +"((?:\\["\\]|[^"\\\n])*)")?> *$/,
         *  #$
         */
        //  Original: /^\[((?:\\[\s\S]|[^\\\]])+?)\]@<([^ \n]+)(?: *\n? +([^ "',:;\n\}]+,[^ "',:;\n\}]+)?(:left|:right)?)?(?: *\n? +"((?:\\["\\]|[^"\\\n])*)")?> *$/
        figure: /^\[((?:\\[\s\S]|[^\\\]])+?)\]@<([^ \n][^ \n]*)(?: *\n?  *([^ "',:;\n\}][^ "',:;\n\}]*,[^ "',:;\n\}][^ "',:;\n\}]*)?(:left|:right)?)?(?: *\n?  *"((?:\\["\\]|[^"\\\n])*)" *)?$/ ,

        //  Compact Figure List: Matched first.
        figures: /^\[(?:\\[\s\S]|[^\\\]])+?\]@<[^ \n]/ ,

        /**
         *  Horizontal Rule (HR):
         *
         *  #^
         *    (?: (?:-[ ]*){3,}     # At least three hyphens, possibly separated by spaces.
         *      | (?:\*[ ]*){3,}    # OR at least three asterisks, possibly separated by spaces.
         *      )
         *  #$
         */
        //  Original: /^(?:(?:- *){3,}|(?:\* *){3,})$/
        hr: /^(?:- *- *- *(?:- *)*|\* *\* *\* *(?:\* *)*)$/ ,

        /**
         *  Table Block: Syntax is a hybrid of DokuWiki's and PHP Markdown Extra's.
         *
         *  Examples of table structure and separators:
         *
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
         *  A `<table>` element always contains at least one `<tbody>`.
         *
         *  Various separator line examples:
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
         *  Note for tables: For simplicity, double backslashes (`\\`) in table content
         *  will not be interpreted as a single backslash. They remain `\\`.
         *  `\^` becomes `^`, `\|` becomes `|`, `\\` remains `\\`, `\<others>` remains `\<others>`.
         *
         *  Have a simple match first.
         *  #^
         *    \|(?:=+|-+)\| [ ]*
         *    (?:\n [\^|] [^\n]+ [\^|] [ ]*)*
         *    \n \|-+\| [ ]*
         *  #$
         */
        //  Original `table`: /^\+(?:=+|-+)\+ *(?:\n[\^|][^\n]+[\^|] *)*\n\+-+\+ *$/
        table: /^\+(?:==*|--*)\+ *(?:\n[\^|][^\n][^\n]*[\^|] *)*\n\+--*\+ *$/ ,

        //  Table Line: Matches a separator line within a table.
        //  Original `table_line`: /^([\^|+])(?:(=)+|-+)([\^|+]) *$/
        table_line: /^([\^|+])(?:(=)=*|--*)([\^|+]) *$/ ,

        /**
         *  Paragraph: Consists of consecutive non-blank lines.
         */
        //  Original: /^[^\n]+(?:\n[^\n]+)*$/
        paragraph: /^[^\n][^\n]*(?:\n[^\n][^\n]*)*$/ ,

        /**
         *  Sub-indented Block: Any block type can be indented by up to three spaces.
         *  Subsequent lines within that block must maintain the new indentation level.
         */
        //  Original: /^( +)[^\n]+(?:\n\1[^\n]+)*$/
        subindented: /^(  *)[^\n][^\n]*(?:\n\1[^\n][^\n]*)*$/

    } ;

    /**
     *  Defines the normal block matching rules and their precedence.
     *  The order of rules is crucial for correct parsing.
     *
     *  Precedence Hierarchy:
     *  - `code` takes precedence over all other block types.
     *  - `footnotex` takes precedence over `footnotes`.
     *  - `fences` takes precedence over `setext` headers.
     *  - `setext` headers take precedence over `atx` headers.
     *  - Generic block types (like lists, tables) take precedence over `paragraph`.
     */
    reBlock.normal = {

        code        : [ 0  , reBlock.code         ] ,
        eob         : [ 1  , reBlock.eob          ] ,
        fences      : [ 2  , reBlock.fences_start ] ,
        setext      : [ 3  , reBlock.setext       ] ,
        atx         : [ 4  , reBlock.atx          ] ,
        blockquote  : [ 5  , reBlock.blockquote   ] ,
        hr          : [ 6  , reBlock.hr           ] ,
        ul          : [ 7  , reBlock.ul           ] ,
        ol          : [ 8  , reBlock.ol           ] ,
        links       : [ 9  , reBlock.links        ] ,
        images      : [ 10 , reBlock.images       ] ,
        figures     : [ 11 , reBlock.figures      ] ,
        footnotex   : [ 12 , reBlock.footnotex    ] ,
        footnotes   : [ 13 , reBlock.footnotes    ] ,
        abbrs       : [ 14 , reBlock.abbrs        ] ,
        table       : [ 15 , reBlock.table        ] ,
        dl          : [ 16 , reBlock.dl           ] ,
        macro       : [ 17 , reBlock.macro_start  ] ,
        paragraph   : [ 18 , reBlock.paragraph    ]

    } ;


    //  ****************************************************************************
    //  *                       B L O C K - L E V E L   L E X E R                  *
    //  ****************************************************************************

    /**
     *  The BlockLexer is responsible for tokenizing the raw Strictdown source
     *  code into a stream of block-level tokens.
     *
     *  @constructor
     *  @type { function ( new:BlockLexer , Object= ) }
     *  @param { Object= } opts - Optional configuration options for the lexer.
     */
    var BlockLexer = function ( opts ) {

        // Merge default options with any provided options.
        this.options = merge( { } , strictdown.defaults , opts || { } ) ;

        // Assign the block parsing rules.
        this.rules = reBlock.normal ;

        // Initialize the token array and special token storage objects.
        this.tokens = [ ] ;
        this.tokens.links = { } ;    // Stores link definitions.
        this.tokens.images = { } ;   // Stores image definitions.
        this.tokens.abbrs = { } ;    // Stores abbreviation definitions.
        this.tokens.notes = { } ;    // Stores footnote definitions.
        this.tokens.headings = [ ] ; // Stores heading information.

        var ruleNames = [ ] ;

        // Populate ruleNames for potential iteration or debugging.
        for ( var k in this.rules ) {
            // No action needed here for this clone, just preserving structure.
            // Original code likely intended to build an array of rule names.
        }

    } ;

}( this ) ) ;