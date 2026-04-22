// This JavaScript program is designed to find and report pairs of positive integers (firstValue, secondValue)
// that satisfy a unique mathematical condition. The condition states that the sum of an arithmetic progression
// starting from 'firstValue' and ending at 'secondValue' (inclusive) must be numerically equal to the
// integer formed by concatenating the string representations of 'firstValue' and 'secondValue'.
//
// The program processes multiple test scenarios. For each scenario, it reads two numbers that
// specify the required number of digits for 'firstValue' and 'secondValue', respectively.
// It then systematically searches for all such pairs within these digit constraints.

/**
 * A utility function to compute powers of 10.
 * It ensures the exponent is an integer before calculation.
 * For example, calculateMagnitude(2) returns 100 (10^2).
 *
 * @param {number|string} exponentInput - The desired exponent for 10.
 * @returns {number} The result of 10 raised to the power of the (integer) exponent.
 */
const calculateMagnitude = (exponentInput) => {
    // Convert the input to a number and take its floor to ensure an integer exponent.
    const integerPower = Math.floor(Number(exponentInput));
    return Math.pow(10, integerPower);
};

// --- Core Program Logic ---

// Read the initial input to determine how many distinct test cases need to be processed.
// `readline()` is assumed to be a global function provided by the execution environment
// for reading a line of input, typically found in competitive programming platforms.
const totalExecutionRounds = parseInt(readline(), 10);

// It's good practice to add basic validation, though competitive programming environments
// usually guarantee valid input for the number of test cases.
if (isNaN(totalExecutionRounds) || totalExecutionRounds < 0) {
    // In a production system, this would be an error or a robust fallback.
    // For this context, we proceed assuming valid input or exit implicitly.
    // print("Invalid count of test rounds. Exiting.");
    // return;
}

// Iterate through each of the specified test scenarios.
for (let currentRoundIndex = 0; currentRoundIndex < totalExecutionRounds; ++currentRoundIndex) {
    // This array will hold all the (firstValue, secondValue) pairs that meet the criteria
    // for the current test scenario.
    const discoveredSolutions = [];

    // Read the input line for the current scenario. This line contains two
    // space-separated integers, representing the required number of digits for
    // the two numbers we are searching for.
    const digitSpecificationStrings = readline().split(' ');

    // Perform a quick check to ensure the input format is as expected.
    if (digitSpecificationStrings.length !== 2) {
        // If the input is malformed, skip this scenario and proceed to the next.
        // print(`Skipping round ${currentRoundIndex + 1} due to incorrect input format.`);
        continue;
    }

    // Parse the string digit counts into numerical values.
    const numDigitsForFirst = parseInt(digitSpecificationStrings[0], 10);
    const numDigitsForSecond = parseInt(digitSpecificationStrings[1], 10);

    // Validate the parsed digit counts to ensure they are positive integers.
    if (isNaN(numDigitsForFirst) || isNaN(numDigitsForSecond) || numDigitsForFirst <= 0 || numDigitsForSecond <= 0) {
        // Skip scenarios with invalid digit counts.
        // print(`Skipping round ${currentRoundIndex + 1} due to invalid digit count values.`);
        continue;
    }

    // Determine the inclusive lower and exclusive upper bounds for 'firstValue'.
    // A number with 'N' digits ranges from 10^(N-1) to 10^N - 1.
    // Example: For 2 digits, range is 10 to 99.
    const firstValueLowerLimit = calculateMagnitude(numDigitsForFirst - 1);
    const firstValueUpperLimit = calculateMagnitude(numDigitsForFirst); // e.g., 100 for 2 digits

    // Determine the inclusive lower and exclusive upper bounds for 'secondValue'.
    const secondValueLowerLimit = calculateMagnitude(numDigitsForSecond - 1);
    const secondValueUpperLimit = calculateMagnitude(numDigitsForSecond); // e.g., 100 for 2 digits

    // Begin iterating through all possible 'firstValue' candidates within its defined digit range.
    for (let currentFirstValue = firstValueLowerLimit; currentFirstValue < firstValueUpperLimit; ++currentFirstValue) {
        // For each 'firstValue', iterate through all possible 'secondValue' candidates within its digit range.
        for (let currentSecondValue = secondValueLowerLimit; currentSecondValue < secondValueUpperLimit; ++currentSecondValue) {

            // --- Calculation of the arithmetic series sum ---
            // The sum of an arithmetic series from 'a' to 'b' is given by:
            // (number_of_terms / 2) * (first_term + last_term)
            // Here, first_term = currentFirstValue, last_term = currentSecondValue.
            // Number of terms = currentSecondValue - currentFirstValue + 1.
            const arithmeticProgressionSum = (currentFirstValue + currentSecondValue) *
                                             (currentSecondValue - currentFirstValue + 1) / 2;

            // --- Calculation of the concatenated integer value ---
            // Convert both numbers to strings, concatenate them, and then parse the result back to an integer.
            const concatenatedStringRepresentation = String(currentFirstValue) + String(currentSecondValue);
            const numericalConcatenation = parseInt(concatenatedStringRepresentation, 10);

            // --- Condition Check ---
            // If the arithmetic sum is exactly equal to the numerically concatenated value,
            // then this pair satisfies the problem's condition.
            if (arithmeticProgressionSum === numericalConcatenation) {
                // Store the valid pair as a formatted string.
                discoveredSolutions.push(`${currentFirstValue} ${currentSecondValue}`);
            }
        }
    }

    // --- Outputting Results for the Current Scenario ---
    // After exhausting all possible pairs for the current scenario,
    // check if any solutions were found.
    if (discoveredSolutions.length > 0) {
        // If solutions exist, print each one on a new line.
        // `print()` is assumed to be a global function for outputting.
        for (const solutionPair of discoveredSolutions) {
            print(solutionPair);
        }
    } else {
        // If no solutions were found for this scenario, print a specific message.
        print('No appropriate numerical structures were detected.');
    }
}