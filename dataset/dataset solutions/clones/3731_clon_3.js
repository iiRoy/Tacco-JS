// This module processes raw data to produce a specific numerical sequence based on an input limit.
function ProcessInputData(sourceData) {
    // Break down the incoming string by newline characters to get individual lines.
    let parsedLines = sourceData.split("\n");

    // Extract the primary iteration limit from the very first line of the input.
    // Ensure it's parsed as an integer to prevent unexpected string concatenation or comparison issues.
    const operationLimit = parseInt(parsedLines[0], 10);

    // --- Input Validation Fragment ---
    // This guard clause checks if the extracted limit is a valid positive number.
    // If not, it logs an error and terminates execution of this function gracefully.
    if (isNaN(operationLimit) || operationLimit <= 0) {
        console.error("Error: An invalid or non-positive operation limit was provided. Please ensure the first line contains a positive integer.");
        // Returning here prevents further processing with erroneous input.
        return;
    }
    // --- End Input Validation Fragment ---

    // Initialize state variables that control the generation of the number sequence.
    // 'currentDigitLength' tracks the total number of digits the generated number should have (e.g., 1 for '1', 2 for '19').
    let currentDigitLength = 1;
    // 'currentStartingDigit' tracks the leading digit of the number, which cycles from 1 through 9.
    let currentStartingDigit = 1;

    // Begin the main loop, iterating for the specified 'operationLimit' number of times.
    for (let currentStep = 0; currentStep < operationLimit; ++currentStep) {
        // Construct the string representation for the current element in the sequence.
        // It always starts with the 'currentStartingDigit'.
        let generatedElement = String(currentStartingDigit);

        // If the intended number of digits is greater than one, append '9's as filler.
        // This logic replaces the original nested loop with a more concise string method.
        if (currentDigitLength > 1) {
            // Calculate precisely how many '9's are needed to achieve the 'currentDigitLength'.
            const requiredFillerCount = currentDigitLength - 1;
            // Append the calculated number of '9's using the 'repeat' string method.
            generatedElement += "9".repeat(requiredFillerCount);
        }

        // Output the fully constructed sequence element to the standard console.
        // Each element is printed on its own line.
        console.log(generatedElement);

        // --- State Update Mechanism (Rewritten) ---
        // Advance the state for the next iteration.
        // The leading digit is incremented, using modulo arithmetic to cycle it from 1 to 9.
        // For example, if currentStartingDigit is 9, (9 % 9) + 1 results in 0 + 1 = 1.
        currentStartingDigit = (currentStartingDigit % 9) + 1;

        // If the leading digit has just reset to 1, it signifies the completion of a full 1-9 cycle.
        // At this point, the total number of digits for subsequent numbers should increase.
        if (currentStartingDigit === 1) {
            currentDigitLength++; // Increment the total number of digits.
        }
        // --- End State Update Mechanism ---
    }
}

// This following section is standard boilerplate for competitive programming in JavaScript.
// It reads all available data from the standard input stream (typically /dev/stdin)
// and then passes this raw input string to the main processing function.
// This part is generally left unmodified to ensure proper execution in online judges.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));