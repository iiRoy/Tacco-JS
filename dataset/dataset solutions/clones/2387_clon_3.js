// This module contains a function designed to compute a specific numerical offset
// based on an abbreviated weekday string provided as input.
function processDayCalculation(incomingDayString) {
    // Establish a static lookup table that maps common three-letter day abbreviations
    // to their corresponding numerical index, starting from Sunday as 0.
    // This structure replaces an array search with direct property access for efficiency.
    const dayIndexRegistry = {
        "SUN": 0, // Represents the first day of the standard week (Sunday)
        "MON": 1,
        "TUE": 2,
        "WED": 3,
        "THU": 4,
        "FRI": 5,
        "SAT": 6  // Represents the last day of the standard week (Saturday)
    };

    // Declare a variable to store the resolved numerical index of the input day.
    // It's initialized to 'undefined' to handle cases where the input string
    // does not match any known day, leading to a NaN result in the final calculation,
    // consistent with the original code's behavior for invalid inputs.
    let resolvedDayPosition;

    // Validate the incoming day string against the predefined registry.
    // Using Object.prototype.hasOwnProperty.call for robust property checking.
    if (Object.prototype.hasOwnProperty.call(dayIndexRegistry, incomingDayString)) {
        // If the input is a valid day abbreviation, retrieve its numerical position.
        resolvedDayPosition = dayIndexRegistry[incomingDayString];
    } else {
        // If the input string is not found in our registry, log an advisory message
        // and ensure 'resolvedDayPosition' remains 'undefined'. This will cause
        // the subsequent arithmetic operation to yield 'NaN', mirroring the original
        // program's output for unrecognized inputs.
        console.error(`Input Error: The provided day abbreviation "${incomingDayString}" is not recognized.`);
        // resolvedDayPosition is already undefined, so no explicit assignment needed here,
        // but it's good for clarity if it had a different initial value.
    }

    // Perform the core calculation: determine the offset from the 'end' of the week (7).
    // The original calculation `Math.abs(dayIndex - 7)` is equivalent to `7 - dayIndex`
    // when `dayIndex` is within the range [0, 6], as it always results in a positive value.
    // This simplification improves readability and removes a redundant `Math.abs` call.
    const calculatedFinalOffset = 7 - resolvedDayPosition;

    // Output the computed offset value to the console.
    console.log(calculatedFinalOffset);
}

// The following code block is responsible for reading input from standard I/O
// and invoking the primary processing function. It should not be altered.
processDayCalculation(require("fs").readFileSync("/dev/stdin", "utf8").trim());