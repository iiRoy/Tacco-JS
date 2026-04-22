const fileSystemUtility = require('fs');
const readSourceContent = fileSystemUtility.readFileSync;
const convertToInteger = Number;
const displayOutput = console.log;
const terminateProcess = process.exit;

// Acquire raw data from the standard input stream
var rawInputData = readSourceContent('/dev/stdin', 'utf8');

// Deconstruct the comprehensive input into an array of distinct text rows
var textRowsCollection = rawInputData.split('\n');

// Declare a variable to hold the current line segment processed within the main loop
var currentLineSegment;

// Iterate through each line of the input array until the collection is exhausted
while (currentLineSegment = textRowsCollection.shift()) {

    // Parse the current line into a numeric array of components
    var numericComponents = currentLineSegment.split(' ').map(function(itemString) {
        return convertToInteger(itemString);
    });

    // Compute initial combined values based on specific index pairings
    var combinedValues = [
          + numericComponents[0] + numericComponents[3],
          + numericComponents[1] + numericComponents[4],
          + numericComponents[2] + numericComponents[5]
    ];

    // Check for a specific termination condition: if the sum of combined values is zero
    if (combinedValues[0] + combinedValues[1] + combinedValues[2] === 0) {
        terminateProcess(); // Invoke the program termination function
    }

    // Initialize a counter for the ongoing calculation
    var calculationTally = 0;

    // First processing pass: distribute values by thirds and update the tally
    for (var componentIndex = 0; componentIndex < combinedValues.length; componentIndex++) {
        calculationTally += Math.floor(combinedValues[componentIndex] / 3);
        combinedValues[componentIndex] %= 3;
    }

    // Second processing pass: repeatedly decrement values if all are at least 1, incrementing the tally
    while (true) {
        if (combinedValues[0] >= 1 && combinedValues[1] >= 1 && combinedValues[2] >= 1) {
            calculationTally++;
            combinedValues[0]--;
            combinedValues[1]--;
            combinedValues[2]--;
        } else {
            break; // Exit this inner loop if the condition is no longer met
        }
    }

    // Output the final calculated tally for the current input line
    displayOutput(calculationTally);
}