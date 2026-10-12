var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data by trimming whitespace and splitting into an array of lines.
var lineSegments = (rawData.trim()).split("\n");

// Main processing loop for multiple test cases.
while (true) {
    // Extract the first number from the line segments, converting it to a numeric type.
    var countVal = lineSegments.shift() - 0;

    // If the extracted number is zero, it signifies the end of input, so break the loop.
    if (countVal === 0) {
        break;
    }

    // Parse the next line for initial values, splitting by space and mapping to numbers.
    var initialValues = lineSegments.shift().split(" ").map(Number);

    // Parse the subsequent line for additional values, splitting by space and mapping to numbers.
    var additionalValues = lineSegments.shift().split(" ").map(Number);

    // Calculate the initial sum of all elements in the 'initialValues' array.
    var currentTotal = initialValues.reduce(function(accumulator, currentValue) {
        return accumulator + currentValue;
    });

    // Sort the 'additionalValues' array in descending order to process largest values first.
    additionalValues.sort(function(firstElement, secondElement) {
        return secondElement - firstElement;
    });

    // Initialize the maximum product with the current total multiplied by the initial count.
    var maximumProduct = currentTotal * countVal;

    // Inner loop to incorporate additional values and update the maximum product.
    while (true) {
        // If there are no more additional values, exit this inner loop.
        if (additionalValues.length === 0) {
            break;
        }

        // Decrement the count value for the next iteration.
        countVal--;

        // Add the largest remaining additional value to the current total.
        currentTotal += additionalValues.shift();

        // Update the maximum product if the new product (currentTotal * countVal) is greater.
        maximumProduct = Math.max(maximumProduct, currentTotal * countVal);
    }

    // Output the calculated maximum product for the current test case.
    console.log(maximumProduct);
}
