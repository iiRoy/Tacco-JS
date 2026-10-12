process.stdin.resume();
process.stdin.setEncoding('utf8');

// Helper function to compute powers of 10
const calculatePowerOfTen = (exponentValue) => Math.pow(10, Math.floor(exponentValue));

// Declare variables for managing input and test cases
let totalTestCasesCount;
let inputDataLines;

process.stdin.on('data', (receivedInputBuffer) => {
    inputDataLines = receivedInputBuffer.split('\n');
    totalTestCasesCount = parseInt(inputDataLines[0], 10);

    // Process each test case sequentially
    for (let currentCaseIteration = 0; currentCaseIteration < totalTestCasesCount; ++currentCaseIteration) {
        const currentCaseInputString = inputDataLines[currentCaseIteration + 1];
        const numberDimensions = currentCaseInputString.split(' ');

        const firstNumberDigitCount = parseInt(numberDimensions[0], 10);
        const secondNumberDigitCount = parseInt(numberDimensions[1], 10);

        // Determine the inclusive lower bound for the first number
        const firstNumLowerBound = calculatePowerOfTen(firstNumberDigitCount - 1);
        // Determine the exclusive upper bound for the first number (original loop was < am, where am = 10^D - 1)
        const firstNumUpperLimitExclusive = calculatePowerOfTen(firstNumberDigitCount) - 1;

        // Determine the inclusive lower bound for the second number
        const secondNumLowerBound = calculatePowerOfTen(secondNumberDigitCount - 1);
        // Determine the exclusive upper bound for the second number
        const secondNumUpperLimitExclusive = calculatePowerOfTen(secondNumberDigitCount) - 1;

        let matchingPairsFound = 0;

        // Iterate through possible values for the first number
        for (let currentFirstNumber = firstNumLowerBound; currentFirstNumber < firstNumUpperLimitExclusive; ++currentFirstNumber) {
            // Iterate through possible values for the second number
            for (let currentSecondNumber = secondNumLowerBound; currentSecondNumber < secondNumUpperLimitExclusive; ++currentSecondNumber) {

                // Calculate the left-hand side of the given mathematical condition
                const lhsCalculationResult = (currentSecondNumber * currentSecondNumber + currentSecondNumber - currentFirstNumber * currentFirstNumber + currentFirstNumber) / 2;

                // Form the concatenated string of the two numbers
                const concatenatedNumberString = String(currentFirstNumber) + String(currentSecondNumber);
                // Convert the concatenated string to an integer for comparison
                const rhsParsedValue = parseInt(concatenatedNumberString, 10);

                // Check if the condition holds true
                if (lhsCalculationResult === rhsParsedValue) {
                    console.log(`${currentFirstNumber} ${currentSecondNumber}`);
                    matchingPairsFound++;
                }
            }
        }

        // If no pairs were found for the current test case, print the specific message
        if (matchingPairsFound === 0) {
            console.log('No cats.');
        }
    }
});
