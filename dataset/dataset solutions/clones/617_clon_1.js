/* This JavaScript program processes input from standard input
   to perform a series of arithmetic operations.
   It reads an initial value and then applies operations
   (+,-,*,/) based on subsequent input lines. */

var  input   =   require ( 'fs' ) .  readFileSync ( '/dev/stdin'  ,   'utf8' ) ;


// The input string is trimmed and then split into an array of lines.
var   arr   =   (   input . trim ( )   ) . split ( "\n" ) ;

/*
 * Initialize the accumulator 'x' with the first number from the input array.
 * The '-0' is used to explicitly convert the string to a number.
 */
var   x   =   arr [ 0 ]   -   0 ;


// Loop through the array, starting from the second element (index 1).
// Each operation and its operand are on consecutive lines.
for ( var   i   =   1 ;   i   <   arr . length ;   i   =   i   +   2 )
{
    // Check for the termination condition: an equals sign.
    if   (   arr [ i ]   ==   "="   )
    {
        break ; // Exit the loop if '=' is encountered.
    }

    // Apply the addition operation if the operator is '+'.
    if   (   arr [ i ]   ==   "+"   )
    {
        x   +=   (   arr [ i   +   1 ]   -   0   ) ;
    }

    // Apply the subtraction operation if the operator is '-'.
    if   (   arr [ i ]   ==   "-"   )
    {
        x   -=   (   arr [ i   +   1 ]   -   0   ) ;
    }

    // Apply the multiplication operation if the operator is '*'.
    if   (   arr [ i ]   ==   "*"   )
    {
        x   *=   (   arr [ i   +   1 ]   -   0   ) ;
    }

    // Apply the division operation if the operator is '/'.
    if   (   arr [ i ]   ==   "/"   )
    {
        x   /=   (   arr [ i   +   1 ]   -   0   ) ;
    }


    // Ensure 'x' remains an integer after each operation.
    // This is important for operations like division.
    x   =   parseInt (   x   ) ;
}

// Finally, print the computed result to the console.
console . log (   x   ) ;