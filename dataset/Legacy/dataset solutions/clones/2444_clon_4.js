function processInput(inputString) {
    const numericValue = parseInt(inputString, 10);
    const calculatedResult = (numericValue - 1) >> 1;
    console.log(calculatedResult);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
