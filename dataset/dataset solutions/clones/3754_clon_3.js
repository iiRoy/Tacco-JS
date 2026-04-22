function processInputData(rawInputString) {
    // --- Type III: Added guard clause for initial input validation ---
    // Ensure the input is a non-empty string before processing.
    if (typeof rawInputString !== 'string' || rawInputString.trim() === '') {
        console.error("Error: The provided input data is empty or not a valid string.");
        return; // Exit the function gracefully
    }

    // --- Type II: Renamed variable and used const/let ---
    // Split the entire raw input string into an array of individual lines.
    const inputLines = rawInputString.split("\n");

    // --- Type III: Added validation for minimum input lines ---
    // The problem expects at least two lines: one for count (ignored) and one for numbers.
    if (inputLines.length < 2) {
        console.error("Error: Insufficient input lines provided. Expected at least two lines of data.");
        return;
    }

    // --- Type III: Introduced intermediate variable for clarity ---
    // The second line (index 1) of the input contains the space-separated numbers.
    const numericValuesLine = inputLines[1];

    // --- Type III: Introduced helper function for robust parsing and validation ---
    // This function parses a string into an integer and includes validation logic.
    const safelyParseAndValidateNumber = (numberAsString) => {
        // --- Type II: Explicitly specify radix for parseInt ---
        const parsedInteger = parseInt(numberAsString, 10);

        // --- Type III: Added validation for each number ---
        // Checks if the parsed value is a valid positive integer.
        if (isNaN(parsedInteger) || parsedInteger <= 0) {
            console.warn(`Warning: Skipping invalid or non-positive number found: "${numberAsString}".`);
            return null; // Return null for invalid entries
        }
        return parsedInteger;
    };

    // --- Type II: Renamed variables and used const/let ---
    // Split the line of numbers into an array of string representations.
    const stringRepresentationsOfNumbers = numericValuesLine.split(' ');

    // --- Type III: Used map and filter for robust number list creation ---
    // Map each string to a number using the helper, then filter out any invalid entries.
    const collectionOfValidNumbers = stringRepresentationsOfNumbers
                                     .map(safelyParseAndValidateNumber)
                                     .filter(num => num !== null);

    // --- Type II: Renamed variable and used let for mutable state ---
    // Initialize a counter to accumulate the total divisions by two across all numbers.
    let cumulativeDivisionsByTwo = 0;

    // --- Type III: Extracted core logic into a dedicated helper function ---
    // This function calculates how many times a single positive integer can be divided by two.
    const calculateFactorsOfTwo = (targetNumber) => {
        let individualDivisionsCount = 0;
        // --- Type III: Use a temporary variable to avoid modifying the original number ---
        let currentWorkingNumber = targetNumber;

        // --- Type III: Added guard for non-positive numbers (belt-and-suspenders) ---
        if (currentWorkingNumber <= 0) {
            return 0; // Non-positive numbers have no factors of two in this context.
        }

        // --- Type III: Rewritten loop condition and division using bitwise operations ---
        // Loop while the number is even (its least significant bit is 0).
        while ((currentWorkingNumber & 1) === 0) {
            currentWorkingNumber >>= 1; // Equivalent to currentWorkingNumber = currentWorkingNumber / 2
            individualDivisionsCount++; // Increment the counter for each successful division.
        }
        return individualDivisionsCount;
    };

    // --- Type II: Renamed loop variable and used const/let ---
    // Iterate over each valid number in the processed collection.
    for (const numberFromCollection of collectionOfValidNumbers) {
        // Accumulate the count of divisions by two for the current number.
        cumulativeDivisionsByTwo += calculateFactorsOfTwo(numberFromCollection);
    }

    // --- Type III: Prepared a formatted output string using an intermediate variable ---
    const formattedResultString = `The grand total of successful divisions by two across all numbers is: ${cumulativeDivisionsByTwo}.`;

    // --- Type II: Reformatted console output ---
    // Display the final computed result to the standard output.
    console.log(formattedResultString);
}

// --- Type III: Wrapped the execution block in a try-catch for robustness ---
try {
    // --- Type II: Renamed variable for clarity ---
    // Read the entire content of the standard input asynchronously and decode it as UTF-8.
    const fileSystemInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

    // --- Type II: Called the renamed main processing function ---
    // Pass the raw input content to our primary processing function.
    processInputData(fileSystemInputContent);
} catch (executionError) {
    // --- Type III: Added error handling for file system operations ---
    console.error("An unhandled error occurred during the input reading or processing phase:", executionError.message);
}