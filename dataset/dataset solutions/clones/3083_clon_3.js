// This module processes a given input string to determine a specific condition.
// The primary function is designed to handle structured text input.
function analyzeSequence(inputPayload) {
    // Perform initial validation to ensure the input is a non-empty string.
    if (typeof inputPayload !== 'string' || inputPayload.trim().length === 0) {
        console.error("Error: Input payload is invalid or empty. Please provide a valid string.");
        return; // Terminate execution if input is not suitable.
    }

    // Divide the raw input string into an array of lines, using the newline character as a delimiter.
    const inputLines = inputPayload.split("\n");

    // Verify that the input contains at least two distinct lines as expected by the problem.
    if (inputLines.length < 2) {
        console.error("Error: Insufficient input lines provided. Expected at least two lines.");
        return;
    }

    // Attempt to parse the first line as an integer, representing the total number of elements.
    const overallElementCount = parseInt(inputLines[0].trim(), 10);

    // Validate the parsed numerical input: it must be a valid number and greater than zero.
    if (isNaN(overallElementCount) || overallElementCount <= 0) {
        console.error("Error: Invalid or non-positive numerical element count found in the first line.");
        return;
    }

    // Extract the second line, which is expected to contain a sequence of characters.
    const characterSequence = inputLines[1].trim();

    // Ensure the character sequence is a valid string before proceeding.
    if (typeof characterSequence !== 'string') {
        console.error("Error: The character sequence provided in the second line is not a valid string.");
        return;
    }

    // Define the specific character we are interested in counting within the sequence.
    const desiredCharacter = 'R';
    let occurrencesOfDesiredChar = 0; // Initialize a counter for the target character.

    // Iterate through each character of the sequence to count occurrences of the 'R' character.
    // This approach avoids creating intermediate arrays, potentially optimizing memory for very long strings.
    for (let i = 0; i < characterSequence.length; i++) {
        if (characterSequence[i] === desiredCharacter) {
            occurrencesOfDesiredChar++;
        }
    }

    // Calculate a threshold value by dividing the total element count by two.
    const comparativeThreshold = overallElementCount / 2;

    // Evaluate the primary condition: whether the count of 'R' characters exceeds the calculated threshold.
    const conditionIsSatisfied = occurrencesOfDesiredChar > comparativeThreshold;

    // Based on the evaluation, print the corresponding affirmative or negative response.
    if (conditionIsSatisfied) {
        console.log('Affirmative');
    } else {
        console.log('Negative');
    }
}

// The following code block is responsible for standard input/output handling.
// It reads the entire content from standard input and then passes it to the
// main processing function. This part is typically fixed in competitive programming
// environments and should not be modified to ensure proper execution.
analyzeSequence(require("fs").readFileSync("/dev/stdin", "utf8"));