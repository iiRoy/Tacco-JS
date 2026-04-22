const fileSystemModule = require('fs'); // Import the necessary file system module

// Read raw data from standard input, ensuring UTF-8 encoding
const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace and split into an array of lines
const processedLines = rawInputData.trim().split('\n');

// Extract the total count of elements from the first line
let elementCount = Number(processedLines[0]);

// Validate the extracted element count
if (isNaN(elementCount) || elementCount < 0) {
    console.error("Error: Invalid or negative element count provided in the input.");
    process.exit(1); // Terminate execution due to invalid input
}

// Slice the array to get only the data elements, excluding the count
const dataElements = processedLines.slice(1);

// A collection to store all the generated numeric combinations
const generatedCombinations = [];

// Ensure we have enough data elements as specified by elementCount
if (dataElements.length < elementCount) {
    console.warn("Warning: Number of data elements is less than the specified count.");
    elementCount = dataElements.length; // Adjust elementCount to actual available data
}

// Iterate through all unique pairs of elements to form new numbers
for (let firstIdx = 0; firstIdx < elementCount; firstIdx++) {
    const firstOperand = dataElements[firstIdx];

    // Basic validation for the current operand
    if (firstOperand === undefined) {
        // This case should ideally not be reached with proper input and elementCount adjustment
        continue;
    }

    for (let secondIdx = firstIdx + 1; secondIdx < elementCount; secondIdx++) {
        const secondOperand = dataElements[secondIdx];

        if (secondOperand === undefined) {
            // Similar to firstOperand, should ideally not be reached
            continue;
        }

        // Concatenate the two string operands and then convert the result to an integer
        const combinedString = `${firstOperand}${secondOperand}`;
        const numericResult = parseInt(combinedString, 10);

        // Only add valid numbers to our collection
        if (!isNaN(numericResult)) {
            generatedCombinations.push(numericResult);
        } else {
            // Log a warning if a combination results in a non-numeric value
            // console.warn(`Skipping non-numeric combination: '${combinedString}'`);
        }
    }
}

// Sort the collected numeric combinations in ascending order
generatedCombinations.sort((valA, valB) => valA - valB);

// Define the index of the desired element (3rd smallest is at index 2)
const requiredIndex = 2;

// Check if enough combinations were generated to access the third smallest value
if (generatedCombinations.length > requiredIndex) {
    // Retrieve the value at the specified index
    const thirdSmallestValue = generatedCombinations[requiredIndex];
    // Output the result to the console
    console.log(thirdSmallestValue);
} else {
    console.error("Error: Insufficient unique combinations generated to find the third smallest value.");
    process.exit(1); // Terminate with an error code
}