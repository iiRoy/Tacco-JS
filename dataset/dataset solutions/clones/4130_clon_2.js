'use strict'; // Enforce strict mode for cleaner code practices.

/**
 * Executes the primary data processing task.
 * This function takes raw input, parses it, performs
 * a sum comparison, and then logs the outcome.
 *
 * @param {string} inputPayload - The raw string data received from standard input.
 */
function executeProcessing( inputPayload )
{

    // First, process the raw input string:
    // 1. Split the entire payload by newline characters to get individual lines.
    // 2. Select only the very first line from the split array.
    // 3. Split that chosen line by space characters to obtain individual string tokens.
    let parsedTokens = inputPayload
                         .split('\n')    // Divide the input into an array of lines.
                         [0]             // Access the initial line (index 0).
                         .split(' ');    // Break the selected line into tokens based on spaces.

    // Extract four numerical values from the tokenized segments.
    // Using parseInt with radix 10 to ensure integer conversion from string.
    const firstValue  = parseInt( parsedTokens[0], 10 ); // Obtain the first numeric component from the tokens.
    const secondValue = parseInt( parsedTokens[1], 10 ); // Obtain the second numeric component.
    const thirdValue  = parseInt( parsedTokens[2], 10 ); // Obtain the third numeric component.
    const fourthValue = parseInt( parsedTokens[3], 10 ); // Obtain the fourth numeric component.

    // Calculate the total sum for the initial pair of numbers.
    const sumOfFirstPair  = firstValue + secondValue;

    // Calculate the total sum for the subsequent pair of numbers.
    const sumOfSecondPair = thirdValue + fourthValue;

    // Initialize a string variable to hold the final comparison result message.
    let comparisonOutcome = '';

    // Perform conditional checks to determine the relationship between the two calculated sums.
    // The control flow here ensures only one outcome is assigned.
    if ( sumOfFirstPair > sumOfSecondPair )
    {
        comparisonOutcome = 'HigherLeft';    // If the sum of the first pair is greater.
    }
    if ( sumOfFirstPair < sumOfSecondPair )
    {
        comparisonOutcome = 'HigherRight';   // If the sum of the second pair is greater.
    }
    if ( sumOfFirstPair === sumOfSecondPair )
    {
        comparisonOutcome = 'EqualAmounts';  // If both sums are numerically identical.
    }

    // Output the determined comparison outcome string to the standard console.
    console.log( comparisonOutcome );
}


// Initiate the primary processing function by feeding it input.
// This block reads the entire content from standard input (typically /dev/stdin on Unix-like systems),
// decodes it as UTF-8, and then passes the resulting string to the 'executeProcessing' function.
executeProcessing(
    require("fs")                          // Access the Node.js file system module.
        .readFileSync("/dev/stdin", "utf8") // Read the entire file synchronously, specifying UTF-8 encoding.
);