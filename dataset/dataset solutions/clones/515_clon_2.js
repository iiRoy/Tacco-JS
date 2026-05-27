var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineSegments = (rawData.trim()).split("\n"); // Split the input into an array of lines

while (true) {
    // Extract the first numerical value from the line segments
    var countVal = lineSegments.shift() - 0;

    // If the extracted value is zero, terminate the main processing loop
    if (countVal === 0) {
        break;
    }

    // Parse the next line into an array of numbers (primary set)
    var primaryNums = lineSegments.shift().split(" ").map(Number);

    // Parse the subsequent line into another array of numbers (secondary set)
    var secondaryNums = lineSegments.shift().split(" ").map(Number);

    // Calculate the aggregate sum of all elements in the primary number array
    var totalSum = primaryNums.reduce(function (accumulator, currentVal) {
        return accumulator + currentVal;
    });

    // Arrange the secondary number array in descending order
    secondaryNums.sort(function (firstElement, secondElement) {
        return secondElement - firstElement;
    });

    // Initialize the greatest value with the product of the total sum and the initial count
    var greatestValue = totalSum * countVal;

    // Inner loop for iterative calculation and comparison
    while (true) {
        // If the secondary number array is depleted, exit this inner loop
        if (secondaryNums.length === 0) {
            break;
        }

        // Decrement the count value for the current iteration
        countVal--;

        // Update the greatest value by comparing it with a new computed product
        // The new product is formed by adding the next secondary number to the total sum, then multiplying by the decremented count
        greatestValue = Math.max(greatestValue, (totalSum + secondaryNums.shift()) * countVal);
    }

    // Output the final greatest value determined for the current input set
    console.log(greatestValue);
}
