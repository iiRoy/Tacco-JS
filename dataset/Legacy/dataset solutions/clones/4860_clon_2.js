// This function serves as the primary entry point for processing the provided input data.
function ProcessInput(rawData) {
    // The input string is first divided into an array of individual lines.
    var lines = rawData.split("\n");

    // The initial element of the 'lines' array specifies the total number of processing cycles.
    var iterationsCount = lines[0];

    // The subsequent elements of the 'lines' array form the starting collection of values.
    var currentValues = lines.slice(1);

    // A loop is initiated to perform the core transformation logic for the specified number of iterations.
    for (var loopIndex = 0; loopIndex < iterationsCount; ++loopIndex) {
        // A temporary array is created in each iteration to store the computed results for the current cycle.
        var nextValues = [];

        // This inner loop processes the 'currentValues' array in pairs.
        for (var pairIndex = 0; pairIndex < currentValues.length; pairIndex += 2) {
            // The comparison and arithmetic operations below rely on JavaScript's implicit type coercion
            // to convert string values from the input into numbers as needed.
            if (currentValues[pairIndex] > currentValues[pairIndex + 1]) {
                // If the first value in the pair is numerically larger, their difference is added.
                nextValues.push(currentValues[pairIndex] - currentValues[pairIndex + 1]);
            } else if (currentValues[pairIndex] == currentValues[pairIndex + 1]) {
                // If both values in the pair are numerically equal, the first value is added.
                nextValues.push(currentValues[pairIndex]);
            } else {
                // Otherwise (if the second value is numerically larger), their difference (second minus first) is added.
                nextValues.push(currentValues[pairIndex + 1] - currentValues[pairIndex]);
            }
        }
        // After processing all pairs, the 'currentValues' array is updated with the newly computed 'nextValues'.
        currentValues = nextValues;
    }

    // Upon completion of all iterations, the very first element of the final 'currentValues' array is printed to the console.
    console.log(currentValues[0]);
}

// The program reads its input from standard input, using UTF-8 encoding, and then passes it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
