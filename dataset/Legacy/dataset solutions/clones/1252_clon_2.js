var inputDataRows, loopIndex, querySymbolPosition;

// Read all input from standard input, assuming ASCII encoding.
// Then, split the entire content into an array of strings, one for each line.
inputDataRows = require('fs').readFileSync('/dev/stdin', 'ascii').split("\n");

// Iterate through the lines in reverse order to find the last occurrence of a specific marker.
for (loopIndex = inputDataRows.length - 1; loopIndex >= 0; loopIndex--) {
    // Check if the current line contains the query symbol.
    if (inputDataRows[loopIndex].includes("?")) {
        querySymbolPosition = loopIndex; // Store the index of the line containing the marker.
    }
}

// Create a new array containing only the lines before the marker.
inputDataRows = inputDataRows.slice(0, querySymbolPosition);

// Process each line in the filtered array using the 'evaluateExpression' function.
// The results are then joined back into a single string, separated by newline characters,
// and printed to the console.
console.log(inputDataRows.map(evaluateExpression).join("\n"));

/**
 * Parses an arithmetic expression from a string and computes its result.
 * Supports addition, subtraction, multiplication, and integer division.
 *
 * @param {string} currentExpressionLine - A string representing an arithmetic operation (e.g., "5 + 3").
 * @returns {number} The numerical result of the expression.
 */
function evaluateExpression(currentExpressionLine) {
    var expressionComponents; // An array to hold the parsed parts of the expression.

    // Split the input string by spaces into at most three components: operand1, operator, operand2.
    expressionComponents = currentExpressionLine.split(" ", 3);

    // Determine the operation based on the operator component.
    if (expressionComponents[1] == '+') {
        // Perform addition.
        return parseInt(expressionComponents[0]) + parseInt(expressionComponents[2]);
    } else if (expressionComponents[1] == '-') {
        // Perform subtraction.
        return parseInt(expressionComponents[0]) - parseInt(expressionComponents[2]);
    } else if (expressionComponents[1] == '*') {
        // Perform multiplication.
        return parseInt(expressionComponents[0]) * parseInt(expressionComponents[2]);
    }
    // If no other operator matches, default to integer division.
    return Math.floor(parseInt(expressionComponents[0]) / parseInt(expressionComponents[2]));
}
