const fileSystemModule = require('fs');

// Custom function to handle input acquisition with basic error handling
function fetchInputDataLines(inputFilePath) {
    try {
        // Read the entire file content as a UTF-8 string
        const rawFileContent = fileSystemModule.readFileSync(inputFilePath, 'utf8');
        // Split the content by newline, ensuring no empty strings from trailing newlines
        const processedLines = rawFileContent.split('\n').filter(singleLine => singleLine.trim().length > 0);
        return processedLines;
    } catch (errorReadingFile) {
        console.error("Input data acquisition failed:", errorReadingFile.message);
        // In case of error, return an empty array to prevent further processing with invalid data
        return [];
    }
}

// Define the source path for standard input
const standardInputSource = '/dev/stdin';
// Retrieve all lines from the input source
const dataLineCollection = fetchInputDataLines(standardInputSource);

// Perform initial validation on the retrieved data
if (dataLineCollection.length === 0) {
    console.error("Error: No data lines were successfully loaded from the input source. Program will terminate.");
    process.exit(1); // Exit with a non-zero code to indicate an error
}

// Extract the primary configuration parameters from the very first line
const initialConfigurationParts = dataLineCollection[0].split(' ');

// Validate the structure of the configuration line
if (initialConfigurationParts.length < 2) {
    console.error("Error: Initial configuration line is malformed. Expected at least two numeric values (N and K).");
    process.exit(1);
}

// Parse the total count of entities (N) and the number of operational data blocks (K)
const totalEntityCount = parseInt(initialConfigurationParts[0], 10);
const numberOfOperationBlocks = parseInt(initialConfigurationParts[1], 10);

// Initialize a status tracker for each entity. All entities start with a 'no interaction' status (0).
// Using Array.from for initialization instead of `new Array().fill()`.
const entityInteractionStatus = Array.from({ length: totalEntityCount }, () => 0);

// Helper function to safely convert a space-separated string of numbers into an array of integers
const convertStringOfNumbersToArray = (numericString) => {
    if (typeof numericString !== 'string' || numericString.trim() === '') {
        return []; // Return an empty array for invalid or empty input strings
    }
    return numericString.split(' ').map(item => parseInt(item, 10)); // Ensure base 10 for parsing
};

// Variable to keep track of the current line index in `dataLineCollection`
// We start after the initial N, K line (index 0)
let currentInputLinePointer = 1;

// Iterate through each defined operation block
for (let blockIteration = 0; blockIteration < numberOfOperationBlocks; ++blockIteration) {
    // The first line of each block typically specifies the count of items (ignored in original logic, but we'll read it)
    const itemCountSpecificationLine = dataLineCollection[currentInputLinePointer];
    const reportedItemCount = parseInt(itemCountSpecificationLine, 10); // Parse, but may not use directly

    // The second line of each block contains the actual 1-indexed entity identifiers
    const entityIdentifiersLine = dataLineCollection[currentInputLinePointer + 1];

    // Robustness check: Ensure the entity identifiers line exists
    if (!entityIdentifiersLine) {
        console.warn(`Warning: Data block ${blockIteration + 1} is incomplete or missing entity identifiers. Skipping this block.`);
        // Move the pointer past where these two lines *should* have been
        currentInputLinePointer += 2;
        continue; // Skip to the next block iteration
    }

    // Convert the string of identifiers into an array of numbers
    const affectedEntityList = convertStringOfNumbersToArray(entityIdentifiersLine);

    // Optional validation: Check if the number of parsed entities matches the reported count
    if (!isNaN(reportedItemCount) && affectedEntityList.length !== reportedItemCount) {
        console.warn(`Notice: For block ${blockIteration + 1}, reported item count (${reportedItemCount}) differs from actual items found (${affectedEntityList.length}). Proceeding with found items.`);
    }

    // Process each entity identifier within the current block
    for (const entityId of affectedEntityList) {
        // Adjust the 1-based entity ID to a 0-based array index
        const targetArrayIndex = entityId - 1;

        // Guard clause: Ensure the entity ID is within the valid range [1, totalEntityCount]
        if (targetArrayIndex >= 0 && targetArrayIndex < totalEntityCount) {
            // Increment the interaction counter for the specific entity
            entityInteractionStatus[targetArrayIndex]++;
        } else {
            console.warn(`Invalid entity identifier '${entityId}' encountered in block ${blockIteration + 1}. This ID is out of the valid range [1, ${totalEntityCount}]. It will be ignored.`);
        }
    }

    // Advance the input line pointer by 2 to move to the next operation block
    currentInputLinePointer += 2;
}

// Final step: Determine the number of entities that had zero interactions
let entitiesWithoutInteractionCount = 0;
// Using a traditional loop for counting instead of array methods for variation
for (let k = 0; k < totalEntityCount; ++k) {
    if (entityInteractionStatus[k] === 0) { // Check for zero interaction
        entitiesWithoutInteractionCount++;
    }
}

// Output the final computed count to the standard output stream
console.log(entitiesWithoutInteractionCount);