/**
 *  This is a custom utility class designed to facilitate
 *  reading input strings, typically from standard input.
 *  It parses the input into lines and provides methods
 *  to extract values in various formats.
 */
function gets( str )
{
    // The raw input string is split into an array of lines.
    // This array is stored internally.
    this._s = str.split( "\n" ) ;

    // _y keeps track of the current line index being processed.
    this._y = 0 ;
}

// Define prototype methods for the 'gets' class.
gets.prototype =
{
    /**
     *  Method 'a' (presumably for 'atom' or 'argument')
     *  extracts a single value from the current line.
     *  It supports both string and number output based on the 'f' flag.
     *
     *  @param {boolean} f - If true, returns the value as a string; otherwise, as a number.
     *  @returns {string|number} The extracted value.
     */
    a : function( f )
    {
        // Shorthand for the internal string array and current line index.
        var s = this._s ,
            y = this._y ,
            r ; // 'r' will store the result.

        // If the current line hasn't been split into words yet, do so.
        // It's then reversed to allow efficient popping from the end.
        if ( typeof s[ y ] === "string" )
        {
            s[ y ] = s[ y ].split( " " ).reverse() ;
        }

        // Pop the last element (which is the first word due to reversal).
        r = s[ y ].pop() ;

        // If the current line is now empty after popping, advance to the next line.
        if ( !s[ y ].length )
        {
            this._y++ ;
        }

        // Return the result, either as a string or converted to a number.
        return f ? r : +r ;
    } ,

    /**
     *  Method 'l' (presumably for 'line') reads an entire line
     *  and splits it into an array of values.
     *  It supports returning an array of strings or an array of numbers.
     *
     *  @param {boolean} f - If true, returns an array of strings; otherwise, an array of numbers.
     *  @returns {Array<string|number>} An array of values from the line.
     */
    l : function( f )
    {
        // Get the current line, split it by spaces, and then advance the line index.
        var s = this._s[ this._y++ ].split( " " ) ;

        // Return the array, either as strings or mapped to numbers.
        return f ? s : s.map( a => +a ) ;
    } ,

    /**
     *  Method 'm' (presumably for 'multi-line' or 'matrix')
     *  reads 'n' number of lines and processes each into an array of values.
     *  This is useful for reading a small matrix or multiple rows of data.
     *
     *  @param {number} n - The number of lines to read.
     *  @param {boolean} f - If true, returns arrays of strings; otherwise, arrays of numbers.
     *  @returns {Array<Array<string|number>>} A 2D array representing the read lines.
     */
    m : function( n , f )
    {
        // Shorthand for the internal string array and current line index.
        var s = this._s ,
            y = this._y ,
            r = [] , // 'r' will store the 2D array result.
            i = 0 ;  // Loop counter.

        // Loop 'n' times to read 'n' lines.
        if ( f )
        {
            // If 'f' is true, each line is split into strings.
            for ( ; i < n ; i++ )
            {
                r[ i ] = s[ y + i ].split( " " ) ;
            }
        }
        else
        {
            // Otherwise, each line is split and then its elements are mapped to numbers.
            for ( ; i < n ; i++ )
            {
                r[ i ] = s[ y + i ].split( " " ).map( a => +a ) ;
            }
        }

        // Advance the line index by 'n' as 'n' lines have been processed.
        this._y += n ;

        // Return the accumulated 2D array.
        return r ;
    } ,
} ;

// Initialize an instance of the 'gets' utility.
// It reads the entire content of standard input as a UTF-8 string.
var o = new gets( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;

// Define a modulo constant, commonly used in competitive programming.
var mod = 1e9 + 7 ;

// Call the main function and print its return value to the console.
console.log( main() ) ;

/**
 *  The primary logic function of the program.
 *  It computes a dynamic programming solution based on inputs.
 *  This likely solves a combinatorial problem or a pathfinding problem
 *  on a grid with specific constraints.
 *
 *  @returns {number} The final computed result.
 */
function main()
{
    // Read height (h) and width (w) from input using the 'gets' object.
    var h = o.a() ;
    var w = o.a() ;

    // Handle a specific base case: if width is 1, the answer is always 1.
    if ( w === 1 )
    {
        return 1 ;
    }

    // Read a specific column index 'k' from input.
    var k = o.a() ;

    // Initialize a 2D dynamic programming array (dp) of size (h+1) x (w+1).
    // All elements are initially set to 0.
    var dp = Array( h + 1 ).fill( 0 ).map( a => Array( w + 1 ).fill( 0 ) ) ;

    // Set the base case for the DP: dp[0][1] is 1.
    // This represents the starting state or an initial configuration.
    dp[ 0 ][ 1 ] = 1 ;

    // Define a lookup table 'v'. The values 1,1,2,3,5,8,13,21,34
    // are Fibonacci numbers (shifted), possibly related to ways to fill a row.
    var v = [ 1 , 1 , 2 , 3 , 5 , 8 , 13 , 21 , 34 ] ;

    // Iterate through each row from 1 to 'h'.
    for ( var i = 1 ; i <= h ; i++ )
    {
        // Calculate dp[i][1] (first column).
        // It depends on the previous row's first and second columns.
        dp[ i ][ 1 ] = dp[ i - 1 ][ 1 ] * v[ w - 1 ] ;
        dp[ i ][ 1 ] += dp[ i - 1 ][ 2 ] * v[ w - 2 ] ;
        dp[ i ][ 1 ] %= mod ; // Apply modulo operation.

        // Iterate through intermediate columns from 2 to w-1.
        for ( var j = 2 ; j < w ; j++ )
        {
            // dp[i][j] depends on dp[i-1][j-1], dp[i-1][j], and dp[i-1][j+1].
            // Each term is multiplied by values from the 'v' array,
            // which likely represent combinations or permutations for parts of the row.
            dp[ i ][ j ] = dp[ i - 1 ][ j - 1 ] * v[ j - 2 ] * v[ w - j ] ;
            dp[ i ][ j ] += dp[ i - 1 ][ j ] * v[ j - 1 ] * v[ w - j ] ;
            dp[ i ][ j ] += dp[ i - 1 ][ j + 1 ] * v[ j - 1 ] * v[ w - j - 1 ] ;
            dp[ i ][ j ] %= mod ; // Apply modulo operation.
        }

        // Calculate dp[i][w] (last column).
        // It depends on the previous row's last two columns.
        dp[ i ][ w ] = dp[ i - 1 ][ w - 1 ] * v[ w - 2 ] ;
        dp[ i ][ w ] += dp[ i - 1 ][ w ] * v[ w - 1 ] ;
        dp[ i ][ w ] %= mod ; // Apply modulo operation.
    }

    // The final answer is the value at dp[h][k], representing the state
    // after 'h' rows at column 'k'.
    return dp[ h ][ k ] ;
}