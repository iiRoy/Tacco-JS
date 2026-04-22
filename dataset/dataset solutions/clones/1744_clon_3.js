// This module is designed to process a specific type of textual input
// and compute the sum of a designated number of smallest elements from a list.
// It expects input in a multi-line string format.
function ProcessInputData(receivedText) {
    // Perform an initial check for the validity and presence of the input data.
    if (!receivedText || typeof receivedText !== 'string' || receivedText.trim() === '') {
        console.error("Execution Aborted: Input data is either missing, not a string, or empty.");
        return; // Terminate if input is critically flawed.
    }

    // Deconstruct the incoming text into an array of individual lines.
    const textLines = receivedText.split('\n');

    // Verify that the input contains at least the two expected lines:
    // one for configuration (N K) and another for the numerical sequence.
    if (textLines.length < 2) {
        console.error("Execution Aborted: Insufficient number of lines in the input text.");
        return;
    }

    // Parse the first line to extract parameters.
    // The first value (N) is discarded as it's not utilized in the core logic.
    // The second value (K) indicates how many smallest elements to sum.
    const [discardedNString, subsetSizeString] = textLines[0].split(' ');
    const targetSubsetCount = parseInt(subsetSizeString, 10);

    // Validate the extracted 'K' (targetSubsetCount) to ensure it's a valid number.
    if (isNaN(targetSubsetCount)) {
        console.error("Execution Aborted: The target subset count (K) is not a valid numerical value.");
        return;
    }

    // Process the second line of the input to convert space-separated strings into numbers.
    // Empty strings resulting from multiple spaces are filtered out.
    const rawNumberStrings = textLines[1].split(' ').filter(s => s !== '');

    // Convert each string representation to an integer.
    // If a string cannot be parsed, parseInt will yield NaN, which will propagate through the sum.
    const integerValues = rawNumberStrings.map(valString => parseInt(valString, 10));

    // Sort the collected numerical values in ascending order.
    // The comparator 'valA - valB' ensures a correct numerical sort.
    const sortedIntegerSequence = integerValues.sort((valA, valB) => valA - valB);

    // Calculate the sum of the first 'targetSubsetCount' elements from the sorted sequence.
    // If 'targetSubsetCount' exceeds the array length, 'slice' will include 'undefined' elements.
    // Summing 'undefined' will result in NaN, mimicking the original code's behavior for this edge case.
    const finalCalculatedSum = sortedIntegerSequence
        .slice(0, targetSubsetCount) // Extract the desired number of elements.
        .reduce((accumulator, currentElement) => accumulator + currentElement, 0); // Aggregate their sum.

    // Display the computed sum to the standard output.
    console.log(finalCalculatedSum);
}

// Self-executing anonymous function to manage the script's entry point and input acquisition.
(function executeProcessingPipeline() {
    // Check for the presence of Node.js-specific global objects to determine execution environment.
    if (typeof require === 'function' && typeof module === 'object' && module.exports) {
        try {
            // Dynamically import the 'fs' (file system) module for reading standard input.
            const fileSystemModule = require('fs');
            // Read all data from /dev/stdin synchronously and decode it as UTF-8.
            const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
            // Invoke the main processing function with the acquired input.
            ProcessInputData(standardInputContent);
        } catch (error) {
            // Log any errors encountered during the stdin reading process.
            console.error("Input Reading Error: Failed to retrieve data from /dev/stdin.", error.message);
        }
    } else {
        // Provide a message if the script is run in an unsupported environment for stdin reading.
        console.error("Environment Error: Script is not executing in a Node.js-like environment capable of reading /dev/stdin.");
    }
})();