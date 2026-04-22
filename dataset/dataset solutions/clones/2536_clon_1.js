/*
 * This file contains utility functions for input processing
 * and the main logic for a problem involving dynamic programming.
 *
 * It's structured to read input, parse it, and then solve
 * a specific combinatorial optimization problem.
 */

/*
 * GET is a module designed for parsing multi-line string input.
 * It provides methods to extract values, arrays, and slices of data
 * from a pre-processed string.
 *
 * This is an Immediately Invoked Function Expression (IIFE)
 * to encapsulate its internal helper functions and variables.
 */
var GET = (
    function ( ) {

        /*
         *   The main entry point for the GET module.
         *   It takes a raw string 's', and returns a new instance
         *   of the internal 'g' class, which handles the actual parsing.
         */
        function f ( s ) {

            return new g ( s ) ;

        }

        /*
         *   The constructor for the internal 'g' class.
         *   It initializes the internal state '_s' by trimming
         *   the input string 's' and splitting it into an array
         *   of lines.
         */
        function g ( s ) {
            this. _s = s. trim ( ) . split ( "\n" ) ;
        }

        /*
         *   Prototype method for the 'g' class.
         *   Retrieves a single line from the parsed input at index 'n'.
         *   @param {number} n - The index of the line to retrieve.
         *   @returns {string} The line at the specified index.
         */
        g. prototype . getValue = function ( n ) {
            return this. _s [ n ] ;
        } ;

        /*
         *   Prototype method for the 'g' class.
         *   Retrieves a line at index 'n' and parses it into an array
         *   of numbers or strings using the 'stoa' helper.
         *   @param {number} n - The index of the line to retrieve.
         *   @returns {Array<number|string>} An array of parsed values.
         */
        g. prototype . getArray = function ( n ) {
            return this. stoa ( this. _s [ n ] ) ;
        } ;

        /*
         *   Prototype method for the 'g' class.
         *   Extracts a slice of lines from the parsed input, starting at 's'
         *   and extending for 'limit' lines. Each line in the slice is then
         *   parsed into a single number or string using 'stox'.
         *   @param {number} s     - The starting index for the slice.
         *   @param {number} limit - The number of lines to include in the slice.
         *   @returns {Array<number|string>} An array of parsed values from the sliced lines.
         */
        g. prototype . slice = function ( s , limit ) {
            return this
                . _s
                . slice ( s , + limit + s || undefined )
                . map ( v => this. stox ( v ) ) ;
        } ;

        /*
         *   Prototype method for the 'g' class.
         *   Similar to 'slice', but each line in the slice is parsed into
         *   an array of numbers or strings using 'stoa'.
         *   @param {number} s     - The starting index for the slice.
         *   @param {number} limit - The number of lines to include in the slice.
         *   @returns {Array<Array<number|string>>} An array of arrays of parsed values.
         */
        g. prototype . sliceArray = function ( s , limit ) {
            return this
                . _s
                . slice ( s , + limit + s || undefined )
                . map ( v => this. stoa ( v ) ) ;
        } ;

        /*
         *   Prototype method for the 'g' class.
         *   Helper function to convert a space-separated string into
         *   an array of numbers or strings. Each element is processed
         *   by 'stox'.
         *   @param {string} s - The string to convert.
         *   @returns {Array<number|string>} An array of parsed values.
         */
        g. prototype . stoa = function ( s ) {
            return s. split ( " " ) . map ( v => this. stox ( v ) ) ;
        } ;

        /*
         *   Prototype method for the 'g' class.
         *   Helper function to convert a single string value 'v' into
         *   a number if possible; otherwise, it returns the original string.
         *   Uses the unary plus operator for type conversion and 'i === i'
         *   to check for NaN.
         *   @param {string} v - The string value to convert.
         *   @returns {number|string} The converted number or the original string.
         */
        g. prototype . stox = function ( v ) {
            var i = + v ;
            return ( i === i ) ? i : v ;
        } ;

        // The IIFE returns the 'f' function, which is the public API for GET.
        return f ;

    }
) ( ) ;


