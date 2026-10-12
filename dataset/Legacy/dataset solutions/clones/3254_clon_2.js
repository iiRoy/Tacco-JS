// This function processes the entire input string provided to it.
function ProcessInput(rawData) {
    // The raw input string is split into an array of individual lines.
    let lines = rawData.split("\n");

    // The first line of input is parsed as an integer (base 10) to get the starting number.
    let currentValue = parseInt(lines[0], 10);

    // An array is initialized to keep track of all numbers encountered in the sequence.
    const seenValues = [];
    // The initial number is added to the list of seen values.
    seenValues.push(currentValue);

    // A loop iterates to generate the Collatz sequence and detect cycles.
    // The loop counter starts from 1 and goes up to a large number to cover long sequences.
    for (let iterationCount = 1; iterationCount < 1000000; iterationCount++) {
        // Apply the Collatz conjecture rules:
        // If the current number is even, divide it by 2.
        if (currentValue % 2 === 0) {
            currentValue = currentValue / 2;
        }
        // If the current number is odd, multiply it by 3 and add 1.
        else {
            currentValue = currentValue * 3 + 1;
        }

        // Check if the newly calculated number has already appeared in the sequence.
        let foundIndex = seenValues.indexOf(currentValue);

        // If the number is found in the 'seenValues' array, a cycle has been detected.
        if (foundIndex !== -1) {
            // Output the current iteration count plus one (for 1-based indexing of steps).
            console.log(iterationCount + 1);
            // Terminate the loop as the cycle detection condition is met.
            break;
        }

        // If the number is new, add it to the 'seenValues' array at the current iteration index.
        seenValues[iterationCount] = currentValue;
    }
    // This line is a commented-out debugging statement and does not affect program execution.
    // console.log(seenValues);
}

// This section handles reading input from standard input and invoking the main processing function.
// It should remain unchanged as it's part of the standard execution environment setup.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
