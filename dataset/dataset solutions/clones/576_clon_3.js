// This module is designed for processing sequential numeric data, performing specific transformations
// and then reporting statistics based on the altered sequences.
// It effectively reads input, processes it in chunks, and outputs a count of zero values.

// Utility function to safely retrieve raw text content from the standard input stream.
const fetchStandardInputContent = () => {
    // Leveraging Node.js's 'fs' module to read from file descriptor 0, which commonly
    // represents stdin on Unix-like systems. 'utf8' encoding is crucial for text interpretation.
    return require('node:fs').readFileSync(0, 'utf8');
};

// Helper function to convert the raw input string into a structured array of numbers.
const preprocessTextualData = (rawStringData) => {
    // Eliminate any leading or trailing whitespace to ensure clean parsing.
    const cleanedString = rawStringData.trim();
    // Divide the string into an array of individual lines, using newline characters as delimiters.
    const lineSegments = cleanedString.split('\n');
    // Transform each string segment into its corresponding numeric value.
    const numericSegments = lineSegments.map(Number);
    return numericSegments;
};

// --- Main Program Execution Flow ---

// Initialize the primary data source by parsing the standard input.
let mainDataStore = preprocessTextualData(fetchStandardInputContent());
// Establish a pointer to keep track of the current reading position within the mainDataStore.
let currentDataPointer = 0;

// Outer loop: Continuously process blocks of data until a termination signal is received.
// This design uses an infinite loop with an explicit break condition for clarity.
for (;;) {
    // The first number in each block indicates the total count of elements within that block.
    // Increment the pointer immediately after reading to prepare for the next read.
    const blockElementCount = mainDataStore[currentDataPointer++];

    // A block size of zero signifies the end of all input data.
    // Upon encountering this, the program concludes its operation.
    if (blockElementCount === 0) {
        break;
    }

    // A dynamic array to store the results of the block-specific transformations.
    let transformedResultArray = [];
    // A boolean switch to alternate between two distinct processing modes for paired elements.
    let alternationToggle = false;

    // Inner loop: Iterate through each element within the current data block.
    for (let elementSequenceIndex = 0; elementSequenceIndex < blockElementCount; elementSequenceIndex++) {
        // Retrieve the current numeric value from the main data store.
        // Advance the data pointer to the next position.
        const incomingNumericValue = mainDataStore[currentDataPointer++];

        // Invert the alternation toggle for each element, ensuring alternating logic.
        alternationToggle = !alternationToggle;

        // Apply processing logic based on the current state of the alternation toggle.
        if (alternationToggle) {
            // If the toggle is true (e.g., for the first element in a conceptual pair),
            // simply append the value without complex checks.
            transformedResultArray.push(incomingNumericValue);
        } else {
            // If the toggle is false (e.g., for the second element in a conceptual pair).
            // Check if the result array is empty to prevent errors when accessing the last element.
            const isResultArrayEmpty = transformedResultArray.length === 0;
            const lastKnownValue = isResultArrayEmpty ? null : transformedResultArray[transformedResultArray.length - 1];

            // If the incoming value matches the last known value (or if the array was empty),
            // it indicates a continuation of a sequence, so just append.
            if (incomingNumericValue === lastKnownValue || isResultArrayEmpty) {
                transformedResultArray.push(incomingNumericValue);
            } else {
                // If the incoming value is different from the last known value,
                // first, append the new value to the array.
                transformedResultArray.push(incomingNumericValue);

                // Then, initiate a backward propagation process from the element
                // immediately preceding the newly added one.
                let backwardProbeIndex = elementSequenceIndex - 1;

                // Continue to overwrite elements backward until a matching value is found
                // or the beginning of the transformedResultArray is reached.
                while (backwardProbeIndex >= 0 && transformedResultArray[backwardProbeIndex] !== incomingNumericValue) {
                    transformedResultArray[backwardProbeIndex] = incomingNumericValue;
                    backwardProbeIndex--; // Move to the previous element.
                }
            }
        }
    }

    // After processing all elements in the current block, count how many zeros are present.
    let totalZeroOccurrences = 0;
    // Iterate through the final transformed array for the current block.
    for (const valueItem of transformedResultArray) {
        // If an element is zero, increment the counter.
        if (valueItem === 0) {
            totalZeroOccurrences++;
        }
    }

    // Display the final count of zeros for the current block to the console.
    console.log(totalZeroOccurrences);
}