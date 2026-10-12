const calculatePowerSum = (baseZ, baseY) => {
    const termZ = baseZ * baseZ * baseZ;
    const termY = baseY * baseY;
    return termZ + termY;
};

const MAX_Z_ITERATION = 100;
const MAX_Y_ITERATION = 1000;
const INITIAL_MINIMUM_VALUE = Infinity;

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const lineSegments = fileContent.trim().split("\n");

while (true) {
    const currentTargetString = lineSegments.shift();
    const currentTarget = Number(currentTargetString);

    if (currentTarget === 0) {
        break;
    }

    let foundMinimumSum = INITIAL_MINIMUM_VALUE;

    for (let iterZ = 0; iterZ <= MAX_Z_ITERATION; iterZ++) {
        for (let iterY = 0; iterY <= MAX_Y_ITERATION; iterY++) {
            const currentPowerSum = calculatePowerSum(iterZ, iterY);

            const calculatedX = currentTarget - currentPowerSum;

            if (calculatedX < 0) {
                break;
            }

            const currentTotalSum = iterZ + iterY + calculatedX;

            foundMinimumSum = Math.min(foundMinimumSum, currentTotalSum);
        }
    }

    console.log(foundMinimumSum);
}
