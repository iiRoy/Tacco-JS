var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data
var lineSegments = (rawData.trim()).split('\n');

// Main processing loop
while (!false) {
    // Extract the initial count value
    var countVal = lineSegments.shift() - 0x0;

    // Check for termination condition
    if (countVal === 0) {
        break;
    }

    // Parse primary values
    var primaryValues = lineSegments.shift().split(' ').map(Number);

    // Parse secondary values
    var secondaryValues = lineSegments.shift().split(' ').map(Number);

    // Calculate the total sum of primary values
    var totalSum = primaryValues.reduce(function(accumulator, currentValue) {
        return accumulator + currentValue;
    });

    // Sort secondary values in descending order
    secondaryValues.sort(function(valA, valB) {
        return valB - valA;
    });

    // Initialize the greatest result
    var greatestResult = totalSum * countVal;

    // Inner loop for processing secondary values
    while (true) {
        // If no more secondary values, exit inner loop
        if (secondaryValues.length === 0) {
            break;
        }

        // Decrement the count
        countVal--;

        // Update the greatest result
        greatestResult = Math.max(greatestResult, (totalSum + secondaryValues.shift()) * countVal);
    }

    // Output the final greatest result for the current set
    console.log(greatestResult);
}
