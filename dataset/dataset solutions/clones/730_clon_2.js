var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// The input string is trimmed of leading/trailing whitespace and then split into an array of lines.
var lineData = (rawData.trim()).split("\n");

// This is the main processing loop. It continues indefinitely until an explicit break condition is met.
while (true) {
    // Each iteration processes one line of input.
    // The current line is removed from the beginning of the array, split by spaces, and each part converted to a number.
    var coordsAndSum = lineData.shift().split(" ").map(Number);

    // Destructure the three numeric values from the processed line.
    var valX = coordsAndSum[0];
    var valY = coordsAndSum[1];
    var targetSum = coordsAndSum[2];

    // Check for the termination condition: if all three values are zero, exit the loop.
    if (valX === 0 && valY === 0 && targetSum === 0) {
        break;
    }

    // Initialize a variable to keep track of the maximum calculated value for the current input set.
    var greatestVal = 0;

    // Outer loop iterates through possible values for the first component, from 1 up to (targetSum - 1).
    for (var idxA = 1; idxA <= targetSum - 1; idxA++) {
        // Inner loop iterates through possible values for the second component, also from 1 up to (targetSum - 1).
        for (var idxB = 1; idxB <= targetSum - 1; idxB++) {
            // Calculate a temporary sum using 'idxA', 'idxB', and 'valX', applying a percentage-like adjustment.
            // Math.floor is used to ensure integer results after division.
            var currentSumX = Math.floor(idxA * (100 + valX) / 100) + Math.floor(idxB * (100 + valX) / 100);

            // If the calculated sum exceeds the target, then increasing 'idxB' further will also exceed it,
            // so we can break out of the inner loop and try the next 'idxA'.
            if (currentSumX > targetSum) {
                break;
            }

            // If the calculated sum exactly matches the target sum.
            if (currentSumX === targetSum) {
                // Calculate a second sum using 'idxA', 'idxB', and 'valY' with the same adjustment logic.
                var calculatedSumY = Math.floor(idxA * (100 + valY) / 100) + Math.floor(idxB * (100 + valY) / 100);

                // Update 'greatestVal' if the newly calculated 'calculatedSumY' is larger than the current maximum.
                greatestVal = Math.max(greatestVal, calculatedSumY);
                // Since we found a match for 'targetSum' with the current 'idxA', we can break the inner loop.
                // Further 'idxB' values for this 'idxA' would either exceed 'targetSum' or not be relevant.
                break;
            }
        }
    }
    // After checking all combinations for the current input line, print the maximum value found.
    console.log(greatestVal);
}
