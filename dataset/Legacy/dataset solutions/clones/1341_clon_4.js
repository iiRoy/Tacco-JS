function computeModularExponent(baseVal, exponentVal, modulusVal) {
    let finalResult = 1;
    let currentBase = baseVal % modulusVal;

    while (exponentVal > 0) {
        if (exponentVal % 2 === 1) {
            finalResult = (finalResult * currentBase) % modulusVal;
        }
        currentBase = (currentBase * currentBase) % modulusVal;
        exponentVal = Math.floor(exponentVal / 2);
    }
    return finalResult;
}

const fileSystem = require('fs');
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const numericValues = rawData.trim().split(" ").map(Number);
const fixedModulus = 1000000007;

console.log(computeModularExponent(numericValues[0], numericValues[1], fixedModulus));
