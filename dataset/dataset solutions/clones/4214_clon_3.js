function analyzeNumericPatterns(targetString) {
    // This function examines a provided string to determine if any numerical digit (from 1 to 9)
    // appears more than a specific count (e.g., two times) within the string.
    // It implements a Type III clone, incorporating structural changes and additions.

    // --- Type III Addition: Input Validation Guard Clause ---
    // A robust check to ensure the input is a valid, non-empty string.
    // The original code assumed valid string input; this enhances resilience.
    if (typeof targetString !== 'string' || targetString.trim().length === 0) {
        // If the input is invalid or empty, we log a specific message for error handling
        // and then output 'No' to align with the original program's negative outcome.
        console.error("Input for pattern analysis must be a non-empty string.");
        console.log('No');
        return;
    }

    // --- Type III Addition: Flag for Condition Met ---
    // Instead of an early return, a flag is used to indicate if the condition has been met.
    // This allows for a single exit point for the final output.
    let digitCountExceedsThreshold = false;

    // Iterate through each potential digit character from '1' to '9'.
    // Using 'let' for the loop variable as per modern JavaScript practices (Type II change).
    for (let currentNumericChar = 1; currentNumericChar < 10; currentNumericChar++) {
        // --- Type II Change: Renamed variables and improved clarity ---
        // Convert the numeric loop counter to its string representation.
        // Using a template literal for string conversion (Type III subtle update).
        const digitAsText = `${currentNumericChar}`;

        // Construct a regular expression to find all occurrences of the current digit.
        // The 'g' (global) flag is crucial for `match()` to return all matches.
        // 'searchExpression' is a more descriptive name than 're' (Type II change).
        const searchExpression = new RegExp(digitAsText, 'g');

        // --- Type II Change: Renamed variables ---
        // Execute the regex against the target string to find all matches.
        // If no matches are found, 'foundOccurrences' will be null.
        const foundOccurrences = targetString.match(searchExpression);

        // --- Type III Update: Simplified and safer condition check ---
        // The original code had `if(re.test(input))` which is redundant when using `match()`.
        // We now directly check the length of `foundOccurrences`.
        // Using optional chaining `?.` with a fallback `|| 0` ensures safe access even if `foundOccurrences` is null.
        // This makes the check more robust and concise.
        if ((foundOccurrences?.length || 0) > 2) {
            // If the number of occurrences for the current digit exceeds two,
            // we've found our condition.
            digitCountExceedsThreshold = true;
            // --- Type III Update: Break instead of immediate return ---
            // Instead of returning immediately, we set the flag and break the loop.
            // This offers a single point of exit for the `console.log` statement.
            break;
        }

        // --- Type III Addition (Commented out example): Intermediate logging ---
        // console.log(`Processed digit: '${digitAsText}'. Found ${foundOccurrences?.length || 0} instances.`);
    }

    // --- Type III Update: Consolidated output logic ---
    // After iterating through all relevant digits (or breaking early),
    // output the final result based on the flag's state.
    if (digitCountExceedsThreshold) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

// --- Type II & III Changes: Refactoring the input reading part ---
// Extracting 'fs' module, file path, and encoding into distinct, descriptive constants.
// This improves readability and maintainability (Type II and III).
const fileSystemHandler = require("fs");
const standardInputLocation = "/dev/stdin";
const textEncodingFormat = "utf8";

// Read the content from the standard input synchronously and pass it to the analysis function.
// This part maintains the core functionality of reading input as per the original.
analyzeNumericPatterns(fileSystemHandler.readFileSync(standardInputLocation, textEncodingFormat));