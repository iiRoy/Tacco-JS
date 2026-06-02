var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input string into an array of lines
var lineBuffer = (rawData.trim()).split("\n");

// Main processing loop
while (true) {
    // Read the number of items for the current test case
    // Convert to number and remove from buffer
    var numItems = lineBuffer.shift() - 0;

    // If the number of items is 0, terminate the program
    if (numItems === 0) {
        break;
    }

    // Initialize a status indicator for the current test case
    var statusIndicator = "OK";

    // Array to store item data (weight, range_start, range_end)
    var itemData = [];

    // Loop to read all item data for the current test case
    for (var idx1 = 0; idx1 < numItems; idx1++) {
        // Split the line by space and convert parts to numbers
        var currentItem = (lineBuffer.shift()).split(" ").map(Number);
        // Add the processed item to our data array
        itemData.push(currentItem);
    }

    // Re-initialize status indicator (redundant, but matches original structure)
    statusIndicator = "OK";

    // Outer loop: Iterate through each item as the primary item
    for (var idx1 = 0; idx1 < numItems; idx1++) {
        // If the status is already "NG", no need to continue checking
        if (statusIndicator === "NG") {
            break;
        }

        // Extract properties of the primary item
        var currentWeight = itemData[idx1][0];
        var rangeStart = itemData[idx1][1];
        var rangeEnd = itemData[idx1][2];

        // Inner loop: Compare the primary item with all other items
        for (var idx2 = 0; idx2 < numItems; idx2++) {
            // Skip comparison if it's the same item
            if (idx1 === idx2) {
                continue;
            }

            // Extract properties of the other item
            var otherWeight = itemData[idx2][0];
            var otherStart = itemData[idx2][1];
            var otherEnd = itemData[idx2][2];

            // Check for overlap between the primary item's range and the other item's range
            // If ranges overlap (A <= b && B >= a), add the other item's weight
            if (rangeStart <= otherEnd && rangeEnd >= otherStart) {
                currentWeight += otherWeight;
            }

            // Check if the accumulated weight exceeds the limit
            if (currentWeight > 150) {
                statusIndicator = "NG"; // Set status to "NG" if limit is exceeded
            }
        }
    }

    // Output the final status for the current test case
    console.log(statusIndicator);
}
