var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var lineSegments = (rawData.trim()).split("\n"); // Split the input into an array of lines, removing leading/trailing whitespace

// Main processing loop
while (true) {
    // Parse the first line of the current data block: count, target, deduction_percentage
    var configParams = (lineSegments.shift()).split(" ").map(Number);

    // Check for termination condition (all parameters are zero)
    if (configParams[0] === 0 && configParams[1] === 0 && configParams[2] === 0) {
        break; // Exit the loop
    }

    var countItems = configParams[0]; // Number of items to process
    var targetIndex = configParams[1] - 1; // Adjust target index to be 0-based
    var percentageDeduction = configParams[2]; // Percentage deduction value

    var valueList = []; // Array to store individual item values
    var totalScore = 0; // Accumulator for the sum of values

    // Loop to read 'countItems' values and calculate their sum
    for (var idx = 0; idx < countItems; idx++) {
        var currentValue = lineSegments.shift() - 0; // Read next value and convert to number
        valueList.push(currentValue); // Add the value to our list
        totalScore += (currentValue * 100); // Accumulate sum, scaled by 100
    }

    // Apply the percentage deduction to the total score
    totalScore = totalScore * (100 - percentageDeduction) / 100;

    var finalResult = 0; // Initialize the final calculated result

    // Calculate the final result if the value at the target index is not zero
    if (valueList[targetIndex] !== 0) {
        finalResult = Math.floor(totalScore / valueList[targetIndex]); // Perform division and floor the result
    }

    console.log(finalResult); // Output the computed result
}
