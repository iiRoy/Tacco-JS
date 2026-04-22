const MAX_ITEM_SCORE_LIMIT = 1000;
const IMPOSSIBLE_ALLOCATION_WEIGHT = Infinity;

const dataSourceText = require('fs').readFileSync('/dev/stdin', 'utf8');

const parseNumericalSequence = (textSegment) => textSegment.split(' ').map(Number);

const allInputLines = dataSourceText.trim().split('\n');

const initialConfigurationTokens = parseNumericalSequence(allInputLines[0]);
const totalObjectCount = initialConfigurationTokens[0];
const maximumPermittedWeight = initialConfigurationTokens[1];

const objectDetailsCollection = allInputLines.slice(1).map(parseNumericalSequence); // [score, mass]

const outcomeCache = new Map(); // Map<objectIndex, Map<targetScore, minimumMass>>

const determineMinimalMassForScore = (currentObjectIndex, desiredScore) => {
    if (desiredScore < 0) {
        return IMPOSSIBLE_ALLOCATION_WEIGHT;
    }
    if (currentObjectIndex === -1) {
        return desiredScore === 0 ? 0 : IMPOSSIBLE_ALLOCATION_WEIGHT;
    }

    if (outcomeCache.has(currentObjectIndex) && outcomeCache.get(currentObjectIndex).has(desiredScore)) {
        return outcomeCache.get(currentObjectIndex).get(desiredScore);
    }

    const currentItem = objectDetailsCollection[currentObjectIndex];
    const itemScore = currentItem[0];
    const itemMass = currentItem[1];

    // Option A: Exclude the current item
    const massExcludingCurrent = determineMinimalMassForScore(currentObjectIndex - 1, desiredScore);

    // Option B: Include the current item (if possible)
    let massIncludingCurrent = IMPOSSIBLE_ALLOCATION_WEIGHT;
    if (desiredScore >= itemScore) {
        const remainingMassForPreviousItems = determineMinimalMassForScore(currentObjectIndex - 1, desiredScore - itemScore);
        if (remainingMassForPreviousItems !== IMPOSSIBLE_ALLOCATION_WEIGHT) {
            massIncludingCurrent = remainingMassForPreviousItems + itemMass;
        }
    }

    if (!outcomeCache.has(currentObjectIndex)) {
        outcomeCache.set(currentObjectIndex, new Map());
    }
    const finalMinimalMass = Math.min(massExcludingCurrent, massIncludingCurrent);
    outcomeCache.get(currentObjectIndex).set(desiredScore, finalMinimalMass);
    return finalMinimalMass;
};

const executeScoreOptimization = () => {
    let highestAttainableScore = 0;
    const theoreticalMaxTotalScore = totalObjectCount * MAX_ITEM_SCORE_LIMIT;

    for (let currentScoreAttempt = theoreticalMaxTotalScore; currentScoreAttempt >= 0; --currentScoreAttempt) {
        const requiredMass = determineMinimalMassForScore(totalObjectCount - 1, currentScoreAttempt);
        if (requiredMass <= maximumPermittedWeight) {
            highestAttainableScore = currentScoreAttempt;
            break;
        }
    }
    return highestAttainableScore;
};

console.log(executeScoreOptimization());