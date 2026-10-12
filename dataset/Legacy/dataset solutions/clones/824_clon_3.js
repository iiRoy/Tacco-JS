//usr/bin/env node $0 $@;exit
const executeProgram = function () {
    while (true) {
        const currentInputLine = readInputLine();
        if (currentInputLine === null) { // Explicitly check for end of input stream
            break;
        }

        const numericValue = Number(currentInputLine);
        // Original logic: if (!n) break;
        // This covers 0, NaN, null, undefined, false, ""
        // Since we already checked for null, we now check for 0 or NaN.
        // Number("") is 0, Number("0") is 0. Number("abc") is NaN.
        if (numericValue === 0 || isNaN(numericValue)) {
            break;
        }

        let solutionCount = 0;
        let currentIterationDivisor = 2;

        // Encapsulate the inner calculation logic into a small helper function
        const calculateArithmeticProgressionSum = (targetNumber) => {
            let validCombinations = 0;
            let divisorCandidate = 2; // Start from 2 as per original logic

            while (true) {
                // The sum of an arithmetic progression 1 + 2 + ... + (divisorCandidate - 1)
                // is divisorCandidate * (divisorCandidate - 1) / 2.
                // This represents the sum of numbers *before* the first term of the sequence.
                const sumOfInitialTerms = divisorCandidate * (divisorCandidate - 1) / 2;

                // If targetNumber is N, and we are looking for a sequence of length K (divisorCandidate)
                // starting with A, then N = K*A + (0 + 1 + ... + K-1)
                // N = K*A + K*(K-1)/2
                // N - K*(K-1)/2 = K*A
                // remainderValue = K*A
                const remainderValue = targetNumber - sumOfInitialTerms;

                // If remainderValue is less than divisorCandidate, it means K*A < K, so A < 1.
                // This implies the starting term A would be less than 1, which is not allowed
                // for positive integer sequences, or the sequence length is too large.
                if (remainderValue < divisorCandidate) {
                    break;
                }

                // The original comment "bitwise operations cause bug." is preserved.
                // If remainderValue is perfectly divisible by divisorCandidate,
                // it means A is an integer (A = remainderValue / divisorCandidate).
                // This indicates a valid sequence.
                if (remainderValue % divisorCandidate === 0) {
                    validCombinations++;
                }
                divisorCandidate++;
            }
            return validCombinations;
        };

        solutionCount = calculateArithmeticProgressionSum(numericValue);
        outputResult(solutionCount);
    }
};

/// IO Handling Module ///
if (typeof process !== 'undefined' && typeof process.openStdin === 'function') {
    // Node.js environment
    const outputResult = function (valueToLog) {
        console.log(valueToLog);
    };

    const readInputLine = (function () {
        let bufferedInputLines = [];
        let currentBufferIndex = 0;
        const standardInputStream = process.openStdin();
        standardInputStream.setEncoding('utf8');

        let pendingInputFragment = "";

        // Internal helper to process a chunk of raw input data
        const processIncomingDataChunk = (dataChunk) => {
            const combinedRawInput = pendingInputFragment + dataChunk;
            const splitLines = combinedRawInput.split("\n");
            pendingInputFragment = splitLines.pop(); // The last element is always the potentially incomplete line

            for (const lineContent of splitLines) { // Using for...of loop for iteration
                if (lineContent.length > 0) { // Only push non-empty lines
                    bufferedInputLines.push(lineContent);
                }
            }
        };

        standardInputStream.on('data', processIncomingDataChunk);

        standardInputStream.on('end', () => {
            // Process any remaining input fragment at the end of the stream
            if (pendingInputFragment.length > 0) {
                // Append a newline to ensure the last fragment is processed as a complete line
                // if it's not empty, and then clear pendingInputFragment.
                processIncomingDataChunk(pendingInputFragment + '\n');
            }
            executeProgram(); // Start the main program logic after all input is buffered
        });

        // The public function returned by the IIFE
        return function () {
            if (currentBufferIndex >= bufferedInputLines.length) {
                return null; // Indicate end of available input
            }
            return bufferedInputLines[currentBufferIndex++];
        };
    })();
} else {
    // V8 (d8) environment or other non-Node.js environments with global readline/print
    // Assuming global `readline` and `print` functions are available
    executeProgram();
}
