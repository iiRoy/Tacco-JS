function ProcessInput(rawData) {
    // Parse the input string into an integer, representing the target count of "step" numbers.
    let targetCount = parseInt(rawData);

    // Initialize the current number being examined, starting from 9.
    let currentNumber = 9;
    // Initialize the count of "step" numbers found so far.
    // Single-digit numbers (1-9) are all considered "step" numbers.
    let foundCount = 9;

    // Continue searching until the required number of "step" numbers is identified.
    while (foundCount < targetCount) {
        currentNumber++; // Move to the next integer to check.

        // Extract the first two digits of the current number for an initial quick check.
        // Convert the number to a string to easily access its digits.
        let firstDigit = parseInt(String(currentNumber).substring(0, 1));
        let secondDigit = parseInt(String(currentNumber).substring(1, 2));

        // Optimization: If the difference between the first two digits is significant,
        // we can skip a range of numbers to speed up the search.
        // This condition handles cases where the second digit is much larger than the first.
        if (firstDigit - secondDigit < -1) {
            // For example, if currentNumber is 13, the difference is -2.
            // We can jump to the next number that starts with (firstDigit + 1), e.g., 20.
            currentNumber = (parseInt(String(currentNumber).substring(0, 1)) + 1) * (10 ** (String(currentNumber).length - 1));
        }
        // This condition handles cases where the first digit is much larger than the second.
        else if (firstDigit - secondDigit > 1) {
            // For example, if currentNumber is 31, the difference is 2.
            // We need to adjust the number to find a closer sequence of digits.
            let tempValA = parseInt(String(currentNumber).substring(0, 1)) * (10 ** (String(currentNumber).length - 1));
            let tempValB = (parseInt(String(tempValA).substring(0, 1)) - 1) * (10 ** (String(currentNumber).length - 2));
            let tempValC = parseInt(String(currentNumber - tempValA).substring(0, 1)) * (10 ** (String(currentNumber).length - 2));
            currentNumber = tempValA + tempValB + (currentNumber - tempValA - tempValC);
        }

        // A flag to indicate whether the current number qualifies as a "step" number.
        let isValid = true;
        // Iterate through all adjacent pairs of digits within the current number.
        for (let digitIndex = 0; digitIndex < String(currentNumber).length - 1; digitIndex++) {
            // Get the digit at the current position.
            firstDigit = parseInt(String(currentNumber).substring(digitIndex, digitIndex + 1));
            // Get the digit at the next position.
            secondDigit = parseInt(String(currentNumber).substring(digitIndex + 1, digitIndex + 2));

            // If the absolute difference between these two adjacent digits is greater than 1,
            // then it's not a "step" number.
            if (Math.abs(firstDigit - secondDigit) > 1) {
                isValid = false; // Mark as invalid.
                break; // No need to check further digits for this number.
            }
        }

        // If the number passed all checks (i.e., all adjacent digits differ by at most 1),
        // increment the count of found "step" numbers.
        if (isValid === true) {
            foundCount++;
        }
    }

    // After the loop, output the result.
    // If the target count was 10 or more, output the last found "step" number.
    if (targetCount >= 10) {
        console.log(currentNumber);
    } else {
        // For target counts less than 10, the k-th "step" number is simply k itself.
        console.log(targetCount);
    }
}

// Read the input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
