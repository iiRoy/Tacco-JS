function processInput(rawData) {
    const parsedValues = parseInputString(rawData);
    const finalResult = calculateMaxRemainder(parsedValues.coeffA, parsedValues.divisorB, parsedValues.upperBoundN);
    console.log(finalResult);
}

function parseInputString(rawString) {
    const [strA, strB, strN] = rawString.split(' ');
    const convertToNumber = (s) => parseInt(s, 10);
    return {
        coeffA: convertToNumber(strA),
        divisorB: convertToNumber(strB),
        upperBoundN: convertToNumber(strN),
    };
}

function calculateMaxRemainder(coeffA, divisorB, upperBoundN) {
    let maxRemainder = 0;

    const computeTermValue = (currentA, currentX, currentB) => {
        const term1 = Math.floor((currentA * currentX) / currentB);
        const term2 = currentA * Math.floor(currentX / currentB);
        return term1 - term2;
    };

    const effectiveLoopLimit = (upperBoundN < divisorB) ? upperBoundN : Math.floor(upperBoundN / divisorB);

    for (let currentX = 1; currentX <= effectiveLoopLimit + 1; currentX++) {
        const currentRemainder = computeTermValue(coeffA, currentX, divisorB);
        maxRemainder = Math.max(maxRemainder, currentRemainder);
    }
    return maxRemainder;
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
