'use strict';

const ProcessInput = (rawInput) => {
    const components = rawInput.trim().split(' ').map(Number);
    let [firstVal, secondVal, thirdVal] = components;

    if (firstVal === secondVal && secondVal === thirdVal && firstVal % 2 === 0) {
        console.log(-1);
        return -1;
    }

    let iterationCount = 0;
    let currentSet = [firstVal, secondVal, thirdVal];

    while (currentSet.every(n => n % 2 === 0)) {
        const [aPrev, bPrev, cPrev] = currentSet;

        const aNext = (bPrev + cPrev) / 2;
        const bNext = (aPrev + cPrev) / 2;
        const cNext = (aPrev + bPrev) / 2;

        currentSet = [aNext, bNext, cNext];
        iterationCount++;
    }

    console.log(iterationCount);
    return iterationCount;
};

ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
