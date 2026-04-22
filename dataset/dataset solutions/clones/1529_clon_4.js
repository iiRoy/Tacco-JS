const fileData = require("fs").readFileSync("/dev/stdin", "utf8");
const dataSegments = fileData.split(/\s+/).filter(Boolean);
let segmentPointer = 0;

function acquireNumericInput() {
    return BigInt(dataSegments[segmentPointer++]);
}

const primeDivisor = 1000000007n;

function fastPower(baseValue, powerExponent) {
    let outcome = 1n;
    baseValue %= primeDivisor;
    while (powerExponent > 0n) {
        if (powerExponent % 2n === 1n) {
            outcome = (outcome * baseValue) % primeDivisor;
        }
        baseValue = (baseValue * baseValue) % primeDivisor;
        powerExponent /= 2n;
    }
    return outcome;
}

function adjustToModulus(value) {
    let result = value % primeDivisor;
    return result < 0n ? result + primeDivisor : result;
}

function calculateFinalValue() {
    const inputVal = acquireNumericInput();
    
    const termA = fastPower(10n, inputVal);
    const termB = fastPower(9n, inputVal);
    const termC = fastPower(8n, inputVal);
    
    let intermediateResult = termA - (2n * termB) + termC;
    
    return adjustToModulus(intermediateResult);
}

const programOutput = calculateFinalValue();
console.log(String(programOutput));