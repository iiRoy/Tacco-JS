let logOutput = console.info; // Utility for logging information to the console

// Module-scoped storage for processed input lines.
// This design choice avoids relying on global variables directly accessible everywhere,
// promoting a slightly more encapsulated approach.
let moduleInputBuffer;

/**
 * Initializes the processing pipeline by taking raw input,
 * segmenting it, and then orchestrating the main data handling logic.
 *
 * @param {string} rawSourceContent - The entire input as a single string.
 */
function initiateDataProcessing(rawSourceContent) {
    if (!rawSourceContent || rawSourceContent.trim() === '') {
        logOutput("Notification: Input content is empty or only whitespace. No data to process.");
        return;
    }

    // Split the raw content into individual lines, trim whitespace from each,
    // and filter out any lines that become empty after trimming.
    moduleInputBuffer = rawSourceContent.split('\n')
                                      .map(line => line.trim())
                                      .filter(line => line.length > 0);

    // If, after cleaning, there are no meaningful lines, exit early.
    if (moduleInputBuffer.length === 0) {
        logOutput("Notification: All input lines were empty after trimming. No data to process.");
        return;
    }

    // Define a function that provides the next line from the buffer.
    // This abstracts the source of lines for the main processing function.
    const getNextLine = () => moduleInputBuffer.shift();

    // Begin the primary data orchestration with the line provider.
    orchestrateMainProcessing(getNextLine);
}

/**
 * Extracts a sequence of numbers from a single line of text.
 * This function assumes the line is space-delimited.
 *
 * @param {Function} lineFetcher - A function that returns the next line of input.
 * @returns {Array<number>} An array containing the parsed integer values.
 */
function retrieveNumericSequence(lineFetcher) {
    const currentLine = lineFetcher();
    if (!currentLine) {
        // If there's no line, return an empty array.
        return [];
    }

    // Split the line by spaces, convert each part to an integer,
    // and then filter out any results that are not valid numbers (NaN).
    const numericParts = currentLine.split(' ')
                                    .map(part => Number.parseInt(part, 10))
                                    .filter(val => !Number.isNaN(val));

    return numericParts;
}

/**
 * Extends the Array prototype to compute the sum of its numeric elements.
 * Non-numeric elements are gracefully ignored.
 *
 * @returns {number} The sum of all numeric elements in the array.
 */
Array.prototype.computeNumericSum = function() {
    // Use reduce to accumulate the sum.
    // A type check ensures only numbers contribute to the sum.
    return this.reduce((accumulator, currentValue) => {
        return (typeof currentValue === 'number' && !Number.isNaN(currentValue))
               ? accumulator + currentValue
               : accumulator;
    }, 0); // Initialize accumulator to 0.
};

/**
 * Extends the Array prototype to format its elements into a delimited string.
 *
 * @param {string} [delimiter=' '] - The string to use between elements. Defaults to a space.
 * @returns {string} The formatted string, or an empty string if the array is empty.
 */
Array.prototype.toFormattedString = function(delimiter = ' ') {
    // If the array is empty, return an empty string immediately.
    if (this.length === 0) {
        return "";
    }
    return this.join(delimiter);
};

/**
 * Extends the Array prototype to create a shallow copy of the array.
 *
 * @returns {Array} A new array containing the same elements as the original.
 */
Array.prototype.makeShallowCopy = function() {
    // Using the spread syntax for concise shallow copying.
    return [...this];
};

/**
 * Extends the Array prototype to sort its elements numerically in ascending order.
 * It modifies the array in place and returns a reference to it.
 *
 * @returns {Array} The sorted array (this).
 */
Array.prototype.sortNumerically = function() {
    this.sort((valA, valB) => {
        // Basic type checking for robustness. Non-numbers are treated as equal for sorting.
        if (typeof valA !== 'number' || typeof valB !== 'number' || Number.isNaN(valA) || Number.isNaN(valB)) {
            return 0;
        }
        return valA - valB; // Standard numeric ascending sort.
    });
    return this;
};

