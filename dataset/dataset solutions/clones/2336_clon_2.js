function ProcessInput(initialValue) {
    // Convert the initial string input into an integer for numerical operations.
    let parsedNumber = parseInt(initialValue, 10);
    // Initialize a variable to accumulate the total count of trailing zeros.
    let totalZeroes = 0;

    // Loop as long as the current number being processed is greater than zero.
    while (parsedNumber > 0) {
        // Call a helper function to count trailing zeros in the current number
        // and add the result to the running total.
        totalZeroes += countTrailingZeros(parsedNumber);
        // Decrement the number by two for the next iteration of the loop.
        parsedNumber -= 2;
    }
    // Output the final accumulated count of trailing zeros to the console.
    console.log(totalZeroes);
}

function countTrailingZeros(numericInput) {
    // A boolean flag to control the execution of the inner loop.
    let shouldContinue = true;
    // Convert the numeric input into its string representation to easily access characters.
    let stringRepresentation = numericInput.toString();
    // Determine the starting position for checking, which is the last character of the string.
    let currentPosition = stringRepresentation.length - 1;
    // Initialize a counter for the number of trailing zeros found.
    let trailingZeroCount = 0;

    // Loop indefinitely until the 'shouldContinue' flag is set to false.
    while (shouldContinue) {
        // Check if the character at the current position is a '0'.
        if (stringRepresentation[currentPosition] === "0") {
            // If it's a '0', move to the previous character.
            currentPosition--;
            // Increment the count of trailing zeros.
            trailingZeroCount++;
        } else {
            // If the character is not '0', it means the sequence of trailing zeros has ended.
            // Set the flag to false to exit the loop.
            shouldContinue = false;
        }
    }
    // Return the final count of trailing zeros for the given number.
    return trailingZeroCount;
}

// Read the input from standard input, decode it as UTF-8, and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
