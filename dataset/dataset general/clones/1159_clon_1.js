/*
 * showdown.js - A JavaScript port of Markdown.
 *
 * Copyright (c) 2007 John Fraser.
 *
 * Original Markdown Copyright (c) 2004-2005 John Gruber
 *   <http://daringfireball.net/projects/markdown/>
 *
 * Redistributable under a BSD-style open source license.
 * Please refer to license.txt for additional information.
 *
 * The complete source distribution is available at:
 *
 *        A A L
 *        T C A
 *        T K B
 *
 *   <http://www.attacklab.net/>
 *
 */

/*
 *
 * Wherever feasible, Showdown aims to be a direct, line-by-line port
 * of the Perl version of Markdown.
 *
 * This parser design is not conventional; it primarily consists of
 * a sequence of string substitutions. While this approach can make
 * the code challenging to read and maintain, keeping Showdown closely
 * aligned with the original design simplifies the process of porting
 * new features from Markdown.pl.
 *
 * More critically, Showdown replicates the behavior of markdown.pl
 * in most edge cases. This ensures that web applications can perform
 * client-side previews in Javascript and then generate identical HTML
 * on the server, maintaining consistency.
 *
 * This port requires the advanced RegExp functionality introduced in
 * ECMA 262, 3rd Edition (specifically, Javascript 1.5). Most contemporary
 * web browsers should support this without issues. Even with these
 * enhanced regular expression features, significant effort is made
 * to emulate Perl's regex capabilities.
 * The more intricate modifications within this file are generally
 * marked with the "attacklab:" label. Major or self-explanatory
 * changes are not specifically labeled.
 *
 * Sophisticated diff tools, such as Araxis Merge, should be able to
 * effectively compare this file with markdown.pl. A few minor adjustments
 * can further improve this comparison: in a copy of markdown.pl, replace
 * "#" with "//" and replace "$text" with "text". Remember to configure
 * the diff tool to ignore whitespace and line ending differences.
 *
 */


/*
 *
 * Showdown usage example:
 *
 *   var text = "Markdown *rocks*.";
 *
 *   var converter = new Showdown.converter();
 *   var html = converter.makeHtml(text);
 *
 *   alert(html);
 *
 * Note: For live testing, please move this sample code to the
 * bottom of the file and then uncomment it.
 *
 */


/*
 * Showdown's primary namespace declaration.
 * All core components and extensions reside within this object.
 */
var Showdown = { extensions: {} };

/*
 *
 * Helper function for iterating over collections.
 * Provides a consistent way to loop through arrays or array-like objects.
 *
 */
var forEach = Showdown.forEach = function ( obj , callback ) {
  if (typeof obj.forEach === 'function') {
    // If the object has a native forEach method, use it.
    obj.forEach(callback);
  } else {
    // Otherwise, implement a simple loop.
    var i , len = obj.length;
    for (i = 0 ; i < len ; i++) {
      callback(obj[i], i, obj);
    }
  }
};

/*
 *
 * Standardizes extension names by removing non-alphanumeric characters
 * and converting to lowercase. This ensures consistent lookup keys.
 *
 */
var stdExtName = function (s) {
  return s.replace(/[_-]||\s/g, '').toLowerCase();
};

/*
 *
 * converter
 *
 * This class encapsulates all "global" variables and utility functions
 * to ensure that only the `makeHtml()` method is exposed publicly.
 * This prevents conflicts when multiple converters are instantiated.
 *
 */
