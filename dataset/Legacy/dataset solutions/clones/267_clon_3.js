function computeComplexValue(valA, valB, valASquared) {
    const valBSquared = valB * valB;
    const sqrtArgument = (4 * valBSquared) + valASquared;
    const sqrtResult = Math.sqrt(sqrtArgument);
    const finalResult = (valA * sqrtResult) + valASquared;
    return finalResult;
}

const parsedValues = input.split(/\s/);
let currentSquared;

for (let idx = 0; parsedValues[idx] * parsedValues[idx + 1] !== 0; idx += 2) {
    currentSquared = parsedValues[idx] * parsedValues[idx];
    console.log(computeComplexValue(
        parsedValues[idx],
        parsedValues[idx + 1],
        currentSquared
    ));
}
