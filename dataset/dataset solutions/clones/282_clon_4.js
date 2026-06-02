const fs = require('fs');
const rawInputData = fs.readFileSync('/dev/stdin', 'utf8');
const processedLines = rawInputData.trim().split('\n');

for (const currentLine of processedLines) {
    if (currentLine === '0 0') {
        break;
    }

    const [totalSlots, skipCount] = currentLine.split(' ').map(Number);
    const slotOccupancy = new Array(totalSlots).fill(false);
    let currentPosition = 0;

    for (let placementIteration = 0; placementIteration < totalSlots; placementIteration++) {
        let emptySlotsEncountered = 0;
        while (emptySlotsEncountered < skipCount) {
            currentPosition = (currentPosition + 1) % totalSlots;
            if (!slotOccupancy[currentPosition]) {
                emptySlotsEncountered++;
            }
        }
        slotOccupancy[currentPosition] = true;
    }
    console.log(currentPosition);
}
