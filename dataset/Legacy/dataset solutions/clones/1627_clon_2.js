function ProcessInput(initialValue) {
    // The divisor for checking divisibility, derived from the initial input value.
    const divisor = initialValue;
    // This variable accumulates numbers composed solely of the digit '7' (e.g., 7, 77, 777...).
    let currentNumber = 0;
    // Stores the length (number of digits) of the first such '7'-only number that is divisible by 'divisor'.
    // Initialized to null, indicating no such number has been found yet.
    let foundLength = null;

    // Iterate to construct '7'-only numbers of increasing length.
    // The loop continues as long as the digit count index is within a reasonable range relative to the input.
    for (let digitCountIndex = 0; digitCountIndex <= initialValue; digitCountIndex++) {
        // Append a '7' to the current number.
        // For digitCountIndex = 0, currentNumber becomes 7.
        // For digitCountIndex = 1, currentNumber becomes 7 + 7 * 10 = 77.
        // For digitCountIndex = 2, currentNumber becomes 77 + 7 * 100 = 777.
        currentNumber = currentNumber + (7 * Math.pow(10, digitCountIndex));

        // If the current '7'-only number is less than or equal to the divisor,
        // it's skipped for divisibility check in this iteration.
        // This is a specific behavior of the original algorithm.
        if (currentNumber <= divisor) {
            continue; // Move to the next longer '7'-only number.
        }

        // If a divisible number has already been found in a previous iteration,
        // we can stop searching as we are looking for the smallest length.
        if (foundLength) {
            break; // Exit the outer loop.
        }

        // Check if the current '7'-only number is a multiple of the divisor.
        // We iterate through multiples of 'divisor' up to 'currentNumber'.
        for (let multipleFactor = 1; multipleFactor * divisor <= currentNumber; multipleFactor++) {
            // Calculate the current multiple of the divisor.
            const currentMultiple = divisor * multipleFactor;
            // If the current '7'-only number matches a multiple of the divisor,
            // it means 'currentNumber' is divisible by 'divisor'.
            if (currentMultiple === currentNumber) {
                // Store the length (number of digits) of this '7'-only number.
                // 'digitCountIndex' is 0-indexed, so add 1 for the actual count.
                foundLength = digitCountIndex + 1;
                break; // Exit the inner loop as we found a match for this 'currentNumber'.
            }
        }
    }

    // Output the result.
    // If a divisible '7'-only number was found, print its length.
    if (foundLength) {
        console.log(foundLength);
    } else {
        // Otherwise, no such number was found within the search limits, print -1.
        console.log('-1');
    }
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
