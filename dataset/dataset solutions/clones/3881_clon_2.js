// This function processes the provided raw data.
function ProcessData(rawData) {
    // Initialize a counter for specific items.
    var scoreAccumulator = 0;

    // Iterate through the first three elements of the input array.
    for (var idx = 0; idx < 3; idx++) {
        // Check if the current element is the character 'o'.
        if (rawData[idx] == 'o') {
            // If it is 'o', increment the accumulator by 100.
            scoreAccumulator = scoreAccumulator + 100;
        }
    }

    // Display the final calculated score plus a base value.
    console.log(scoreAccumulator + 700);
}

// The following line handles reading input from standard input and invoking the main processing function.
// It should not be modified as it manages the program's entry point and data acquisition.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
