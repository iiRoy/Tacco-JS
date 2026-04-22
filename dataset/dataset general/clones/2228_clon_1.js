var     Markdown    ;

/*  Check if the environment is a CommonJS module (e.g., Node.js).  */
if      (   typeof   exports   ===   "object"   &&   typeof   require   ===   "function"   )
{
    // If so, assign the global Markdown object to module exports.
    Markdown    =   exports     ;
}
else
{
    // Otherwise, initialize Markdown as an empty object in the global scope.
    Markdown    =   {}          ;
}


/**
 *  NOTE: The following introductory text block is included primarily for historical context.
 *  Its contents, reflecting the early design principles and intentions of this Markdown parser
 *  (originally "Showdown"), may not entirely align with its current state or implementation specifics.
 *  Readers are advised to interpret this section with an awareness of its historical nature.
 */

/*
 *  Historically, this JavaScript implementation aimed to be a direct,
 *  line-by-line translation of the original Perl Markdown version.
 *
 *  This approach, heavily reliant on a series of string substitutions rather than
 *  a traditional parser design, was chosen despite its potential for reduced readability
 *  and maintainability. The rationale was to keep the implementation as close as possible
 *  to the original Perl script, thereby simplifying the porting of new features
 *  and, crucially, ensuring identical HTML output in most edge cases.
 *  This allowed web applications to offer client-side Markdown previews that
 *  would precisely match the server-generated HTML.
 *
 *  Early versions of this port required the advanced regular expression capabilities
 *  introduced in ECMA 262, 3rd Edition (equivalent to JavaScript 1.5).
 *  Most contemporary web browsers readily support these features.
 *  A significant effort was made to emulate Perl's powerful regex functionality within JavaScript.
 *  Many of the more intricate or non-obvious changes are often marked with the label "attacklab:".
 *
 *  For developers interested in comparing this file with the original `markdown.pl`,
 *  smart diff tools like Araxis Merge can be highly effective.
 *  A few preparatory tweaks, such as globally replacing "#" with "//" and "$text" with "text"
 *  in a copy of `markdown.pl`, along with ignoring whitespace and line-ending differences,
 *  can significantly enhance the utility of such comparisons.
 */

// --- End of Historical Information ---


/*
 *  Practical Usage Guide:
 *
 *  Here's a simple example demonstrating how to use the Markdown converter:
 *
 *      var   someMarkdownText   =   "Hello, *world*! This is a **test**.";
 *
 *      // Instantiate a new Markdown converter object.
 *      var   myConverter   =   new   Markdown.Converter   (   )   ;
 *
 *      // Convert the Markdown text into HTML.
 *      var   convertedHtml   =   myConverter.makeHtml   (   someMarkdownText   )   ;
 *
 *      // For demonstration, you might display the result:
 *      // alert(convertedHtml);
 *
 *  Note: The sample code above is commented out. If you intend to execute it,
 *  please uncomment it and ideally place it in an appropriate execution context
 *  (e.g., within a script tag in an HTML file or at the very end of this file).
 */


