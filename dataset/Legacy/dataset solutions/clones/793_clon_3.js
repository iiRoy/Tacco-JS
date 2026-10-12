const fs = require('fs');

const parseTimeComponent = (timeString) => {
    return +(new Date(`2000-01-01 ${timeString}`));
};

const doesSlotOverlap = (slotA, slotB) => {
    const slotA_start = slotA[0];
    const slotA_end = slotA[1];
    const slotB_start = slotB[0];

    const noOverlapConditionMet = (slotA_end <= slotB_start) || (slotB_start <= slotA_start);
    return !noOverlapConditionMet;
};

const fileContent = fs.readFileSync('/dev/stdin', 'utf8');
let inputLines = fileContent.split('\n');

const getNextInputLine = () => {
    return inputLines.shift();
};

let currentInputLine;
while ((currentInputLine = getNextInputLine()) !== null) {
    const numberOfEntries = parseInt(currentInputLine, 10);

    if (numberOfEntries === 0) {
        break;
    }

    let trainSchedule = [];
    for (let entryIdx = 0; entryIdx < numberOfEntries; entryIdx++) {
        const lineWithTimes = getNextInputLine();
        const parsedTimeSlots = lineWithTimes.split(' ').map(parseTimeComponent);
        trainSchedule.push(parsedTimeSlots);
    }

    let peakSimultaneousTrains = 1;

    for (let baseSlotIdx = 0; baseSlotIdx < trainSchedule.length; baseSlotIdx++) {
        const baseTrainSlot = trainSchedule[baseSlotIdx];

        if (baseTrainSlot === null) {
            continue;
        }

        let currentSimultaneousCount = 1;
        let overlappingTrainIndices = [];

        for (let compareSlotIdx = baseSlotIdx + 1; compareSlotIdx < trainSchedule.length; compareSlotIdx++) {
            const comparedTrainSlot = trainSchedule[compareSlotIdx];

            if (comparedTrainSlot === null) {
                continue;
            }

            if (doesSlotOverlap(baseTrainSlot, comparedTrainSlot)) {
                overlappingTrainIndices.push(compareSlotIdx);
                currentSimultaneousCount++;
            }
        }

        for (const indexToMarkNull of overlappingTrainIndices) {
            trainSchedule[indexToMarkNull] = null;
        }

        trainSchedule = trainSchedule.filter(activeSlot => activeSlot !== null);

        peakSimultaneousTrains = Math.max(peakSimultaneousTrains, currentSimultaneousCount);
    }
    console.log(peakSimultaneousTrains);
}
