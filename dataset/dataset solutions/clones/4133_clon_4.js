const processNumericalInput = (rawInputContent) => {
    const [limitValue, minDigitSum, maxDigitSum] = rawInputContent.trim().split(' ').map(Number);

    const determineDigitSum = (numericValue) =>
        String(numericValue)
            .split('')
            .reduce((accumulatedSum, digitChar) => accumulatedSum + Number(digitChar), 0);

    const numbersMeetingCriteria = Array.from({ length: limitValue }, (_, index) => index + 1)
        .filter(currentNumber => {
            const digitSumResult = determineDigitSum(currentNumber);
            return digitSumResult >= minDigitSum && digitSumResult <= maxDigitSum;
        });

    const overallTotal = numbersMeetingCriteria.reduce((runningTotal, qualifiedNumber) => runningTotal + qualifiedNumber, 0);

    console.log(overallTotal);
};

processNumericalInput(require('fs').readFileSync('/dev/stdin', 'utf8'));