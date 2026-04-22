let incomingStream = require("node:fs").readFileSync("/dev/stdin", "utf8");

function computeOutcome(sourceContent) {
    const dataUnits = sourceContent.trim().split(/\s+/);
    const sequenceItems = dataUnits.slice(1).map(Number);

    const relevantIndices = Array.from({ length: 50 }, (_, currentOffset) => currentOffset * 2);

    const validIndices = relevantIndices.filter(pos => pos < sequenceItems.length);

    const selectedValues = validIndices.map(pos => sequenceItems[pos]);

    const oddValueCounter = selectedValues.filter(val => val % 2 !== 0).length;

    return oddValueCounter;
}

const rawSourceText = incomingStream;
const finalResult = computeOutcome(rawSourceText);
console.log(finalResult);