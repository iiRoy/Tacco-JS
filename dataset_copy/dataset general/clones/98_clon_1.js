/*
 *  jquery.i18n.properties - Internationalization for jQuery
 *
 *  Distributed under the GPL and MIT Licenses.
 *  See http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt
 *  and http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt for details.
 *
 *  @version      1.1.x
 *  @author       Nuno Fernandes, Matthew Lohbihler
 *  @website      www.codingwithcoffee.com
 *  @inspired_by  Keith Wood's Localisation assistance for jQuery (http://keith-wood.name/localisation.html)
 *                (kbwood{at}iinet.com.au) - June 2007
 *
 */

( function ( $ ) {

    // Initialize the i18n object within jQuery's namespace.
    $.i18n = {};

    /**
     * Map to store key-value pairs of bundle messages when 'map' mode is active.
     */
    $.i18n.map = {};

    /**
     * Core function to load and parse message bundle files (.properties).
     * This makes bundle keys accessible as JavaScript variables or within a map.
     *
     * Filename conventions:
     *   - <name>.js
     *   - <name>_<language>.js
     *   - <name>_<language>_<country>.js
     *
     * Language codes: ISO-639 (two-letter, lower-case), e.g., http://www.loc.gov/standards/iso639-2/englangn.html
     * Country codes:  ISO-3166 (two-letter, upper-case), e.g., http://www.iso.ch/iso/en/prods-services/iso3166ma/02iso-3166-code-lists/list-en1.html
     *
     * Example usage:
     * $.i18n.properties({
     *     name:      'Messages',
     *     language:  'en_US',
     *     path:      'bundles'
     * });
     *
     * @param  {object} settings Configuration object for loading bundles.
     * @param  {string|string[]} settings.name      (Optional) Name(s) of the properties file to load. Defaults to "Messages".
     * @param  {string}          settings.language  (Optional) Language/country code (e.g., 'en', 'en_US'). Browser's language is used if not specified.
     * @param  {string}          settings.path      (Optional) Directory path where bundle files are located.
     * @param  {string}          settings.mode      (Optional) Determines how bundle keys are made available ('vars' for variables/functions, 'map' for a map). Defaults to 'vars'.
     * @param  {boolean}         settings.cache     (Optional) Whether the browser should cache bundles. Defaults to `false` (forcibly reloaded).
     * @param  {string}          settings.encoding  (Optional) Character encoding for bundles. Property files are typically ISO-8859-1. Defaults to UTF-8 for compatibility.
     * @param  {function}        settings.callback  (Optional) Callback function to execute after all bundles are loaded and parsed.
     */
    $.i18n.properties = function ( settings ) {

        // Define default settings and merge with provided ones.
        var defaults = {
            name:       'Messages',
            language:   '',
            path:       '',
            mode:       'vars',
            cache:      false,
            encoding:   'UTF-8',
            callback:   null
        };

        settings = $.extend( defaults, settings );

        // If no language is explicitly set, try to determine it from the browser.
        if ( settings.language === null || settings.language == '' ) {
            settings.language = $.i18n.browserLang();
        }

        // Ensure language is an empty string if it couldn't be determined.
        if ( settings.language === null ) {
            settings.language = '';
        }

        // Get the list of files to load (handles single string or array).
        var files = getFiles( settings.name );
        var i;

        // Iterate through each base file name.
        for ( i = 0; i < files.length; i++ ) {

            // 1. Load the base properties file (e.g., Messages.properties).
            loadAndParseFile( settings.path + files[i] + '.properties', settings );

            // 2. Load language-specific properties (e.g., Messages_pt.properties) if language code is available.
            if ( settings.language.length >= 2 ) {
                loadAndParseFile( settings.path + files[i] + '_' + settings.language.substring( 0, 2 ) + '.properties', settings );
            }

            // 3. Load country-specific properties (e.g., Messages_pt_PT.properties) if country code is available.
            if ( settings.language.length >= 5 ) {
                loadAndParseFile( settings.path + files[i] + '_' + settings.language.substring( 0, 5 ) + '.properties', settings );
            }
        }

        // Execute the callback function if one was provided.
        if ( settings.callback ) {
            settings.callback();
        }

    };

    /**
     * Retrieves a bundle value by its key. This function is primarily used when
     * `mode: 'map'` is configured, allowing direct access to messages.
     *
     * Example: jQuery.i18n.prop('com.company.bundles.menu_add')
     *
     * Supports placeholder replacement:
     *   - `test.t1=asdf ''{0}''`
     *   - `test.t2=asdf '{0}' '{1}'{1}'zxcv`
     *   - `test.t3=This is \"a quote" 'a''{0}''s'd{fgh{ij'`
     *   - `test.t4="'''{'0}''" {0}{a}`
     *   - `test.t5="'''{0}'''" {1}`
     *   - `test.t6=a {1} b {0} c`
     *   - `test.t7=a 'quoted \\ s\ttringy' \t\t x`
     *
     * Expected results:
     *   - `test.t1, p1`         ==> `asdf 'p1'`
     *   - `test.t2, p1`         ==> `asdf {0} {1}{1}zxcv`
     *   - `test.t3, p1`         ==> `This is "a quote" a'{0}'sd{fgh{ij`
     *   - `test.t4, p1`         ==> `'{0}'" p1{a}`
     *   - `test.t5, p1`         ==> `'{0}'" {1}`
     *   - `test.t6, p1`         ==> `a {1} b p1 c`
     *   - `test.t6, p1, p2`     ==> `a p2 b p1 c`
     *   - `test.t6, p1, p2, p3` ==> `a p2 b p1 c`
     *   - `test.t7`             ==> `a quoted \ s	tringy 		 x`
     *
     * @param  {string} key The key of the message to retrieve.
     * @param  {*}      [args] Optional placeholder values. Can be passed as individual arguments or as an array.
     * @returns {string} The formatted message string, or `[key]` if not found.
     */
    $.i18n.prop = function ( key /* Add parameters as function arguments as necessary */ ) {

        var value = $.i18n.map[ key ];

        // Return key if value is not found.
        if ( value == null ) {
            return '[' + key + ']';
        }

        var phvList; // Placeholder values list.

        // Check if the second argument is an array, assume it's the list of placeholder values.
        if ( arguments.length == 2 && $.isArray( arguments[1] ) ) {
            phvList = arguments[1];
        }


        var i;

        // Process the value if it's a string (first time access or cached non-array).
        if ( typeof ( value ) == 'string' ) {

            // Handle escape characters within the string.
            // This is done separately from tokenizing because escapes are active inside quotes.
            i = 0;
            while ( ( i = value.indexOf( '\\', i ) ) != -1 ) {
                if ( value.charAt( i + 1 ) == 't' ) {
                    value = value.substring( 0, i ) + '\t' + value.substring( ( i++ ) + 2 ); // tab
                } else if ( value.charAt( i + 1 ) == 'r' ) {
                    value = value.substring( 0, i ) + '\r' + value.substring( ( i++ ) + 2 ); // return
                } else if ( value.charAt( i + 1 ) == 'n' ) {
                    value = value.substring( 0, i ) + '\n' + value.substring( ( i++ ) + 2 ); // line feed
                } else if ( value.charAt( i + 1 ) == 'f' ) {
                    value = value.substring( 0, i ) + '\f' + value.substring( ( i++ ) + 2 ); // form feed
                } else if ( value.charAt( i + 1 ) == '\\' ) {
                    value = value.substring( 0, i ) + '\\' + value.substring( ( i++ ) + 2 ); // backslash
                } else {
                    value = value.substring( 0, i ) + value.substring( i + 1 ); // Quietly drop the character
                }
            }

            // Convert the string to a list of tokens (strings and placeholder indices).
            var arr = [],
                j,
                index;
            i = 0;
            while ( i < value.length ) {
                if ( value.charAt( i ) == '\'' ) {
                    // Handle quoted strings.
                    if ( i == value.length - 1 ) {
                        value = value.substring( 0, i ); // Silently drop trailing quote.
                    } else if ( value.charAt( i + 1 ) == '\'' ) {
                        value = value.substring( 0, i ) + value.substring( ++i ); // Escaped quote (e.g., 'foo''bar' -> foo'bar).
                    } else {
                        // Regular quoted string.
                        j = i + 2;
                        while ( ( j = value.indexOf( '\'', j ) ) != -1 ) {
                            if ( j == value.length - 1 || value.charAt( j + 1 ) != '\'' ) {
                                // Found start and end quotes. Remove them.
                                value = value.substring( 0, i ) + value.substring( i + 1, j ) + value.substring( j + 1 );
                                i = j - 1;
                                break;
                            } else {
                                // Found a double quote inside a quoted string, reduce to single quote.
                                value = value.substring( 0, j ) + value.substring( ++j );
                            }
                        }

                        if ( j == -1 ) {
                            // No end quote found. Drop the start quote.
                            value = value.substring( 0, i ) + value.substring( i + 1 );
                        }
                    }
                } else if ( value.charAt( i ) == '{' ) {
                    // Beginning of an unquoted placeholder (e.g., {0}).
                    j = value.indexOf( '}', i + 1 );
                    if ( j == -1 ) {
                        i++; // No closing brace. Process the rest of the line as literal.
                    } else {
                        // Parse the integer index within the braces.
                        index = parseInt( value.substring( i + 1, j ) );
                        if ( !isNaN( index ) && index >= 0 ) {
                            // If there's content before the placeholder, add it as a string token.
                            var s = value.substring( 0, i );
                            if ( s != "" ) {
                                arr.push( s );
                            }
                            // Add the placeholder index as a number token.
                            arr.push( index );
                            // Continue processing from after the placeholder.
                            i = 0;
                            value = value.substring( j + 1 );
                        } else {
                            i = j + 1; // Invalid parameter format. Leave as is.
                        }
                    }
                } else {
                    i++; // Move to the next character.
                }
            }

            // Add any remaining part of the string as the last token.
            if ( value != "" ) {
                arr.push( value );
            }
            value = arr; // The processed value is now an array of tokens.

            // Cache the tokenized array for future use.
            $.i18n.map[ key ] = arr;
        }

        // If the tokenized value is empty, return an empty string.
        if ( value.length == 0 ) {
            return "";
        }
        // If it's a single string token, return it directly.
        if ( value.length == 1 && typeof ( value[0] ) == "string" ) {
            return value[0];
        }

        // Reconstruct the string with placeholder substitutions.
        var s = "";
        for ( i = 0; i < value.length; i++ ) {
            if ( typeof ( value[i] ) == "string" ) {
                s += value[i];
            }
            // If it's a number (placeholder index).
            else if ( phvList && value[i] < phvList.length ) {
                s += phvList[ value[i] ];
            } else if ( !phvList && value[i] + 1 < arguments.length ) {
                s += arguments[ value[i] + 1 ];
            } else {
                s += "{" + value[i] + "}"; // Placeholder not found, keep as is.
            }
        }

        return s; // Return the final formatted string.
    };

    /**
     * Detects and normalizes the language reported by the browser.
     * @returns {string} Normalized language code (e.g., 'en_US').
     */
    $.i18n.browserLang = function () {
        // Use navigator.language for Mozilla, navigator.userLanguage for IE.
        return normaliseLanguageCode( navigator.language /* Mozilla */ || navigator.userLanguage /* IE */ );
    };


    /**
     * Helper function to load and parse a single .properties file via AJAX.
     * @param {string} filename The URL of the properties file.
     * @param {object} settings The settings object containing cache, encoding, and mode.
     */
    function loadAndParseFile( filename, settings ) {
        $.ajax( {
            url:        filename,
            async:      false, // Synchronous request to ensure bundles are loaded before proceeding.
            cache:      settings.cache,
            contentType:'text/plain;charset=' + settings.encoding,
            dataType:   'text',
            success:    function ( data, status ) {
                            parseData( data, settings.mode );
                        }
        } );
    }

    /**
     * Parses the content of a .properties file.
     * @param {string} data The raw content of the properties file.
     * @param {string} mode The processing mode ('vars', 'map', or 'both').
     */
    function parseData( data, mode ) {
        var parsed = '';
        var parameters = data.split( /\n/ ); // Split file content by newlines.
        var regPlaceHolder = /(\{\d+\})/g; // Regex for placeholder like {0}.
        var regRepPlaceHolder = /\{(\d+)\}/g; // Regex for replacing placeholder like {0} with v0.
        var unicodeRE = /(\\u.{4})/ig; // Regex for unicode escape sequences like \u00e3.

        for ( var i = 0; i < parameters.length; i++ ) {
            parameters[i] = parameters[i].replace( /^\s\s*/, '' ).replace( /\s\s*$/, '' ); // Trim whitespace.

            // Skip empty lines and comment lines (starting with '#').
            if ( parameters[i].length > 0 && parameters[i].match( "^#" ) != "#" ) {
                var pair = parameters[i].split( '=' ); // Split key-value pair.

                if ( pair.length > 0 ) {
                    /** Process key and value */
                    var name = unescape( pair[0] ).replace( /^\s\s*/, '' ).replace( /\s\s*$/, '' ); // Trim and unescape key.
                    var value = pair.length == 1 ? "" : pair[1];

                    // Handle multi-line values (ending with a backslash).
                    while ( value.match( /\\$/ ) == "\\" ) {
                        value = value.substring( 0, value.length - 1 ); // Remove trailing backslash.
                        value += parameters[++i].replace( /\s\s*$/, '' ); // Append next line, right-trimmed.
                    }

                    // Re-assemble values that might have embedded '=' characters.
                    for ( var s = 2; s < pair.length; s++ ) {
                        value += '=' + pair[s];
                    }
                    value = value.replace( /^\s\s*/, '' ).replace( /\s\s*$/, '' ); // Final trim of the value.

                    /** Mode: bundle keys stored in a map ($.i18n.map) */
                    if ( mode == 'map' || mode == 'both' ) {
                        // Process unicode escape sequences in the value.
                        var unicodeMatches = value.match( unicodeRE );
                        if ( unicodeMatches ) {
                            for ( var u = 0; u < unicodeMatches.length; u++ ) {
                                value = value.replace( unicodeMatches[u], unescapeUnicode( unicodeMatches[u] ) );
                            }
                        }
                        // Add the key-value pair to the map.
                        $.i18n.map[ name ] = value;
                    }

                    /** Mode: bundle keys exposed as JavaScript variables/functions */
                    if ( mode == 'vars' || mode == 'both' ) {
                        value = value.replace( /"/g, '\\"' ); // Escape double quotes for JS string literal.

                        // Ensure the namespace exists for keys with dots (e.g., 'some.key').
                        checkKeyNamespace( name );

                        // If the value contains variable substitutions (e.g., {0}, {1}).
                        if ( regPlaceHolder.test( value ) ) {
                            var parts = value.split( regPlaceHolder );
                            var first = true;
                            var fnArgs = '';
                            var usedArgs = []; // Keep track of args to avoid duplicates in function signature.

                            // Construct function arguments (e.g., 'v0,v1').
                            for ( var p = 0; p < parts.length; p++ ) {
                                if ( regPlaceHolder.test( parts[p] ) && ( usedArgs.length == 0 || usedArgs.indexOf( parts[p] ) == -1 ) ) {
                                    if ( !first ) {
                                        fnArgs += ',';
                                    }
                                    fnArgs += parts[p].replace( regRepPlaceHolder, 'v$1' );
                                    usedArgs.push( parts[p] );
                                    first = false;
                                }
                            }
                            // Generate the function definition.
                            parsed += name + '=function(' + fnArgs + '){';
                            // Construct the function body expression.
                            var fnExpr = '"' + value.replace( regRepPlaceHolder, '"+v$1+"' ) + '"';
                            parsed += 'return ' + fnExpr + ';' + '};';

                        } else {
                            // Simple value without substitutions.
                            parsed += name + '="' + value + '";';
                        }
                    } // END: Mode: bundle keys as vars/functions
                } // END: if(pair.length > 0)
            } // END: skip comments
        }
        // Execute the parsed JavaScript to define variables/functions.
        eval( parsed );
    }

    /**
     * Ensures that a JavaScript object namespace exists for a given key.
     * For example, if key is 'month.short.1', it ensures `month` and `month.short` objects exist.
     * TODO: Keys starting with numbers (e.g., '1.month') might fail quietly.
     * @param {string} key The full key (e.g., 'com.company.message').
     */
    function checkKeyNamespace( key ) {
        var regDot = /\./;
        if ( regDot.test( key ) ) {
            var fullname = '';
            var names = key.split( /\./ ); // Split by dots to get namespace parts.
            for ( var i = 0; i < names.length; i++ ) {
                if ( i > 0 ) {
                    fullname += '.';
                }
                fullname += names[i];
                // If the current part of the namespace doesn't exist, create an empty object for it.
                if ( eval( 'typeof ' + fullname + ' == "undefined"' ) ) {
                    eval( fullname + '={};' );
                }
            }
        }
    }

    /**
     * Ensures the input `names` is an array. If it's a string, it's wrapped in an array.
     * @param {string|string[]} names The name(s) of the file.
     * @returns {string[]} An array of file names.
     */
    function getFiles( names ) {
        return ( names && names.constructor == Array ) ? names : [ names ];
    }

    /**
     * Normalizes a language code to the format `aa_AA` (e.g., 'en-us' -> 'en_US').
     * @param {string} lang The language code to normalize.
     * @returns {string} The normalized language code.
     */
    function normaliseLanguageCode( lang ) {
        lang = lang.toLowerCase(); // Convert to lowercase.
        if ( lang.length > 3 ) {
            // Capitalize the country part if present (e.g., 'en-us' -> 'en_US').
            lang = lang.substring( 0, 3 ) + lang.substring( 3 ).toUpperCase();
        }
        return lang;
    }

    /**
     * Unescapes Unicode escape sequences (e.g., '\u00e3' to 'ã').
     * @param {string} str The string containing Unicode escapes.
     * @returns {string} The string with Unicode characters unescaped.
     */
    function unescapeUnicode( str ) {
        var codes = [];
        var code = parseInt( str.substr( 2 ), 16 ); // Parse the hex code.
        if ( code >= 0 && code < Math.pow( 2, 16 ) ) {
            codes.push( code );
        }
        var unescaped = '';
        for ( var i = 0; i < codes.length; ++i ) {
            unescaped += String.fromCharCode( codes[i] ); // Convert code to character.
        }
        return unescaped;
    }

    /*
     * Cross-Browser Split 1.0.1
     * (c) Steven Levithan <stevenlevithan.com>; MIT License
     * An ECMA-compliant, uniform cross-browser split method
     */
    var cbSplit;
    // Prevent running the initialization twice, which would break `cbSplit._nativeSplit`'s reference.
    if ( !cbSplit ) {
        cbSplit = function ( str, separator, limit ) {
            // If `separator` is not a regex, use the native `split` method.
            if ( Object.prototype.toString.call( separator ) !== "[object RegExp]" ) {
                if ( typeof cbSplit._nativeSplit == "undefined" ) {
                    return str.split( separator, limit );
                } else {
                    return cbSplit._nativeSplit.call( str, separator, limit );
                }
            }

            var output = [],
                lastLastIndex = 0,
                // Combine flags from the original separator and add 'g' for global.
                flags = ( separator.ignoreCase ? "i" : "" ) +
                        ( separator.multiline  ? "m" : "" ) +
                        ( separator.sticky     ? "y" : "" ),
                separator = RegExp( separator.source, flags + "g" ), // Create a global copy to handle `lastIndex`.
                separator2, match, lastIndex, lastLength;

            str = str + ""; // Type conversion to string.

            // Workaround for browsers that don't consistently return `undefined` for nonparticipating capturing groups (NPCG).
            if ( !cbSplit._compliantExecNpcg ) {
                separator2 = RegExp( "^" + separator.source + "$(?!\\s)", flags ); // Don't need /g or /y, but they don't hurt.
            }

            /*
             * Behavior for `limit`:
             * - `undefined`: no limit.
             * - `NaN` or zero: return an empty array.
             * - a positive number: use `Math.floor(limit)`.
             * - a negative number: no limit.
             * - other: type-convert, then use the above rules.
             */
            if ( limit === undefined || +limit < 0 ) {
                limit = Infinity;
            } else {
                limit = Math.floor( +limit );
                if ( !limit ) {
                    return [];
                }
            }

            // Loop through matches to split the string.
            while ( match = separator.exec( str ) ) {
                lastIndex = match.index + match[0].length; // `separator.lastIndex` is not reliable cross-browser.

                if ( lastIndex > lastLastIndex ) {
                    output.push( str.slice( lastLastIndex, match.index ) );

                    // Fix for NPCG in `exec` methods.
                    if ( !cbSplit._compliantExecNpcg && match.length > 1 ) {
                        match[0].replace( separator2, function () {
                            for ( var i = 1; i < arguments.length - 2; i++ ) {
                                if ( arguments[i] === undefined ) {
                                    match[i] = undefined;
                                }
                            }
                        } );
                    }

                    // Add capturing groups to the output array.
                    if ( match.length > 1 && match.index < str.length ) {
                        Array.prototype.push.apply( output, match.slice( 1 ) );
                    }

                    lastLength = match[0].length;
                    lastLastIndex = lastIndex;

                    // Check if limit has been reached.
                    if ( output.length >= limit ) {
                        break;
                    }
                }

                // Avoid infinite loop for zero-width matches.
                if ( separator.lastIndex === match.index ) {
                    separator.lastIndex++;
                }
            }

            // Handle the remainder of the string.
            if ( lastLastIndex === str.length ) {
                if ( lastLength || !separator.test( "" ) ) {
                    output.push( "" );
                }
            } else {
                output.push( str.slice( lastLastIndex ) );
            }

            // Trim output array if it exceeds the limit.
            return output.length > limit ? output.slice( 0, limit ) : output;
        };

        // Determine if `exec` method handles nonparticipating capturing groups correctly.
        cbSplit._compliantExecNpcg = /()??/.exec( "" )[1] === undefined;
        // Store a reference to the native `String.prototype.split`.
        cbSplit._nativeSplit = String.prototype.split;

    } // end `if (!cbSplit)`

    // Override the native `String.prototype.split` with the cross-browser compliant version.
    String.prototype.split = function ( separator, limit ) {
        return cbSplit( this, separator, limit );
    };

} )( jQuery );