// Initialize counters for different classifications of geometric shapes.
let rightAngleFigureCounter = 0; // Counts figures satisfying the Pythagorean theorem for specific sides.
let nonRightIsoscelesCounter = 0; // Counts figures where two specific sides are equal but not right-angled.

// Obtain the core Node.js file system utilities.
const systemFileHandler = require("node:fs");

// Define the input source path for data stream.
const standardInputSource = "/dev/stdin";

// Configuration for reading the input stream.
const inputReadOptions = {
    encoding: "utf8" // Specify character encoding for text data.
};

// Synchronously read all data from the designated input source.
// The raw content is then processed to remove any extraneous leading/trailing whitespace.
const completeRawInput = systemFileHandler.readFileSync(standardInputSource, inputReadOptions).trim();

// Divide the comprehensive input string into an array of individual data lines.
// Each line potentially represents a set of measurements for a figure.
const dataLinesCollection = completeRawInput.split('\n');

// Process each individual line from the collected input data.
for (const singleDataLine of dataLinesCollection) {
    // Skip processing for any lines that are empty or contain only whitespace.
    if (!singleDataLine.trim()) {
        continue;
    }

    // Deconstruct the line into its constituent parts, delimited by a comma.
    const measurementsAsStrings = singleDataLine.split(',');

    // Validate the number of measurements provided in the line.
    // A figure is expected to have exactly three dimensions.
    const expectedMeasurementCount = 3;
    if (measurementsAsStrings.length !== expectedMeasurementCount) {
        // Output a diagnostic message for malformed input lines and proceed to the next entry.
        console.error(`Input parsing error: Line "${singleDataLine}" did not contain ${expectedMeasurementCount} comma-separated values.`);
        continue;
    }

    // Convert string-based measurements into numerical representations.
    // It's crucial to explicitly convert to numbers for arithmetic operations.
    const dimensionOne = Number(measurementsAsStrings[0]);
    const dimensionTwo = Number(measurementsAsStrings[1]);
    const dimensionThree = Number(measurementsAsStrings[2]);

    // Perform validation to ensure all dimensions are valid positive numbers.
    // Invalid dimensions (e.g., non-numeric, zero, or negative) are skipped.
    const isAnyDimensionInvalid = isNaN(dimensionOne) || isNaN(dimensionTwo) || isNaN(dimensionThree) ||
                                 dimensionOne <= 0 || dimensionTwo <= 0 || dimensionThree <= 0;

    if (isAnyDimensionInvalid) {
        console.error(`Data validation error: Line "${singleDataLine}" contains invalid numeric dimensions.`);
        continue;
    }

    // Calculate the square of each dimension for geometric comparisons.
    const squaredDimOne = Math.pow(dimensionOne, 2);
    const squaredDimTwo = Math.pow(dimensionTwo, 2);
    const squaredDimThree = Math.pow(dimensionThree, 2);

    // Evaluate the Pythagorean relationship: Check if the square of the third dimension
    // is equal to the sum of the squares of the first two dimensions.
    const sumOfSquaresOfFirstTwo = squaredDimOne + squaredDimTwo;

    if (squaredDimThree === sumOfSquaresOfFirstTwo) {
        // If the Pythagorean condition holds true, increment the counter for right-angled figures.
        rightAngleFigureCounter++;
    } else {
        // If it's not a right-angled figure, proceed to check for the isosceles condition (first two sides equal).
        if (dimensionOne === dimensionTwo) {
            // If the first two dimensions are identical, increment the counter for non-right isosceles figures.
            nonRightIsoscelesCounter++;
        }
        // No action is taken if it's neither a right-angled figure nor an isosceles figure with equal first two sides.
    }
}

// Assemble the final result string, presenting the two classification counts, separated by a newline character.
const finalClassificationReport = `${rightAngleFigureCounter}\n${nonRightIsoscelesCounter}`;

// Output the compiled report to the standard console output.
console.log(finalClassificationReport);