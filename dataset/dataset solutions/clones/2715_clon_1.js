/*
 * This section defines a utility object named 'GET'.
 * It's designed to parse input data, typically from standard input,
 * in a structured way, providing methods to read various data formats.
 */
var GET = (
    function( )
    {

        // Inner function 'f' serves as the public constructor for the GET utility.
        function f( s )
        {
            return new g( s ) ;
        }

        /*
         * Constructor function 'g'.
         * Initializes the internal state for parsing the input string 's'.
         */
        function g( s )
        {
            /*
             * Store the input string, first trimmed of leading/trailing whitespace,
             * then split into an array of lines based on newline characters.
             * '_y' is an internal pointer tracking the current line index being processed.
             */
            this._s = s . trim( ) . split( "\n" ) ;
            this._y = 0 ;
        }

        /*
         * Prototype method 'a': Reads a single item from the current line.
         * It handles spaces within a line and can return either a string or a number.
         * @param {boolean} f - If true, returns the item as a string; otherwise, as a number.
         */
        g . prototype . a = function( f )
        {
            var s = this._s , // Reference to the array of lines.
                y = this._y , // Current line index.
                r ;            // Variable to hold the result.

            // If the current line is still a single string, it means it hasn't been processed into tokens yet.
            if ( typeof s[ y ] === "string" )
            {
                // Split the line by spaces and reverse the array to easily pop elements from the "front".
                s[ y ] = s[ y ] . split( " " ) . reverse( ) ;
            }

            // Pop the last element (which was the first before reversing).
            r = s[ y ] . pop( ) ;

            // If the current line is now empty after popping, advance to the next line.
            if ( ! s[ y ] . length )
            {
                this._y ++ ;
            }

            // Return the result based on the 'f' flag: string if true, converted to number if false.
            return f ? r : +r ;
        } ;

        /*
         * Prototype method 'l': Reads an entire line as an array of items.
         * @param {boolean} f - If true, returns array of strings; otherwise, array of numbers.
         */
        g . prototype . l = function( f )
        {
            // Get the current line, increment the line index, and split it by spaces.
            var s = this._s[ this._y ++ ] . split( " " ) ;

            // Return the array of items, converting to numbers if 'f' is false.
            return f ? s : s . map( a => +a ) ;
        } ;

        /*
         * Prototype method 'm': Reads a matrix of 'n' lines.
         * Each line is treated as an array of items.
         * @param {number} n - The number of lines to read for the matrix.
         * @param {boolean} f - If true, returns matrix of strings; otherwise, matrix of numbers.
         */
        g . prototype . m = function( n , f )
        {
            // Slice 'n' lines from the input, update the line index, and split each line by spaces.
            var r = this._s . slice( this._y , this._y += n ) . map( a => a . split( " " ) ) ;

            // Return the matrix, converting inner elements to numbers if 'f' is false.
            return f ? r : r . map( a => a . map( a => +a ) ) ;
        } ;

        /*
         * Prototype method 'r': Reads 'n' raw lines.
         * Unlike 'm', it doesn't split lines by spaces.
         * @param {number} n - The number of raw lines to read.
         * @param {boolean} f - If true, returns array of strings; otherwise, array of numbers.
         */
        g . prototype . r = function( n , f )
        {
            // Slice 'n' lines directly from the input array, updating the line index.
            var r = this._s . slice( this._y , this._y += n ) ;

            // Return the array of lines, converting to numbers if 'f' is false.
            return f ? r : r . map( a => +a ) ;
        } ;

        // The public interface of the GET utility is the 'f' constructor.
        return f ;
    }
)( ) ;


/*
 * Initialize the input reader 'o'.
 * It reads the entire content of '/dev/stdin' as a UTF-8 string
 * and passes it to the GET utility for parsing.
 */
