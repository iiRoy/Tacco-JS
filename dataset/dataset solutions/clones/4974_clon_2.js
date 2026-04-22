'use strict'; // Enforce strict parsing and error handling for cleaner code

// This module's purpose is to compute the sum of all possible numerical expressions
// that can be formed by inserting '+' operators into a given string of digits.

const performComputation = (incomingTextStream) => { // The primary routine for processing input data
    let refinedDataString = incomingTextStream.trim(); // Sanitize the input by removing leading/trailing whitespace
    const numericalCharacters = refinedDataString.split(""); // Deconstruct the string into an array of single-character strings
    const potentialOperatorSlots = numericalCharacters.length - 1; // Calculate the count of possible positions for plus signs
    let totalAccumulatedValue = 0; // Initialize the grand total for all evaluated expressions

    // Iterate through every conceivable arrangement of plus operators.
    // The expression (1 << potentialOperatorSlots) generates 2^N unique binary combinations.
    for (let currentBitConfiguration = 0; currentBitConfiguration < (1 << potentialOperatorSlots); currentBitConfiguration++) {
        // Begin forming numerical segments with the very first digit.
        let intermediateNumericParts = [numericalCharacters[0]];
        
        // Traverse the remaining characters to construct the number segments
        // based on the presence or absence of a plus sign at each position, determined by the bit configuration.
        for (let positionIndex = 0; positionIndex < potentialOperatorSlots; positionIndex++) {
            const subsequentCharacter = numericalCharacters[positionIndex + 1]; // Retrieve the next digit in sequence

            // Evaluate the bit at the current positionIndex within the currentBitConfiguration.
            // If the bit is set (non-zero), it signifies a '+' operator, necessitating a new number segment.
            if (currentBitConfiguration & (1 << positionIndex)) {
                intermediateNumericParts.push(subsequentCharacter); // Append the character as a distinct new segment
            } else {
                // If the bit is not set (zero), concatenate the character to the last active segment.
                intermediateNumericParts[intermediateNumericParts.length - 1] += subsequentCharacter;
            }
        }
        
        // After successfully segmenting the digits for this specific bit configuration,
        // convert each segment to an integer and sum them up.
        // Add this sum to the overall totalAccumulatedValue.
        totalAccumulatedValue += intermediateNumericParts.reduce((currentSum, individualPartString) => {
            return currentSum + parseInt(individualPartString, 10); // Convert each string part to a base-10 integer and sum
        }, 0); // The starting value for this reduction operation is zero
    }
    
    console.log(totalAccumulatedValue); // Output the final computed numerical result
};

// Execute the main processing function, providing it with content
// read synchronously from the standard input stream, encoded as UTF-8.
performComputation(require('fs').readFileSync('/dev/stdin', 'utf8'));