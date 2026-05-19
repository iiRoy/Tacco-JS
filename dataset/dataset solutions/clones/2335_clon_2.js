function ProcessInput(initialValue) {
    // Convert the input string to an integer for numerical operations.
    initialValue = parseInt(initialValue);

    // Initialize a variable to accumulate the sum of trailing zero counts.
    let finalSum = 0;

    // Loop as long as the current numerical value is positive.
    while (initialValue > 0) {
        // Add the count of trailing zeros from the current number to the total sum.
        finalSum += countTrailingZeros(initialValue);

        // Decrement the number by two for the next iteration.
        initialValue = initialValue - 2;
    }

    // Output the final calculated sum to the console.
    console.log(finalSum);
}

function countTrailingZeros(numberToCheck) {
    // Flag to control the loop for counting zeros.
    let continueCounting = true;

    // Convert the number to its string representation to easily access characters.
    numberToCheck = numberToCheck.toString();

    // Determine the starting position for checking (the last character of the string).
    let charPosition = numberToCheck.length - 1;

    // Initialize a counter for the number of trailing zeros.
    let zeroCount = 0;

    // Loop while the counting flag is true.
    while (continueCounting) {
        // Check if the character at the current position is '0'.
        if (numberToCheck[charPosition] === "0") {
            // If it's a '0', move to the previous character and increment the zero count.
            charPosition--;
            zeroCount++;
        } else {
            // If it's not a '0', stop counting as trailing zeros have ended.
            continueCounting = false;
        }
    }

    // Return the total count of trailing zeros found.
    return zeroCount;
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
