const fileSystemModule = require('node:fs');
const standardInputLocation = '/dev/stdin';
const outputDecimalPlaces = 5;

/**
 * Processes raw text input, splitting it into lines and converting each to a number.
 * Non-numeric or empty lines are skipped.
 * @param {string} rawContent The raw string data read from the input source.
 * @returns {number[]} An array containing only valid numerical data points.
 */
const parseInputToNumericalArray = (rawContent) => {
    // Guard against null or empty input strings
    if (!rawContent || rawContent.trim().length === 0) {
        return [];
    }

    const lineSegments = rawContent.trim().split('\n');
    const numericEntries = [];

    // Iterate through each line to parse and validate, building the array manually
    for (const segment of lineSegments) {
        const potentialNumber = Number(segment);
        // Only push valid numbers; skip NaN (e.g., from empty lines or non-numeric text)
        if (!isNaN(potentialNumber)) {
            numericEntries.push(potentialNumber);
        }
    }
    return numericEntries;
};

/**
 * Computes a specific geometric surface area based on two input dimensions:
 * a base length and a vertical height. The formula is derived from a specific problem context.
 * @param {number} baseMeasurement The base length (analogous to 'x').
 * @param {number} verticalMeasurement The height (analogous to 'h').
 * @returns {number} The calculated surface area, or NaN if inputs are invalid.
 */
const performGeometricSurfaceCalculation = (baseMeasurement, verticalMeasurement) => {
    // Ensure input dimensions are non-negative for a meaningful geometric calculation
    if (baseMeasurement < 0 || verticalMeasurement < 0) {
        // Optionally, throw an error or log a warning here
        return NaN; // Indicate an invalid calculation result
    }

    // Break down the calculation into intermediate, descriptive steps
    const baseSquaredTerm = Math.pow(baseMeasurement, 2);
    const fourTimesHeightSquared = 4 * Math.pow(verticalMeasurement, 2);

    // Calculate the square root component of the formula
    const sqrtComponent = Math.sqrt(fourTimesHeightSquared + baseSquaredTerm);

    // Combine terms according to the original formula: x * sqrt(4*h*h + x*x) + x*x
    const firstTermContribution = baseMeasurement * sqrtComponent;
    const secondTermContribution = baseSquaredTerm;

    return firstTermContribution + secondTermContribution;
};

// Main script execution block, wrapped in a try-catch for robustness
try {
    // Read the entire content of the standard input file
    const rawDataBuffer = fileSystemModule.readFileSync(standardInputLocation, 'utf8');

    // Process the raw text into an array of numbers
    const processedNumericalDataset = parseInputToNumericalArray(rawDataBuffer);

    // An array to collect all formatted results before final output
    const collectedOutputStrings = [];

    // Iterate through the dataset, processing two numbers at a time
    // using a more explicit loop structure and variable names
    for (let dataIndex = 0; dataIndex < processedNumericalDataset.length; dataIndex += 2) {
        // Guard clause: Ensure there are enough elements for a pair (base and height)
        if (dataIndex + 1 >= processedNumericalDataset.length) {
            // If the last element is unpaired, we simply stop processing
            break;
        }

        const currentBaseValue = processedNumericalDataset[dataIndex];
        const currentHeightValue = processedNumericalDataset[dataIndex + 1];

        // Check for the termination condition (0, 0 pair)
        const isTerminationPair = (currentBaseValue === 0 && currentHeightValue === 0);
        if (isTerminationPair) {
            break; // Exit the loop if the termination pair is found
        }

        // Perform the core geometric calculation using the dedicated function
        const computedSurfaceArea = performGeometricSurfaceCalculation(currentBaseValue, currentHeightValue);

        // Only format and collect valid calculation results
        if (!isNaN(computedSurfaceArea)) {
            // Format the result to the predefined number of decimal places
            const formattedAreaString = computedSurfaceArea.toFixed(outputDecimalPlaces);
            collectedOutputStrings.push(formattedAreaString);
        }
        // else { console.warn(`Skipping output for invalid calculation with base=${currentBaseValue}, height=${currentHeightValue}`); }
    }

    // After all calculations are done, print each collected result
    for (const finalResultLine of collectedOutputStrings) {
        console.log(finalResultLine);
    }

} catch (processingError) {
    // Basic error handling for issues like file not found or permission errors
    // console.error(`An error occurred during script execution: ${processingError.message}`);
    // process.exit(1); // Indicate an abnormal termination
}