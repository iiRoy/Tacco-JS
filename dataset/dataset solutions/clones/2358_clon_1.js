/*
 * This is a highly modified, but functionally identical, clone of the original source code.
 * All identifiers, variable names, function names, operators, and expressions are preserved.
 * Extensive changes have been made to whitespace and comments to create visual difference.
 */

//  Initial setup for input/output handling. This section prepares the environment
//  to read data from standard input and write to standard output.
var      read = require( 'readline' ) . createInterface( {
    input : process . stdin ,
    output : process . stdout
} ) ;

var obj ;
var inLine = [ ] ;

// Event listener for each line of input received.
read . on( 'line' ,
    function ( input )
    {
        inLine . push( input ) ;
    }
) ;


// Event listener for when the input stream closes.
// This is where the main processing begins after all input is gathered.
read . on( 'close' ,
    function ( )
    {
        obj = init ( inLine ) ; // Initialize the custom input object.

        console . error ( '\n↑入力 ↓出力' ) ; // Debug message in Japanese.

        Main ( ) ; // Invoke the primary application logic.
    }
) ;




/**
 * Creates a deep copy of an object. Handles Sets specifically, otherwise uses JSON serialization.
 * @param {any} obj The object to clone.
 * @returns {any} A deep clone of the object.
 */
function makeClone( obj )
{
    // If the object is an instance of Set, create a new Set from its elements.
    return ( obj instanceof Set )

             ? new Set ( Array . from ( obj ) )

             : JSON . parse ( JSON . stringify ( obj ) ) ; // Otherwise, use JSON stringify/parse for deep copy.
}


// Helper functions for reading various data types from the input stream.

function nextInt ( )
{
    return myconv ( next ( ) , 1 ) ;
}

function nextStrArray ( )
{
    return myconv ( next ( ) , 2 ) ;
}

function nextIntArray ( )
{
    return myconv ( next ( ) , 4 ) ;
}

function nextCharArray ( )
{
    return myconv ( next ( ) , 6 ) ;
}

function next ( )
{
    return obj . next ( ) ;
}

function hasNext ( )
{
    return obj . hasNext ( ) ;
}




/**
 * Initializes a custom object to manage input lines.
 * This object provides methods to check for more input and retrieve the next line.
 * @param {string[]} input An array of strings, where each string is a line of input.
 * @returns {object} An object with `list`, `index`, `max`, `hasNext`, and `next` properties.
 */
function init ( input )
{
    return {
        list : input , // The array containing all input lines.

        index : 0 ,    // Current position in the input array.

        max : input . length , // Total number of input lines.


        // Checks if there are more lines to read.
        hasNext : function ( )
        {
            return ( this . index < this . max ) ;
        } ,


        // Retrieves the next line from the input.
        next : function ( )
        {
            if ( this . hasNext ( ) )
            {
                return this . list [ this . index ++ ] ;
            }
            else
            {
                throw 'ArrayIndexOutOfBoundsException ‚There is no more input' ; // Error if no more input.
            }
        }
    } ;
}


// Utility for printing output to the console.
function myout ( s )
{
    console . log ( s ) ;
}


// Utility for printing debug information to standard error.
function myerr ( s )
{
    console . error ( 'debug:' + require ( 'util' ) . inspect ( s , false , null ) ) ;
}


/*
 * This function performs various conversions on input data based on the 'no' parameter.
 * It's a versatile parsing and formatting tool for different data types.
 *
 * Conversion Modes:
 *   1: Parse integer.
 *   2: Split string by spaces into an array of strings.
 *   4: Split string by spaces and convert parts to numbers.
 *   6: Split string into an array of characters.
 *   7: Split string into characters and convert them to numbers (if applicable).
 *   8: Join array elements with spaces.
 *   9: Join array elements with newlines.
 *   0: Join array elements without any separator.
 *   Default: Return input as is.
 */
function myconv ( i , no )
{
    try
    {
        switch ( no )
        {
            case 1:
                return parseInt ( i ) ;

            case 2:
                return i . split ( ' ' ) ;

            case 4:
                return i . split ( ' ' ) . map ( Number ) ;

            case 6:
                return i . split ( '' ) ;

            case 7:
                return i . split ( '' ) . map ( Number ) ;

            case 8:
                return i . join ( ' ' ) ;

            case 9:
                return i . join ( '\n' ) ;

            case 0:
                return i . join ( '' ) ;

            default:
                return i ;
        }
    }
    catch ( e )
    {
        // In case of any conversion error, simply return the original input.
        return i ;
    }
}


/*
 * The main entry point of the program.
 * This function encapsulates the core logic for processing the input
 * and computing the final result. It uses dynamic programming to solve
 * a path-finding problem on a grid.
 */
