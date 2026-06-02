var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read all input data from standard input
var lineSegments = (rawData.trim()).split("\n"); // Trim whitespace and split into an array of lines
var totalIterations = lineSegments.shift() - 0; // Get the first line, convert to number, and use as loop count

// Iterate through the remaining lines
for (var idx = 0; idx < totalIterations; idx++) {
    var currentExpression = lineSegments[idx]; // Get the current line (mathematical expression)

    // Remove the last character (likely a newline or extra space from input processing)
    currentExpression = currentExpression.slice(0, -1);

    // Replace floating-point numbers with their integer parts (e.g., "3.14" becomes "3")
    currentExpression = currentExpression.replace(/(\d+)\.\d+/g, "$1");

    // Evaluate the modified string as a JavaScript expression
    var evaluatedResult = eval(currentExpression);

    // Print the integer part of the evaluation result to console
    console.log(parseInt(evaluatedResult, 10));
}
