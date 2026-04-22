/* This is a Type I clone of a JavaScript file.
 * The original code was likely transpiled from CoffeeScript.
 * All variable names, function names, operators, and expressions are identical.
 * Only whitespace (indentation, line breaks, spacing) and comments have been altered.
 */

// Start of the Immediately Invoked Function Expression (IIFE)
( function ( ) {

    // Declare an array 'a' to store input lines.
    var a = [ ] ;

    // Set up standard input stream.
    var stdin = process . openStdin ( ) ;

    // Ensure input is read as UTF-8.
    stdin . setEncoding ( 'utf8' ) ;


    /**
     * Recursive function to process mathematical expressions.
     * It handles parentheses, multiplication/division, and addition/subtraction.
     * 'Z' is used as a placeholder for '-' to avoid conflicts with subtraction operator.
     * @param {string} s The expression string to process.
     * @returns {string} The result of the evaluated expression as a string.
     */
    var proc = function ( s ) {

        var bidx , count , eidx , m ; // Declare local variables for processing.

        // --- Handle parentheses first (highest precedence) ---
        bidx = s . indexOf ( '(' ) ; // Find the first opening parenthesis.

        while ( bidx !== -1 ) { // Loop as long as parentheses are found.

            count = 1 ; // Initialize count for nested parentheses.
            eidx = bidx + 1 ; // Start scanning from the character after the opening parenthesis.

            while ( count > 0 ) { // Find the matching closing parenthesis.
                if ( s [ eidx ] === '(' ) {
                    count ++ ; // Increment count for nested opening parenthesis.
                }

                if ( s [ eidx ] === ')' ) {
                    count -- ; // Decrement count for closing parenthesis.
                }
                eidx ++ ; // Move to the next character.
            }

            // Recursively process the content within the parentheses
            // and substitute the result back into the string.
            s = s . substring ( 0 , bidx )
                + proc ( s . substring ( bidx + 1 , eidx - 1 ) )
                + s . substring ( eidx ) ;

            bidx = s . indexOf ( '(' ) ; // Find the next opening parenthesis for the next iteration.
        }


        // --- Handle multiplication and division (next precedence) ---
        // Regex: (.*?) - any characters non-greedily
        // (-?\d+) - an optional minus sign followed by one or more digits (operand 1)
        // ([*/]) - either '*' or '/' (operator)
        // (-?\d+) - an optional minus sign followed by one or more digits (operand 2)
        // (.*) - any remaining characters
        while ( ( m = /^(.*?)(-?\d+)([*/])(-?\d+)(.*)$/ . exec ( s ) ) != null ) {

            // Perform the operation based on the operator found.
            if ( m [ 3 ] === '*' ) {
                s = m [ 1 ] + ( parseInt ( m [ 2 ] ) * parseInt ( m [ 4 ] ) ) + m [ 5 ] ;
            } else {
                // Division uses bitwise OR 0 to ensure integer division, matching CoffeeScript behavior.
                s = m [ 1 ] + ( parseInt ( m [ 2 ] ) / parseInt ( m [ 4 ] ) ^ 0 ) + m [ 5 ] ;
            }
        }


        // --- Handle addition and subtraction (lowest precedence) ---
        // Note: 'Z' is used for subtraction as a placeholder to avoid regex conflicts.
        // Regex: (.*?) - any characters non-greedily
        // (-?\d+) - an optional minus sign followed by one or more digits (operand 1)
        // ([+Z]) - either '+' or 'Z' (operator)
        // (-?\d+) - an optional minus sign followed by one or more digits (operand 2)
        // (.*) - any remaining characters
        while ( ( m = /^(.*?)(-?\d+)([+Z])(-?\d+)(.*)$/ . exec ( s ) ) != null ) {

            // Perform the operation based on the operator found.
            if ( m [ 3 ] === '+' ) {
                s = m [ 1 ] + ( parseInt ( m [ 2 ] ) + parseInt ( m [ 4 ] ) ) + m [ 5 ] ;
            } else {
                // 'Z' represents subtraction.
                s = m [ 1 ] + ( parseInt ( m [ 2 ] ) - parseInt ( m [ 4 ] ) ) + m [ 5 ] ;
            }
        }

        return s ; // Return the fully evaluated string.
    } ;


    // --- Event handler for 'data' received from stdin ---
    stdin . on ( 'data' , function ( input ) {

        var e , x ; // Declare local variables.

        // This block processes the input lines.
        // It's a pattern often seen when CoffeeScript's array comprehension is transpiled.
        x = ( function ( ) {
            var _i , _len , _ref , _results ; // Internal variables from CoffeeScript transpilation.
            _ref = input . split ( "\n" ) ; // Split input by newlines.
            _results = [ ] ; // Initialize results array.
            for ( _i = 0 , _len = _ref . length ; _i < _len ; _i ++ ) {
                e = _ref [ _i ] ; // Iterate through split lines.
                _results . push ( e ) ; // Add each line to results.
            }
            return _results ; // Return the array of lines.
        } ) ( ) ;

        // If the input has more than 2 lines or the second line is not a number,
        // it means we've received all lines at once, so assign 'x' to 'a'.
        // Otherwise, it's a single line, push it to 'a'.
        if ( x . length > 2 || ! isNaN ( x [ 1 ] ) ) {
            return a = x ;
        } else {
            return a . push ( x [ 0 ] ) ;
        }
    } ) ;


    // --- Event handler for 'end' of stdin stream ---
    stdin . on ( 'end' , function ( z ) {
        var i , n , s , _i , _results ; // Declare local variables.
        // 'z' is typically undefined or empty for 'end' event, but kept for Type I fidelity.

        n = parseInt ( a [ 0 ] ) ; // The first line of input is the number of expressions to process.
        _results = [ ] ; // Initialize results array for the loop.

        // Loop from 1 to 'n' (inclusive), processing each expression.
        // This loop structure is typical of transpiled CoffeeScript 'for' loops.
        for ( i = _i = 1 ; 1 <= n ? _i <= n : _i >= n ; i = 1 <= n ? ++ _i : -- _i ) {
            // Extract the expression part before '=' and replace '-' with 'Z' for evaluation.
            s = a [ i ] . substring ( 0 , a [ i ] . indexOf ( '=' ) ) . replace ( /-/g , 'Z' ) ;

            // Process the expression and log the result to console.
            _results . push ( console . log ( proc ( s ) ) ) ;
        }

        return _results ; // Return the array of console.log results (which is usually an array of undefined).
    } ) ;

} ) . call ( this ) ; // End of the IIFE, binding 'this' to the global context.