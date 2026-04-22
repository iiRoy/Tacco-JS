const powerSumRegistry = new Map(); // Stores { y^2 + z^3 : min(y + z) }

const MAX_Z_VAL_LIMIT = 100;
const MAX_Y_VAL_LIMIT = 1000;

for (let valZ = 0; valZ <= MAX_Z_VAL_LIMIT; ++valZ) {
    const sumOfCubes = valZ * valZ * valZ;
    for (let valY = 0; valY <= MAX_Y_VAL_LIMIT; ++valY) {
        const sumOfSquares = valY * valY;
        const currentPowerCombo = sumOfCubes + sumOfSquares;
        const currentZYTotal = valY + valZ;

        if (!powerSumRegistry.has(currentPowerCombo) || currentZYTotal < powerSumRegistry.get(currentPowerCombo)) {
            powerSumRegistry.set(currentPowerCombo, currentZYTotal);
        }
    }
}

const allInputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
let lineCursor = 0;

while (true) {
    const targetValue = parseInt(allInputLines[lineCursor++], 10);
    if (targetValue === 0) break;

    let currentBestSum = Infinity;

    for (const [entryPowerSum, entryZYSum] of powerSumRegistry.entries()) {
        if (entryPowerSum <= targetValue) {
            const currentXComponent = targetValue - entryPowerSum;
            currentBestSum = Math.min(currentBestSum, currentXComponent + entryZYSum);
        }
    }
    console.log(currentBestSum);
}