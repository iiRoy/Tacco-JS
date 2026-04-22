/* This is a Type I clone of the original code. */
/* It maintains exact logical and structural identity. */
/* Only whitespace and comments have been altered. */

"use strict" ; // Enforce strict mode for cleaner code.


var input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ; // Read all input from stdin.


var cin = input . split ( / |\n/ ) , // Split input by spaces or newlines.
    cid = 0 ; // Initialize current index for input array.

/*
 * Function to get the next item from the input.
 * If 'a' is true, return string; otherwise, return number.
 */
function next ( a )
{
    return a
           ? cin [ cid++ ] /* Return string value */
           : + cin [ cid++ ] ; /* Return numeric value */
}

/*
 * Function to get a slice of 'n' items from the input.
 * If 'a' is true, return array of strings; otherwise, map to numbers.
 */
function nexts ( n , a )
{
    return a
           ? cin . slice ( cid , cid += n ) /* Return string array */
           : cin . slice ( cid , cid += n ) . map ( a => + a ) ; /* Return number array */
}

/*
 * Function to read a 2D matrix of dimensions h x w.
 * If 'a' is true, return array of string arrays; otherwise, map to numbers.
 */
function nextm ( h , w , a )
{
    var r = [ ] , // Initialize result array.
        i = 0 ;   // Initialize loop counter.

    if ( a )
    {
        for ( ; i < h ; i++ )
        {
            r . push ( cin . slice ( cid , cid += w ) ) ; // Add row of strings.
        }
    }
    else
    {
        for ( ; i < h ; i++ )
        {
            r . push ( cin . slice ( cid , cid += w ) . map ( a => + a ) ) ; // Add row of numbers.
        }
    }

    return r ; // Return the parsed matrix.
}

/*
 * Function to create a multi-dimensional array.
 * 'v' is the initial value/expression for the innermost array elements.
 * Remaining arguments define dimensions.
 * This function uses 'eval', which should be used with caution.
 */
function xArray ( v )
{
    var a = arguments , // Get all arguments.
        l = a . length , // Get number of arguments.
        r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})" ; // Build innermost array creation string.

    while ( --l )
    {
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ; // Wrap with outer array creation string.
    }

    return eval ( r ) ; // Evaluate the generated string to create the array.
}


// Call the main logic function.
var myOut = main ( ) ;


// If main() returned a value, print it to console.
if ( myOut !== undefined )
{
    console . log ( myOut ) ;
}


/*
 * The primary function containing the problem's core logic.
 * It reads three numbers and checks a specific mathematical condition.
 */
function main ( )
{
    var a = next ( ) , // Read first number.
        b = next ( ) , // Read second number.
        c = next ( ) ; // Read third number.

    // Check if sqrt(a) + sqrt(b) is less than sqrt(c).
    return Math . sqrt ( a ) + Math . sqrt ( b ) < Math . sqrt ( c )
           ? "Yes" // Condition is true.
           : "No" ; // Condition is false.
}