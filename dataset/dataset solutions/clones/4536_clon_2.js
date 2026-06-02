/*
 * This module processes a sequence of characters to balance parentheses.
 * It takes a string input, parses it, and generates a balanced output string.
 */
function ProcessInput(rawData) {
    // Split the raw input into lines.
    let inputLines = rawData.split("\n");

    // Parse the first line to get the sequence length.
    const sequenceLength = parseInt(inputLines[0], 10); // Explicitly use base 10

    // Split the second line into individual characters.
    const charSequence = inputLines[1].split("");

    // Initialize a variable to track the current bracket type.
    // 0 might represent '(', 1 might represent ')'.
    let currentBracketType = 0;

    // Create an array to store counts of consecutive character blocks.
    // The size is sequenceLength + 1, initialized with zeros.
    const blockCounts = new Array(sequenceLength + 1).fill(0);

    // Initialize an index for the blockCounts array.
    let blockIndex = 0;

    // Handle the very first character of the sequence.
    if (charSequence[0] === ")") {
        blockIndex = 1; // If it starts with ')', move to the next block index.
        currentBracketType = 1; // Update bracket type.
        blockCounts[blockIndex]++; // Increment count for this block.
    } else {
        blockCounts[blockIndex]++; // If it starts with '(', increment count for the first block.
    }

    // Iterate through the character sequence starting from the second character.
    // Group consecutive identical characters and store their counts.
    for (let k = 1; k < sequenceLength; k++) {
        if (charSequence[k] === charSequence[k - 1]) {
            blockCounts[blockIndex]++; // Same character, increment current block count.
        } else {
            blockIndex++; // Character changed, move to the next block.
            blockCounts[blockIndex]++; // Increment count for the new block.
        }
    }

    /*
     * The following section calculates differences between alternating blocks.
     * Even indices in blockCounts typically represent '(' blocks, odd indices represent ')' blocks.
     */
    let blockDifference = 0; // Difference for a pair of blocks.
    let cumulativeDifference = 0; // Total accumulated difference.

    // Loop through blockCounts, taking two elements at a time (even and odd indices).
    for (let k = 0; k < sequenceLength; k = k + 2) {
        // Calculate the difference between the current '(' block count and the next ')' block count.
        blockDifference = blockCounts[k] - blockCounts[k + 1];
        cumulativeDifference += blockDifference; // Accumulate the difference.
    }

    // Initialize the string that will hold the final balanced output.
    let finalOutputString = "";

    // Reset the search index for later use in balancing logic.
    let searchIndex = sequenceLength;

    // Apply balancing logic based on the cumulative difference.
    if (cumulativeDifference < 0) {
        // If cumulativeDifference is negative, it means there are too many ')' overall.
        // Add the absolute value of cumulativeDifference to the first block (which should be '(').
        blockCounts[0] -= cumulativeDifference; // Effectively adds -(-cumulativeDifference)
    } else if (cumulativeDifference > 0) {
        // If cumulativeDifference is positive, too many '(' overall.
        // Check if the initial '(' block is smaller than the initial ')' block.
        if (blockCounts[0] - blockCounts[1] < 0) {
            // Adjust cumulativeDifference and make blockCounts[0] equal to blockCounts[1].
            cumulativeDifference += blockCounts[1] - blockCounts[0];
            blockCounts[0] = blockCounts[1];
        }
        // Find the last non-zero block and adjust it.
        while (true) {
            if (blockCounts[searchIndex] > 0) {
                if (searchIndex % 2 === 0) {
                    // If it's an even-indexed block (likely '('), add cumulativeDifference to the next block (likely ')').
                    blockCounts[searchIndex + 1] += cumulativeDifference;
                    break;
                } else {
                    // If it's an odd-indexed block (likely ')'), add cumulativeDifference to itself.
                    blockCounts[searchIndex] += cumulativeDifference;
                    break;
                }
            } else {
                searchIndex--; // Move to the previous block if current is zero.
            }
        }
    } else if (blockCounts[0] - blockCounts[1] < 0) {
        // If cumulativeDifference is zero, but the first '(' block is smaller than the first ')' block.
        const initialBlockDiscrepancy = blockCounts[1] - blockCounts[0];
        blockCounts[0] = blockCounts[1]; // Make them equal.
        // Find the last non-zero block and adjust it.
        while (true) {
            if (blockCounts[searchIndex] > 0 && searchIndex % 2 === 0) {
                // If it's an even-indexed block, make the next block equal to it.
                blockCounts[searchIndex + 1] = blockCounts[searchIndex];
                break;
            } else if (blockCounts[searchIndex] > 0 && searchIndex % 2 === 1) {
                // If it's an odd-indexed block, add the initial discrepancy to it.
                blockCounts[searchIndex] += initialBlockDiscrepancy;
                break;
            } else {
                searchIndex--; // Move to the previous block.
            }
        }
    }

    // Construct the final output string based on the modified blockCounts.
    for (let k = 0; k < sequenceLength; k++) {
        if (k % 2 === 0) {
            // For even-indexed blocks, append '(' characters.
            for (let m = 0; m < blockCounts[k]; m++) {
                finalOutputString += "(";
            }
        }

        if (k % 2 === 1) {
            // For odd-indexed blocks, append ')' characters.
            for (let m = 0; m < blockCounts[k]; m++) {
                finalOutputString += ")";
            }
        }
    }

    // Print the generated balanced string to the console.
    console.log(finalOutputString);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
