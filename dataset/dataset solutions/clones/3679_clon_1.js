/*
 *  Utility functions for common operations.
 *  These are helper methods used throughout the script.
 */

var toInt  =  x  =>  parseInt ( x , 10 ) ; // Converts a string to an integer, using base 10.

var toIntArr = arr => arr . map ( x => toInt ( x ) ) ; // Transforms an array of strings into an array of integers.

var abs = x => x > 0 ? x : - x ; // Calculates the absolute value of a given number.


/**
 *  Finds the minimum value among a variable number of arguments.
 *  @returns {number} The smallest argument provided.
 */
function min ( )
{
    var rest = arguments,
        val = rest [ 0 ] ;

    for ( var i = 1 ; i < rest . length ; i ++ )
    {
        if ( rest [ i ] < val )
        {
            val = rest [ i ] ;
        }
    }

    return val ;
}


/**
 *  Finds the maximum value among a variable number of arguments.
 *  @returns {number} The largest argument provided.
 */
function max ( )
{
    var rest = arguments,
        val = rest [ 0 ] ;

    for ( var i = 1 ; i < rest . length ; i ++ )
    {
        if ( rest [ i ] > val )
        {
            val = rest [ i ] ;
        }
    }

    return val ;
}


// The main execution block of the program.
// Reads input from standard input and passes it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;


/*
 *  Primary function that encapsulates the core logic.
 *  It processes the input, performs calculations, and outputs a result.
 *  @param {string} input - The raw input string read from stdin.
 */
function Main ( input )
{
    var input = input . split ( ' ' ) ; // Split the input string into an array of strings.

    var a = toInt ( input [ 0 ] ) ; // Convert the first element to an integer.
    var b = toInt ( input [ 1 ] ) ; // Convert the second element to an integer.

    // Determine the answer based on specific conditions related to 'a' and 'b'.
    var ans = ( a + b === 15 ) ? '+' : ( a * b === 15 ) ? '*' : 'x' ;

    console . log ( ans ) ; // Output the final determined answer to the console.
}