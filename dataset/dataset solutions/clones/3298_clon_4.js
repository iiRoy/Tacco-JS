'use strict';
(function(rawInput) {
    const processedLines = rawInput.trim().split('\n');
    const problemSize = parseInt(processedLines[0].split(/\s+/)[0], 10);
    const dailyActivityValues = processedLines.slice(1, problemSize + 1).map(line =>
        line.split(/\s+/).map(Number)
    );

    const finalAccumulatedScores = dailyActivityValues.reduce((previousDayTotals, currentDayOptions) => {
        const currentDayTotals = [0, 0, 0];

        currentDayTotals[0] = Math.max(previousDayTotals[1], previousDayTotals[2]) + currentDayOptions[0];
        currentDayTotals[1] = Math.max(previousDayTotals[0], previousDayTotals[2]) + currentDayOptions[1];
        currentDayTotals[2] = Math.max(previousDayTotals[0], previousDayTotals[1]) + currentDayOptions[2];

        return currentDayTotals;
    }, [0, 0, 0]);

    const overallMaximum = Math.max(...finalAccumulatedScores);
    console.log(overallMaximum);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
