(function(rawInputData) {
    const NEWLINE_DELIMITER = '\n';
    const TERMINATION_VALUE = 0;
    const EMPTY_STRING_FOR_SPLIT = '';

    const calculateDigitSum = (numericValue) => {
        const digitCharacters = String(numericValue).split(EMPTY_STRING_FOR_SPLIT);
        const parsedDigits = digitCharacters.map(Number);
        const sumOfDigits = parsedDigits.reduce((sumAccumulator, currentDigitValue) => sumAccumulator + currentDigitValue, 0);
        return sumOfDigits;
    };

    const inputLines = rawInputData.split(NEWLINE_DELIMITER);

    for (let lineIndex = 0; lineIndex < inputLines.length; ++lineIndex) {
        const lineContent = inputLines[lineIndex];
        const currentNumericValue = Number(lineContent);

        if (currentNumericValue === TERMINATION_VALUE) {
            return;
        }

        const resultSum = calculateDigitSum(currentNumericValue);
        console.log(resultSum);
    }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
