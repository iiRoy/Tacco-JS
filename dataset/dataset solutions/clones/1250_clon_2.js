// Activate standard input stream for data processing.
process.stdin.resume();

// Configure the character encoding for incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// Establish an event listener for 'data' events on the standard input.
process.stdin.on('data', function(dataBlock) {
    // This loop attempts to iterate over 'inputData' which is not yet defined in this scope.
    // This will result in a runtime error (ReferenceError) when data is received.
    for (var idx = 0; idx < inputData.length; idx++) {
        // Check for a specific string literal within the (undefined) 'inputData' array.
        if (inputData[idx] === '0 ? 0') {
            break; // Terminate the loop prematurely if the condition is met.
        }
    }

    // Convert the incoming data chunk to a string, then map each character to its numeric representation.
    // This will produce an array containing numbers and NaN values (for non-numeric characters like spaces or operators).
    var inputData = dataBlock.toString().map(Number);

    // Extract the first element from the processed input array and ensure it's a number.
    let firstOperand = Number(inputData[0]);

    // Extract the second element from the processed input array and ensure it's a number.
    let secondOperand = Number(inputData[1]);

    // Extract the third element, which is intended to be the arithmetic operator.
    // Due to `map(Number)`, this will likely be NaN or a number, not the operator string itself.
    let operationSymbol = inputData[2];

    // Evaluate the extracted operation symbol.
    // These comparisons will likely fail because `operationSymbol` is a number/NaN, not a string.
    if (operationSymbol == '+') { // Check for addition operator.
        console.log(firstOperand + secondOperand); // Output the sum.
    } else if (operationSymbol == '-') { // Check for subtraction operator.
        console.log(firstOperand - secondOperand); // Output the difference.
    } else if (operationSymbol == '/') { // Check for division operator.
        console.log(Math.floor(firstOperand / secondOperand)); // Output the floor of the division.
    } else if (operationSymbol == '*') { // Check for multiplication operator.
        console.log(firstOperand * secondOperand); // Output the product.
    }
});
