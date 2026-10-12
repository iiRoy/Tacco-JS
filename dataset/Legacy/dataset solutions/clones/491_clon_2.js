var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read all input from standard input as a UTF-8 string

// Trim leading/trailing whitespace and split the input into an array of lines
var lineBuffer = (rawData.trim()).split("\n");

// Main processing loop; continues until a specific termination condition is met
while (true) {
    // Extract the first line, convert it to a number, and use it as the count for the current set of items
    var itemCount = lineBuffer.shift() - 0;

    // If the item count is zero, it signifies the end of input, so break the loop
    if (itemCount === 0) {
        break;
    }

    // Initialize a status indicator for the current set of items
    var statusIndicator = "OK";

    // Array to store the details of each item (weight, range start, range end)
    var itemDetails = [];

    // Loop to read 'itemCount' lines, each representing an item's details
    for (var outerIndex = 0; outerIndex < itemCount; outerIndex++) {
        // Split the current line by space and convert parts to numbers
        var currentLineParts = (lineBuffer.shift()).split(" ").map(Number);
        // Add the processed item details to our collection
        itemDetails.push(currentLineParts);
    }

    // Re-initialize the status indicator for the processing phase
    statusIndicator = "OK";

    // Outer loop iterates through each item to check for overlaps and total weight
    for (var outerIndex = 0; outerIndex < itemCount; outerIndex++) {
        // If the status is already "NG", no need to continue checking this set of items
        if (statusIndicator === "NG") {
            break;
        }

        // Extract properties for the current item being evaluated
        var currentWeight = itemDetails[outerIndex][0]; // Weight of the current item
        var startRange = itemDetails[outerIndex][1];    // Start of the current item's range
        var endRange = itemDetails[outerIndex][2];      // End of the current item's range

        // Inner loop compares the current item with all other items
        for (var innerIndex = 0; innerIndex < itemCount; innerIndex++) {
            // Skip comparison if it's the same item
            if (outerIndex === innerIndex) {
                continue;
            }

            // Extract range properties for the other item
            var otherStart = itemDetails[innerIndex][1]; // Start of the other item's range
            var otherEnd = itemDetails[innerIndex][2];   // End of the other item's range

            // Check for overlap: if the current item's range overlaps with the other item's range
            // An overlap occurs if the current item's start is before the other's end, AND
            // the current item's end is after the other's start.
            if (startRange < otherEnd && endRange > otherStart) {
                // If there's an overlap, add the other item's weight to the current total weight
                currentWeight += itemDetails[innerIndex][0];
            }

            // If the accumulated weight exceeds 150, set the status to "NG"
            if (currentWeight > 150) {
                statusIndicator = "NG";
            }
        }
    }

    // Output the final status for the current set of items
    console.log(statusIndicator);
}
