function processInputAndOutput() {
    const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
    const numericElements = decomposeStringIntoNumbers(rawData);

    const firstOperand = numericElements[0];
    const secondDivisor = numericElements[1];
    const upperLimitNum = numericElements[2];

    const finalResult = calculateMaximumFractionalPart(firstOperand, secondDivisor, upperLimitNum);
    console.log(finalResult);
}

function decomposeStringIntoNumbers(textualSource) {
    const numberStrings = textualSource.match(/\d+/g);
    if (!numberStrings || numberStrings.length < 3) {
        throw new Error("Insufficient numeric data in source string.");
    }
    return numberStrings.map(Number);
}

function calculateMaximumFractionalPart(factorA, divisorB, capN) {
    const effectiveXRange = (capN < divisorB ? capN : Math.floor(capN / divisorB)) + 1;

    let ultimateValue;

    if (effectiveXRange >= divisorB) {
        ultimateValue = Math.floor(factorA * (divisorB - 1) / divisorB);
    } else {
        ultimateValue = Math.floor(factorA * effectiveXRange / divisorB);
    }

    return ultimateValue;
}

processInputAndOutput();