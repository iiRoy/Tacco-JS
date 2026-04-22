const fileSystemUtilities = require('fs');
const standardInputPath = '/dev/stdin';

// Utility function to safely retrieve and remove the first element from an array.
// Returns null if the array is empty, otherwise returns the shifted element.
const obtainNextLine = (sourceCollection) => {
    if (sourceCollection.length === 0) {
        // This scenario implies malformed input or unexpected end of data.
        // The original code would likely throw an error on `undefined.split`, etc.
        // For this clone, we'll return null and let calling code handle it.
        return null;
    }
    return sourceCollection.shift();
};

// Read the entire content from the specified input file synchronously.
// The content is decoded as UTF-8 text.
const rawInputContent = fileSystemUtilities.readFileSync(standardInputPath, 'utf8');

// Pre-process the raw input: remove leading/trailing whitespace, then split
// into an array of lines based on newline characters.
let processedInputLines = rawInputContent.trim().split("\n");

// A control flag for the main processing loop.
let processingIsActive = true;

// The primary loop continues as long as there are enough lines to form a
// complete data block (at least a dictionary size and a query count)
// and the processing flag is true.
while (processingIsActive && processedInputLines.length > 1) { // Requires at least two lines for the next block (dict size + query count).

    // Read the line indicating how many dictionary entries follow.
    const dictSizeLine = obtainNextLine(processedInputLines);
    if (dictSizeLine === null) {
        console.error("Error: Expected dictionary size line, but input stream ended.");
        processingIsActive = false;
        break;
    }
    // Convert the string representation of the count to an integer.
    const numberOfDictionaryEntries = parseInt(dictSizeLine, 10);

    // Basic validation for the parsed number.
    if (isNaN(numberOfDictionaryEntries) || numberOfDictionaryEntries < 0) {
        console.warn(`Warning: Invalid number of dictionary entries encountered ('${dictSizeLine}'). Skipping this block.`);
        // To mirror the original's behavior (which might crash or misinterpret),
        // we'll try to continue, but this might lead to further errors.
        // A more robust solution would be to consume lines or break.
    }

    // Initialize a JavaScript Map for efficient key-value lookups.
    // This serves as the translation dictionary for the current block.
    const currentTranslationMap = new Map();

    // Populate the translation map with key-value pairs.
    for (let entryIndex = 0; entryIndex < numberOfDictionaryEntries; ++entryIndex) {
        const mapEntryLine = obtainNextLine(processedInputLines);
        if (mapEntryLine === null) {
            console.error("Error: Expected dictionary entry line, but input stream ended prematurely.");
            processingIsActive = false;
            break; // Exit inner loop
        }
        // Split each line by space to get the key and its corresponding value.
        const entryComponents = mapEntryLine.split(" ");
        // Ensure there are at least two components (key and value).
        if (entryComponents.length >= 2) {
            currentTranslationMap.set(entryComponents[0], entryComponents[1]);
        } else {
            console.warn(`Warning: Malformed dictionary entry '${mapEntryLine}' skipped.`);
        }
    }

    // If an error occurred during dictionary population, terminate the main loop.
    if (!processingIsActive) {
        break;
    }

    // Read the line specifying the number of terms to query.
    const queryCountLine = obtainNextLine(processedInputLines);
    if (queryCountLine === null) {
        console.error("Error: Expected query count line, but input stream ended.");
        processingIsActive = false;
        break;
    }
    // Convert the query count string to an integer.
    const totalQueryTerms = parseInt(queryCountLine, 10);

    // Basic validation for the parsed query count.
    if (isNaN(totalQueryTerms) || totalQueryTerms < 0) {
        console.warn(`Warning: Invalid number of query terms encountered ('${queryCountLine}'). Skipping output for this block.`);
        // Similar to dict size, assume input is well-formed for counts.
    }

    // An array to accumulate the translated/original terms before joining.
    // This is generally more efficient than repeated string concatenation.
    const composedOutputSegments = [];

    // Process each query term.
    for (let termIndex = 0; termIndex < totalQueryTerms; ++termIndex) {
        const termToLookup = obtainNextLine(processedInputLines);
        if (termToLookup === null) {
            console.error("Error: Expected query term line, but input stream ended prematurely.");
            processingIsActive = false;
            break; // Exit inner loop
        }
        // Attempt to retrieve the translation from the map.
        const mappedValue = currentTranslationMap.get(termToLookup);
        // Append either the translated value (if found) or the original term.
        composedOutputSegments.push(mappedValue !== undefined ? mappedValue : termToLookup);
    }

    // If an error occurred during query processing, terminate the main loop.
    if (!processingIsActive) {
        break;
    }

    // Join all collected segments into a single string and print it to standard output.
    // Explicitly add a newline character at the end.
    process.stdout.write(composedOutputSegments.join('') + '\n');

    // Check for the termination sentinel. If the next line is "0", it signals
    // that there are no more data blocks to process.
    if (processedInputLines.length > 0 && processedInputLines[0] === "0") {
        obtainNextLine(processedInputLines); // Consume the '0' sentinel.
        processingIsActive = false; // Set flag to stop the main loop.
    }
}