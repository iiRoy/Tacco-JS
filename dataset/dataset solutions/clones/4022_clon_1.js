/*
 * This file contains a JavaScript program
 * that solves a specific problem.
 * It reads input, performs calculations,
 * and prints a result to the console.
 */


// Define the main function that processes the input argument.
function   main (   arg   )
{

    // Parse the price from the first line of the input string.
    const   price    =    parseInt (   arg .split ( "\n" ) [0]   )   ;


    // Parse the 'dama1' value from the second line of the input string.
    const   dama1    =    parseInt (   arg .split ( "\n" ) [1]   )   ;


    // Check if the remainder of price divided by 500 is less than or equal to dama1.
    // If the condition is true, print "YES"; otherwise, print "NO".
    console .log (   price   %   500   <=   dama1   ?   "YES"   :   "NO"   )   ;

}


// Execute the main function by reading input from standard input.
// This uses the Node.js 'fs' module to read the file synchronously
// and decode it as UTF-8.
main (   require ( "fs" ) .readFileSync ( "/dev/stdin" ,   "utf8" )   )   ;