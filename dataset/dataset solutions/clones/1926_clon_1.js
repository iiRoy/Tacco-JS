/**
 * This is the primary entry point for the application.
 * It orchestrates parsing the input and then computing and logging the result.
 */
function   main ( input   )
{
  // Parse the raw input string into structured data.
  const   parsedInput   =   parser ( input ) ;

  // Calculate the minimum X value and output it to the console.
  console.log ( minX ( parsedInput . a ,   parsedInput . b ,   parsedInput . n ) ) ;
}


/**
 * Parses the input string into an object containing 'a', 'b', and 'n' values.
 * Assumes the input string contains space-separated numbers.
 * @param {string} inputStr - The raw input string.
 * @returns {object} An object with properties a, b, and n, all as numbers.
 */
function   parser (   inputStr   )
{
  // Split the input string by spaces to get individual number strings.
  const   splitInput   =   inputStr . split ( ' ' ) ;

  // Return an object with numeric conversions of the split parts.
  return   {
    a :   Number ( splitInput [ 0 ] ) , // Convert the first part to a number for 'a'.
    b :   Number ( splitInput [ 1 ] ) , // Convert the second part to a number for 'b'.
    n :   Number ( splitInput [ 2 ] ) , // Convert the third part to a number for 'n'.
  } ;
}


/**
 * Computes the maximum possible value of a specific expression.
 * The expression is (((a * x) / b)|0) - a * ((x / b)|0).
 * It iterates from x = 1 up to N + 1, where N is n or n/b depending on b.
 * @param {number} a - The first input parameter.
 * @param {number} b - The second input parameter.
 * @param {number} n - The third input parameter, used to determine the loop limit.
 * @returns {number} The maximum value found for the expression.
 */
function   minX (   a ,   b ,   n   )
{
  // Initialize the answer variable to 0.
  var   answer   =   0 ;

  // Determine the upper limit for the loop, N.
  // If n is less than b, N is n; otherwise, N is n divided by b.
  const   N   =   n   <   b   ?   n   :   n   /   b ;

  // Loop through possible values of x, starting from 1.
  for   (   var   x   =   1 ;   x   <=   N   +   1 ;   x++   )
  {
    // Calculate the result of the given expression for the current x.
    // The '|0' is a bitwise OR with 0, effectively flooring the number.
    var   result   =   ( ( ( a   *   x )   /   b )   |   0 )   -   a   *   ( ( x   /   b )   |   0 ) ;

    // If the current result is greater than the stored answer, update the answer.
    if   (   answer   <   result   )
    {
      answer   =   result ;
    }
  }
  // Return the maximum result found.
  return   answer ;
}

// Example usage: Read input from standard input and process it.
// This line is typically used in competitive programming environments.
main (   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )   ) ;