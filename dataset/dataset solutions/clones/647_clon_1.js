/*
 * This JavaScript code reads input, processes it to extract numerical values,
 * and then calculates a minimum cost based on specific conditions.
 *
 * The input is expected from standard input, typically '/dev/stdin' in environments
 * like competitive programming platforms.
 */


// First, we read the entire content of the standard input.
// The 'fs' module is used for file system operations.
var   input   =   require   (   'fs'   ) . readFileSync   (   '/dev/stdin'   ,   'utf8'   ) ;


/*
 * After reading the input, we prepare it for parsing.
 * - 'trim()' removes any leading or trailing whitespace characters.
 * - 'split("\n")' then divides the input string into an array of strings,
 *   where each element represents a line from the input.
 */
var   arr   =   input . trim ( ) . split ( "\n" ) ;


// The first line of the input typically contains the main parameters for the problem.
// We extract these parameters using array destructuring.
// 'arr.shift()' removes and returns the first element of the array (the first line).
// This line is then split by spaces, and each resulting string is converted to a Number.
var   [   n   ,   a   ,   b   ,   c   ,   d   ]   =   arr . shift ( ) . split ( " " ) . map ( Number ) ;


// Initialize a variable 'min' to store the minimum cost found so far.
// We set it to 'Infinity' so that any valid calculated cost will be smaller
// and correctly update 'min' in the subsequent loops.
var   min   =   Infinity   ;


// This is the first loop to calculate a potential minimum cost.
// It iterates 'i' from 0 up to 1000.
// The condition 'a * i >= n' checks if buying 'i' units of the first type
// (where 'a' is the quantity per unit) meets or exceeds the required total 'n'.
// If the condition is met, 'Math.min' updates 'min' with the smaller of its current value
// and the cost 'b * i' (where 'b' is the cost per unit of the first type).
for   (   var   i   =   0   ;   i   <=   1000   ;   i   ++   )
{
  if   (   a   *   i   >=   n   )
  {
    min   =   Math . min   (   min   ,   b   *   i   )   ;   // Update min if a cheaper option is found.
  }
}


// This is the second loop, similar to the first, but using different parameters.
// It iterates 'i' from 0 up to 1000 again.
// The condition 'c * i >= n' checks if buying 'i' units of the second type
// (where 'c' is the quantity per unit) meets or exceeds the required total 'n'.
// If this condition is met, 'Math.min' updates 'min' with the smaller of its current value
// and the cost 'd * i' (where 'd' is the cost per unit of the second type).
for   (   var   i   =   0   ;   i   <=   1000   ;   i   ++   )
{
  if   (   c   *   i   >=   n   )
  {
    min   =   Math . min   (   min   ,   d   *   i   )   ;   // Check for another potential minimum cost.
  }
}


// Finally, print the calculated minimum cost to the console.
// This will be the smallest cost determined by considering both types of items.
console . log   (   min   )   ;