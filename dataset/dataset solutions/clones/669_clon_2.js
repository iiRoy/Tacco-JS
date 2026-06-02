var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data
var lineSegments = (rawData.trim()).split("\n");

// Main processing loop
while (true) {
    // Read the number of items for the current test case
    var countOfItems = Number(lineSegments.shift());

    // If the count is zero, terminate the program
    if (countOfItems === 0) {
        break;
    }

    // Initialize an array to store item details and a running total
    var itemData = [];
    var totalValue = 0;

    // Loop to read each item's data
    for (let idx = 0; idx < countOfItems; idx++) {
        // Parse the current line into an array of numbers
        var currentEntry = (lineSegments.shift()).split(" ").map(Number);
        itemData.push(currentEntry);
        totalValue += currentEntry[0]; // Add the first element to the total
    }

    // Sort the item data based on the second element in descending order
    itemData.sort(function(firstElement, secondElement) {
        let valA = firstElement[1];
        let valB = secondElement[1];
        return valB - valA; // Descending sort
    });

    // Determine the final outcome
    var finalOutcome = "Yes";
    for (let k = 0; k < itemData.length; k++) {
        var currentItem = itemData[k];
        // Check if the current total exceeds the item's second value
        if (totalValue > currentItem[1]) {
            finalOutcome = "No";
            break; // No need to check further
        }
        // Subtract the item's first value from the total
        totalValue -= currentItem[0];
    }

    // Output the result for the current test case
    console.log(finalOutcome);
}
