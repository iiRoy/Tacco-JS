/*
 * This is a Type I clone generated from the original JavaScript code.
 * All logical and structural elements, including identifiers, operators,
 * and expressions, remain absolutely identical to the original.
 * Only whitespace (indentation, spacing, blank lines) and comments
 * have been altered extensively to create a visually distinct version.
 */


( function ( $ ) {

    // Declare a local cache object. This will store processed string results
    // to prevent redundant computation for frequently used input strings.
    var cache = {};


    // Define a new function 'i' as a property of the jQuery object ($).
    // This function takes a string 'str' as input and processes it.
    $.i = function ( str ) {

        // First, check if the result for the given input 'str' is already present in our cache.
        // If a cached result exists, we can immediately return it, saving processing time.
        if ( cache[ str ] ) return cache[ str ];


        // Initialize 'mode' to 0. This variable helps track the parsing context:
        //  - 0 means we are currently outside of any interpolation block.
        //  - Any value greater than 0 means we are inside an interpolation block,
        //    and its value indicates the nesting level of '{' characters.
        var mode = 0;

        // Initialize 'out' string. This will accumulate the final processed string.
        // It starts with a single quote, preparing for the JavaScript string literal syntax.
        var out = "'";


        // Begin iterating through each character of the input string 'str'.
        // The loop continues from the first character (index 0) up to, but not including,
        // the last character (str.length).
        for ( var i = 0 ; i < str.length ; i++ ) {

            // Get the character at the current index 'i'.
            var chr = str.charAt( i );


            // Now, apply logic based on the current parsing 'mode'.
            if ( mode == 0 ) {

                // If 'mode' is 0, we are currently parsing outside an interpolation block.
                // We need to handle special characters that might start or need escaping.
                switch ( chr ) {

                    case '{':
                        // An opening brace signifies the start of an interpolation block.
                        // We switch 'mode' to 1 (entering the first level).
                        // The output string transitions from a literal to an expression part.
                        mode = 1;
                        out += "'+(";
                        break; // Exit the switch statement.

                    case "'":
                        // A single quote character needs to be escaped to be included
                        // literally within the JavaScript string literal being built.
                        out += "\\'";
                        break; // Exit the switch statement.

                    default:
                        // For any other character, it is simply appended directly
                        // to the output string, as it's part of the literal content.
                        out += chr;
                } // End of switch (chr) for mode 0.

            } else {

                // If 'mode' is not 0 (i.e., mode > 0), we are currently inside
                // an interpolation block, processing an expression.
                switch ( chr ) {

                    case '{':
                        // Another opening brace means a nested interpolation block.
                        // Increment the 'mode' to reflect the deeper nesting level.
                        // The brace itself is part of the expression, so append it.
                        mode += 1;
                        out += chr;
                        break; // Exit the switch statement.

                    case '}':
                        // A closing brace indicates the end of a level in the interpolation block.
                        // Decrement the 'mode' to move up one nesting level.
                        mode -= 1;

                        // If 'mode' is now 0, it means we have closed the outermost
                        // interpolation block. We transition back from an expression
                        // to a string literal part.
                        if ( mode == 0 ) out += ")+'";
                        // Otherwise, if 'mode' is still greater than 0, it's an
                        // inner closing brace, and it's part of the expression.
                        else out += chr;
                        break; // Exit the switch statement.

                    default:
                        // Any other character encountered inside an interpolation block
                        // is considered part of the expression and is appended as is.
                        out += chr;
                } // End of switch (chr) for mode > 0.

            } // End of if-else for mode check.

        } // End of for loop iterating through string characters.


        // After processing all characters, append the final single quote
        // to complete the JavaScript string literal being constructed.
        out += "'";

        // Store the fully processed 'out' string in the cache, associating it
        // with the original input 'str'. This makes it available for future lookups.
        // Then, return this newly cached (and just computed) string.
        return cache[ str ] = out;

    }; // End of the $.i function definition.


// The Immediately Invoked Function Expression (IIFE) is executed here.
// It passes the global 'jQuery' object as the '$' argument to the function.
} )( jQuery );