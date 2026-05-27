"use strict";
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenizedInput = rawData.split(/ |\n/);
var tokenIndex = 0;

function readNextInt() {
    return +tokenizedInput[tokenIndex++];
}

function readNextString() {
    return tokenizedInput[tokenIndex++];
}

function readNextBigInt() {
    return BigInt(tokenizedInput[tokenIndex++]);
}

function readNItems(count, returnStrings) {
    if (returnStrings) {
        return tokenizedInput.slice(tokenIndex, tokenIndex += count);
    } else {
        return tokenizedInput.slice(tokenIndex, tokenIndex += count).map(val => +val);
    }
}

function readMatrix(height, width, returnStrings) {
    var resultMatrix = [];
    var rowIdx = 0;
    if (returnStrings) {
        for (; rowIdx < height; rowIdx++) {
            resultMatrix.push(tokenizedInput.slice(tokenIndex, tokenIndex += width));
        }
    } else {
        for (; rowIdx < height; rowIdx++) {
            resultMatrix.push(tokenizedInput.slice(tokenIndex, tokenIndex += width).map(val => +val));
        }
    }
    return resultMatrix;
}

function createMultiDimArray(initialValue, ...dimensions) {
    const createRecursiveArray = (val, dims) => {
        if (dims.length === 0) {
            return val;
        }
        const currentDimensionSize = dims[0];
        const remainingDimensions = dims.slice(1);
        var newArray = new Array(currentDimensionSize);
        for (var k = 0; k < currentDimensionSize; k++) {
            newArray[k] = createRecursiveArray(val, remainingDimensions);
        }
        return newArray;
    };
    return createRecursiveArray(initialValue, dimensions);
}

var totalScore = 0;
var finalOutput = processMainLogic();
if (finalOutput !== undefined) {
    console.log(String(finalOutput));
}

function processMainLogic() {
    const numDays = readNextInt();
    const typeCount = 26;
    const decayCosts = readNItems(typeCount, false);

    var currentSatisfactionLevels = createMultiDimArray(0, typeCount);
    var chosenTypesPerDay = [];

    for (var dayIdx = 0; dayIdx < numDays; dayIdx++) {
        var dailyTypeScores = readNItems(typeCount, false);
        var maxPotentialScoreForDay = -1e9;
        var bestTypeChoiceIndex = 0;

        for (var typeIdx = 0; typeIdx < typeCount; typeIdx++) {
            currentSatisfactionLevels[typeIdx] -= decayCosts[typeIdx];
            var calculatedPotentialScore = dailyTypeScores[typeIdx] - currentSatisfactionLevels[typeIdx] + decayCosts[typeIdx];
            if (maxPotentialScoreForDay < calculatedPotentialScore) {
                maxPotentialScoreForDay = calculatedPotentialScore;
                bestTypeChoiceIndex = typeIdx;
            }
        }

        chosenTypesPerDay[dayIdx] = bestTypeChoiceIndex + 1;
        currentSatisfactionLevels[bestTypeChoiceIndex] = 0;

        var scoreFromChosenType = dailyTypeScores[bestTypeChoiceIndex];
        var sumOfCurrentSatisfaction = 0;
        for (var typeIdx = 0; typeIdx < typeCount; typeIdx++) {
            sumOfCurrentSatisfaction += currentSatisfactionLevels[typeIdx];
        }
        totalScore += scoreFromChosenType + sumOfCurrentSatisfaction;
    }
    return chosenTypesPerDay.join("\n");
}
