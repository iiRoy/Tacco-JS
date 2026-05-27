var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var numericData = rawData.trim().split("\n").map(Number); // Process input: trim, split by newline, convert to numbers

// Main processing loop
while (true) {
    var currentCount = numericData.shift(); // Get the next number, which indicates the count of elements for the current test case

    // If the count is zero, it's the end of input
    if (currentCount === 0) {
        break;
    }

    var sequenceElements = []; // Initialize an array to store elements for the current test case
    // Populate the sequenceElements array based on currentCount
    while (currentCount--) {
        sequenceElements.push(numericData.shift());
    }

    var processedList = []; // This array will store the processed sequence
    // Iterate through each element in the sequence
    sequenceElements.forEach(function (elementValue, elementIndex) {
        // If the index is odd (0-indexed, so (index+1) is odd for 1st, 3rd, etc. elements)
        if ((elementIndex + 1) % 2 === 1) {
            processedList.push(elementValue); // Simply add the element to the processed list
        } else {
            // If the index is even (0-indexed, so (index+1) is even for 2nd, 4th, etc. elements)
            // Check if the current element is the same as the last element in the processed list
            if (processedList[processedList.length - 1] === elementValue) {
                processedList.push(elementValue); // If they are the same, just add it
            } else {
                // If they are different, add the current element
                processedList.push(elementValue);

                // Then, propagate the current element's value backward in the processed list
                // until a different value is encountered or the beginning of the list is reached
                while (true) {
                    elementIndex--; // Move to the previous index

                    // If we are still within bounds and the previous element is different from the current value, continue
                    if (elementIndex > 0 && processedList[elementIndex] !== elementValue) {
                        continue;
                    } else {
                        // If we reached the beginning or found an element that matches the current value
                        if (elementIndex < 0) {
                            elementIndex = 0; // Ensure index doesn't go below 0
                        }

                        // Fill all elements from the adjusted index up to the second-to-last element
                        // (the last one is the one we just pushed) with the current element's value
                        while (elementIndex !== processedList.length - 1) {
                            processedList[elementIndex] = elementValue;
                            elementIndex++;
                        }
                        break; // Exit the inner propagation loop
                    }
                }
            }
        }
    });

    var zeroCount = 0; // Initialize a counter for zeros
    // Count the number of zeros in the final processed list
    processedList.forEach(function (itemValue) {
        if (itemValue === 0) {
            zeroCount++;
        }
    });

    console.log(zeroCount); // Output the total count of zeros for the current test case
}
