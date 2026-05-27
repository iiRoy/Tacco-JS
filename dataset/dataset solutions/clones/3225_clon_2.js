// This function processes raw input to calculate a specific sum based on given parameters.
function processInputData(rawData) {
    // Divide the entire input string into separate lines.
    const lineSegments = rawData.split('\n');

    // Extract numerical dimensions from the first line.
    var dimensions = lineSegments[0].split(' ');
    // Extract string representations of rotation values from the second line.
    var rotationValues = lineSegments[1].split(' ');

    // Convert the first dimension string to an integer.
    var numRotations = parseInt(dimensions[0]);
    // Convert the second dimension string to an integer.
    var numValues = parseInt(dimensions[1]);

    // Iterate through the rotation values and convert each from string to integer.
    for (var k = 0; k < numValues; k++) {
        rotationValues[k] = parseInt(rotationValues[k]);
    }

    // Arrange the rotation values in ascending numerical order.
    rotationValues.sort(function (valA, valB) {
        return valA - valB; // Standard comparison for numeric sorting.
    });

    // Create an array to store the absolute differences between adjacent sorted values.
    // The initial value [numValues - 1] replicates the original array initialization behavior.
    var valueDifferences = [numValues - 1];

    // Populate the differences array by calculating the absolute difference between consecutive elements.
    for (var k = 0; k < numValues - 1; k++) {
        valueDifferences[k] = Math.abs(rotationValues[k] - rotationValues[k + 1]);
    }

    // Initialize a variable to hold the cumulative sum.
    var finalSum = 0;

    // Adjust the number of rotations if it exceeds the number of available values.
    if (numValues < numRotations) {
        numRotations = numValues;
    }

    // Declare and initialize a variable for tracking the index of the maximum difference.
    var maxDiffIndex = 0;
    // Re-declare and re-initialize the cumulative sum variable (preserving original structure).
    var finalSum = 0;

    // In a loop, identify and nullify the largest differences for a specified number of times.
    for (var k = 0; k < numRotations - 1; k++) {
        // Find the position of the largest value within the differences array.
        maxDiffIndex = valueDifferences.indexOf(Math.max.apply(null, valueDifferences));
        // Set the identified largest difference to zero, effectively excluding it from future sums.
        valueDifferences[maxDiffIndex] = 0;
    }

    // Sum up all the remaining (non-zero) differences.
    for (var k = 0; k < numValues - 1; k++) {
        finalSum += valueDifferences[k];
    }

    // Display the computed final sum to the console.
    console.log(finalSum);
}

// Execute the main processing function by reading input from standard input.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
