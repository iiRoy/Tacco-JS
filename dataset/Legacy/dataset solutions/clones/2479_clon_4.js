function obtainPrimeFactors(initialValue) {
    const factorizeRecursive = (currentNum, currentDivisor, collectedFactors) => {
        if (currentNum <= 1) {
            return collectedFactors;
        }

        if (currentDivisor * currentDivisor > currentNum) {
            if (currentNum > 1) {
                collectedFactors.push(currentNum);
            }
            return collectedFactors;
        }

        if (currentNum % currentDivisor === 0) {
            collectedFactors.push(currentDivisor);
            return factorizeRecursive(currentNum / currentDivisor, currentDivisor, collectedFactors);
        } else {
            return factorizeRecursive(currentNum, currentDivisor + 1, collectedFactors);
        }
    };

    return factorizeRecursive(initialValue, 2, []);
}

function processInputAndCompute(rawInput) {
    const cleanedInput = rawInput.trim();
    const firstLineContent = cleanedInput.split('\n')[0];
    const [valA, valB, valX] = firstLineContent.split(' ').map(Number);

    const numeratorExpression = valA * Math.pow(valB, 2);
    const denominatorExpression = valX * 2;
    const atanArgument = numeratorExpression / denominatorExpression;

    const angleInRadians = Math.atan(atanArgument);
    const radiansToDegreesConversionFactor = 180 / Math.PI;

    const finalCalculatedResult = angleInRadians * radiansToDegreesConversionFactor;

    console.log(finalCalculatedResult);
}

processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));
