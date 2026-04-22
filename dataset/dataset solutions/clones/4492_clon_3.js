// Configure the standard input stream to interpret incoming bytes as UTF-8 characters.
// This is crucial for correct string processing from the console.
process.stdin.setEncoding('utf8');

// Establish an event handler that will be triggered whenever new data
// becomes available for reading from the standard input.
process.stdin.on('readable', function() {
    // Attempt to read a chunk of data from the input buffer.
    // This `rawDataSegment` might contain one or more lines of text.
    let rawDataSegment = process.stdin.read();

    // Only proceed if a valid data segment was actually received (i.e., not null).
    if (rawDataSegment !== null) {
        /**
         * @param {string} inputString - The string to be parsed.
         * @returns {number} The parsed integer value, or 0 if parsing fails.
         * This helper function provides a robust way to convert string parts to numbers.
         */
        const obtainNumericValue = (inputString) => {
            // Attempt to convert the string to an integer using base 10.
            const numericalResult = parseInt(inputString, 10);
            // Check if the result is a valid number. If not, return a default of 0.
            if (isNaN(numericalResult)) {
                return 0;
            }
            return numericalResult;
        };

        // Divide the raw input segment into an array of individual lines.
        // Each element in `processedTextLines` represents one line of input.
        let processedTextLines = rawDataSegment.split('\n');

        // Determine the index of the last line in the array.
        const finalLineIndex = processedTextLines.length - 1;

        // If the last line exists and is empty (after trimming whitespace), remove it.
        // This often occurs when a user presses Enter, adding an empty line.
        if (finalLineIndex >= 0 && processedTextLines[finalLineIndex].trim() === '') {
            processedTextLines.pop();
        }

        // If after cleaning, no meaningful lines remain, exit this processing cycle.
        if (processedTextLines.length === 0) {
            return;
        }

        // Extract the very first line from the array for primary data processing.
        const primaryDataLine = processedTextLines[0];

        // Split the primary data line by spaces and convert each resulting string part
        // into an integer using our `obtainNumericValue` helper.
        let convertedNumbers = primaryDataLine.split(' ').map(obtainNumericValue);

        // Implement a guard clause: ensure we have at least three numbers to perform
        // the required calculations. If not, log an error and stop.
        if (convertedNumbers.length < 3) {
            console.error("Input error: The first line must contain at least three space-separated numbers.");
            return;
        }

        // For better readability, assign the first three significant numbers to distinct variables.
        const firstVal = convertedNumbers[0];
        const secondVal = convertedNumbers[1];
        const thirdVal = convertedNumbers[2];

        // Calculate three different sums, each combining two of the three input numbers.
        let pairwiseSumOne = firstVal + secondVal;   // Sum of the first and second numbers
        let pairwiseSumTwo = secondVal + thirdVal;   // Sum of the second and third numbers
        let pairwiseSumThree = thirdVal + firstVal; // Sum of the third and first numbers

        // Manually determine the smallest among the three calculated sums.
        // Initialize `overallMinimumSum` with the first sum, then compare with others.
        let overallMinimumSum = pairwiseSumOne;

        if (pairwiseSumTwo < overallMinimumSum) {
            overallMinimumSum = pairwiseSumTwo;
        }

        if (pairwiseSumThree < overallMinimumSum) {
            overallMinimumSum = pairwiseSumThree;
        }

        // Display the final computed minimum sum to the standard output.
        console.log(overallMinimumSum);
    }
});