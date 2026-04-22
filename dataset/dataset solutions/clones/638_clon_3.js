const fs = require('fs'); // Explicitly import the file system module

// Define a constant for the standard input file path
const STANDARD_INPUT_PATH = '/dev/stdin';

// Define a constant for an unreachable or infinite cost in the dynamic programming table
const UNREACHABLE_STATE_COST = Infinity;

/**
 * Utility function to safely read and process input lines from a specified file.
 * Handles potential file reading errors and initial data cleaning.
 * @param {string} sourcePath - The file path to read input from.
 * @returns {string[]} An array of non-empty, trimmed lines from the input file.
 */
function obtainProcessedInputLines(sourcePath) {
    try {
        // Read the entire file content synchronously, ensuring UTF-8 encoding
        const rawContent = fs.readFileSync(sourcePath, 'utf8');

        // Trim any leading or trailing whitespace from the overall content
        const cleanContent = rawContent.trim();

        // Split the content by newline characters and filter out any resulting empty strings
        const linesArray = cleanContent.split('\n').filter(line => line.length > 0);

        // Basic validation: ensure we have at least some input lines
        if (linesArray.length === 0) {
            console.error("Critical Error: The input file is empty or contains no valid data lines.");
            process.exit(1); // Terminate execution due to critical input error
        }
        return linesArray;
    } catch (error) {
        // Catch and report any errors during file reading
        console.error(`Critical Error: Failed to read or process input from "${sourcePath}". Details: ${error.message}`);
        process.exit(1); // Terminate execution on file system error
    }
}

// 1. Acquire and prepare all input lines from the standard input
let allInputDataLines = obtainProcessedInputLines(STANDARD_INPUT_PATH);

// 2. Parse the initial dimension parameters (N and M)
// These define the sizes of the two arrays that follow and the DP table dimensions.

// Check if there's at least one line available for dimensions
if (allInputDataLines.length < 1) {
    console.error("Input Error: Expected at least one line for dimensions (N M), but no lines were found.");
    process.exit(1);
}

// Extract the first line, which should contain N and M
const dimensionString = allInputDataLines.shift();
const parsedDimensionValues = dimensionString.split(' ').map(value => parseInt(value, 10)); // Parse as integers with radix 10

// Validate the parsed dimension values
if (parsedDimensionValues.length !== 2 || isNaN(parsedDimensionValues[0]) || isNaN(parsedDimensionValues[1])) {
    console.error(`Input Error: Invalid format for dimension parameters. Expected "N M" (two numbers), received "${dimensionString}".`);
    process.exit(1);
}

// Destructure the dimensions into more descriptive variables
const [requiredDestinationItems, availableSourceFactors] = parsedDimensionValues; // N (original n) and M (original m)

// Ensure that the counts are non-negative, as negative dimensions are illogical
if (requiredDestinationItems < 0 || availableSourceFactors < 0) {
    console.error(`Input Error: Dimension counts cannot be negative. N=${requiredDestinationItems}, M=${availableSourceFactors}.`);
    process.exit(1);
}

// 3. Parse the array of destination item values (original 'd')
const destinationItemValues = [];
// Loop to read 'N' number of destination values
for (let itemIndex = 0; itemIndex < requiredDestinationItems; itemIndex++) {
    // Validate that there are enough lines remaining for destination values
    if (allInputDataLines.length === 0) {
        console.error(`Input Error: Insufficient lines for ${requiredDestinationItems} destination items. Only ${itemIndex} were found.`);
        process.exit(1);
    }
    const currentItemLine = allInputDataLines.shift();
    const parsedItemValue = parseFloat(currentItemLine); // Parse as float to handle decimal values

    // Validate if the parsed value is a valid number
    if (isNaN(parsedItemValue)) {
        console.error(`Input Error: Invalid number found for destination item at line ${itemIndex + 2}. Value: "${currentItemLine}".`);
        process.exit(1);
    }
    destinationItemValues.push(parsedItemValue);
}

// 4. Parse the array of source cost factors (original 'c')
const sourceCostFactors = [];
// Loop to read 'M' number of source factors
for (let factorIndex = 0; factorIndex < availableSourceFactors; factorIndex++) {
    // Validate that there are enough lines remaining for source factors
    if (allInputDataLines.length === 0) {
        console.error(`Input Error: Insufficient lines for ${availableSourceFactors} source factors. Only ${factorIndex} were found.`);
        process.exit(1);
    }
    const currentFactorLine = allInputDataLines.shift();
    const parsedFactorValue = parseFloat(currentFactorLine); // Parse as float

    // Validate if the parsed value is a valid number
    if (isNaN(parsedFactorValue)) {
        console.error(`Input Error: Invalid number found for source factor at line ${requiredDestinationItems + factorIndex + 2}. Value: "${currentFactorLine}".`);
        process.exit(1);
    }
    sourceCostFactors.push(parsedFactorValue);
}

