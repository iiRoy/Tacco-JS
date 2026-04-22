function makeInputInterpreter(rawContent, valueParser) {
    const lines = rawContent.split("\n");
    let currentLineIndex = 0;
    let currentTokenIndex = 0;
    let lineTokens = [];

    const advanceLine = () => {
        if (currentLineIndex >= lines.length) {
            lineTokens = []; // Clear tokens for exhausted input
            return false;
        }
        lineTokens = lines[currentLineIndex].trim().split(" ");
        currentTokenIndex = 0;
        currentLineIndex++;
        return true;
    };

    // Initialize the first line's tokens
    advanceLine();

    return {
        grabNext: () => {
            if (currentTokenIndex >= lineTokens.length) {
                if (!advanceLine()) return undefined;
            }
            const token = lineTokens[currentTokenIndex];
            currentTokenIndex++;
            return valueParser(token);
        },
        grabLineElements: () => {
            if (currentLineIndex > lines.length || lineTokens.length === 0) return undefined;
            const elements = lineTokens.map(valueParser);
            advanceLine();
            return elements;
        }
    };
}

const MOD_VAL = 1000000007;
let factCache = [1, 1]; // Initialize 0! and 1!

function getFact(idx) {
    if (factCache[idx] !== undefined) {
        return factCache[idx];
    }
    factCache[idx] = (getFact(idx - 1) * idx) % MOD_VAL;
    return factCache[idx];
}

function countActiveBits(num) {
    let count = 0;
    for (let i = 0; i < 32; i++) { // Assuming N up to 31, standard integer bits
        if ((num >> i) & 1) {
            count++;
        }
    }
    return count;
}

function processCombinations(currentRemainder, activeMask, divisorSet, totalDivisorCount) {
    if (currentRemainder < divisorSet[0]) {
        const unusedCount = totalDivisorCount - countActiveBits(activeMask);
        return (currentRemainder * getFact(unusedCount)) % MOD_VAL;
    }

    let firstLargerIndex = divisorSet.findIndex(d => d >= currentRemainder);
    if (firstLargerIndex === -1) {
        firstLargerIndex = divisorSet.length;
    }

    const result = divisorSet.slice(0, firstLargerIndex)
        .reduce((accumulator, divisor, originalIndex) => {
            if (!((activeMask >> originalIndex) & 1)) {
                const newMask = activeMask | (1 << originalIndex);
                const subResult = processCombinations(currentRemainder % divisor, newMask, divisorSet, totalDivisorCount);
                return (accumulator + subResult) % MOD_VAL;
            }
            return accumulator;
        }, 0);

    return result;
}

(function (inputData) {
    const reader = makeInputInterpreter(inputData, Number);

    const countItems = reader.grabNext();
    const initialValue = reader.grabNext();

    const itemValues = Array.from({ length: countItems }, () => reader.grabNext());
    itemValues.sort((v1, v2) => v1 - v2);

    for (let i = 2; i <= countItems; i++) {
        getFact(i);
    }

    const finalResult = processCombinations(initialValue, 0, itemValues, countItems);

    console.log(finalResult);

})(require("fs").readFileSync("/dev/stdin", "utf8"));