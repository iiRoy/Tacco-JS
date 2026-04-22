#!/usr/bin/node
// This script processes numerical data from standard input, performing specific calculations.
// It's a re-engineered version of an older CoffeeScript utility, demonstrating
// advanced code transformation techniques for Type III cloning.

(function executeApplicationLogic() {
    // A temporary buffer to accumulate all incoming data chunks before full line processing.
    let accumulatedInputBuffer = '';
    // This array will store each distinct, non-empty line after processing the buffer.
    const finalProcessedLines = [];

    // Acquire a reference to the standard input stream object.
    const standardInputSource = process.stdin;

    // Configure the input stream to interpret received bytes as UTF-8 characters.
    standardInputSource.setEncoding('utf8');

    // Establish an event listener to capture data as it arrives from the input stream.
    standardInputSource.on('data', (incomingDataPayload) => {
        // Append the newly received data chunk to our ongoing buffer.
        accumulatedInputBuffer += incomingDataPayload;
    });

    // Set up an event listener for when the input stream signals its termination.
    standardInputSource.on('end', () => {
        // Once all data has been completely received, finalize the processing of the buffer.
        // Split the entire buffer content by newline characters and remove any blank lines.
        const rawLineSegments = accumulatedInputBuffer.split('\n');
        for (const segment of rawLineSegments) {
            const cleanedSegment = segment.trim();
            if (cleanedSegment.length > 0) {
                finalProcessedLines.push(cleanedSegment);
            }
        }

        // Invoke the primary computation logic with the complete set of collected input lines.
        performCoreCalculations(finalProcessedLines);
    });

    /**
     * This function encapsulates the main computational logic of the application.
     * It processes each line of input to derive specific numerical results.
     * @param {string[]} inputLineCollection - An array of strings, where each string represents a single line of input data.
     */
    function performCoreCalculations(inputLineCollection) {
        // Define symbolic constants for the 'magic numbers' used within the calculation formula.
        const CONSTANT_BASE_VALUE = 196471;
        const Y_FACTOR_PRIMARY_MULTIPLIER = 195;
        const Y_FACTOR_SECONDARY_MULTIPLIER = 5;
        const M_FACTOR_MULTIPLIER = 20;

        // Retrieve and parse the first line of input, which specifies the total number of test cases.
        // Explicitly use radix 10 for `parseInt` for consistent behavior.
        let totalIterationCount = parseInt(inputLineCollection.shift(), 10);

        // Implement a robust validation step for the parsed number of test cases.
        // If it's not a valid number or is negative, log an error and terminate execution.
        if (isNaN(totalIterationCount) || totalIterationCount < 0) {
            console.error("Error: The initial input for the number of test cases is invalid. Aborting.");
            return;
        }

        // As per the original script's behavior, output the total number of test cases.
        console.log(totalIterationCount);

        // Iterate through each individual test case, from the first up to the total count.
        for (let currentCaseIdentifier = 0; currentCaseIdentifier < totalIterationCount; currentCaseIdentifier++) {
            // Parse the current line of input data into an array of integers.
            // Each line is expected to contain several space-separated numerical strings.
            const parsedNumericArray = inputLineCollection[currentCaseIdentifier]
                .split(' ')
                .map(valueString => parseInt(valueString, 10));

            // Perform validation to ensure that the current line contains at least three
            // valid numbers, as expected by the subsequent calculations.
            if (parsedNumericArray.length < 3 || parsedNumericArray.some(Number.isNaN)) {
                console.error(`Warning: Input data on line ${currentCaseIdentifier + 1} is malformed or incomplete. Skipping this case.`);
                continue; // Skip the current iteration and proceed to the next test case.
            }

            // Extract the primary operands from the parsed array and apply an initial adjustment (decrement by 1).
            let primaryOperandAdjusted = parsedNumericArray[0] - 1;
            let secondaryOperandAdjusted = parsedNumericArray[1] - 1;

            // Initialize a mutable auxiliary modifier variable, defaulting to zero.
            let calculatedAuxiliaryModifier = 0;

            // Apply a conditional rule to determine the value of the auxiliary modifier.
            // The condition `y % 3 !== 2` is logically equivalent to `y % 3 === 0 || y % 3 === 1`.
            if (primaryOperandAdjusted % 3 === 0 || primaryOperandAdjusted % 3 === 1) {
                calculatedAuxiliaryModifier = Math.floor(secondaryOperandAdjusted / 2);
            }

            // Deconstruct the final calculation into a series of clearly named intermediate terms.
            const initialBaseTerm = CONSTANT_BASE_VALUE;
            const termDerivedFromPrimaryY = primaryOperandAdjusted * Y_FACTOR_PRIMARY_MULTIPLIER;
            const termDerivedFromSecondaryY = Math.floor(primaryOperandAdjusted / 3) * Y_FACTOR_SECONDARY_MULTIPLIER;
            const termDerivedFromM = secondaryOperandAdjusted * M_FACTOR_MULTIPLIER;
            const finalDeductionTerm = parsedNumericArray[2]; // The third number from the input line.

            // Assemble these intermediate terms to compute the ultimate result for the current case.
            const finalComputedOutcome = initialBaseTerm - termDerivedFromPrimaryY - termDerivedFromSecondaryY - termDerivedFromM + calculatedAuxiliaryModifier - finalDeductionTerm;

            // Display the final computed result for the current test case to standard output.
            console.log(finalComputedOutcome);
        }
    }

}).call(this); // Execute this entire self-invoking anonymous function within the global context.