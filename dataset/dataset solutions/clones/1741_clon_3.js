// Function to process the provided raw string data and calculate a specific sum.
// This utility aims to read a numerical limit from the first line of input
// and then sum the smallest 'limit' values from a list of numbers provided on the second line.
function ExecuteSolution(sourceData) {
    // Ensure the input string is cleaned by removing leading/trailing whitespace.
    // Then, split the string into individual lines.
    // Each line is subsequently split by spaces to produce an array of tokens.
    let processedLines = sourceData
        .trim() // Standardize input by removing outer whitespace.
        .split("\n") // Break the input into an array of strings, one for each line.
        .map(segment => segment.split(" ")); // For each line, split it into an array of words/numbers based on spaces.

    // Implement a basic validation check: we expect at least two lines of data.
    // The first line for the limit, the second for the numbers.
    if (processedLines.length < 2) {
        console.error("ERROR: Insufficient input data. Expected at least two distinct lines.");
        // If the input structure is fundamentally incorrect, we terminate early.
        return;
    }

    // Extract the tokens from the very first line of the input.
    const firstLineTokens = processedLines[0];
    // Attempt to parse the second token on the first line as our numerical selection limit.
    // Using `Number()` for type conversion, which handles various numerical string formats.
    let selectionSize = Number(firstLineTokens[1]);

    // Perform validation on the extracted selection size.
    // It must be a valid non-negative number.
    if (isNaN(selectionSize) || selectionSize < 0) {
        console.error("ERROR: The provided selection size is invalid or negative.");
        // Exit if the limit is not usable.
        return;
    }

    // Retrieve the raw string representations of numbers from the second line.
    const rawNumericStrings = processedLines[1];
    // Convert these string representations into actual numbers.
    // A filter step is added to ensure that only valid numerical values are retained,
    // discarding any entries that couldn't be parsed into a number (e.g., "abc").
    let dataElements = rawNumericStrings
        .map(Number) // Transforms each string element into a number.
        .filter(val => !isNaN(val)); // Removes any results from `Number()` that are `NaN`.

    // If, after parsing and filtering, there are no valid numbers to process,
    // the sum is naturally zero. Print and exit.
    if (dataElements.length === 0) {
        console.log(0);
        return;
    }

    // Sort the array of numeric elements in ascending order.
    // An arrow function is used directly within `sort` for conciseness,
    // replacing the need for a separate named comparison function.
    dataElements.sort((valA, valB) => valA - valB);

    // Determine the effective number of elements to sum.
    // This ensures we don't try to sum more elements than are actually available in the array,
    // even if the `selectionSize` requested is higher.
    const actualSelectionLimit = Math.min(selectionSize, dataElements.length);

    let computedTotal = 0; // Initialize our accumulator for the sum.
    let currentElementIndex = 0; // A counter variable to track our position during iteration.

    // Iterate through the sorted `dataElements` and sum the first `actualSelectionLimit` values.
    // A `while` loop is used here as an alternative to a traditional `for` loop.
    while (currentElementIndex < actualSelectionLimit) {
        computedTotal += dataElements[currentElementIndex];
        currentElementIndex++; // Advance to the next element.
    }

    // Output the final calculated sum to the console.
    console.log(computedTotal);
}

// This section serves as the script's entry point.
// It reads the entire content of the standard input stream (`/dev/stdin`) as a UTF-8 string.
// This raw data string is then passed to our `ExecuteSolution` function for processing.
ExecuteSolution(require("fs").readFileSync("/dev/stdin", "utf8"));