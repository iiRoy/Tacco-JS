var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var lineData = (rawData.trim()).split("\n"); // Split input into an array of lines, removing leading/trailing whitespace

// Main processing loop
while (true) {
    // Extract three numeric parameters from the current line
    var params = (lineData.shift()).split(" ").map(Number);

    // Check for termination condition: all three parameters are zero
    if (params[0] === 0 && params[1] === 0 && params[2] === 0) {
        break; // Exit the loop
    }

    // Assign parameters to more descriptive variable names
    var count = params[0];        // Number of values to read
    var targetIndex = params[1] - 1; // Index of the target value (0-based)
    var percentage = params[2];   // Percentage deduction

    var valuesList = []; // Array to store individual values
    var totalScore = 0;  // Accumulator for the sum of values (multiplied by 100)

    // Loop to read 'count' number of values
    for (var idx = 0; idx < count; idx++) {
        var currentValue = lineData.shift() - 0; // Read a value and convert to number
        valuesList.push(currentValue);           // Add value to the list
        totalScore += (currentValue * 100);      // Add value * 100 to total score
    }

    // Apply percentage deduction to the total score
    totalScore = totalScore * (100 - percentage) / 100;

    var finalResult = 0; // Initialize the final result

    // Calculate the final result if the target value is not zero
    if (valuesList[targetIndex] !== 0) {
        finalResult = Math.floor(totalScore / valuesList[targetIndex]);
    }

    // Output the calculated result
    console.log(finalResult);
}
