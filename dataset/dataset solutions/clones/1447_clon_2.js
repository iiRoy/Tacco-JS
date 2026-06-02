process.stdin.on("data", function(inputBuffer) {
    // Convert the input buffer to a string, trim whitespace, and split into an array of lines.
    var processedLines = (inputBuffer + "").trim().split("\n");
    var currentLineIdx = 0;

    // Loop through the input data, processing pairs of lines.
    // The loop continues as long as the current line can be parsed as a non-zero number.
    while (+processedLines[currentLineIdx]) {
        // The first line of a pair contains the count of numbers.
        var numElements = +processedLines[currentLineIdx];
        var totalSum = 0; // This variable will store the sum, then the mean.
        var sumSqDiffs = 0; // This variable will store the sum of squared differences.

        // The second line of a pair contains the numbers as space-separated strings.
        var elementStrings = processedLines[currentLineIdx + 1].split(" ");

        // Calculate the sum of all numbers.
        elementStrings.forEach(function(singleElementStr) {
            totalSum += +singleElementStr;
        });

        // Calculate the mean (average) of the numbers.
        totalSum /= numElements;

        // Calculate the sum of squared differences from the mean.
        elementStrings.forEach(function(singleElementStr) {
            sumSqDiffs += Math.pow(+singleElementStr - totalSum, 2);
        });

        // Calculate the standard deviation and print it formatted to 8 decimal places.
        console.log(Math.sqrt(sumSqDiffs / numElements).toFixed(8));

        // Move to the next pair of lines in the input.
        currentLineIdx += 2;
    }
}).resume(); // Ensure the process stays alive to receive input.
