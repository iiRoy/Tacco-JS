var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineSegments = rawData.trim().split("\n");

// Loop through input lines until a line containing '0' is encountered
while (lineSegments.shift() != 0) {
    // Parse the next line into an array of numbers
    var numericValues = lineSegments.shift().split(" ").map(Number);

    // Sort the array of numbers in ascending order
    numericValues.sort((firstVal, secondVal) => firstVal - secondVal);

    // Initialize a variable to store the smallest difference found
    var smallestDifference = Infinity;

    // Use reduce to iterate through the sorted array and find the minimum absolute difference between adjacent elements
    numericValues.reduce((previousElement, currentElement) => {
        // Calculate the absolute difference between the current and previous elements
        // Update smallestDifference if the new difference is smaller
        smallestDifference = Math.min(smallestDifference, Math.abs(previousElement - currentElement));
        // Return the current element to be used as the 'previousElement' in the next iteration
        return currentElement;
    });

    // Print the smallest difference found for the current set of numbers
    console.log(smallestDifference);
}
