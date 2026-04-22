const fileSystemInterface = require('fs');

// Define a constant for the standard input file path, enhancing readability.
const STANDARD_INPUT_SOURCE = '/dev/stdin';

// Read the entire content from the specified input source synchronously.
// The 'utf8' encoding is explicitly used for consistent character interpretation.
let rawInputContentBuffer = fileSystemInterface.readFileSync(STANDARD_INPUT_SOURCE, 'utf8');

// --- Input Preprocessing Stage ---
// 1. Trim any leading or trailing whitespace from the overall input content.
// 2. Split the content into an array of individual lines using the newline character.
// 3. Filter out any empty lines that might result from the split (e.g., multiple newlines or blank lines).
const processedInputLineArray = rawInputContentBuffer
    .trim()
    .split('\n')
    .filter(segment => segment.length > 0); // Retain only non-empty line segments

// Define a constant representing the upper bound for the sum calculation.
const SUMMATION_LIMIT = 20;

// --- Main Processing Loop ---
// Iterate over each cleaned and prepared line of input data.
processedInputLineArray.forEach(currentLineStringData => {

    // --- Helper Function: Numeric Component Extraction ---
    // This function attempts to parse three space-separated integers from a given string.
    // It returns an array of numbers upon success, or null if parsing fails or an incorrect count of numbers is found.
    const parseThreeIntegers = (textualInput) => {
        // Split the string by spaces, then map each part to an integer using parseInt with radix 10 for safety.
        const numericalParts = textualInput.split(' ').map(token => parseInt(token.trim(), 10));

        // Validate the parsed numbers: ensure exactly three parts and that none of them are NaN (Not-a-Number).
        if (numericalParts.length !== 3 || numericalParts.some(Number.isNaN)) {
            // A warning could be logged here in a production system, but for this clone,
            // we silently fail by returning null to avoid altering standard output.
            return null; // Signal that parsing was unsuccessful for this line.
        }
        return numericalParts;
    };

    // Attempt to extract the numeric components from the current line.
    const extractedNumericComponents = parseThreeIntegers(currentLineStringData);

    // If the parsing of the current line failed, skip the rest of this iteration and proceed to the next line.
    if (extractedNumericComponents === null) {
        return;
    }

    // Use array destructuring to assign the three extracted numbers to descriptive constants.
    const [primaryNumber, secondaryNumber, excludedNumber] = extractedNumericComponents;

    // --- Candidate Generation and Filtering ---
    // Generate an array containing integers from 1 to 10.
    // This is a common set of values to be tested against.
    const fullRangeOfCandidates = Array.from({ length: 10 }, (_, index) => index + 1);

    // Create a Set data structure for efficient lookup of numbers that should be excluded.
    // This set includes the three numbers obtained from the current input line.
    const numbersToFilterOutSet = new Set([primaryNumber, secondaryNumber, excludedNumber]);

    // Filter the full range of candidates, keeping only those numbers that are NOT present in the exclusion set.
    const qualifiedTestValues = fullRangeOfCandidates.filter(candidateValue => !numbersToFilterOutSet.has(candidateValue));

    // --- Combination Evaluation Logic ---
    // A predicate function to determine if a combination of three numbers meets the specified sum criteria.
    const checkSumCondition = (valA, valB, checkVal, threshold) => (valA + valB + checkVal) <= threshold;

    // Initialize a counter for combinations that satisfy the sum condition.
    let combinationsMeetingCriteria = 0;

    // The total number of qualified test values available for evaluation.
    const totalQualifiedValues = qualifiedTestValues.length;

    // Iterate through each qualified test value to determine if it forms a valid combination.
    qualifiedTestValues.forEach(currentTestValue => {
        if (checkSumCondition(primaryNumber, secondaryNumber, currentTestValue, SUMMATION_LIMIT)) {
            combinationsMeetingCriteria++; // Increment count if the condition is met.
        }
    });

    // Calculate the number of combinations that do NOT meet the sum criteria.
    // This is derived by subtracting the 'meeting criteria' count from the total available.
    const combinationsNotMeetingCriteria = totalQualifiedValues - combinationsMeetingCriteria;

    // --- Final Decision and Output ---
    // Determine the final output string based on a comparison of the two combination counts.
    // If combinations meeting the criteria are greater than or equal to those not meeting, output "YES", otherwise "NO".
    const outputResult = (combinationsMeetingCriteria >= combinationsNotMeetingCriteria) ? "YES" : "NO";

    // Print the determined result to the standard output.
    console.log(outputResult);
});