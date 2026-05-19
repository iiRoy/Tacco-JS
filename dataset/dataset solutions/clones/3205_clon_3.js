const getRawInput = () => require('fs').readFileSync('/dev/stdin', 'utf8');

const parseNumericInput = (inputString) => {
    const stringParts = inputString.split(' ');
    return stringParts.map(Number);
};

const executeCalculationAndDisplay = (currentK, currentA, currentB) => {
    let finalComputedValue;
    const firstThreshold = currentA + 1;
    const secondThreshold = currentA + 2;

    if (currentK < firstThreshold || currentB <= secondThreshold) {
        finalComputedValue = currentK + 1;
    } else {
        const diffBMinusA = currentB - currentA;
        const kMinusAComponent = currentK - currentA;
        const kMinusAPlusOneComponent = kMinusAComponent + 1;

        if (kMinusAPlusOneComponent % 2 === 0) {
            finalComputedValue = currentA + (diffBMinusA * kMinusAPlusOneComponent) / 2;
        } else {
            finalComputedValue = currentA + (diffBMinusA * kMinusAComponent) / 2 + 1;
        }
    }
    console.log(finalComputedValue);
};

const rawDataString = getRawInput();
const [valK, valA, valB] = parseNumericInput(rawDataString);

executeCalculationAndDisplay(valK, valA, valB);
