(function ProcessInputData( incomingData ) {
    /*
     * The 'incomingData' parameter initially holds the raw string content.
     * We'll proceed to tokenize this string by splitting it based on space characters.
     */
    var processedTokens = incomingData.split( ' ' );


    // Extract the first numeric component from the tokenized array.
    // The '- 0' operation explicitly converts the string token into a number.
    var valA = processedTokens[0] - 0;


    // Extract the second numeric component, also converting it to a number.
    var valB = processedTokens[1] - 0;


    // Perform a conditional calculation.
    // If 'valA' is 10 or greater, 'finalOutcome' is set to 'valB'.
    // Otherwise, a specific arithmetic formula is applied to determine 'finalOutcome'.
    var finalOutcome = valA >= 10
                         ? valB // Case 1: valA is sufficiently large.
                         : valB + 100 * ( 10 - valA ); // Case 2: valA is smaller, apply adjustment.


    // Display the computed result to the standard output stream.
    console.log( finalOutcome );
} )
// The input for this immediately invoked function expression (IIFE)
// is obtained by reading the entire content of '/dev/stdin' as a UTF-8 string,
// using Node.js's built-in file system module.
( require("fs").readFileSync( "/dev/stdin", "utf8" ) );