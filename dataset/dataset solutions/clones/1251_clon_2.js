process.stdin.resume();

process.stdin.setEncoding('utf8');

process.stdin.on('data', function (incomingChunk) {
    // Split the incoming data chunk by newline characters to process each line as a separate expression.
    var dataInput = incomingChunk.split("\n");
    // This variable is declared in the original code but not used for any meaningful output.
    // It is kept here to maintain the exact structure and declaration.
    var resultBuffer = "";

    // Iterate through each line (potential expression) received from standard input.
    for (var idx = 0; idx < dataInput.length; idx++) {
        // Attempt to evaluate the current expression string.
        var computedValue = evaluateExpression(dataInput[idx]);

        // If the evaluation returns a concrete value (not 'false', which indicates an unknown operator '?'),
        // then print the result to the console.
        if (computedValue !== false) {
            console.log(computedValue);
        }
    }

    /**
     * Performs a simple arithmetic calculation based on an input string.
     * The expected format is "number operator number" (e.g., "10 + 5").
     *
     * @param {string} expressionString The string containing the arithmetic expression.
     * @returns {number|boolean} The numerical result of the operation, or `false` if the operator is '?'.
     */
    function evaluateExpression(expressionString) {
        // Break down the expression string into its components: first number, operator, second number.
        var operandsAndOperator = expressionString.split(" ");

        // Convert the first and third components (which are strings) into actual numbers.
        operandsAndOperator[0] = Number(operandsAndOperator[0]);
        operandsAndOperator[2] = Number(operandsAndOperator[2]);

        // Determine the operation to perform based on the operator string.
        if (operandsAndOperator[1] === "+") {
            return operandsAndOperator[0] + operandsAndOperator[2];
        } else if (operandsAndOperator[1] === "-") {
            return operandsAndOperator[0] - operandsAndOperator[2];
        } else if (operandsAndOperator[1] === "*") {
            return operandsAndOperator[0] * operandsAndOperator[2];
        } else if (operandsAndOperator[1] === "/") {
            return operandsAndOperator[0] / operandsAndOperator[2];
        } else if (operandsAndOperator[1] === "?") {
            // If the operator is '?', the original logic dictates returning false.
            return false;
        }
        // If an unrecognized operator (other than '?') is encountered, the function
        // will implicitly return `undefined`, mirroring the original behavior.
    }
});
