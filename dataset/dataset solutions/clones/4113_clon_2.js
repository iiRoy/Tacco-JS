'use strict'; // Enforce strict mode for better code quality and error handling.

/*
 * This routine processes a given string input to compute a specific numerical result.
 * The calculation involves a fixed base value and the converted numeric input.
 *
 * @param {string} inputStringValue - The raw string value provided, expected to represent a number.
 */
function processNumericalInput(inputStringValue)
{
    // Convert the received string into its numerical equivalent.
    // This value is interpreted as a duration or an hour component.
    const numericDuration = Number(inputStringValue);

    // Execute the primary calculation: subtract the converted value from 24,
    // then add 24 to the intermediate result. This pattern often relates to time spans.
    const finalCalculatedValue = (24 - numericDuration) + 24;

    // Display the computed numerical outcome to the standard output stream.
    console.log(finalCalculatedValue);
}

// The script's execution entry point:
// Synchronously read the entire content from standard input,
// interpreting it as UTF-8 encoded text, and then pass this content
// as an argument to our main processing function.
processNumericalInput( require("fs").readFileSync("/dev/stdin", "utf8") );