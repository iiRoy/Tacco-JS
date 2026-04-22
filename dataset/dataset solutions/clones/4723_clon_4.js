const rawInputData = require('node:fs').readFileSync('/dev/stdin', 'utf8').trim();
const inputLines = rawInputData.split('\n');

const [materialCount, desiredRatioA, desiredRatioB] = inputLines[0].split(' ').map(val => parseInt(val, 10));
const itemSpecifications = inputLines.slice(1).map(line => line.split(' ').map(val => parseInt(val, 10)));

const maxAlphaComponent = 10;
const maxBetaComponent = 10;
const maxTotalAlpha = maxAlphaComponent * materialCount;
const maxTotalBeta = maxBetaComponent * materialCount;
const initialLargeValue = Infinity;

const expenditureMatrix = Array.from({ length: maxTotalAlpha + 1 }, () =>
    Array.from({ length: maxTotalBeta + 1 }, () => initialLargeValue)
);
expenditureMatrix[0][0] = 0;

itemSpecifications.forEach(itemInfo => {
    const [currentAlpha, currentBeta, currentPrice] = itemInfo;

    for (let sumAlpha = maxTotalAlpha; sumAlpha >= currentAlpha; --sumAlpha) {
        for (let sumBeta = maxTotalBeta; sumBeta >= currentBeta; --sumBeta) {
            if (expenditureMatrix[sumAlpha - currentAlpha][sumBeta - currentBeta] !== initialLargeValue) {
                expenditureMatrix[sumAlpha][sumBeta] = Math.min(
                    expenditureMatrix[sumAlpha][sumBeta],
                    expenditureMatrix[sumAlpha - currentAlpha][sumBeta - currentBeta] + currentPrice
                );
            }
        }
    }
});

let lowestOverallExpenditure = initialLargeValue;
for (let multipleFactor = 1; ; ++multipleFactor) {
    const currentTargetAlpha = desiredRatioA * multipleFactor;
    const currentTargetBeta = desiredRatioB * multipleFactor;

    if (currentTargetAlpha > maxTotalAlpha || currentTargetBeta > maxTotalBeta) {
        break;
    }

    lowestOverallExpenditure = Math.min(
        lowestOverallExpenditure,
        expenditureMatrix[currentTargetAlpha][currentTargetBeta]
    );
}

console.log(lowestOverallExpenditure === initialLargeValue ? -1 : lowestOverallExpenditure);