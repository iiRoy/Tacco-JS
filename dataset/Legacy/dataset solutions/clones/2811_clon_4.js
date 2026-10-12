'use strict'
function processSchedule(inputContent) {
    const inputLines = inputContent.split("\n");
    const taskQuantity = parseInt(inputLines[0], 10);

    const jobEntries = inputLines.slice(1, taskQuantity + 1).map(line => {
        const [timeRequiredStr, dueByStr] = line.split(" ");
        return {
            timeRequired: parseInt(timeRequiredStr, 10),
            dueBy: parseInt(dueByStr, 10)
        };
    });

    jobEntries.sort((entryA, entryB) => entryA.dueBy - entryB.dueBy);

    let currentMoment = 0;
    let allMet = true;

    for (const job of jobEntries) {
        currentMoment += job.timeRequired;
        if (currentMoment > job.dueBy) {
            allMet = false;
            break;
        }
    }

    if (allMet) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

processSchedule(require('fs').readFileSync('/dev/stdin', 'utf8'));
