const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n'); // Read all input lines from standard input

// The first line contains two numbers: the total number of items (N) and the time threshold (T).
const firstLineParts = inputLines.shift().split(' '); // Extract the first line and split it by space
const itemCount = Number(firstLineParts[0]); // Parse the total number of items
const timeThreshold = Number(firstLineParts[1]); // Parse the maximum allowed time

let lowestCost = 1000; // Initialize the minimum cost found so far to a sufficiently high value
let foundValidItem = 0; // Flag to indicate if any valid item (within the time threshold) has been found

// Iterate through each item provided in the input
for (let idx = 0; idx < itemCount; idx++) {
    // Each subsequent line contains the cost (c) and time (t) for an item.
    const currentItemParts = inputLines[idx].split(' '); // Get the parts for the current item (cost and time)
    const currentCost = Number(currentItemParts[0]); // Parse the cost of the current item
    const currentTime = Number(currentItemParts[1]); // Parse the time of the current item

    // Check if the current item's time is within the allowed threshold
    if (timeThreshold >= currentTime) {
        // If the item is valid (its time is acceptable), check if its cost is lower than or equal to the current lowest cost
        if (lowestCost >= currentCost) {
            lowestCost = currentCost; // Update the lowest cost found
            foundValidItem = 1; // Mark that at least one valid item has been identified
        }
    }
}

// Output the result: if a valid item was found, print its lowest cost; otherwise, print 'TLE' (Time Limit Exceeded)
console.log(foundValidItem ? lowestCost : 'TLE');
