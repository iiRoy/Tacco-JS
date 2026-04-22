const rawInput = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const linesOfData = rawInput.trim().split('\n');
const [itemCount, maxLoad] = linesOfData.shift().split(' ').map(Number);
const collectionOfGoods = linesOfData.map(line => {
    const [worth, mass] = line.split(' ').map(Number);
    return { worth, mass };
});
let recordedOutcomes = Array(itemCount).fill(null).map(() => Array(maxLoad + 1).fill(undefined));
function findBestOutcome(currentGoodIndex, remainingLoad) {
    if (currentGoodIndex < 0 || remainingLoad <= 0) {
        return 0;
    }
    if (recordedOutcomes[currentGoodIndex][remainingLoad] !== undefined) {
        return recordedOutcomes[currentGoodIndex][remainingLoad];
    }
    const currentGood = collectionOfGoods[currentGoodIndex];
    let valueIfNotIncluded = findBestOutcome(currentGoodIndex - 1, remainingLoad);
    let valueIfIncluded = 0;
    if (currentGood.mass <= remainingLoad) {
        const maxPossibleQuantity = Math.floor(remainingLoad / currentGood.mass);
        const totalMassOfTakenGoods = maxPossibleQuantity * currentGood.mass;
        const totalWorthOfTakenGoods = maxPossibleQuantity * currentGood.worth;
        valueIfIncluded = totalWorthOfTakenGoods + findBestOutcome(currentGoodIndex - 1, remainingLoad - totalMassOfTakenGoods);
    }
    recordedOutcomes[currentGoodIndex][remainingLoad] = Math.max(valueIfNotIncluded, valueIfIncluded);
    return recordedOutcomes[currentGoodIndex][remainingLoad];
}
const ultimateValue = findBestOutcome(itemCount - 1, maxLoad);
console.log(ultimateValue);