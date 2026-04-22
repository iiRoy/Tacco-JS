/* This script operates in strict mode. */
"use strict"
    ;

// Define the main function that processes the input argument.
const   main =  ( arg ) =>   {
    /* Trim leading/trailing whitespace and split the input string by newlines. */
    arg  =  arg .  trim ( ) .  split ( "\n" ) ;

    // Parse the first line to extract N and K.
    const   N = parseInt ( arg [ 0 ] . split ( " " ) [ 0 ] ) ; // N is the first number.
    const   K = parseInt ( arg [ 0 ] . split ( " " ) [ 1 ] ) ; // K is the second number.

    /*
     * Process the second line of input.
     * Split by spaces and convert each part to an integer.
     */
    const   a = arg [ 1 ] . split ( " " ) . map ( n => parseInt ( n ) ) ;

    // Initialize a frequency list (or array) with a size of 200,000, filled with zeros.
    const   list = [ ... Array ( 200000 ) ] . fill ( 0 ) ;


    // Iterate through array 'a' to count frequencies of numbers.
    for  ( let  i  in  a )   {
        // Increment the count for the number at index 'i' in 'a'.
        list [ a [ i ] ] ++ ;
    } // End of frequency counting loop.


    // Sort the frequency list in descending order.
    list . sort ( ( a , b ) => b - a ) ;

    // Calculate and print the sum of elements from index K to the end of the sorted list.
    console . log ( list . slice ( K , list . length + 1 ) . reduce ( ( m , n ) => m + n ) ) ;
}   ; // End of the main function definition.

/*
 * Read input from standard input (/dev/stdin) using Node.js's 'fs' module.
 * Then, invoke the main function with the read content.
 */
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;