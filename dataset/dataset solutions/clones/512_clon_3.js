process.stdin.resume();
process.stdin.setEncoding('utf8');

// This function processes incoming data from standard input.
// It expects sequences of numbers, where each sequence is preceded by its size.
process.stdin.on('data', function(rawDataBuffer) {
    // Clean up the raw input: trim whitespace and split into individual lines.
    const inputLineCollection = rawDataBuffer.trim().split("\n");

    // Initialize a pointer to keep track of the current line being processed.
    let currentLineIndex = 0;

    // Helper function to safely parse an array of string numbers into integers.
    // It logs a warning if any non-numeric data is encountered.
    const parseNumberArray = (stringArray) => {
        const numericValues = stringArray.map(str => parseInt(str, 10));
        // A Type III addition: basic validation for numeric content.
        if (numericValues.some(isNaN)) {
            console.error("Warning: Detected non-numeric data in a sequence. Proceeding with parsed values, NaNs might occur.");
        }
        return numericValues;
    };

    // Loop through the input lines, processing two lines at a time for each sequence.
    // The loop continues as long as there are lines to read.
    while (currentLineIndex < inputLineCollection.length) {
        // Read the first line of a pair, which represents the size of the number sequence.
        const sequenceSizeRaw = inputLineCollection[currentLineIndex++];
        const sequenceSize = parseInt(sequenceSizeRaw, 10);

        // A Type III addition: Check for the termination condition early.
        // A sequence size of 0 indicates the end of input.
        if (sequenceSize === 0) {
            // This explicitly breaks out of the processing loop when the sentinel value is found.
            break;
        }

        // The input format implies that 'sequenceSize' is the number of differences to calculate.
        // Therefore, the actual numeric sequence will contain 'sequenceSize + 1' elements.
        const sequenceValueCount = sequenceSize + 1; // Total number of elements in the sequence.

        // Read the second line of the pair, which contains the space-separated numbers.
        const numericSequenceStrings = inputLineCollection[currentLineIndex++].trim().split(" ");

        // Convert the string array of numbers into an array of actual integers.
        // This is a Type III change to avoid repeated parseInt calls later.
        const parsedNumbers = parseNumberArray(numericSequenceStrings);

        // Initialize an array to store the differences between consecutive numbers.
        // We use 1-based indexing for this array to match the original logic's 'map' usage.
        // The array will hold 'sequenceSize' differences (from index 1 to sequenceSize).
        const differenceArray = Array.from({ length: sequenceValueCount }).fill(0); // Size n+1, indices 0 to n.

        // Calculate the differences between adjacent elements in the parsed sequence.
        // differenceArray[k] = parsedNumbers[k] - parsedNumbers[k-1].
        for (let diffIndex = 1; diffIndex <= sequenceSize; ++diffIndex) {
            differenceArray[diffIndex] = parsedNumbers[diffIndex] - parsedNumbers[diffIndex - 1];
        }

        // --- Start of core logic: Identifying the outlier in an arithmetic progression ---

        // Helper function (Type III addition) to check if a segment of the difference array
        // consists of consistent (equal) values.
        const areDifferencesConsistent = (startIndex, endIndex, comparisonValue = null) => {
            // Guard clause for invalid ranges (Type III addition).
            if (startIndex > endIndex || startIndex < 1 || endIndex > sequenceSize) {
                // If the range is invalid or empty, it's vacuously consistent for this problem.
                // Or, depending on strictness, could return false or throw.
                // For the problem context, we assume checks are within bounds.
                return false; // Indicating an invalid check for this problem's logic.
            }
            const baseValue = (comparisonValue !== null) ? comparisonValue : differenceArray[startIndex];
            for (let k = startIndex; k <= endIndex; ++k) {
                if (differenceArray[k] !== baseValue) {
                    return false;
                }
            }
            return true;
        };

        // Condition 1: The first four differences are consistent.
        // This implies a pattern like D, D, D, D, X, D, D...
        if (areDifferencesConsistent(1, 4)) {
            const commonDifference = differenceArray[1]; // Store the common difference (Type III addition).
            let outlierCandidateIndex = 5; // Start checking from the 5th difference.

            // Iterate to find the first difference that breaks the common pattern.
            while (outlierCandidateIndex <= sequenceSize && differenceArray[outlierCandidateIndex] === commonDifference) {
                outlierCandidateIndex++;
            }

            // If an outlier difference was found (i.e., the loop didn't run to completion without finding one).
            if (outlierCandidateIndex <= sequenceSize) {
                // The element at 'outlierCandidateIndex' in the original sequence is the outlier.
                console.log(numericSequenceStrings[outlierCandidateIndex]);
            } else {
                // Type III addition: This scenario implies all differences were consistent up to the end.
                // In typical problem statements for this type, an outlier is always guaranteed.
                // This branch might indicate malformed input or an unexpected sequence.
                // For robustness, we could print the last element or an error.
                // The original code would print dataset[ii] where ii is end (n+1), which is out of bounds.
                // Given problem context, this path should ideally not be reached.
                console.error("Error: All differences were consistent. No outlier found by pattern 1.");
            }
        }
        // Condition 2: The second through fourth differences are consistent, but the first is not.
        // Pattern: X, D, D, D... (implies parsedNumbers[0] is the outlier).
        else if (areDifferencesConsistent(2, 4)) {
            console.log(numericSequenceStrings[0]);
        }
        // Condition 3: The first through third differences are consistent, but the fourth is not.
        // Pattern: D, D, D, X... (implies parsedNumbers[4] is the outlier).
        else if (areDifferencesConsistent(1, 3)) {
            console.log(numericSequenceStrings[4]);
        }
        // Condition 4: A more complex pattern where parsedNumbers[1] is the outlier.
        // Checks if (parsedNumbers[2] - parsedNumbers[0]) is the common difference,
        // and this common difference also matches differenceArray[3] and differenceArray[4].
        // This implies the sequence: A, (A+D_outlier), A+D, A+2D, A+3D.
        else if ((parsedNumbers[2] - parsedNumbers[0]) === differenceArray[3] && differenceArray[3] === differenceArray[4]) {
            console.log(numericSequenceStrings[1]);
        }
        // Condition 5: Another complex pattern where parsedNumbers[3] is the outlier.
        // Checks if differenceArray[1] and differenceArray[2] are consistent,
        // and this common difference also matches (parsedNumbers[4] - parsedNumbers[2]).
        // This implies the sequence: A, A+D, A+2D, (A+2D_outlier), A+3D.
        else if (differenceArray[1] === differenceArray[2] && differenceArray[2] === (parsedNumbers[4] - parsedNumbers[2])) {
            console.log(numericSequenceStrings[3]);
        }
        // Condition 6: Final complex pattern where parsedNumbers[2] is the outlier.
        // Checks if differenceArray[1] is consistent with (parsedNumbers[3] - parsedNumbers[1]),
        // and also with differenceArray[4].
        // This implies the sequence: A, A+D, (A+D_outlier), A+2D, A+3D.
        else if (differenceArray[1] === (parsedNumbers[3] - parsedNumbers[1]) && differenceArray[1] === differenceArray[4]) {
            console.log(numericSequenceStrings[2]);
        }
        // Type III addition: Fallback for cases not covered by the defined patterns.
        // This could occur with malformed input or if the outlier pattern is different.
        else {
            console.error("Error: No known outlier pattern matched for the current sequence. Sequence size:", sequenceSize);
            // In a production scenario, one might log the entire sequence for debugging
            // or provide a default output based on problem specifics.
            // For this exercise, an error message suffices to demonstrate a new fragment.
        }
    }
});