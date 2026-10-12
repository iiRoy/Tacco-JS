const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8").trim();
const [upperBoundStr, sequenceStr] = rawInputData.split('\n');
const upperBound = Number(upperBoundStr);
const inputSequence = sequenceStr.split(' ').map(Number);

const occurrenceRegistry = inputSequence.reduce((registry, val) => {
    registry.set(val, (registry.get(val) || 0) + 1);
    return registry;
}, new Map());

const overallPairCount = Array.from(occurrenceRegistry.values()).reduce((total, currentCount) => {
    return total + (currentCount >= 2 ? currentCount * (currentCount - 1) / 2 : 0);
}, 0);

const outputLines = inputSequence.map(currentValue => {
    const frequencyOfCurrent = occurrenceRegistry.get(currentValue) || 0;
    return overallPairCount - (frequencyOfCurrent - 1);
});

console.log(outputLines.join('\n'));
