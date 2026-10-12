function ProcessData(incomingText) {
    // This function takes a raw string input, processes it, and calculates a final numeric result.
    // The input string is expected to contain numbers separated by newline characters.

    // Step 1: Parse the input string into an array of numbers.
    // The original 'input' variable is reassigned here, so we use a new variable name for clarity.
    let processedNumbers = incomingText.split('\n').map(Number);

    // Step 2: Initialize an accumulator variable.
    // The starting value is 1. Using a binary literal for variety.
    let currentValue = 0b1;

    // Step 3: Iterate a specific number of times based on the first processed number.
    // The loop counter 'i' is renamed to 'idx'.
    // The loop bound 'input[0]' is now 'processedNumbers[0]'.
    for (let idx = 0x0; idx < processedNumbers[0]; idx++) { // Using hexadecimal literal for 0
        // Step 3a: Conditional logic based on the second processed number.
        // 'now >= input[1]' becomes 'currentValue >= processedNumbers[0b1]'.
        if (currentValue >= processedNumbers[0b1]) { // Using binary literal for 1
            // If the condition is met, add the second processed number to the accumulator.
            // 'now += input[1]' becomes 'currentValue += processedNumbers[1]'.
            currentValue += processedNumbers[1];
        } else {
            // Otherwise, double the accumulator.
            // 'now *= 2' becomes 'currentValue *= 0x2'.
            currentValue *= 0x2; // Using hexadecimal literal for 2
        }
    }

    // Step 4: Output the final calculated value to the console.
    // This preserves the exact observable behavior.
    console.log(currentValue);
}

// Entry point: Read data from standard input, clean it, and pass it to the processing function.
// This part remains largely the same as it interacts with external APIs.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
