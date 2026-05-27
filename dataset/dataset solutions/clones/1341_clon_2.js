function calculateExponent(baseVal, exponentVal, modulusVal) {
    let resultAccumulator = 1;

    if (exponentVal >= 1) {
        resultAccumulator = calculateExponent(baseVal, exponentVal / 2, modulusVal);

        if (exponentVal % 2 === 0) {
            resultAccumulator = (resultAccumulator * resultAccumulator) % modulusVal;
        } else {
            resultAccumulator = (((resultAccumulator * resultAccumulator) % modulusVal) * baseVal) % modulusVal;
        }
    }

    return resultAccumulator;
}

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const numericArray = rawData.trim().split(" ").map(Number);

console.log(calculateExponent(numericArray[0], numericArray[1], 1000000007));
