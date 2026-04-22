/*
 * This script reads three numbers from standard input
 * and performs a conditional operation based on the first number.
 * It's a simple demonstration of input parsing and conditional logic.
 */


// Initialize the input processing by reading from stdin.
// The readFileSync method reads the entire file synchronously.
// The content is then split into an array of lines.
inp    =     require  ( 'fs' ) . readFileSync  (  '/dev/stdin'  ,  'utf8'  ) . split  (  '\n'  ) ;


/*
 * The first line of input is expected to be a number N.
 * We use shift() to remove it from the array and convert it to a number
 * by multiplying by 1.
 */
N  =  inp . shift  ( ) *  1 ;


// The second line of input is expected to be a number A.
// It's also converted to a numeric type.
A   =   inp . shift ( )   *   1 ;


// The third line of input is expected to be a number B.
// Converted to a number as well.
B    =    inp . shift ( )    *    1 ;


/*
 * Finally, we print the result to the console.
 * If N is exactly 1, it prints "Hello World".
 * Otherwise, it calculates the sum of A and B and prints that.
 */
console . log  (  N  ==  1  ?  'Hello World'  :  A  +  B  ) ;