/*
 * This JavaScript program demonstrates fundamental operations:
 * - Reading input from standard I/O.
 * - Basic array manipulation.
 * - Type conversion.
 * - Conditional logic using a ternary operator.
 * - Outputting results to the console.
 */


// --- Input Processing Phase ---

// The 'require' function loads the 'fs' (file system) module.
// 'readFileSync' reads the content of the specified file synchronously.
// '/dev/stdin' is the standard input stream on Unix-like systems.
// 'utf8' specifies the character encoding.
// '.split('\n')[0]' takes the first line of the input.
// '.split(' ')' then further splits that first line by spaces, creating an array of strings.
inp   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) . split ( '\n' ) [ 0 ] . split ( ' ' ) ;


    /*
     * Now, we extract the two numerical values from the 'inp' array.
     * The 'shift()' method removes the first element from the array
     * and returns it. This modifies the 'inp' array in place.
     * The '* 1' operation is a common JavaScript idiom to explicitly
     * convert a string to a number.
     */

// Assign the first number extracted from the input array to variable 'A'.
A   =   inp . shift ( )   *   1 ;


// Assign the second number extracted from the input array to variable 'B'.
B   =   inp . shift ( )   *   1 ;


// --- Output Calculation and Display Phase ---

// 'console.log' is used to print the final result to standard output.
/*
 * The expression inside 'console.log' performs a conditional calculation:
 * - It first calculates the sum of A and B.
 * - It then checks if this sum is greater than 24.
 * - If the sum is greater than 24, it subtracts 24 from the sum (e.g., for time wrapping around a 24-hour clock).
 * - Otherwise (if the sum is 24 or less), it simply uses the sum itself.
 * This is an example of a ternary operator (condition ? value_if_true : value_if_false).
 */
console . log (   A   +   B   >   24   ?   A   +   B   -   24   :   A   +   B   ) ;

// End of the program.