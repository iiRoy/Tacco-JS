/*
 * This JavaScript file contains logic to process a 3x3 matrix.
 * It's designed to read input from standard input, parse it, and
 * then perform a specific check based on row and column minimums.
 *
 * This is a Type I clone, meaning only whitespace and comments
 * have been altered from the original source code.
 */


// First, we declare and initialize the 'box' variable.
// It reads input from the standard input stream ('/dev/stdin'),
// decodes it as UTF-8, splits it into lines, and then
// further processes each line to create a 2D array of integers.
var   box   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )
    . split ( '\n' )                                             // Splits the input string into an array of strings by newline character.
    . map ( e   =>   e . split ( ' ' ) . map ( e   =>   parseInt ( e ) ) ) ; // For each line, splits by space, then converts each part to an integer.


// Next, we compute array 'a'. This array stores the minimum value
// found in each corresponding row of the 'box' matrix.
var   a   =   [
    Math . min ( box [ 0 ] [ 0 ] ,   box [ 0 ] [ 1 ] ,   box [ 0 ] [ 2 ] ) , // Minimum of the first row.
    Math . min ( box [ 1 ] [ 0 ] ,   box [ 1 ] [ 1 ] ,   box [ 1 ] [ 2 ] ) , // Minimum of the second row.
    Math . min ( box [ 2 ] [ 0 ] ,   box [ 2 ] [ 1 ] ,   box [ 2 ] [ 2 ] )   // Minimum of the third row.
] ;


// Similarly, we compute array 'b'. This array stores the minimum value
// found in each corresponding column of the 'box' matrix.
var   b   =   [
    Math . min ( box [ 0 ] [ 0 ] ,   box [ 1 ] [ 0 ] ,   box [ 2 ] [ 0 ] ) , // Minimum of the first column.
    Math . min ( box [ 0 ] [ 1 ] ,   box [ 1 ] [ 1 ] ,   box [ 2 ] [ 1 ] ) , // Minimum of the second column.
    Math . min ( box [ 0 ] [ 2 ] ,   box [ 1 ] [ 2 ] ,   box [ 2 ] [ 2 ] )   // Minimum of the third column.
] ;


// Initialize the result variable. By default, we assume the condition is met.
var   res   =   'Yes' ;


// Now, we iterate through the 'box' matrix using nested loops.
// The loops will terminate early if 'res' becomes 'No'.
for   ( var   i   =   0 ;   res   ! =   'No'   &&   i   <   3 ;   i ++ )
{
 for   ( var   j   =   0 ;   res   ! =   'No'   &&   j   <   3 ;   j ++ )
 {
  // For each element box[i][j], we check if it is equal to the sum of a[i] and b[j].
  // If this condition is *not* met, it implies the property we are checking for is false.
  // In that case, we set 'res' to 'No'. Otherwise, we do nothing and continue.
  box [ i ] [ j ]   ! =   ( a [ i ]   +   b [ j ] )   ?   res   =   'No'   :   '' ;
 } // End of inner loop (column iteration)
} // End of outer loop (row iteration)


// Finally, print the determined result to the console.
console . log ( res ) ;

// End of the JavaScript program.
// This clone demonstrates extensive use of whitespace and comments
// while preserving the exact logical structure and identifiers.