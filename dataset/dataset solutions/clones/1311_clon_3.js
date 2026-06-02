(function(rawData) {
    const calculateDigitSum = (numericValue) => {
        const valueAsString = String(numericValue);
        const characterArray = valueAsString.split('');
        const digitArray = characterArray.map(char => Number(char));
        const totalSum = digitArray.reduce((accumulator, currentDigit) => {
            return accumulator + currentDigit;
        }, 0);
        return totalSum;
    };

    const linesArray = rawData.split('\n');

    for (const lineContent of linesArray) {
        const currentNumber = Number(lineContent);

        if (currentNumber === 0) {
            return;
        }

        const resultSum = calculateDigitSum(currentNumber);
        console.log(resultSum);
    }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
