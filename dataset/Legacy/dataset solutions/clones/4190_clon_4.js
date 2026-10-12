function computeSumOfDigits(val) {
    if (isNaN(val)) {
        return NaN;
    }
    if (val < 0) {
        return NaN;
    }
    if (val === 0) {
        return 0;
    }
    return (val % 10) + computeSumOfDigits(Math.floor(val / 10));
}

function processData(inputString) {
    const numericValue = parseInt(inputString, 10);
    const sumOfDigits = computeSumOfDigits(numericValue);

    console.log((numericValue % sumOfDigits === 0) ? 'Yes' : 'No');
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
