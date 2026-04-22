/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * are preserved exactly as in the original.
 * Only whitespace (indentation, spacing, blank lines) and comments have been altered
 * to create a visually distinct but functionally identical version.
 */
var GET = (

    // This is an Immediately Invoked Function Expression (IIFE)
    // It encapsulates the GET function and its dependencies.
    function ( ) {

        /*
         *   Helper function 'f' within the IIFE.
         *   It's responsible for creating a new instance of 'g'.
         */
        function f ( s ) {

            return new g ( s ) ;

        }

        /**
         *   Constructor function 'g'.
         *   Initializes a new data reader instance.
         *   @param {string} s - The input string, typically multi-line.
         */
        function g ( s ) {

            // Store the processed input string as an array of lines.
            // Each line is trimmed and then split.
            this . _s = s . trim ( ) . split ( "\n" ) ;
            // Initialize the current line index to 0.
            this . _y = 0 ;

        }

        // --- Prototype methods for the 'g' constructor ---

        /*
         * Method 'a': Reads an "atom" (single value) from the current line.
         * If the line is exhausted, it moves to the next line.
         * @param {boolean} f - If true, returns the value as a string; otherwise, as a number.
         * @returns {string|number} The read atom.
         */
        g . prototype . a = function ( f ) {

            var s = this . _s ,
                y = this . _y ,
                r ;

            // If the current line hasn't been processed yet (is still a string),
            // reverse its words to facilitate popping from the "end".
            if ( typeof s [ y ] === "string" )
                s [ y ] = s [ y ] . split ( " " ) . reverse ( ) ;

            // Pop the last word (which was originally the first word) from the current line.
            r = s [ y ] . pop ( ) ;

            // If the current line is now empty, advance to the next line.
            if ( ! s [ y ] . length )
                this . _y ++ ;

            // Return the result, optionally parsed as a number.
            return f ? r : + r ;

        } ;

        /*
         * Method 'l': Reads an entire line of space-separated values.
         * Advances the line pointer after reading.
         * @param {boolean} f - If true, returns values as strings; otherwise, as numbers.
         * @returns {string[]|number[]} An array of values from the line.
         */
        g . prototype . l = function ( f ) {

            // Get the current line, split by spaces, and then increment the line pointer.
            var s = this . _s [ this . _y ++ ] . split ( " " ) ;

            // Return the array, optionally mapping values to numbers.
            return f ? s : s . map ( a => + a ) ;

        } ;

        /*
         * Method 'm': Reads a matrix (multiple lines, multiple columns).
         * @param {number} n - The number of lines to read.
         * @param {boolean} f - If true, returns values as strings; otherwise, as numbers.
         * @returns {string[][]|number[][]} A 2D array representing the matrix.
         */
        g . prototype . m = function ( n , f ) {

            // Slice 'n' lines from the input, split each line by spaces,
            // and then advance the line pointer.
            var r = this . _s . slice ( this . _y , this . _y += n ) . map ( a => a . split ( " " ) ) ;

            // Return the 2D array, optionally mapping all inner values to numbers.
            return f ? r : r . map ( a => a . map ( a => + a ) ) ;

        } ;

        /*
         * Method 'r': Reads a row (multiple lines, single value per line).
         * @param {number} n - The number of lines (rows) to read.
         * @param {boolean} f - If true, returns values as strings; otherwise, as numbers.
         * @returns {string[]|number[]} An array of values, one from each line.
         */
        g . prototype . r = function ( n , f ) {

            // Slice 'n' lines from the input, and then advance the line pointer.
            var r = this . _s . slice ( this . _y , this . _y += n ) ;

            // Return the array, optionally mapping values to numbers.
            return f ? r : r . map ( a => + a ) ;

        } ;

        // The IIFE returns the 'f' function, which acts as the primary interface for GET.
        return f ;

    } ) ( ) ; // End of IIFE execution.

// Initialize 'o' by reading input from stdin using the GET utility.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/*
 *   The program's entry point.
 *   Calls the main function and logs its return value to the console.
 */
console . log ( main ( ) ) ;


/**
 *   Main function: Solves a specific problem using dynamic programming.
 *   It processes input data to find a minimum value based on certain rules.
 *
 *   @returns {number} The minimum calculated value.
 */
function main ( ) {

    // Read the first integer 'l' using the 'a' method.
    var l = o . a ( ) ;
    // Read 'l' numbers (a row) into array 'a'.
    var a = o . r ( l ) ;

    // Initialize 'dp' (dynamic programming array) to store intermediate results.
    var dp = [ ] ;

    // Initial population of 'dp' for the first element of 'a'.
    // This loop calculates initial values based on 'a[0]' and indices 0 to 4.
    for ( var j = 0 ; j < 5 ; j ++ )
        dp [ j ] = f ( a [ 0 ] , j ) ;


    // Iterate through the rest of the elements in 'a', starting from the second element.
    for ( var i = 1 ; i < l ; i ++ ) {

        // Create a temporary array 'd' for the current iteration's DP values.
        // Initialize with a very large number (effectively infinity) for minimization.
        var d = Array ( 5 ) . fill ( 9e99 ) ;

        // Calculate the first element of 'd' based on the previous 'dp' and current 'a[i]'.
        d [ 0 ] = dp [ 0 ] + a [ i ] ;

        // Nested loops to calculate the remaining elements of 'd'.
        // This represents transitions between states.
        for ( j = 1 ; j < 5 ; j ++ )
            for ( var k = 0 ; k <= j ; k ++ ) {

                // Calculate a potential new value 't' for d[j].
                var t = dp [ k ] + f ( a [ i ] , j ) ;

                // If 't' is smaller than the current value in d[j], update d[j].
                if ( d [ j ] > t )
                    d [ j ] = t ;
            }

        // Update 'dp' with the newly calculated values from 'd' for the next iteration.
        dp = d ;

    }

    // After processing all elements, return the minimum value found in the final 'dp' array.
    return Math . min ( ... dp ) ;


    /**
     *   Inner helper function 'f': Calculates a specific value based on 'n' and 'k'.
     *   This function defines the rules for state transitions or base costs.
     *   @param {number} n - The input number.
     *   @param {number} k - The index or state.
     *   @returns {number} The calculated value.
     */
    function f ( n , k ) {

        // Specific rules for k = 0 or k = 4.
        if ( k === 0 || k === 4 )
            return n ;

        // Specific rule for k = 2.
        if ( k === 2 )
            return ( n + 1 ) % 2 ;

        // Default rule for other values of k.
        return n === 0 ? 2 : n % 2 ;
    }

} // End of main function.