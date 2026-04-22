// This module defines a function for processing numerical sequences.
const processData = function (rawData) {
    // Split the entire input string into individual lines.
    const linesOfText = rawData.split('\n');

    // The first line contains the total count of numbers.
    const elementCount = Number.parseInt(linesOfText[0], 10); // Explicit radix for robustness

    // The second line contains space-separated numbers, parsed into an array.
    let numericSequence = linesOfText[1]
        .split(' ')
        .map(currentVal => Number.parseInt(currentVal, 10));

    // Initialize a counter for division operations.
    let divisionOperations = 0;

    // Iterate through each number in the sequence.
    for (let idx = 0; idx < elementCount; idx++) {
        // While the current number is even, keep dividing it by 2.
        while (numericSequence[idx] % 2 === 0) {
            numericSequence[idx] = numericSequence[idx] / 2; // Equivalent to multiplying by 0.5
            divisionOperations++; // Increment the operation counter.
        }
    }

    // Output the final tally of division operations.
    console.log(divisionOperations);

    // Indicate successful execution.
    return 0;
};

// Execute the main processing function with input from standard input.
processData(
    require("fs")
        .readFileSync("/dev/stdin", "utf8")
        .trim()
);