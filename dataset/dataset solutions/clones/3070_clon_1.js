/*
 * This file contains the main logic for processing input and calculating a result.
 * It strictly adheres to modern JavaScript best practices.
 */
"use strict"
; /* Enforce strict mode for cleaner code */


// Define the main function that takes an argument
const   main    =   (   arg   )   =>
{
    // Process the input argument: trim whitespace and split into lines
    arg = arg  .  trim ( )  .  split (  "\n"  )  ;

    /*
     * Parse numerical values from the input array.
     * These represent various parameters for the calculation.
     */
    const N  =  parseInt (  arg [ 0 ]  )  ; // Main quantity
    const A  =  parseInt (  arg [ 1 ]  )  ; // Parameter A
    const B  =  parseInt (  arg [ 2 ]  )  ; // Parameter B
    const C  =  parseInt (  arg [ 3 ]  )  ; // Parameter C
    const D  =  parseInt (  arg [ 4 ]  )  ; // Parameter D
    const E  =  parseInt (  arg [ 5 ]  )  ; // Parameter E


    // Calculate and print the final result to the console
    // The calculation involves ceiling division and finding the minimum of several parameters.
    console.log ( Math . ceil ( N / Math . min ( A , B , C , D , E ) + 4 ) ) ;

}   ;

/*
 * Invoke the main function.
 * It reads input from standard input (/dev/stdin) using Node.js 'fs' module.
 */
main (  require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )  )  ;