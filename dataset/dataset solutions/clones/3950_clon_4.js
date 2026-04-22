function ProcessDataForDisplay(rawData) {
    const numericValues = rawData.match(/\d+/g).map(Number);
    const valAlpha = numericValues[0];
    const valBeta = numericValues[1];

    const charConfiguration = valAlpha > valBeta
        ? { alphaCount: valAlpha, betaCount: valBeta, charAlpha: '.', charBeta: '#' }
        : { alphaCount: valBeta, betaCount: valAlpha, charAlpha: '#', charBeta: '.' };

    const gridDimension = Math.ceil(Math.sqrt(charConfiguration.alphaCount)) * 4;

    const patternPrimary = [charConfiguration.charAlpha, charConfiguration.charAlpha, charConfiguration.charAlpha, charConfiguration.charBeta];
    const patternAlternating = [charConfiguration.charAlpha, charConfiguration.charBeta, charConfiguration.charAlpha, charConfiguration.charBeta];
    const patternSecondary = [charConfiguration.charBeta, charConfiguration.charBeta, charConfiguration.charBeta, charConfiguration.charBeta];

    const blockTypeA = [
        patternPrimary,
        patternPrimary,
        patternPrimary,
        patternSecondary
    ];
    const blockTypeB = [
        patternSecondary,
        patternSecondary,
        patternSecondary,
        patternSecondary
    ];
    const blockTypeC = [
        patternPrimary,
        patternAlternating,
        patternPrimary,
        patternSecondary
    ];

    const blockPositions = Array.from({ length: gridDimension / 4 }, (_, rIdx) =>
        Array.from({ length: gridDimension / 4 }, (_, cIdx) => ({
            rowStart: rIdx * 4,
            colStart: cIdx * 4
        }))
    ).flat();

    const initialGridState = {
        matrix: Array.from({ length: gridDimension }, () => Array(gridDimension).fill('')),
        currentAlphaCounter: 1,
        currentBetaCounter: 1
    };

    const finalGridState = blockPositions.reduce((stateAccumulator, currentPosition) => {
        let selectedBlockContent;
        let nextAlphaCounter = stateAccumulator.currentAlphaCounter;
        let nextBetaCounter = stateAccumulator.currentBetaCounter;

        if (currentPosition.rowStart === 0 && currentPosition.colStart === 0) {
            selectedBlockContent = blockTypeA;
        } else if (stateAccumulator.currentAlphaCounter === charConfiguration.alphaCount) {
            selectedBlockContent = blockTypeB;
        } else if (stateAccumulator.currentBetaCounter === charConfiguration.betaCount) {
            selectedBlockContent = blockTypeA;
            nextAlphaCounter++;
        } else {
            selectedBlockContent = blockTypeC;
            nextAlphaCounter++;
            nextBetaCounter++;
        }

        for (let rOffset = 0; rOffset < 4; rOffset++) {
            for (let cOffset = 0; cOffset < 4; cOffset++) {
                stateAccumulator.matrix[currentPosition.rowStart + rOffset][currentPosition.colStart + cOffset] = selectedBlockContent[rOffset][cOffset];
            }
        }

        return {
            matrix: stateAccumulator.matrix,
            currentAlphaCounter: nextAlphaCounter,
            currentBetaCounter: nextBetaCounter
        };
    }, initialGridState);

    const resultRows = finalGridState.matrix.map(row => row.join(''));
    const headerLine = `${gridDimension} ${gridDimension}`;
    return `${headerLine}\n${resultRows.join('\n')}`;
}

const programInput = require("fs").readFileSync("/dev/stdin", "utf8").trim();
console.log(ProcessDataForDisplay(programInput));