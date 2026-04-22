'use strict';

function evaluateSchedule(sourceData) {
    const rawLines = sourceData.trim().split('\n');
    const totalJobs = parseInt(rawLines[0], 10);

    const jobEntries = rawLines.slice(1, totalJobs + 1).map(entryText => {
        const [timeCost, finishBy] = entryText.split(' ').map(Number);
        return { work: timeCost, due: finishBy };
    });

    jobEntries.sort((itemA, itemB) => itemA.due - itemB.due);

    const finalOutcome = jobEntries.reduce((statusAccumulator, currentJobItem) => {
        if (!statusAccumulator.possible) {
            return statusAccumulator;
        }

        statusAccumulator.elapsed += currentJobItem.work;

        if (statusAccumulator.elapsed > currentJobItem.due) {
            statusAccumulator.possible = false;
        }
        return statusAccumulator;
    }, { elapsed: 0, possible: true });

    if (finalOutcome.possible) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

evaluateSchedule(require('node:fs').readFileSync(0, 'utf8'));