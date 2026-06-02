function ProcessInput(rawData) {
    // This function takes raw input, parses it, and determines a safety status.

    // First, split the incoming string by spaces to separate the values.
    rawData = rawData.split(" ");

    // Convert the first part of the split data into an integer, using base 10.
    var firstValue = parseInt(rawData[0], 10);

    // Convert the second part of the split data into an integer, also using base 10.
    var secondValue = parseInt(rawData[1], 10);

    // Now, compare the two numerical values.
    if (firstValue > secondValue) {
        // If the first value is strictly greater than the second, output 'safe'.
        console.log('safe');
    } else {
        // Otherwise (if the first value is less than or equal to the second), output 'unsafe'.
        console.log('unsafe');
    }
}

// Execute the main processing function by reading data from standard input.
// The 'fs' module is used to read the file synchronously, and 'utf8' specifies the encoding.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
