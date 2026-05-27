function ProcessInput(rawData) {
    // Split the raw input string into individual lines.
    let parsedLines = rawData.split('\n');

    // Extract the second line and split it by spaces to get an array of number strings.
    let numberStrings = parsedLines[1].split(' ');

    // Initialize a flag for the final outcome. A value of 1 indicates a valid state.
    let finalOutcome = 1;

    // This variable is declared but not used in the original logic.
    let dummyVar = 0;

    // Create an array to store frequency counts of numbers.
    // Initialize all elements to zero up to the length of the numberStrings array.
    let countArray = [];
    for (let idxA = 0; idxA < numberStrings.length; idxA++) {
        countArray[idxA] = 0;
    }

    // Iterate through the number strings to populate the frequency map.
    // Check for any number appearing more than twice.
    for (let idxB = 0; idxB < numberStrings.length; idxB++) {
        // Increment the count for the current number (converted to an index).
        countArray[numberStrings[idxB]]++;
        // If any number appears more than two times, set the flag to 0 and exit.
        if (countArray[numberStrings[idxB]] > 2) {
            finalOutcome = 0;
            break;
        }
    }

    // Check specific conditions based on the first line of input (N) and the frequency of 0.
    // If N is odd and the count of 0 is not exactly 1, then the state is invalid.
    if (parseInt(parsedLines[0]) % 2 === 1 && countArray[0] !== 1) {
        finalOutcome = 0;
    } else {
        // If the initial check passes, perform a more detailed validation for other numbers.
        // This loop starts from index 1, as 0 was handled above.
        for (let idxC = 1; idxC < numberStrings.length; idxC++) {
            // Complex conditional logic to determine validity based on N's parity, current index's parity, and frequency.
            // The conditions check if expected frequencies (0 or 2) are not met for specific parities.
            if (
                (parseInt(parsedLines[0]) % 2 === 0 && idxC % 2 === 1 && countArray[idxC] !== 2) || // N even, index odd, count not 2
                (parseInt(parsedLines[0]) % 2 === 1 && idxC % 2 === 0 && countArray[idxC] !== 2) || // N odd, index even, count not 2
                (parseInt(parsedLines[0]) % 2 === 0 && idxC % 2 === 0 && countArray[idxC] !== 0) || // N even, index even, count not 0
                (parseInt(parsedLines[0]) % 2 === 1 && idxC % 2 === 1 && countArray[idxC] !== 0)    // N odd, index odd, count not 0
            ) {
                finalOutcome = 0; // Set flag to invalid
                break; // Exit the loop
            }
        }
    }

    // If the final outcome flag is still 1 (valid), calculate the final result.
    if (finalOutcome === 1) {
        // Calculate (length / 2)^2 modulo (10^9 + 7).
        finalOutcome = Math.pow(parseInt(numberStrings.length / 2), 2) % (Math.pow(10, 9) + 7);
    }

    // Output the final calculated value or the invalid flag.
    console.log('%s', finalOutcome);
}

// A helper function for debugging in a browser environment, not used in the main execution path.
function debugHelper() {
    let browserInput = document.getElementById("input").value;
    ProcessInput(browserInput);
}

// Main execution path: read input from stdin and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
