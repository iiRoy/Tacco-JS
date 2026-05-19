"use strict";

const createInputReader = (rawInputString, valueParser = Number) => {
    let internalState = {
        sourceLines: rawInputString.split("\n"),
        lineCursor: 0,
        tokenCursor: 0,
        parserFunction: valueParser
    };

    const retrieveNextToken = (currentState) => {
        const currentLineContent = currentState.sourceLines[currentState.lineCursor];
        if (!currentLineContent) return [undefined, currentState];

        const lineTokens = currentLineContent.trim().split(" ");
        const parsedValue = currentState.parserFunction(lineTokens[currentState.tokenCursor]);

        let nextTokenIdx = currentState.tokenCursor + 1;
        let nextLineIdx = currentState.lineCursor;

        if (nextTokenIdx >= lineTokens.length) {
            nextTokenIdx = 0;
            nextLineIdx++;
        }

        return [parsedValue, { ...currentState, tokenCursor: nextTokenIdx, lineCursor: nextLineIdx }];
    };

    const retrieveLineTokens = (currentState) => {
        const currentLineContent = currentState.sourceLines[currentState.lineCursor];
        if (!currentLineContent) return [undefined, currentState];

        const parsedValues = currentLineContent.trim().split(" ").map(currentState.parserFunction);

        return [parsedValues, { ...currentState, tokenCursor: 0, lineCursor: currentState.lineCursor + 1 }];
    };

    return {
        readNextValue: () => {
            const [value, updatedState] = retrieveNextToken(internalState);
            internalState = updatedState;
            return value;
        },
        readAllLineValues: () => {
            const [values, updatedState] = retrieveLineTokens(internalState);
            internalState = updatedState;
            return values;
        }
    };
};

const createNestedArray = (dimensions, initialFillValue) => {
    return dimensions.reduceRight((accumulator, currentDimensionSize, index) => {
        if (index === dimensions.length - 1) {
            return Array.from({ length: currentDimensionSize }, () => initialFillValue);
        } else {
            return Array.from({ length: currentDimensionSize }, () =>
                JSON.parse(JSON.stringify(accumulator))
            );
        }
    }, initialFillValue);
};

const computeProductRange = (lowerBoundExclusive, upperBoundInclusive) => {
    if (lowerBoundExclusive >= upperBoundInclusive) return 1;

    return Array.from({ length: upperBoundInclusive - lowerBoundExclusive }, (_, i) => lowerBoundExclusive + 1 + i)
                .reduce((product, currentNum) => (product * currentNum), 1);
};

const processInputAndSolve = (inputContent) => {
    const dataStream = createInputReader(inputContent);
    const MODULO_PRIME = 1000000007;

    const totalCount = dataStream.readNextValue();
    const targetSum = dataStream.readNextValue();
    
    const valueSet = Array.from({ length: totalCount }, () => dataStream.readNextValue());
    valueSet.sort((a, b) => a - b);

    const precomputedFactorials = Array(totalCount + 1).fill(1);
    Array.from({ length: totalCount - 1 }, (_, i) => i + 2)
         .forEach(num => {
            precomputedFactorials[num] = (precomputedFactorials[num - 1] * num) % MODULO_PRIME;
         });

    const memoizationTable = createNestedArray([totalCount + 1, targetSum + 1], -1);

    const calculateCombinations = (currentK, currentX) => {
        if (memoizationTable[currentK][currentX] !== -1) {
            return memoizationTable[currentK][currentX];
        }

        if (currentX < valueSet[0]) {
            memoizationTable[currentK][currentX] = (currentX * precomputedFactorials[currentK]) % MODULO_PRIME;
        } else {
            const applicableElements = valueSet.filter(val => val <= currentX);
            const applicableCount = applicableElements.length;

            const accumulatedSum = applicableElements.reduce((acc, elementVal) => {
                return (acc + calculateCombinations(currentK - 1, currentX % elementVal)) % MODULO_PRIME;
            }, 0);

            memoizationTable[currentK][currentX] = (accumulatedSum * computeProductRange(applicableCount, currentK)) % MODULO_PRIME;
        }

        return memoizationTable[currentK][currentX];
    };

    console.log(calculateCombinations(totalCount, targetSum));
};

processInputAndSolve(require("fs").readFileSync("/dev/stdin", "utf8"));
