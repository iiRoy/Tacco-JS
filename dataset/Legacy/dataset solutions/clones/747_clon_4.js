const transformValue = (val) => (val < 10 ? val : val - 9);

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = fileContent.trim().split("\n");

const [_, idString, __, numListString] = lines;

const identifierChars = idString.split("");
const numericValues = numListString.split(" ").map(Number);

const { multipliers, initialSum } = identifierChars.reduce(
    (acc, char, idx) => {
        if (char === "*") {
            acc.multipliers.push(idx % 2 === 0 ? 1 : 2);
        } else {
            const digit = Number(char);
            acc.initialSum += idx % 2 === 0 ? digit : transformValue(digit * 2);
        }
        return acc;
    },
    { multipliers: [], initialSum: 0 }
);

let currentDpState = Array(100).fill(0);
currentDpState[0] = 1;

const finalDpState = multipliers.reduce((prevDp, currentMultiplier) => {
    const nextDp = Array(100).fill(0);
    for (let s = 0; s < 100; s++) {
        if (prevDp[s] > 0) {
            for (const aryVal of numericValues) {
                const contribution = transformValue(aryVal * currentMultiplier);
                const newSum = s + contribution;
                if (newSum < 100) {
                    nextDp[newSum] += prevDp[s];
                }
            }
        }
    }
    return nextDp;
}, currentDpState);

const finalAnswer = finalDpState.reduce((acc, count, s) => {
    if ((initialSum + s) % 10 === 0) {
        return acc + count;
    }
    return acc;
}, 0);

console.log(finalAnswer);
