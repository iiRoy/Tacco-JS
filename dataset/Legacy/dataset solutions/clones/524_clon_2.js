var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var lineData = rawData.trim().split("\n"); // Split input into lines and remove leading/trailing whitespace

// Parse the first line for configuration parameters
var configParams = lineData.shift().split(" ").map(Number);
var itemCount = configParams[0]; // Number of items
var limitValue = configParams[2]; // A limit value, though not directly used in the core logic for calculation

// Initialize an array to store item statistics: [current_value, total_duration, original_index]
var itemStats = [];
// Initialize current maximum item: [index_of_max, value_of_max]
var currentMax = [0, 0];
// Keep track of the last event timestamp
var lastUpdateTime = 0;

// Populate the itemStats array with initial values and original indices
for (var idx = 0; idx < itemCount; idx++) {
    itemStats[idx] = [0, 0, idx];
}

// Append a final event to ensure all durations are accounted for up to 'limitValue'
lineData.push([1, limitValue, 0].join(" "));

// Process each event line
lineData.forEach(function(eventDetails) {
    // Parse event details: [item_index_plus_one, timestamp, value_change]
    eventDetails = eventDetails.split(" ").map(Number);

    var targetIndex = eventDetails[0] - 1; // Convert 1-based index to 0-based
    var eventTimestamp = eventDetails[1];
    var valueChange = eventDetails[2];

    // Update the total duration for the currently maximum item
    // The duration is the time elapsed since the last update
    itemStats[currentMax[0]][1] += eventTimestamp - lastUpdateTime;
    lastUpdateTime = eventTimestamp; // Update the last event timestamp

    // Apply the value change to the target item
    itemStats[targetIndex][0] += valueChange;

    // Logic to update the 'currentMax' item
    if (valueChange > 0) {
        // If the value increased, check if it's the new maximum
        if (itemStats[targetIndex][0] > currentMax[1]) {
            currentMax = [targetIndex, itemStats[targetIndex][0]];
        } else if (itemStats[targetIndex][0] === currentMax[1] && targetIndex <= currentMax[0]) {
            // If values are equal, choose the one with the smaller index
            currentMax = [targetIndex, itemStats[targetIndex][0]];
        }
    } else if (valueChange < 0 && currentMax[0] === targetIndex) {
        // If the value decreased and it was the maximum item, re-evaluate the maximum
        var highestValue = 0;
        var highestIndex = 0;
        itemStats.forEach(function(singleStat, statIndex) {
            if (highestValue < singleStat[0]) {
                highestValue = singleStat[0];
                highestIndex = statIndex;
            }
        });
        currentMax = [highestIndex, itemStats[highestIndex][0]];
    }
});

// Sort the itemStats array to find the item with the longest total duration
itemStats.sort(function(statA, statB) {
    // Primary sort key: total duration (descending)
    if (statA[1] === statB[1]) {
        // Secondary sort key: original index (ascending) for tie-breaking
        return statA[2] - statB[2];
    } else {
        return statB[1] - statA[1];
    }
});

// Output the original 1-based index of the item that was the maximum for the longest total duration
console.log(itemStats[0][2] + 1);
