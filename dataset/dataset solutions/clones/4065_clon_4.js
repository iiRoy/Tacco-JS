function processInputData(rawDataString) {
    const numericComponents = rawDataString.split(' ').map(Number);
    const firstOperand = numericComponents[0];
    const secondOperand = numericComponents[1];

    const firstParity = firstOperand % 2;
    const secondParity = secondOperand % 2;

    const outcomeMap = {
        '00': 'Even',
        '01': 'Even',
        '10': 'Even',
        '11': 'Odd'
    };

    const key = String(firstParity) + String(secondParity);
    console.log(outcomeMap[key]);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
