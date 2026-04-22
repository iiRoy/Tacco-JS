/*
 *  This file processes two numbers from standard input
 *  and calculates a specific mathematical expression.
 *
 *  The input is expected to be a single line containing
 *  two space-separated integers.
 */


// Declare a variable 'inp' to store the parsed input.
inp = require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) . split ( '\n' ) [ 0 ] . split ( ' ' )


// Retrieve the first number from the input array.
// The 'shift()' method removes the first element from 'inp' and returns it.
// Multiplying by 1 explicitly converts the string to a number.
n = inp . shift ( ) *   1


/*
 *  Retrieve the second number from the modified 'inp' array.
 *  After 'n' is extracted, 'inp' contains the remaining elements.
 *  Again, multiplication by 1 ensures numeric type.
 */
m = inp . shift ( ) *   1


// Perform the final calculation: (n - 1) multiplied by (m - 1).
// The result of this operation is then output to the console.
console . log ( ( n   -   1 ) * ( m   -   1 ) )