const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split(/\s/);

const numericRange = Array.from({ length: 10 }, (_, k) => k + 1);

const iterationCount = Math.max(0, Math.floor((sourceData.length - 2) / 3) + 1);

Array.from({ length: iterationCount }, (_, groupIndex) => {
    const currentBasePosition = groupIndex * 3;

    const firstValue = Number(sourceData[currentBasePosition]);
    const secondValue = Number(sourceData[currentBasePosition + 1]);
    const thirdValue = Number(sourceData[currentBasePosition + 2]);

    const upperBoundary = 20 - (firstValue + secondValue);
    const excludedSet = new Set([firstValue, secondValue, thirdValue]);

    const qualifyingElementsCount = numericRange.filter(candidateNumber => {
        return candidateNumber <= upperBoundary && !excludedSet.has(candidateNumber);
    }).length;

    console.log(qualifyingElementsCount >= 4 ? "Yes" : "No");
});
