// This constant object maps Roman numeral characters to their corresponding integer values.
// This serves as the primary lookup table for converting symbols.
const numeralValueMap = {
    'I': 1,
    'V': 5,
    'X': 10,
    'L': 50,
    'C': 100,
    'D': 500,
    'M': 1000
};

// The 'fs' module is used to interact with the file system.
// We read the entire content of standard input (/dev/stdin) as a UTF-8 encoded string.
// This is typical for competitive programming or command-line utility scripts.
const rawInputString = require("fs").readFileSync("/dev/stdin", "utf8");

// Initialize variables to manage the state of the Roman numeral parsing process.
let characterPointer = 0;                  // An index to track the current position in the input string.
let currentLineAccumulatedSum = 0;         // Stores the running total for the Roman numeral sequence being processed.
let lastProcessedSymbolValue = 0;          // Holds the numerical value of the Roman numeral symbol processed immediately before the current one.
                                           // This is crucial for handling subtractive notation (e.g., IV where I is subtracted from V).

// Iterate through each character of the input string until the end is reached.
while (characterPointer < rawInputString.length) {
    // Extract the current character from the input string.
    const activeCharacter = rawInputString[characterPointer];
    // Advance the pointer to the next character for the subsequent iteration.
    characterPointer++;

    // Attempt to retrieve the numerical value for the active character from our mapping.
    // If the character is not a valid Roman numeral symbol (e.g., newline, space, other text),
    // the result will be 'undefined'.
    const numericalValueForCurrentSymbol = numeralValueMap[activeCharacter];

    // Check if the current character is a recognized Roman numeral.
    if (numericalValueForCurrentSymbol !== undefined) {
        // A temporary variable to hold the 'previous' symbol's value before it gets updated.
        // This is equivalent to the 'p = n' logic in the original golfed code,
        // where 'p' takes on the value 'n' had in the previous step.
        const valueOfPreviousSymbol = lastProcessedSymbolValue;

        // Update 'lastProcessedSymbolValue' to the current symbol's value.
        // This value will become the 'previous' value in the next iteration.
        lastProcessedSymbolValue = numericalValueForCurrentSymbol;

        // Apply the rules for Roman numeral conversion:
        // If the current symbol's value is greater than the previous symbol's value,
        // it indicates a subtractive case (e.g., 'IV' where 5 > 1).
        // In this scenario, the previous value was effectively "over-added" and needs to be subtracted twice:
        // once to remove the previous addition, and once more for the actual subtraction.
        // The formula 'currentSymbolNumericalValue - (2 * valueOfPreviousSymbol)' correctly
        // adjusts the sum: current_sum + current_value - 2*previous_value.
        // This is equivalent to: (current_sum - previous_value) + (current_value - previous_value)
        // or more simply: current_sum - previous_value + current_value.
        if (numericalValueForCurrentSymbol > valueOfPreviousSymbol) {
            currentLineAccumulatedSum += numericalValueForCurrentSymbol - (2 * valueOfPreviousSymbol);
        } else {
            // Otherwise, it's an additive case (e.g., 'VI' where 5 < 1, or 'XX' where 10 == 10).
            // Simply add the current symbol's numerical value to the running total.
            currentLineAccumulatedSum += numericalValueForCurrentSymbol;
        }
    } else {
        // If the character is not a Roman numeral (e.g., a newline character or any other non-numeric input),
        // it signals the end of a Roman numeral sequence/line.
        // Print the total sum accumulated for this sequence.
        console.log(currentLineAccumulatedSum);

        // Reset the accumulator and the previous symbol value for the next potential sequence.
        currentLineAccumulatedSum = 0;
        lastProcessedSymbolValue = 0;
    }
}

// After the loop finishes processing all characters, there might be a pending sum
// if the input string does not end with a non-Roman numeral character (like a newline).
// This check ensures that the last calculated sum is always printed if it exists.
if (currentLineAccumulatedSum > 0 || lastProcessedSymbolValue > 0) {
    console.log(currentLineAccumulatedSum);
}