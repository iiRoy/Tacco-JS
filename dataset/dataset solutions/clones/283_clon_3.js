const fs = require('fs');

function getProcessedInputLines() {
    const rawInputData = fs.readFileSync('/dev/stdin', 'utf8');
    return rawInputData.trim().split("\n");
}

function parseInputLine(lineContent) {
    const numericParts = lineContent.split(" ").map(Number);
    return { totalSlotsCount: numericParts[0], skipStep: numericParts[1] };
}

function createEmptySlotMap(size) {
    const slotMap = {};
    for (let slotInitIdx = 0; slotInitIdx < size; slotInitIdx++) {
        slotMap[slotInitIdx] = null;
    }
    return slotMap;
}

function findNextAvailableSlot(slotsMap, currentStartPos, totalSlotsCount, skipStep) {
    let emptySlotsCounter = 0;
    let nextPosCandidate = currentStartPos;

    do {
        nextPosCandidate = (nextPosCandidate + 1) % totalSlotsCount;
        if (slotsMap[nextPosCandidate] === null) {
            emptySlotsCounter++;
        }
    } while (emptySlotsCounter !== skipStep);

    return nextPosCandidate;
}

const inputLines = getProcessedInputLines();

for (let lineIdx = 0; lineIdx < inputLines.length; lineIdx++) {
    const currentLineContent = inputLines[lineIdx];

    if (currentLineContent === "0 0") {
        break;
    }

    const { totalSlotsCount, skipStep } = parseInputLine(currentLineContent);

    const slotOccupancyMap = createEmptySlotMap(totalSlotsCount);

    let currentPositionMarker = 0;

    for (let itemToPlaceIdx = 0; itemToPlaceIdx < totalSlotsCount; itemToPlaceIdx++) {
        currentPositionMarker = findNextAvailableSlot(
            slotOccupancyMap,
            currentPositionMarker,
            totalSlotsCount,
            skipStep
        );
        slotOccupancyMap[currentPositionMarker] = itemToPlaceIdx;
    }

    const finalOutputPosition = currentPositionMarker === 0 ? 1 : currentPositionMarker;

    console.log(finalOutputPosition);
}