/**
 * Generates a comparison function suitable for Array.prototype.sort(),
 * allowing sorting of arrays of objects/arrays based on a specific property/index.
 *
 * @param {number} comparisonIndex - The index of the element to compare.
 * @param {boolean} [isDescending=false] - If true, sorts in descending order.
 * @param {Function} [tieBreakerFn=(a, b) => 0] - An optional function to resolve ties.
 * @returns {Function} A comparison function (a, b) => number.
 */
function createIndexedComparator(comparisonIndex, isDescending = false, tieBreakerFn = (a, b) => 0) {
    const directionFactor = isDescending ? -1 : 1;

    return function(elementA, elementB) {
        const valueA = elementA[comparisonIndex];
        const valueB = elementB[comparisonIndex];

        // Handle undefined or null values at the comparison index.
        if (valueA === undefined && valueB === undefined) return tieBreakerFn(elementA, elementB);
        if (valueA === undefined) return -1 * directionFactor; // Undefined comes before defined
        if (valueB === undefined) return 1 * directionFactor;

        if (valueA < valueB) {
            return -1 * directionFactor;
        } else if (valueA > valueB) {
            return 1 * directionFactor;
        }

        // If values are equal, use the tie-breaker function.
        return tieBreakerFn(elementA, elementB);
    };
}

/**
 * The core logic for processing the input data:
 * Aggregates numeric values by a category key, sorts them, and then outputs.
 *
 * @param {Function} lineSupplier - A function that provides the next line of input.
 */
function orchestrateMainProcessing(lineSupplier) {
    // Use a Map for efficient aggregation of data by category key.
    const aggregatedCategoryData = new Map();
    let currentInputLine;
    let lineNumber = 0; // For better error reporting

    // Loop through all available input lines.
    while ((currentInputLine = lineSupplier()) !== undefined && currentInputLine !== null) {
        lineNumber++;
        const lineSegments = currentInputLine.split(' ');

        // Validate that the line has at least two parts (key and value).
        if (lineSegments.length < 2) {
            logOutput(`Warning: Skipping malformed line ${lineNumber}: "${currentInputLine}". Expected at least two parts.`);
            continue;
        }

        const categoryIdentifier = lineSegments[0];
        const rawNumericValue = Number.parseInt(lineSegments[1], 10);

        // Validate that the second part is a valid number.
        if (Number.isNaN(rawNumericValue)) {
            logOutput(`Warning: Skipping line ${lineNumber}: "${currentInputLine}". Numeric value is invalid.`);
            continue;
        }

        // If the category doesn't exist in the map, initialize it with an empty array.
        if (!aggregatedCategoryData.has(categoryIdentifier)) {
            aggregatedCategoryData.set(categoryIdentifier, []);
        }

        // Add the parsed numeric value to its corresponding category array.
        aggregatedCategoryData.get(categoryIdentifier).push(rawNumericValue);
    }

    // If no data was processed after reading all lines, report and exit.
    if (aggregatedCategoryData.size === 0) {
        logOutput("Notification: No valid data entries were processed for aggregation.");
        return;
    }

    // Convert the Map entries into an array of [key, valueArray] pairs
    // so it can be sorted using the custom comparator.
    const finalGroupedList = Array.from(aggregatedCategoryData.entries());

    // Sort the aggregated data by the category identifier (which is at index 0 of each entry).
    finalGroupedList.sort(createIndexedComparator(0));

    // Iterate through the sorted categories and output the results.
    for (const dataEntry of finalGroupedList) {
        const categoryKey = dataEntry[0];
        const associatedValues = dataEntry[1];

        // Output the category key.
        logOutput(categoryKey);

        // Sort the associated values numerically and then format them into a string for output.
        logOutput(associatedValues.sortNumerically().toFormattedString());
    }
}

// --- Application Entry Point and File Reading ---

// Use a specific file name for clarity and potential configuration.
const dataInputFile = "source_data.txt";
const fileSystemModule = require("fs");

try {
    // Read the content of the specified input file synchronously.
    const fileContents = fileSystemModule.readFileSync(dataInputFile, "utf8");
    // Pass the file content to the main processing initiation function.
    initiateDataProcessing(fileContents);
} catch (readError) {
    // Handle potential errors during file reading, such as file not found.
    console.error(`Error encountered while accessing input file '${dataInputFile}':`, readError.message);
    // Optionally log stack trace for debugging.
    // console.error(readError.stack);
}