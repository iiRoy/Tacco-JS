var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var dataRows = rawData.split('\n'); // Split the input into an array of lines

// Process each line until an empty line or end of input is reached
while (currentRow = dataRows.shift()) {
    // Parse the current line into an array of integers
    var parsedNumbers = currentRow.split(' ').map(function(numStr) {
        return parseInt(numStr, 10); // Convert string parts to base-10 integers
    });

    // Combine specific elements from the parsed numbers array
    var combinedValues = [
        + parsedNumbers[0] + parsedNumbers[3], // Sum of first and fourth elements
        + parsedNumbers[1] + parsedNumbers[4], // Sum of second and fifth elements
        + parsedNumbers[2] + parsedNumbers[5]  // Sum of third and sixth elements
    ];

    // If the sum of combined values is zero, terminate the process
    if (combinedValues[0] + combinedValues[1] + combinedValues[2] === 0) {
        process.exit();
    }
    
    var totalSets = 0; // Initialize a counter for the number of sets

    // First pass: calculate sets of 3 from each combined value
    for (var idx = 0; idx < combinedValues.length; idx++) {
        totalSets += Math.floor(combinedValues[idx] / 3); // Add full sets of 3
        combinedValues[idx] %= 3; // Keep the remainder
    }

    // Second pass: calculate sets of 1 from the remaining combined values
    // This loop continues as long as there's at least one of each remaining value
    while (true) {
        if (combinedValues[0] >= 1 && combinedValues[1] >= 1 && combinedValues[2] >= 1) {
            totalSets++; // Increment the set counter
            combinedValues[0]--; // Decrement each remaining value
            combinedValues[1]--;
            combinedValues[2]--;
        } else {
            break; // Exit loop if any value is less than 1
        }
    }
    
    // Output the final count of sets for the current line
    console.log(totalSets);
}
