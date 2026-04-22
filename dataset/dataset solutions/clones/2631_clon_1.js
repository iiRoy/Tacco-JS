/*
 * This JavaScript code snippet defines a main function that processes input
 * to perform a specific calculation involving reciprocals of numbers.
 * The input is expected to consist of multiple lines, where the first line
 * indicates a count and the second line contains space-separated numbers.
 *
 * This file demonstrates basic input parsing, loop iteration, and arithmetic
 * operations in JavaScript.
 *
 * Developed as a Type I clone example, focusing on whitespace and comments.
 */

function   main  (  input  )
{

    //  The input string is first split into an array of lines.
    //  Each line becomes an element in the 'args' array.
    const   args   =   input . split ( "\n" ) ;


    //  Extract the first line, which is expected to be a number (N).
    //  N will determine how many subsequent numbers to process.
    const   N   =   args [ 0 ] ;


    //  Extract the second line, which contains space-separated numbers (A).
    const   A   =   args [ 1 ] ;


    //  Split the string 'A' by spaces to get an array of individual number strings.
    const   An   =   A . split ( " " ) ;


    //  For debugging or verification, print the first element from the 'An' array.
    console . log ( An [ 0 ] ) ;

    //  Also print the second element from the 'An' array.
    console . log ( An [ 1 ] ) ;


    //  Initialize a variable 'SUM' to accumulate the sum of reciprocals.
    var   SUM   =   0 ;


    //  Begin a loop that iterates 'N' times.
    //  The loop variable 'i' serves as an index for accessing elements in 'An'.
    for ( var   i   =   0 ;   i   <   N ;   i ++ )
    {
        //  Inside the loop, calculate the reciprocal of the current number (An[i]).
        //  Add this reciprocal to the running total 'SUM'.
        //  JavaScript will implicitly convert An[i] from string to number for the division.
        SUM   =   SUM   +   ( 1   /   An [ i ] ) ;
    }


    //  After the loop completes, calculate the reciprocal of the final 'SUM'.
    //  This is the ultimate result of the computation.
    console . log ( 1   /   SUM ) ;
}


//  This section handles the execution of the main function.
//  It reads content from standard input, typically from a file or piped data.
//  The 'fs' module is used for file system operations.
//  readFileSync reads the entire file synchronously.
//  '/dev/stdin' is the standard input stream in Unix-like systems.
//  The content is decoded as UTF-8 and then passed to the 'main' function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" ) ) ;