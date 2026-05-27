"use strict";

/**
 * Processes raw input data to find a specific item based on cumulative quantity.
 * This function reads item identifiers and their quantities, calculates cumulative sums,
 * and then identifies the first item whose cumulative sum meets or exceeds a target value.
 *
 * @param {string} inputDataRaw - The raw string input, typically from standard input.
 */
const processInput = inputDataRaw => {
    // Normalize the input string: trim whitespace and split into individual lines.
    const inputLines = inputDataRaw.trim().split("\n");

    // Parse the first line to extract the total count of items and the target cumulative value.
    const firstLineParts = inputLines[0].split(" ");
    const countItems = parseInt(firstLineParts[0], 10); // Total number of item entries
    const targetValue = parseInt(firstLineParts[1], 10); // The cumulative quantity target

    // Process the subsequent lines to create an array of item pairs (identifier and quantity).
    // Each inner array represents [itemIdentifier, itemQuantity].
    const itemPairs = inputLines.slice(1, countItems + 1).map(lineStr =>
        lineStr.split(" ").map(valStr => parseInt(valStr, 10))
    );

    // Initialize an array to store objects, each containing an item's details
    // along with its cumulative quantity up to that point.
    let cumulativeData = [
        {
            itemIdentifier: itemPairs[0][0],
            itemQuantity: itemPairs[0][1],
            cumulativeQuantity: itemPairs[0][1] // The first item's cumulative is just its own quantity
        }
    ];
    // Maintain a running total of quantities.
    let currentCumulativeSum = itemPairs[0][1];

    // Iterate through the remaining item pairs to populate the cumulativeData array.
    for (let idx = 1; idx < countItems; idx++) {
        // Add the current item's quantity to the running total.
        currentCumulativeSum += itemPairs[idx][1];
        // Create a temporary object for the current item with its cumulative sum.
        let temporaryEntry = {
            itemIdentifier: itemPairs[idx][0],
            itemQuantity: itemPairs[idx][1],
            cumulativeQuantity: currentCumulativeSum
        };
        // Add this new entry to our cumulative data collection.
        cumulativeData.push(temporaryEntry);
    }

    // The following line is commented out in the original, so it remains commented here.
    // console.log(JSON.stringify(cumulativeData));

    // Iterate through the cumulative data to find the first entry that meets the target value.
    for (let entryIndex in cumulativeData) {
        // Check if the cumulative quantity of the current entry is greater than or equal to the target.
        if (cumulativeData[entryIndex].cumulativeQuantity >= targetValue) {
            // If the condition is met, print the full details of this entry.
            console.log(JSON.stringify(cumulativeData[entryIndex]));

            // Determine the final item identifier to output.
            // If the target was met *exactly* by this item's quantity, or if this item's quantity
            // pushed the sum over the target, then this item's identifier is the answer.
            // Otherwise, it means the target was already met by the previous item's cumulative sum.
            const finalResult =
                cumulativeData[entryIndex].cumulativeQuantity - cumulativeData[entryIndex].itemQuantity < targetValue
                    ? cumulativeData[entryIndex].itemIdentifier // This item is the one that crosses the threshold
                    : cumulativeData[entryIndex - 1].itemIdentifier; // The threshold was already crossed by the previous item

            // Print the determined item identifier.
            console.log(finalResult);
            return; // Exit the function immediately after finding and processing the first match.
        }
    }

    // This block is executed only if no entry in cumulativeData meets the targetValue.
    // In typical problem constraints, this might indicate an edge case or an unreachable state.
    console.log(JSON.stringify(cumulativeData));
};

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
