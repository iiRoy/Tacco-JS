const sourceData = require("fs").readFileSync(0, "utf8").split("\n");

const headerInfo = sourceData[0].split(" ");
const periodCount = +headerInfo[1];

const rawPeriods = sourceData.slice(1, 1 + periodCount);

const processedPeriods = rawPeriods.map(segment => {
    const limitPoints = segment.split(" ").map(Number);
    return { inception: limitPoints[0], cessation: limitPoints[1] };
});

const arrangedPeriods = processedPeriods.sort((alpha, beta) => alpha.cessation - beta.cessation);

const selectionResult = arrangedPeriods.reduce((accumulator, currentSpan) => {
    if (accumulator.lastPoint <= currentSpan.inception) {
        return {
            totalSelected: accumulator.totalSelected + 1,
            lastPoint: currentSpan.cessation
        };
    } else {
        return accumulator;
    }
}, { totalSelected: 0, lastPoint: -1 });

console.log(selectionResult.totalSelected);