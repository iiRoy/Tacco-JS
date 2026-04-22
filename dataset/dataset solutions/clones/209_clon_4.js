let receivedInputData = '';

process.stdin.on('data', (chunkOfData) => {
    receivedInputData += chunkOfData.toString();
});

process.stdin.on('end', () => {
    const processedLines = receivedInputData.trim().split('\n');

    const computeFactorialZeroes = (initialInput, runningTotal = 0) => {
        if (initialInput === 0) { // Base case: if current input becomes zero, stop
            return runningTotal;
        }
        const calculatedQuotient = parseInt(initialInput / 5); // Truncate towards zero, matching original `~~`
        if (calculatedQuotient === 0) { // Another base case: if next quotient is zero, stop
            return runningTotal + calculatedQuotient; // Add the last non-zero quotient
        }
        return computeFactorialZeroes(calculatedQuotient, runningTotal + calculatedQuotient);
    };

    processedLines.forEach((inputLineElement) => {
        const convertedNumericVal = Number(inputLineElement);
        if (convertedNumericVal !== 0) { // Execute only for non-zero inputs, matching original 'j?'
            const finalComputedResult = computeFactorialZeroes(convertedNumericVal);
            process.stdout.write(finalComputedResult + '\n');
        }
    });
});