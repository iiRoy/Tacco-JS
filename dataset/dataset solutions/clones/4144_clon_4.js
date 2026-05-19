var inputLines = [];
var interfaceHandle = require('readline');

var rl = interfaceHandle.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.on('line', function (currentLine) {
    inputLines.push(currentLine);
});

rl.on('close', function () {
    const initialString = inputLines[0];

    const metricCalculator = (sourceSequence, targetCharacter) => {
        const sequenceLength = sourceSequence.length;

        if (sequenceLength === 0) {
            return Infinity;
        }

        const relevantIndices = Array.from({ length: sequenceLength }, (_, currentIdx) => currentIdx)
            .filter(currentIdx => {
                const charVal = sourceSequence[currentIdx];
                const nextCharVal = sourceSequence[currentIdx + 1];

                return charVal === targetCharacter && (currentIdx + 1 === sequenceLength || nextCharVal !== targetCharacter);
            });

        if (relevantIndices.length === 0) {
            return Infinity;
        }

        const calculatedDistances = relevantIndices.map(currentIdx => {
            const oneBasedPos = currentIdx + 1;
            const distFromEnd = sequenceLength - currentIdx;
            return Math.max(oneBasedPos, distFromEnd);
        });

        return Math.min(...calculatedDistances);
    };

    const firstResult = metricCalculator(initialString, "1");

    const transformedString = initialString.split('').map(char => char === "0" ? "1" : "0").join('');

    const secondResult = metricCalculator(transformedString, "1");

    console.log(Math.max(firstResult, secondResult) - 1);
});
