#!/usr/bin/node
(function() {
    // --- Configuration Constants ---
    const SEQUENCE_GENERATION_LIMIT = 31;
    const INITIAL_TRIBONACCI_TERMS = [1, 1, 2];
    const RESULT_ADDITION_OFFSET = 3649;
    const RESULT_DIVISION_FACTOR = 3650;

    // --- Data Storage ---
    let collectedInputIndices = []; // Renamed T from original
    const inputSourceReader = process.openStdin(); // Renamed stdin from original
    inputSourceReader.setEncoding('utf8');

    // --- Helper Function for Sequence Calculation ---
    const computeTribonacciLikeSequence = (upperBound, initialTerms) => {
        const sequenceArray = [...initialTerms];
        for (let k = initialTerms.length; k < upperBound; k++) {
            sequenceArray.push(sequenceArray[k - 1] + sequenceArray[k - 2] + sequenceArray[k - 3]);
        }
        return sequenceArray;
    };

    const tribonacciLikeSequence = computeTribonacciLikeSequence(SEQUENCE_GENERATION_LIMIT, INITIAL_TRIBONACCI_TERMS); // Renamed a from original

    // --- Input Data Processing Handler ---
    inputSourceReader.on('data', (incomingDataBuffer) => { // Renamed input from original
        const rawInputLines = incomingDataBuffer.split("\n"); // Renamed ref from original

        // Helper to convert a string line to an integer, skipping empty lines
        const convertLineToNumber = (lineContent) => {
            if (lineContent === '') {
                return null; // Indicate that this line should be skipped
            }
            // Using parseInt for explicit conversion, equivalent to '^0' for positive integers
            return parseInt(lineContent, 10);
        };

        const numbersFromCurrentBatch = []; // Renamed x from original
        for (let lineIndex = 0; lineIndex < rawInputLines.length; lineIndex++) { // Renamed i, len from original
            const parsedNumericValue = convertLineToNumber(rawInputLines[lineIndex]);
            if (parsedNumericValue !== null) {
                numbersFromCurrentBatch.push(parsedNumericValue);
            }
        }

        // Apply original logic for updating the main input array 'T' (collectedInputIndices)
        // This handles cases where input might be a full set or a single appended value.
        const isBatchInputOrSecondElementValid = numbersFromCurrentBatch.length > 2 || !isNaN(numbersFromCurrentBatch[1]);
        if (isBatchInputOrSecondElementValid) {
            collectedInputIndices = numbersFromCurrentBatch;
        } else {
            // If numbersFromCurrentBatch is empty, numbersFromCurrentBatch[0] will be undefined,
            // replicating original behavior of pushing undefined.
            collectedInputIndices.push(numbersFromCurrentBatch[0]);
        }
    });

    // --- Input End Event Handler ---
    inputSourceReader.on('end', (_endEventArg) => { // Renamed z from original, unused
        // Helper function to perform the final calculation and print
        const calculateAndOutputResult = (indexValue) => {
            const sequenceTerm = tribonacciLikeSequence[indexValue];
            // Math.floor is used for explicit integer division, equivalent to '^0' for positive results.
            const finalCalculatedValue = Math.floor((sequenceTerm + RESULT_ADDITION_OFFSET) / RESULT_DIVISION_FACTOR);
            console.log(finalCalculatedValue);
        };

        // Iterate through the collected input indices, stopping if an index is falsy (0 or undefined)
        for (let resultIterationIndex = 0; collectedInputIndices[resultIterationIndex]; resultIterationIndex++) { // Replicates original loop condition 'T[i]'
            const currentInputIndex = collectedInputIndices[resultIterationIndex];
            calculateAndOutputResult(currentInputIndex);
        }
    });
})();
