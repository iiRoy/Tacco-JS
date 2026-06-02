var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace, split by newlines, and convert to numbers.
var numericData = rawData.trim().split("\n").map(Number);

// Main processing loop. Continues until a specific condition is met.
while (true) {
    // Extract the next number from the beginning of the numeric data array.
    var currentCount = numericData.shift();

    // If the extracted number is 0, it signifies the end of input, so break the loop.
    if (currentCount === 0) {
        break;
    }

    // Initialize an empty array to store processed values for the current block.
    var processedValues = [];
    // Initialize a boolean flag to alternate behavior.
    var toggleState = false;

    // Iterate 'currentCount' times to process subsequent numbers.
    for (var idx = 0; idx < currentCount; idx++) {
        // Get the next value from the input data.
        var itemValue = numericData.shift();
        // Flip the boolean flag.
        toggleState = !toggleState;

        // Based on the toggle state, perform different operations.
        if (toggleState) {
            // If toggleState is true, simply add the itemValue to the processedValues array.
            processedValues.push(itemValue);
        } else {
            // If toggleState is false, check the last element of processedValues.
            if (processedValues[processedValues.length - 1] === itemValue) {
                // If the last element is the same, add the itemValue.
                processedValues.push(itemValue);
            } else {
                // If different, add the itemValue and then backtrack to update previous elements.
                processedValues.push(itemValue);
                // Initialize a backward index.
                var backIndex = idx - 1;

                // Loop backward through the processedValues array.
                while (true) {
                    // Stop if the index goes out of bounds or if an element matching itemValue is found.
                    if (backIndex < 0 || processedValues[backIndex] === itemValue) {
                        break;
                    } else {
                        // Otherwise, update the element at backIndex with itemValue and move further back.
                        processedValues[backIndex] = itemValue;
                        backIndex--;
                    }
                }
            }
        }
    }

    // After processing all numbers for the current block, count occurrences of zero.
    var zeroCounter = 0;
    processedValues.forEach(function (element) {
        if (element === 0) {
            zeroCounter++;
        }
    });

    // Output the total count of zeros for the current block.
    console.log(zeroCounter);
}
