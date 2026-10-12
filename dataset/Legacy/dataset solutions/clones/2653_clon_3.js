function determineOutputValue(valA, valB, valC) {
    let selectedResult;
    if (valA > valB && valA > valC) {
        selectedResult = valA;
    } else if (valB > valA && valB > valC) {
        selectedResult = valB;
    } else {
        selectedResult = valC;
    }
    return selectedResult;
}

function processInput(rawData) {
    const inputParts = rawData.split(' ');
    const firstOperandStr = inputParts[0];
    const secondOperandStr = inputParts[1];

    const sumConcatenated = firstOperandStr + secondOperandStr;
    const differenceNumeric = Number(firstOperandStr) - Number(secondOperandStr);
    const productNumeric = Number(firstOperandStr) * Number(secondOperandStr);

    const finalResultToLog = determineOutputValue(sumConcatenated, differenceNumeric, productNumeric);

    console.log(finalResultToLog);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
