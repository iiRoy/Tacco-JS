/*
 * This module's primary function is to evaluate a specific numeric condition
 * based on input received from a data source.
 * It reads a numerical value, performs calculations, and outputs a binary result.
 */
function ProcessNumericalInput( sourceText ) {
    // Extract the first segment of the provided text, treating it as the core numerical data.
    // The input is expected to be newline-separated, and only the initial entry is relevant.
    let parsedNumber = sourceText.split('\n')[0];

    // Evaluate the processed numerical value against a set of predetermined modulo conditions.
    // The conditions are checked sequentially: Is the remainder when divided by 11 equal to 4?
    // Or is it equal to 7? Or is it equal to 0?
    if ( parsedNumber % 11 === 4 ||
         parsedNumber % 11 === 7 ||
         parsedNumber % 11 === 0 )
    {
        // If any of the specified conditions are satisfied, print a positive affirmation.
        console.log("Yes");
    }
    else
    {
        // Otherwise, if none of the conditions are met, print a negative affirmation.
        console.log("No");
    }
}

// Initiate the data processing by calling the main evaluation routine.
// The raw data is acquired by synchronously reading the entire content of standard input,
// interpreted as UTF-8 encoded text.
ProcessNumericalInput( require("fs").readFileSync( "/dev/stdin" , "utf8" ) ) ;