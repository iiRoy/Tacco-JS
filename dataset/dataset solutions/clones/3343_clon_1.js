/*
 * This section defines a utility for parsing input.
 * It's structured as an Immediately Invoked Function Expression (IIFE)
 * to encapsulate the parsing logic and prevent global pollution.
 */
var GET = ( function( ) {

    // Main factory function to create a new parser instance.
    // It takes a string 's' as input.
    function f( s ) {

        return new g( s );

    }

    // Constructor for the parser object 'g'.
    // Initializes the internal state of the parser.
    function g( s ) {

        // Store the input string, trimmed of leading/trailing whitespace,
        // and then split into an array of lines.
        this._s = s.trim( ).split( "\n" );

        // Initialize a pointer to keep track of the current line being processed.
        this._y = 0;

    }

    /*
     * Prototype methods for the parser object (g).
     * These methods provide functionality to extract different types of data
     * from the parsed input lines.
     */

    /**
     * Extracts a single value from the current line.
     * If 'f' (format flag) is true, returns the value as a string;
     * otherwise, attempts to convert it to a number.
     * Advances the internal line pointer if the current line is exhausted.
     *
     * @param {boolean} f - Flag to control the return type: true for string, false/undefined for number.
     * @returns {string|number} The extracted value.
     */
    g.prototype.a = function( f ) {

        // Cache the internal string array and current line index for performance.
        var s = this._s,
            y = this._y,
            r; // Variable to hold the result of the extraction.

        // If the current line (s[y]) is still a single string, it means it hasn't
        // been split into individual words yet. Split it by spaces and reverse
        // the array so that `pop()` retrieves elements from the original beginning.
        if ( typeof s[ y ] === "string" ) {

            s[ y ] = s[ y ].split( " " ).reverse( );

        }

        // Extract the next value by popping from the end of the (reversed) current line array.
        r = s[ y ].pop( );

        // If the current line array is now empty, increment the line pointer
        // to move to the next line for subsequent reads.
        if ( !s[ y ].length ) {

            this._y++;

        }

        // Return the extracted value, converting to a number if the 'f' flag is not truthy.
        return f ? r : +r;

    };

    /**
     * Extracts an entire line of space-separated values.
     * If 'f' is true, returns the values as an array of strings;
     * otherwise, converts all values in the line to numbers.
     * Advances the line pointer after reading.
     *
     * @param {boolean} f - Flag to control the return type: true for strings, false/undefined for numbers.
     * @returns {string[]|number[]} An array of extracted values from the line.
     */
    g.prototype.l = function( f ) {

        // Retrieve the current line, split it by spaces, and then advance the line pointer.
        var s = this._s[ this._y++ ].split( " " );

        // Return the array, applying a numerical conversion map if 'f' is false/undefined.
        return f ? s : s.map( a => +a );

    };

    /**
     * Extracts a matrix (2D array) of values from 'n' consecutive lines.
     * Each line is treated as a row and split by spaces.
     * If 'f' is true, returns a matrix of strings; otherwise, converts all elements to numbers.
     * Advances the line pointer by 'n' lines.
     *
     * @param {number} n - The number of lines to read and form into the matrix.
     * @param {boolean} f - Flag to control the return type: true for strings, false/undefined for numbers.
     * @returns {string[][]|number[][]} A 2D array (matrix) of extracted values.
     */
    g.prototype.m = function( n, f ) {

        // Slice 'n' lines from the input array, starting from the current line pointer.
        // For each of these lines, split it by spaces to form an array of strings (a row).
        var r = this._s.slice( this._y, this._y += n ).map( a => a.split( " " ) );

        // Return the resulting matrix. If 'f' is false/undefined, map all elements
        // within each row to numbers.
        return f ? r : r.map( a => a.map( a => +a ) );

    };

    /**
     * Extracts 'n' consecutive lines, where each line is expected to contain a single value.
     * If 'f' is true, returns an array of strings; otherwise, converts all values to numbers.
     * Advances the line pointer by 'n' lines.
     *
     * @param {number} n - The number of lines to read.
     * @param {boolean} f - Flag to control the return type: true for strings, false/undefined for numbers.
     * @returns {string[]|number[]} An array of extracted values.
     */
    g.prototype.r = function( n, f ) {

        // Slice 'n' lines from the input array, starting from the current line pointer.
        // This directly gives an array of lines.
        var r = this._s.slice( this._y, this._y += n );

        // Return the resulting array. If 'f' is false/undefined, map all elements
        // (which are individual lines/strings) to numbers.
        return f ? r : r.map( a => +a );

    };

    // The Immediately Invoked Function Expression (IIFE) returns the factory function 'f'.
    // This allows `GET` to be called like `GET(inputString)` to get a parser instance.
    return f;

} )( ); // End of GET IIFE.

/*
 * Initialize the input parser 'o' by reading content from standard input.
 * This typically involves using Node.js's 'fs' module to read a file synchronously.
 * "/dev/stdin" is a common path for standard input on Unix-like systems.
 */
var o = GET( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) );

