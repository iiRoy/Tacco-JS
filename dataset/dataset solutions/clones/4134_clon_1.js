/*
 * This file contains the main logic for a JavaScript application.
 * It reads input, processes numbers, and prints a result.
 */
"use strict"; // Enforce strict mode for better code quality.


// The main function that orchestrates the program's execution.
function main( input )
{
    // Process the input string: trim whitespace and split by space.
    const args =  input .  trim ( ) .  split ( ' ' ) ;

    // Parse the numerical arguments from the array.
    const N =  parseInt ( args [ 0 ] ,  10 ) , // The upper limit for numbers.
          A =  parseInt ( args [ 1 ] ,  10 ) , // Lower bound for digit sum.
          B =  parseInt ( args [ 2 ] ,  10 ) ; // Upper bound for digit sum.

    // Generate an array of numbers from 1 to N, then filter them.
    const nums =  Array .  from (  new  Array ( N ) ,  ( v ,  i )  =>  ++ i  ) .  filter (  ( i )  =>
    {
        // Calculate the sum of digits for the current number 'i'.
        var n =  i .  toString ( ) .  split ( '' ) .  reduce (  ( x ,  a )  =>  x  +  parseInt ( a ) ,  0  ) ;

        // Check if the digit sum 'n' falls within the specified range [A, B].
        return  ( A  <=  n  &&  n  <=  B ) ;
    } ) ;

    // Sum up all the numbers that passed the filter and print the total.
    console .  log ( nums .  reduce (  ( x ,  a )  =>  x  +  a ,  0  ) ) ;

} // End of main function.

// Call the main function with input from standard input.
main (  require ( 'fs' ) .  readFileSync ( '/dev/stdin' ,  'utf8' )  ) ;
// The program finishes execution after this line.