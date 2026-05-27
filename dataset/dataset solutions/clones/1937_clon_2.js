function ProcessInput(rawData) {
    // The incoming string data is first split into an array of substrings.
    rawData = rawData.split(" ");

    // Parse the first element of the array into an integer, specifying base 10.
    var firstValue = parseInt(rawData[0], 10);

    // Parse the second element of the array into an integer, also using base 10.
    var secondValue = parseInt(rawData[1], 10);

    // Evaluate a condition based on the two numerical values.
    if (firstValue <= secondValue) {
        // If the condition is true, print 'unsafe' to the console.
        console.log('unsafe');
    }
    // Otherwise, if the first value is strictly greater than the second.
    else if (firstValue > secondValue) {
        // In this case, print 'safe' to the console.
        console.log('safe');
    }
}

// This line should not be altered; it manages reading from standard input and invoking the primary function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
