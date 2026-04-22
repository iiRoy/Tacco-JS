const fileSystemModule = require("fs"); // Using a descriptive constant for the file system module.

// Define the standard input path as a constant for clarity.
const standardInputDevicePath = "/dev/stdin";

/**
 * Helper function to safely parse a string into an integer.
 * It uses `Number()` for conversion and includes a guard against non-numeric inputs.
 * @param {string} inputString - The string to parse.
 * @returns {number} The parsed integer, or 0 if parsing fails (NaN).
 */
const retrieveNumericValue = (inputString) => {
    const parsedNumber = Number(inputString); // Employing Number() for parsing, which handles various numeric formats.
    return isNaN(parsedNumber) ? 0 : parsedNumber; // Returns 0 for non-numeric or empty strings.
};

// --- Input Acquisition and Initial Processing ---
// Read the entire content of the standard input, interpret it as UTF-8, and split into individual lines.
const rawInputContentLines = fileSystemModule.readFileSync(standardInputDevicePath, "utf8").split("\n");

// Filter out any blank lines that might occur from the split operation, especially at the end of a file.
const sanitizedInputLines = rawInputContentLines.filter(line => line.trim() !== '');

// Implement a basic validation to ensure there's enough input data to proceed.
if (sanitizedInputLines.length < 2) {
    console.error("Error: Insufficient input data available for processing. Expected at least two lines.");
    process.exit(1); // Terminate execution with an error code.
}

// --- Primary Data Structure Construction ---
// The very first line of input specifies the count of primary data elements.
let primaryElementCount = retrieveNumericValue(sanitizedInputLines[0]);

// Initialize an array to hold the primary data segments. Each segment will be an object.
const primarySegmentCollection = [];

// Maintain an index to track the current line being processed from the input.
let currentInputLinePointer = 1;

// Iterate to populate the primary data segments based on `primaryElementCount`.
for (let elementIdx = 0; elementIdx < primaryElementCount; ++elementIdx) {
    // Add a robust check to prevent accessing lines beyond the available input.
    if (currentInputLinePointer >= sanitizedInputLines.length) {
        console.error(`Error: Ran out of input lines while attempting to read primary data segments. Expected ${primaryElementCount} segments, but only found ${elementIdx}.`);
        process.exit(1);
    }

    const currentSegmentData = sanitizedInputLines[currentInputLinePointer].split(" ");
    // Validate the structure of the current line's data.
    if (currentSegmentData.length < 2) {
        console.error(`Error: Malformed primary segment data on line ${currentInputLinePointer + 1}. Expected two values.`);
        process.exit(1);
    }
    
    // Store each segment as an object with clearly named properties.
    primarySegmentCollection.push({
        associatedValue: retrieveNumericValue(currentSegmentData[0]),
        segmentWeight: retrieveNumericValue(currentSegmentData[1])
    });
    currentInputLinePointer++; // Advance the line pointer to the next input line.
}

// --- Query Instructions Definition ---
// The line immediately following the primary data segments specifies the total number of queries.
let totalQueryCount = retrieveNumericValue(sanitizedInputLines[currentInputLinePointer]);
currentInputLinePointer++; // Move past the query count line.

// Initialize an array to store all query instructions.
const queryInstructionSet = [];

// Populate the query instruction set.
// NOTE: The original code's loop for this section incorrectly used `n` instead of `q`.
// This clone corrects that oversight by using `totalQueryCount`.
for (let queryIdx = 0; queryIdx < totalQueryCount; ++queryIdx) {
    // Ensure sufficient input lines are available for all queries.
    if (currentInputLinePointer >= sanitizedInputLines.length) {
        console.error(`Error: Not enough input lines to define all queries. Expected ${totalQueryCount} queries, but only found ${queryIdx}.`);
        process.exit(1);
    }

    const currentQueryDetails = sanitizedInputLines[currentInputLinePointer].split(" ");
    // Validate the integrity of the query data line.
    if (currentQueryDetails.length < 2) {
        console.error(`Error: Invalid query instruction format on line ${currentInputLinePointer + 1}.`);
        process.exit(1);
    }
    
    // Store query details as objects, adjusting the starting node identifier by -1 as per original logic.
    queryInstructionSet.push({
        initialNodeIdentifier: retrieveNumericValue(currentQueryDetails[0]) - 1,
        maximumPermissibleWeight: retrieveNumericValue(currentQueryDetails[1])
    });
    currentInputLinePointer++; // Advance the line pointer.
}

// --- Core Query Processing Functionality ---

/**
 * Executes the logic for a single query to calculate the total accumulated value.
 * @param {number} startingNodeId - The initial node index for the query.
 * @param {number} weightCeiling - The maximum allowed accumulated weight.
 * @returns {number} The total value accumulated according to the query rules.
 */
const executeQueryTraversal = (startingNodeId, weightCeiling) => {
    let activeNodeIndex = startingNodeId;
    let currentAccumulatedWeight = 0;
    let finalAggregatedValue = 0;

    // The traversal loop continues as long as the accumulated weight does not exceed the ceiling.
    while (currentAccumulatedWeight <= weightCeiling) {
        // Introduce a robust guard: if the node index falls out of the valid range of primary data segments,
        // it indicates an invalid state or the end of a valid path.
        if (activeNodeIndex < 0 || activeNodeIndex >= primarySegmentCollection.length) {
            break; // Exit the loop if the node index is invalid.
        }

        // Fetch the data for the current node once to avoid repetitive lookups.
        const nodeData = primarySegmentCollection[activeNodeIndex];

        // Add the current node's weight to the running total.
        currentAccumulatedWeight += nodeData.segmentWeight;

        // Only add the node's value if the accumulated weight (after adding current node's weight)
        // remains within the specified limit. This is a critical condition from the original logic.
        if (currentAccumulatedWeight <= weightCeiling) {
            finalAggregatedValue += nodeData.associatedValue;
        }

        // A specific termination condition: if the node index becomes 0, the traversal stops.
        if (activeNodeIndex === 0) {
            break;
        }

        // Update the node index for the next iteration by integer division (halving it).
        // `Math.floor` is explicitly used to ensure integer division, equivalent to a right bit shift (`>>= 1`)
        // for non-negative integers but more readable for some.
        activeNodeIndex = Math.floor(activeNodeIndex / 2);
    }
    return finalAggregatedValue;
};

// --- Execution of All Queries and Output ---
// Process each query instruction stored in the `queryInstructionSet`.
queryInstructionSet.forEach(queryInstruction => {
    const queryResult = executeQueryTraversal(
        queryInstruction.initialNodeIdentifier,
        queryInstruction.maximumPermissibleWeight
    );
    console.log(queryResult); // Display the calculated result for each query.
});

// --- Post-Processing Validation (Added Fragment) ---
// This check ensures that all lines in the input file were consumed.
// It can warn about extraneous data at the end of the input.
if (currentInputLinePointer < sanitizedInputLines.length) {
    console.warn(`Warning: ${sanitizedInputLines.length - currentInputLinePointer} unused lines found at the end of the input file.`);
}