// 5. Initialize the Dynamic Programming (DP) table
// This table will store the minimum cost to achieve 'j' destination items
// using up to 'i' source factors.
// Dimensions: (availableSourceFactors + 1) rows x (requiredDestinationItems + 1) columns.
const minimumCostGrid = Array.from({ length: availableSourceFactors + 1 }, () =>
    Array.from({ length: requiredDestinationItems + 1 }, () => UNREACHABLE_STATE_COST)
);

// Base case: The cost to achieve zero destination items using zero source factors is zero.
minimumCostGrid[0][0] = 0;

// 6. Execute the core Dynamic Programming calculation
// This section calculates the minimum cost for all possible subproblems.

// Iterate through each available source factor (from index 0 to M-1)
for (let currentSourceFactorIdx = 0; currentSourceFactorIdx < availableSourceFactors; currentSourceFactorIdx++) { // Corresponds to 'i'
    const currentFactorValue = sourceCostFactors[currentSourceFactorIdx]; // The value of the current source factor (original 'C')

    // Iterate through each destination item (from index 0 to N-1)
    for (let currentDestItemIdx = 0; currentDestItemIdx < requiredDestinationItems; currentDestItemIdx++) { // Corresponds to 'j'
        // Guard clause: If the current state (cost to achieve currentDestItemIdx using currentSourceFactorIdx factors)
        // is unreachable, then we cannot build upon this state. Skip to the next iteration.
        if (minimumCostGrid[currentSourceFactorIdx][currentDestItemIdx] === UNREACHABLE_STATE_COST) {
            continue; // Move to the next destination item
        }

        // Store the known minimum cost to reach the current state for clarity
        const costToCurrentState = minimumCostGrid[currentSourceFactorIdx][currentDestItemIdx];
        // Retrieve the value of the current destination item (original 'D')
        const currentDestinationValue = destinationItemValues[currentDestItemIdx];
        // Calculate the specific cost if the current source factor is matched with the current destination item
        const costOfCurrentMatch = currentFactorValue * currentDestinationValue;

        // Explore transitions by considering how many source factors to "skip" or "group"
        // 'factorAdvanceSteps' represents the number of factors to advance in the source array
        // (including the current one if it's used later in the sequence).
        for (let factorAdvanceSteps = 1; currentSourceFactorIdx + factorAdvanceSteps <= availableSourceFactors; factorAdvanceSteps++) { // Corresponds to 'k'
            const nextSourceRow = currentSourceFactorIdx + factorAdvanceSteps; // The row index for the next DP state

            // Option A: Skip the current destination item 'currentDestItemIdx' with 'currentSourceFactorIdx'.
            // In this case, we carry forward the cost for 'currentDestItemIdx' items, effectively
            // considering 'factorAdvanceSteps' more source factors without matching the current destination item.
            minimumCostGrid[nextSourceRow][currentDestItemIdx] = Math.min(
                minimumCostGrid[nextSourceRow][currentDestItemIdx],
                costToCurrentState // The cost remains the same as reaching current state
            );

            // Option B: Use the current source factor 'currentSourceFactorIdx' to match the current destination item 'currentDestItemIdx'.
            // This transitions to matching 'currentDestItemIdx + 1' items.
            // The cost increases by 'costOfCurrentMatch'.
            // We consider 'factorAdvanceSteps' more source factors for this new state.
            const accumulatedCostIfMatched = costToCurrentState + costOfCurrentMatch;
            minimumCostGrid[nextSourceRow][currentDestItemIdx + 1] = Math.min(
                minimumCostGrid[nextSourceRow][currentDestItemIdx + 1],
                accumulatedCostIfMatched
            );
        }
    }
}

// 7. Output the final computed minimum cost
// The result is found at minimumCostGrid[M][N]
const finalOptimalCost = minimumCostGrid[availableSourceFactors][requiredDestinationItems];

// Check if a solution was found or if it's impossible
if (finalOptimalCost === UNREACHABLE_STATE_COST) {
    console.log("No valid combination of source factors could achieve all target destination items.");
} else {
    // Output the result, formatted to two decimal places for readability, assuming costs might be floats
    console.log(`The calculated minimum total cost is: ${finalOptimalCost.toFixed(2)}`);
}