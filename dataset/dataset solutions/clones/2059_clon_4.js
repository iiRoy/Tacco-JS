function ProcessJourney(rawJourneyData) {
    rawJourneyData = rawJourneyData.trim();
    const journeyLines = rawJourneyData.split("\n");
    const targetDimensions = journeyLines[0].split(" ").map(Number);
    const gridOfFeatures = journeyLines.slice(1).map(line => line.split(''));

    const finalRowIdx = targetDimensions[0] - 1;
    const finalColIdx = targetDimensions[1] - 1;

    const totalRows = targetDimensions[0];
    const totalCols = targetDimensions[1];

    const minimalPunishmentGrid = Array(totalRows).fill(0).map(() => Array(totalCols).fill(Infinity));

    for (let rIdx = 0; rIdx < totalRows; rIdx++) {
        for (let cIdx = 0; cIdx < totalCols; cIdx++) {
            const currentSquarePenalty = (gridOfFeatures[rIdx][cIdx] !== '.') ? 1 : 0;

            if (rIdx === 0 && cIdx === 0) {
                minimalPunishmentGrid[rIdx][cIdx] = currentSquarePenalty;
            } else if (rIdx === 0) {
                minimalPunishmentGrid[rIdx][cIdx] = minimalPunishmentGrid[rIdx][cIdx - 1] + currentSquarePenalty;
            } else if (cIdx === 0) {
                minimalPunishmentGrid[rIdx][cIdx] = minimalPunishmentGrid[rIdx - 1][cIdx] + currentSquarePenalty;
            } else {
                minimalPunishmentGrid[rIdx][cIdx] = Math.min(minimalPunishmentGrid[rIdx - 1][cIdx], minimalPunishmentGrid[rIdx][cIdx - 1]) + currentSquarePenalty;
            }
        }
    }

    console.log(minimalPunishmentGrid[finalRowIdx][finalColIdx]);
}

const filesystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const utf8Encoding = "utf8";
ProcessJourney(filesystemModule.readFileSync(standardInputPath, utf8Encoding));