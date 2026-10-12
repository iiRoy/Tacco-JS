var LOWER_DIGIT_BOUND = 0, // Defines the minimum allowed digit value
    UPPER_DIGIT_BOUND = 9; // Defines the maximum allowed digit value

// Prepare standard input stream to receive data
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event listener for incoming data on standard input
process.stdin.on("data", function(inputBuffer) {
    // Process the input: convert chunk to string, trim whitespace, split by newline,
    // and parse each line into an integer.
    var targetValues = String(inputBuffer).trim().split("\n").map(parseInt),
        validCombinations = 0; // Initialize a counter for combinations (will be reset per target value)

    // Iterate through each target number provided in the input
    for (var valueIndex = 0; valueIndex < targetValues.length; valueIndex++) {
        validCombinations = 0; // Reset combination counter for the current target value

        // Four nested loops to iterate through all possible combinations of four digits
        // Each digit can range from LOWER_DIGIT_BOUND to UPPER_DIGIT_BOUND (0-9)
        for (var firstDigit = LOWER_DIGIT_BOUND; firstDigit <= UPPER_DIGIT_BOUND; firstDigit++) {
            for (var secondDigit = LOWER_DIGIT_BOUND; secondDigit <= UPPER_DIGIT_BOUND; secondDigit++) {
                for (var thirdDigit = LOWER_DIGIT_BOUND; thirdDigit <= UPPER_DIGIT_BOUND; thirdDigit++) {
                    for (var fourthDigit = LOWER_DIGIT_BOUND; fourthDigit <= UPPER_DIGIT_BOUND; fourthDigit++) {
                        // Check if the sum of the four digits equals the current target value
                        if (firstDigit + secondDigit + thirdDigit + fourthDigit === targetValues[valueIndex]) {
                            validCombinations++; // Increment the counter if a valid combination is found
                        }
                    }
                }
            }
        }
        // Output the total number of valid combinations for the current target value
        console.log(validCombinations);
    }
});
