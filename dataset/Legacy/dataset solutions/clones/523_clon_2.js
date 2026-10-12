var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input string into an array of lines
var lines = rawData.trim().split("\n");

// Extract initial configuration parameters from the first line
// nrl: [number_of_elements, some_unused_value, limit_value]
var configParams = lines.shift().split(" ").map(Number);

// numElements: The count of elements to manage
var numElements = configParams[0];
// limitVal: A value that seems to be used in a dummy operation later
var limitVal = configParams[2];

// elementData: An array to store information about each element.
// Each inner array will hold [current_value, accumulated_time, original_index]
var elementData = [];

// currentMaxInfo: Stores the index and value of the element with the current maximum value.
// [index_of_max_element, maximum_value]
var currentMaxInfo = [0, 0];

// lastUpdateTime: Tracks the timestamp of the last processed operation.
var lastUpdateTime = 0;

// Initialize elementData for each element
// Each element starts with value 0, accumulated time 0, and its original index.
for (var idx = 0; idx < numElements; idx++) {
    elementData[idx] = [0, 0, idx];
}

// Append a final dummy operation to ensure all accumulated times are correctly calculated
// This operation effectively sets the time to 'limitVal' for the last element.
lines.push([1, limitVal, 0].join(" "));

// Iterate through each operation line
for (var opIdx = 0; opIdx < lines.length; opIdx++) {
    // Parse operation details: [target_element_index_plus_one, operation_time, value_change]
    var operationDetails = lines[opIdx].split(" ").map(Number);

    // targetElementIdx: The 0-based index of the element affected by this operation
    var targetElementIdx = operationDetails[0] - 1;
    // operationTime: The timestamp of the current operation
    var operationTime = operationDetails[1];
    // valueChange: The amount by which the element's value changes (+ for increase, - for decrease)
    var valueChange = operationDetails[2];

    // Update the accumulated time for the currently tracked maximum element
    // The time difference is added to its accumulated time.
    elementData[currentMaxInfo[0]][1] += operationTime - lastUpdateTime;
    // Update the lastUpdateTime to the current operation's timestamp
    lastUpdateTime = operationTime;

    // Apply the value change to the target element
    elementData[targetElementIdx][0] += valueChange;

    // Logic to update currentMaxInfo based on the value change
    if (valueChange > 0) {
        // If the value increased, check if this element is now the new maximum
        if (elementData[targetElementIdx][0] > currentMaxInfo[1]) {
            currentMaxInfo = [targetElementIdx, elementData[targetElementIdx][0]];
        }
        // If values are equal, prioritize the element with the smaller index (as per problem rules)
        else if (elementData[targetElementIdx][0] === currentMaxInfo[1] && targetElementIdx <= currentMaxInfo[0]) {
            currentMaxInfo = [targetElementIdx, elementData[targetElementIdx][0]];
        }
    } else if (valueChange < 0 && currentMaxInfo[0] === targetElementIdx) {
        // If the value decreased AND the affected element was the current maximum,
        // we need to re-scan all elements to find the new maximum.
        var highestValue = 0;
        var highestValueIdx = 0;
        for (var scanIdx = 0; scanIdx < elementData.length; scanIdx++) {
            if (highestValue < elementData[scanIdx][0]) {
                highestValueIdx = scanIdx;
                highestValue = elementData[scanIdx][0];
            }
        }
        // Update currentMaxInfo with the newly found maximum
        currentMaxInfo = [highestValueIdx, elementData[highestValueIdx][0]];
    }
}

// Sort the elementData array to find the element with the highest accumulated time.
// Primary sort key: accumulated_time (descending)
// Secondary sort key: original_index (ascending, for tie-breaking)
elementData.sort(function(firstEl, secondEl) {
    if (firstEl[1] === secondEl[1]) {
        return firstEl[2] - secondEl[2]; // Sort by original index if times are equal
    } else {
        return secondEl[1] - firstEl[1]; // Sort by accumulated time (descending)
    }
});

// Output the original index (plus one, as it's 1-based in problem statement)
// of the element that has the highest accumulated time.
console.log(elementData[0][2] + 1);
