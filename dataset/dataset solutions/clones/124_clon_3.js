let receivedDataBuffer = ''; // Buffer to accumulate incoming data from standard input
const INPUT_ENCODING_TYPE = 'utf8'; // Define the character encoding for input streams
const SYSTEM_PROCESS_HANDLE = process; // Alias for the global process object for clarity

// Activate the standard input stream to begin receiving data
SYSTEM_PROCESS_HANDLE.stdin.resume();
// Configure the character encoding for the incoming data stream
SYSTEM_PROCESS_HANDLE.stdin.setEncoding(INPUT_ENCODING_TYPE);

// Attach an event listener for 'data' events, which fire when input is available
SYSTEM_PROCESS_HANDLE.stdin.on('data', (inputChunk) => {
    receivedDataBuffer += inputChunk; // Append each received data chunk to the buffer
});

// Attach an event listener for the 'end' event, which fires when the input stream closes
SYSTEM_PROCESS_HANDLE.stdin.on('end', () => {
    // Once all input data has been accumulated, initiate the primary processing routine
    try {
        processAllIncomingData(receivedDataBuffer);
    } catch (processingError) {
        // Log any errors that occur during the main data processing phase
        console.error("Critical error during data processing:", processingError.message);
        // Terminate the process with an error code
        SYSTEM_PROCESS_HANDLE.exit(1);
    }
});

/**
 * Manages the parsing and processing of the entire raw input string.
 * This function is responsible for splitting the input into lines,
 * validating parameters, and orchestrating the calculation for each set.
 * @param {string} rawInputString - The complete string collected from standard input.
 */
function processAllIncomingData(rawInputString) {
    // Split the raw input into individual lines, handling various line endings.
    // Trim whitespace from each line and filter out any resulting empty lines.
    const structuredInputLines = rawInputString
        .split(/\r?\n/)
        .map(lineContent => lineContent.trim())
        .filter(Boolean);

    // If no valid lines are present after filtering, issue a warning and exit.
    if (structuredInputLines.length === 0) {
        console.warn("Warning: No meaningful input lines were provided for processing.");
        return;
    }

    let currentLineNumber = 0; // Counter for tracking the current line being processed

    // Iterate through each processed input line
    for (const dataLine of structuredInputLines) {
        currentLineNumber++; // Increment line counter for reporting

        // Attempt to parse numerical values from the current line, splitting by one or more spaces.
        // Includes validation for non-numeric input.
        const parsedNumericParameters = dataLine.split(/\s+/).map(strValue => {
            const numericValue = parseInt(strValue, 10); // Use parseInt with radix 10 for explicit conversion
            if (isNaN(numericValue)) {
                // If a non-numeric value is found, throw an error to halt processing for this line
                throw new Error(`Parse Error on Line ${currentLineNumber}: '${strValue}' is not a valid number.`);
            }
            return numericValue;
        });

        // Ensure that exactly two parameters (N and S) were parsed from the line
        if (parsedNumericParameters.length !== 2) {
            console.warn(`Skipping Line ${currentLineNumber}: Expected 2 numeric parameters (N S), but found ${parsedNumericParameters.length}.`);
            continue; // Move to the next line if parameter count is incorrect
        }

        // Destructure the parsed parameters into descriptive variables
        const [numberOfDigits, targetSumValue] = parsedNumericParameters;

        // Check for the termination signal (0 0) as per problem specification
        if (numberOfDigits === 0 && targetSumValue === 0) {
            console.log("Termination signal (0 0) detected. Ceasing further input processing.");
            break; // Exit the loop as requested by the termination signal
        }

        // Implement basic validation for the input constraints (e.g., non-negative, reasonable range)
        if (numberOfDigits < 1 || numberOfDigits > 10 || targetSumValue < 0 || targetSumValue > 100) {
            console.warn(`Skipping Line ${currentLineNumber}: Parameters (N=${numberOfDigits}, S=${targetSumValue}) are outside typical operational bounds.`);
            continue; // Skip lines with out-of-range parameters
        }

        // Invoke the combination calculator and log the result for the current set of parameters
        const calculatedResult = computeSumCombinations(numberOfDigits, targetSumValue);
        console.log(`Combinations for N=${numberOfDigits}, S=${targetSumValue}: ${calculatedResult}`);
    }
}

