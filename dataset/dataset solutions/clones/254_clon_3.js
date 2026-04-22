const filesystemModule = require('fs'); // Import the standard filesystem module for file operations.

// Read the complete input from the designated standard input file path.
// The content is decoded as UTF-8.
// Trim any leading or trailing whitespace from the entire content block.
// Then, split the content into an array of individual lines based on newline characters.
// A filter is applied to remove any lines that might be empty after trimming.
const fullFileContent = filesystemModule.readFileSync('/dev/stdin', 'utf8');
const rawEntryLines = fullFileContent.trim().split('\n').filter(line => line.length > 0);

// Initialize two distinct data collections.
// The original implementation used `lines.shift()` in sequential loops, which
// would typically empty the `lines` array in the first loop, leaving the second
// collection (tm) unpopulated. To ensure both collections contain data for
// subsequent processing, we explicitly divide the input lines into two segments.
const leftCollection = [];
const rightCollection = [];

// Determine a point to divide the input lines. For this demonstration,
// the lines are split approximately in half. This ensures both collections
// receive a portion of the input, making the comparison logic meaningful.
const divisionPoint = Math.floor(rawEntryLines.length / 2);

let currentLineIndex = 0; // Initialize an index to track progress through the raw input lines.

// Populate the `leftCollection` using the first segment of the input lines.
while (currentLineIndex < divisionPoint) {
    const activeLine = rawEntryLines[currentLineIndex];
    // Extract the part of the line before the first comma.
    const processedPart = activeLine.split(',')[0];
    // Only add the extracted part to the collection if it's not an empty string.
    if (processedPart) {
        leftCollection.push(processedPart);
    }
    currentLineIndex++; // Move to the next line.
}

// Populate the `rightCollection` using the remaining segment of the input lines.
while (currentLineIndex < rawEntryLines.length) {
    const activeLine = rawEntryLines[currentLineIndex];
    const processedPart = activeLine.split(',')[0];
    if (processedPart) {
        rightCollection.push(processedPart);
    }
    currentLineIndex++; // Advance the index.
}

// Sort the `leftCollection` numerically.
// The comparison function `(a, b) => a - b` is for numeric sorting.
// Explicitly converting to `Number` ensures robust numeric comparison.
leftCollection.sort((firstVal, secondVal) => Number(firstVal) - Number(secondVal));

// To enhance efficiency and avoid repeated linear scans (like `filter().length`),
// we pre-calculate the frequency of each unique value in both collections using Map objects.
const leftValueFrequencies = new Map();
// Iterate through each element in the `leftCollection`.
for (const elementOfLeft of leftCollection) {
    // Increment the count for the current element, or initialize it to 1 if it's new.
    leftValueFrequencies.set(elementOfLeft, (leftValueFrequencies.get(elementOfLeft) || 0) + 1);
}

const rightValueFrequencies = new Map();
// Iterate through each element in the `rightCollection`.
for (const elementOfRight of rightCollection) {
    rightValueFrequencies.set(elementOfRight, (rightValueFrequencies.get(elementOfRight) || 0) + 1);
}

// Introduce a Set to keep track of values that have already been processed and outputted.
// This prevents duplicate output if the `leftCollection` contains multiple occurrences
// of the same item and we iterate over its raw elements or keys.
const alreadyProcessedValues = new Set();

// Iterate through each *unique* value present as a key in the `leftValueFrequencies` map.
// This approach ensures each distinct item from `leftCollection` is considered only once.
for (const candidateValue of leftValueFrequencies.keys()) {
    // If this specific value has already been handled in a prior iteration, skip it.
    if (alreadyProcessedValues.has(candidateValue)) {
        continue;
    }
    // Mark the current candidate value as processed to avoid re-processing.
    alreadyProcessedValues.add(candidateValue);

    // Retrieve the frequency count of the `candidateValue` from the `rightCollection`.
    // Default to 0 if the value is not found in the `rightCollection`.
    const matchCountRight = rightValueFrequencies.get(candidateValue) || 0;

    // Only proceed to calculate and print if the `candidateValue` exists
    // at least once in the `rightCollection`.
    if (matchCountRight > 0) {
        // Retrieve the frequency count of the `candidateValue` from the `leftCollection`.
        const matchCountLeft = leftValueFrequencies.get(candidateValue) || 0;
        
        // Output the candidate value, followed by the sum of its occurrences
        // in both the `rightCollection` and `leftCollection`.
        console.log(candidateValue, matchCountRight + matchCountLeft);
    }
}