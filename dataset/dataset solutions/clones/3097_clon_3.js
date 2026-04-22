const analyzeGeneticString = (sequenceInputData) => {
    // This function processes a raw genetic sequence string to find the longest contiguous block
    // of valid nucleotide characters (A, T, C, G).

    // Step 1: Normalize the input string.
    // We remove any leading or trailing whitespace to ensure that the core sequence data
    // is processed without unintended empty spaces affecting pattern matching.
    const normalizedSequence = sequenceInputData.trim();

    // Step 2: Define the regular expression pattern for identifying nucleotide blocks.
    // The pattern /[ATCG]+/g looks for one or more consecutive occurrences of
    // 'A', 'T', 'C', or 'G' characters. The 'g' flag ensures all matches are found.
    const nucleotideBlockPattern = /[ATCG]+/g;

    // Step 3: Extract all matching nucleotide blocks from the normalized sequence.
    // The `match()` method returns an array of strings for all matches found,
    // or `null` if no matches are present in the string.
    let identifiedGenomicBlocks = normalizedSequence.match(nucleotideBlockPattern);

    // Step 4: Initialize a variable to store the maximum length found so far.
    // We use `let` as this value will be updated during the iteration process.
    let currentMaximumBlockLength = 0;

    // Step 5: Implement a guard clause to handle cases where no genomic blocks are found.
    // If `identifiedGenomicBlocks` is `null`, it means the input string did not contain
    // any valid nucleotide sequences. In this scenario, the longest block length is 0.
    if (identifiedGenomicBlocks === null) {
        console.log(0); // Output 0 directly as per requirements for no matches.
        return; // Exit the function early as there's nothing more to process.
    }

    // Step 6: Iterate through each identified genomic block.
    // We use a `for...of` loop for a clear and concise way to iterate over array elements.
    for (const singleBlock of identifiedGenomicBlocks) {
        // Step 6a: Determine the length of the current block.
        // Store it in a temporary constant for readability.
        const lengthOfCurrentBlock = singleBlock.length;

        // Step 6b: Compare the current block's length with the maximum length found so far.
        // If the current block is longer, update `currentMaximumBlockLength`.
        // This is an explicit conditional update, equivalent to `Math.max()`.
        if (lengthOfCurrentBlock > currentMaximumBlockLength) {
            currentMaximumBlockLength = lengthOfCurrentBlock;
        }
    }

    // Step 7: Output the final result.
    // Print the length of the longest contiguous nucleotide block found.
    console.log(currentMaximumBlockLength);
};

// --- Input Acquisition and Function Invocation ---

// Obtain the Node.js file system module to read data from standard input.
const systemFileAccessor = require('fs');

// Specify the standard input file path, common in competitive programming environments.
const standardInputDevicePath = '/dev/stdin';

// Read the entire content of the standard input file synchronously.
// Ensure UTF-8 encoding is used to correctly interpret text data.
const obtainedRawInputContent = systemFileAccessor.readFileSync(standardInputDevicePath, 'UTF-8');

// Call the primary analysis function with the content read from standard input.
analyzeGeneticString(obtainedRawInputContent);