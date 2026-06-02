function ProcessGridData(inputString) {
    const inputNumbers = inputString.split(" ").map(Number);
    let primaryCount, secondaryCount, primaryChar, secondaryChar;

    if (inputNumbers[0] > inputNumbers[1]) {
        primaryCount = inputNumbers[0];
        secondaryCount = inputNumbers[1];
        primaryChar = ".";
        secondaryChar = "#";
    } else {
        secondaryCount = inputNumbers[0];
        primaryCount = inputNumbers[1];
        secondaryChar = ".";
        primaryChar = "#";
    }

    const gridDimension = Math.ceil(Math.sqrt(primaryCount)) * 4;

    const getPatternStrings = (charA, charB) => ({
        patternOne: `${charA}${charA}${charA}${charB}`,
        patternMid: `${charA}${charB}${charA}${charB}`,
        patternZero: `${charB}${charB}${charB}${charB}`
    });
    const blockPatterns = getPatternStrings(primaryChar, secondaryChar);

    const produceBlockSegment = (rowBlockIndex, colBlockIndex, currentPrimary, currentSecondary, targetPrimary, targetSecondary, patterns) => {
        const { patternOne, patternMid, patternZero } = patterns;
        let nextPrimary = currentPrimary;
        let nextSecondary = currentSecondary;
        let segmentRows;

        const decisionKey =
            (rowBlockIndex === 0 && colBlockIndex === 0) ? "initialBlock" :
            (currentPrimary === targetPrimary) ? "primaryLimitReached" :
            (currentSecondary === targetSecondary) ? "secondaryLimitReached" :
            "defaultBlock";

        const blockStrategies = {
            "initialBlock": () => ({ rows: [patternOne, patternOne, patternOne, patternZero], nextPrimary: currentPrimary, nextSecondary: currentSecondary }),
            "primaryLimitReached": () => ({ rows: [patternZero, patternZero, patternZero, patternZero], nextPrimary: currentPrimary, nextSecondary: currentSecondary }),
            "secondaryLimitReached": () => ({ rows: [patternOne, patternOne, patternOne, patternZero], nextPrimary: currentPrimary + 1, nextSecondary: currentSecondary }),
            "defaultBlock": () => ({ rows: [patternOne, patternMid, patternOne, patternZero], nextPrimary: currentPrimary + 1, nextSecondary: currentSecondary + 1 })
        };

        const blockResult = blockStrategies[decisionKey]();
        return { segmentRows: blockResult.rows, nextPrimary: blockResult.nextPrimary, nextSecondary: blockResult.nextSecondary };
    };

    const numberOfBlocks = gridDimension / 4;

    const initialGridState = {
        currentPrimaryCounter: 1,
        currentSecondaryCounter: 1,
        finalRowCollection: Array.from({ length: gridDimension }, () => "")
    };

    const finalGridState = Array.from({ length: numberOfBlocks }).reduce((accumulator, _, rowBlockIndex) => {
        let { currentPrimaryCounter, currentSecondaryCounter, finalRowCollection } = accumulator;
        const temporaryBlockRowAccumulators = Array.from({ length: 4 }, () => "");

        const columnProcessingResult = Array.from({ length: numberOfBlocks }).reduce((colAccumulator, __, colBlockIndex) => {
            const { currentPrimaryCounter: colPrimary, currentSecondaryCounter: colSecondary, temporaryBlockRowAccumulators: colTempRows } = colAccumulator;
            const { segmentRows, nextPrimary, nextSecondary } = produceBlockSegment(
                rowBlockIndex, colBlockIndex, colPrimary, colSecondary, primaryCount, secondaryCount, blockPatterns
            );

            for (let k = 0; k < 4; k++) {
                colTempRows[k] += segmentRows[k];
            }
            return { currentPrimaryCounter: nextPrimary, currentSecondaryCounter: nextSecondary, temporaryBlockRowAccumulators: colTempRows };
        }, { currentPrimaryCounter, currentSecondaryCounter, temporaryBlockRowAccumulators });

        currentPrimaryCounter = columnProcessingResult.currentPrimaryCounter;
        currentSecondaryCounter = columnProcessingResult.currentSecondaryCounter;
        const completedBlockRows = columnProcessingResult.temporaryBlockRowAccumulators;

        for (let k = 0; k < 4; k++) {
            finalRowCollection[rowBlockIndex * 4 + k] = completedBlockRows[k];
        }

        return { currentPrimaryCounter, currentSecondaryCounter, finalRowCollection };
    }, initialGridState);

    const outputGrid = finalGridState.finalRowCollection;
    console.log("%d %d\n%s", gridDimension, gridDimension, outputGrid.join("\n"));
}

ProcessGridData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
