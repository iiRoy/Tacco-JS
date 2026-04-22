// This module provides functionality to parse and summarize test case outcomes from a raw input string.

/**
 * Processes a raw input string containing test submission results and prints a summary.
 * The input is expected to be multi-line, with the first line typically indicating the total count
 * (which is explicitly disregarded in this processing logic), and subsequent lines each containing
 * a single status code representing a test outcome.
 *
 * @param {string} rawInputContent - The complete multi-line string input from a source like stdin.
 */
function analyzeSubmissionMetrics(rawInputContent) {
    // Step 1: Normalize the input string.
    // Trim any leading or trailing whitespace from the entire input block.
    const cleanInputString = rawInputContent.trim();

    // Step 2: Parse the input into individual lines.
    // Each element in this array will be a single line from the original input.
    const allParsedLines = cleanInputString.split('\n');

    // Step 3: Define the set of recognized test outcome status codes.
    // These are the expected categories for classifying submission results.
    const officialStatusCodes = ["AC", "WA", "TLE", "RE"];

    // Step 4: Initialize a data structure to hold the counts for each status code.
    // An array is used where each index corresponds to a status in 'officialStatusCodes'.
    // All counters are set to zero initially using the fill method.
    const resultTallies = new Array(officialStatusCodes.length).fill(0);

    // Step 5: Extract the actual submission result entries.
    // The first line of the input is typically a count or metadata, which is not
    // directly a test result. We discard it by slicing the array from the second element.
    const submissionResultEntries = allParsedLines.slice(1);

    // Step 6: Validate the presence of submission data.
    // If no actual result entries are present after discarding the first line,
    // we can skip the counting loop. This acts as a guard clause.
    if (submissionResultEntries.length === 0) {
        // If there are no entries, the resultTallies will remain all zeros.
        // We could log a message here, but for this problem, printing zeros is acceptable.
        // console.log("No valid submission results found to analyze; printing zero counts.");
    }

    // Step 7: Iterate through each submission entry to tally the results.
    // We use a for...of loop for cleaner iteration over array elements.
    for (const singleSubmissionOutcome of submissionResultEntries) {
        // Ensure the status code is in a consistent case for comparison.
        // Although the problem implies exact match, converting to uppercase adds robustness.
        const normalizedOutcome = singleSubmissionOutcome.toUpperCase();

        // Find the index of the current outcome in our list of official status codes.
        // If the outcome is not recognized, 'indexOf' will return -1.
        const matchingStatusCodeIndex = officialStatusCodes.indexOf(normalizedOutcome);

        // If the outcome is a recognized status, increment its corresponding counter.
        // This implicitly handles and ignores any unrecognized status codes by not
        // incrementing a counter for them.
        if (matchingStatusCodeIndex !== -1) {
            resultTallies[matchingStatusCodeIndex]++;
        }
        // else {
        //     // Optional: Add logging here to report unrecognized status codes if needed for debugging.
        //     // console.warn(`Encountered unrecognized status: ${normalizedOutcome}`);
        // }
    }

    // Step 8: Present the final summary of results.
    // Loop through the official status codes and their accumulated counts.
    // A traditional for loop is used to easily access both the status label and its count by index.
    for (let indexToPrint = 0; indexToPrint < officialStatusCodes.length; indexToPrint++) {
        const statusLabel = officialStatusCodes[indexToPrint];
        const totalCount = resultTallies[indexToPrint];

        // Output the summary in the specified "STATUS x COUNT" format using template literals
        // for clearer string construction.
        console.log(`${statusLabel} x ${totalCount}`);
    }
}

// Main execution block:
// This line ensures the 'analyzeSubmissionMetrics' function is called when the script runs.
// It reads the entire content of standard input (e.g., from a file or piped data)
// using Node.js's built-in 'fs' module. The input is assumed to be UTF-8 encoded text.
analyzeSubmissionMetrics(require("fs").readFileSync("/dev/stdin", "utf8"));