function* dataStream(rawSource) {
    const lines = rawSource.trim().split('\n');
    let currentLineIndex = 0;
    while (true) {
        const dimension = Number(lines[currentLineIndex++]);
        if (dimension === 0) {
            break;
        }
        const gridContent = lines.slice(currentLineIndex, currentLineIndex + dimension).map(line => line.split(''));
        currentLineIndex += dimension;
        yield { size: dimension, content: gridContent };
    }
}

const processMatrix = (matrixInfo) => {
    const matSize = matrixInfo.size;
    const initialLayout = matrixInfo.content;

    let computedMeasures = new Array(matSize).fill(null).map(() => new Array(matSize).fill(null));

    let maximumExtent = 0;

    Array.from({ length: matSize }, (_, rIdx) => {
        Array.from({ length: matSize }, (_, cIdx) => {
            let currentCellIdentifier = initialLayout[rIdx][cIdx];
            let calculatedValue;

            calculatedValue = (currentCellIdentifier === '*') ? 0 :
                              ((rIdx === 0 || cIdx === 0) ? 1 :
                               (1 + Math.min(
                                   computedMeasures[rIdx - 1][cIdx - 1],
                                   computedMeasures[rIdx - 1][cIdx],
                                   computedMeasures[rIdx][cIdx - 1]
                               )));

            computedMeasures[rIdx][cIdx] = calculatedValue;
            maximumExtent = Math.max(maximumExtent, calculatedValue);
        });
    });

    return maximumExtent;
};

const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const allResults = [];

for (const matrixProblem of dataStream(sourceData)) {
    allResults.push(processMatrix(matrixProblem));
}

allResults.forEach(finalValue => console.log(finalValue));