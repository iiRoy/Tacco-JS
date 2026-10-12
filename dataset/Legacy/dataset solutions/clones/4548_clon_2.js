function processInput(rawData) {
    // This function takes raw text input and processes it according to specific rules.
    var linesOfText = rawData.split("\n");

    // The initial value from the first line determines the count of items to sum.
    var currentLengthIndicator = linesOfText[0];

    // Initialize a variable to hold the running total.
    var currentSum = 0;

    // Loop through the specified number of items, starting from the second line.
    for (var idx = 1; idx <= currentLengthIndicator; idx += 1) {
        // Convert each line's content to an integer and add it to the sum.
        currentSum += parseInt(linesOfText[idx], 10);
    }

    // Continue modifying the sum as long as it is perfectly divisible by ten.
    while (currentSum % 10 === 0) {
        // Set a high initial value to find the smallest number.
        var smallestValue = 101;
        // Initialize the index of the smallest value.
        var smallestValueIndex = -1;

        // Iterate through the remaining elements in the array to find the minimum.
        // Note: 'currentLengthIndicator' is re-purposed here to hold the array's current length.
        for (var idx = 1, currentLengthIndicator = linesOfText.length; idx < currentLengthIndicator; idx += 1) {
            // Compare the current element with the smallest value found so far.
            if (smallestValue > parseInt(linesOfText[idx], 10)) {
                // Update the smallest value and its corresponding position.
                smallestValue = parseInt(linesOfText[idx], 10);
                smallestValueIndex = idx;
            }
        }

        // Remove the identified smallest value from the array.
        linesOfText.splice(smallestValueIndex, 1);

        // Subtract the smallest value from the running total.
        currentSum -= smallestValue;

        // If the sum becomes non-positive, reset it to zero and exit the loop.
        if (currentSum <= 0) {
            currentSum = 0;
            break; // Exit the while loop.
        }
    }

    // Print the final calculated sum to the standard output.
    console.log(currentSum);
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