(   function   (   )   {

    /**
     *  A simple utility function that returns its input argument unchanged.
     *  This acts as a no-operation (noop) function.
     *  @param {*} x - The value to be returned.
     *  @returns {*} The input value `x`.
     */
    function    identity    (   x   )   {   return   x;   }

    /**
     *  A utility function that consistently returns the boolean value `false`.
     *  Its input argument is ignored.
     *  @param {*} x - Any input value (not used).
     *  @returns {boolean} Always `false`.
     */
    function    returnFalse    (   x   )   {   return   false;   }


    /**
     *  Constructor for the `HookCollection` object.
     *  This object is designed to manage and chain functions (hooks)
     *  that can modify the Markdown conversion process at various stages.
     */
    function    HookCollection    (   )   {
        // The constructor is intentionally empty. Hooks are added dynamically.
    }

    /**
     *  Prototype methods for `HookCollection`.
     *  These methods allow for registering, chaining, and manipulating hook functions.
     */
    HookCollection.prototype    =   {

        /**
         *  Chains a new function (`func`) to an existing hook identified by `hookname`.
         *  The new function will receive the output of the original hook as its input.
         *  @param {string} hookname - The name of the hook to modify.
         *  @param {Function} func - The function to chain.
         *  @throws {Error} If `hookname` does not correspond to an existing hook.
         */
        chain:   function   (   hookname,   func   )   {
            var   original   =   this[hookname]; // Retrieve the currently assigned function for this hook.

            if   (   !original   )
            {
                // If no hook function is found, it's an unknown hook.
                throw   new   Error   (   "unknown   hook   "   +   hookname   )   ;
            }

            if   (   original   ===   identity   )
            {
                // If the original hook was a no-op, simply replace it with the new function.
                this[hookname]   =   func;
            }
            else
            {
                // Otherwise, create a new function that calls `func` with the result of `original`.
                this[hookname]   =   function   (   x   )   {   return   func   (   original   (   x   )   )   ;   }
            }
        }   ,

        /**
         *  Sets or completely replaces the function for a specified hook.
         *  @param {string} hookname - The name of the hook to set.
         *  @param {Function} func - The new function to assign to the hook.
         *  @throws {Error} If `hookname` does not correspond to an existing hook.
         */
        set:   function   (   hookname,   func   )   {
            if   (   !this[hookname]   )
            {
                // Ensure the hook exists before attempting to set it.
                throw   new   Error   (   "unknown   hook   "   +   hookname   )   ;
            }
            this[hookname]   =   func; // Assign the new function directly.
        }   ,

        /**
         *  Initializes a hook with the `identity` function, making it a no-operation hook.
         *  @param {string} hookname - The name of the hook to add as a no-op.
         */
        addNoop:   function   (   hookname   )   {
            this[hookname]   =   identity;
        }   ,

        /**
         *  Initializes a hook with the `returnFalse` function.
         *  @param {string} hookname - The name of the hook to add.
         */
        addFalse:   function   (   hookname   )   {
            this[hookname]   =   returnFalse;
        }
    }   ;

    // Expose the `HookCollection` constructor on the global `Markdown` object.
    Markdown.HookCollection   =   HookCollection;


    /*
     *  `SaveHash` is a utility class designed to safely store key-value pairs
     *  where keys might originate from user input. This prevents potential issues
     *  like prototype pollution or conflicts with built-in `Object.prototype` properties
     *  (e.g., `__proto__`, `constructor`, `hasOwnProperty`).
     *  By prefixing all keys with "s_", it ensures that no user-supplied key
     *  can accidentally override a critical internal property.
     *  This addresses problems identified in contexts such as
     *  http://meta.stackoverflow.com/questions/64655/strange-wmd-bug.
     */
    function    SaveHash    (   )   {
        // Constructor is empty; properties are added dynamically via `set`.
    }
    SaveHash.prototype    =   {
        /**
         *  Stores a `value` associated with a `key`, applying an internal prefix.
         *  @param {string} key - The original, user-supplied key.
         *  @param {*} value - The value to store.
         */
        set:   function   (   key,   value   )   {
            this[   "s_"   +   key   ]   =   value;
        }   ,
        /**
         *  Retrieves the value associated with a given `key`.
         *  @param {string} key - The original key used for storage.
         *  @returns {*} The stored value, or `undefined` if the key is not found.
         */
        get:   function   (   key   )   {
            return   this[   "s_"   +   key   ]   ;
        }
    }   ;


    /**
     *  `Markdown.Converter` constructor.
     *  Initializes a new instance of the Markdown-to-HTML converter.
     *  Each instance maintains its own set of plugin hooks and private state.
     */
    Markdown.Converter    =   function   (   )   {
        // Initialize the `HookCollection` for this converter instance.
        var   pluginHooks   =   this.hooks   =   new   HookCollection   (   )   ;

        // Register default no-operation hooks for various stages of the conversion pipeline.
        pluginHooks.addNoop   (   "plainLinkText"   )   ;   // Determines the display text for auto-linked URLs.
        pluginHooks.addNoop   (   "preConversion"   )   ;   // Executed on the raw Markdown text *before* any processing.
        pluginHooks.addNoop   (   "postConversion"   )   ;   // Executed on the final HTML *after* all processing.


        //
        //  Private state variables for a single conversion instance.
        //  These are reset and re-initialized with each call to `makeHtml`.
        //

        /**
         *  @private {SaveHash} g_urls - Stores parsed URL definitions (e.g., from `[id]: url`).
         */
        var   g_urls;

        /**
         *  @private {SaveHash} g_titles - Stores parsed link titles (e.g., from `[id]: url "title"`).
         */
        var   g_titles;

        /**
         *  @private {Array<string>} g_html_blocks - Temporarily holds raw HTML blocks during processing.
         */
        var   g_html_blocks;

        /**
         *  @private {number} g_list_level - Tracks the current nesting depth of list items.
         *  (Refer to internal functions like `_ProcessListItems()` for its specific use.)
         */
        var   g_list_level;


        /**
         *  The primary method for converting Markdown source text into HTML.
         *  This function orchestrates the entire conversion pipeline.
         *
         *  @param {string} text - The input Markdown text.
         *  @returns {string} The resulting HTML string.
         *  @throws {Error} If `makeHtml` is called recursively on the same converter instance.
         */
        this.makeHtml   =   function   (   text   )   {

            /*
             *  The order of operations within `makeHtml` is critically important.
             *  For example, processing of links and images must precede
             *  `_EscapeSpecialCharsWithinTagAttributes()` to ensure that
             *  Markdown-specific characters (like `*` or `_`) embedded within
             *  `<a>` or `<img>` tag attributes are correctly encoded and not
             *  mistakenly interpreted as Markdown emphasis.
             */

            // Prevent re-entrant calls to `makeHtml` on the same converter instance.
            // This scenario could occur if a plugin hook itself calls `makeHtml`,
            // which is an unsupported operation.
            if   (   g_urls   )
            {
                throw   new   Error   (   "Recursive   call   to   converter.makeHtml"   )   ;
            }


            // Initialize the private state variables for the current conversion.
            g_urls          =   new   SaveHash   (   )   ;
            g_titles        =   new   SaveHash   (   )   ;
            g_html_blocks   =   [   ]   ;
            g_list_level    =   0   ;


            // Allow registered plugins to perform initial modifications to the source text.
            text   =   pluginHooks.preConversion   (   text   )   ;


            // "attacklab" specific character escaping:
            // Temporarily replace tilde (~) with "~T" to avoid conflicts with MD5 hashes
            // and to use tilde as an internal escape character.
            text   =   text.replace   (   /~/g,   "~T"   )   ;

            // "attacklab" specific character escaping:
            // Temporarily replace dollar sign ($) with "~D" because `$` has special meaning
            // in JavaScript's `String.prototype.replace()` method's replacement string.
            // This is reverted later in the process.
            text   =   text.replace   (   /\$/g,   "~D"   )   ;


            // Standardize all line endings to Unix-style (`\n`) for consistent regex matching.
            text   =   text.replace   (   /\r\n/g,   "\n"   )   ;   // Convert DOS (CRLF) to Unix (LF)
            text   =   text.replace   (   /\r/g,   "\n"   )   ;   // Convert Mac (CR) to Unix (LF)


            // Ensure the input text is padded with at least two newlines at both ends.
            // This simplifies many block-level regular expressions by guaranteeing
            // consistent boundary conditions.
            text   =   "\n\n"   +   text   +   "\n\n"   ;


            // Convert all tab characters (`\t`) into spaces.
            text   =   _Detab   (   text   )   ;


            // Remove any lines that contain only whitespace (spaces and tabs).
            // This preprocessing step makes subsequent regex patterns for matching
            // blank lines (e.g., `/\n+/`) much simpler and more reliable.
            text   =   text.replace   (   /^[ \t]+$/mg,   ""   )   ;


            // Identify and "hash out" block-level HTML sections.
            // These blocks are replaced with temporary placeholders (`~KxK`)
            // and their content stored, preventing Markdown from parsing them.
            text   =   _HashHTMLBlocks   (   text   )   ;


            // Extract link definitions (e.g., `[id]: url "title"`) from the text.
            // These definitions are stored in `g_urls` and `g_titles` and then
            // removed from the main text flow.
            text   =   _StripLinkDefinitions   (   text   )   ;


            // Apply all block-level Markdown transformations (headers, lists, etc.).
            text   =   _RunBlockGamut   (   text   )   ;


            // Unescape any characters that were previously escaped in the text.
            text   =   _UnescapeSpecialChars   (   text   )   ;


            // Restore the dollar signs (`$`) that were temporarily escaped earlier.
            text   =   text.replace   (   /~D/g,   "$$"   )   ;

            // Restore the tildes (`~`) that were temporarily escaped earlier.
            text   =   text.replace   (   /~T/g,   "~"   )   ;


            // Allow registered plugins to perform final modifications on the generated HTML.
            text   =   pluginHooks.postConversion   (   text   )   ;


            // Clean up the private state variables, releasing memory.
            g_html_blocks   =   g_titles   =   g_urls   =   null   ;


            // Return the final HTML output.
            return   text   ;
        }   ;


        /**
         *  Strips Markdown link definitions from the input text.
         *  Link definitions are typically of the form `[id]: url "optional title"`.
         *  The URLs and titles are stored in the `g_urls` and `g_titles` hash tables,
         *  and the definitions themselves are removed from the text.
         *
         *  @param {string} text - The Markdown text to process.
         *  @returns {string} The text with link definitions extracted and removed.
         */
        function    _StripLinkDefinitions    (   text   )   {

            // This regex captures link definitions.
            // Example format: `^[ ]{0,3}[id]: url "optional title"`
            /*
             *  Regex breakdown (conceptual, for clarity; the actual regex is compact):
             *  `^`                         : Start of line (due to `/m` flag).
             *  `[ ]{0,3}`                  : Up to 3 leading spaces (for block-level context).
             *  `\[(.+)\]:`                : Capture group 1 ($1) is the link ID.
             *  `[ \t]*\n?[ \t]*`           : Optional whitespace and a single newline.
             *  `<?(\S+?)>?`                : Capture group 2 ($2) is the URL, optionally enclosed in `< >`.
             *  `(?=\s|$)`                  : Lookahead for whitespace or end of line (prevents overmatching).
             *  `[ \t]*\n?[ \t]*`           : Optional whitespace and a single newline.
             *  `(                           `: Capture group 3 ($3) for the optional title block.
             *      `(\n*)`                 : Capture group 4 ($4) for any blank lines within the title.
             *      `[ \t]+`                : Required leading whitespace for the title.
             *      `["(]`                  : Title begins with a double quote or parenthesis.
             *      `(.+?)`                 : Capture group 5 ($5) is the actual title content.
             *      `[")]`                  : Title ends with a matching double quote or parenthesis.
             *      `[ \t]*`                : Optional trailing whitespace.
             *  `)?`                        : The entire title block ($3) is optional.
             *  `(?:\n+|$)`                 : Followed by one or more newlines, or end of string.
             */

            text    =   text.replace    (   /^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?(?=\s|$)[ \t]*\n?[ \t]*((\n*)["(](.+?)[")][ \t]*)?(?:\n+)/gm,
                function    (   wholeMatch,   m1,   m2,   m3,   m4,   m5   )   {
                    // Convert the link ID to lowercase for case-insensitive matching.
                    m1   =   m1.toLowerCase   (   )   ;

                    // Store the URL, ensuring that ampersands and angle brackets are HTML-encoded.
                    g_urls.set   (   m1,   _EncodeAmpsAndAngles   (   m2   )   )   ;

                    // Check if group 4 (m4) exists. If it does, it means blank lines were found
                    // where a title was expected, implying it wasn't a valid title.
                    // In this case, return the "stolen" part (m3) back to the text.
                    if   (   m4   )
                    {
                        return   m3   ;
                    }
                    // If group 5 (m5) exists, a valid title was captured.
                    else   if   (   m5   )
                    {
                        // Store the title, ensuring double quotes are HTML-encoded.
                        g_titles.set   (   m1,   m5.replace   (   /"/g,   "&quot;"   )   )   ;
                    }

                    // Return an empty string to completely remove the link definition from the text.
                    return   ""   ;
                }
            )   ;

            return   text   ;
        }


        /**
         *  Identifies and "hashes" block-level HTML elements within the text.
         *  This process involves replacing the HTML blocks with unique placeholders
         *  (`~KxK`) and storing the actual HTML content in the `g_html_blocks` array.
         *  This prevents Markdown from attempting to parse or modify the raw HTML.
         *
         *  @param {string} text - The input text, potentially containing HTML blocks.
         *  @returns {string} The text with block-level HTML replaced by placeholders.
         */
        function    _HashHTMLBlocks    (   text   )   {

            // This function specifically targets block-level HTML tags.
            // It avoids hashing inline HTML, allowing paragraph wrapping around it.
            // The lists of tags are hardcoded based on HTML block-level elements.

            // `block_tags_a` includes tags that can contain other block-level elements,
            // used for matching nested blocks.
            var   block_tags_a   =   "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del"   ;

            // `block_tags_b` is a slightly less comprehensive list, used for more general
            // block matching after nested blocks have been handled.
            var   block_tags_b   =   "p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math"   ;


            // First pass: Match and hash nested HTML blocks.
            // This regex specifically looks for blocks where the outermost tag starts
            // at the left margin and inner content (including other tags) is indented.
            // This must be done before the more general match to prevent greedy matching
            // from stopping prematurely.
            // (The "attacklab" comment refers to potential performance implications
            // of this complex regex in older JavaScript engines.)
            /*
             *  Conceptual Regex:
             *  `^`                             : Start of line.
             *  `(`                             : Capture group 1 (the entire block).
             *      `<($block_tags_a)`          : Opening tag (e.g., `<div>`), capturing tag name in $2.
             *      `\b`                        : Word boundary.
             *      `[^\r]*?\n`                 : Non-CR characters, then a newline (non-greedy).
             *      `</\2>`                     : Matching closing tag (uses backreference to $2).
             *      `[ \t]*`                    : Optional trailing whitespace.
             *      `(?=\n+)`                   : Followed by one or more newlines (a blank line).
             *  `)`
             */
            text    =   text.replace    (   /^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[ \t]*(?=\n+))/gm,   hashElement   )   ;


            // Second pass: Match more general block-level HTML elements.
            // This regex captures blocks starting with a newline followed by an opening tag
            // and ending with a closing tag followed by a newline.
            // This is applied after the nested block pass to avoid conflicts.
            /*
             *  Conceptual Regex:
             *  `^`                             : Start of line.
             *  `(`                             : Capture group 1 (the entire block).
             *      `<($block_tags_b)`          : Opening tag, capturing tag name in $2.
             *      `\b`                        : Word boundary.
             *      `[^\r]*?`                   : Non-CR characters (non-greedy).
             *      `.*</\2>`                   : Any characters, then matching closing tag (greedy on the final line).
             *      `[ \t]*`                    : Optional trailing whitespace.
             *      `(?=\n+)\n`                 : Followed by one or more newlines, including a final newline.
             *  `)`
             */
            text    =   text.replace    (   /^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math)\b[^\r]*?.*<\/\2>[ \t]*(?=\n+)\n)/gm,   hashElement   )   ;


            // Special case handling for `<hr />` (horizontal rule) tags.
            // This regex is simpler due to the self-closing nature and typical standalone placement of `<hr />`.
            /*
             *  Conceptual Regex:
             *  `\n`                            : Preceded by a newline.
             *  `[ ]{0,3}`                      : Optional leading spaces.
             *  `(`                             : Capture group 1 (the `hr` block).
             *      `(<(hr)`                    : Capture group 2 (the `<hr>` tag), $3 is 'hr'.
             *      `\b`                        : Word boundary.
             *      `([^<>])*?`                 : Any characters except `<` or `>` (attributes), non-greedy.
             *      `\/?>)`                     : Self-closing `/>` or explicit `>`.
             *      `[ \t]*`                    : Optional trailing whitespace.
             *      `(?=\n{2,})`                : Followed by at least two newlines (a blank line).
             *  `)`
             */
            text    =   text.replace    (   /\n[ ]{0,3}((<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g,   hashElement   )   ;


            // Special case handling for standalone HTML comments.
            // This regex precisely matches valid HTML comment syntax.
            /*
             *  Conceptual Regex:
             *  `\n\n`                          : Preceded by two newlines (a blank line).
             *  `[ ]{0,3}`                      : Optional leading spaces.
             *  `(`                             : Capture group 1 (the entire comment block).
             *      `<!`                        : Opening comment delimiter.
             *      `(--(?:|(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)` : Complex part to match valid comment content (handles `--` inside comments).
             *      `>`                         : Closing comment delimiter.
             *      `[ \t]*`                    : Optional trailing whitespace.
             *      `(?=\n{2,})`                : Followed by at least two newlines (a blank line).
             *  `)`
             */
            text    =   text.replace    (   /\n\n[ ]{0,3}(<!(--(?:|(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)>[ \t]*(?=\n{2,}))/g,   hashElement   )   ;


            // Special case handling for PHP/ASP-style processor instructions (`<?...?>` and `<%...%>`).
            // These are treated as block-level elements and hashed out.
            /*
             *  Conceptual Regex:
             *  `(?: \n\n )`                    : Preceded by two newlines (non-capturing).
             *  `(`                             : Capture group 1 (the entire instruction block).
             *      `[ ]{0,3}`                  : Optional leading spaces.
             *      `(?:`                       : Non-capturing group for the instruction itself.
             *          `<([?%])`               : Capture group 2 ($2) for `?` or `%`.
             *          `[^\r]*?`               : Any non-CR characters (non-greedy).
             *          `\2>`                   : Matching closing tag (e.g., `?>` or `%>`).
             *      `)`
             *      `[ \t]*`                    : Optional trailing whitespace.
             *      `(?=\n{2,})`                : Followed by at least two newlines (a blank line).
             *  `)`
             */
            text    =   text.replace    (   /(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g,   hashElement   )   ;


            return   text   ;
        }


        /**
         *  A helper function used by `_HashHTMLBlocks`. It takes a matched HTML block,
         *  cleans up its leading/trailing newlines, stores it in `g_html_blocks`,
         *  and returns a unique placeholder string (`~KxK`) to replace it in the text.
         *
         *  @param {string} wholeMatch - The entire string matched by the regex.
         *  @param {string} m1 - The first captured group, typically the content of the HTML block.
         *  @returns {string} The placeholder string for the hashed HTML block.
         */
        function    hashElement    (   wholeMatch,   m1   )   {
            var   blockText   =   m1;

            // Remove any leading newlines from the captured block text.
            blockText   =   blockText.replace   (   /^\n+/,   ""   )   ;

            // Remove any trailing blank lines from the captured block text.
            blockText   =   blockText.replace   (   /\n+$/g,   ""   )   ;

            // Generate a unique placeholder marker. The block text is stored
            // in `g_html_blocks`, and its index (minus 1, since `push` returns new length)
            // forms the `x` in the `~KxK` marker.
            blockText   =   "\n\n~K"   +   (   g_html_blocks.push   (   blockText   )   -   1   )   +   "K\n\n"   ;


            return   blockText   ;
        }


        /**
         *  Executes the core block-level transformations of Markdown.
         *  This includes processing headers, horizontal rules, lists, code blocks,
         *  blockquotes, and finally wrapping remaining text in paragraphs.
         *
         *  @param {string} text - The Markdown text to be processed.
         *  @param {boolean} [doNotUnhash] - Optional flag; if true, prevents unhashing of HTML blocks at the end.
         *  @returns {string} The text after all block-level transformations have been applied.
         */
        function    _RunBlockGamut    (   text,   doNotUnhash   )   {

            // Apply Markdown header processing (e.g., `# Header` to `<h1>Header</h1>`).
            text   =   _DoHeaders   (   text   )   ;

            // Process Markdown horizontal rules (e.g., `---`, `***`, `___`).
            // These are replaced with `<hr />` HTML tags.
            var   replacement   =   "<hr   />\n"   ;
            text   =   text.replace   (   /^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm,   replacement   )   ;
            text   =   text.replace   (   /^[ ]{0,2}([ ]?-[ ]?){3,}[ \t]*$/gm,   replacement   )   ;
            text   =   text.replace   (   /^[ ]{0,2}([ ]?_[ ]?){3,}[ \t]*$/gm,   replacement   )   ;

            // Process Markdown lists (ordered and unordered).
            text   =   _DoLists   (   text   )   ;

            // Process Markdown code blocks (indented code blocks).
            text   =   _DoCodeBlocks   (   text   )   ;

            // Process Markdown blockquotes (text prefixed with `>`).
            text   =   _DoBlockQuotes   (   text   )   ;


            // Re-hash HTML blocks. This is a crucial step.
            // The first call to `_HashHTMLBlocks()` in `makeHtml()` protected *original* HTML.
            // This second call protects *newly generated* block-level HTML (e.g., from lists,
            // tables, etc.) from being inadvertently wrapped within `<p>` tags by `_FormParagraphs()`.
            text   =   _HashHTMLBlocks   (   text   )   ;

            // Form paragraphs from any remaining block-level text that hasn't been handled
            // by specific block transformations.
            text   =   _FormParagraphs   (   text,   doNotUnhash   )   ;


            return   text   ;
        }


        /**
         *  Applies all span-level (inline) transformations to the Markdown text.
         *  These transformations operate *within* block-level elements,
         *  handling inline elements such as code spans, emphasis, links, and images.
         *
         *  @param {string} text - The text fragment (e.g., a paragraph, list item) to process.
         *  @returns {string} The text after inline transformations have been applied.
         */
        function    _RunSpanGamut    (   text   )   {

            // 1. Process Markdown inline code spans (e.g., `backticks`).
            text   =   _DoCodeSpans   (   text   )   ;

            // 2. Escape special Markdown characters (`\`, `` ` `` , `*`, `_`)
            //    when they are found within HTML tag attributes. This prevents them
            //    from being misinterpreted as Markdown syntax.
            text   =   _EscapeSpecialCharsWithinTagAttributes   (   text   )   ;

            // 3. Process backslash escapes (e.g., `\*` becomes `&#42;`).
            text   =   _EncodeBackslashEscapes   (   text   )   ;


            // 4. Process Markdown images and anchors (links).
            //    Image syntax (`![alt][id]`) must be processed *before* anchor syntax (`[text][id]`)
            //    because an image syntax could be mistakenly identified as a link.
            text   =   _DoImages   (   text   )   ;
            text   =   _DoAnchors   (   text   )   ;


            // 5. Convert bare URLs and email addresses enclosed in angle brackets
            //    (e.g., `<http://example.com/>`) into clickable HTML links.
            //    This step must occur *after* `_DoAnchors()` because `<` and `>`
            //    can also be used as delimiters in inline links.
            text   =   _DoAutoLinks   (   text   )   ;

            // Restore the "://" string that was temporarily replaced with `~P`
            // earlier to prevent it from being incorrectly auto-linked.
            text   =   text.replace   (   /~P/g,   "://"   )   ;


            // 6. Encode HTML-sensitive characters (`&`, `<`, `>`) into their
            //    corresponding HTML entities, unless they are already part of
            //    existing HTML tags or entities.
            text   =   _EncodeAmpsAndAngles   (   text   )   ;

            // 7. Process Markdown emphasis (italics and bold) using `*` or `_`.
            text   =   _DoItalicsAndBold   (   text   )   ;


            // 8. Convert newline characters (`\n`) into HTML `<br>\n` for hard line breaks.
            //    (Historical note: `SV: don't need trailing spaces for line breaks` refers
            //    to a specific implementation detail or optimization.)
            text   =   text.replace   (   /\n/g,   "<br>\n"   )   ;


            return   text   ;
        }


        /**
         *  Escapes specific Markdown-sensitive characters (backslash, backtick, asterisk, underscore, slash)
         *  when they are found *within* HTML tags (e.g., inside attributes).
         *  This prevents these characters from being misinterpreted as Markdown syntax.
         *
         *  @param {string} text - The input text, potentially containing HTML tags.
         *  @returns {string} The text with relevant characters within HTML tags escaped.
         */
        function    _EscapeSpecialCharsWithinTagAttributes    (   text   )   {

            // The goal is to identify HTML tags and comments, then apply character escaping
            // *only* within those identified tag structures.
            // The regex for finding HTML tags and comments is complex;
            // a good reference is Jeffrey Friedl's "Mastering Regular Expressions".

            // Original developer's note: "SE: changed the comment part of the regex"
            // This indicates a refinement for accurately matching HTML comments.
            var   regex   =   /   (<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>   |   <!(--(?:|(?:[^>-]|-[^>])(?:[^-]|-[^-])*)--)>   )   /gi;


            text   =   text.replace   (   regex,   function   (   wholeMatch   )   {
                // Temporarily replace `<code>` tags with backticks for internal processing consistency.
                var   tag   =   wholeMatch.replace   (   /(.)<\/?code>(?=.)/g,   "$1`"   )   ;

                // Apply character escaping.
                // If the matched item is an HTML comment (starts with `<!`),
                // also escape forward slashes to prevent accidental auto-linking within comments.
                // (This addresses a specific bug, as noted: http://meta.stackoverflow.com/questions/95987)
                tag   =   escapeCharacters   (   tag,   wholeMatch.charAt   (   1   )   ==   "!"   ?   "\\`*_/"   :   "\\`*_"   )   ;
                return   tag;
            }   )   ;

            return   text   ;
        }


        /**
         *  Converts Markdown link syntax into corresponding HTML `<a>` tags.
         *  This function handles both reference-style links (`[text][id]`)
         *  and inline-style links (`[text](url "title")`).
         *
         *  @param {string} text - The Markdown text to be processed.
         *  @returns {string} The text with Markdown links transformed into HTML `<a>` tags.
         */
        function    _DoAnchors    (   text   )   {

            // --- Phase 1: Process reference-style links ---
            // Format: `[link text] [id]` or `[link text]` (where `id` defaults to `link text`).
            // The `()()()()` padding for backreferences ensures compatibility with `writeAnchorTag`.

            /*
             *  Conceptual Regex for reference links:
             *  `(                                  // $1: Capture the entire link construct.
             *      \[                              // Literal opening bracket.
             *      (                               // $2: Capture the link text.
             *          (?:                         // Non-capturing group for link text content.
             *              \[[^\]]*\]              // Allow one level of nested brackets within link text.
             *              |                       // OR
             *              [^\[\]]                 // Any character except brackets.
             *          )*
             *      )
             *      \]                              // Literal closing bracket.
             *
             *      [ ]?                            // Optional single space.
             *      (?:\n[ ]*)?                     // Optional newline followed by spaces.
             *
             *      \[                              // Literal opening bracket for the ID.
             *      (.*?)                           // $3: Capture the link ID (non-greedy).
             *      \]                              // Literal closing bracket for the ID.
             *  )`
             *  `()()()()`                          // Empty capture groups to match `writeAnchorTag`'s expected arguments.
             */
            text    =   text.replace    (   /(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,   writeAnchorTag   )   ;


            // --- Phase 2: Process inline-style links ---
            // Format: `[link text](url "optional title")`.

            /*
             *  Conceptual Regex for inline links (as commented in the original source):
             *  ```javascript
             *  text = text.replace(/
             *      (                           // wrap whole match in $1
             *          \[
             *          (
             *              (?:
             *                  \[[^\]]*\]      // allow brackets nested one level
             *                  |
             *                  [^\[]           // or anything else
             *              )*
             *          )
             *          \]
             *          \(                      // literal paren
             *          [ \t]*
             *          <?(.*?)>?               // href = $3
             *          [ \t]*
             *          (                       // $4: Group to capture optional title
             *              ['"]                // quote char
             *              (.+?)               // $5: Title
             *              ['"]                // matching quote char
             *              [ \t]*
             *          )?                      // title is optional
             *          \)
             *      )
             *  /g, writeAnchorTag);
             *  ```
             */

        }
}   (   )   )   ;