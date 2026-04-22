function processInputData(rawDataString) {
    // This function processes a raw input string to identify and count specific date patterns.

    // Type III: Added input validation for robustness.
    if (typeof rawDataString !== 'string' || rawDataString.trim() === '') {
        console.error("Error: Input provided is not a valid non-empty string.");
        console.log(0); // Default output for invalid input as per original's early exit behavior
        return;
    }

    // Type III: Introduced a helper for parsing numeric values safely.
    const parseSanitizedNumber = (strValue) => {
        const parsed = parseInt(strValue, 10);
        return isNaN(parsed) ? null : parsed; // Return null for invalid numbers
    };

    // Type III: Used intermediate variables and more explicit parsing.
    const trimmedInput = rawDataString.trim();
    const dateComponents = trimmedInput.split(" ");

    if (dateComponents.length < 2) {
        console.error("Error: Input string does not contain enough components (expected month and day).");
        console.log(0);
        return;
    }

    // Type II: Renamed variables for clarity.
    const monthUpperLimit = parseSanitizedNumber(dateComponents[0]);
    const dayUpperLimit = parseSanitizedNumber(dateComponents[1]);

    // Type III: Enhanced validation for parsed numeric values.
    if (monthUpperLimit === null || dayUpperLimit === null) {
        console.error("Error: Could not parse valid numeric limits from the input string.");
        console.log(0);
        return;
    }

    let matchingDateCount = 0; // Type II: Renamed the accumulator variable.

    // Type III: Introduced constants for magic numbers and rephrased early exits.
    const MINIMUM_RELEVANT_DAY = 22;
    const MINIMUM_RELEVANT_MONTH = 4;

    // Type III: Early exit guard clause for day limit.
    if (dayUpperLimit < MINIMUM_RELEVANT_DAY) {
        console.log(0); // If the day limit is too low, no matches are possible.
        return;
    }

    // Type III: Early exit guard clause for month limit.
    if (monthUpperLimit < MINIMUM_RELEVANT_MONTH) {
        console.log(0); // If the month limit is too low, no matches are possible.
        return;
    }

    // Type III: Helper function to calculate the product of digits,
    // replacing the original string-based digit extraction.
    const calculateTwoDigitProduct = (numberValue) => {
        // This function is specifically designed for two-digit numbers (like days 22-31).
        if (numberValue < 10 || numberValue > 99) {
            // For this problem, 'currentDay' is always between 22 and 31,
            // so this check serves as a robust guard for the helper.
            return -1; // Indicate an invalid or out-of-scope number
        }
        const unitsPlaceDigit = numberValue % 10;
        const tensPlaceDigit = Math.floor(numberValue / 10);
        return unitsPlaceDigit * tensPlaceDigit;
    };

    // Type II: Renamed loop variables and added descriptive comments.
    // Iterating through potential month values, starting from the required minimum.
    for (let currentMonth = MINIMUM_RELEVANT_MONTH; currentMonth <= monthUpperLimit; currentMonth++) {
        // Iterating through potential day values, starting from the required minimum.
        for (let currentDay = MINIMUM_RELEVANT_DAY; currentDay <= dayUpperLimit; currentDay++) {

            // Type III: Utilized the new helper function for digit product calculation.
            const productOfDayDigits = calculateTwoDigitProduct(currentDay);

            // Type II: Condition check with renamed variables.
            // Only proceed if the day's digit product is valid (not -1) and matches the current month.
            if (productOfDayDigits !== -1 && currentMonth === productOfDayDigits) {
                matchingDateCount = matchingDateCount + 1; // Type III: Rewritten increment statement.
            }
        }
    }

    // Type II: Output the final tally.
    console.log(matchingDateCount);
}

// Type III: Added a more robust input reading mechanism, including error handling
// and ensuring it only runs when the script is executed directly.
if (typeof require !== 'undefined' && require.main === module) {
    try {
        const fileSystemModule = require("fs");
        const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
        processInputData(rawInputContent);
    } catch (ioError) {
        console.error("Failed to read input from /dev/stdin:", ioError.message);
        // As a fallback or for testing, one might pass a default value:
        // processInputData("12 31");
        console.log(0); // Indicate failure to process input
    }
}