function Main ( )
{
    // Read the first line of input, which contains H (height) and W (width).
    var one = nextIntArray ( ) ;

    var H   = one [ 0 ] ; // Height of the grid.
    var W   = one [ 1 ] ; // Width of the grid.

    // Initialize the grid (list) to store the first set of values.
    var list = new Array ( H ) ;

    // Populate the 'list' grid with integer arrays from input.
    for ( var i = 0 ; i < H ; i ++ )
    {
        list [ i ] = nextIntArray ( ) ;
    }

    // Read a second set of values and compute absolute differences.
    for ( var i = 0 ; i < H ; i ++ )
    {
        var tmp = nextIntArray ( ) ; // Temporary array for current row.

        for ( var j = 0 ; j < W ; j ++ )
        {
            // Calculate the absolute difference between corresponding elements.
            list [ i ] [ j ] = Math . abs ( list [ i ] [ j ] - tmp [ j ] ) ;
        }
    }

    // Define the maximum possible sum/difference value for DP states.
    // This 'max' value determines the size of the third dimension of the DP table.
    var max = 90 ;

    // Initialize the 3D dynamic programming table.
    // dp[i][j][k] will be true if a path exists from (0,0) to (i,j)
    // such that the sum of absolute differences along the path is 'k'.
    var dp = new Array ( H ) ;

    for ( var i = 0 ; i < H ; i ++ )
    {
        dp [ i ] = new Array ( W ) ;

        for ( var j = 0 ; j < W ; j ++ )
        {
            // Each cell contains an array of booleans, initialized to false.
            dp [ i ] [ j ] = new Array ( max ) . fill ( false ) ;
        }
    }


    // Base case: The starting cell (0,0).
    // A path to (0,0) exists with a sum equal to the value at list[0][0].
    dp [ 0 ] [ 0 ] [ list [ 0 ] [ 0 ] ] = true ;


    // Iterate through the grid to fill the DP table.
    for ( var i = 0 ; i < H ; i ++ )
    {
        for ( var j = 0 ; j < W ; j ++ )
        {
            // Skip the starting cell as it's handled by the base case.
            if ( i == 0 && j == 0 )
            {
                continue ;
            }

            // Case 1: First row (i == 0), move only from the left.
            if ( i == 0 )
            {
                // Iterate through all possible previous sums 'k'.
                for ( var k = 0 ; k < max ; k ++ )
                {
                    if ( dp [ i ] [ j - 1 ] [ k ] ) // If a path to (i, j-1) with sum 'k' exists.
                    {
                        // Calculate new sums by adding or subtracting the current cell's value.
                        // Mark these new sums as reachable for the current cell (i,j).
                        dp [ i ] [ j ] [ Math . abs ( k + list [ i ] [ j ] ) ] = true ;
                        dp [ i ] [ j ] [ Math . abs ( k - list [ i ] [ j ] ) ] = true ;
                    }
                }
            }
            // Case 2: First column (j == 0), move only from above.
            else if ( j == 0 )
            {
                // Iterate through all possible previous sums 'k'.
                for ( var k = 0 ; k < max ; k ++ )
                {
                    if ( dp [ i - 1 ] [ j ] [ k ] ) // If a path to (i-1, j) with sum 'k' exists.
                    {
                        // Calculate new sums.
                        dp [ i ] [ j ] [ Math . abs ( k + list [ i ] [ j ] ) ] = true ;
                        dp [ i ] [ j ] [ Math . abs ( k - list [ i ] [ j ] ) ] = true ;
                    }
                }
            }
            // Case 3: General case, can move from above or from the left.
            else
            {
                // Consider paths coming from the cell directly above (i-1, j).
                for ( var k = 0 ; k < max ; k ++ )
                {
                    if ( dp [ i - 1 ] [ j ] [ k ] ) // If a path to (i-1, j) with sum 'k' exists.
                    {
                        // Update reachable sums for (i,j).
                        dp [ i ] [ j ] [ Math . abs ( k + list [ i ] [ j ] ) ] = true ;
                        dp [ i ] [ j ] [ Math . abs ( k - list [ i ] [ j ] ) ] = true ;
                    }
                }

                // Consider paths coming from the cell directly to the left (i, j-1).
                for ( var k = 0 ; k < max ; k ++ )
                {
                    if ( dp [ i ] [ j - 1 ] [ k ] ) // If a path to (i, j-1) with sum 'k' exists.
                    {
                        // Update reachable sums for (i,j).
                        dp [ i ] [ j ] [ Math . abs ( k + list [ i ] [ j ] ) ] = true ;
                        dp [ i ] [ j ] [ Math . abs ( k - list [ i ] [ j ] ) ] = true ;
                    }
                }
            }
        }
    }


    // After filling the DP table, find the smallest reachable sum 'i' at the
    // bottom-right cell (H-1, W-1).
    for ( var i = 0 ; i < max ; i ++ )
    {
        if ( dp [ H - 1 ] [ W - 1 ] [ i ] )
        {
            myout ( i ) ; // Output the minimum sum.

            return ; // Terminate the Main function once the first valid sum is found.
        }
    }
}