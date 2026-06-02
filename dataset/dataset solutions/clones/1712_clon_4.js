"use strict";

const rawInput = require("fs").readFileSync("/dev/stdin", "utf8");
const numericTokens = rawInput.split(/\s+/).filter(Boolean).map(Number);
let tokenPointer = 0;

const retrieveNextScalar = () => numericTokens[tokenPointer++];
const retrieveNextVector = (count) => {
    const segment = numericTokens.slice(tokenPointer, tokenPointer + count);
    tokenPointer += count;
    return segment;
};

const processOptimization = () => {
    const dailyCount = retrieveNextScalar();
    const categoryCount = 26;
    const decayFactors = retrieveNextVector(categoryCount);

    const initialOptimizationState = {
        accumulatedValues: Array(categoryCount).fill(0),
        totalSatisfaction: 0,
        dailySelections: []
    };

    const finalOptimizationState = Array.from({ length: dailyCount }).reduce((currentDayState, _, dayIndex) => {
        const currentDaySatisfactions = retrieveNextVector(categoryCount);

        const decayedValues = currentDayState.accumulatedValues.map((val, idx) => val - decayFactors[idx]);

        let bestUtility = -Infinity;
        let chosenCategoryIndex = -1;

        decayedValues.forEach((decayedVal, categoryIdx) => {
            const currentUtility = currentDaySatisfactions[categoryIdx] - decayedVal + decayFactors[categoryIdx];
            if (currentUtility > bestUtility) {
                bestUtility = currentUtility;
                chosenCategoryIndex = categoryIdx;
            }
        });

        const nextDayAccumulatedValues = [...decayedValues];
        nextDayAccumulatedValues[chosenCategoryIndex] = 0;

        let currentDaySatisfactionContribution = currentDaySatisfactions[chosenCategoryIndex];
        currentDaySatisfactionContribution += nextDayAccumulatedValues.reduce((sum, val) => sum + val, 0);

        return {
            accumulatedValues: nextDayAccumulatedValues,
            totalSatisfaction: currentDayState.totalSatisfaction + currentDaySatisfactionContribution,
            dailySelections: [...currentDayState.dailySelections, chosenCategoryIndex + 1]
        };
    }, initialOptimizationState);

    return finalOptimizationState.dailySelections.join("\n");
};

const executionResult = processOptimization();
if (executionResult !== undefined) {
    console.log(String(executionResult));
}
