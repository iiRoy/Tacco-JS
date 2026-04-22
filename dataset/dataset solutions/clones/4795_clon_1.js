"use strict" ; /* Enable strict mode for cleaner code */

/* Variable declaration for input reading */
var input = require( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ;

var cin = input . split ( / |\n/ ) , // Split input by space or newline
  cid = 0 ;


/**
 * Reads the next token from the input stream.
 * Increments the global cursor ID.
 *
 * @param {boolean} a - If true, returns the token as a string.
 *                      Otherwise, attempts to convert it to a number.
 * @returns {string|number} The next token from the input.
 */
function next ( a )
{
  return a ? cin [ cid ++ ] : + cin [ cid ++ ] ;
}

/**
 * Reads a specified number of tokens from the input stream
 * and returns them as an array.
 *
 * @param {number} n - The count of tokens to read.
 * @param {boolean} a - If true, returns an array of strings.
 *                      Otherwise, returns an array of numbers.
 * @returns {Array<string|number>} An array containing the read tokens.
 */
function nexts ( n , a ) {
  return a ? cin . slice ( cid , cid += n ) : cin . slice ( cid , cid += n ) . map ( a => + a ) ;
}


/**
 * Reads a 2D matrix (array of arrays) of tokens from the input.
 *
 * @param {number} h - The number of rows (height) of the matrix.
 * @param {number} w - The number of columns (width) of each row.
 * @param {boolean} a - If true, cells are strings; otherwise, cells are numbers.
 * @returns {Array<Array<string|number>>} The constructed 2D matrix.
 */
function nextm ( h , w , a )
{
  var r = [ ] , // Initialize the result array for rows
    i = 0 ; // Loop counter for rows

  if ( a ) {
    // If 'a' is true, read each row as an array of strings
    for ( ; i < h ; i ++ )
      r . push ( cin . slice ( cid , cid += w ) ) ;
  }
  else {
    // Otherwise, read each row and map elements to numbers
    for ( ; i < h ; i ++ )
      r . push ( cin . slice ( cid , cid += w ) . map ( a => + a ) ) ;
  }

  return r ; // Return the completed matrix
}


/**
 * Dynamically creates a multi-dimensional array based on provided dimensions.
 * The last argument specifies the initial value for the innermost elements.
 *
 * @param {*} v - The initial value for the elements of the innermost array.
 * @returns {Array} The multi-dimensional array generated.
 */
function xArray ( v ) {
  var a = arguments , // All arguments passed to the function
    l = a . length , // Total number of arguments
    // Construct the string for the innermost array creation
    r = "Array(a[" + -- l + "]).fill().map(x=>{return " + v + ";})" ;

  // Iteratively wrap with outer array creations
  while ( -- l )
    r = "Array(a[" + l + "]).fill().map(x=>" + r + ")" ;

  return eval ( r ) ; // Evaluate the constructed string to create the array
}


/* Call the main function and store its result */
var myOut = main ( ) ;

// If the main function returned a value (i.e., not undefined), print it to console
if ( myOut !== undefined )
{
  console . log ( myOut ) ;
}


/**
 * The primary execution logic of the program.
 * Calculates an answer based on input values.
 *
 * @returns {number} The final calculated answer.
 */
function main ( )
{
  // Read 7 numerical inputs into an array 'a'
  var a = nexts ( 7 ) ;

  /*
   * Calculate an initial answer:
   * It's 'a[1]' plus twice the sum of integer divisions of 'a[0]', 'a[3]', and 'a[4]' by 2.
   * The '|0' is a bitwise OR with 0, effectively performing a floor operation for positive numbers.
   */
  var ans = a [ 1 ] + ( ( a [ 0 ] / 2 | 0 ) + ( a [ 3 ] / 2 | 0 ) + ( a [ 4 ] / 2 | 0 ) ) * 2 ;

  // Use a switch statement to modify 'ans' based on the parity of specific elements.
  // The expression sums the remainders when a[0], a[3], and a[4] are divided by 2.
  switch ( a [ 0 ] % 2 + a [ 3 ] % 2 + a [ 4 ] % 2 )
  {
    case 3 : // If all three (a[0], a[3], a[4]) are odd
      ans += 3 ; // Add 3 to the answer
      break ;

    case 2 : // If exactly two of them are odd
      // If the product of a[0], a[3], and a[4] is non-zero (meaning none of them are zero)
      if ( a [ 0 ] * a [ 3 ] * a [ 4 ] )
        ans += 1 ; // Add 1 to the answer
      break ;
  }

  // Return the final computed answer
  return ans ;
}