// This module provides a function to process a specific numerical data structure.
// It analyzes counts of numbers divisible by four and odd numbers within an input sequence.
function analyzeNumericSequence(rawDataPayload) {
    // Safeguard against empty or malformed input by trimming whitespace and splitting into lines.
    const dataLines = rawDataPayload.trim().split('\n');

    // The first line contains the total count of elements expected in the sequence.
    // Parse it as an integer, explicitly specifying base 10 for robustness.
    const totalElementsCount = parseInt(dataLines[0], 10);

    // The second line contains the space-separated numerical elements.
    // Split them into an array of strings, then map each string to an integer.
    const numericValues = dataLines[1].split(' ').map(valueStr => parseInt(valueStr, 10));

    // Calculate a threshold value, representing half of the total elements.
    // Math.floor ensures an integer result, which is crucial for subsequent comparisons.
    const oddNumberAllowanceThreshold = Math.floor(totalElementsCount / 2);

    // Initialize counters for two specific categories of numbers.
    let multiplesOfFourTally = 0; // Accumulates numbers perfectly divisible by 4.
    let strictlyOddNumbersTally = 0; // Accumulates numbers that are not even.

    // Iterate through each number in the parsed sequence.
    // Using a 'for...of' loop for clear iteration over array elements.
    for (const currentNumber of numericValues) {
        // Check if the current number is a multiple of 4.
        if (currentNumber % 4 === 0) {
            multiplesOfFourTally++;
        }
        // If it's not a multiple of 4, check if it's an odd number.
        // An odd number will have a remainder of 1 or -1 when divided by 2,
        // so checking if the remainder is not 0 is a reliable way.
        else if (currentNumber % 2 !== 0) {
            strictlyOddNumbersTally++;
        }
        // Numbers that are even but not multiples of 4 are implicitly ignored
        // by the problem's logic.
    }

    // Determine the required count of multiples of four based on the tally of odd numbers.
    // This intermediate variable simplifies the nested conditional logic from the original.
    let requiredFoursToBalanceOdds = strictlyOddNumbersTally;

    // A special condition applies if the count of odd numbers exceeds the calculated threshold.
    // In this specific scenario, one fewer multiple of four is needed to satisfy the conditions.
    if (strictlyOddNumbersTally > oddNumberAllowanceThreshold) {
        requiredFoursToBalanceOdds--;
    }

    // Evaluate the final condition: whether the available multiples of four are sufficient
    // to meet or exceed the adjusted requirement.
    // A ternary operator is used for a concise representation of the final decision.
    const finalVerdict = (multiplesOfFourTally >= requiredFoursToBalanceOdds) ? "Yes" : "No";

    // Output the result of the analysis.
    console.log(finalVerdict);
}

// The entry point for execution:
// Reads the entire content of standard input, decodes it as UTF-8,
// removes any leading/trailing whitespace from the whole input,
// and then passes it to the analysis function.
analyzeNumericSequence(require('fs').readFileSync('/dev/stdin', { encoding: 'utf8' }).trim());