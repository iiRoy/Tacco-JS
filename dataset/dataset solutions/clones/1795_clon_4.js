'use strict';
function processInputAndCompute(sourceText) {
    const lines = sourceText.trim().split(/\r?\n/g);
    const [size, rounds] = lines[0].split(' ').map(Number);
    let currentValues = lines[1].split(' ').map(Number);

    const finalValues = Array.from({ length: rounds }).reduce((previousValues, _, roundIndex) => {
        const diffTracker = new Array(size + 1).fill(0);

        previousValues.forEach((spreadDistance, cellIndex) => {
            const startEffect = Math.max(0, cellIndex - spreadDistance);
            const endEffect = Math.min(size - 1, cellIndex + spreadDistance);

            diffTracker[startEffect]++;
            // The effect ends after endEffect, so we decrement at endEffect + 1.
            // endEffect can be at most size - 1, so endEffect + 1 can be at most size.
            // diffTracker has size + 1 elements (indices 0 to size), so diffTracker[endEffect + 1] is always a valid index.
            diffTracker[endEffect + 1]--;
        });

        const nextValues = [];
        let currentCount = 0;
        for (let i = 0; i < size; i++) {
            currentCount += diffTracker[i];
            nextValues.push(currentCount);
        }
        return nextValues;
    }, currentValues);

    console.log(finalValues.join(' '));
}

processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));
