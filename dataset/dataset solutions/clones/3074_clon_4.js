'use strict';

function processData(rawData) {
    const parsedLines = rawData.trim().split('\n');

    const indexBounds = parsedLines.shift().split(' ').map(Number);

    const valueLists = parsedLines.map(lineContent =>
        lineContent.split(' ').map(Number).sort((valA, valB) => valB - valA)
    );

    const sumCollection = [];

    function computeCombinations(
        currentDepth,
        currentProductFactor,
        currentAccumulatedSum
    ) {
        if (currentDepth === 3) {
            sumCollection.push(currentAccumulatedSum);
            return;
        }

        const currentList = valueLists[currentDepth];
        const currentMaxIteration = indexBounds[currentDepth];

        for (let idx = 0; idx < currentMaxIteration; idx++) {
            const nextProductFactor = currentProductFactor * (idx + 1);

            if (nextProductFactor > 3000) {
                break;
            }

            const nextAccumulatedSum = currentAccumulatedSum + currentList[idx];

            computeCombinations(
                currentDepth + 1,
                nextProductFactor,
                nextAccumulatedSum
            );
        }
    }

    computeCombinations(0, 1, 0);

    const finalResults = sumCollection
        .sort((sumA, sumB) => sumB - sumA)
        .slice(0, indexBounds[3]);

    console.log(finalResults.join('\n'));
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