/**
 * Initiates the recursive process to count combinations of digits that sum to a target value.
 * @param {number} totalDigitsCount - The required number of digits (N).
 * @param {number} desiredTotalSum - The sum that the digits must achieve (S).
 * @returns {number} The total number of unique combinations.
 */
function computeSumCombinations(totalDigitsCount, desiredTotalSum) {
    // Guard clause: If the number of digits is non-positive or the desired sum is negative,
    // no valid combinations are possible under the problem's constraints.
    if (totalDigitsCount <= 0 || desiredTotalSum < 0) {
        return 0;
    }

    // The recursion needs an initial 'previous digit' to allow digits from 0 up to 9.
    // Setting it to -1 allows the first digit to be 0 (as `previousDigitChosen + 1` will be 0).
    const initialPreviousDigitConstraint = -1;
    return recursivelyExploreSums(desiredTotalSum, initialPreviousDigitConstraint, totalDigitsCount);
}

const MAXIMUM_ALLOWED_DIGIT = 9; // Constant representing the largest single digit allowed (0-9)

/**
 * Recursively counts the number of ways to form a `currentRemainingSum` using `digitsRemaining` digits.
 * Digits are chosen in a non-decreasing order to avoid duplicate permutations.
 * @param {number} currentRemainingSum - The sum that still needs to be formed.
 * @param {number} previousDigitChosen - The last digit chosen in the current sequence.
 *                                       This ensures subsequent digits are greater than or equal to this one.
 * @param {number} digitsRemaining - The number of digits that still need to be selected.
 * @returns {number} The count of successful combinations for the current recursive branch.
 */
function recursivelyExploreSums(currentRemainingSum, previousDigitChosen, digitsRemaining) {
    // Base Case 1: If no more digits are needed
    if (digitsRemaining === 0) {
        // A combination is successful only if the current remaining sum is exactly zero.
        const isSumPerfectlyAchieved = currentRemainingSum === 0;
        return isSumPerfectlyAchieved ? 1 : 0;
    }

    // Base Case 2 (Optimization/Guard): If the current remaining sum becomes negative,
    // this path cannot lead to a valid solution.
    if (currentRemainingSum < 0) {
        return 0;
    }

    let accumulatedCombinations = 0; // Accumulator for the total combinations found in this branch

    // Iterate through all possible digits for the current position.
    // The loop starts from `previousDigitChosen + 1` to ensure digits are non-decreasing
    // and correctly handles the initial call where `previousDigitChosen` is -1 (allowing 0).
    for (let candidateDigit = previousDigitChosen + 1; candidateDigit <= MAXIMUM_ALLOWED_DIGIT; candidateDigit++) {
        // Calculate the sum that would remain after choosing the `candidateDigit`.
        const potentialNextRemainingSum = currentRemainingSum - candidateDigit;

        // If the `potentialNextRemainingSum` is non-negative, this digit is valid for the current step.
        if (potentialNextRemainingSum >= 0) {
            // Recursively call the function for the next digit, reducing the sum and digit count.
            // The `candidateDigit` becomes the new `previousDigitChosen` for the next level.
            accumulatedCombinations += recursivelyExploreSums(potentialNextRemainingSum, candidateDigit, digitsRemaining - 1);
        } else {
            // Optimization: Since `candidateDigit` is increasing, if `potentialNextRemainingSum`
            // is negative, all subsequent larger digits will also result in a negative sum.
            // Therefore, we can break out of the loop early.
            break;
        }
    }

    return accumulatedCombinations;
}