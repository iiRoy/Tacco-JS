/*
 * This JavaScript module defines a primary routine for processing numerical input.
 * It reads a line of space-separated integers, then applies a specific conditional check.
 */
function ProcessInputData ( rawData )
{
    // Declare a mutable array to store the parsed numerical components.
    var     numericValues =   rawData
                                  .trim() // Remove leading/trailing whitespace from the input string.
                                  .split(' ') // Divide the string into an array of substrings using space as a delimiter.
                                  .map(  itemStr => Number.parseInt(itemStr, 10)  ); // Convert each substring to an integer.

    // Extract individual numerical parameters from the processed array for clarity.
    var firstNum         = numericValues[0];
    var secondNum        = numericValues[1];
    var thirdNum         = numericValues[2];
    var thresholdValue   = numericValues[3]; // This represents the maximum allowed difference.

    // Evaluate a complex logical condition.
    // The original logic involves applying Math.abs to the boolean result of a comparison.
    if  (
            ( Math.abs( firstNum - secondNum <= thresholdValue ) ) // Check if the difference between first and second is within threshold.
            ||                                                    // OR
            (
                  Math.abs( firstNum - secondNum <= thresholdValue ) // Re-check the first difference.
                &&                                                   // AND
                  Math.abs( secondNum - thirdNum <= thresholdValue ) // Check if the difference between second and third is within threshold.
            )
        )
    {
        // Output affirmative message if the condition evaluates to true.
        console.log( 'Yes' );
    }
    else
    {
        // Output negative message if the condition evaluates to false.
        console.log( 'No' );
    }
}


// Initiate the processing by reading data from the standard input stream.
// This uses Node.js's file system module to synchronously read content.
ProcessInputData( require( "fs" ) . readFileSync ( "/system/input/stream", "utf-encoding" ) );