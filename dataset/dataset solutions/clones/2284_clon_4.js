"use strict";

function processInput(sourceData) {
    const digitCount = Number.parseInt(sourceData[0]);
    let firstLimit = Number.parseInt(sourceData[1].replace(/\s/g, ''));
    let secondLimit = Number.parseInt(sourceData[2].replace(/\s/g, ''));

    if (firstLimit === secondLimit) {
        console.log(0);
        return;
    }

    if (firstLimit > secondLimit) {
        const swapHolder = firstLimit;
        firstLimit = secondLimit;
        secondLimit = swapHolder;
    }

    const sourceDigits = Array.from({ length: digitCount }, (_, i) => i + 1);

    const producedValues = [];

    function formCombinations(currentBuild, remainingPool) {
        if (remainingPool.length === 0) {
            producedValues.push(Number(currentBuild.join('')));
            return;
        }

        for (let position = 0; position < remainingPool.length; position++) {
            const pickedDigit = remainingPool[position];
            const nextPool = [...remainingPool.slice(0, position), ...remainingPool.slice(position + 1)];
            formCombinations([...currentBuild, pickedDigit], nextPool);
        }
    }

    formCombinations([], sourceDigits);

    let finalTally = 0;
    for (const item of producedValues) {
        if (item >= firstLimit && item <= secondLimit) {
            finalTally++;
        }
    }

    console.log(finalTally);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));