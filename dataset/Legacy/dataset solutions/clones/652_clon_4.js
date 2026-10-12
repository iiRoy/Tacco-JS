const obtainFileContent = require('fs').readFileSync;

function* progressTracker(initialIncrement, bonusIncrement) {
    let currentPeriod = 1;
    let totalProgress = initialIncrement;
    while (true) {
        yield { period: currentPeriod, cumulative: totalProgress };
        currentPeriod++;
        totalProgress += initialIncrement;
        if ((currentPeriod - 1) % 7 === 0) {
            totalProgress += bonusIncrement;
        }
    }
}

const rawInputData = obtainFileContent('/dev/stdin', 'utf8');
const [valueA, valueB, thresholdC] = rawInputData.trim().split(" ").map(Number);

const progressGenerator = progressTracker(valueA, valueB);

for (const { period: dayIndex, cumulative: currentAccumulation } of progressGenerator) {
    if (thresholdC <= currentAccumulation) {
        console.log(dayIndex);
        break;
    }
}
