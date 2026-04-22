// This script processes numerical input to calculate a specific minimum cost metric.

// Import the Node.js file system module for reading input data.
const fileSystem = require('fs');

// Define the standard input file path.
const standardInputPath = '/dev/stdin';

// --- Input Acquisition and Initial Validation ---

// Read the entire content of the standard input file, interpreting it as UTF-8 text.
const rawInputData = fileSystem.readFileSync(standardInputPath, 'utf8');

// Perform a basic check to ensure that input data is not empty.
if (!rawInputData || rawInputData.trim() === '') {
    // If no data is found, log an error message and terminate the process.
    console.error("Error: No input data was provided for processing.");
    process.exit(1);
}

// Split the raw input string into an array of lines, removing any leading/trailing whitespace.
const allInputLines = rawInputData.trim().split('\n');

// Extract the first line, which is expected to contain configuration parameters.
const configLine = allInputLines.shift();

// Validate that the configuration line was successfully extracted.
if (!configLine) {
    // If the configuration line is missing, log an error and exit.
    console.error("Error: The essential configuration line is absent from the input.");
    process.exit(1);
}

// Parse the configuration parameters from the first line.
// These parameters are expected to be space-separated numbers.
const configurationValues = configLine.split(' ').map(Number);

// Verify that the correct number of configuration parameters (three) were provided.
if (configurationValues.length < 3) {
    // If fewer than three parameters are found, report an error and terminate.
    console.error("Error: Insufficient configuration parameters detected. Expected 3 numeric values.");
    process.exit(1);
}

// Destructure and rename the configuration values for better readability and context.
// 'rawUpperLimit' corresponds to the initial value of nmp[0].
// 'numDataEntries' corresponds to m (nmp[1]).
// 'focalPoint' corresponds to p (nmp[2]).
const [rawUpperLimit, numDataEntries, focalPoint] = configurationValues;

// Adjust the upper limit value as per the original logic (nmp[0] - 1).
const upperLimit = rawUpperLimit - 1;

// --- Data Point Collection and Normalization ---

// Initialize an array to temporarily store collected data points.
let collectedDataPoints = [];

// Loop through the remaining input lines to gather individual data points.
for (let i = 0; i < numDataEntries; i++) {
    // Retrieve the next line from the input array.
    const currentLine = allInputLines.shift();

    // Implement a guard against running out of input lines prematurely.
    if (currentLine === undefined) {
        // Issue a warning if fewer data entries are found than expected.
        console.warn(`Warning: Expected ${numDataEntries} data entries, but input lines were exhausted after ${i} entries.`);
        break; // Exit the loop if no more lines are available.
    }

    // Convert the current line string to a numeric value.
    const numericValue = Number(currentLine);

    // Validate that the parsed value is indeed a number.
    if (isNaN(numericValue)) {
        // If a non-numeric value is encountered, log a warning and skip it.
        console.warn(`Warning: Skipping non-numeric data entry: "${currentLine}" as it is not a valid number.`);
        continue;
    }

    // Add the numeric value to the collection if it's not the focal point.
    // The focal point will be explicitly added later to ensure its presence and uniqueness.
    if (numericValue !== focalPoint) {
        collectedDataPoints.push(numericValue);
    }
}

// Use a Set to ensure all data points are unique and to add the focal point definitively.
const uniqueDataPointsSet = new Set(collectedDataPoints);
uniqueDataPointsSet.add(focalPoint); // Guarantee that the focalPoint is always included.

// Convert the Set back into an Array and sort it numerically in ascending order.
const orderedDataPoints = Array.from(uniqueDataPointsSet).sort((valA, valB) => valA - valB);

// --- Minimum Cost Computation Logic ---

// Initialize the variable that will hold the overall minimum cost to a very large number.
let overallMinimumCost = Number.POSITIVE_INFINITY;

// Iterate over each data point in the sorted array using its value and index.
orderedDataPoints.forEach((currentPoint, currentIndex) => {
    // Initialize a temporary variable for the cost calculated in the current iteration.
    let iterationCost = Number.POSITIVE_INFINITY;

    // Evaluate different cost scenarios based on the relationship between currentPoint and focalPoint.
    if (currentPoint < focalPoint) {
        // Scenario 1: currentPoint is less than focalPoint.
        // Calculate a 'round-trip' distance from currentPoint to focalPoint.
        const distanceComponent = (focalPoint - currentPoint) * 2;
        // Calculate a range-based cost from focalPoint to the upper limit.
        const rangeComponent = (upperLimit - focalPoint + 1);

        if (currentIndex !== 0) {
            // If not the first element, factor in the value of the previous data point.
            iterationCost = distanceComponent + rangeComponent + orderedDataPoints[currentIndex - 1];
        } else {
            // If it's the first element, only consider distance and range components.
            iterationCost = distanceComponent + rangeComponent;
        }
    } else if (currentPoint === focalPoint) {
        // Scenario 2: currentPoint is exactly the focalPoint.
        const lastIndex = orderedDataPoints.length - 1;

        // Sub-scenario 2.1: If focalPoint is the first element in the sorted array.
        if (currentIndex === 0) {
            iterationCost = Math.min(iterationCost, orderedDataPoints[lastIndex] - currentPoint);
        }
        // Sub-scenario 2.2: If focalPoint is the last element in the sorted array.
        if (currentIndex === lastIndex) {
            iterationCost = Math.min(iterationCost, currentPoint - orderedDataPoints[0]);
        }
        // Sub-scenario 2.3: If focalPoint is not the last element, consider the next element.
        if (currentIndex !== lastIndex) {
            const nextPointValue = orderedDataPoints[currentIndex + 1];
            iterationCost = Math.min(iterationCost, focalPoint + upperLimit - nextPointValue + 1);
        }
        // Sub-scenario 2.4: If focalPoint is not the first element, consider the previous element.
        if (currentIndex !== 0) {
            const previousPointValue = orderedDataPoints[currentIndex - 1];
            iterationCost = Math.min(iterationCost, upperLimit - focalPoint + 1 + previousPointValue);
        }
    } else { // currentPoint > focalPoint
        // Scenario 3: currentPoint is greater than focalPoint.
        // Calculate a 'round-trip' distance from focalPoint to currentPoint.
        const distanceComponent = (currentPoint - focalPoint) * 2;

        if (currentIndex !== orderedDataPoints.length - 1) {
            // If not the last element, add focalPoint and a range component involving the next element.
            const nextPointValue = orderedDataPoints[currentIndex + 1];
            iterationCost = distanceComponent + focalPoint + (upperLimit - nextPointValue + 1);
        } else {
            // If it's the last element, only consider distance and focalPoint.
            iterationCost = distanceComponent + focalPoint;
        }
    }

    // Update the overall minimum cost if the current iteration's cost is lower.
    overallMinimumCost = Math.min(overallMinimumCost, iterationCost);
});

// --- Final Output Generation ---

// Check if a valid minimum cost was found (i.e., it's no longer positive infinity).
if (overallMinimumCost === Number.POSITIVE_INFINITY) {
    // If no meaningful minimum could be calculated, log an error and exit.
    console.error("Error: The minimum cost could not be determined. Please review the input data's integrity.");
    process.exit(1);
}

// Multiply the final calculated minimum cost by 100 as per the problem's requirement.
const finalComputedResult = overallMinimumCost * 100;

// Print the final result to the console.
console.log(finalComputedResult);