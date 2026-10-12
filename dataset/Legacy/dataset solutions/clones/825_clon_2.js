var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: remove trailing newline and split into an array of lines.
var lineBuffer = (rawData.replace(/\n$/, "")).split("\n");

// Main processing loop. Continues until a zero is encountered.
while (true) {
    // Read the number of entries for the current block.
    // The `-0` converts the string to a number.
    var numEntries = lineBuffer.shift() - 0;

    // If the number of entries is zero, terminate the loop.
    if (numEntries === 0) {
        break;
    }

    // Initialize an array to store calculated results for the current block.
    var resultsList = [];

    // Loop through each entry in the current block.
    for (var idx = 0; idx < numEntries; idx++) {
        // Get the current line, split it by space.
        var entryParts = (lineBuffer.shift()).split(" ");

        // The first part is the item name.
        var itemName = entryParts.shift();

        // Convert the remaining parts to numbers.
        entryParts = entryParts.map(Number);

        // Add the item name back to the beginning of the array.
        entryParts.unshift(itemName);

        // Use an Immediately Invoked Function Expression (IIFE) to calculate values.
        // This structure effectively destructures the array into named parameters.
        (function(label, price, valA, valB, valC, valD, valE, valF, valS, valM) {
            // Calculate the total time based on the given formula.
            var calcTime = valA + valB + valC + ((valD + valE) * valM);

            // Calculate the total profit based on the given formula.
            var calcProfit = (valF * valS * valM) - price;

            // Store the item label, profit-to-time ratio, and original index.
            resultsList.push([label, calcProfit / calcTime, idx]);
        }).apply(null, entryParts); // Apply the array elements as arguments to the IIFE.
    }

    // Sort the results list.
    // Primary sort key: descending order of profit-to-time ratio.
    // Secondary sort key: ascending order of item label (lexicographical) if ratios are equal.
    resultsList.sort(function(itemA, itemB) {
        if (itemA[1] === itemB[1]) {
            // If ratios are equal, sort by label alphabetically (ascending).
            return itemA[0] > itemB[0];
        } else {
            // Otherwise, sort by ratio in descending order.
            return itemB[1] - itemA[1];
        }
    });

    // Print the labels of the sorted items.
    resultsList.forEach(function(currentItem) {
        console.log(currentItem[0]);
    });

    // Print a separator after each block of results.
    console.log("#");
}
