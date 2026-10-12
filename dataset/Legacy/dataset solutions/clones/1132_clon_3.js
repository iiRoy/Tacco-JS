const parseInputData = (rawInputString) => {
    const inputLines = rawInputString.trim().split('\n');
    const [targetAmountStr, coinCountStr] = inputLines[0].split(' ');
    const targetAmount = Number(targetAmountStr);
    const coinCount = Number(coinCountStr);
    const coinValueStrings = inputLines[1].trim().split(' ');
    const coinValues = coinValueStrings.map(val => Number(val));
    return { target: targetAmount, count: coinCount, coins: coinValues };
};

const calculateMinCoinsForSum = (currentSumValue, availableCoins, memoizationMap, maxPossibleValue) => {
    let minimumCoinsFound = maxPossibleValue;
    const ONE_UNIT = 1; // Represents a single coin addition

    for (const coinDenomination of availableCoins) {
        const previousSumValue = currentSumValue - coinDenomination;
        // Guard against invalid or uncalculated previous states
        if (previousSumValue < 0 || !memoizationMap.has(previousSumValue)) {
            continue;
        }
        const coinsForPreviousSum = memoizationMap.get(previousSumValue);
        minimumCoinsFound = Math.min(coinsForPreviousSum, minimumCoinsFound);
    }
    return minimumCoinsFound;
};

const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedInput = parseInputData(rawInput);

const finalTargetAmount = processedInput.target;
const availableCoinDenominations = processedInput.coins;

const minCoinsRequiredMap = new Map();
const INITIAL_COIN_COUNT = 1; // A single coin itself requires 1 coin

// Initialize the map for base coin values
availableCoinDenominations.forEach(coin => {
    minCoinsRequiredMap.set(coin, INITIAL_COIN_COUNT);
});

// Define an "infinity" value for sums that cannot be reached
const IMPOSSIBLE_VALUE = finalTargetAmount + INITIAL_COIN_COUNT;

// Iterate through all possible sums from 0 up to the final target amount
for (let currentSum = 0; currentSum <= finalTargetAmount; currentSum++) {
    // If the current sum is one of the coin denominations, it's already initialized
    if (minCoinsRequiredMap.has(currentSum)) {
        continue;
    }

    // Determine the minimum coins needed for the current sum using previous calculations
    const determinedMin = calculateMinCoinsForSum(currentSum, availableCoinDenominations, minCoinsRequiredMap, IMPOSSIBLE_VALUE);

    // If a valid combination was found (not IMPOSSIBLE_VALUE), update the map
    if (determinedMin < IMPOSSIBLE_VALUE) {
        minCoinsRequiredMap.set(currentSum, determinedMin + INITIAL_COIN_COUNT);
    }
}

// Output the result for the final target amount
console.log(minCoinsRequiredMap.get(finalTargetAmount));
