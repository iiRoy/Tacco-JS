/*
 * This module processes a single numerical input
 * from standard input, performs a calculation,
 * and outputs the result.
 */
function processInputData ( rawDataString )
{
    // Convert the raw string input into a floating-point number representation.
    let numericValue = parseFloat ( rawDataString ) ;

    // Compute the cube of one-third of the parsed numerical value, then display it.
    console . log ( Math . pow ( numericValue / 3 , 3 ) ) ;
}


// Initiate the primary processing function, sourcing its data
// by reading the entire content of standard input as a UTF-8 string.
processInputData ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;