var o = GET( require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" ) ) ;


/*
 * Utility function 'xArray': Creates multi-dimensional arrays.
 * The last argument passed to the function becomes the initial value for the innermost elements.
 * Example: xArray(10, 20, 0) creates a 10x20 array filled with 0s.
 * @param {*} v - The initial value for the elements.
 * @param {...number} dimensions - The dimensions of the array.
 */
function xArray( v )
{
    var a = arguments , // Access to all arguments.
        l = a . length ,  // Total number of arguments.
        // Start building the array creation string from the innermost dimension.
        r = "Array(a[" + --l + "]).fill(0).map(x=>{return " + v + ";})" ;

    /*
     * Loop backwards through the dimensions (excluding the value 'v' and the last dimension already handled).
     * Each iteration wraps the existing 'r' string with a new Array.map structure.
     */
    while ( --l )
    {
        r = "Array(a[" + l + "]).fill(0).map(x=>" + r + ")" ;
    }

    // Evaluate the constructed string to dynamically create the multi-dimensional array.
    return eval( r ) ;
}


/*
 * The main function 'main'.
 * It solves a problem related to finding the maximum number of non-overlapping
 * occurrences of a pattern string 't' within a larger string 's' (potentially repeated).
 */
function main( )
{
    // Read the main string 's' and the pattern string 't' from input.
    var s = o . a( 1 ) ;
    var t = o . a( 1 ) ;

    // Determine the repetition factor of the pattern 't' itself (e.g., "abab" has factor 2).
    var nt = rept( t ) ;

    // If 't' has internal repetitions, reduce it to its minimal repeating unit.
    if ( nt > 1 )
    {
        t = t . slice( 0 , t . length / nt ) ;
    }

    // Create 's' repeated twice and thrice to handle boundary conditions and wrapping.
    var s2 = s + s ;
    var s3 = s2 + s ;

    // Store the length of the (possibly reduced) pattern 't'.
    var tl = t . length ;

    // Initialize 'mx' (maximum count of non-overlapping 't' occurrences) to 0,
    // and 'n' (current consecutive count) to 1.
    var mx = 0 ,
        n = 1 ;

    // Find the first occurrence of 't' in 's2'.
    var i = s2 . indexOf( t ) ;

    // If the pattern 't' is not found anywhere, return 0.
    if ( i === -1 )
    {
        return 0 ;
    }

    // Advance 'i' past the first found occurrence to look for the next one.
    i += tl ;

    /*
     * Loop to find consecutive non-overlapping occurrences of 't' in 's2'.
     * This primarily handles sequences of 't' that are immediately adjacent.
     */
    while ( i < s2 . length )
    {
        // Find the next occurrence of 't' starting from the current 'i'.
        var j = s2 . indexOf( t , i ) ;

        // If no more occurrences are found in 's2', exit the loop.
        if ( j === -1 )
        {
            break ;
        }

        // If the current occurrence starts exactly where the previous one ended, it's consecutive.
        if ( i === j )
        {
            n ++ ; // Increment the count of consecutive occurrences.
        }
        else
        {
            /*
             * If not consecutive, it means a gap was found.
             * Update the maximum count 'mx' if the current sequence 'n' is larger.
             * Then, reset 'n' to 1 for a new potential sequence.
             */
            if ( mx < n )
            {
                mx = n ;
            }
            n = 1 ;
        }

        // Advance 'i' past the current found occurrence to search for the next.
        i = j + tl ;
    }

    // After the loop, ensure 'mx' is updated with the final sequence count 'n'.
    if ( mx < n )
    {
        mx = n ;
    }

    /*
     * Special check for occurrences crossing the s2/s3 boundary.
     * Look for 't' in 's3' starting from the last 'i' position.
     */
    j = s3 . indexOf( t , i ) ;

    // If 't' is found immediately at 'i' in 's3', it extends the current sequence.
    if ( j === i )
    {
        n ++ ; // Increment the consecutive count.

        /*
         * If this extended sequence makes 'n' larger than the current maximum 'mx',
         * it indicates an infinitely repeating pattern, so return -1.
         */
        if ( mx < n )
        {
            return -1 ;
        }
    }

    /*
     * Finally, return the maximum count of non-overlapping occurrences,
     * divided by the internal repetition factor of 't' (to count the minimal units),
     * and floored to an integer using the bitwise OR operator.
     */
    return mx / nt | 0 ;
}


/*
 * Function 'rept': Calculates the smallest repetition factor of a string.
 * For example, if s = "abcabcabc", rept(s) would return 3 (as "abc" repeats 3 times).
 * If s = "abc", rept(s) would return 1.
 * @param {string} s - The input string to check for repetitions.
 * @returns {number} The repetition factor.
 */
function rept( s )
{
    var sl = s . length ; // Get the length of the string.

    // A single-character string has no internal repetition, so its factor is 1.
    if ( sl === 1 )
    {
        return 1 ;
    }

    // Get all divisors of the string's length. These are potential lengths for the repeating unit.
    var r = divisor( sl ) ;

    // Iterate through each divisor.
    for ( var i = 0 ; i < r . length ; i ++ )
    {
        var t = sl / r[ i ] ; // 't' represents how many times a unit of length r[i] would repeat.

        /*
         * Construct a regular expression:
         * `(` + s.slice(0, r[i]) + `){` + t + `}`
         * This checks if the string 's' is exactly 't' repetitions of its prefix of length `r[i]`.
         */
        if ( s . match( new RegExp( "(" + s . slice( 0 , r[ i ] ) + "){" + t + "}" ) ) )
        {
            return t ; // If a match is found, 't' is the repetition factor.
        }
    }

    // If no repetition is found, the string itself is the smallest repeating unit.
    return 1 ;
}


/*
 * Function 'divisor': Finds all positive integer divisors of a given number 'x'.
 * Returns them in a sorted array in ascending order.
 * @param {number} x - The number for which to find divisors.
 * @returns {number[]} An array of divisors.
 */
function divisor( x )
{
    var r = [ 1 ] ; // '1' is always a divisor for any positive integer.

    // Calculate the integer part of the square root of 'x' for optimization.
    var m = Math . sqrt( x ) | 0 ;

    // If 'x' is a perfect square, its square root 'm' is a divisor.
    if ( m * m === x )
    {
        r . push( m ) ;
    }

    // Iterate from 2 up to (but not including) the integer square root.
    for ( var i = 2 ; i < m ; i ++ )
    {
        // If 'i' divides 'x' evenly, then 'i' and 'x / i' are both divisors.
        if ( x % i === 0 )
        {
            r . push( i , x / i ) ;
        }
    }

    // Sort the collected divisors in ascending numerical order.
    return r . sort( ( a , b ) => a - b ) ;
}


/*
 * Conditional execution block:
 * This part determines how the script is run based on command-line arguments.
 * If there are 2 or fewer arguments (meaning only 'node' and 'script.js' or just 'node'),
 * it forks a new Node.js process with an increased stack size.
 * Otherwise (if more arguments are present, typically indicating it's the forked process),
 * it executes the 'main' function and prints its result to the console.
 */
if ( process . argv . length <= 2 )
{
    // Fork a new child process to execute 'Main.js' (itself) with specific Node.js arguments.
    // The '--stack-size=240000' argument increases the V8 call stack limit,
    // which can be necessary for deeply recursive operations or large data structures.
    require( "child_process" ) . fork( "Main.js" , [ "1" ] , { execArgv : [ "--stack-size=240000" ] } ) ;
}
else
{
    // If this is the forked process (or any execution with more than 2 arguments),
    // call the 'main' function and output its return value.
    console . log( main( ) ) ;
}