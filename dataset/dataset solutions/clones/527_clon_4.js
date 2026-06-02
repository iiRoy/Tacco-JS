const fileSystem = require('fs');

const processInput = (inputString) => {
    const dataLines = inputString.trim().split('\n');

    const [nValue, mCount, pTarget] = dataLines.shift().split(' ').map(Number);
    const nAdjusted = nValue - 1;

    const initialNumbers = dataLines.slice(0, mCount).map(Number);

    const filteredAndSorted = initialNumbers
        .filter(num => num !== pTarget)
        .concat(pTarget)
        .sort((a, b) => a - b);

    const potentialResults = filteredAndSorted.flatMap((currentValue, currentIndex, referenceArray) => {
        const currentCandidates = [];
        const arrayLength = referenceArray.length;

        const previousValue = currentIndex > 0 ? referenceArray[currentIndex - 1] : undefined;
        const nextValue = currentIndex < arrayLength - 1 ? referenceArray[currentIndex + 1] : undefined;

        // Case: currentValue is less than pTarget
        if (currentValue < pTarget && previousValue !== undefined) {
            currentCandidates.push((pTarget - currentValue) * 2 + (nAdjusted - pTarget + 1) + previousValue);
        }

        // Case: currentValue is equal to pTarget
        if (currentValue === pTarget) {
            if (currentIndex === 0) {
                currentCandidates.push(referenceArray[arrayLength - 1] - currentValue);
            }
            if (currentIndex === arrayLength - 1) {
                currentCandidates.push(currentValue - referenceArray[0]);
            }
            if (nextValue !== undefined) {
                currentCandidates.push(pTarget + nAdjusted - nextValue + 1);
            }
            if (previousValue !== undefined) {
                currentCandidates.push(nAdjusted - pTarget + 1 + previousValue);
            }
        }

        // Case: currentValue is greater than pTarget
        if (currentValue > pTarget && nextValue !== undefined) {
            currentCandidates.push((currentValue - pTarget) * 2 + pTarget + (nAdjusted - nextValue + 1));
        }

        return currentCandidates;
    });

    const finalCalculatedMinimum = potentialResults.reduce((accumulator, current) => Math.min(accumulator, current), Infinity);

    console.log(finalCalculatedMinimum * 100);
};

const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
processInput(rawInputData);
