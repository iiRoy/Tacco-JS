var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the entire input content into an array of individual lines.
var lineSegments = rawData.split("\n");

// Initialize an empty string to accumulate the results of operations.
var resultBuffer = "";

// Iterate through each line segment received from the input.
for (var idx = 0; idx < lineSegments.length; idx++) {
    // Split the current line into its constituent parts: two operands and an operator.
    var parts = lineSegments[idx].split(" ");

    // Convert the first part to a number, representing the first operand.
    var operandOne = parts[0] - 0;
    // Extract the operator symbol from the second part.
    var operationSymbol = parts[1];
    // Convert the third part to a number, representing the second operand.
    var operandTwo = parts[2] - 0;

    // If the operation symbol is a question mark, it signifies the end of input, so break the loop.
    if (operationSymbol === "?") {
        break;
    }

    // Perform the operation based on the symbol and append the result to the buffer.
    if (operationSymbol === "+") {
        resultBuffer += operandOne + operandTwo;
    }
    if (operationSymbol === "-") {
        resultBuffer += operandOne - operandTwo;
    }
    if (operationSymbol === "*") {
        resultBuffer += operandOne * operandTwo;
    }
    if (operationSymbol === "/") {
        // For division, use Math.floor to ensure integer division as per problem requirements.
        resultBuffer += Math.floor(operandOne / operandTwo);
    }

    // Append a newline character after each operation's result.
    resultBuffer += "\n";
}

// Print the final accumulated results, removing any trailing whitespace (like the last newline).
console.log(resultBuffer.trim());
