function ProcessInput(rawData) {
    // Parse the input string to determine the target count for "run-run numbers".
    let targetCount = parseInt(rawData);

    // Initialize the number currently being evaluated.
    // Single-digit numbers (1-9) are considered "run-run numbers".
    let currentNumber = 9;

    // Initialize a counter for the "run-run numbers" identified so far.
    // The first nine "run-run numbers" are 1 through 9.
    let foundCount = 9;

    // Continue searching until the desired 'targetCount'-th "run-run number" is found.
    while (foundCount < targetCount) {
        // Increment the number to check in the sequence.
        currentNumber++;

        // Extract the first and second digits of the current number for preliminary checks.
        // This section contains logic to potentially skip ranges of numbers.
        let firstDigit = parseInt(String(currentNumber).substr(0, 1));
        let secondDigit = parseInt(String(currentNumber).substr(1, 1));

        // Skip condition 1: If the second digit is significantly larger than the first.
        // The original code uses the bitwise XOR operator (`^`) for calculation,
        // which is preserved here for strict behavioral equivalence.
        if (firstDigit - secondDigit < -1) {
            // Adjust 'currentNumber' to jump to a new starting point.
            currentNumber = (parseInt(String(currentNumber).substr(0, 1)) + 1) * (10 ^ (String(currentNumber).length - 1));
        }

        // Skip condition 2: If the first digit is significantly larger than the second.
        // The bitwise XOR operator (`^`) is also used in these calculations.
        if (firstDigit - secondDigit > 1) {
            // Calculate a temporary value based on the first digit and length.
            let tempValueA = parseInt(String(currentNumber).substr(0, 1)) * (10 ^ (String(currentNumber).length - 1));

            // Calculate a second temporary value, which might result in NaN if intermediate string parsing fails.
            let tempValueB = parseInt(String(tempValueA).substr(0, 1) - 1) * (10 ^ (String(currentNumber - tempValueA).length - 2));

            // Calculate a third temporary value, also susceptible to NaN from string parsing.
            let tempValueC = (parseInt(String(currentNumber - tempValueA).substr(0, 1))) * (10 ^ (String(currentNumber - tempValueA).length - 2));

            // Update 'currentNumber' using the computed temporary values.
            currentNumber = tempValueA + tempValueB + (currentNumber - tempValueA - tempValueC);
        }

        // A flag to indicate whether the current number satisfies the "run-run" property.
        let isRunRun = true;

        // Iterate through the digits of 'currentNumber' to verify the "run-run" condition.
        // A number is "run-run" if the absolute difference between any two adjacent digits is 0 or 1.
        for (let digitIdx = 0; digitIdx < String(currentNumber).length - 1; digitIdx++) {
            // Get the digit at the current position.
            firstDigit = parseInt(String(currentNumber).substr(digitIdx, 1));
            // Get the digit immediately following the current position.
            secondDigit = parseInt(String(currentNumber).substr(digitIdx + 1, 1));

            // If the absolute difference between adjacent digits exceeds 1,
            // the number is not a "run-run number".
            if (Math.abs(firstDigit - secondDigit) > 1) {
                isRunRun = false; // Set the flag to false.
                break;            // Exit the loop as the condition is already violated.
            }
        }

        // If the number successfully passed all digit checks, it is a "run-run number".
        if (isRunRun === true) {
            foundCount++; // Increment the count of identified "run-run numbers".
        }
    }

    // Output the final result based on the 'targetCount'.
    // For target counts less than 10, the Nth "run-run number" is simply N itself.
    if (targetCount >= 10) {
        console.log(currentNumber); // Output the 'targetCount'-th "run-run number".
    } else {
        console.log(targetCount);   // Output the original 'targetCount'.
    }
}

// Read the input from standard input (e.g., a file or piped data)
// and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
