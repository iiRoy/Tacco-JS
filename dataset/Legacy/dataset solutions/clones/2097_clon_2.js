const inputProvider = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let currentLineNumber = 0; // Tracks the current line being read from input
let overallMagnitude;      // Stores the total value from the first input line
let firstComponent;        // Holds the initial large number from the second input line
let secondComponent;       // Contains the subsequent large number from the third input line

// Listener for incoming lines of text from standard input
inputProvider.on('line', (receivedText) => {
    // Process each input string as a BigInt
    if (currentLineNumber === 0) {
        overallMagnitude = BigInt(receivedText); // Parse the principal quantity
    } else if (currentLineNumber === 1) {
        firstComponent = BigInt(receivedText);   // Obtain the primary numerical part
    } else if (currentLineNumber === 2) {
        secondComponent = BigInt(receivedText);  // Acquire the secondary numerical part

        // All necessary inputs have been collected; proceed with the core computation
        let summedDivisor;     // Variable to hold the sum of the two components
        let finalResultValue;  // Accumulates the computed outcome
        let remainderQuantity; // Stores the remaining value after a division operation

        // Combine the two constituent parts by addition
        summedDivisor = firstComponent + secondComponent;

        // Execute an integer division of the total magnitude by the combined divisor
        finalResultValue = overallMagnitude / summedDivisor;

        // Multiply the current calculation result by the first component
        finalResultValue = finalResultValue * firstComponent;

        // Compute the remainder when the total magnitude is divided by the summed divisor
        remainderQuantity = overallMagnitude % summedDivisor;

        // Apply a conditional adjustment based on the size of the remainder
        if (remainderQuantity < firstComponent) {
            finalResultValue += remainderQuantity; // Add the remainder if it's smaller
        } else {
            finalResultValue += firstComponent;    // Otherwise, add the first component
        }

        // Output the ultimate computed numerical result to standard output
        console.log(finalResultValue.toString());

        // Close the input reading interface as all processing is complete
        inputProvider.close();
    }
    // Increment the line counter for the next input line
    currentLineNumber++;
});