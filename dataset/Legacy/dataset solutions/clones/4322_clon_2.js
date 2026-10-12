var limitVal = Number.MAX_SAFE_INTEGER; // A very large integer constant for initial comparisons.

/**
 * This function processes a given string of data to find a specific maximum pair.
 * It reads lines, parses numbers, and identifies the pair with the highest first element.
 * @param {string} rawDataString - The entire input content as a single string.
 */
function ProcessData(rawDataString) {
    // Initialize a container to hold the currently identified "best" pair.
    // The first element tracks the maximum value found, the second is its associated value.
    // We start with 0 for the maximum and the global limit for the associated value.
    var bestPair = [0, limitVal];

    // Divide the incoming string into an array of individual lines, using newline as a delimiter.
    // The original 'rawDataString' variable is reassigned to this array.
    rawDataString = rawDataString.split("\n");

    // Iterate through the array of lines, starting from the second line (index 1).
    // The first line is typically skipped as it might contain header information or counts.
    for (var idx = 1; idx < rawDataString.length; idx++) {
        // For each line, split it into parts based on spaces.
        // This assumes each line contains at least two space-separated values.
        var currentEntry = rawDataString[idx].split(" ");

        // Compare the first element of the 'bestPair' with the first element of the 'currentEntry'.
        // Note: These are string comparisons initially, but JavaScript's `<` operator will attempt
        // numeric conversion if both operands are numbers or can be converted to numbers.
        if (bestPair[0] < currentEntry[0]) {
            // If the current entry's first element is greater, update 'bestPair' to reference 'currentEntry'.
            bestPair = currentEntry;
        }
    }

    // After iterating through all relevant entries, calculate the final result.
    // The elements of 'bestPair' are strings, so `-0` is used to explicitly convert them to numbers
    // before performing the addition. This ensures correct arithmetic behavior.
    console.log(bestPair[0] - 0 + (bestPair[1] - 0));
}

// The program execution starts here.
// It reads the content of standard input, decodes it as UTF-8, removes leading/trailing whitespace,
// and then passes the resulting string to the 'ProcessData' function for processing.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
