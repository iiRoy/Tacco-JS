const fileSystemModule = require('fs');

// A utility function to safely read content from a specified path.
// This encapsulates the file reading logic, making it reusable and potentially more robust.
const retrieveRawInputContent = (sourcePath) => {
    try {
        // Attempt to read the file synchronously.
        return fileSystemModule.readFileSync(sourcePath, 'utf8');
    } catch (errorDetails) {
        // In case of an error during file reading, log and return an empty string
        // to prevent subsequent operations from failing on undefined input.
        console.error("Input acquisition error:", errorDetails.message);
        return "";
    }
};

// Obtain the raw string content from standard input.
let rawContentBuffer = retrieveRawInputContent('/dev/stdin');

// Initial validation: If the input is empty or just whitespace, terminate.
// This is a guard clause to prevent processing invalid data.
if (!rawContentBuffer.trim()) {
    // console.error("No meaningful input provided. Terminating operation.");
    process.exit(1);
}

// Split the entire content into individual lines, trimming overall whitespace first.
let parsedInputLines = rawContentBuffer.trim().split("\n");

// Ensure there's at least one line to process (the count line).
if (parsedInputLines.length === 0) {
    // console.error("Input contains no lines. Terminating operation.");
    process.exit(1);
}

// Extract the first line, which is expected to be the total count of subsequent data entries.
const declarationOfEntriesString = parsedInputLines.shift();
const expectedDataEntryCount = Number(declarationOfEntriesString);

// Validate the expected entry count. It must be a non-negative number.
if (isNaN(expectedDataEntryCount) || expectedDataEntryCount < 0) {
    // console.error(`Invalid entry count '${declarationOfEntriesString}' specified. Terminating.`);
    process.exit(1);
}

// A Map is used for aggregation, offering potentially better performance and key handling
// compared to a plain JavaScript object, especially with arbitrary string keys.
const dataAggregateStore = new Map();

// Iterate over the lines that represent actual data entries.
// Use slice to ensure we only process up to the declared number of entries.
parsedInputLines.slice(0, expectedDataEntryCount).forEach((currentDataLine, lineIdx) => {
    // Skip any empty or purely whitespace lines within the data entries.
    if (!currentDataLine || currentDataLine.trim() === "") {
        // console.warn(`Skipping empty or whitespace line at index ${lineIdx}.`);
        return;
    }

    // Split each data line into its constituent parts (identifier and value).
    const lineComponents = currentDataLine.split(" ");

    // Validate that each data line has at least two components.
    if (lineComponents.length < 2) {
        // console.warn(`Skipping malformed line (insufficient components) at index ${lineIdx}: "${currentDataLine}"`);
        return;
    }

    const primaryIdentifier = lineComponents[0];
    // Explicitly convert the second component to a number.
    const associatedNumericValue = Number(lineComponents[1]);

    // Validate that the second component is indeed a number.
    if (isNaN(associatedNumericValue)) {
        // console.warn(`Skipping line with non-numeric value at index ${lineIdx}: "${currentDataLine}"`);
        return;
    }

    // Retrieve the current aggregated total for this identifier, defaulting to 0 if not present.
    const existingTotal = dataAggregateStore.get(primaryIdentifier) || 0;
    // Update the aggregate store with the new total.
    dataAggregateStore.set(primaryIdentifier, existingTotal + associatedNumericValue);
});

// Extract all unique identifiers (keys) from the aggregation map.
let collectedIdentifiers = Array.from(dataAggregateStore.keys());

// Define a custom comparison function for sorting.
// This comparator first sorts by string length, and then by lexicographical order for strings of equal length.
const detailedIdentifierComparator = (identifierA, identifierB) => {
    // Primary sort criterion: length of the identifier.
    if (identifierA.length !== identifierB.length) {
        return identifierA.length - identifierB.length;
    }
    // Secondary sort criterion: lexicographical comparison if lengths are identical.
    return identifierA.localeCompare(identifierB);
};

// Apply the custom sort to the collection of identifiers.
collectedIdentifiers.sort(detailedIdentifierComparator);

// Iterate through the sorted identifiers and print each one along with its aggregated sum.
collectedIdentifiers.forEach(currentOutputIdentifier => {
    const finalCalculatedSum = dataAggregateStore.get(currentOutputIdentifier);
    // Use template literals for clean string formatting.
    console.log(`${currentOutputIdentifier} ${finalCalculatedSum}`);
});