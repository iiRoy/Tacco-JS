const calculateMagnitudeStart = (digitCount) => {
    const flooredDigitCount = Math.floor(digitCount);
    // This function determines the smallest number with a given number of digits.
    // For example, for 2 digits, it returns 10 (10^1). For 3 digits, 100 (10^2).
    return Math.pow(10, flooredDigitCount - 1);
};

const getArithmeticSeriesSum = (startTerm, endTerm) => {
    // Computes the sum of an arithmetic progression from startTerm to endTerm (inclusive).
    // Formula: (number of terms / 2) * (first term + last term)
    const numberOfTerms = endTerm - startTerm + 1;
    return (startTerm + endTerm) * numberOfTerms / 2;
};

const concatenateAndParse = (num1, num2) => {
    // Concatenates two numbers as strings and then parses the result back to an integer.
    // Example: concatenateAndParse(12, 34) returns 1234.
    return parseInt(`${num1}${num2}`, 10);
};

const NO_SOLUTIONS_MESSAGE = 'No creatures found.';

// Initialize standard input stream handling
const inputSource = process.stdin;
inputSource.setEncoding('utf8');
inputSource.resume();

let fullInputData = '';

// Accumulate all incoming data chunks
inputSource.on('data', (inputChunk) => {
    fullInputData += inputChunk;
});

// Process the entire input once the stream has ended
inputSource.on('end', () => {
    const inputLines = fullInputData.split('\n').filter(line => line.trim() !== '');

    if (inputLines.length === 0) {
        console.error("Error: No input data was provided.");
        return;
    }

    const numberOfTestCasesStr = inputLines[0];
    const numberOfTestCases = parseInt(numberOfTestCasesStr, 10);

    if (isNaN(numberOfTestCases) || numberOfTestCases < 0) {
        console.error(`Input parsing error: Invalid number of test cases specified: "${numberOfTestCasesStr}"`);
        return;
    }

    // Iterate through each specified test case
    for (let currentCaseIndex = 0; currentCaseIndex < numberOfTestCases; ++currentCaseIndex) {
        const currentCaseInputLine = inputLines[currentCaseIndex + 1];

        if (!currentCaseInputLine) {
            console.error(`Warning: Missing input line for test case ${currentCaseIndex + 1}. This case will be skipped.`);
            continue;
        }

        const digitLengthParameters = currentCaseInputLine.split(' ');

        if (digitLengthParameters.length !== 2) {
            console.error(`Error: Test case ${currentCaseIndex + 1} has incorrect number of parameters. Expected 2, got ${digitLengthParameters.length}.`);
            console.log(NO_SOLUTIONS_MESSAGE);
            continue;
        }

        const firstNumDigits = parseInt(digitLengthParameters[0], 10);
        const secondNumDigits = parseInt(digitLengthParameters[1], 10);

        if (isNaN(firstNumDigits) || isNaN(secondNumDigits) || firstNumDigits <= 0 || secondNumDigits <= 0) {
            console.error(`Error: Invalid digit counts provided for test case ${currentCaseIndex + 1}: (${digitLengthParameters[0]}, ${digitLengthParameters[1]}).`);
            console.log(NO_SOLUTIONS_MESSAGE);
            continue;
        }

        const foundSolutionPairs = [];

        // Determine the valid range for the first number (candidateA) based on its digit count
        const lowerBoundA = calculateMagnitudeStart(firstNumDigits);
        const upperBoundA = calculateMagnitudeStart(firstNumDigits + 1) - 1;

        // Determine the valid range for the second number (candidateB) based on its digit count
        const lowerBoundB = calculateMagnitudeStart(secondNumDigits);
        const upperBoundB = calculateMagnitudeStart(secondNumDigits + 1) - 1;

        // Nested loops to iterate through all possible candidate pairs (candidateA, candidateB)
        for (let candidateA = lowerBoundA; candidateA <= upperBoundA; ++candidateA) {
            for (let candidateB = lowerBoundB; candidateB <= upperBoundB; ++candidateB) {
                const calculatedSum = getArithmeticSeriesSum(candidateA, candidateB);
                const concatenatedValue = concatenateAndParse(candidateA, candidateB);

                // Check if the arithmetic sum equals the concatenated value
                if (calculatedSum === concatenatedValue) {
                    foundSolutionPairs.push(`${candidateA} ${candidateB}`);
                }
            }
        }

        // Output results for the current test case
        if (foundSolutionPairs.length > 0) {
            foundSolutionPairs.forEach(pairString => console.log(pairString));
        } else {
            console.log(NO_SOLUTIONS_MESSAGE);
        }
    }
});

// Handle any potential errors during stream operations
inputSource.on('error', (err) => {
    console.error("An unexpected error occurred with the input stream:", err);
});