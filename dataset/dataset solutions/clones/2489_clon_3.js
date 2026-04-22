const computeSumOfProducts = (rawInputTextualData) => {
    // Ensure the input data is provided and is a string.
    if (!rawInputTextualData || typeof rawInputTextualData !== 'string') {
        console.error("Fatal Error: Input data is missing or not a string type.");
        return;
    }

    // Trim whitespace from the input and then split it into individual lines.
    // Any empty lines resulting from extra newlines are filtered out.
    const processedLines = rawInputTextualData
        .trim()
        .split("\n")
        .filter(lineContent => lineContent.length > 0);

    // A typical competitive programming input structure expects at least two lines:
    // one for the count (N) and one for the sequence of numbers.
    if (processedLines.length < 2) {
        console.error("Fatal Error: Insufficient data lines provided in the input.");
        return;
    }

    // Parse the first line to extract the expected number of elements (N).
    // We assume N is the first integer on the first line.
    const elementsFromFirstLine = processedLines[0].split(" ").map(str => {
        const val = parseInt(str.trim(), 10);
        if (isNaN(val)) {
            throw new Error(`Input parsing error: Non-numeric value found in the count line: '${str}'`);
        }
        return val;
    });
    const declaredElementCount = elementsFromFirstLine[0];

    // Parse the second line to get the actual sequence of numbers.
    // Each string segment is converted into an integer.
    const numberSequenceArray = processedLines[1].split(" ")
                                                .map(str => {
                                                    const numericVal = parseInt(str.trim(), 10);
                                                    if (isNaN(numericVal)) {
                                                        throw new Error(`Input parsing error: Invalid number found in the sequence: '${str}'`);
                                                    }
                                                    return numericVal;
                                                })
                                                .filter(val => !isNaN(val)); // Filter out any potential NaNs, though error above handles it.

    // Optional: Validate if the number of elements parsed matches the declared count.
    if (declaredElementCount !== undefined && numberSequenceArray.length !== declaredElementCount) {
        console.warn(`Warning: Expected ${declaredElementCount} elements, but found ${numberSequenceArray.length}. Proceeding with available data.`);
    }

    // Initialize variables to compute the sum of elements and the sum of their squares.
    let aggregateSum = 0;
    let aggregateSumOfSquares = 0;

    // Iterate through the numeric sequence once to gather the necessary sums.
    // This approach is more efficient than nested loops or nested reduces for this specific problem.
    for (const singleValue of numberSequenceArray) {
        aggregateSum += singleValue; // Accumulates sum(a_k)
        aggregateSumOfSquares += singleValue * singleValue; // Accumulates sum(a_k^2)
    }

    // Calculate the square of the total sum of elements.
    const sumTotalSquared = aggregateSum * aggregateSum;

    // Apply the mathematical identity to find the sum of products of distinct pairs (i < j):
    // Sum(a_i * a_j for i < j) = ((Sum(a_k))^2 - Sum(a_k^2)) / 2
    const finalCalculatedResult = (sumTotalSquared - aggregateSumOfSquares) / 2;

    // Display the computed result to standard output.
    console.log(finalCalculatedResult);
};

// Main execution wrapper function to handle input reading and error management.
const executeSolution = () => {
    try {
        // Read the entire content from standard input synchronously using Node.js 'fs' module.
        const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
        // Pass the raw content to our primary computation logic.
        computeSumOfProducts(fileContent);
    } catch (inputReadError) {
        // Catch and log any errors that occur during file reading or initial parsing.
        console.error("An unhandled error occurred during input processing:", inputReadError.message);
    }
};

// Invoke the solution execution.
executeSolution();