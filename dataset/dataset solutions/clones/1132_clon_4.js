const rawData = process.stdin.readFileSync(0, 'utf8');
const dataLines = rawData.trim().split('\n');

const firstLineElements = dataLines[0].split(/\s+/);
const targetAmount = parseInt(firstLineElements[0], 10);
const quantityOfCoins = parseInt(firstLineElements[1], 10);

const coinDenominations = dataLines[1].trim().split(/\s+/).map(str => parseInt(str, 10));

const unreachableMarker = Infinity;

const minimumCountsRegister = new Array(targetAmount + 1).fill(null);
minimumCountsRegister[0] = 0;

function calculateOptimalCoinCount(currentGoal, availableCoins, cacheStorage, impossibilityIndicator) {
    if (currentGoal === 0) {
        return 0;
    }
    if (currentGoal < 0) {
        return impossibilityIndicator;
    }
    if (cacheStorage[currentGoal] !== null) {
        return cacheStorage[currentGoal];
    }

    let lowestCombination = impossibilityIndicator;

    for (const coinValue of availableCoins) {
        const remainingGoal = currentGoal - coinValue;
        const resultForRemaining = calculateOptimalCoinCount(remainingGoal, availableCoins, cacheStorage, impossibilityIndicator);

        if (resultForRemaining !== impossibilityIndicator) {
            lowestCombination = Math.min(lowestCombination, 1 + resultForRemaining);
        }
    }

    cacheStorage[currentGoal] = lowestCombination;
    return lowestCombination;
}

const finalCalculationOutcome = calculateOptimalCoinCount(targetAmount, coinDenominations, minimumCountsRegister, unreachableMarker);

if (finalCalculationOutcome === unreachableMarker) {
    console.log(undefined);
} else {
    console.log(finalCalculationOutcome);
}