var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain all input data from standard input
var textRows = rawData.split('\n'); // Divide the raw input string into an array of lines
var firstRowParts = textRows.shift().split(' '); // Extract the first line and segment it by spaces

var upperBound = firstRowParts[0] * 1; // Convert the initial segment of the first line to a numerical value (N)
var thresholdVal = firstRowParts[1] * 1; // Convert the second segment of the first line to a numerical value (K)

var totalProbability = 0.0; // Initialize a floating-point variable to accumulate the final probability sum

// Begin a loop that iterates from 1 up to and including the 'upperBound' value
for (var currentNum = 1; currentNum <= upperBound; currentNum++) {
    var tempVal = currentNum; // Assign the current loop iteration number to a temporary variable
    var doublingCount = 0; // Initialize a counter for the number of times 'tempVal' is doubled

    // Continue doubling 'tempVal' as long as it remains less than 'thresholdVal'
    while (tempVal < thresholdVal) {
        tempVal = tempVal * 2.0; // Multiply 'tempVal' by two
        doublingCount++; // Increment the doubling counter
    }

    // Add the calculated probability for the current 'currentNum' to the 'totalProbability'
    // The probability is (1/N) * (1 / (2 raised to the power of doublingCount))
    totalProbability += (1.0 / upperBound) * (1.0 / Math.pow(2.0, doublingCount));
}

console.log(totalProbability); // Display the final computed total probability to the console