// Initialize the input parser 'o' by reading the standard input.
// It uses Node.js 'fs' module to read the entire file synchronously.
var o = GET ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/*
 *   A utility function to dynamically create multi-dimensional arrays.
 *   It takes a value 'v' to fill the innermost array elements,
 *   and subsequent arguments define the dimensions of the array.
 *   Example: xArray(0, 2, 3) creates a 2x3 array filled with 0s.
 *   NOTE: This function uses `eval`, which can be a security risk
 *         if the input 'v' or dimensions are not controlled.
 */
function xArray ( v ) {
    var a = arguments ,
        l = a . length ,
        r = "Array(a[" + -- l + "]).fill(0).map(x=>{return " + v + ";})" ;

    // Construct the nested `map` calls for each dimension
    while ( -- l ) {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
    }

    // Evaluate the constructed string to create the array
    return eval ( r ) ;
}


// Call the main function and print its return value to the console.
console . log ( main ( ) ) ;


/*
 *   The main function containing the problem's logic.
 *   It reads input parameters N and M, processes item information,
 *   and uses dynamic programming to find the minimum cost.
 */
function main ( ) {

    // Read the first line of input and parse it into an array.
    var l1 = o . getArray ( 0 ) ;

    // Extract N and M from the first line.
    var N = l1 [ 0 ] ;
    var M = l1 [ 1 ] ;

    /*
     *   Read the remaining input as an array of arrays.
     *   Each inner array represents information about a specific item.
     *   The slice starts from index 1 to skip the N, M line.
     */
    var info = o . sliceArray ( 1 ) ;

    // Initialize an empty array to store processed key information.
    var keys = [ ] ;

    // Initialize 'ans' variable, though its purpose here is unclear
    // as it's immediately overwritten or not used effectively before
    // the DP calculation. It seems to calculate 2^(N+1) - 2.
    var ans = 0 ;
    for ( var n = N ; n > 0 ; n -- ) {
        ans += 1 << n ;
    }

    /*
     *   Process the 'info' array to populate the 'keys' array.
     *   Each 'key' object will contain a cost 'a' and a bitmask 'c'
     *   representing a set of covered items.
     */
    for ( var i = 0 ; M * 2 > i ; i = i + 2 ) {

        keys . push ( {
            a : info [ i ] [ 0 ] , // 'a' represents the cost
            c : info [ i + 1 ] . reduce ( function ( a , c ) {
                // 'c' represents a bitmask where each bit corresponds to an item.
                // It's calculated by OR-ing (1 shifted left by (c-1)) for each sub-item.
                return a | 1 << ( c - 1 ) ;
            } , 0 )
        } ) ;

    }


    /*
     *   Dynamic Programming Initialization:
     *   'dp' array stores the minimum cost to achieve a certain state (bitmask).
     *   The size of 'dp' is 2^N, representing all possible subsets of N items.
     *   Initialize all costs to Infinity, except for dp[0] (empty set), which is 0.
     */
    var dp = ( new Array ( 1 << N ) ) . fill ( Infinity ) ;
    dp [ 0 ] = 0 ;

    /*
     *   Dynamic Programming Calculation:
     *   Iterate through all possible states 's' (bitmasks).
     *   For each state, iterate through all available keys (items/options).
     *   't' represents the new state achieved by applying the current key 'j'
     *   to state 's' (using bitwise OR).
     *   'cost' is the cost to reach state 't' via state 's' and key 'j'.
     *   Update dp[t] if a cheaper cost is found.
     */
    for ( var s = 0 ; 1 << N > s ; s ++ ) {
        for ( var j = 0 ; M > j ; j ++ ) {
            var t = s | keys [ j ] . c ; // New state after applying key 'j'
            var cost = dp [ s ] + keys [ j ] . a ; // Cost to reach new state
            dp [ t ] = Math . min ( dp [ t ] , cost ) ; // Update with minimum cost
        }
    }

    /*
     *   Final Result:
     *   The answer is the minimum cost to reach the state where all N items
     *   are covered (represented by the bitmask (1 << N) - 1).
     *   If this cost is still Infinity, it means it's impossible to cover
     *   all items, so return -1. Otherwise, return the calculated minimum cost.
     */
    return dp [ ( 1 << N ) - 1 ] === Infinity ? - 1 : dp [ ( 1 << N ) - 1 ] ;

}