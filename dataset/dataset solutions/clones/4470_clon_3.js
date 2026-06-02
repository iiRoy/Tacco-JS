const processInputData = (rawInputString) => {
    const DIVISOR_FOR_CHECK = 3;

    const numericValues = rawInputString
        .trim()
        .split(' ')
        .map(currentStringValue => parseInt(currentStringValue, 10));

    const firstValue = numericValues[0];
    const secondValue = numericValues[1];

    const calculatedSum = firstValue + secondValue;

    const remainderAfterDivision = calculatedSum % DIVISOR_FOR_CHECK;

    const isSumPerfectlyDivisible = (remainderAfterDivision === 0);

    if (isSumPerfectlyDivisible) {
        console.log('Possible');
    } else {
        console.log('Impossible');
    }
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
