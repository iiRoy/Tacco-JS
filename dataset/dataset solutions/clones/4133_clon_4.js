function processInputAndCalculate(rawInputString) {
    const configValues = rawInputString.split(' ').map(Number);
    const [upperLimit, minDigitSum, maxDigitSum] = configValues;

    const calculateDigitSum = (valueToSum) => {
        return String(valueToSum)
            .split('')
            .map(Number)
            .reduce((accumulator, digit) => accumulator + digit, 0);
    };

    const finalAccumulation = Array.from({ length: upperLimit }, (_, index) => index + 1)
        .filter(currentNumber => {
            const currentDigitSum = calculateDigitSum(currentNumber);
            return currentDigitSum >= minDigitSum && currentDigitSum <= maxDigitSum;
        })
        .reduce((totalSum, validNumber) => totalSum + validNumber, 0);

    console.log(finalAccumulation);
}

processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8'));
