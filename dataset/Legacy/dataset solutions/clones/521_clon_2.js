var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Trim leading/trailing whitespace from the input and split it into an array of lines.
var lines = rawData.trim().split('\n');

// Extract the first line, which contains configuration values.
// Split it by spaces and convert each part to a number.
var configVals = lines.shift().split(' ').map(Number);

// 'numItems' represents the count of items, taken from the first configuration value.
var numItems = configVals[0];
// 'limitVal' is a specific limit or boundary, taken from the third configuration value.
var limitVal = configVals[2];

// Initialize an array to store data for each item.
// Each inner array will hold: [current_value, accumulated_time, original_index].
var itemData = [];

// 'currentMax' tracks the item with the highest value: [index_of_max_item, max_value].
var currentMax = [0, 0];
// 'elapsedTime' keeps track of the time passed since the last event.
var elapsedTime = 0;

// Populate the 'itemData' array. Initially, all items have a value of 0,
// accumulated time of 0, and their own original index.
for (var idx = 0; idx < numItems; idx++) {
    itemData[idx] = [0, 0, idx];
}

// Add a final event to the 'lines' array. This ensures that the accumulated time
// for the last active item is correctly calculated up to 'limitVal'.
lines.push([1, limitVal, 0].join(' '));

// Process each event line in the 'lines' array.
lines.forEach(function(lineStr) {
    // Parse the current event line: split by spaces and convert to numbers.
    // The format is typically: [item_id_plus_one, event_timestamp, value_change_amount].
    lineStr = lineStr.split(' ').map(Number);

    // Extract the 0-based index of the target item.
    var targetIdx = lineStr[0] - 1;
    // Extract the timestamp of the current event.
    var eventTimestamp = lineStr[1];
    // Extract the amount by which the item's value changes.
    var valueChange = lineStr[2];

    // Update the accumulated time for the item that was considered the maximum
    // up until this event. The time added is the duration since the last event.
    itemData[currentMax[0]][1] += eventTimestamp - elapsedTime;
    // Update the global elapsed time to the current event's timestamp.
    elapsedTime = eventTimestamp;

    // Apply the value change to the target item.
    itemData[targetIdx][0] += valueChange;

    // If the value change is positive, check if the target item has become the new maximum.
    if (valueChange > 0) {
        // If the target item's new value is strictly greater than the current maximum value,
        // update 'currentMax' with this item's details.
        if (itemData[targetIdx][0] > currentMax[1]) {
            currentMax = [targetIdx, itemData[targetIdx][0]];
        }
        // If the target item's new value is equal to the current maximum,
        // and its index is less than or equal to the current max item's index (tie-breaking rule),
        // update 'currentMax'.
        else if (itemData[targetIdx][0] === currentMax[1] && targetIdx <= currentMax[0]) {
            currentMax = [targetIdx, itemData[targetIdx][0]];
        }
    }

    // If the value change is negative, the current maximum might no longer be valid.
    // Re-evaluate the maximum across all items.
    if (valueChange < 0) {
        // The original logic here is specific: it finds the index of the *first* item
        // encountered that has a value greater than a fixed threshold (0).
        // If no such item exists, it defaults to index 0.
        var fixedThreshold = 0; // This variable mimics the original 'MAX' which was never updated.
        var foundMaxIndex = 0;  // This variable mimics the original 'm'.

        itemData.forEach(function(singleItem, itemIndex) {
            // If the current item's value is greater than the fixed threshold (0),
            // update 'foundMaxIndex' to this item's index.
            // 'fixedThreshold' itself is NOT updated, preserving the original behavior.
            if (fixedThreshold < singleItem[0]) {
                foundMaxIndex = itemIndex;
            }
        });

        // Update the global 'currentMax' with the newly determined maximum item's index and value.
        currentMax = [foundMaxIndex, itemData[foundMaxIndex][0]];
    }
});

// Sort the 'itemData' array based on two criteria:
// 1. Primary: Accumulated time (descending order).
// 2. Secondary: Original index (ascending order) for tie-breaking if accumulated times are equal.
itemData.sort(function(itemA, itemB) {
    // If accumulated times are equal, sort by original index in ascending order.
    if (itemA[1] === itemB[1]) {
        return itemA[2] - itemB[2];
    }
    // Otherwise, sort by accumulated time in descending order.
    else {
        return itemB[1] - itemA[1];
    }
});

// Output the original index (plus one, as it was 0-based) of the item that
// comes first after sorting. This is the result.
console.log(itemData[0][2] + 1);
