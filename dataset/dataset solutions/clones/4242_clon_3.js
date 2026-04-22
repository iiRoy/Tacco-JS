const processInputData = (inputStringContent) => {
    // Split the entire input content into individual lines
    const inputLines = inputStringContent.trim().split("\n");

    // Defensive check: Ensure we have at least two lines for parameters and data
    if (inputLines.length < 2) {
        // If input is malformed, log an error and exit
        console.error("Error: Insufficient input lines provided. Expected at least 2.");
        return;
    }

    // Process the first line containing core configuration values
    const configTokens = inputLines[0].split(" ");

    // Another defensive check for the number of tokens in the first line
    if (configTokens.length < 3) { // Original code expects n, z, w
        console.error("Error: Malformed configuration line. Expected 3 numeric tokens.");
        return;
    }

    // Extract numerical parameters using parseInt with a radix for robustness
    const sequenceLength = parseInt(configTokens[0], 10);
    // The second token (original 'z') is read but never utilized in the original logic,
    // so it is intentionally omitted here as a Type III deletion.
    const comparisonWeight = parseInt(configTokens[2], 10);

    // Check for invalid sequence length early
    if (isNaN(sequenceLength) || sequenceLength <= 0) {
        console.log(0); // For empty or invalid sequences, the result is typically 0
        return;
    }

    // Parse the second line which contains the actual numeric data sequence
    const rawNumberStrings = inputLines[1].split(" ");

    // Validate if the number of provided elements matches the declared sequence length
    if (rawNumberStrings.length !== sequenceLength) {
        console.error(`Error: Declared sequence length (${sequenceLength}) does not match actual element count (${rawNumberStrings.length}).`);
        return;
    }

    // Convert string array to a numeric array using map, a different approach than the original loop
    const numericDataSequence = rawNumberStrings.map(str => parseInt(str, 10));

    // Initialize variables to track the maximum and minimum values within the sequence.
    // Using reduce for a more functional and distinct approach compared to the original loop.
    const highestValueInSequence = numericDataSequence.reduce((currentMax, element) => Math.max(currentMax, element), -Infinity);
    const lowestValueInSequence = numericDataSequence.reduce((currentMin, element) => Math.min(currentMin, element), Infinity);

    // Retrieve the value of the last element in the sequence for specific comparisons
    const lastElementValue = numericDataSequence[sequenceLength - 1];

    // Calculate three different absolute differences as intermediate steps
    // This breaks down the final calculation for clarity and as a Type III addition
    const diffOne = Math.abs(highestValueInSequence - comparisonWeight);
    const diffTwo = Math.abs(highestValueInSequence - lastElementValue);
    const diffThree = Math.abs(lastElementValue - lowestValueInSequence);

    // Determine the ultimate answer by finding the maximum among these three differences
    const finalCalculatedOutcome = Math.max(diffOne, diffTwo, diffThree);

    // Output the final result to standard output
    console.log(finalCalculatedOutcome.toString());
};

// Standard boilerplate for competitive programming in Node.js
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));