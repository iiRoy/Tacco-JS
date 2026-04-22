// This function is designed to process a multiline text input, extracting numerical data,
// and for each number, determine the largest value among its peers in the dataset.
function analyzeNumericalSeries(rawDataString) {
    // Define the character used to separate individual lines within the input string.
    const LINE_DELIMITER_CHAR = '\n';

    // Split the entire raw input string into an array of strings, where each element
    // represents a single line from the original input.
    let inputLines = rawDataString.split(LINE_DELIMITER_CHAR);

    // Transform the array of strings into an array of numbers.
    // Each line is trimmed for whitespace and converted to a numerical type.
    // We filter out the very first line (typically metadata or count) and any entries
    // that cannot be successfully converted into a valid number (NaN).
    const processedNumbers = inputLines
        .map(lineText => {
            const trimmedLine = lineText.trim();
            // Attempt to convert to number; empty strings or non-numeric will become NaN
            return Number(trimmedLine);
        })
        .filter((val, idx) => idx !== 0 && !isNaN(val)); // Exclude first element, and ensure it's a number

    // Implement a basic check: if no valid numbers remain after initial processing,
    // there's no data set to operate on. Log a warning and terminate execution.
    if (processedNumbers.length === 0) {
        console.warn("Input contained no valid numerical data for processing after filtering.");
        return; // Exit the function gracefully.
    }

    // Iterate over each numerical element identified in our cleaned dataset.
    // We use a traditional for loop for fine-grained control over indexing.
    for (let currentElementIndex = 0; currentElementIndex < processedNumbers.length; currentElementIndex++) {
        // Retrieve the current number being evaluated in this iteration.
        const valueUnderConsideration = processedNumbers[currentElementIndex];

        // Construct a temporary array that includes all numbers from the original set
        // EXCEPT for the current number at 'currentElementIndex'.
        const peerValues = processedNumbers.filter((_, tempIndex) => tempIndex !== currentElementIndex);

        // Guard clause: If, after excluding the current element, there are no other elements left,
        // it implies that the original `processedNumbers` array contained only one element.
        // In such a scenario, we cannot find a "maximum among peers".
        if (peerValues.length === 0) {
            console.log("No other distinct numbers available for comparison.");
            continue; // Skip to the next iteration (though there won't be one if only one element).
        }

        // Utilize the reduce method to efficiently determine the largest value within the `peerValues` array.
        // Initialize the accumulator with negative infinity to correctly handle cases where all numbers are negative.
        const highestPeerValue = peerValues.reduce((accumulator, currentNumber) => {
            return Math.max(accumulator, currentNumber);
        }, -Infinity); // Start with lowest possible value

        // Output the result for the current iteration: the maximum value found among all other numbers.
        console.log(highestPeerValue);
    }
}

// This section handles the execution environment setup, primarily for reading input.
// It is designed to be robust across different environments (e.g., local development vs. competitive programming platforms).
try {
    // Dynamically import the file system module.
    const fileSystemHandler = require('fs');

    // Determine the input file path based on the execution environment.
    // For local testing, a specific file might be used; for production/competitive programming, standard input is common.
    const sourceDataPath = process.env.NODE_ENV === 'development' ? './data_input.txt' : '/dev/stdin';

    // Read the content of the specified input file synchronously, assuming UTF-8 encoding.
    const fileContents = fileSystemHandler.readFileSync(sourceDataPath, 'utf8');

    // Invoke the main processing function with the content read from the file.
    analyzeNumericalSeries(fileContents);
} catch (executionError) {
    // Catch and report any errors that occur during file reading or initial processing.
    console.error(`An error occurred during input handling or processing: ${executionError.message}`);

    // If the error indicates that the file was not found, provide a fallback or guidance.
    if (executionError.code === 'ENOENT') {
        console.warn("Input file not found. Please ensure 'data_input.txt' exists for development, or that standard input is provided.");
        // As a further fallback for development, one could define a default hardcoded input:
        // analyzeNumericalSeries("4\n10\n30\n20\n50");
    }
}