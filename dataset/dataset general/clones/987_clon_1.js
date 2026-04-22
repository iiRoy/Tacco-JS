/*
*   Less - Leaner CSS v1.7.4
*   http://lesscss.org
*
*   Copyright (c) 2009-2014, Alexis Sellier <self@cloudhead.net>
*   Licensed under the Apache v2 License.
*
*/

/*
 * @license Apache v2 - This license applies to the entire Less.js project.
 */

( function( window, undefined )
{
    /*
     *  Stub out `require` for browser environments.
     *  This function provides a minimal `require` implementation
     *  that fetches modules from the global `window.less` object.
     */
    function require( arg )
    {
        return window.less[ arg.split( '/' )[ 1 ] ];
    };


    // Initialize the global 'less' object if it doesn't exist
    // or if it's a nodeType (which is usually an indicator of a DOM element, not a Less object).
    if ( typeof( window.less ) === 'undefined' || typeof( window.less.nodeType ) !== 'undefined' )
    {
        window.less = {};
    }

    // Assign 'less' to the global 'window.less' object.
    less = window.less;

    // Initialize the 'tree' namespace within 'less'.
    tree = window.less.tree = {};

    // Set the operating mode to 'browser' by default.
    less.mode = 'browser';

    // Declare 'less' and 'tree' variables. These might be re-declared later in Node.js context.
    var less, tree;

    // For Node.js environments, 'less' might be undefined if no header file was included.
    // In such cases, initialize 'less' and 'tree' using Node.js specific mechanisms.
    if ( less === undefined )
    {
        // In Node.js, 'exports' is used for module definition.
        less = exports;

        // Load the 'tree' module using Node's 'require'.
        tree = require( './tree' );

        // Set the operating mode to 'node'.
        less.mode = 'node';
    }

    /*
     *  less.js - The Core Parser Implementation
     *
     *  This module provides a relatively straightforward predictive parser.
     *  It operates without a separate tokenization or lexing stage;
     *  the entire input is parsed in a single sweep.
     *
     *  To ensure adequate performance, especially when running in a browser environment,
     *  several key optimizations have been incorporated:
     *
     *  1.  **Input Chunking:** Operations like matching and slicing on very large input strings
     *      can significantly degrade performance. The parser addresses this by chunkifying
     *      the input into smaller, more manageable strings. These chunks are stored
     *      in the `chunks` variable. The `j` variable tracks the current chunk index,
     *      and `currentPos` indicates the position of the current chunk relative to the
     *      original full input string. This strategy has been observed to yield
     *      approximately a 4x improvement in parsing speed.
     *
     *  2.  **Literal Skipping:** In many scenarios, there is no need to meticulously match
     *      every individual token. For instance, if a CSS value contains no variables,
     *      operations, or dynamic references, the parser can efficiently 'skip' over it,
     *      treating it as a simple literal string. A common example is '1px solid #000';
     *      this value evaluates to itself, and there's no need to analyze its constituent parts.
     *      The primary trade-off here is that this approach bypasses syntax-checking for
     *      such literal CSS segments. This optimization contributes to a 50% speed-up
     *      in the parsing phase and a smaller, but still noticeable, speed-up in the
     *      code generation process.
     *
     *  Token matching is facilitated by the `$` function. This function is versatile,
     *  accepting either a terminal string, a regular expression, or a non-terminal
     *  function to invoke. Crucially, it also manages the advancement of all
     *  relevant parser indices.
     */
    less.Parser = function Parser( env )
    {
        var input,       // The raw LeSS input string to be parsed.
            i,           // The current index within the `input` string.
            j,           // The index of the current chunk being processed.
            saveStack = [],   // A stack used to store parser state for backtracking purposes.
            furthest,    // Tracks the furthest index the parser has reached.
            chunks,      // An array containing chunkified segments of the input string.
            current,     // The currently active chunk from the `chunks` array.
            currentPos,  // The starting index of the `current` chunk relative to the full `input` string.
            parser,      // Reference to the parser object itself.
            parsers,     // A collection of parser functions.
            rootFilename = env && env.filename; // The filename of the root Less file, if available.

        // Ensure that 'env' is an instance of 'tree.parseEnv'.
        // If not, create a new one, ensuring a consistent environment object
        // that can be passed by reference throughout the import tree.
        if ( ! ( env instanceof tree.parseEnv ) )
        {
            env = new tree.parseEnv( env );
        }

        /*
         *  The 'imports' object manages the Less import process.
         *  It handles paths, queues, file contents, and error reporting.
         */
        var imports = this.imports = {
            paths: env.paths || [],  // List of search paths for resolving imports.
            queue: [],               // A queue of files that are pending import processing.
            files: env.files,        // A map storing the parsed ASTs of imported files.
            contents: env.contents,  // A map storing the raw content of imported files.
            contentsIgnoredChars: env.contentsIgnoredChars, // Tracks characters inserted, not in original Less.
            mime:  env.mime,         // The MIME type associated with .less files.
            error: null,             // Stores any error encountered during import parsing/evaluation.

            /**
             *  Pushes a new import request onto the queue and handles its processing.
             *  @param {string} path - The path to the file to import.
             *  @param {object} currentFileInfo - Information about the currently parsing file.
             *  @param {object} importOptions - Options specific to this import (e.g., `reference`, `inline`).
             *  @param {function} callback - Callback function to execute once the import is processed.
             */
            push: function( path, currentFileInfo, importOptions, callback )
            {
                var parserImports = this;
                this.queue.push( path ); // Add the path to the import queue.

                // This function is called once a file has been parsed or an error occurred.
                var fileParsedFunc = function( e, root, fullPath )
                {
                    // Remove the path from the queue once processing is complete.
                    parserImports.queue.splice( parserImports.queue.indexOf( path ), 1 );

                    // Determine if the imported file was the root file (already processed).
                    var importedPreviously = fullPath === rootFilename;

                    // Store the root AST for this full path.
                    parserImports.files[ fullPath ] = root;

                    // If an error occurred and no other error is present, store it.
                    if ( e && ! parserImports.error )
                    {
                        parserImports.error = e;
                    }

                    // Invoke the original callback.
                    callback( e, root, importedPreviously, fullPath );
                };

                // Check if a custom importer is defined.
                if ( less.Parser.importer )
                {
                    less.Parser.importer( path, currentFileInfo, fileParsedFunc, env );
                }
                else
                {
                    // If no custom importer, use the default file loader.
                    less.Parser.fileLoader( path, currentFileInfo, function( e, contents, fullPath, newFileInfo )
                    {
                        if ( e )
                        {
                            fileParsedFunc( e );
                            return;
                        }

                        // Create a new parsing environment for the imported file.
                        var newEnv = new tree.parseEnv( env );

                        newEnv.currentFileInfo = newFileInfo;
                        newEnv.processImports = false; // Prevent recursive import processing in the new parser.
                        newEnv.contents[ fullPath ] = contents;

                        // Propagate reference flag if present.
                        if ( currentFileInfo.reference || importOptions.reference )
                        {
                            newFileInfo.reference = true;
                        }

                        // If the import is inline, just pass the contents directly.
                        if ( importOptions.inline )
                        {
                            fileParsedFunc( null, contents, fullPath );
                        }
                        else
                        {
                            // Otherwise, parse the contents of the imported file.
                            new( less.Parser )( newEnv ).parse( contents, function( e, root )
                            {
                                fileParsedFunc( e, root, fullPath );
                            } );
                        }
                    }, env );
                }
            }
        };

        /**
         *  Saves the current parser state onto the saveStack.
         *  This allows for backtracking if a parsing attempt fails.
         */
        function save()
        {
            currentPos = i;
            saveStack.push( { current: current, i: i, j: j } );
        }

        /**
         *  Restores the parser state from the top of the saveStack.
         *  Used after a failed parsing attempt to revert to a previous state.
         */
        function restore()
        {
            var state = saveStack.pop();
            current = state.current;
            currentPos = i = state.i;
            j = state.j;
        }

        /**
         *  Discards the top state from the saveStack without restoring.
         *  Used when a parsing attempt is successful and backtracking is no longer needed for that point.
         */
        function forget()
        {
            saveStack.pop();
        }

        /**
         *  Synchronizes the 'current' chunk with the current 'i' index.
         *  This effectively "consumes" the part of the chunk that has already been parsed.
         */
        function sync()
        {
            if ( i > currentPos )
            {
                current = current.slice( i - currentPos );
                currentPos = i;
            }
        }

        /**
         *  Checks if a character at a given position in a string is whitespace.
         *  @param {string} str - The string to check.
         *  @param {number} pos - The position in the string.
         *  @returns {boolean} - True if the character is whitespace, false otherwise.
         */
        function isWhitespace( str, pos )
        {
            var code = str.charCodeAt( pos | 0 );
            // Checks for space (32), newline (10), tab (9), or other control characters <= 32.
            return ( code <= 32 ) && ( code === 32 || code === 10 || code === 9 );
        }

        /*
         *  The primary matching function.
         *  Attempts to match a token (string, regexp, or function) and advances the parser.
         *  @param {string|RegExp|function} tok - The token to match.
         *  @returns {string|Array|null} - The matched string/array, or null if no match.
         */
        function $( tok )
        {
            var tokType = typeof tok,
                match,
                length;

            // If the token is a string, try to match a single character directly from the input.
            if ( tokType === "string" )
            {
                if ( input.charAt( i ) !== tok )
                {
                    return null; // No match.
                }
                skipWhitespace( 1 ); // Consume the matched character and any following whitespace.
                return tok;          // Return the matched string.
            }

            // If the token is a regular expression, synchronize the current chunk and attempt a match.
            sync(); // Ensure 'current' chunk is up-to-date.
            if ( ! ( match = tok.exec( current ) ) )
            {
                return null; // No match found by the regex.
            }

            length = match[ 0 ].length; // Get the length of the full matched string.

            // The match is confirmed. Advance the parser index 'i' by the match length.
            // Then, consume any subsequent whitespace characters (space, newline, etc.).
            // This is crucial because Less grammar is largely whitespace-insensitive.
            skipWhitespace( length );

            // Return the match. If it's a simple string, return it directly; otherwise, return the array.
            if ( typeof( match ) === 'string' )
            {
                return match;
            }
            else
            {
                return match.length === 1 ? match[ 0 ] : match;
            }
        }

        /*
         *  A specialized version of $(tok) for regular expressions.
         *  It performs a regex match on the current chunk and advances the parser.
         *  @param {RegExp} tok - The regular expression to match.
         *  @returns {string|Array|null} - The matched string/array, or null if no match.
         */
        function $re( tok )
        {
            // First, ensure 'current' chunk reflects the actual parsing position.
            if ( i > currentPos )
            {
                current = current.slice( i - currentPos );
                currentPos = i;
            }

            var m = tok.exec( current ); // Attempt regex execution.
            if ( ! m )
            {
                return null; // No match.
            }

            // If a match is found, advance past the matched text and any following whitespace.
            skipWhitespace( m[ 0 ].length );

            // Return the match.
            if ( typeof m === "string" )
            {
                return m;
            }

            return m.length === 1 ? m[ 0 ] : m;
        }

        var _$re = $re; // Alias for $re; might be used for internal consistency or testing.

        /*
         *  A specialized version of $(tok) for single character matches.
         *  It efficiently checks for a specific character at the current position.
         *  @param {string} tok - The single character to match.
         *  @returns {string|null} - The matched character, or null if no match.
         */
        function $char( tok )
        {
            if ( input.charAt( i ) !== tok )
            {
                return null; // Character mismatch.
            }
            skipWhitespace( 1 ); // Consume the character and any subsequent whitespace.
            return tok;          // Return the matched character.
        }

        /*
         *  Advances the parser past a given length and skips any following whitespace.
         *  Manages chunk transitions if the current chunk is exhausted.
         *  @param {number} length - The number of characters to advance past.
         *  @returns {boolean} - True if the parser state (i or j) changed, false otherwise.
         */
        function skipWhitespace( length )
        {
            var oldi = i,
                oldj = j,
                curr = i - currentPos,
                endIndex = i + current.length - curr,
                mem = ( i += length ), // Advance 'i' by 'length' and store its value.
                inp = input,
                c; // Character code.

            // Loop through characters, breaking if a non-whitespace character is found.
            for ( ; i < endIndex; i++ )
            {
                c = inp.charCodeAt( i );
                if ( c > 32 )
                {
                    break;
                }

                // Explicitly check for common whitespace characters (space, newline, tab, carriage return).
                if ( ( c !== 32 ) && ( c !== 10 ) && ( c !== 9 ) && ( c !== 13 ) )
                {
                    break;
                }
            }

            // Update the 'current' chunk by slicing off the consumed part.
            // 'mem' is the new 'i' after advancing by 'length'.
            // 'i - mem' is the amount of whitespace skipped after the 'length' was consumed.
            current = current.slice( length + i - mem + curr );
            currentPos = i; // Update current chunk's start position.

            // If the current chunk is exhausted and there are more chunks, move to the next.
            if ( ! current.length && ( j < chunks.length - 1 ) )
            {
                current = chunks[ ++j ]; // Move to the next chunk.
                skipWhitespace( 0 );     // Recursively call to skip whitespace at the beginning of the new chunk.
                return true;             // Indicate that the state changed.
            }

            // Return true if 'i' or 'j' (chunk index) changed, indicating progress.
            return oldi !== i || oldj !== j;
        }

        /**
         *  Expects a specific token (string, regex, or parser function) to match.
         *  If it doesn't match, an error is thrown.
         *  @param {string|RegExp|function} arg - The token or parser function to expect.
         *  @param {string} [msg] - Custom error message if the expectation fails.
         *  @param {number} [index] - Optional index for error reporting.
         *  @returns {any} - The result of the match or function call.
         */
        function expect( arg, msg, index )
        {
            // Determine if 'arg' is a function (some older browsers return 'function' for RegExp).
            var result = ( Object.prototype.toString.call( arg ) === '[object Function]' ) ? arg.call( parsers ) : $( arg );
            if ( result )
            {
                return result;
            }
            // If no match, throw an error.
            error( msg || ( typeof( arg ) === 'string' ? "expected '" + arg + "' got '" + input.charAt( i ) + "'"
                                                       : "unexpected token" ) );
        }

        /**
         *  Specialized version of `expect()` for expecting a single character.
         *  More efficient than using `expect()` with a string for single characters.
         *  @param {string} arg - The single character to expect.
         *  @param {string} [msg] - Custom error message.
         *  @returns {string} - The matched character.
         */
        function expectChar( arg, msg )
        {
            if ( input.charAt( i ) === arg )
            {
                skipWhitespace( 1 );
                return arg;
            }
            error( msg || "expected '" + arg + "' got '" + input.charAt( i ) + "'" );
        }

        /**
         *  Throws a parsing error.
         *  @param {string} msg - The error message.
         *  @param {string} [type] - The type of error (defaults to 'Syntax').
         */
        function error( msg, type )
        {
            var e = new Error( msg );
            e.index = i;
            e.type = type || 'Syntax';
            throw e;
        }

        /*
         *  Peeks ahead without changing the parser's state.
         *  Checks if a token (string or regex) would match at the current position.
         *  @param {string|RegExp} tok - The token to peek for.
         *  @returns {boolean} - True if a match would occur, false otherwise.
         */
        function peek( tok )
        {
            if ( typeof( tok ) === 'string' )
            {
                return input.charAt( i ) === tok;
            }
            else
            {
                return tok.test( current ); // Test against the current chunk for regex.
            }
        }

        /**
         *  Specialized version of `peek()` for single characters.
         *  @param {string} tok - The single character to peek for.
         *  @returns {boolean} - True if the character matches, false otherwise.
         */
        function peekChar( tok )
        {
            return input.charAt( i ) === tok;
        }


        /**
         *  Retrieves the input stream relevant to an error.
         *  If the error is from an imported file, it returns that file's content.
         *  Otherwise, it returns the main input stream.
         *  @param {Error} e - The error object.
         *  @param {object} env - The parsing environment.
         *  @returns {string} - The relevant input stream content.
         */
        function getInput( e, env )
        {
            if ( e.filename && env.currentFileInfo.filename && ( e.filename !== env.currentFileInfo.filename ) )
            {
                return parser.imports.contents[ e.filename ];
            }
            else
            {
                return input;
            }
        }

        /**
         *  Calculates the line and column number for a given index in an input stream.
         *  @param {number} index - The character index.
         *  @param {string} inputStream - The full input string.
         *  @returns {{line: number, column: number}} - Object with line and column.
         */
        function getLocation( index, inputStream )
        {
            var n = index + 1,
                line = null,
                column = -1;

            // Count characters back from 'index' to find the start of the line.
            while ( --n >= 0 && inputStream.charAt( n ) !== '\n' )
            {
                column++;
            }

            // Calculate the line number by counting newlines up to the index.
            if ( typeof index === 'number' )
            {
                line = ( inputStream.slice( 0, index ).match( /\n/g ) || "" ).length;
            }

            return {
                line: line,
                column: column
            };
        }

        /**
         *  Generates debug information (line number, file name) for a given index.
         *  @param {number} index - The character index.
         *  @param {string} inputStream - The full input string.
         *  @param {object} env - The parsing environment.
         *  @returns {{lineNumber: number, fileName: string}} - Debug info object.
         */
        function getDebugInfo( index, inputStream, env )
        {
            var filename = env.currentFileInfo.filename;
            // In non-browser/rhino modes, resolve the filename to an absolute path.
            if ( less.mode !== 'browser' && less.mode !== 'rhino' )
            {
                filename = require( 'path' ).resolve( filename );
            }

            return {
                lineNumber: getLocation( index, inputStream ).line + 1,
                fileName: filename
            };
        }

        /**
         *  Custom Error class for Less parsing errors, providing enhanced context.
         *  @param {Error} e - The original error object.
         *  @param {object} env - The parsing environment.
         *  @constructor
         *  @augments Error
         */
        function LessError( e, env )
        {
            var input = getInput( e, env ), // Get the relevant input string.
                loc = getLocation( e.index, input ), // Get line/column for the error.
                line = loc.line,
                col = loc.column,
                callLine = e.call && getLocation( e.call, input ).line, // Line number for a call stack context.
                lines = input.split( '\n' ); // Split input into individual lines.

            this.type = e.type || 'Syntax';         // Error type (e.g., 'Syntax').
            this.message = e.message;               // The error message.
            this.filename = e.filename || env.currentFileInfo.filename; // File where the error occurred.
            this.index = e.index;                   // Character index of the error.
            this.line = typeof( line ) === 'number' ? line + 1 : null; // 1-based line number.
            this.callLine = callLine + 1;           // 1-based call line number.
            this.callExtract = lines[ callLine ];   // The line of code where a call error occurred.
            this.stack = e.stack;                   // The JavaScript error stack.
            this.column = col;                      // 0-based column number.
            this.extract = [                        // Lines surrounding the error for context.
                lines[ line - 1 ],
                lines[ line ],
                lines[ line + 1 ]
            ];
        }

        // Inherit from the native Error prototype.
        LessError.prototype = new Error();
        // Correct the constructor reference.
        LessError.prototype.constructor = LessError;

        // Initialize the environment object, if not already present.
        this.env = env = env || {};

        /*
         *  The 'optimization' level controls the thoroughness of the parser.
         *  A lower number implies less node creation in the AST, which can affect
         *  debugging capabilities or direct access to individual AST nodes.
         */
        this.optimization = ( 'optimization' in this.env ) ? this.env.optimization : 1;

        /*
         *  The main parser object, containing the core parsing logic.
         */
        parser = {

            imports: imports, // Expose the imports manager.

            /**
             *  Parses an input string containing Less markup into an abstract syntax tree (AST).
             *  @param {string} str - The Less input string.
             *  @param {function} callback - Callback function to be invoked upon completion.
             *  @param {object} [additionalData] - Optional map containing variables to apply.
             */
            parse: function( str, callback, additionalData )
            {
                var root,
                    line,
                    lines,
                    error = null,
                    globalVars,
                    modifyVars,
                    preText = "";

                // Reset parser indices and state for a new parse operation.
                i = j = currentPos = furthest = 0;

                // Serialize global and modify variables into Less syntax if provided.
                globalVars = ( additionalData && additionalData.globalVars ) ? less.Parser.serializeVars( additionalData.globalVars ) + '\n' : '';
                modifyVars = ( additionalData && additionalData.modifyVars ) ? '\n' + less.Parser.serializeVars( additionalData.modifyVars ) : '';

                // Prepend banner and global variables to the input string.
                if ( globalVars || ( additionalData && additionalData.banner ) )
                {
                    preText = ( ( additionalData && additionalData.banner ) ? additionalData.banner : "" ) + globalVars;
                    parser.imports.contentsIgnoredChars[ env.currentFileInfo.filename ] = preText.length;
                }

                str = str.replace( /\r\n/g, '\n' ); // Normalize line endings to LF.
                // Remove potential UTF Byte Order Mark (BOM) from the start of the string.
                input = str = preText + str.replace( /^\uFEFF/, '' ) + modifyVars;
                parser.imports.contents[ env.currentFileInfo.filename ] = str;

                /*
                 *  Chunkify the input string into smaller segments.
                 *  This optimization improves performance by reducing the need to slice
                 *  and match on very large strings repeatedly.
                 */
                chunks = ( function( input )
                {
                    var len = input.length,
                        level = 0,        // Tracks nesting level for curly braces {}.
                        parenLevel = 0,   // Tracks nesting level for parentheses ().
                        lastOpening,
                        lastOpeningParen,
                        lastMultiComment,
                        lastMultiCommentEndBrace,
                        chunks = [],
                        emitFrom = 0,
                        parserCurrentIndex,
                        currentChunkStartIndex,
                        cc,                // Current character code.
                        cc2,               // Next character code.
                        matched;

                    /**
                     *  Reports a parsing failure by creating and assigning a LessError.
                     *  @param {string} msg - The error message.
                     *  @param {number} [index] - The character index where the error occurred.
                     */
                    function fail( msg, index )
                    {
                        error = new( LessError )( {
                            index: index || parserCurrentIndex,
                            type: 'Parse',
                            message: msg,
                            filename: env.currentFileInfo.filename
                        }, env );
                    }

                    /**
                     *  Emits a chunk of the input string if it meets certain criteria.
                     *  Helps in breaking down large inputs for performance.
                     *  @param {boolean} force - If true, forces chunk emission regardless of length.
                     */
                    function emitChunk( force )
                    {
                        var len = parserCurrentIndex - emitFrom;
                        // Emit if chunk is large enough (>= 512 chars) or forced, and not empty.
                        if ( ( ( len < 512 ) && ! force ) || ! len )
                        {
                            return;
                        }
                        chunks.push( input.slice( emitFrom, parserCurrentIndex + 1 ) );
                        emitFrom = parserCurrentIndex + 1;
                    }

                    // Iterate through the entire input string to identify chunk boundaries and potential errors.
                    for ( parserCurrentIndex = 0; parserCurrentIndex < len; parserCurrentIndex++ )
                    {
                        cc = input.charCodeAt( parserCurrentIndex );

                        // Optimize: skip common a-z characters and general whitespace without detailed checks.
                        if ( ( ( cc >= 97 ) && ( cc <= 122 ) ) || ( cc < 34 ) )
                        {
                            continue;
                        }

                        switch ( cc )
                        {
                            case 40: // ASCII for '('
                                parenLevel++;
                                lastOpeningParen = parserCurrentIndex;
                                continue;
                            case 41: // ASCII for ')'
                                if ( --parenLevel < 0 )
                                {
                                    return fail( "missing opening `(`" ); // Unmatched closing parenthesis.
                                }
                                continue;
                            case 59: // ASCII for ';'
                                if ( ! parenLevel )
                                {
                                    emitChunk(); // Emit chunk if not inside parentheses.
                                }
                                continue;
                            case 123: // ASCII for '{'
                                level++;
                                lastOpening = parserCurrentIndex;
                                continue;
                            case 125: // ASCII for '}'
                                if ( --level < 0 )
                                {
                                    return fail( "missing opening `{`" ); // Unmatched closing brace.
                                }
                                if ( ! level && ! parenLevel )
                                {
                                    emitChunk(); // Emit chunk if not inside any braces or parentheses.
                                }
                                continue;
                            case 92: // ASCII for '\' (backslash)
                                // Handle escaped characters: skip the next character.
                                if ( parserCurrentIndex < len - 1 )
                                {
                                    parserCurrentIndex++;
                                    continue;
                                }
                                return fail( "unescaped `\\`" ); // Backslash at end of input.
                            case 34: // ASCII for '"'
                            case 39: // ASCII for '''
                            case 96: // ASCII for '`' (backtick)
                                matched = 0;
                                currentChunkStartIndex = parserCurrentIndex;
                                // Scan for the matching closing quote/backtick.
                                for ( parserCurrentIndex = parserCurrentIndex + 1; parserCurrentIndex < len; parserCurrentIndex++ )
                                {
                                    cc2 = input.charCodeAt( parserCurrentIndex );
                                    if ( cc2 > 96 )
                                    {
                                        continue;
                                    }
                                    if ( cc2 == cc )
                                    {
                                        matched = 1;
                                        break;
                                    }
                                    if ( cc2 == 92 )
                                    {
                                        // Handle escaped quotes within strings.
                                        if ( parserCurrentIndex == len - 1 )
                                        {
                                            return fail( "unescaped `\\`" );
                                        }
                                        parserCurrentIndex++;
                                    }
                                }
                                if ( matched )
                                {
                                    continue; // Successfully matched string literal.
                                }
                                return fail( "unmatched `" + String.fromCharCode( cc ) + "`", currentChunkStartIndex ); // Unmatched quote.
                            case 47: // ASCII for '/'
                                // Check for comments (// or /* */).
                                if ( parenLevel || ( parserCurrentIndex == len - 1 ) )
                                {
                                    continue; // Not a comment if inside parentheses or at end of input.
                                }
                                cc2 = input.charCodeAt( parserCurrentIndex + 1 );
                                if ( cc2 == 47 )
                                {
                                    // It's a single-line comment (//). Find the next line feed.
                                    for ( parserCurrentIndex = parserCurrentIndex + 2; parserCurrentIndex < len; parserCurrentIndex++ )
                                    {
                                        cc2 = input.charCodeAt( parserCurrentIndex );
                                        if ( ( cc2 <= 13 ) && ( ( cc2 == 10 ) || ( cc2 == 13 ) ) )
                                        {
                                            break;
                                        }
                                    }
                                }
                                else if ( cc2 == 42 )
                                {
                                    // It's a multi-line comment (/* */). Find the closing '*/'.
                                    lastMultiComment = currentChunkStartIndex = parserCurrentIndex;
                                    for ( parserCurrentIndex = parserCurrentIndex + 2; parserCurrentIndex < len - 1; parserCurrentIndex++ )
                                    {
                                        cc2 = input.charCodeAt( parserCurrentIndex );
                                        if ( cc2 == 125 )
                                        {
                                            lastMultiCommentEndBrace = parserCurrentIndex;
                                        }
                                        if ( cc2 != 42 )
                                        {
                                            continue;
                                        }
                                        if ( input.charCodeAt( parserCurrentIndex + 1 ) == 47 )
                                        {
                                            break; // Found '*/'.
                                        }
                                    }
                                    if ( parserCurrentIndex == len - 1 )
                                    {
                                        return fail( "missing closing `*/`", currentChunkStartIndex ); // Unclosed multi-line comment.
                                    }
                                    parserCurrentIndex++; // Advance past the '*' of '*/'.
                                }
                                continue;