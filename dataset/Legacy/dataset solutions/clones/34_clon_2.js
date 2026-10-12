const LOWER_LIMIT = 0;
const UPPER_LIMIT = 9;

// Activate standard input stream
process.stdin.resume();
// Set the character encoding for incoming data
process.stdin.setEncoding('utf8');

// Attach an event listener for incoming data chunks
process.stdin.on("data", function(inputData) {
    // Convert the input chunk to a string, split by newlines, and parse each part as an integer.
    // This creates an array of target numbers.
    const targetValues = String(inputData).split("\n").map(parseInt);

    // Iterate through each target number provided in the input.
    for (let targetIdx = 0; targetIdx < targetValues.length; targetIdx++) {
        // Initialize a counter for valid combinations for the current target number.
        let validCombinations = 0;

        // Four nested loops to iterate through all possible combinations of four digits (0-9).
        // This represents the first digit.
        for (let firstDigit = LOWER_LIMIT; firstDigit <= UPPER_LIMIT; firstDigit++) {
            // This represents the second digit.
            for (let secondDigit = LOWER_LIMIT; secondDigit <= UPPER_LIMIT; secondDigit++) {
                // This represents the third digit.
                for (let thirdDigit = LOWER_LIMIT; thirdDigit <= UPPER_LIMIT; thirdDigit++) {
                    // This represents the fourth digit.
                    for (let fourthDigit = LOWER_LIMIT; fourthDigit <= UPPER_LIMIT; fourthDigit++) {
                        // Check if the sum of the four digits equals the current target value.
                        if (firstDigit + secondDigit + thirdDigit + fourthDigit === targetValues[targetIdx]) {
                            // If the sum matches, increment the combination counter.
                            validCombinations++;
                        }
                    }
                }
            }
        }
        // After checking all combinations for the current target, print the total count.
        console.log(validCombinations);
    }
});
