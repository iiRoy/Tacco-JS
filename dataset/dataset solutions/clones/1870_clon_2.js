function processInput(rawData) {
    // This function takes a raw input string and processes it according to specific rules.
    const tokens = rawData.split(' '); // Split the input string into an array of substrings using space as a delimiter.

    // Parse the numerical values from the token array.
    const firstValue = Number(tokens[0]);
    const secondValue = Number(tokens[1]);
    const thirdValue = Number(tokens[2]);
    const initialCounter = Number(tokens[3]);

    // Initialize a mutable variable for calculations, starting with the initial counter value.
    let currentCount = initialCounter;

    // Adjust the current counter by subtracting the first numerical value.
    currentCount -= firstValue;

    // Evaluate the state of the initial counter.
    if (initialCounter <= 0) {
        // If the initial counter was non-positive, output its original value.
        console.log(initialCounter);
    } else {
        // If the initial counter was positive, proceed with further adjustments.

        // Subtract the second numerical value from the current counter.
        currentCount -= secondValue;

        // Re-evaluate the initial counter's state (this condition mirrors an earlier one).
        if (initialCounter <= 0) {
            // If the initial counter was non-positive (which would contradict the outer 'else' branch),
            // output the first numerical value.
            console.log(firstValue);
        } else {
            // Otherwise, continue with the final comparison.

            // Compare the adjusted current counter with the third numerical value.
            if (currentCount < thirdValue) {
                // If the current counter is less than the third value, compute and display a difference.
                console.log(firstValue - currentCount);
            } else {
                // If the current counter is greater than or equal to the third value,
                // compute and display the same difference.
                console.log(firstValue - currentCount);
            }
        }
    }
}

// Execute the main processing function by reading input from standard input.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));