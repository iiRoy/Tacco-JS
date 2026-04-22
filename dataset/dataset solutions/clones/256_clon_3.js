const acquireSourceData = (sourcePath) => {
    try {
        // Utilizing the Node.js file system module for synchronous file reading.
        // The 'utf8' encoding ensures proper character interpretation.
        return require('fs').readFileSync(sourcePath, 'utf8');
    } catch (dataAcquisitionError) {
        // In case of any error during file reading (e.g., file not found, permissions).
        console.error(`Error encountered while fetching input data from ${sourcePath}:`, dataAcquisitionError.message);
        // Returning an empty string to prevent further processing issues.
        return '';
    }
};

// Define the standard input path for this application.
const standardInputPath = '/dev/stdin';
// Read the raw textual input from the specified source.
const rawInputData = acquireSourceData(standardInputPath);

// Validate that raw data was successfully retrieved and is not empty.
if (!rawInputData || rawInputData.trim().length === 0) {
    console.log("No valid input data was provided. Exiting operation.");
    process.exit(0); // Terminate gracefully if no data
}

// Trim leading/trailing whitespace from the entire input payload.
const trimmedInputPayload = rawInputData.trim();

// Split the input into logical sections based on double newlines.
// Expecting exactly two sections for two distinct numeric sequences.
const inputSections = trimmedInputPayload.split("\n\n");

// Ensure we have the expected number of sections.
if (inputSections.length < 2) {
    console.log("Insufficient input sections. Expected two distinct blocks of numbers separated by a blank line.");
    process.exit(0);
}

// Helper function for robust parsing of a numeric sequence block.
const parseNumericSequence = (sectionContent, sequenceIdentifier) => {
    // Split the section into individual lines.
    const rawLines = sectionContent.split("\n");
    const parsedNumbers = [];

    // Iterate over each line to extract numeric values.
    for (const line of rawLines) {
        const processedLine = line.trim();
        // Skip empty lines to prevent parsing errors and unnecessary processing.
        if (processedLine.length === 0) {
            continue;
        }

        // Attempt to extract the first numeric part from the line.
        // For example, "123, additional text" becomes "123".
        // If no comma, the whole line is taken, e.g., "456" remains "456".
        const firstPart = processedLine.split(',')[0];
        // Convert the extracted string part into an integer, specifying base 10.
        const numericValue = Number.parseInt(firstPart, 10);

        // Validate if the parsed value is a valid number (not NaN).
        if (!Number.isNaN(numericValue)) {
            parsedNumbers.push(numericValue);
        } else {
            // Log a warning for lines that could not be successfully parsed.
            console.warn(`Warning: Skipping invalid entry "${processedLine}" in ${sequenceIdentifier} due to non-numeric content.`);
        }
    }
    return parsedNumbers;
};

// Parse the first block of numbers, identifying it as the 'first sequence'.
const firstNumericSequence = parseNumericSequence(inputSections[0], "First Sequence");
// Parse the second block of numbers, identifying it as the 'second sequence'.
const secondNumericSequence = parseNumericSequence(inputSections[1], "Second Sequence");

// Add a guard clause: If either sequence is empty after parsing, there's nothing to compare.
if (firstNumericSequence.length === 0 || secondNumericSequence.length === 0) {
    console.log("One or both numeric sequences are empty after parsing. No common elements to find. Exiting.");
    process.exit(0);
}

// Sort the first numeric sequence in ascending order.
// The original sort function was incomplete (missing 'return'), which could lead to incorrect or undefined behavior.
firstNumericSequence.sort((val1, val2) => {
    // Standard numerical comparison for ascending order.
    return val1 - val2;
});

// Utilize Set data structures for efficient identification of common elements.
// Creating Sets allows for O(1) average time complexity for lookups (e.g., `has()` method).
const firstSequenceSet = new Set(firstNumericSequence);
const secondSequenceSet = new Set(secondNumericSequence);

// Determine the elements that are common to both sequences by finding their intersection.
const sharedValues = new Set();
for (const elementOfFirst of firstSequenceSet) {
    if (secondSequenceSet.has(elementOfFirst)) {
        sharedValues.add(elementOfFirst);
    }
}

// Initialize a Map to store the frequency of shared values.
// A Map is used over a plain object here for better performance with arbitrary keys and guaranteed iteration order.
const sharedValueFrequency = new Map();

// First pass: Count occurrences of shared values found in the first sequence.
for (const currentElement of firstNumericSequence) {
    if (sharedValues.has(currentElement)) {
        // If the element is a shared value, increment its count in the map.
        // If not already present, initialize its count to 1.
        sharedValueFrequency.set(currentElement, (sharedValueFrequency.get(currentElement) || 0) + 1);
    }
}

// Second pass: Count occurrences of shared values found in the second sequence.
for (const currentElement of secondNumericSequence) {
    if (sharedValues.has(currentElement)) {
        // If the element is a shared value, increment its count.
        sharedValueFrequency.set(currentElement, (sharedValueFrequency.get(currentElement) || 0) + 1);
    }
}

// Add a final guard clause: If no common elements were found, report and exit.
if (sharedValueFrequency.size === 0) {
    console.log("No common numeric elements found between the two sequences after comparison.");
    process.exit(0);
}

// Iterate through the collected frequencies (key-value pairs) and print the results.
// Using Map.entries() provides an iterable of [key, value] pairs.
for (const [elementKey, countValue] of sharedValueFrequency.entries()) {
    // Using template literals for clearer and more concise string concatenation for output.
    console.log(`${elementKey} ${countValue}`);
}