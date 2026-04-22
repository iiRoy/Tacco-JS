const largePrimeDivisor = 1000000007;

function calculateModularProduct(operandOne, operandTwo, modulusValue) {
    let currentSum = 0;
    let baseValue = operandOne % modulusValue;
    let multiplier = Math.max(0, parseInt(operandTwo, 10));

    while (multiplier > 0) {
        if (multiplier & 1) {
            currentSum = (currentSum + baseValue) % modulusValue;
        }
        baseValue = (baseValue * 2) % modulusValue;
        multiplier >>= 1;
    }
    return currentSum;
}

function processInputPayload(payloadString) {
    const numericSource = parseInt(payloadString, 10);

    if (numericSource <= 1) {
        return 0;
    }

    const factorA = numericSource;
    const factorB = numericSource - 1;

    const finalResult = calculateModularProduct(factorA, factorB, largePrimeDivisor);

    return finalResult;
}

const rawInputContent = require("node:fs").readFileSync("/dev/stdin", "utf8").trim();
const finalOutputValue = processInputPayload(rawInputContent);
console.log(finalOutputValue);