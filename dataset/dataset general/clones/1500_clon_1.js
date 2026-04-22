/*
 *  This file is part of a Markdown processing library.
 *  It is released under the MIT License.
 *
 *  Copyright (c) 2009-2010 Dominic Baggott
 *  Copyright (c) 2009-2010 Ash Berlin
 *  Copyright (c) 2011 Christoph Dorn <christoph@christophdorn.com> (http://www.christophdorn.com)
 */

/* jshint
    browser: true,
    devel:   true
*/


( function (expose) {

  // This is a JSDoc comment describing the Markdown class.
  /**
   *  class Markdown
   *
   *  Markdown processing in Javascript done right. We have very particular views
   *  on what constitutes 'right' which include:
   *
   *  - produces well-formed HTML (this means that `em` and `strong` nesting is
   *    important for correct rendering)
   *
   *  - has an intermediate representation to allow processing of parsed data (We
   *    in fact have two, both as [JsonML]: a markdown tree and an HTML tree).
   *
   *  - is easily extensible to add new dialects without having to rewrite the
   *    entire parsing mechanics from scratch.
   *
   *  - has a good, comprehensive test suite.
   *
   *  This implementation fulfills all of these (except that the test suite could
   *  do with expanding to automatically run all the fixtures from other Markdown
   *  implementations, which is a future improvement).
   *
   *  ##### Intermediate Representation
   *
   *  *TODO* Talk about this :) Its JsonML, but document the node names we use.
   *  This section needs further elaboration.
   *
   *  [JsonML]: http://jsonml.org/ "JSON Markup Language" - A standard for representing markup as JSON.
   **/
  var Markdown = expose.Markdown = function (dialect) {

    // Determine which dialect to use for parsing.
    switch ( typeof dialect ) {
      case "undefined":
        // Default to Gruber dialect if none is specified.
        this.dialect = Markdown.dialects.Gruber;
        break;

      case "object":
        // If an object is provided, assume it's a custom dialect definition.
        this.dialect = dialect;
        break;

      default:
        // Check if a known dialect name (string) was provided.
        if ( dialect in Markdown.dialects ) {
          this.dialect = Markdown.dialects[dialect];
        } else {
          // If the dialect is unknown, throw an error.
          throw new Error( "Unknown Markdown dialect '" + String(dialect) + "'" );
        }
        break;
    }

    // Initialize internal state variables for emphasis and strong emphasis.
    this.em_state     = [];
    this.strong_state = [];

    // Debugging indentation string for console output.
    this.debug_indent = "";

  };


  /**
   *  parse( markdown, [dialect] ) -> JsonML
   *  - markdown (String): the markdown string content to parse.
   *  - dialect (String | Dialect): the specific dialect to use for parsing;
   *                                defaults to the original Gruber Markdown.
   *
   *  Parses the provided `markdown` string and returns a markdown document
   *  represented as a Markdown.JsonML tree structure. This is the first stage
   *  of processing.
   **/
  expose.parse = function ( source, dialect ) {
    // The dialect will be set to its default value if it's undefined.
    var md = new Markdown( dialect );

    return md.toTree( source );
  };


  /**
   *  toHTML( markdown, [dialect]  ) -> String
   *  toHTML( md_tree ) -> String
   *  - markdown (String): the raw markdown string to be converted.
   *  - md_tree (Markdown.JsonML): a pre-parsed markdown tree in JsonML format.
   *  - dialect (String | Dialect): the dialect to apply during conversion.
   *
   *  Takes markdown (either as a string or as a JsonML tree) and processes it
   *  through [[toHTMLTree]] to generate an HTML tree, then renders it into a
   *  well-formatted HTML fragment string.
   **/
  expose.toHTML = function toHTML( source, dialect, options ) {
    // First, convert the input (string or MD tree) into an HTML JsonML tree.
    var input = expose.toHTMLTree( source, dialect, options );

    // Then, render the HTML JsonML tree into a final HTML string.
    return expose.renderJsonML( input );
  };


  /**
   *  toHTMLTree( markdown, [dialect] ) -> JsonML
   *  toHTMLTree( md_tree ) -> JsonML
   *  - markdown (String): the markdown string content to parse.
   *  - dialect (String | Dialect): the dialect to use, defaults to gruber.
   *  - md_tree (Markdown.JsonML): a pre-parsed markdown tree.
   *
   *  Converts markdown content into an HTML representation, structured as a
   *  JsonML tree. If a string is provided as input, it is first parsed into
   *  a markdown tree by calling [[parse]]. This function handles the conversion
   *  from the markdown AST to the HTML AST.
   **/
  expose.toHTMLTree = function toHTMLTree( input, dialect, options ) {
    // If the input is a string, it must first be parsed into a Markdown tree.
    if ( typeof input === "string" ) {
      input = this.parse( input, dialect );
    }

    // Now, the goal is to convert the Markdown tree into an HTML tree.

    // Extract any references (e.g., link definitions) from the tree's attributes.
    var attrs = extract_attr( input ),
        refs  = {};

    if ( attrs && attrs.references ) {
      refs = attrs.references;
    }

    // Perform the main conversion from Markdown JsonML to HTML JsonML.
    var html = convert_tree_to_html( input, refs, options );

    // Merge adjacent text nodes in the resulting HTML tree for cleaner output.
    merge_text_nodes( html );

    return html;
  };


  // Helper function for Spidermonkey based JavaScript engines, typically used
  // for debugging or serialization.
  function mk_block_toSource( ) {
    return "Markdown.mk_block( " +
            uneval( this.toString() ) +
            ", " +
            uneval( this.trailing ) +
            ", " +
            uneval( this.lineNumber ) +
            " )";
  }


  // Helper function for Node.js environments, providing a custom inspection
  // output for `mk_block` objects.
  function mk_block_inspect( ) {
    var util = require( "util" );

    return "Markdown.mk_block( " +
            util.inspect( this.toString() ) +
            ", " +
            util.inspect( this.trailing ) +
            ", " +
            util.inspect( this.lineNumber ) +
            " )";
  }


  // Factory function to create a "block" object. This is a special string
  // object with additional properties like `trailing` whitespace and `lineNumber`.
  var mk_block = Markdown.mk_block = function (block, trail, line) {
    // Provide a default trailing newline for convenience in tests or simple cases.
    if ( arguments.length === 1 ) {
      trail = "\n\n";
    }

    // Create a new String object to store the block content.
    var s = new String(block);

    // Attach additional properties.
    s.trailing = trail;

    // To make it clear that this is not just a plain string, but an enhanced
    // block object for Markdown parsing.
    s.inspect  = mk_block_inspect;
    s.toSource = mk_block_toSource;

    // If a line number is provided, attach it.
    if ( line !== undefined ) {
      s.lineNumber = line;
    }

    return s;
  };


  // Counts the number of newline characters in a given string.
  function count_lines( str ) {
    var n = 0,
        i = -1;

    while ( ( i = str.indexOf( "\n", i + 1 ) ) !== -1 ) {
      n++;
    }

    return n;
  }


  // Internal method to split the raw Markdown source into rough blocks.
  Markdown.prototype.split_blocks = function splitBlocks( input, startLine ) {
    // Normalize line endings to `\n` for consistent processing.
    input = input.replace( /(\r\n|\n|\r)/g, "\n" );

    // Regular expression to match any content followed by one or more blank lines.
    // `[\s\S]` matches any character, including newlines.
    var re = /([\s\S]+?)($|\n(?:\s*\n|$)+)/g,
        blocks = [],
        m;

    var line_no = 1;

    // Handle leading blank lines by skipping and counting them.
    if ( ( m = /^(\s*\n)/.exec(input) ) !== null ) {
      line_no += count_lines( m[0] );
      re.lastIndex = m[0].length; // Adjust regex position.
    }

    // Iterate through the input, extracting blocks based on the regex.
    while ( ( m = re.exec(input) ) !== null ) {
      // Create a `mk_block` object for each identified block.
      blocks.push( mk_block( m[1], m[2], line_no ) );
      line_no += count_lines( m[0] ); // Update line number for the next block.
    }

    return blocks;
  };


  /**
   *  Markdown#processBlock( block, next ) -> undefined | [ JsonML, ... ]
   *  - block (String): the current block of markdown text to process.
   *  - next (Array): an array of subsequent blocks that can be modified.
   *
   * Process `block` and return an array of JsonML nodes representing `block`.
   *
   * It does this by asking each block-level function defined in the current
   * dialect to process the block until one successfully handles it.
   * Successful handling is indicated by returning an array (which may contain
   * zero or more JsonML nodes); failure is indicated by returning a falsey value
   * (e.g., `undefined` or `null`).
   *
   * Block handlers are responsible for calling [[Markdown#processInline]]
   * themselves as appropriate to handle inline content within their blocks.
   *
   * If the blocks were initially split incorrectly or if adjacent blocks need
   * to be collapsed (e.g., multiple code blocks), `next` can be adjusted
   * in place using array methods like `shift()`, `splice()`, etc.
   *
   * If any of this default behavior is not suitable for a specific dialect,
   * a `__call__` method can be defined on the dialect's `block` property.
   * This `__call__` method will then be invoked to handle the entire block
   * processing logic.
   */
  Markdown.prototype.processBlock = function processBlock( block, next ) {
    var cbs = this.dialect.block, // Get the block processing callbacks for the current dialect.
        ord = cbs.__order__;     // Get the ordered list of block handlers.

    // If a custom `__call__` method is defined for block processing, use it.
    if ( "__call__" in cbs ) {
      return cbs.__call__.call( this, block, next );
    }

    // Iterate through the ordered block handlers.
    for ( var i = 0; i < ord.length; i++ ) {
      //D:this.debug( "Testing", ord[i] ); // Debug output for the current handler being tested.

      var res = cbs[ ord[i] ].call( this, block, next );

      if ( res ) {
        // If a handler successfully processed the block:
        //D:this.debug("  matched"); // Debug output indicating a match.

        // Basic validation: ensure the result is an array and, if not empty,
        // that its first element is also an array (standard JsonML structure).
        if ( !isArray(res) || ( res.length > 0 && !( isArray(res[0]) ) ) ) {
          this.debug( ord[i], "didn't return a proper array" );
        }
        //D:this.debug( "" ); // Newline for debug clarity.

        return res; // Return the result from the successful handler.
      }
    }

    // If no block handler matched, it's an unhandled block.
    // Should we throw an error here, or return an empty array?
    // For now, an empty array indicates no content generated from this block.
    return [];
  };


  // Processes inline markdown elements within a given block.
  Markdown.prototype.processInline = function processInline( block ) {
    // Delegates to the dialect's inline `__call__` method, converting the block
    // to a string first.
    return this.dialect.inline.__call__.call( this, String( block ) );
  };


  /**
   *  Markdown#toTree( source ) -> JsonML
   *  - source (String): The markdown source string to be parsed.
   *
   *  Parses the `source` markdown into a JsonML tree, representing the
   *  structured markdown document. This is the core parsing logic.
   **/
  // `custom_tree` parameter: if provided, `this.tree` is temporarily set to it
  // and restored upon function return.
  Markdown.prototype.toTree = function toTree( source, custom_root ) {
    // If the source is already an array, assume it's pre-split blocks;
    // otherwise, split the string into blocks.
    var blocks = source instanceof Array ? source : this.split_blocks( source );

    // Make `this.tree` a member variable to facilitate extensions manipulating it.
    var old_tree = this.tree;

    try {
      // Initialize `this.tree` to the custom root, or existing tree, or a new
      // "markdown" root.
      this.tree = custom_root || this.tree || [ "markdown" ];

      // Label the loop for easy breaking out of it.
      blocks:
      while ( blocks.length ) {
        // Process the next block from the queue.
        var b = this.processBlock( blocks.shift(), blocks );

        // Reference blocks (e.g., link definitions) might not return any content,
        // so skip if the result is empty.
        if ( !b.length ) {
          continue blocks;
        }

        // Append the processed block's JsonML nodes to the main tree.
        this.tree.push.apply( this.tree, b );
      }

      return this.tree;

    } finally {
      // Ensure that `this.tree` is restored if a custom root was used.
      if ( custom_root ) {
        this.tree = old_tree;
      }
    }
  };


  // Default debug method (does nothing by default).
  // Can be overridden to provide custom debugging output.
  Markdown.prototype.debug = function ( ) {
    var args = Array.prototype.slice.call( arguments );
    args.unshift( this.debug_indent ); // Add current indentation level.

    if ( typeof print !== "undefined" ) {
      // For Spidermonkey or similar environments.
      print.apply( print, args );
    }

    if ( typeof console !== "undefined" && typeof console.log !== "undefined" ) {
      // For browser consoles or Node.js.
      console.log.apply( null, args );
    }
  };


  // Helper function to repeatedly apply a regular expression over a block string.
  // Useful for processing lines or patterns iteratively.
  Markdown.prototype.loop_re_over_block = function ( re, block, cb ) {
    // Important: Do not use global regexps (`/g` flag) with this function,
    // as `re.exec` maintains state.
    var m,
        b = block.valueOf(); // Get the primitive string value of the block.

    while ( b.length && ( m = re.exec(b) ) !== null ) {
      b = b.substr( m[0].length ); // Remove the matched part from the block.
      cb.call( this, m );         // Call the callback with the match object.
    }

    return b; // Return any remaining part of the block.
  };


  /**
   * Markdown.dialects
   *
   * This is a namespace object that holds definitions for all built-in
   * Markdown dialects supported by the library.
   **/
  Markdown.dialects = {};


  /**
   * Markdown.dialects.Gruber
   *
   * This dialect implements the rules set out by John Gruber's original
   * `markdown.pl` script. It aims to follow the *behavior* of that script
   * as closely as possible, even in cases where the behavior deviates
   * slightly from the official syntax documentation.
   **/
  Markdown.dialects.Gruber = {
    block: {
      // Handler for ATX-style headers (e.g., `# Header 1`).
      atxHeader: function atxHeader( block, next ) {
        // Regex to match ATX headers: 1-6 hashes, content, optional trailing hashes.
        var m = block.match( /^(#{1,6})\s*(.*?)\s*#*\s*(?:\n|$)/ );

        if ( !m ) {
          return undefined; // Not an ATX header.
        }

        // Create a header JsonML node, extracting the level from the number of hashes.
        var header = [ "header", { level: m[1].length } ];

        // Process the header content as inline markdown.
        Array.prototype.push.apply( header, this.processInline(m[2]) );

        // If there's remaining content in the block after the header,
        // push it back onto the `next` blocks array as a new block.
        if ( m[0].length < block.length ) {
          next.unshift( mk_block( block.substr( m[0].length ), block.trailing, block.lineNumber + 2 ) );
        }

        return [ header ];
      },


      // Handler for Setext-style headers (e.g., `Header 1\n=======`).
      setextHeader: function setextHeader( block, next ) {
        // Regex to match Setext headers: text content, followed by `===` or `---`.
        var m = block.match( /^(.*)\n([-=])\2\2+(?:\n|$)/ );

        if ( !m ) {
          return undefined; // Not a Setext header.
        }

        // Determine header level based on the underline character (`=` for H1, `-` for H2).
        var level = ( m[2] === "=" ) ? 1 : 2;

        // Create a header JsonML node.
        var header = [ "header", { level: level }, m[1] ];

        // If there's content remaining in the block after the header,
        // add it back to the `next` blocks array.
        if ( m[0].length < block.length ) {
          next.unshift( mk_block( block.substr( m[0].length ), block.trailing, block.lineNumber + 2 ) );
        }

        return [ header ];
      },


      // Handler for code blocks (indented by 4 spaces or a tab).
      code: function code( block, next ) {
        // Consider the case:
        // |    Foo
        // |bar
        // This should result in a code block followed by a paragraph.
        // Also, adjacent code blocks should be merged.

        var ret  = [],
            re   = /^(?: {0,3}\t| {4})(.*)\n?/, // Matches an indented line.
            lines; // This variable is not used, can be removed or ignored.

        // If the block doesn't start with the code block indentation pattern,
        // it's not a code block.
        if ( !block.match( re ) ) {
          return undefined;
        }

        // Loop to extract all indented lines and merge with subsequent code blocks.
        block_search:
        do {
          // Use `loop_re_over_block` to extract all lines that match the code indentation.
          var b = this.loop_re_over_block(
                    re,
                    block.valueOf(),
                    function ( m ) {
                      ret.push( m[1] ); // Push the content (after indentation) into `ret`.
                    }
                  );

          if ( b.length ) {
            // If there's remaining content in `block` after extracting code lines,
            // it means the code block ended. Push the remaining part as a new block.
            next.unshift( mk_block(b, block.trailing) );
            break block_search;
          } else if ( next.length ) {
            // If the current block is fully consumed, check the next block.
            // If the next block doesn't start with code indentation, stop merging.
            if ( !next[0].match( re ) ) {
              break block_search;
            }

            // If the next block is also a code block, prepare to merge.
            // Add blank lines from the current block's trailing whitespace,
            // subtracting 2 because `join` will add one, and we want to preserve
            // the original number of blank lines between code blocks.
            ret.push( block.trailing.replace(/[^\n]/g, "").substring(2) );

            block = next.shift(); // Shift the next block to be processed.
          } else {
            // No more blocks to process.
            break block_search;
          }
        } while ( true ); // Loop indefinitely until `break block_search` is hit.

        return [ [ "code_block", ret.join("\n") ] ];
      },


      // Handler for horizontal rules (e.g., `---`, `***`, `___`).
      horizRule: function horizRule( block, next ) {
        // This handler needs to find any horizontal rule within the block to
        // correctly handle abutting blocks (content before/after the HR).
        var m = block.match( /^(?:([\s\S]*?)\n)?[ \t]*([-_*])(?:[ \t]*\2){2,}[ \t]*(?:\n([\s\S]*))?$/ );

        if ( !m ) {
          return undefined; // No horizontal rule found.
        }

        var jsonml = [ [ "hr" ] ]; // The HR itself.

        // If there's content *before* the horizontal rule (m[1]),
        // process it as a separate block and unshift its JsonML into `jsonml`.
        if ( m[1] ) {
          jsonml.unshift.apply( jsonml, this.processBlock( m[1], [] ) );
        }

        // If there's content *after* the horizontal rule (m[3]),
        // push it back onto the `next` blocks array as a new block.
        if ( m[3] ) {
          next.unshift( mk_block( m[3]) );
        }

        return jsonml;
      },


      // Handler for lists (ordered and unordered).
      // This is a complex handler due to the many edge cases in Markdown lists.
      lists: ( function( ) {
        // Use a closure to encapsulate helper variables and functions,
        // preventing them from polluting the global scope.

        var any_list    = "[*+-]|\\d+\\.", // Matches a bullet (`*`, `+`, `-`) or a number (`1.`).
            bullet_list = /[*+-]/,       // Matches bullet list markers.
            number_list = /\d+\./,       // Matches numbered list markers.
            // Capture leading indent as it matters for determining nested lists.
            is_list_re = new RegExp( "^( {0,3})(" + any_list + ")[ \t]+" ),
            indent_re  = "(?: {0,3}\\t| {4})"; // Matches a tab or 4 spaces.


        // TODO: This regex could be cached for specific depths to improve performance.
        // Creates a regular expression suitable for matching a list item (`li`)
        // at a given stack `depth`.
        function regex_for_depth( depth ) {
          return new RegExp(
            // m[1] = indent, m[2] = list_type (for new list items)
            "(?:^(" + indent_re + "{0," + depth + "} {0,3})(" + any_list + ")\\s+)|" +
            // m[3] = continuation indent (for subsequent lines of the same list item)
            "(^" + indent_re + "{0," + (depth - 1) + "}[ ]{0,4})"
          );
        }

        // Expands tabs in the input string to 4 spaces.
        function expand_tab( input ) {
          return input.replace( / {0,3}\t/g, "    " );
        }


        // Adds inline content `inline` to the current list item `li`.
        // `inline` is expected to be an array of JsonML nodes from `processInline`.
        function add( li, loose, inline, nl ) {
          if ( loose ) {
            // If the list is "loose", each inline content chunk becomes a new paragraph.
            li.push( [ "para" ].concat(inline) );
            return;
          }

          // Hmmm, should this be any block level element or just paras?
          // Decide where to add the new content:
          // If the last element is a paragraph, append to it; otherwise, to `li` directly.
          var add_to = li[li.length - 1] instanceof Array && li[li.length - 1][0] === "para"
                     ? li[li.length - 1]
                     : li;

          // If there is already some content in this list item, and `nl` (newline) is
          // provided, prepend the newline to the inline content.
          if ( nl && li.length > 1 ) {
            inline.unshift(nl);
          }

          // Append the inline content to `add_to`, merging adjacent strings.
          for ( var i = 0; i < inline.length; i++ ) {
            var what   = inline[i],
                is_str = typeof what === "string";

            if ( is_str && add_to.length > 1 && typeof add_to[add_to.length - 1] === "string" ) {
              add_to[ add_to.length - 1 ] += what; // Merge with previous string.
            } else {
              add_to.push( what ); // Add new content.
            }
          }
        }


        // Retrieves contained blocks (i.e., blocks indented beyond the current level).
        // This is crucial for handling nested content within list items.
        function get_contained_blocks( depth, blocks ) {
          var re = new RegExp( "^(" + indent_re + "{" + depth + "}.*?\\n?)*$" ), // Matches lines indented at `depth`.
              replace = new RegExp( "^" + indent_re + "{" + depth + "}", "gm" ),  // Regex to remove that indentation.
              ret = [];

          while ( blocks.length > 0 ) {
            // Check if the current block consists entirely of lines indented at `depth`.
            if ( re.exec( blocks[0] ) ) {
              var b = blocks.shift(), // Take the block.
                  // Remove the leading indentation from the block.
                  x = b.replace( replace, "" );

              ret.push( mk_block( x, b.trailing, b.lineNumber ) ); // Add the de-indented block.
            } else {
              break; // Stop if the block is not sufficiently indented.
            }
          }
          return ret;
        }


        // This function is passed to `stack.forEach` to convert list items
        // higher up the list processing stack into paragraphs if they contain
        // only inline content and need to be "loosened" into paragraphs.
        function paragraphify( s, i, stack ) {
          var list    = s.list;
          var last_li = list[list.length - 1];

          // If the last list item already contains a paragraph, no need to paragraphify.
          if ( last_li[1] instanceof Array && last_li[1][0] === "para" ) {
            return;
          }

          // If this is the current (deepest) list item, it's not yet complete,
          // so we don't convert it to a paragraph yet.
          if ( i + 1 === stack.length ) {