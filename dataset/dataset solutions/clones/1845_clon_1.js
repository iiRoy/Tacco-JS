// This file enforces strict parsing and execution rules for better code quality.
'use strict' ;


// Helper function 'p' to quickly log messages to the console.
const   p   =   s   =>  console.log(s)  ;


/*
 * Original commented-out variables for potential future use or debugging.
 * let a,b,c,d;
 */
// Another commented-out line, perhaps for parsing input.
// [a,b,c,d] = input[0].trim().split(" ").map(i => parseInt(i));


/**
 * The main function that processes the input array.
 * @param {string[]} input - An array of strings, typically read from stdin.
 */
function     main   (   input   )   {

    // Get the first line of input, trim it, and split into individual characters.
    let   N   =   input[0].trim().split("")  ;


    // Extract the last character, which determines the output.
    let   num   =   N.pop()   ;


    // Check the value of 'num' and print a corresponding string.
    if  (   num   ==   3   )   {
        // Case: num is 3
        p (   'bon'   )   ;
    }   else   if   (   num   ==   0   ||   num   ==   1   ||   num   ==   6   ||   num   ==   8   )   {
        // Case: num is 0, 1, 6, or 8
        p   (   'pon'   )   ;
    }   else   {
        // Default case for all other numbers
        p   (   'hon'   )   ;
    }

}


// Execute the main function with input from standard input.
// Reads the entire content, trims leading/trailing whitespace, and splits by newlines.
main  (  require ( 'fs' ) . readFileSync ( '/dev/stdin' ,  'utf8' ) . trim ( ) . split ( "\n" )  )  ;