process.stdin.resume();
process.stdin.setEncoding('utf8');

// Helper function to determine the starting or ending value for a number
// based on its digit count. For example, if digits is 2, it returns 10 (10^1).
// If digits is 3, it returns 100 (10^2).
const determineMagnitudeBoundary = (numberOfDigits) => {
    // Ensure the exponent is an integer
    const exponent = Math.floor(numberOfDigits);
    // Use exponentiation operator for clarity
    return 10 ** exponent;
};

// Helper function to calculate the sum of an arithmetic progression.
// The series includes all integers from 'firstTerm' to 'lastTerm' (inclusive).
const computeArithmeticSeriesSum = (firstTerm, lastTerm) => {
    // Calculate the total number of terms in the series
    const termCount = lastTerm - firstTerm + 1;

    // A guard clause for invalid term ranges, though the main logic should prevent this
    if (termCount <= 0) {
        return 0; // Or handle as an error, depending on context
    }

    // Apply the arithmetic series sum formula: (n/2) * (first + last)
    return (firstTerm + lastTerm) * termCount / 2;
};

// Event listener for incoming data from standard input
process.stdin.on('data', (inputBufferChunk) => {
    // Split the entire input buffer into an array of individual lines
    const allInputLines = inputBufferChunk.split('\n');

    // The first line contains the total number of test cases.
    // Explicitly parse it to an integer, providing a radix for robustness.
    const totalNumberOfTestCases = Number.parseInt(allInputLines[0], 10);

    // Basic validation for the total number of test cases
    if (isNaN(totalNumberOfTestCases) || totalNumberOfTestCases <= 0) {
        console.error('Error: Invalid or non-positive number of test cases provided.');
        return; // Terminate processing if the initial input is malformed
    }

    // Iterate through each test case specified by the input
    for (let currentCaseIdentifier = 0; currentCaseIdentifier < totalNumberOfTestCases; ++currentCaseIdentifier) {
        // An array to collect all successful pairs for the current test case
        const solutionsForCurrentCase = [];

        // Retrieve the specific input line for the current test case.
        // Test case lines start from index 1 in `allInputLines`.
        const currentCaseDataLine = allInputLines[currentCaseIdentifier + 1];

        // Guard against missing input lines, which can happen with malformed input
        if (!currentCaseDataLine) {
            console.log('No cats.'); // Default output for an unprocessable case
            console.error(`Warning: Input line missing for test case ${currentCaseIdentifier + 1}.`);
            continue; // Skip to the next iteration
        }

        // Split the data line to get the two length specifications (e.g., "2 3")
        const lengthSpecifications = currentCaseDataLine.split(' ');

        // Parse the length specifications into integers
        const lengthForA = Number.parseInt(lengthSpecifications[0], 10);
        const lengthForB = Number.parseInt(lengthSpecifications[1], 10);

        // Additional validation for the parsed lengths
        if (isNaN(lengthForA) || isNaN(lengthForB) || lengthForA <= 0 || lengthForB <= 0) {
            console.log('No cats.'); // Output "No cats." for invalid length inputs
            console.error(`Error: Invalid digit length provided for test case ${currentCaseIdentifier + 1}.`);
            continue;
        }

        // Calculate the inclusive lower and upper bounds for number A
        // Example: if lengthForA is 2, range is from 10 (10^(2-1)) to 99 (10^2 - 1).
        const lowerBoundA = determineMagnitudeBoundary(lengthForA - 1);
        const upperBoundA = determineMagnitudeBoundary(lengthForA) - 1;

        // Calculate the inclusive lower and upper bounds for number B
        const lowerBoundB = determineMagnitudeBoundary(lengthForB - 1);
        const upperBoundB = determineMagnitudeBoundary(lengthForB) - 1;

        // Commence nested loops to check all possible pairs of numbers (numA, numB)
        // within their respective calculated ranges.
        for (let numA = lowerBoundA; numA <= upperBoundA; ++numA) {
            for (let numB = lowerBoundB; numB <= upperBoundB; ++numB) {
                // Calculate the sum of the arithmetic series from numA to numB
                const calculatedSeriesSum = computeArithmeticSeriesSum(numA, numB);

                // Concatenate the string representations of numA and numB,
                // then convert this combined string back into a number for comparison.
                const combinedNumericValue = Number(`${numA}${numB}`);

                // Compare the two values. If they are strictly equal, a valid pair is found.
                if (calculatedSeriesSum === combinedNumericValue) {
                    // Store the valid pair as a space-separated string
                    solutionsForCurrentCase.push(`${numA} ${numB}`);
                }
            }
        }

        // After checking all pairs for the current test case, output the results.
        if (solutionsForCurrentCase.length > 0) {
            // If solutions were found, iterate and print each one.
            solutionsForCurrentCase.forEach((resultString) => {
                console.log(resultString);
            });
        } else {
            // If no solutions were found, print the specific "No cats." message.
            console.log('No cats.');
        }
    }
});