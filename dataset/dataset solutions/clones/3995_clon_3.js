// This module processes a specific set of numerical conditions based on provided input.

/**
 * Parses the initial configuration parameters from a raw input string.
 * This function extracts the upper limit for iteration and the minimum required remainder.
 *
 * @param {string} rawParameterLine The first line of input, expected to contain two space-separated integers.
 * @returns {{upperBound: number, minimumRequiredRemainder: number}} An object containing the parsed numerical values.
 * @throws {Error} If the input line cannot be correctly parsed into two valid integers.
 */
const extractNumericalParameters = (rawParameterLine) => {
    // Normalize and split the input line by one or more whitespace characters to get individual tokens.
    const tokens = rawParameterLine.trim().split(/\s+/);

    // Validate that exactly two parameters are supplied.
    if (tokens.length !== 2) {
        throw new Error("Parameter parsing error: Expected two numerical parameters, but received a different quantity.");
    }

    // Convert string tokens into integers, explicitly specifying base 10 for safety.
    const parsedUpperLimit = parseInt(tokens[0], 10);
    const parsedMinRemainder = parseInt(tokens[1], 10);

    // Perform validation to ensure that the parsed values are indeed valid numbers.
    if (isNaN(parsedUpperLimit) || isNaN(parsedMinRemainder)) {
        throw new Error("Parameter parsing error: One or both input values could not be converted to numbers.");
    }

    // A warning for potentially problematic inputs, depending on specific problem constraints.
    if (parsedUpperLimit < 0 || parsedMinRemainder < 0) {
        console.warn("Warning: Negative input parameters were detected. Processing might proceed with unexpected results based on problem interpretation.");
    }

    return {
        upperBound: parsedUpperLimit,
        minimumRequiredRemainder: parsedMinRemainder,
    };
};

/**
 * Evaluates whether a given pair of numbers (x, y) satisfies the specific conditions required by the problem.
 * The conditions are:
 * 1. x is strictly less than y.
 * 2. If x is greater than or equal to y, then the remainder of x divided by y must be at least a specified threshold.
 *
 * @param {number} x The first number in the pair (dividend for remainder check).
 * @param {number} y The second number in the pair (divisor for remainder check).
 * @param {number} requiredRemainderThreshold The minimum remainder value needed for the second condition.
 * @returns {boolean} True if the pair (x, y) meets the criteria, false otherwise.
 */
const satisfiesPairCondition = (x, y, requiredRemainderThreshold) => {
    // First condition: If the first number is less than the second, the pair is valid.
    if (x < y) {
        return true;
    }

    // Guard against division by zero if y could theoretically be zero.
    // In this problem's context, y will always be >= 1 due to loop initialization.
    if (y === 0) {
        return false; // Cannot perform modulo operation reliably.
    }

    // Second condition: If x >= y, check if the remainder of x / y meets the threshold.
    return (x % y) >= requiredRemainderThreshold;
};

/**
 * This is the primary logical routine that computes the total count of number pairs
 * (x, y) within a defined range that fulfill specific conditions.
 *
 * @param {string} rawInputData The complete input string, typically read from standard input.
 * @returns {number} The final count of pairs that satisfy the problem's criteria, or -1 if an error occurred.
 */
const calculateConditionalPairCount = (rawInputData) => {
    // Process the raw input by removing leading/trailing whitespace and splitting into lines.
    const inputLines = rawInputData.trim().split('\n');

    let processingParameters;
    try {
        // Delegate the parsing of configuration parameters to a dedicated function.
        processingParameters = extractNumericalParameters(inputLines[0]);
    } catch (error) {
        console.error("Critical error during initial parameter extraction:", error.message);
        return -1; // Indicate a failure in processing.
    }

    const maximumAllowedValue = processingParameters.upperBound;
    const minimumRemainderCriterion = processingParameters.minimumRequiredRemainder;

    // Initialize an accumulator for the count of valid pairs.
    let matchedPairAccumulator = 0;

    // Determine the starting value for the iteration loops.
    // This ensures that the loop variables (numX, numY) are at least 1,
    // or the minimum required remainder if it's greater than 1.
    const iterationStartValue = Math.max(1, minimumRemainderCriterion);

    // Employ nested loops to iterate through all possible combinations of numX and numY
    // within the specified range [iterationStartValue, maximumAllowedValue].
    for (let numX = iterationStartValue; numX <= maximumAllowedValue; numX++) {
        for (let numY = iterationStartValue; numY <= maximumAllowedValue; numY++) {
            // Check if the current pair (numX, numY) satisfies the conditions using the helper function.
            if (satisfiesPairCondition(numX, numY, minimumRemainderCriterion)) {
                matchedPairAccumulator++; // Increment the counter if the conditions are met.
            }
        }
    }

    return matchedPairAccumulator;
};

/**
 * This bootstrap function handles the environment-specific aspects, such as
 * reading input from standard input and writing the result to standard output.
 * It encapsulates the main application logic call.
 * This section should generally remain untouched for competitive programming setups.
 */
const bootstrapApplication = () => {
    try {
        // Synchronously read all data from standard input, interpreting it as UTF-8 text.
        const stdinContent = require("fs").readFileSync("/dev/stdin", "utf8");

        // Invoke the core calculation logic with the obtained input.
        const computedResult = calculateConditionalPairCount(stdinContent);

        // Output the final computed result to standard output.
        // Using console.info here to slightly differentiate from default console.log.
        console.info(computedResult);
    } catch (unexpectedError) {
        // Log any unhandled exceptions that occur during file I/O or processing.
        console.error("An unexpected error prevented the application from completing:", unexpectedError.message);
        // Terminate the process with a non-zero exit code to signal an error.
        process.exit(1);
    }
};

// Initiate the application by calling the bootstrap function.
bootstrapApplication();