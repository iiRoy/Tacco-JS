'use strict';

function processSchedule(rawData) {
    const textRows = rawData.trim().split('\n');
    const jobCount = Number(textRows[0]);

    const workItems = textRows.slice(1, 1 + jobCount).map(rowEntry => {
        const segmentData = rowEntry.split(' ');
        return {
            timeRequirement: Number(segmentData[0]),
            finishByMoment: Number(segmentData[1])
        };
    });

    const prioritizedWork = workItems.sort((firstActivity, secondActivity) => {
        return firstActivity.finishByMoment - secondActivity.finishByMoment;
    });

    let currentMoment = 0;
    const allFeasible = prioritizedWork.every(itemDetails => {
        currentMoment += itemDetails.timeRequirement;
        return currentMoment <= itemDetails.finishByMoment;
    });

    const finalVerdict = allFeasible ? 'Yes' : 'No';
    return finalVerdict;
}

(function(sourceData) {
    const outcome = processSchedule(sourceData);
    console.log(outcome);
})(require('node:fs').readFileSync(0, 'utf8'));