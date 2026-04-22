"use strict"
;

// This is a Type I clone of the original JavaScript code.
// Only whitespace and comments have been altered.

// Define a variable to hold the input read from standard input.
var input = require( "fs" ) . readFileSync( "/dev/stdin" , "utf8" )
;

// 'cin' will store the input tokens, split by spaces or newlines.
// 'cid' is the current index for 'cin', initialized to 0.
var cin = input . split( / |\n/ ) ,
    cid = 0
;

// Function to get the next token from the input array.
// If 'a' is true, it returns the token as a string.
// Otherwise, it converts the token to a number using the unary plus operator.
function next(a) {
    return a
        ? cin[cid++] // Return as string
        : +cin[cid++] // Return as number
    ;
}

// Function to read 'n' consecutive tokens from the input.
// If 'a' is true, it returns an array of strings.
// Otherwise, it returns an array of numbers after mapping.
function nexts(n, a) {
    // Slice the array from 'cid' up to 'cid + n', and then increment 'cid' by 'n'.
    return a
        ? cin.slice(cid, cid += n) // Array of strings
        : cin.slice(cid, cid += n).map(a => +a) // Array of numbers
    ;
}

/*
 *  This function reads a matrix (2D array) of 'h' rows and 'w' columns.
 *  The 'a' parameter determines if the elements are returned as strings (true)
 *  or numbers (false).
 */
function nextm(h, w, a)
{
    var r = [], // Initialize an empty array to store the rows of the matrix.
        i = 0   // Loop counter for rows.
    ;

    if (a)
    {
        // If 'a' is true, each row is an array of string tokens.
        for (; i < h; i++)
        {
            r.push(cin.slice(cid, cid += w));
        }
    }
    else
    {
        // If 'a' is false, each row is an array of numeric tokens.
        for (; i < h; i++)
        {
            r.push(cin.slice(cid, cid += w).map(a => +a));
        }
    }
    return r; // Return the completed matrix.
}

/*
 *  A flexible utility function for creating multi-dimensional arrays.
 *  The first argument 'v' is the initial value for the innermost elements.
 *  Subsequent arguments define the dimensions of the array.
 *  It dynamically constructs and evaluates a string to create the array.
 */
function xArray ( v )
{
    var a = arguments , // The 'arguments' object contains all parameters passed to the function.
        l = a . length , // 'l' is the total number of arguments.
        // Start building the 'eval' string from the innermost array.
        r = "Array(a[" + --l + "]).fill().map(x=>{return " + v + ";})"
    ;

    // Loop backward through the dimensions to wrap the array creation.
    while ( --l )
    {
        r = "Array(a[" + l + "]).fill().map(x=>" + r + ")"
    ;
    }

    // Execute the constructed string to create and return the multi-dimensional array.
    return eval(r)
    ;
}


// Call the main logic function and store its return value.
var myOut = main()
;

// If 'myOut' is not undefined, print it to the console.
// This ensures that functions that don't explicitly return a value
// (and thus return `undefined`) don't print anything.
if ( myOut !== undefined )
{
    console . log( myOut )
;
}


// The main function encapsulating the problem's core logic.
function main ( )
{
  // A predefined array of numbers. This appears to be a lookup table.
  var a = [
      1, 1, 1, 2, 1, 2, 1, 5,
      2, 2, 1, 5, 1, 2, 1, 14,
      1, 5, 1, 5, 2, 2, 1, 15,
      2, 2, 5, 4, 1, 4, 1, 51
  ]
  ;

  // Read a single integer 'k' from the input using the 'next' helper.
  var k = next( )
  ;

  // Return the element from array 'a' at index 'k-1'.
  // This suggests 'k' is a 1-based index from the problem statement.
  return a [ k - 1 ]
  ;
}
// End of the entire JavaScript program.