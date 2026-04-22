function calculateGreatestCommonDivisor(firstOperand, secondOperand) {
    if (secondOperand === 0) {
        return firstOperand;
    }
    return calculateGreatestCommonDivisor(secondOperand, firstOperand % secondOperand);
}

function processDataSet(fullInputPayload) {
    const dataLines = fullInputPayload.trim().split('\n');
    const numericElements = dataLines[1].split(' ').map(elementString => parseInt(elementString, 10));

    const finalResult = numericElements.reduce((currentCommon, nextValue) => {
        return calculateGreatestCommonDivisor(currentCommon, nextValue);
    });

    console.log(finalResult);
}
processDataSet(require("fs").readFileSync("/dev/stdin", "utf8"));