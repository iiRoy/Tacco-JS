'use strict' ;


/*
 * This module defines the core execution flow
 * for processing a single numerical input.
 * It strictly enforces modern JavaScript practices.
 */
function  performCalculation (  incomingText  )
{
    // Declare a constant to hold the numerical representation
    // of the provided input string.
    const    convertedNumber    =    Number(  incomingText  )   ;


    // Compute the result: the parsed value is squared,
    // and then this squared value is multiplied by a factor of three.
    // The final outcome is directed to the standard output stream.
    console.log (  Math.pow (  convertedNumber  ,   2  )   *   3   ) ;
}


// Kicking off the entire process.
// We acquire the raw data from the standard input file descriptor,
// decoding it as UTF-8, and then pass it to our primary function.
performCalculation (
    require (  'fs'  )
        .  readFileSync (
            '/dev/stdin'  ,
            'utf8'
        )
) ;