'use strict'; // Enable strict mode for better code quality and error checking.

// This primary routine handles the processing of incoming text data.
function processInputData(sourceContent) {
    // First, prepare the raw text:
    // - Remove any leading or trailing blank spaces from the entire content.
    // - Split the cleaned content into an array of individual lines.
    let linesOfData = sourceContent.trim().split('\n');

    // The first line of data is expected to be a numerical count.
    // Extract this number, convert it to an integer, and remove it from the array of lines.
    const initialCount = parseInt(linesOfData.shift(), 10); // Use radix 10 for safe integer parsing.

    // Transform each subsequent line into a structured record:
    // - For every line, create a new array.
    // - The first element of this new array will be the line's original 1-based index.
    // - The remaining elements are obtained by splitting the line string by spaces.
    let transformedRecords = linesOfData.map(
        /**
         * Callback function to transform each line string into a structured array.
         * @param {string} currentSegment - The string content of the current line.
         * @param {number} segmentIndex   - The zero-based index of the current line in the 'linesOfData' array.
         * @returns {Array<any>} A new array containing the 1-based index and the split parts of the line.
         */
        (currentSegment, segmentIndex) => {
            // Construct the record: [original_index, part1, part2, ...]
            return [segmentIndex + 1, ...currentSegment.split(' ')];
        }
    );

    // Sort the collection of transformed records based on a custom comparison logic.
    // The primary sort key is the second element (index 1) in ascending order (lexicographical string comparison).
    // If primary keys are identical, the secondary sort key is the third element (index 2) in descending order (numerical comparison).
    const sortedIndices = transformedRecords.sort(
        /**
         * Comparison function for determining the order of two records.
         * @param {Array<any>} firstItem  - The first record array to compare.
         * @param {Array<any>} secondItem - The second record array to compare.
         * @returns {number} A value indicating the relative order:
         *                   - Negative if firstItem comes before secondItem.
         *                   - Zero if firstItem and secondItem are considered equal.
         *                   - Positive if firstItem comes after secondItem.
         */
        (firstItem, secondItem) => {
            // Compare the second component (index 1) of both records.
            if (firstItem[1] === secondItem[1]) {
                // If the second components are the same, compare the third components (index 2) numerically.
                // We want descending order for the third component, so secondItem's value minus firstItem's value.
                return parseFloat(secondItem[2]) - parseFloat(firstItem[2]); // Convert to float for accurate numeric comparison.
            }
            // If the second component of the first item is lexicographically smaller, it should precede the second item.
            else if (firstItem[1] < secondItem[1]) {
                return -1;
            }
            // If the second component of the first item is lexicographically larger, it should follow the second item.
            // (Note: This 'if' could be an 'else' but we maintain the original structure for cloning purposes.)
            if (firstItem[1] > secondItem[1]) {
                return 1;
            }
        }
    ).map(
        /**
         * Callback function to extract only the first element (the original 1-based index) from each sorted record.
         * @param {Array<any>} processedEntry - A single record array after sorting.
         * @returns {number} The original 1-based index of the record.
         */
        processedEntry => processedEntry[0]
    );

    // Output the final list of sorted indices, with each index on a new line.
    console.log(sortedIndices.join('\n'));
}

// Program execution starts here:
// Read the entire content from standard input (typically '/dev/stdin' in Unix-like systems).
// The content is read as UTF-8 encoded text.
// Then, pass this raw content to our processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));

// End of JavaScript code.