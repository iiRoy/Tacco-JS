const MAX_VAL = 100000;

const triangularSequence = Array.from({ length: MAX_VAL }, (_, idx) => (idx + 1) * (idx + 2) / 2);

const cumulativeSums = [1];
let currentSum = 1;
for (let idx = 1; ; idx++) {
    currentSum += triangularSequence[idx];
    if (currentSum > MAX_VAL) {
        break;
    }
    cumulativeSums.push(currentSum);
}

const minCoinsAll = Array.from({ length: MAX_VAL }, () => Number.POSITIVE_INFINITY);
const minCoinsOdd = Array.from({ length: MAX_VAL }, () => Number.POSITIVE_INFINITY);
minCoinsAll[0] = 0;
minCoinsOdd[0] = 0;

for (const coinValue of cumulativeSums) {
    for (let currentTarget = coinValue; currentTarget < MAX_VAL; currentTarget++) {
        minCoinsAll[currentTarget] = Math.min(minCoinsAll[currentTarget], minCoinsAll[currentTarget - coinValue] + 1);
        if (coinValue % 2 === 1) {
            minCoinsOdd[currentTarget] = Math.min(minCoinsOdd[currentTarget], minCoinsOdd[currentTarget - coinValue] + 1);
        }
    }
}

const fileSystem = require('fs');
const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputNumbers = rawInput.trim().split("\n").map(Number);

for (const inputVal of inputNumbers) {
    if (inputVal === 0) {
        break;
    }
    console.log(`${minCoinsAll[inputVal]} ${minCoinsOdd[inputVal]}`);
}
