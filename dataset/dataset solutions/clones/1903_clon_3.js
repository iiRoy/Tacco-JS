const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");

const inputLines = rawInputData.split('\n');
const targetValue = Number(inputLines[0]);

const EXPONENT_VAL = 5;
let fifthPowers = [0, 1];

const upperBound = targetValue * targetValue;
let currentPowerIndex = 2;

while (true) {
    const lastCalculatedPower = fifthPowers[fifthPowers.length - 1];
    if (lastCalculatedPower >= upperBound) {
        break;
    }
    const nextCalculatedPower = Math.pow(currentPowerIndex, EXPONENT_VAL);
    fifthPowers.push(nextCalculatedPower);
    currentPowerIndex++;
}

function findPowerPair(targetNum, powersArr) {
    for (let outerIdx = 0; outerIdx < powersArr.length; outerIdx++) {
        const valueA = powersArr[outerIdx];
        for (let innerIdx = 0; innerIdx < powersArr.length; innerIdx++) {
            const valueB = powersArr[innerIdx];

            const differenceResult = valueA - valueB;
            const sumResult = valueA + valueB;

            if (differenceResult === targetNum) {
                console.log(outerIdx, innerIdx);
                return;
            } else if (sumResult === targetNum) {
                console.log(outerIdx, -innerIdx);
                return;
            }
        }
    }
}

findPowerPair(targetValue, fifthPowers);
