// A refined and restructured program for processing numerical data,
// determining sum eligibility based on specific criteria.

// Core module for file system operations in Node.js.
const fileSystemModule = require('fs');

// --- Configuration Constants ---
// Path to the standard input stream.
const STANDARD_INPUT_PATH = '/dev/stdin';
// The maximum permissible sum for a combination of three numbers.
const MAX_PERMITTED_SUM = 20;
// The lower bound for potential third number candidates.
const CANDIDATE_RANGE_START = 1;
// The upper bound for potential third number candidates.
const CANDIDATE_RANGE_END = 10;
// Delimiter used for splitting numbers within an input line.
const NUMBER_DELIMITER = ' ';

// --- Utility Functions ---

/**
 * Generates an array of integers within a specified inclusive range.
 * @param {number} start - The starting integer of the range.
 * @param {number} end - The ending integer of the range.
 * @returns {number[]} An array containing numbers from `start` to `end`.
 */
const generateIntegerSequence = (start, end) => {
    const sequence = [];
    for (let i = start; i <= end; i++) {
        sequence.push(i);
    }
    return sequence;
};

/**
 * Checks if the sum of three numbers is less than or equal to a given limit.
 * @param {number} valA - The first number.
 * @param {number} valB - The second number.
 * @param {number} valC - The third number.
 * @param {number} limit - The upper bound for the sum.
 * @returns {boolean} True if (valA + valB + valC) <= limit, false otherwise.
 */
const checkSumWithinBoundary = (valA, valB, valC, limit) => {
    const currentSum = valA + valB + valC;
    return currentSum <= limit;
};

/**
 * Parses a string line containing space-separated numbers into an array of integers.
 * @param {string} line - The input string line.
 * @returns {number[] | null} An array of parsed integers, or null if parsing fails or
 *                           the number of expected integers (3) is not met.
 */
const parseNumbersFromLine = (line) => {
    const stringParts = line.split(NUMBER_DELIMITER);
    if (stringParts.length !== 3) {
        // Log or handle error for lines not containing exactly three parts.
        // console.warn(`Input line "${line}" does not contain exactly three parts.`);
        return null;
    }
    const numbers = stringParts.map(part => parseInt(part.trim(), 10));
    // Check if any parsed number is NaN.
    if (numbers.some(isNaN)) {
        // Log or handle error for lines containing non-numeric values.
        // console.warn(`Input line "${line}" contains non-numeric values.`);
        return null;
    }
    return numbers;
};

// --- Main Processing Logic ---

/**
 * Processes a single line of numerical input according to the problem's rules.
 * @param {string} lineContent - The text content of a single input line.
 */
const processInputLine = (lineContent) => {
    const trimmedLine = lineContent.trim();
    if (!trimmedLine) {
        // Skip empty lines after trimming.
        return;
    }

    const inputValues = parseNumbersFromLine(trimmedLine);

    if (!inputValues) {
        // If parsing failed or invalid number count, skip this line.
        return;
    }

    const [firstOperand, secondOperand, thirdInputNumber] = inputValues;

    // Generate the full sequence of possible third numbers (1 through 10).
    const fullCandidateSet = generateIntegerSequence(CANDIDATE_RANGE_START, CANDIDATE_RANGE_END);

    // Filter the candidates based on the specific exclusion rule from the original code:
    // A candidate value is excluded ONLY if it is identical to ALL THREE input numbers.
    // This is equivalent to: keep if (candidateValue !== firstOperand || candidateValue !== secondOperand || candidateValue !== thirdInputNumber)
    // which simplifies to: keep if !(candidateValue === firstOperand && candidateValue === secondOperand && candidateValue === thirdInputNumber)
    const filteredCandidates = fullCandidateSet.filter(candidateValue => {
        const isIdenticalToAllInputs = (candidateValue === firstOperand &&
                                        candidateValue === secondOperand &&
                                        candidateValue === thirdInputNumber);
        return !isIdenticalToAllInputs;
    });

    let countValidSums = 0;
    // Pre-calculate the sum of the first two operands to optimize the loop.
    // const initialPartialSum = firstOperand + secondOperand; // This variable is not strictly needed with checkSumWithinBoundary

    // Iterate through the eligible candidates to count how many form a valid sum.
    for (const currentCandidate of filteredCandidates) {
        // Re-using the helper function for clarity and modularity.
        if (checkSumWithinBoundary(firstOperand, secondOperand, currentCandidate, MAX_PERMITTED_SUM)) {
            countValidSums++;
        }
    }

    const totalConsideredCandidates = filteredCandidates.length;
    // Calculate the count of sums that exceed the boundary (derived, not directly counted).
    const countInvalidSums = totalConsideredCandidates - countValidSums;

    // Determine the final output based on the comparison of valid vs. invalid sums.
    const finalResult = (countValidSums > countInvalidSums) ? "YES" : "NO";
    console.log(finalResult);
};

// --- Execution Entry Point ---

/**
 * Main function to orchestrate the reading and processing of input.
 */
const main = () => {
    try {
        // Read the entire input content from the specified file path.
        const rawFileData = fileSystemModule.readFileSync(STANDARD_INPUT_PATH, 'utf8');

        // Split the raw data into individual lines, discarding any leading/trailing whitespace
        // from the entire input, then splitting by newline characters.
        const allInputLines = rawFileData.trim().split('\n');

        // If no lines are present after trimming and splitting, or only an empty line,
        // there's nothing to process.
        if (allInputLines.length === 0 || (allInputLines.length === 1 && allInputLines[0].trim() === '')) {
            // console.log("No processable input found.");
            return; // Exit gracefully without outputting anything.
        }

        // Process each line sequentially.
        allInputLines.forEach(processInputLine);

    } catch (error) {
        // Catch and log any errors during file reading or processing.
        console.error(`An error occurred during program execution: ${error.message}`);
        // Optionally, re-throw the error or exit with a non-zero status.
        process.exit(1);
    }
};

// Execute the main function when the script runs.
main();