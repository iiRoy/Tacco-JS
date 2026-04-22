function calculateAverageCeiling(dataInput) {
    let numericParts = [];
    let currentSegment = '';
    for (let k = 0; k < dataInput.length; ++k) {
        let symbol = dataInput[k];
        if (symbol >= '0' && symbol <= '9') {
            currentSegment += symbol;
        } else if (currentSegment.length > 0) {
            numericParts.push(Number(currentSegment));
            currentSegment = '';
            if (numericParts.length === 2) break;
        }
    }
    if (currentSegment.length > 0 && numericParts.length < 2) {
        numericParts.push(Number(currentSegment));
    }

    const firstOperand = numericParts[0];
    const secondOperand = numericParts[1];

    let totalSum = firstOperand + secondOperand;
    let finalEvaluation;

    if (totalSum % 2 === 0) {
        finalEvaluation = totalSum / 2;
    } else {
        finalEvaluation = (totalSum + 1) / 2;
    }

    return finalEvaluation.toString();
}

const sourceContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');
console.log(calculateAverageCeiling(sourceContent));