Showdown.converter = function (converter_options) {

  //
  // Globals: These variables are reset for each conversion process.
  //

  // Global hashes, used by various utility routines for storing link definitions etc.
  var g_urls;
  var g_titles;
  var g_html_blocks;

  // Used to track when we're inside an ordered or unordered list context.
  // (Refer to _ProcessListItems() for a detailed explanation):
  var g_list_level = 0;

  // Arrays to hold language and output extensions.
  var g_lang_extensions = [];
  var g_output_modifiers = [];


  //
  // Automatic Extension Loading (Node.js environment only):
  //
  // This block attempts to load extensions from a local 'extensions' directory
  // if running in a Node.js environment.
  //
  if (typeof module !== 'undefined' && typeof exports !== 'undefined' && typeof require !== 'undefined') {
    var fs = require('fs');

    if (fs) {
      // Search the 'extensions' folder for JavaScript files.
      var extensions = fs.readdirSync((__dirname || '.') + '/extensions').filter(function (file) {
        return ~file.indexOf('.js');
      }).map(function (file) {
        return file.replace(/\.js$/, '');
      });
      // Load identified extensions into the Showdown namespace.
      Showdown.forEach(extensions, function (ext) {
        var name = stdExtName(ext);
        Showdown.extensions[name] = require('./extensions/' + ext);
      });
    }
  }

  /*
   * The core function that converts Markdown text to HTML.
   *
   * @param {string} text The Markdown formatted text to convert.
   * @returns {string} The HTML formatted text.
   */
  this.makeHtml = function (text) {
    //
    // This is the main entry point for the conversion process.
    // The sequence in which other helper functions are invoked here is
    // critically important. For instance, link and image substitutions
    // must occur before _EscapeSpecialCharsWithinTagAttributes(),
    // so that any asterisk ('*') or underscore ('_') characters found
    // within the `<a>` and `<img>` tags are correctly encoded.
    //

    // It's essential to clear the global hashes at the start of each conversion.
    // Failing to do so would lead to conflicts from previously processed articles
    // when generating a page that contains multiple articles (e.g., an index page
    // displaying the N most recent articles).
    g_urls = {};
    g_titles = {};
    g_html_blocks = [];

    // attacklab: Replace '~' with '~T'.
    // This allows tilde to be used as an escape character, preventing
    // collisions with MD5 hashes generated internally.
    // The choice of character is arbitrary; any character not considered
    // "magic" in Markdown would suffice.
    text = text.replace(/~/g, "~T");

    // attacklab: Replace '$' with '~D'.
    // In regular expressions, '$' is interpreted as a special character
    // when it appears in a replacement string. This avoids that issue.
    text = text.replace(/\$/g, "~D");

    // Standardize line endings across different operating systems.
    text = text.replace(/\r\n/g, "\n"); // Convert DOS-style to Unix-style
    text = text.replace(/\r/g, "\n");   // Convert Mac-style to Unix-style

    // Ensure the text begins and ends with at least two newlines.
    // This simplifies many block-level regular expressions.
    text = "\n\n" + text + "\n\n";

    // Convert all tab characters to spaces.
    text = _Detab(text);

    // Strip any lines that consist solely of spaces and tabs.
    // This greatly simplifies subsequent regular expressions, as we can
    // match consecutive blank lines with `/\n+/` instead of a more
    // convoluted pattern like `/[ \t]*\n+/`.
    text = text.replace(/^[ \t]+$/mg, "");

    // Execute any registered language extensions.
    Showdown.forEach(g_lang_extensions, function (x) {
      text = _ExecuteExtension(x, text);
    });

    // Handle GitHub-flavored code blocks before running _HashHTMLBlocks,
    // ensuring that any HTML contained within the code block is escaped correctly.
    text = _DoGithubCodeBlocks(text);

    // Transform block-level HTML blocks into hash entries.
    // This prevents Markdown from processing HTML directly.
    text = _HashHTMLBlocks(text);

    // Strip link definitions from the text and store their URLs and titles in hashes.
    text = _StripLinkDefinitions(text);

    // Process all block-level Markdown constructs.
    text = _RunBlockGamut(text);

    // Unescape any special characters that were previously escaped.
    text = _UnescapeSpecialChars(text);

    // attacklab: Restore dollar signs that were temporarily replaced.
    text = text.replace(/~D/g, "$$");

    // attacklab: Restore tildes that were temporarily replaced.
    text = text.replace(/~T/g, "~");

    // Execute any registered output modifiers.
    Showdown.forEach(g_output_modifiers, function (x) {
      text = _ExecuteExtension(x, text);
    });

    return text;
  };

  //
  // Options parsing for the converter instance:
  // This block processes any extensions provided during converter initialization.
  //
  if (converter_options && converter_options.extensions) {

    var self = this; // Capture 'this' for use within nested callbacks.

    // Iterate over each plugin defined in the extensions option.
    Showdown.forEach(converter_options.extensions, function (plugin) {

      // If the plugin is specified as a string, assume it's a bundled plugin
      // and look it up in the Showdown.extensions namespace.
      if (typeof plugin === 'string') {
        plugin = Showdown.extensions[stdExtName(plugin)];
      }

      // If the plugin is a function, execute it to get its extensions.
      if (typeof plugin === 'function') {
        // Iterate over each individual extension returned by the plugin function.
        Showdown.forEach(plugin(self), function (ext) {
          // Sort extensions into appropriate arrays based on their 'type'.
          if (ext.type) {
            if (ext.type === 'language' || ext.type === 'lang') {
              g_lang_extensions.push(ext);
            } else if (ext.type === 'output' || ext.type === 'html') {
              g_output_modifiers.push(ext);
            }
          } else {
            // If no type is specified, assume it's a language extension by default.
            g_output_modifiers.push(ext);
          }
        });
      } else {
        // Throw an error if the plugin could not be loaded or is invalid.
        throw "Extension '" + plugin + "' could not be loaded. It was either not found or is not a valid extension.";
      }
    });
  }


  /*
   * Executes a given extension on the text.
   * Extensions can be regex-based replacements or filter functions.
   *
   * @param {object} ext The extension object.
   * @param {string} text The text to process.
   * @returns {string} The processed text.
   */
  var _ExecuteExtension = function (ext, text) {
    if (ext.regex) {
      // If the extension has a 'regex' property, perform a regex replacement.
      var re = new RegExp(ext.regex, 'g');
      return text.replace(re, ext.replace);
    } else if (ext.filter) {
      // If the extension has a 'filter' property, call it as a function.
      return ext.filter(text);
    }
    // If neither regex nor filter is defined, return text unchanged.
    return text;
  };

  /*
   * Strips link definitions from the input text and stores them
   * in global hash references (`g_urls` and `g_titles`).
   *
   * @param {string} text The Markdown text.
   * @returns {string} The text with link definitions removed.
   */
  var _StripLinkDefinitions = function (text) {
    //
    // Link definitions are expected to be in the format:
    //   `^[id]: url "optional title"`
    //

    /*
     * The original Perl-style regex for stripping link definitions:
     *
     *   var text = text.replace(/
     *       ^[ ]{0,3}\[(.+)\]:  // id = $1  attacklab: g_tab_width - 1
     *         [ \t]*
     *         \n?       // maybe *one* newline
     *         [ \t]*
     *       <?(\S+?)>?      // url = $2
     *         [ \t]*
     *         \n?       // maybe one newline
     *         [ \t]*
     *       (?:
     *         (\n*)       // any lines skipped = $3 attacklab: lookbehind removed
     *         ["(]
     *         (.+?)       // title = $4
     *         [")]
     *         [ \t]*
     *       )?          // title is optional
     *       (?:\n+|$)
     *       /gm,
     *       function(){...});
     */

    // attacklab: Sentinel workarounds for the lack of `\A` and `\Z` anchors in JavaScript,
    // and to address a Safari/Khtml regex bug.
    text += "~0";

    text = text.replace(/^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+|(?=~0))/gm,
      function (wholeMatch, m1, m2, m3, m4) {
        // Convert the link ID to lowercase for case-insensitive matching.
        m1 = m1.toLowerCase();
        // Store the URL, encoding ampersands and angle brackets.
        g_urls[m1] = _EncodeAmpsAndAngles(m2);
        if (m3) {
          // Oops, blank lines were found between the URL and title.
          // This means it's not a title; return the captured content.
          return m3 + m4;
        } else if (m4) {
          // If a title was captured, store it, replacing double quotes with HTML entities.
          g_titles[m1] = m4.replace(/"/g, "&quot;");
        }

        // Completely remove the definition line from the text.
        return "";
      }
    );

    // attacklab: Remove the sentinel character.
    text = text.replace(/~0/, "");

    return text;
  };


  /*
   * Identifies and hashes block-level HTML elements to prevent
   * Markdown processing within them.
   *
   * @param {string} text The Markdown text potentially containing HTML blocks.
   * @returns {string} The text with HTML blocks replaced by hash markers.
   */
  var _HashHTMLBlocks = function (text) {
    // attacklab: Double up newlines to reduce the need for lookarounds in regex.
    text = text.replace(/\n/g, "\n\n");

    // Hashify HTML blocks:
    // This process specifically targets block-level HTML tags,
    // such as headers, lists, and tables. The reason is that we still
    // want to wrap `<p>` tags around "paragraphs" that are contained
    // within non-block-level tags (e.g., anchors, phrase emphasis, and spans).
    // The predefined list of tags to look for is hard-coded below.
    var block_tags_a = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del|style|section|header|footer|nav|article|aside";
    var block_tags_b = "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|style|section|header|footer|nav|article|aside";

    // First, look for nested blocks. For example:
    //   <div>
    //     <div>
    //     tags for inner block must be indented.
    //     </div>
    //   </div>
    //
    // The outermost tags must begin at the left margin for this to match,
    // and any inner nested divs must be indented.
    // This specific match must occur before the next, more general match,
    // because the subsequent match would start at the first `<div>` and
    // incorrectly stop at the first `</div>`.

    // attacklab: This regular expression can be computationally expensive if it fails to match quickly.
    /*
     * The original Perl-style regex for nested block-level HTML:
     *
     *   var text = text.replace(/
     *   (           // save in $1
     *     ^         // start of line  (with /m)
     *     <($block_tags_a)  // start tag = $2
     *     \b          // word break
     *               // attacklab: hack around khtml/pcre bug...
     *     [^\r]*?\n     // any number of lines, minimally matching
     *     </\2>       // the matching end tag
     *     [ \t]*        // trailing spaces/tabs
     *     (?=\n+)       // followed by a newline
     *   )           // attacklab: there are sentinel newlines at end of document
     *   /gm,function(){...});
     */
    text = text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[ \t]*(?=\n+))/gm, hashElement);

    //
    // Now, match more liberally, simply from `\n<tag>` to `</tag>\n`.
    // This catches most other block-level HTML elements.
    //

    /*
     * The original Perl-style regex for general block-level HTML:
     *
     *   var text = text.replace(/
     *   (           // save in $1
     *     ^         // start of line  (with /m)
     *     <($block_tags_b)  // start tag = $2
     *     \b          // word break
     *               // attacklab: hack around khtml/pcre bug...
     *     [^\r]*?       // any number of lines, minimally matching
     *     </\2>       // the matching end tag
     *     [ \t]*        // trailing spaces/tabs
     *     (?=\n+)       // followed by a newline
     *   )           // attacklab: there are sentinel newlines at end of document
     *   /gm,function(){...}};
     */
    text = text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|style|section|header|footer|nav|article|aside)\b[^\r]*?<\/\2>[ \t]*(?=\n+)\n)/gm, hashElement);

    // Special case specifically for `<hr />` (Horizontal Rule).
    // It was simpler to create a dedicated special case rather than complicating
    // the existing regular expressions further.
    /*
     *   text = text.replace(/
     *   (           // save in $1
     *     \n\n        // Starting after a blank line
     *     [ ]{0,3}
     *     (<(hr)        // start tag = $2
     *     \b          // word break
     *     ([^<>])*?     //
     *     \/?>)       // the matching end tag
     *     [ \t]*
     *     (?=\n{2,})      // followed by a blank line
     *   )
     *   /g,hashElement);
     */
    text = text.replace(/(\n[ ]{0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g, hashElement);

    // Special case for standalone HTML comments:
    /*
     *   text = text.replace(/
     *   (           // save in $1
     *     \n\n        // Starting after a blank line
     *     [ ]{0,3}      // attacklab: g_tab_width - 1
     *     <!
     *     (--[^\r]*?--\s*)+
     *     >
     *     [ \t]*
     *     (?=\n{2,})      // followed by a blank line
     *   )
     *   /g,hashElement);
     */
    text = text.replace(/(\n\n[ ]{0,3}<!(--[^\r]*?--\s*)+>[ \t]*(?=\n{2,}))/g, hashElement);

    // PHP and ASP-style processor instructions (e.g., `<?...?>` and `<%...%>`).
    /*
     *   text = text.replace(/
     *   (?:
     *     \n\n        // Starting after a blank line
     *   )
     *   (           // save in $1
     *     [ ]{0,3}      // attacklab: g_tab_width - 1
     *     (?:
     *       <([?%])     // $2
     *       [^\r]*?
     *       \2>
     *     )
     *     [ \t]*
     *     (?=\n{2,})      // followed by a blank line
     *   )
     *   /g,hashElement);
     */
    text = text.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g, hashElement);

    // attacklab: Undo the double newlines introduced at the beginning of this function.
    text = text.replace(/\n\n/g, "\n");
    return text;
  };

  /*
   * Helper function to replace an HTML block with a unique hash marker.
   * The actual HTML content is stored in the `g_html_blocks` array.
   *
   * @param {string} wholeMatch The entire matched string (the HTML block).
   * @param {string} m1 The captured content of the HTML block.
   * @returns {string} The hash marker string.
   */
  var hashElement = function (wholeMatch, m1) {
    var blockText = m1;

    // Undo double newlines within the captured block text.
    blockText = blockText.replace(/\n\n/g, "\n");
    // Remove any leading newline characters.
    blockText = blockText.replace(/^\n/, "");

    // Strip any trailing blank lines from the block text.
    blockText = blockText.replace(/\n+$/g, "");

    // Replace the element's text content with a unique marker.
    // The marker format is "~KxK", where 'x' is the index in `g_html_blocks`.
    blockText = "\n\n~K" + (g_html_blocks.push(blockText) - 1) + "K\n\n";

    return blockText;
  };

  /*
   * Processes all block-level Markdown constructs.
   * This includes headers, horizontal rules, lists, code blocks, and blockquotes.
   *
   * @param {string} text The text to process block-level elements.
   * @returns {string} The text with block-level elements converted to HTML.
   */
  var _RunBlockGamut = function (text) {
    //
    // These are all the transformations that create block-level
    // tags, such as paragraphs, headers, and list items.
    //

    // Convert Markdown headers (e.g., `# Header 1`) to HTML `<h1>` tags.
    text = _DoHeaders(text);

    // Process Horizontal Rules:
    // Match patterns like `---`, `***`, `___` with optional spaces.
    var key = hashBlock("<hr />"); // Hash the horizontal rule HTML.
    text = text.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm, key); // Asterisk rules
    text = text.replace(/^[ ]{0,2}([ ]?\-[ ]?){3,}[ \t]*$/gm, key); // Hyphen rules
    text = text.replace(/^[ ]{0,2}([ ]?\_[ ]?){3,}[ \t]*$/gm, key); // Underscore rules

    // Convert Markdown lists (ordered and unordered) to HTML `<ul>` or `<ol>` tags.
    text = _DoLists(text);
    // Process Markdown code blocks (indented or fenced).
    text = _DoCodeBlocks(text);
    // Convert Markdown blockquotes to HTML `<blockquote>` tags.
    text = _DoBlockQuotes(text);

    // We already ran _HashHTMLBlocks() earlier in Markdown(), but that
    // was specifically to escape raw HTML present in the *original* Markdown source.
    // This time, we're escaping the HTML markup that we've just *generated*,
    // ensuring that we don't inadvertently wrap `<p>` tags around
    // already block-level HTML elements.
    text = _HashHTMLBlocks(text);
    // Finally, wrap remaining text lines into HTML `<p>` (paragraph) tags.
    text = _FormParagraphs(text);

    return text;
  };


  /*
   * Processes all span-level Markdown constructs.
   * This includes code spans, emphasis, links, and images.
   *
   * @param {string} text The text to process span-level elements.
   * @returns {string} The text with span-level elements converted to HTML.
   */
  var _RunSpanGamut = function (text) {
    //
    // These are all the transformations that occur *within* block-level
    // tags, such as paragraphs, headers, and list items.
    //

    // Convert inline code (e.g., `` `code` ``) to HTML `<code>` tags.
    text = _DoCodeSpans(text);
    // Escape special characters within HTML tag attributes (e.g., `&`, `<`, `>`).
    text = _EscapeSpecialCharsWithinTagAttributes(text);
    // Encode backslash-escaped characters (e.g., `\*` -> `&#42;`).
    text = _EncodeBackslashEscapes(text);

    // Process anchor (link) and image tags.
    // Images must be processed first, because a pattern like `![alt][id]`
    // can superficially resemble an anchor link.
    text = _DoImages(text);
    text = _DoAnchors(text);