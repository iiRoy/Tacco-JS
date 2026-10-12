function ProcessInputData(rawData) {
    // This function processes an array of input strings.
    // The original code comments suggest that input might be split by newlines,
    // but the current implementation expects an array of strings directly.
    // For example, rawData[0] would be the first line, rawData[1] the second, and so on.

    // An array is initialized with the first four elements of the input.
    // Note: This array 'numericValues' is declared but not used in the subsequent logic.
    // The original logic directly accesses elements of the 'rawData' parameter.
    var numericValues = new Array(rawData[0], rawData[1], rawData[2], rawData[3]);

    // Loop through the input data to check for specific patterns.
    // The loop condition and increment logic are crucial for preserving original behavior.
    for (var idx = 0; idx <= numericValues.length; idx++) {
        // Check if the current element is identical to the next element.
        // The '++idx' operator increments 'idx' *before* its value is used in the expression.
        // This means 'idx' is incremented twice within the loop body if this condition is evaluated.
        if (rawData[idx] - rawData[++idx] === 0) {
            console.log("Bad"); // Output "Bad" if two consecutive values are the same.
            break; // Terminate the loop immediately.
        }
        // If the above condition is false, check for a specific pattern of distinct values.
        // This condition checks if rawData[3] != rawData[2] AND rawData[2] != rawData[1] AND rawData[1] != rawData[0].
        // The subtraction results in a non-zero (truthy) value if the numbers are different.
        else if (rawData[3] - rawData[2] && rawData[2] - rawData[1] && rawData[1] - rawData[0]) {
            console.log("good"); // Output "good" if all four values are distinct in this specific order.
            break; // Terminate the loop immediately.
        }
    }
}

// This section handles reading input from standard input and calling the main processing function.
// It should not be modified to preserve the standard input/output mechanism.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));
