/*
 * This JavaScript module calculates the maximum possible product of K elements
 * chosen from a given array of N integers. It uses BigInt for modulo arithmetic
 * to handle potentially very large numbers. Input is read from standard input.
 */
console.log((rawInput => {
    const [[totalCount, chooseCount], values] = rawInput
        .trim()
        .split('\n')
        .map(line => line.split(' ').map(item => item | 0));

    let negativeList = [];
    let positiveList = [];
    let zeroCount = 0;

    for (let index = 0; index < totalCount; index++) {
        if (values[index] > 0) {
            positiveList.push(values[index]);
        }

        if (values[index] < 0) {
            negativeList.push(values[index]);
        }

        if (values[index] === 0) {
            zeroCount++;
        }
    }

    if (chooseCount + zeroCount > totalCount) {
        return '0';
    }

    const MOD_VALUE = BigInt(1e9 + 7);
    const multiplyMod = (left, right) =>
        (BigInt(left) * BigInt(right) % MOD_VALUE + MOD_VALUE) % MOD_VALUE;

    negativeList.sort((left, right) => left - right);
    positiveList.sort((left, right) => right - left);

    if (positiveList.length === 0 && chooseCount&1) {
        return zeroCount
            ? '0'
            : `${negativeList.slice(-chooseCount).reduce(multiplyMod, 1)}`;
    }

    let negIndex = 0;
    let posIndex = 0;
    let pickedPositives = [];
    let pickedNegatives = [];
    let previousPicked = [0, 0];

    for (let step = 0; step < chooseCount; step++) {
        if ((positiveList[posIndex] | 0) > -(negativeList[negIndex] | 0)) {
            pickedPositives.push(positiveList[posIndex]);
            previousPicked[0] = positiveList[posIndex];
            posIndex++;
        } else {
            pickedNegatives.push(negativeList[negIndex]);
            previousPicked[1] = negativeList[negIndex];
            negIndex++;
        }
    }

    if (pickedNegatives.length & 1) {
        if (
            pickedNegatives.length === negativeList.length ||
            positiveList[posIndex] > -negativeList[negIndex]
        ) {
            pickedNegatives.pop();
            pickedPositives.push(positiveList[posIndex]);
        } else {
            pickedPositives.pop();
            pickedNegatives.push(negativeList[negIndex]);
        }
    }

    return `${multiplyMod(
        pickedPositives.reduce(multiplyMod, 1),
        pickedNegatives.reduce(multiplyMod, 1)
    )}`;
})(require('fs').readFileSync('/dev/stdin', 'utf8')));