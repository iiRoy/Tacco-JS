const rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const dataRows = rawData.split('\n');

function findMinimumSumForTarget(targetValue) {
    let minimumSum = targetValue;

    const maxZVal = Math.floor(Math.pow(targetValue, 1 / 3));

    for (let zCoord = 0; zCoord <= maxZVal; zCoord++) {
        const zCubed = Math.pow(zCoord, 3);
        const remainingAfterZ = targetValue - zCubed;

        if (remainingAfterZ < 0) {
            break;
        }

        const maxYVal = Math.floor(Math.pow(remainingAfterZ, 1 / 2));

        for (let yCoord = 0; yCoord <= maxYVal; yCoord++) {
            const ySquared = Math.pow(yCoord, 2);
            const xCoord = remainingAfterZ - ySquared;

            if (xCoord < 0) {
                continue;
            }

            const currentSum = xCoord + yCoord + zCoord;
            if (currentSum < minimumSum) {
                minimumSum = currentSum;
            }
        }
    }
    return minimumSum;
}

for (let idx = 0; idx < dataRows.length; idx++) {
    const currentLineContent = dataRows[idx];
    const currentValue = Number(currentLineContent);

    if (currentValue !== 0) {
        const resultMinimum = findMinimumSumForTarget(currentValue);
        console.log(resultMinimum);
    }
}
