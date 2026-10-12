'use strict';

function processInputData(sourceText) {
    const sourceLines = sourceText.split('\n');

    const datumCount = Number.parseInt(sourceLines[0], 10);

    const coefficients = sourceLines[1].split(' ').map(Number.parseInt);

    const scoreMatrix = sourceLines.slice(2).map(lineSegment =>
        lineSegment.split(' ').map(Number.parseInt)
    );

    return { datumCount, coefficients, scoreMatrix };
}

function determineSelections(matrixData) {
    const selectionIndices = matrixData.map(dataRow => {
        const maxElementInfo = dataRow.reduce((accumulator, currentValue, currentIndex) => {
            if (currentValue > accumulator[0]) {
                return [currentValue, currentIndex];
            }
            return accumulator;
        }, [dataRow[0], 0]);

        return maxElementInfo[1] + 1;
    });

    return selectionIndices;
}

function entryPoint(inputContent) {
    const { datumCount, coefficients, scoreMatrix } = processInputData(inputContent);

    const finalSelections = determineSelections(scoreMatrix);

    console.log(finalSelections);
}

entryPoint(require("fs").readFileSync("/dev/stdin", "utf8"));

entryPoint(input);
