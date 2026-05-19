var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data
var lineSegments = rawData.trim().split("\n");

// Discard the first line (N)
lineSegments.shift();

// Extract and parse the first set of numbers (A)
var firstNumSet = lineSegments.shift().split(" ").map(Number);

// Sort the first set of numbers in ascending order
firstNumSet.sort(function(valA, valB) {
    return valA - valB;
});

// Discard the next line (M)
lineSegments.shift();

// Extract and parse the second set of numbers (B)
var secondNumSet = lineSegments.shift().split(" ").map(Number);

// Extract the string values (C)
var stringValues = lineSegments.shift().split(" ");

// Initialize an array to store cumulative sums, up to a maximum value
var cumulativeSums = [];
// Fill the array with 'false' initially to mark uncomputed values
for (var idx = 0; idx < 1000000; idx++) {
    cumulativeSums[idx] = false;
}

// Set the base case for cumulative sum at index 0
cumulativeSums[0] = [0, 0];

// Initialize a variable to hold the current running total, split into two parts
// [high_part, low_part] to handle very large numbers
var currentTotal = [0, 0]; // [trillions_part, remainder_part]

// Iterate through the first set of numbers to calculate and store cumulative sums
firstNumSet.forEach(function(itemVal) {
    currentTotal[1] += itemVal; // Add current value to the low part

    // If the low part exceeds 1 trillion, carry over to the high part
    if (currentTotal[1] >= 1000000000000) {
        currentTotal[0]++; // Increment the high part
        currentTotal[1] -= 1000000000000; // Subtract 1 trillion from the low part
    }
    // Store a copy of the current total at the index corresponding to the item's value
    cumulativeSums[itemVal] = currentTotal.slice();
});

// Iterate through the second set of numbers and corresponding string values
secondNumSet.forEach(function(currentSearchVal, currentIndex) {
    // Find the largest value less than or equal to currentSearchVal that has a stored cumulative sum
    while (true) {
        if (cumulativeSums[currentSearchVal] !== false) {
            break; // Found a valid cumulative sum
        }
        currentSearchVal--; // Decrement to find the next smaller value
    }

    // Get the corresponding string value
    var inputString = stringValues[currentIndex];

    // Parse the string into a two-part big integer [high_part, low_part]
    // The last 13 digits are the low part, the rest is the high part
    var parsedBigInt = [
        inputString.slice(0, inputString.length - 13).replace(/^0+/, "") - 0,
        inputString.slice(-13).replace(/^0+/, "") - 0
    ];

    var resultMessage = "";

    // Compare the parsed big integer with the stored cumulative sum
    if (parsedBigInt[0] < cumulativeSums[currentSearchVal][0]) {
        resultMessage = "Yes";
    } else if (parsedBigInt[0] === cumulativeSums[currentSearchVal][0] && parsedBigInt[1] <= cumulativeSums[currentSearchVal][1]) {
        resultMessage = "Yes";
    } else {
        resultMessage = "No";
    }

    // Output the comparison result
    console.log(resultMessage);
});
