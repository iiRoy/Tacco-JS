"use strict";
function generateInputProcessor(sourceText) {
    const contentUnits = sourceText.split(/ |\n/);
    let currentPosition = 0;

    const pullNumeric = () => {
        if (currentPosition >= contentUnits.length) {
            throw new Error("Input unit exhausted.");
        }
        return Number(contentUnits[currentPosition++]);
    };

    const pullNumericBatch = (quantity) => {
        const collection = [];
        for (let idx = 0; idx < quantity; idx++) {
            collection.push(pullNumeric());
        }
        return collection;
    };

    const pullNumericGrid = (rows, columns) => {
        const gridData = [];
        for (let rIdx = 0; rIdx < rows; rIdx++) {
            gridData.push(pullNumericBatch(columns));
        }
        return gridData;
    };

    return {
        pullNumeric,
        pullNumericBatch,
        pullNumericGrid
    };
}

function processOptimizationChallenge(rawData) {
    const processor = generateInputProcessor(rawData);

    const totalDays = processor.pullNumeric();
    const contestTypes = 26;
    const decreaseFactors = processor.pullNumericBatch(contestTypes);
    const satisfactionMatrix = processor.pullNumericGrid(totalDays, contestTypes);

    const dailySelectionsList = Array.from({ length: totalDays }, () => processor.pullNumeric());

    const initialAccumulators = Array(contestTypes).fill(0);
    let currentOverallValue = 0;

    const dailyReportSnapshots = [];

    const finalState = dailySelectionsList.reduce((stateTuple, chosenActivityRaw, dayIterator) => {
        let [currentAccumulatedPenalties, currentRunningTotal] = stateTuple;
        const actualChosenActivityIndex = chosenActivityRaw - 1;

        const nextAccumulatedPenalties = currentAccumulatedPenalties.map((penaltyVal, typeIdx) =>
            penaltyVal - decreaseFactors[typeIdx]
        );

        nextAccumulatedPenalties[actualChosenActivityIndex] = 0;

        currentRunningTotal += satisfactionMatrix[dayIterator][actualChosenActivityIndex];

        currentRunningTotal = nextAccumulatedPenalties.reduce((summation, penaltyVal) => summation + penaltyVal, currentRunningTotal);

        dailyReportSnapshots.push(currentRunningTotal);

        return [nextAccumulatedPenalties, currentRunningTotal];
    }, [initialAccumulators, currentOverallValue]);

    return dailyReportSnapshots.join('\n');
}

const systemInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
const generatedOutput = processOptimizationChallenge(systemInputContent);
if (generatedOutput !== undefined) {
    console.log(generatedOutput);
}