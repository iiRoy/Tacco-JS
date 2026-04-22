'use strict';

(function () {
    const sourceData = require('node:fs').readFileSync('/dev/stdin', 'utf8');

    const contentLines = sourceData.split('\n').filter(Boolean);

    const computationalTasks = contentLines.slice(1).map(entry => {
        const numericParts = entry.split(' ');
        return {
            processingTime: Number.parseInt(numericParts[0], 10),
            completionBoundary: Number.parseInt(numericParts[1], 10)
        };
    });

    computationalTasks.sort((itemA, itemB) => itemA.completionBoundary - itemB.completionBoundary);

    function assessViability(remainingTasks, currentDurationAccumulation) {
        if (remainingTasks.length === 0) {
            return true;
        }

        const [initialTask, ...subsequentTasks] = remainingTasks;

        const updatedDurationAccumulation = currentDurationAccumulation + initialTask.processingTime;

        if (updatedDurationAccumulation > initialTask.completionBoundary) {
            return false;
        }

        return assessViability(subsequentTasks, updatedDurationAccumulation);
    }

    const outcome = assessViability(computationalTasks, 0);

    if (outcome) {
        console.log('Yes');
    } else {
        console.log('No');
    }
})();