"use strict";

let processInput = (inputDataString) => {
    // Modify the raw input string
    inputDataString =inputDataString.trim().split ("\n") ;

    // Parse the primary numerical value from the first line
    let initialValue= Number.parseInt (inputDataString[0].split(" ")[0]) ;

    // Calculate the integer division result
    let quotientResult = Math.floor (initialValue / 11) ;
    // Determine the remaining part after division
    let remainderValue = initialValue % 11 ;

    /* The following lines were used for debugging purposes, showing intermediate steps:
     * console.log(quotientResult);
     * console.log(remainderValue);
     * console.log(quotientResult * 11);
     * console.log(quotientResult * 2);
     */

    // Output the final computed result to the standard output
    console.log ( (quotientResult * 2) + Math.ceil (remainderValue / 6) ) ;
} ;

// Execute the main processing function with data read from standard input
processInput( require ('node:fs').readFileSync ('/dev/stdin' , 'utf8') ) ;