/*
 * Utility function: xArray
 * Creates a multi-dimensional array (tensor) initialized with a specific value.
 * The dimensions are provided as subsequent arguments.
 * This function dynamically constructs and evaluates a string expression for array creation.
 *
 * Example: `xArray(0, 2, 3)` would create a 2x3 array filled with zeros:
 * `[[0, 0, 0], [0, 0, 0]]`
 *
 * @param {*} v - The initial value to fill the array elements with.
 * @param {...number} dimensions - The sizes of the array dimensions.
 * @returns {Array} The newly created multi-dimensional array.
 */
function xArray( v ) {

    var a = arguments, // Access all arguments passed to this function.
        l = a.length,  // Get the total number of arguments.
        // Start building the array creation string from the innermost dimension.
        // `--l` decrements 'l' to point to the last dimension argument.
        r = "Array(a[" + --l + "]).fill(v)";

    // Loop backwards through the remaining dimensions (from second-to-last down to first).
    // Each iteration wraps the previously constructed array string with a new `Array().fill(0).map()` call.
    while ( --l ) {

        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")";

    }

    // Evaluate the dynamically constructed string to create and return the multi-dimensional array.
    // Note: Use of `eval()` can be a security risk if the input string is not controlled.
    return eval( r );

}

// Output the result of the main function to the console.
// This is the entry point for the program's execution flow.
console.log( main( ) );

/*
 * The primary function of the program.
 * It handles input parsing, calls the problem solver, and returns the final answer.
 */
function main( ) {

    // Read a single numerical value 'n' using the parser 'o'.
    // 'n' typically represents a size, count, or number of elements.
    var n = o.a( );

    // Read an entire line of numerical values 'a' using the parser 'o'.
    // 'a' is likely an array of initial data or costs.
    var a = o.l( );

    // Call the 'solve' function with the parsed inputs and return its result.
    return solve( n, a );

}

/*
 * Implements the core logic to solve the problem, likely using dynamic programming.
 * This function calculates a minimum cost or optimal value based on the given inputs.
 *
 * @param {number} n - An integer, often representing the size of the problem or number of items.
 * @param {number[]} a - An array of numbers, representing initial values or base costs.
 * @returns {number} The computed optimal cost or solution to the problem.
 */
function solve( n, a ) {

    // Initialize a 2D array named 'cost' with dimensions n x n, filled with zeros.
    // This array will store precomputed costs or sums of sub-arrays/ranges.
    var cost = xArray( 0, n, n );

    // Initialize the first row of the 'cost' array directly from the input array 'a'.
    // `cost[0][i]` might represent the cost of a single element at index `i`.
    for ( var i = 0; i < n; i++ ) {

        cost[ 0 ][ i ] = a[ i ];

    }

    // Compute costs for ranges of increasing lengths.
    // The outer loop `i` controls the length of the range (minus one, so `i+1` is actual length).
    // The inner loop `j` controls the starting index of the range.
    for ( var i = 1; i < n; i++ ) {

        for ( var j = 0; j < n - i; j++ ) {

            // Calculate the cost of the current range `[j, j+i]`.
            // This is typically a sum or combination of costs of two smaller, adjacent ranges.
            // `cost[i-1][j]` is the cost of range `[j, j+i-1]`.
            // `cost[0][i+j]` is the cost of the element at `j+i`.
            cost[ i ][ j ] = cost[ i - 1 ][ j ] + cost[ 0 ][ i + j ];

        }

    }

    // Initialize a 2D array named 'dp' (dynamic programming table) with dimensions n x n.
    // It's filled with a very large number (1e15, representing positive infinity)
    // to ensure that any valid calculated cost will be smaller.
    var dp = xArray( 1e15, n, n );

    // Base case for the DP table:
    // `dp[0]` represents ranges of length 1. The cost of splitting a single-element range is 0.
    dp[ 0 ] = xArray( 0, n );

    // Main dynamic programming loops.
    // The outer loop `i` iterates through possible range lengths (from 1 up to n-1).
    for ( var i = 1; i < n; i++ ) {

        // The second loop `j` iterates through all possible starting positions for a range of length `i+1`.
        for ( var j = 0; j < n - i; j++ ) {

            // The inner loop `k` iterates through all possible split points within the current range.
            // `k` represents the length of the first sub-range.
            for ( var k = 1; k <= i; k++ ) {

                // Calculate a temporary cost `t` for splitting the current range `[j, j+i]` at point `j+k`.
                // This cost is the sum of:
                // 1. `dp[i-k][j]`: The minimum cost for the left sub-range (length `i-k+1`, starting at `j`).
                // 2. `dp[k-1][i-k+j+1]`: The minimum cost for the right sub-range (length `k`, starting at `j+k`).
                // 3. `cost[i][j]`: The precomputed cost of the entire current range `[j, j+i]`.
                var t = dp[ i - k ][ j ] + dp[ k - 1 ][ i - k + j + 1 ] + cost[ i ][ j ];

                // If the calculated temporary cost `t` is less than the currently stored minimum cost
                // for this range in the DP table, update `dp[i][j]`.
                if ( t < dp[ i ][ j ] ) {

                    dp[ i ][ j ] = t;

                }

            }

        }

    }

    // The final result is stored in `dp[n-1][0]`, which represents the minimum cost
    // for the entire range of elements, from index 0 to `n-1`.
    return dp[ n - 1 ][ 0 ];

} // End of solve function definition.