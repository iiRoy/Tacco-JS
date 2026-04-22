const fileSystem = require('fs');

// Define a constant for the maximum allowed accumulated weight.
const MAX_ACCUMULATED_WEIGHT = 150;

/**
 * Checks a specific relationship between two intervals [currentStart, currentEnd]
 * and [otherStart, otherEnd].
 * The condition is: currentEnd <= otherStart AND currentStart <= otherEnd.
 * This identifies cases where the first interval ends before or at the start
 * of the second, AND the first interval starts before or at the end of the second.
 * This can include intervals that touch or overlap in a specific left-to-right manner.
 * @param {number} currentEnd - The end point of the first interval.
 * @param {number} currentStart - The start point of the first interval.
 * @param {number} otherStart - The start point of the second interval.
 * @param {number} otherEnd - The end point of the second interval.
 * @returns {boolean} True if the specific relationship holds, false otherwise.
 */
const checkSpecificIntervalRelation = (currentEnd, currentStart, otherStart, otherEnd) => {
    return currentEnd <= otherStart && currentStart <= otherEnd;
};

// Read raw input data from standard input, using UTF-8 encoding.
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Guard clause: If input is empty or just whitespace, exit the process.
// This prevents errors from attempting to process non-existent data.
if (!rawInputData || rawInputData.trim().length === 0) {
    // console.error("No input data provided. Exiting gracefully.");
    process.exit(0); // Exit successfully if no input is considered a valid scenario.
}

// Split the entire input string into an array of individual lines.
// The `.trim()` ensures no leading/trailing empty lines affect the initial processing.
let processedLines = rawInputData.trim().split("\n");

// Main processing loop: iterates indefinitely until an explicit break condition is met.
// This structure is similar to 'while(true)' but uses a 'for' loop syntax.
for (;;) {
    // Attempt to extract the first line, which should contain the item count for the current block.
    const itemCountString = processedLines.shift();

    // If there are no more lines in the input, it means all data blocks have been processed.
    if (itemCountString === undefined) {
        break; // Exit the main loop.
    }

    // Convert the item count string to a number.
    // Use Number() for explicit type conversion; if it's not a valid number, it will be NaN.
    const currentBlockItemCount = Number(itemCountString);

    // If the item count is 0, it signals the end of valid data blocks, as per problem specification.
    if (currentBlockItemCount === 0) {
        break; // Exit the main loop.
    }

    // Initialize a boolean flag to track the validity status of the current data block.
    // 'true' implies "OK", 'false' implies "NG".
    let blockStatusIsOk = true;

    // Array to store the parsed item details for the current block.
    // Each item will be an array of [weight, intervalStart, intervalEnd].
    const blockItemDetails = [];

    // Loop to read and parse the specified number of item lines for the current block.
    for (let itemReadIndex = 0; itemReadIndex < currentBlockItemCount; itemReadIndex++) {
        const itemLineContent = processedLines.shift();

        // If a line is unexpectedly missing before reading all items for the current block.
        if (itemLineContent === undefined) {
            blockStatusIsOk = false; // Mark the block as invalid.
            break; // Exit the item reading loop.
        }

        // Split the item line by spaces and convert each segment to a number.
        const parsedItemData = itemLineContent.split(" ").map(val => Number(val.trim()));

        // Validate the structure and content of the parsed item data.
        // Expecting exactly three numbers, and all should be valid numbers (not NaN).
        if (parsedItemData.length !== 3 || parsedItemData.some(isNaN)) {
            // console.warn(`Warning: Malformed item data '${itemLineContent}' detected. Block will be marked NG.`);
            blockStatusIsOk = false; // Mark block as invalid.
            // Attempt to consume any remaining expected lines for this block to prevent misalignment
            // with subsequent data blocks in 'processedLines'.
            for (let k = itemReadIndex + 1; k < currentBlockItemCount; k++) {
                processedLines.shift(); // Discard the line.
            }
            break; // Exit the item reading loop.
        }
        blockItemDetails.push(parsedItemData);
    }

    // If an issue was encountered during the parsing of items for the current block,
    // output "NG" and proceed to the next block (or exit if no more blocks).
    if (!blockStatusIsOk) {
        console.log("NG");
        continue; // Skip to the next iteration of the main processing loop.
    }

    // Secondary processing loop: This iterates through each item in the block
    // to compare it against all other items.
    for (let outerItemIdx = 0; outerItemIdx < currentBlockItemCount; outerItemIdx++) {
        // If the block status has already been determined as 'NG',
        // there's no need for further checks within this block.
        if (!blockStatusIsOk) {
            break; // Exit the outer item comparison loop.
        }

        // Destructure the properties of the current item being evaluated.
        // currentWeightAccumulator will hold the running sum of weights.
        let [currentWeightAccumulator, currentIntervalStart, currentIntervalEnd] = blockItemDetails[outerItemIdx];

        // Inner loop: Compares the 'outer' item with every other item in the block.
        for (let innerItemIdx = 0; innerItemIdx < currentBlockItemCount; innerItemIdx++) {
            // Skip comparison if it's the same item comparing to itself.
            if (outerItemIdx === innerItemIdx) {
                continue;
            }

            // Destructure the properties of the 'other' item for comparison.
            const [otherItemWeight, otherIntervalStart, otherIntervalEnd] = blockItemDetails[innerItemIdx];

            // Use the helper function to check the specific interval relationship.
            if (checkSpecificIntervalRelation(currentIntervalEnd, currentIntervalStart, otherIntervalStart, otherIntervalEnd)) {
                // If the condition is met, add the weight of the 'other' item to the accumulator.
                currentWeightAccumulator += otherItemWeight;
            }

            // Check if the accumulated weight exceeds the maximum allowed limit.
            if (currentWeightAccumulator > MAX_ACCUMULATED_WEIGHT) {
                blockStatusIsOk = false; // Set the block status to 'NG'.
                break; // Exit the inner loop as the condition for 'NG' is met.
            }
        }
    }

    // After all checks for the current block are complete, output the final status.
    console.log(blockStatusIsOk ? "OK" : "NG");
}