const fileContentBuffer = require('fs').readFileSync('/dev/stdin');
const processedInputLines = fileContentBuffer.toString().split('\n');

// --- Input Acquisition and Preliminary Validation ---
// Ensure sufficient input lines are present for processing.
if (processedInputLines.length < 2) {
    // Output an error message to standard error stream and terminate.
    console.error("Input Error: Not enough data lines provided. Expected at least two lines.");
    process.exit(1);
}

const declaredArraySizeStr = processedInputLines[0];
const rawDataElementsStr = processedInputLines[1];

// Validate and parse the declared size of the sequence.
const sequenceLength = parseInt(declaredArraySizeStr, 10);
if (isNaN(sequenceLength) || sequenceLength <= 0) {
    console.error("Input Error: Invalid or non-positive array size declared.");
    process.exit(1);
}

// Parse the string of numbers into an array of integers.
const elementArray = rawDataElementsStr.split(' ').map(strVal => {
    const numVal = parseInt(strVal, 10);
    // Perform individual element validation during parsing.
    if (isNaN(numVal)) {
        console.error(`Input Error: Non-numeric value '${strVal}' found in data sequence.`);
        process.exit(1);
    }
    return numVal;
});

// Final check: Does the parsed array length match the declared length?
if (elementArray.length !== sequenceLength) {
    console.warn(`Warning: Declared array size (${sequenceLength}) does not match actual element count (${elementArray.length}). Using actual count for processing.`);
    // Depending on requirements, this could be a fatal error, but here we proceed with a warning.
}

// --- Core Processing: Step 1 - Populate Frequency Map ---
// This Map will store the frequencies of the expression (element_value + element_index_one_based)
// The problem implies a relationship based on 1-based indexing for 'i'.
// So for a 0-indexed array `A`, the term `Ai + i` becomes `A[idx] + (idx + 1)`.
const calculatedSumFrequencies = new Map();

// Iterate through each element with its 0-based index.
for (let currentIdx = 0; currentIdx < elementArray.length; currentIdx++) {
    const elementValue = elementArray[currentIdx];

    // Calculate the unique identifier for this element based on the 'Ai + i' part.
    // We add 1 to currentIdx to convert it to a 1-based index as per problem formulation.
    const sumIdentifier = elementValue + (currentIdx + 1);

    // Increment the frequency count for this sumIdentifier.
    // If the identifier is encountered for the first time, initialize its count to 1.
    calculatedSumFrequencies.set(sumIdentifier, (calculatedSumFrequencies.get(sumIdentifier) || 0) + 1);
}

// --- Core Processing: Step 2 - Count Matching Pairs ---
// Initialize a variable to accumulate the total count of pairs that satisfy the condition.
let totalValidPairsCount = 0;

// Iterate through the array again to evaluate the second part of the relationship: 'k - Ak'.
// Here, 'k' also refers to a 1-based index.
for (let currentPosition = 0; currentPosition < elementArray.length; currentPosition++) {
    const valueAtCurrentPos = elementArray[currentPosition];

    // Calculate the lookup key for the map based on the 'k - Ak' part.
    // Again, (currentPosition + 1) is used for the 1-based index 'k'.
    const lookupIdentifier = (currentPosition + 1) - valueAtCurrentPos;

    // Check if this calculated lookupIdentifier exists as a key in our frequency map.
    if (calculatedSumFrequencies.has(lookupIdentifier)) {
        // If it exists, add its frequency (number of times 'Ai + i' resulted in this value)
        // to our total count of matching pairs.
        totalValidPairsCount += calculatedSumFrequencies.get(lookupIdentifier);
    }
}

// --- Output the Final Result ---
// Display the total number of pairs found to standard output.
console.log(totalValidPairsCount);