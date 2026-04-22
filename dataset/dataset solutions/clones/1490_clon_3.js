(async function executeSequenceManipulator() {
    // Array to temporarily store incoming data chunks from standard input.
    // This handles cases where input arrives in multiple buffers.
    let rawDataChunks = [];

    // Asynchronously iterate over data chunks from standard input.
    // Each 'receivedSegment' could be a Buffer object.
    for await (const receivedSegment of process.stdin) {
        rawDataChunks.push(receivedSegment);
    }

    // Convert the collected raw data chunks into a single string.
    let inputString = '';
    if (rawDataChunks.length > 0) {
        inputString = Buffer.concat(rawDataChunks).toString('utf8');
    } else {
        // If no input is received, there's nothing to process.
        // console.error("No input data received. Terminating operation.");
        return;
    }

    // Split the entire input string into individual lines,
    // filtering out any lines that are empty or contain only whitespace.
    const processedInputLines = inputString.split('\n').filter(line => line.trim() !== '');

    if (processedInputLines.length < 1) {
        // console.error("Input contains no valid lines after processing. Terminating operation.");
        return;
    }

    // Parse the first line which contains the total number of elements (N)
    // and the total number of subsequent operations (Q).
    const initialConfigTokens = processedInputLines[0].split(/\s+/);

    if (initialConfigTokens.length !== 2) {
        // console.error("Invalid configuration line format. Expected two numeric values. Terminating.");
        return;
    }

    // Convert string tokens to integers using parseInt for explicit base 10.
    const [totalElementsCount, numberOfOperations] = initialConfigTokens.map(strVal => parseInt(strVal, 10));

    // Validate the parsed initial configuration values.
    if (isNaN(totalElementsCount) || isNaN(numberOfOperations) || totalElementsCount < 1 || numberOfOperations < 0) {
        // console.error("Invalid numeric configuration values. N must be >= 1, Q must be >= 0. Terminating.");
        return;
    }

    // Extract and parse all subsequent operation instructions from the input lines.
    // Each operation line specifies a range [L, R] and a digit D.
    const operationInstructions = processedInputLines
        .slice(1, numberOfOperations + 1) // Select only the lines corresponding to operations.
        .map((singleLineInstruction, instructionIndex) => {
            const instructionTokens = singleLineInstruction.split(/\s+/);
            if (instructionTokens.length !== 3) {
                // Log a warning for malformed instruction lines and return null.
                // console.warn(`Warning: Operation instruction line ${instructionIndex + 1} malformed. Expected 3 values. Skipping.`);
                return null;
            }
            // Convert instruction tokens to integers.
            return instructionTokens.map(valStr => parseInt(valStr, 10));
        })
        .filter(op => op !== null && op.every(val => !isNaN(val))); // Filter out any null entries or operations with non-numeric values.

    // Initialize the main internal sequence array.
    // It will hold `totalElementsCount` elements, each initially set to 1.
    let internalNumericSequence = Array.from({ length: totalElementsCount }, () => 1);

    // Define a large prime modulus for all arithmetic calculations.
    // This is crucial for problems involving large numbers to prevent overflow
    // and ensure results fit within standard integer types.
    const calculationModulus = 998244353;

    /**
     * A utility function to ensure any value is kept within the bounds of the defined modulus.
     * @param {number} value - The number to apply the modulus operation to.
     * @returns {number} The result of `value % calculationModulus`.
     */
    const applyModulus = (value) => {
        return value % calculationModulus;
    };

    /**
     * Calculates the current value of the `internalNumericSequence` interpreted as a large number.
     * Each element in the sequence contributes as a digit. The result is kept modulo `calculationModulus`.
     * This function uses Array.prototype.reduce for a functional approach to aggregation.
     */
    const outputSequenceValue = () => {
        // The reduce method iterates through the sequence, accumulating the value.
        const accumulatedValue = internalNumericSequence.reduce((currentTotal, digit) => {
            // For each digit, multiply the current total by 10 and add the digit.
            // Apply modulus at each step to prevent intermediate overflows.
            let intermediateProduct = currentTotal * 10;
            let stepFinal = applyModulus(intermediateProduct + digit);
            return stepFinal;
        }, 0); // Start the accumulation from 0.

        console.log(accumulatedValue); // Display the final calculated value.
    };

    // Iterate through each valid operation instruction and apply it to the sequence.
    for (const currentOperation of operationInstructions) {
        // Destructure the operation parameters from the current instruction.
        // Note: input parameters L, R are 1-based, D is the digit.
        const [rawStartIndex, rawEndIndex, assignedDigit] = currentOperation;

        // Adjust the 1-based input indices to 0-based for array access.
        const effectiveStartIndex = rawStartIndex - 1;
        const effectiveEndIndex = rawEndIndex - 1;

        // Perform comprehensive validation on the operation parameters.
        // Ensure indices are within array bounds, start is not after end, and digit is valid.
        if (effectiveStartIndex < 0 || effectiveEndIndex >= totalElementsCount ||
            effectiveStartIndex > effectiveEndIndex || assignedDigit < 0 || assignedDigit > 9) {
            // console.warn(`Warning: Invalid operation parameters [${rawStartIndex}, ${rawEndIndex}, ${assignedDigit}]. Skipping this operation.`);
            continue; // Skip to the next operation if current one is invalid.
        }

        // Apply the digit update: set all elements in the specified range [L, R] to 'D'.
        for (let k = effectiveStartIndex; k <= effectiveEndIndex; ++k) {
            internalNumericSequence[k] = assignedDigit;
        }

        // After applying the current operation, recalculate and output the sequence's value.
        outputSequenceValue();
    }

})();