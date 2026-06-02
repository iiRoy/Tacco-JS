function findDivisor(valA, valB) {
    while (valB !== 0) {
        let tempVal = valB;
        valB = valA % valB;
        valA = tempVal;
    }
    return valA;
}

function computeMultiple(valX, valY) {
    if (valX === 0 || valY === 0) {
        return 0;
    }
    return (valX * valY) / findDivisor(valX, valY);
}

function processInput(rawText) {
    const numericValues = rawText.split('\n').map(Number);

    const calculationTargets = numericValues.slice(1);

    const finalResult = calculationTargets.reduce(computeMultiple);

    console.log(finalResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
