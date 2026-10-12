var fileSystemModule = require('fs'); // Import the Node.js file system module for file operations

var inputLines = fileSystemModule.readFileSync('/dev/stdin', 'utf8').split('\n'); // Read all input from standard input, then split it into an array of lines

var totalCount = Number(inputLines[0]); // Convert the first line of input to a number, representing the total count

var weightNumbers = inputLines[1].split(' ').map(function (item) {
    Number(item); // This function converts the item to a number but does not explicitly return it, replicating the original code's behavior.
});

var minDifference = null; // Initialize a variable to store the smallest absolute difference found, starting as null

// Iterate through all possible split points for the 'weightNumbers' array
// The split point 'splitPoint' represents the index where the array is divided
for (var splitPoint = 1; splitPoint < totalCount; splitPoint++) {
    // Calculate the sum of the elements in the first part of the array (from index 0 up to 'splitPoint' - 1)
    // Then, calculate the sum of the elements in the second part of the array (from 'splitPoint' to the end)
    // Finally, compute the difference between these two sums
    var currentDifference = weightNumbers.slice(0, splitPoint).reduce(function (accumulator, currentValue) {
        return accumulator + currentValue;
    }) - weightNumbers.slice(splitPoint).reduce(function (accumulator, currentValue) {
        return accumulator + currentValue;
    });

    // If the calculated difference is negative, convert it to its positive (absolute) value
    if (currentDifference < 0) {
        currentDifference = -currentDifference; // Make the difference absolute
    }

    // Check if 'minDifference' is currently null (first iteration) or if the 'currentDifference' is smaller
    if (minDifference === null || minDifference > currentDifference) {
        minDifference = currentDifference; // Update 'minDifference' with the new smallest absolute difference
    }
}

console.log(minDifference); // Print the final minimum absolute difference found to the console
