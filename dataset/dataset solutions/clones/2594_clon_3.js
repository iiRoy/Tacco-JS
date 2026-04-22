/*
 *  This script serves as a specialized utility for calculating
 *  a sequence-related count based on two input numerical parameters.
 *  It determines the minimum number of "steps" or "operations" required
 *  to reach a specified target threshold, starting from a base value of 1,
 *  where each operation adds a fixed increment derived from the first parameter.
 *
 *  The implementation includes robust handling for edge cases and
 *  optimizes the calculation process compared to iterative methods.
 */
(function() { // Encapsulates the entire program within an IIFE to prevent global pollution

    // --- Input Acquisition ---
    // Reads all available data from standard input.
    // This setup is typical for Node.js environments in competitive programming.
    const rawInputContent = process.stdin.readFileSync(0, 'utf8');

    // --- Data Transformation Helper ---
    /**
     * Parses a string containing space-separated numbers into an array of integers.
     * @param {string} textData The raw string input from stdin.
     * @returns {Array<number>} An array of parsed numerical values.
     */
    const parseNumericalSequence = (textData) => {
        // First, remove leading/trailing whitespace.
        // Then, split the string by one or more whitespace characters.
        // Finally, convert each resulting string part into a number.
        return textData.trim().split(/\s+/).map(Number);
    };

    // --- Core Logic Execution ---
    /**
     * Executes the primary calculation logic based on the parsed numerical inputs.
     * @param {Array<number>} processedNumbers An array containing the two input integers.
     */
    const performComputation = (processedNumbers) => {
        // Assign descriptive names to the input values for clarity.
        let firstOperand = processedNumbers[0]; // Represents 'a' from the original problem.
        let secondOperand = processedNumbers[1]; // Represents 'b' from the original problem.

        let calculatedResult = 0; // Initialize the counter for the computed outcome.

        // --- Decision Tree for Result Calculation ---

        // Special handling for when the first operand is 1.
        // This scenario creates a zero increment (1 - 1 = 0), which can lead to
        // impossible-to-reach targets or division by zero if not handled.
        if (firstOperand === 1) {
            if (secondOperand === 1) {
                // If both operands are 1, the target is already met with the initial state.
                calculatedResult = 1;
            } else {
                // If firstOperand is 1 and secondOperand > 1, it's impossible to reach
                // the target by adding zero repeatedly. The original code would
                // enter an infinite loop here. We return 0 to signify impossibility.
                calculatedResult = 0;
            }
        }
        // If the first operand is already greater than or equal to the target threshold,
        // one "step" (the initial state or one immediate action) is sufficient.
        else if (firstOperand >= secondOperand) {
            calculatedResult = 1;
        }
        // For all other cases (firstOperand < secondOperand and firstOperand > 1),
        // we perform the main calculation using a direct mathematical formula.
        else {
            // Determine the effective increment value per operation.
            // This is (firstOperand - 1) because the sequence starts at 1,
            // and each subsequent operation adds (firstOperand - 1).
            const incrementPerStep = firstOperand - 1;

            // Calculate the total progress required beyond the initial value of 1.
            const totalProgressNeeded = secondOperand - 1;

            // The number of operations is the ceiling of (totalProgressNeeded / incrementPerStep).
            // Math.ceil ensures that even a fractional part counts as a full operation.
            calculatedResult = Math.ceil(totalProgressNeeded / incrementPerStep);

            // Optional: A small debug hint if the result is unusual.
            // if (calculatedResult > 1000000) {
            //     console.warn(`[DEBUG]: Extremely large result detected: ${calculatedResult}`);
            // }
        }

        // Output the final computed result to standard output.
        console.log(calculatedResult);
    };

    // --- Program Entry Point ---
    // Parse the input data first.
    const processedInputArray = parseNumericalSequence(rawInputContent);

    // Then, pass the processed data to the core computation function.
    performComputation(processedInputArray);

})(); // End of IIFE