"use strict";

const InputReader = (function() {
    const rawData = require("fs").readFileSync("/dev/stdin", "utf8");
    let tokenBuffer = rawData.split(/ |\n/);
    let tokenIndex = 0;

    function getNextToken() {
        return tokenBuffer[tokenIndex++];
    }

    return {
        readInt: function() { return +getNextToken(); },
        readString: function() { return getNextToken(); },
        readBigInt: function() { return BigInt(getNextToken()); },
        readArray: function(count, convertToNumber = true) {
            const startIndex = tokenIndex;
            tokenIndex += count;
            const slice = tokenBuffer.slice(startIndex, tokenIndex);
            return convertToNumber ? slice.map(Number) : slice;
        },
        readMatrix: function(height, width, convertToNumber = true) {
            const resultMatrix = [];
            for (let i = 0; i < height; i++) {
                const startIndex = tokenIndex;
                tokenIndex += width;
                const rowSlice = tokenBuffer.slice(startIndex, tokenIndex);
                resultMatrix.push(convertToNumber ? rowSlice.map(Number) : rowSlice);
            }
            return resultMatrix;
        }
    };
})();

function createMultiDimArray(initialValue) {
    const args = arguments;
    let len = args.length;
    let expression = "Array(args[" + --len + "]).fill().map(x=>{return " + initialValue + ";})";
    while (--len) {
        expression = "Array(args[" + len + "]).fill().map(x=>" + expression + ")";
    }
    return eval(expression);
}

function filterParetoOptimal(combinations) {
    if (combinations.length === 0) {
        return [];
    }
    const filtered = [combinations[0]];
    for (let i = 1; i < combinations.length; i++) {
        if (combinations[i][0] > filtered[filtered.length - 1][0]) {
            filtered.push(combinations[i]);
        }
    }
    return filtered;
}

const programOutput = executeProgram();
if (programOutput !== undefined) console.log(String(programOutput));

function executeProgram() {
    const itemCount = InputReader.readInt();
    const itemData = InputReader.readMatrix(itemCount, 2);

    const SPLIT_THRESHOLD = 11;
    const MAX_SMALL_N_LIMIT = 1 << SPLIT_THRESHOLD;
    const maxPrecomputedIndex = Math.min(itemCount, MAX_SMALL_N_LIMIT);
    const precomputedWeights = new Array(maxPrecomputedIndex);

    precomputedWeights[0] = [itemData[0]];

    for (let i = 1; i < maxPrecomputedIndex; i++) {
        const parentIndex = (i - 1) >> 1;
        const currentItem = itemData[i];

        let currentCombinations = precomputedWeights[parentIndex].concat();
        currentCombinations.push(currentItem);

        for (let j = 0; j < precomputedWeights[parentIndex].length; j++) {
            const prevCombo = precomputedWeights[parentIndex][j];
            const combinedWeight = prevCombo[1] + currentItem[1];
            if (combinedWeight <= 1e5) {
                currentCombinations.push([prevCombo[0] + currentItem[0], combinedWeight]);
            }
        }

        currentCombinations.sort((a, b) => a[1] - b[1]);
        precomputedWeights[i] = filterParetoOptimal(currentCombinations);
    }

    const queryCount = InputReader.readInt();
    const results = new Array(queryCount);

    function processSmallIndexQuery(targetIdx, maxAllowedWeight) {
        let currentMaxProfit = 0;
        for (let k = 0; k < precomputedWeights[targetIdx].length; k++) {
            const combo = precomputedWeights[targetIdx][k];
            if (combo[1] <= maxAllowedWeight && combo[0] > currentMaxProfit) {
                currentMaxProfit = combo[0];
            }
        }
        return currentMaxProfit;
    }

    function processLargeIndexQuery(targetIdx, maxAllowedWeight) {
        let currentMaxProfit = 0;
        let pathIndex = targetIdx;
        const currentDepth = 31 - Math.clz32(targetIdx + 1);

        let tempCombinations = [itemData[pathIndex]];

        for (let d = currentDepth; d >= SPLIT_THRESHOLD; d--) {
            pathIndex = (pathIndex - 1) >> 1;
            const itemToAdd = itemData[pathIndex];
            const existingCombinationsCount = tempCombinations.length;

            tempCombinations.push(itemToAdd);

            for (let k = 0; k < existingCombinationsCount; k++) {
                const prevCombo = tempCombinations[k];
                const combinedWeight = prevCombo[1] + itemToAdd[1];
                if (combinedWeight <= 1e5) {
                    tempCombinations.push([prevCombo[0] + itemToAdd[0], combinedWeight]);
                }
            }
        }

        tempCombinations.sort((a, b) => a[1] - b[1]);
        for (let k = 1; k < tempCombinations.length; k++) {
            if (tempCombinations[k][0] < tempCombinations[k - 1][0]) {
                tempCombinations[k][0] = tempCombinations[k - 1][0];
                tempCombinations[k][1] = 1e6;
            }
        }

        let tempCombinationsPointer = tempCombinations.length - 1;
        const smallPrecomputedList = precomputedWeights[pathIndex];

        for (let k = 0; k < smallPrecomputedList.length; k++) {
            const smallCombo = smallPrecomputedList[k];
            if (smallCombo[1] > 1e5) continue;

            while (tempCombinationsPointer >= 0 && tempCombinations[tempCombinationsPointer][1] + smallCombo[1] > maxAllowedWeight) {
                tempCombinationsPointer--;
            }

            if (tempCombinationsPointer < 0) break;

            const totalProfit = tempCombinations[tempCombinationsPointer][0] + smallCombo[0];
            if (totalProfit > currentMaxProfit) {
                currentMaxProfit = totalProfit;
            }
        }
        return currentMaxProfit;
    }

    for (let i = 0; i < queryCount; i++) {
        const targetIndex = InputReader.readInt();
        const maxWeight = InputReader.readInt();
        const adjustedTargetIndex = targetIndex - 1;

        const depth = 31 - Math.clz32(targetIndex);

        if (depth < SPLIT_THRESHOLD) {
            results[i] = processSmallIndexQuery(adjustedTargetIndex, maxWeight);
        } else {
            results[i] = processLargeIndexQuery(adjustedTargetIndex, maxWeight);
        }
    }

    return results.join("\n");
}
