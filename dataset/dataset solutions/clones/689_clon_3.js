const fileSystemModule = require('fs');

// Read raw input data from the standard input stream
const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Process the raw input: split into lines, trim whitespace from each line,
// and filter out any entirely empty lines that might result from trimming.
let inputLines = rawInputData
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

// Helper function to compute the cube of a number
const calculateCube = (value) => Math.pow(value, 3);

// Initialize an index to track the current position in the input lines array
let currentLineIndex = 0;

// Main processing loop: continue as long as there are lines to process
// and the termination condition (input number 0) has not been met.
while (currentLineIndex < inputLines.length) {
    // Retrieve the current line and advance the index for the next iteration
    const currentLineText = inputLines[currentLineIndex++];

    // Convert the text line to a number. Use Number() for explicit type conversion.
    const mainInputNumber = Number(currentLineText);

    // Guard clause: Check for invalid number conversion or the termination signal (0)
    if (isNaN(mainInputNumber)) {
        // Log a warning and skip to the next line if the input is not a valid number
        console.error(`Warning: Skipping non-numeric input line: "${currentLineText}"`);
        continue;
    }

    // If the input number is 0, it's the signal to terminate the program
    if (mainInputNumber === 0) {
        break;
    }

    // Calculate the cube of the primary input number using the helper function
    const mainNumberCubed = calculateCube(mainInputNumber);

    // Initialize an array to store all positive differences found
    let collectedPositiveDifferences = [];

    // Outer loop: Iterate for the first factor (i) from (mainInputNumber - 1) down to 1
    for (let primaryFactor = mainInputNumber - 1; primaryFactor > 0; primaryFactor--) {
        // Calculate the cube of the primary factor once per outer loop iteration
        const primaryFactorCube = calculateCube(primaryFactor);

        // Inner loop: Iterate for the second factor (j) from primaryFactor down to 1
        for (let secondaryFactor = primaryFactor; secondaryFactor > 0; secondaryFactor--) {
            // Calculate the cube of the secondary factor once per inner loop iteration
            const secondaryFactorCube = calculateCube(secondaryFactor);

            // Compute the difference: Z^3 - I^3 - J^3
            const computedDifference = mainNumberCubed - primaryFactorCube - secondaryFactorCube;

            // Only add the difference to the collection if it is a positive value
            if (computedDifference > 0) {
                collectedPositiveDifferences.push(computedDifference);
            }
        }
    }

    // Check if any positive differences were found before attempting to sort and output
    if (collectedPositiveDifferences.length > 0) {
        // Sort the array of differences in ascending order using an arrow function
        collectedPositiveDifferences.sort((valueA, valueB) => valueA - valueB);

        // Output the smallest positive difference found (which is the first element after sorting)
        console.log(collectedPositiveDifferences[0]);
    } else {
        // Provide an informative message if no positive differences were found for the current input
        console.log(`No valid positive differences identified for input: ${mainInputNumber}`);
    }
}