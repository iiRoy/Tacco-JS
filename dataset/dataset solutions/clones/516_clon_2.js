// This program processes a sequence of numerical datasets from standard input.
// Its primary goal is to compute and display the maximum possible product
// derived from specific calculations within each dataset.

// Acquire the raw input data from the standard input stream.
// The 'fs' module is utilized for file system operations, specifically reading synchronous data.
var dataSource = require('fs').readFileSync('/dev/stdin', 'utf8');

// Prepare the input: remove any leading/trailing whitespace and then
// split the entire string into an array of individual lines.
var lineBuffer = (dataSource.trim()).split("\n");

// Begin the main processing loop. This loop continues indefinitely
// until a specific break condition is encountered within its body.
while (true) {
    // Extract the first element from the line buffer, which represents a count.
    // The subtraction of zero explicitly converts the string to a number.
    var quantityNum = lineBuffer.shift() - 0;

    // Check for the termination condition for the main loop.
    // If the extracted count is zero, it signifies the end of input datasets.
    if (quantityNum === 0) {
        break;
    }

    // Process the next line to obtain the first set of numbers.
    // It's split by spaces and each part is converted into a numerical value.
    var firstSet = lineBuffer.shift().split(" ").map(Number);

    // Similarly, process the subsequent line to get the second set of numbers.
    var secondSet = lineBuffer.shift().split(" ").map(Number);

    // Calculate the initial running sum by aggregating all numbers in the 'firstSet'.
    var runningSum = firstSet.reduce(function(currentAccumulator, itemValue) {
        return currentAccumulator + itemValue;
    });

    // Sort the 'secondSet' of numbers in descending order.
    // This strategy is crucial for optimizing the product calculation later on.
    secondSet.sort(function(valueA, valueB) {
        return valueB - valueA;
    });

    // Initialize the variable that will store the highest product found.
    // Its initial value is the product of the current running sum and the quantity number.
    var highestProduct = runningSum * quantityNum;

    // Start an inner loop to iteratively process elements from the 'secondSet'.
    while (true) {
        // If the 'secondSet' is empty, there are no more additional values to process,
        // so the inner loop terminates.
        if (secondSet.length === 0) {
            break;
        }

        // Decrement the quantity number for the current iteration.
        quantityNum--;

        // Add the largest remaining value from 'secondSet' to the running sum.
        // `shift()` removes and returns the first element (which is the largest due to previous sort).
        runningSum += secondSet.shift();

        // Recalculate the product with the updated sum and quantity.
        // Update 'highestProduct' if the new product is greater than the previously stored one.
        highestProduct = Math.max(highestProduct, runningSum * quantityNum);
    }

    // After processing all elements for a given dataset, output the final
    // calculated highest product to the standard output.
    console.log(highestProduct);
}