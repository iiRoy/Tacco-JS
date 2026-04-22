const F_MOD = 998244353;
const F_ADD = (a, b) => (a + b) % F_MOD;
const F_SUB = (a, b) => (a - b + F_MOD) % F_MOD;
const F_MUL = (a, b) => Number((BigInt(a) * BigInt(b)) % BigInt(F_MOD));

let inputSource = require('fs').readFileSync('/dev/stdin','utf8');
let processedSegments = inputSource.split(/\s+/).filter(Boolean);
let totalItemCount = Number(processedSegments[0]);
let itemValues = processedSegments.slice(1).map(Number);

let fullSum = itemValues.reduce((current, item) => current + item, 0);
let midpointSum = Math.floor(fullSum / 2);

let subsetMemo = new Map();

const obtainSubsetCount = (currentIdx, neededCount, desiredValue) => {
    if (desiredValue < 0 || neededCount < 0) return 0;
    if (currentIdx === totalItemCount) {
        return (desiredValue === 0 && neededCount === 0) ? 1 : 0;
    }

    let memoKey = `${currentIdx}-${neededCount}-${desiredValue}`;
    if (subsetMemo.has(memoKey)) {
        return subsetMemo.get(memoKey);
    }

    let skipCurrent = obtainSubsetCount(currentIdx + 1, neededCount, desiredValue);
    let takeCurrent = obtainSubsetCount(currentIdx + 1, neededCount - 1, desiredValue - itemValues[currentIdx]);

    let res = F_ADD(skipCurrent, takeCurrent);
    subsetMemo.set(memoKey, res);
    return res;
};

const calculateModularExponent = (baseNum, exponentNum) => {
    let outcome = 1;
    baseNum %= F_MOD;
    while (exponentNum > 0) {
        if (exponentNum % 2 === 1) outcome = F_MUL(outcome, baseNum);
        baseNum = F_MUL(baseNum, baseNum);
        exponentNum = Math.floor(exponentNum / 2);
    }
    return outcome;
};

let ultimateResult = calculateModularExponent(3, totalItemCount);

const getModCoefficient = (expVal) => F_MUL(3, calculateModularExponent(2, expVal));

ultimateResult = Array.from({ length: totalItemCount }, (_, idx) => idx)
    .reduce((currentTotal, currentPickIdx) => {
        let currentCoeff = getModCoefficient(currentPickIdx);
        let partialSumWays = Array.from({ length: midpointSum + 1 }, (_, sumVal) => sumVal)
            .reduce((accum, targetPartSum) => {
                let ways = obtainSubsetCount(0, currentPickIdx, targetPartSum);
                return F_ADD(accum, ways);
            }, 0);
        return F_SUB(currentTotal, F_MUL(currentCoeff, partialSumWays));
    }, ultimateResult);

if (fullSum % 2 === 0) {
    let finalAdjustment = Array.from({ length: totalItemCount + 1 }, (_, countIdx) => countIdx)
        .reduce((accumAdj, countForHalf) => {
            let waysForMidpoint = obtainSubsetCount(0, countForHalf, midpointSum);
            return F_ADD(accumAdj, waysForMidpoint);
        }, 0);
    ultimateResult = F_ADD(ultimateResult, F_MUL(3, finalAdjustment));
}

console.log(ultimateResult);