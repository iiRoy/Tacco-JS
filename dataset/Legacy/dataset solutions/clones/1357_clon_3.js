function processInput (rawData) {
    const numericValues = rawData.split(" ").map(Number);

    const firstOperand = numericValues[0];
    const secondOperand = numericValues[1];

    if (firstOperand < secondOperand) {
        console.log("a < b");
    } else if (firstOperand === secondOperand) {
        console.log("a == b");
    } else {
        console.log("a > b");
    }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
