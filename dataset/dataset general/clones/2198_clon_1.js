/*
   XRegExp Library - Version 1.5.0
   (c) 2007-2010 Steven Levithan
   MIT License - See http://xregexp.com for more details.

   This file provides an augmented, extensible, cross-browser implementation of regular expressions,
   including support for additional syntax, flags, and methods.
*/

var XRegExp;

if (XRegExp)
{
    // Important: Prevent re-initialization which could lead to unexpected behavior
    throw Error( "can't load XRegExp twice in the same frame" );
}

// Encapsulate the entire library within an anonymous function to protect local variables
// and prevent global pollution.
( function ( ) {

    // ---------------------------------------------------------------------------------
    //  Constructor Definition
    // ---------------------------------------------------------------------------------

    /*
       The primary constructor for XRegExp objects.
       It accepts a pattern string and optional flags, returning a new, extended `RegExp` instance.
       This differs from native regular expressions by supporting additional syntax and flags,
       and by providing amelioration for cross-browser syntax inconsistencies.
    */
    XRegExp = function ( pattern, flags ) {
        var output = [ ]
            , currScope = XRegExp.OUTSIDE_CLASS
            , pos = 0
            , context, tokenResult, match, chr, regex
        ; // End of variable declarations for the XRegExp constructor

        if ( XRegExp.isRegExp( pattern ) ) {
            // If the pattern is already a RegExp object, flags must not be provided.
            if ( flags !== undefined )
                throw TypeError( "can't supply flags when constructing one RegExp from another" );
            return clone( pattern );
        }
        // Critical: Guard against infinite recursion. Tokens can trigger XRegExp construction.
        if ( isInsideConstructor )
            throw Error( "can't call the XRegExp constructor within token definition functions" );

        flags = flags || ""; // Ensure flags is always a string, even if null/undefined

        // Context object for custom token handlers.
        context = {
            hasNamedCapture: false, // Indicates if named capture groups are used
            captureNames: [ ],      // Stores the names of capture groups
            hasFlag: function ( flag ) {
                return flags.indexOf( flag ) > -1;
            },
            setFlag: function ( flag ) {
                flags += flag; // Append a new flag
            }
        };

        // Iterate through the pattern string character by character.
        while ( pos < pattern.length ) {
            // Attempt to match custom tokens at the current position.
            tokenResult = runTokens( pattern, pos, currScope, context );

            if ( tokenResult ) {
                output.push( tokenResult.output );
                // Advance position by the length of the matched token, or at least 1.
                pos += ( tokenResult.match[0].length || 1 );
            } else {
                // No custom token matched. Check for native multicharacter metasequences.
                // Excludes character classes, which are handled differently.
                if ( match = real.exec.call( nativeTokens[currScope], pattern.slice( pos ) ) ) {
                    output.push( match[0] );
                    pos += match[0].length;
                } else {
                    chr = pattern.charAt( pos ); // Get the current character.

                    if ( chr === "[" )
                        currScope = XRegExp.INSIDE_CLASS; // Enter character class scope.
                    else if ( chr === "]" )
                        currScope = XRegExp.OUTSIDE_CLASS; // Exit character class scope.

                    // Add the character to the output and advance.
                    output.push( chr );
                    pos++;
                }
            }
        }

        // Construct the native RegExp object.
        regex = RegExp( output.join( "" ), real.replace.call( flags, flagClip, "" ) );
        // Attach XRegExp-specific properties.
        regex._xregexp = {
            source: pattern,
            captureNames: context.hasNamedCapture ? context.captureNames : null
        };
        return regex;
    };


    // ---------------------------------------------------------------------------------
    //  Public Properties of XRegExp
    // ---------------------------------------------------------------------------------

    XRegExp.version = "1.5.0"; // Current version of the XRegExp library.

    // Bitflags to represent token scopes (used internally).
    XRegExp.INSIDE_CLASS = 1;
    XRegExp.OUTSIDE_CLASS = 2;


    // ---------------------------------------------------------------------------------
    //  Private Variables and Constants
    // ---------------------------------------------------------------------------------

    // Regular expression for parsing replacement tokens like $1, ${name}.
    var replacementToken = /\$(?:(\d\d?|[$&`'])|{([$\w]+)})/g
        , flagClip = /[^gimy]+|([\s\S])(?=[\s\S]*\1)/g // Regex to remove non-native and duplicate flags.
        , quantifier = /^(?:[?*+]|{\d+(?:,\d*)?})\??/ // Regex to match common quantifiers.
        , isInsideConstructor = false // Flag to prevent recursive XRegExp construction within token handlers.
        , tokens = [ ] // Array to store custom token definitions.

        // Store references to native global methods to prevent issues if they are overridden.
        , real = {
            exec: RegExp.prototype.exec,
            test: RegExp.prototype.test,
            match: String.prototype.match,
            replace: String.prototype.replace,
            split: String.prototype.split
        }
        // Feature detection: Check `exec` handling of nonparticipating capturing groups.
        , compliantExecNpcg = real.exec.call( /()??/, "" )[1] === undefined
        // Feature detection: Check if `lastIndex` is incremented after zero-length matches.
        , compliantLastIndexIncrement = ( function ( ) {
            var x = /^/g;
            real.test.call( x, "" );
            return !x.lastIndex;
        } )( )
        // Feature detection: Check if `lastIndex` is reset after `String.prototype.replace`.
        , compliantLastIndexReset = ( function ( ) {
            var x = /x/g;
            real.replace.call( "x", x, "" );
            return !x.lastIndex;
        } )( )
        // Feature detection: Check for native 'sticky' flag support (ES6).
        , hasNativeY = RegExp.prototype.sticky !== undefined
        , nativeTokens = { }
    ; // End of private variable declarations

    /*
       `nativeTokens` regular expressions match native multicharacter metasequences only.
       This includes deprecated octals but excludes character classes, which are handled
       differently by the constructor.
    */
    nativeTokens[ XRegExp.INSIDE_CLASS ] = /^(?:\\(?:[0-3][0-7]{0,2}|[4-7][0-7]?|x[\dA-Fa-f]{2}|u[\dA-Fa-f]{4}|c[A-Za-z]|[\s\S]))/;
    nativeTokens[ XRegExp.OUTSIDE_CLASS ] = /^(?:\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9]\d*|x[\dA-Fa-f]{2}|u[\dA-Fa-f]{4}|c[A-Za-z]|[\s\S])|\(\?[:=!]|[?*+]\?|{\d+(?:,\d*)?}\??)/;


    // ---------------------------------------------------------------------------------
    //  Public Methods of XRegExp
    // ---------------------------------------------------------------------------------

    /*
       Allows extending XRegExp syntax and defining custom flags.
       This function is critical for XRegExp's extensibility and for creating plugins.
       It is intended for advanced users familiar with regular expression syntax.
       This feature can be disabled using `XRegExp.freezeTokens`.
    */
    XRegExp.addToken = function ( regex, handler, scope, trigger ) {
        tokens.push( {
            pattern: clone( regex, "g" + ( hasNativeY ? "y" : "" ) ), // Ensure global flag for iteration.
            handler: handler,
            scope: scope || XRegExp.OUTSIDE_CLASS,
            trigger: trigger || null
        } );
    };

    /*
       Caches compiled XRegExp objects.
       Accepts a pattern and flags. If the combination has been cached, the existing
       instance is returned; otherwise, a new XRegExp is created, cached, and then returned.
    */
    XRegExp.cache = function ( pattern, flags ) {
        var key = pattern + "/" + ( flags || "" ); // Create a unique cache key.
        return XRegExp.cache[ key ] || ( XRegExp.cache[ key ] = XRegExp( pattern, flags ) );
    };

    /*
       Creates a global copy of a `RegExp` instance.
       Returns a new `RegExp` object with the `/g` flag set and `lastIndex` reset to zero.
       This method is useful when you need to iterate over matches.
       Note: `XRegExp(regex)` should be used if you don't want to force the `global` property.
       Using `RegExp(regex)` directly will not preserve named capture properties.
    */
    XRegExp.copyAsGlobal = function ( regex ) {
        return clone( regex, "g" );
    };

    /*
       Escapes regex metacharacters in a string.
       The returned string can be safely used within a regular expression to match the
       provided literal string. Escaped characters include: `[ ] { } ( ) * + ? - . , \ ^ $ | #`
       and whitespace characters.
    */
    XRegExp.escape = function ( str ) {
        return str.replace( /[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&" );
    };

    /*
       Executes a regex search starting at a specific position within a string.
       This function ignores the `lastIndex` property of the provided regex.
       `pos` (default: 0) specifies the starting search position.
       `anchored` (optional Boolean) determines if matches must start *exactly* at `pos`.
    */
    XRegExp.execAt = function ( str, regex, pos, anchored ) {
        // Ensure the regex is global for proper `exec` iteration.
        regex = clone( regex, "g" + ( ( anchored && hasNativeY ) ? "y" : "" ) );
        regex.lastIndex = pos = pos || 0; // Set starting position.
        var match = regex.exec( str );

        if ( anchored )
            return ( match && match.index === pos ) ? match : null;
        else
            return match;
    };

    /*
       Prevents further modifications to XRegExp's token list.
       This effectively "freezes" the syntax and flag changes.
       It should be called after XRegExp and any desired plugins have been loaded.
    */
    XRegExp.freezeTokens = function ( ) {
        XRegExp.addToken = function ( ) {
            throw Error( "can't run addToken after freezeTokens" );
        };
    };

    /*
       Checks if a value is a `RegExp` object.
       This function correctly identifies regex literals and `RegExp` objects created by
       the XRegExp constructor, even across different JavaScript frames where `instanceof`
       and `constructor` checks might fail.
    */
    XRegExp.isRegExp = function ( o ) {
        return Object.prototype.toString.call( o ) === "[object RegExp]";
    };

    /*
       Iterates over all matches within a string.
       Executes `callback` once for each match found in `str` using `origRegex`.
       This provides a cleaner way to iterate compared to traditional `while (exec)` loops
       or `String.prototype.replace` subversions.
    */
    XRegExp.iterate = function ( str, origRegex, callback, context ) {
        var regex = clone( origRegex, "g" ) // Ensure global flag for iteration.
            , i = -1, match
        ;
        while ( match = regex.exec( str ) ) {
            callback.call( context, match, ++i, str, regex );
            // Workaround for browsers that don't increment `lastIndex` for zero-length matches.
            if ( regex.lastIndex === match.index )
                regex.lastIndex++;
        }
        // If the original regex was global, reset its `lastIndex`.
        if ( origRegex.global )
            origRegex.lastIndex = 0;
    };

    /*
       Executes a chain of regular expressions on a string.
       Applies each regex in the `chain` array sequentially, searching within the matches
       of the previous regex. The `chain` can include objects with `regex` and `backref`
       properties to specify named or numbered backreferences to pass forward.
    */
    XRegExp.matchChain = function ( str, chain ) {
        // Recursive helper function to process the chain.
        return ( function recurseChain ( values, level ) {
            var item = chain[ level ].regex ? chain[ level ] : { regex: chain[ level ] } // Normalize chain item.
                , regex = clone( item.regex, "g" ) // Ensure global flag for iteration.
                , matches = [ ], i
            ;
            for ( i = 0; i < values.length; i++ ) {
                XRegExp.iterate( values[ i ], regex, function ( match ) {
                    matches.push( item.backref ? ( match[ item.backref ] || "" ) : match[ 0 ] );
                } );
            }
            // Base case: end of chain or no matches. Recursive step: continue with next level.
            return ( ( level === chain.length - 1 ) || !matches.length ) ?
                matches : recurseChain( matches, level + 1 );
        } )( [ str ], 0 ); // Start the recursion with the initial string and level 0.
    };


    // ---------------------------------------------------------------------------------
    //  New Methods Added to RegExp.prototype
    // ---------------------------------------------------------------------------------

    /*
       Provides an `apply` method for `RegExp.prototype`.
       Accepts a context object (ignored) and an arguments array.
       Calls `exec` with the first value in the arguments array.
       Included for congruity with `Function.prototype.apply`.
    */
    RegExp.prototype.apply = function ( context, args ) {
        return this.exec( args[ 0 ] );
    };

    /*
       Provides a `call` method for `RegExp.prototype`.
       Accepts a context object (ignored) and a string.
       Calls `exec` with the provided string.
       Included for congruity with `Function.prototype.call`.
    */
    RegExp.prototype.call = function ( context, str ) {
        return this.exec( str );
    };


    // ---------------------------------------------------------------------------------
    //  Overridden Native Methods
    // ---------------------------------------------------------------------------------

    /*
       Overrides `RegExp.prototype.exec`.
       Adds named capture support (backreferences returned as `result.name`).
       Fixes two cross-browser issues mandated by ES3:
       1. Captured values for nonparticipating groups should be `undefined`, not empty strings.
       2. `lastIndex` should not be incremented after zero-length matches.
    */
    RegExp.prototype.exec = function ( str ) {
        // Coerce input to string if it's not null/undefined for consistent behavior.
        if ( str != null ) str += '';
        var match = real.exec.apply( this, arguments )
            , name, r2
        ;
        if ( match ) {
            // Fix for browsers whose `exec` methods incorrectly return `""` for nonparticipating groups.
            if ( !compliantExecNpcg && match.length > 1 && indexOf( match, "" ) > -1 ) {
                // Re-execute with a non-global regex to determine `undefined` groups.
                r2 = RegExp( this.source, real.replace.call( getNativeFlags( this ), "g", "" ) );
                // Use `str.slice(match.index)` to ensure lookaheads don't affect `r2`'s match.
                if (str)
                real.replace.call( str.slice( match.index ), r2, function ( ) {
                    for ( var i = 1; i < arguments.length - 2; i++ ) {
                        if ( arguments[ i ] === undefined )
                            match[ i ] = undefined; // Correct `undefined` values.
                    }
                } );
            }
            // Attach named capture properties if available.
            if ( this._xregexp && this._xregexp.captureNames ) {
                for ( var i = 1; i < match.length; i++ ) {
                    name = this._xregexp.captureNames[ i - 1 ];
                    if ( name )
                       match[ name ] = match[ i ]; // Assign named capture.
                }
            }
            // Fix for browsers that increment `lastIndex` after zero-length matches.
            if ( !compliantLastIndexIncrement && this.global && !match[ 0 ].length && ( this.lastIndex > match.index ) )
                this.lastIndex--; // Decrement `lastIndex` to correct position.
        }
        return match;
    };

    // Only override `RegExp.prototype.test` if `compliantLastIndexIncrement` is false,
    // as it's the only fix `test` needs.
    if ( !compliantLastIndexIncrement ) {
        /*
           Overrides `RegExp.prototype.test`.
           Fixes a browser bug where `lastIndex` is incorrectly incremented after zero-length matches.
        */
        RegExp.prototype.test = function ( str ) {
            // Use the native `exec` directly to avoid overhead, even though the overridden `exec`
            // would handle the `lastIndex` fix.
            var match = real.exec.call( this, str );
            // Apply the `lastIndex` fix for zero-length matches.
            if ( match && this.global && !match[ 0 ].length && ( this.lastIndex > match.index ) )
                this.lastIndex--;
            return !!match; // Return boolean result.
        };
    }

    /*
       Overrides `String.prototype.match`.
       Adds named capture support and fixes various browser bugs.
    */
    String.prototype.match = function ( regex ) {
        if ( !XRegExp.isRegExp( regex ) )
            regex = RegExp( regex ); // Convert to native `RegExp` if not already.
        if ( regex.global ) {
            var result = real.match.apply( this, arguments );
            regex.lastIndex = 0; // Fix for IE bug: `lastIndex` not reset after global match.
            return result;
        }
        return regex.exec( this ); // Use the altered `exec` for non-global matches.
    };

    /*
       Overrides `String.prototype.replace`.
       Adds support for `${n}` tokens for named and numbered backreferences in replacement text.
       Provides named backreferences to replacement functions as `arguments[0].name`.
       Fixes cross-browser differences in replacement text syntax and `lastIndex` property
       during replacement iterations.
       Note: This implementation does not support SpiderMonkey's proprietary third (`flags`) parameter.
    */
    String.prototype.replace = function ( search, replacement ) {
        var isRegex = XRegExp.isRegExp( search )
            , captureNames, result, str
        ;

        // Optimization: If it's a regex, replacement is a simple string without XRegExp tokens,
        // and `lastIndex` reset is compliant, delegate to native `replace`.
        if ( isRegex && typeof replacement.valueOf( ) === "string" && replacement.indexOf( "${" ) === -1 && compliantLastIndexReset )
            return real.replace.apply( this, arguments );

        if ( !isRegex )
            search = search + ""; // Type conversion for non-regex search values.
        else if ( search._xregexp )
            captureNames = search._xregexp.captureNames; // Get named capture groups if XRegExp.

        if ( typeof replacement === "function" ) {
            result = real.replace.call( this, search, function ( ) {
                if ( captureNames ) {
                    // Convert `arguments[0]` (match string primitive) to an object to store properties.
                    arguments[ 0 ] = new String( arguments[ 0 ] );
                    // Store named backreferences on `arguments[0]`.
                    for ( var i = 0; i < captureNames.length; i++ ) {
                        if ( captureNames[ i ] )
                            arguments[ 0 ][ captureNames[ i ] ] = arguments[ i + 1 ];
                    }
                }
                // Update `lastIndex` before calling the replacement function.
                if ( isRegex && search.global )
                    search.lastIndex = arguments[ arguments.length - 2 ] + arguments[ 0 ].length;
                return replacement.apply( null, arguments );
            } );
        } else {
            str = this + ""; // Type conversion for `this` to ensure consistent `args` structure.
            result = real.replace.call( str, search, function ( ) {
                var args = arguments; // Capture `arguments` for closure.
                return real.replace.call( replacement, replacementToken, function ( $0, $1, $2 ) {
                    // Handle numbered backreferences (without delimiters) or special variables.
                    if ( $1 ) {
                        switch ( $1 ) {
                            case "$": return "$"; // Literal dollar sign.
                            case "&": return args[ 0 ]; // Entire match.
                            case "`": return args[ args.length - 1 ].slice( 0, args[ args.length - 2 ] ); // Pre-match.
                            case "'": return args[ args.length - 1 ].slice( args[ args.length - 2 ] + args[ 0 ].length ); // Post-match.
                            // Handle numbered backreferences.
                            default:
                                // Differentiate "$10" as backreference 10 vs. backreference 1 followed by "0".
                                var literalNumbers = "";
                                $1 = +$1; // Convert to number, dropping leading zero.
                                if ( !$1 ) // If `$1` was "0" or "00".
                                    return $0;
                                // If $1 is larger than available groups, peel off trailing digits.
                                while ( $1 > args.length - 3 ) {
                                    literalNumbers = String.prototype.slice.call( $1, -1 ) + literalNumbers;
                                    $1 = Math.floor( $1 / 10 ); // Drop the last digit.
                                }
                                return ( $1 ? args[ $1 ] || "" : "$" ) + literalNumbers;
                        }
                    // Handle named backreferences or delimited numbered backreferences.
                    } else {
                        // Handle `${n}` syntax:
                        // - Numbered capture `n` (can be > 2 digits, allows `0`).
                        // - Named capture `n` if it exists and doesn't conflict with a numbered capture.
                        var n = +$2; // Convert to number, dropping leading zeros.
                        if ( n <= args.length - 3 )
                            return args[ n ]; // It's a numbered backreference.
                        n = captureNames ? indexOf( captureNames, $2 ) : -1;
                        return n > -1 ? args[ n + 1 ] : $0; // It's a named backreference, or literal.
                    }
                } );
            } );
        }

        // Reset `lastIndex` for global regexes after replacement to fix IE bug.
        if ( isRegex && search.global )
            search.lastIndex = 0;

        return result;
    };

    /*
       Overrides `String.prototype.split`.
       Provides a consistent, cross-browser, ES3 compliant `split` method.
    */
    String.prototype.split = function ( s /* separator */, limit ) {
        // If the separator is not a regex, use the native `split`.
        if ( !XRegExp.isRegExp( s ) )
            return real.split.apply( this, arguments );

        var str = this + "" // Type conversion of `this` to string.
            , output = [ ]
            , lastLastIndex = 0
            , match, lastLength
        ;

        // Process `limit` argument according to spec:
        // - `undefined`: no limit.
        // - `NaN` or zero: return empty array.
        // - Positive number: use `Math.floor(limit)`.
        // - Negative number: no limit.
        // - Other: type-convert, then apply above rules.
        if ( limit === undefined || +limit < 0 ) {
            limit = Infinity;
        } else {
            limit = Math.floor( +limit );
            if ( !limit )
                return [ ];
        }

        // Ensure the separator regex is global for proper iteration.
        // This also avoids needing to save/restore `s.lastIndex`.
        s = XRegExp.copyAsGlobal( s );

        while ( match = s.exec( str ) ) { // Use the altered `exec` for fixes.
            if ( s.lastIndex > lastLastIndex ) {
                output.push( str.slice( lastLastIndex, match.index ) );

                // Add captured groups to the output array.
                if ( match.length > 1 && match.index < str.length )
                    Array.prototype.push.apply( output, match.slice( 1 ) );

                lastLength = match[ 0 ].length;
                lastLastIndex = s.lastIndex;

                if ( output.length >= limit )
                    break; // Stop if limit reached.
            }

            // Workaround for browsers that don't increment `lastIndex` for zero-length matches.
            if ( s.lastIndex === match.index )
                s.lastIndex++;
        }

        // Handle trailing empty string if the last match was at the end of the string.
        if ( lastLastIndex === str.length ) {
            if ( !real.test.call( s, "" ) || lastLength )
                output.push( "" );
        } else {
            output.push( str.slice( lastLastIndex ) ); // Add the remaining part of the string.
        }

        // Truncate the output array if it exceeds the limit.
        return output.length > limit ? output.slice( 0, limit ) : output;
    };


    // ---------------------------------------------------------------------------------
    //  Private Helper Functions
    // ---------------------------------------------------------------------------------

    /*
       A supporting function used by `XRegExp`, `XRegExp.copyAsGlobal`, etc.
       Returns a copy of a `RegExp` instance with `lastIndex` reset to zero.
       Preserves properties required for named capture and allows adding new flags.
    */
    function clone ( regex, additionalFlags ) {
        if ( !XRegExp.isRegExp( regex ) )
            throw TypeError( "type RegExp expected" );
        var x = regex._xregexp; // Get XRegExp-specific data.
        // Reconstruct the regex with original source and combined flags.
        regex = XRegExp( regex.source, getNativeFlags( regex ) + ( additionalFlags || "" ) );
        if ( x ) {
            // Restore XRegExp-specific properties to the cloned regex.
            regex._xregexp = {
                source: x.source,
                captureNames: x.captureNames ? x.captureNames.slice( 0 ) : null
            };
        }
        return regex;
    };


    // Helper: Returns the native flags of a RegExp object.
    function getNativeFlags ( regex ) {
        return ( regex.global ? "g" : "" ) +
               ( regex.ignoreCase ? "i" : "" ) +
               ( regex.multiline ? "m" : "" ) +
               ( regex.sticky ? "y" : "" ); // Include sticky flag if supported.
    }

    // Helper: Runs custom tokens against the pattern.
    function runTokens ( pattern, pos, currScope, context ) {
        var i = 0, l = tokens.length,
            result, match, token;

        isInsideConstructor = true; // Set flag to prevent recursion.

        for ( ; i < l; i++ ) {
            token = tokens[ i ];
            // Check if token scope matches current scope and if trigger function (if any) allows it.
            if ( ( currScope & token.scope ) && ( !token.trigger || token.trigger( pattern, pos, currScope, context ) ) ) {
                token.pattern.lastIndex = pos; // Set `lastIndex` for the token pattern.
                match = token.pattern.exec( pattern );
                if ( match && match.index === pos ) {
                    // If a match is found at the current position, execute the handler.
                    result = token.handler( match, currScope, context );
                    // If the handler returns a string, it's the output.
                    if ( result !== undefined ) {
                        isInsideConstructor = false; // Reset recursion flag.
                        return {
                            output: result,
                            match: match
                        };
                    }
                }
            }
        }

        isInsideConstructor = false; // Reset recursion flag.
        return null; // No token matched.
    }

    // Helper: Provides a cross-browser `Array.prototype.indexOf`.
    function indexOf ( array, item ) {
        if ( Array.prototype.indexOf ) {
            return array.indexOf( item );
        }
        for ( var i = 0; i < array.length; i++ ) {
            if ( array[ i ] === item ) {
                return i;
            }
        }
        return -1;
    }

} )( ); // End of anonymous function wrapper