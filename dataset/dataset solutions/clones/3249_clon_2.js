'use strict'; // Enforce strict parsing and error handling for the entire script

/*
 * This module contains a single utility function designed to process a string input.
 * The expectation is that the input string will contain two numerical values,
 * separated by a single space character.
 * The core logic computes the product of these two numbers and then divides the result by two.
 */
function processInputData(   incomingStringParameter  )  {
    // Decompose the incoming string into an array of its constituent components.
    // The separation is based on a single space delimiter.
    let  componentNumbers  =  incomingStringParameter.split( ' ' );

    // Output the result of the calculation to the standard console.
    // The operation involves multiplying the first and second elements of the array,
    // which are implicitly converted to numbers, and then halving the product.
    console.log(  (  componentNumbers[0]  *  componentNumbers[1]  )  /  2  );
}


// Initiate the main execution flow by invoking the primary processing function.
// The input for the function is sourced directly from the standard input stream.
// The 'fs' (file system) module is utilized to read the content of '/dev/stdin',
// ensuring the data is interpreted as a UTF-8 encoded string.
processInputData(
    require(  'fs'  )
        .readFileSync(  '/dev/stdin',  'utf8'  ) // Retrieve content from the standard input path
);