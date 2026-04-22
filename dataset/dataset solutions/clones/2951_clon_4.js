const calculateProbabilitySum = (dataInputString) => {
    const [totalCount, targetValue] = dataInputString
        .split(/\s+/)
        .filter(Boolean)
        .map(Number);

    const accumulatedProbability = Array.from({ length: totalCount }, (_, itemIndex) => itemIndex + 1)
        .reduce((currentTotal, currentItem) => {
            if (currentItem >= targetValue) {
                return currentTotal + (1 / totalCount);
            } else {
                const requiredFactorPower = Math.floor(Math.log2(targetValue / currentItem)) + 1;
                const individualProbability = (1 / totalCount) * Math.pow(0.5, requiredFactorPower);
                return currentTotal + individualProbability;
            }
        }, 0);

    return accumulatedProbability;
};

const executeComputationAndDisplay = (sourcePath) => {
    const rawInputContent = require('node:fs').readFileSync(sourcePath, 'utf8');
    const finalResultValue = calculateProbabilitySum(rawInputContent);
    process.stdout.write(finalResultValue.toFixed(10) + '\n');
};

executeComputationAndDisplay('/dev/stdin');