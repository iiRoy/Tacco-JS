const lineModule = require('readline');

var inputProcessor = lineModule.createInterface({
    input: process.stdin,
    output: process.stdout // Standard output is configured, though not directly used for echoing here.
});

// A mutable array to accumulate all lines received from the input stream.
let receivedInputRecords = [];

// Event handler for each line of text that is read from the input.
inputProcessor.on('line', (currentLineOfText) => {
    // Store the processed line into our collection.
    receivedInputRecords.push(currentLineOfText);
});

// Event handler triggered when the input stream signals its closure (e.g., EOF).
inputProcessor.on('close', () => {
    // A preliminary check to ensure that some input was actually provided.
    if (receivedInputRecords.length === 0) {
        console.error("Error: No input lines were detected. Cannot proceed with calculations.");
        return; // Exit early if no data.
    }

    // The problem statement implies processing the first available line of input.
    const primaryInputString = receivedInputRecords[0];

    // Guard against an empty or purely whitespace first line.
    if (!primaryInputString || primaryInputString.trim().length === 0) {
        console.error("Error: The initial input line is empty or contains only whitespace.");
        return;
    }

    // Deconstruct the primary input string into its constituent parts using space as a delimiter.
    const stringFragments = primaryInputString.split(' ');

    // Validate that enough numerical components are present in the parsed string.
    // We expect at least three parts: the first (index 0) is often ignored, followed by two numbers.
    if (stringFragments.length < 3) {
        console.error("Error: Insufficient numerical components found in the input line. Expected at least two numbers.");
        return;
    }

    // Parse the second and third string fragments into integer types.
    // Using radix 10 ensures decimal interpretation.
    let firstNumericValue = parseInt(stringFragments[1], 10);
    let secondNumericValue = parseInt(stringFragments[2], 10);

    // Verify that both parsed values are valid numbers.
    if (isNaN(firstNumericValue) || isNaN(secondNumericValue)) {
        console.error("Error: Failed to convert input fragments into valid numerical values.");
        return;
    }

    // Calculate the range difference between the two numbers.
    // This value represents the total count of integers from (first + 1) up to (second - 1).
    let grossDifference = secondNumericValue - firstNumericValue;
    // Subtract one more to get the count of numbers strictly *between* the two input values.
    // For example, if input is "X 2 5", numbers between are 3, 4. (5 - 2 - 1 = 2).
    let computedIntervalCount = grossDifference - 1;

    // Determine the parity of the computed count to decide the winner.
    // A non-zero remainder when divided by two indicates an odd number.
    const isCountOdd = (computedIntervalCount % 2 !== 0);

    // Based on the parity, print the name of the winning participant.
    if (isCountOdd) {
        // If the count of intermediate numbers is odd, Alice is the winner.
        console.log('Alice');
    } else {
        // Otherwise, if the count is even, Borys is the winner.
        console.log('borys');
    }
});