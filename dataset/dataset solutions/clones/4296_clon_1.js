/*
 * This script reads three numbers from standard input,
 * converts them to numeric types, and then
 * prints one of them based on a specific comparison logic.
 */

// Initialize a variable to store the processed input.
inp = require('fs') . readFileSync ( '/dev/stdin' ,  'utf8' ) . split ( '\n' ) [ 0 ] . split ( ' ' )

// Extract the first number from the input array and convert it to a numeric type.
A  =  inp [ 0 ]  *  1

// Extract the second number from the input array and convert it to a numeric type.
B  =  inp [ 1 ]  *  1

// Extract the third number from the input array and convert it to a numeric type.
C  =  inp [ 2 ]  *  1

// Perform a conditional check and log the result to standard output.
// The logic determines which of the three numbers (A, B, or C) to print.
// If A is equal to B, then C is printed.
// Otherwise, if A is equal to C, then B is printed.
// In all other cases (i.e., A is not equal to B and A is not equal to C), A is printed.
console . log ( A  ==  B  ?  C  :  A  ==  C  ?  B  :  A )

/*
 * End of script execution.
 * The output will be one of the three input numbers
 * based on the equality checks performed.
 */