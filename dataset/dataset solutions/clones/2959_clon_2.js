function ProcessInput(rawData) {
    // Clean up the raw input string and split it into parts
    rawData = rawData.trim().split(" ");

    // Parse the first numeric value from the input
    var countVal = parseInt(rawData[0], 10);
    // Parse the second numeric value from the input
    var thresholdVal = parseInt(rawData[1], 10);

    // Initialize a variable to accumulate the final result
    var finalResult = 0;

    // Outer loop iterates from 1 up to countVal (inclusive)
    for (var outerIdx = 1; outerIdx <= countVal; outerIdx++) {
        // Initialize a temporary probability value for the current outerIdx
        var currentProb = 1 / countVal;

        // Inner loop iterates a fixed number of times (100,000)
        for (var innerIdx = 0; innerIdx < 100000; innerIdx++) {
            // Check if the threshold is met with the current outerIdx and power of 2
            if (thresholdVal <= outerIdx * Math.pow(2, innerIdx)) {
                // If threshold is met, add the current probability to the final result
                finalResult += currentProb;
                // Exit the inner loop as the condition is satisfied
                break;
            } else {
                // If threshold is not met, halve the current probability
                currentProb /= 2;
            }
        }
    }

    // Output the calculated final result to the console
    console.log(finalResult);
}

// Read input from standard input and pass it to the main processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
