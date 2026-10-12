"use strict";

const createInputProcessor = (sourceText, valueParser = Number) => {
    const lineSegments = sourceText.split("\n");
    let currentLinePosition = 0;
    let currentSegmentPosition = 0;
    let activeSegments = [];

    const retrieveNextValue = () => {
        if (currentSegmentPosition >= activeSegments.length) {
            if (currentLinePosition >= lineSegments.length) return undefined;
            activeSegments = lineSegments[currentLinePosition].trim().split(" ");
            currentLinePosition++;
            currentSegmentPosition = 0;
        }
        if (currentSegmentPosition < activeSegments.length) {
            const val = activeSegments[currentSegmentPosition];
            currentSegmentPosition++;
            return valueParser(val);
        }
        return undefined;
    };

    const retrieveLineValues = () => {
        if (currentLinePosition >= lineSegments.length) return undefined;
        const line = lineSegments[currentLinePosition];
        currentLinePosition++;
        currentSegmentPosition = 0;
        return line.trim().split(" ").map(valueParser);
    };

    return {
        fetchValue: retrieveNextValue,
        fetchLine: retrieveLineValues
    };
};

const countSetBits = (num) => {
    let count = 0;
    while (num > 0) {
        num &= (num - 1);
        count++;
    }
    return count;
};

function processInputAndCompute(sourceData) {
    const dataProcessor = createInputProcessor(sourceData);
    const MODULUS = 1000000007;

    const totalElements = dataProcessor.fetchValue();
    const initialValue = dataProcessor.fetchValue();

    const elementSet = [];
    for (let k = 0; k < totalElements; k++) {
        elementSet.push(dataProcessor.fetchValue());
    }

    elementSet.sort((valA, valB) => valA - valB);

    const factorialCache = new Array(totalElements + 1);
    factorialCache[0] = 1;
    for (let k = 1; k <= totalElements; k++) {
        factorialCache[k] = (factorialCache[k - 1] * k) % MODULUS;
    }

    const memoizationTable = new Map();

    const recursiveSolver = (current_val, used_mask) => {
        if (memoizationTable.has(current_val)) {
            const innerMap = memoizationTable.get(current_val);
            if (innerMap.has(used_mask)) {
                return innerMap.get(used_mask);
            }
        }

        if (current_val < elementSet[0]) {
            const remaining_count = totalElements - countSetBits(used_mask);
            const base_result = (current_val * factorialCache[remaining_count]) % MODULUS;
            
            if (!memoizationTable.has(current_val)) {
                memoizationTable.set(current_val, new Map());
            }
            memoizationTable.get(current_val).set(used_mask, base_result);
            return base_result;
        }

        let considerationLimit = 0;
        while (considerationLimit < totalElements && elementSet[considerationLimit] < current_val) {
            considerationLimit++;
        }

        let accumulatedSum = 0;
        for (let k = 0; k < considerationLimit; k++) {
            if (!((used_mask >> k) & 1)) {
                const next_mask = used_mask | (1 << k);
                accumulatedSum = (accumulatedSum + recursiveSolver(current_val % elementSet[k], next_mask)) % MODULUS;
            }
        }
        
        if (!memoizationTable.has(current_val)) {
            memoizationTable.set(current_val, new Map());
        }
        memoizationTable.get(current_val).set(used_mask, accumulatedSum);
        return accumulatedSum;
    };

    console.log(recursiveSolver(initialValue, 0));
}

processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));
