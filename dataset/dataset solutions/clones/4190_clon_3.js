function ProcessInput(inputString) {
    const RADIX_DECIMAL = 10;

    const numericValue = parseInt(inputString, RADIX_DECIMAL);

    function computeDigitSum(numVal) {
        const numberAsString = numVal.toString();
        const digitCharacters = numberAsString.split('');
        const digitsAsNumbers = digitCharacters.map(digitChar => parseInt(digitChar, RADIX_DECIMAL));
        const sumOfDigits = digitsAsNumbers.reduce((accumulator, currentDigit) => accumulator + currentDigit, 0);
        return sumOfDigits;
    }

    const sumOfDigitsOfN = computeDigitSum(numericValue);

    const isDivisibleBySum = (numericValue % sumOfDigitsOfN === 0);

    if (isDivisibleBySum) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
