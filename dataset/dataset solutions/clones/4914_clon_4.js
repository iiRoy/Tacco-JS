function processInputData(entryLines) {
    const numberOfEntries = Number(entryLines[0]);
    const pertinentEntries = entryLines.slice(1, numberOfEntries + 1);

    const finalRatioValues = pertinentEntries.reduce((currentPair, lineString) => {
        const [leftComponentValue, rightComponentValue] = lineString.split(" ").map(Number);

        const accumulatedLeft = currentPair[0];
        const accumulatedRight = currentPair[1];

        const requiredMultiplierForLeft = accumulatedLeft / leftComponentValue;
        const requiredMultiplierForRight = accumulatedRight / rightComponentValue;

        const commonScalingFactor = Math.ceil(Math.max(requiredMultiplierForLeft, requiredMultiplierForRight));

        const newAccumulatedLeft = commonScalingFactor * leftComponentValue;
        const newAccumulatedRight = commonScalingFactor * rightComponentValue;

        return [newAccumulatedLeft, newAccumulatedRight];
    }, [1, 1]);

    return finalRatioValues[0] + finalRatioValues[1];
}

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n");
const computedSum = processInputData(rawInputContent);
console.log(computedSum);