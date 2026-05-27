const fileSystemModule = require('fs');

const rawData = fileSystemModule.readFileSync('/dev/stdin', 'utf8').trim();
const dataRows = rawData.split('\n');

const determineMinimalSum = (targetValue) => {
    let currentOptimal = targetValue;
    const zUpperBoundary = Math.floor(Math.cbrt(targetValue));

    Array.from({ length: zUpperBoundary + 1 }, (_, zIndex) => zIndex).forEach(zComponent => {
        const zCubedTerm = zComponent * zComponent * zComponent;
        const remainingForYCalculation = targetValue - zCubedTerm;

        if (remainingForYCalculation < 0) {
            return;
        }

        const yUpperBoundary = Math.floor(Math.sqrt(remainingForYCalculation));

        Array.from({ length: yUpperBoundary + 1 }, (_, yIndex) => yIndex).forEach(yComponent => {
            const ySquaredTerm = yComponent * yComponent;
            const xComponent = targetValue - zCubedTerm - ySquaredTerm;

            const totalSum = xComponent + yComponent + zComponent;
            if (totalSum < currentOptimal) {
                currentOptimal = totalSum;
            }
        });
    });
    return currentOptimal;
};

dataRows.forEach(lineContent => {
    const numericValue = Number(lineContent);
    if (numericValue !== 0) {
        const result = determineMinimalSum(numericValue);
        console.log(result);
    }
});
