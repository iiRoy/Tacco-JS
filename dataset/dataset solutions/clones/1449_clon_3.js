const fileSystemHandler = require('fs');

let inputBufferContent = '';
try {
    // Attempt to retrieve the raw data from standard input.
    // Specifying 'utf8' ensures proper character encoding.
    inputBufferContent = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');
} catch (dataReadError) {
    // In case of any error during file reading, log it and terminate.
    console.error("Failed to acquire input data: " + dataReadError.message);
    process.exit(1);
}

// Process the raw input string by splitting it into an array of lines.
// This regex handles both Unix-style ('\n') and Windows-style ('\r\n') line endings.
const parsedInputRows = inputBufferContent.split(/\r?\n/);

// Define the minimum number of lines expected for valid input processing.
const minimumRequiredRows = 4;

// Implement a guard clause to ensure sufficient input data.
if (parsedInputRows.length < minimumRequiredRows) {
    console.error("Insufficient lines detected in input. A minimum of " + minimumRequiredRows + " lines is necessary.");
    process.exit(1); // Exit with an error code.
}

// Extract the primary data set from the second line (index 1).
// Utilize a regex to split by one or more whitespace characters, then filter out any empty strings.
const primaryDataset = parsedInputRows[1].split(/\s+/).filter(Boolean);

// Extract the secondary data set from the fourth line (index 3).
// Apply the same robust splitting and filtering for consistency.
const secondaryDataset = parsedInputRows[3].split(/\s+/).filter(Boolean);

// Initialize a JavaScript Set object for efficient storage and lookup of unique elements.
// This provides average O(1) time complexity for 'add' and 'has' operations.
const uniqueElementRegistry = new Set();

// Populate the registry with elements from the primary dataset.
// This step ensures that each unique item is stored only once,
// optimizing subsequent lookup operations.
for (const currentElement of primaryDataset) {
    // Only add non-empty strings to prevent issues with malformed input.
    if (currentElement) {
        uniqueElementRegistry.add(currentElement);
    }
}

// Declare and initialize a counter for tracking matching elements.
let totalIdenticalElements = 0;

// Iterate through each element in the secondary dataset.
for (const candidateTarget of secondaryDataset) {
    // Before checking, ensure the candidate is a valid, non-empty string.
    if (candidateTarget) {
        // Check if the current candidate element exists within our unique registry.
        const isPresentInRegistry = uniqueElementRegistry.has(candidateTarget);

        // If the element is found, increment our match counter.
        if (isPresentInRegistry) {
            totalIdenticalElements++;
        }
    }
}

// Output the final tally of common elements found between the two datasets.
console.log(totalIdenticalElements);