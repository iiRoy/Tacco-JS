function categorizePoints(pointStrings) {
    return pointStrings.reduce((accumulator, currentString) => {
        const numericValue = Number(currentString);
        if (numericValue % 10 === 0) {
            accumulator.tens.push(numericValue);
            accumulator.tensSum += numericValue;
        } else {
            accumulator.others.push(numericValue);
        }
        return accumulator;
    }, { tens: [], others: [], tensSum: 0 });
}

function evaluateSubsetSums(baseValue, subsetElements, startIndex) {
    const computationStack = [];
    const memoizationCache = new Map();

    computationStack.push({
        currentSum: baseValue,
        currentIndex: startIndex,
        stage: 0,
        resultA: null,
        resultB: null
    });

    while (computationStack.length > 0) {
        const currentFrame = computationStack[computationStack.length - 1];
        const { currentSum, currentIndex, stage } = currentFrame;
        const cacheKey = `${currentSum}-${currentIndex}`;

        if (memoizationCache.has(cacheKey)) {
            computationStack.pop();
            continue;
        }

        if (currentIndex >= subsetElements.length) {
            memoizationCache.set(cacheKey, currentSum);
            computationStack.pop();
            continue;
        }

        if (stage === 0) {
            const nextSumA = currentSum + subsetElements[currentIndex];
            const nextIndexA = currentIndex + 1;
            const cacheKeyA = `${nextSumA}-${nextIndexA}`;

            if (memoizationCache.has(cacheKeyA)) {
                currentFrame.resultA = memoizationCache.get(cacheKeyA);
                currentFrame.stage = 1;
            } else {
                computationStack.push({
                    currentSum: nextSumA,
                    currentIndex: nextIndexA,
                    stage: 0,
                    resultA: null,
                    resultB: null
                });
                continue;
            }
        }

        if (stage === 1) {
            const nextSumB = currentSum;
            const nextIndexB = currentIndex + 1;
            const cacheKeyB = `${nextSumB}-${nextIndexB}`;

            if (memoizationCache.has(cacheKeyB)) {
                currentFrame.resultB = memoizationCache.get(cacheKeyB);
                currentFrame.stage = 2;
            } else {
                computationStack.push({
                    currentSum: nextSumB,
                    currentIndex: nextIndexB,
                    stage: 0,
                    resultA: null,
                    resultB: null
                });
                continue;
            }
        }

        if (stage === 2) {
            const valA = currentFrame.resultA;
            const valB = currentFrame.resultB;
            let finalResult;

            if (valA >= valB && valA % 10 !== 0) {
                finalResult = valA;
            } else if (valB >= valA && valB % 10 !== 0) {
                finalResult = valB;
            } else {
                finalResult = 0;
            }

            memoizationCache.set(cacheKey, finalResult);
            computationStack.pop();
        }
    }

    return memoizationCache.get(`${baseValue}-${startIndex}`);
}

function determineOptimalValue(currentPointValue, exclusionIndex, categorizedData) {
    const relevantPoints = categorizedData.others.reduce((acc, pt, idx) => {
        if (idx !== exclusionIndex) {
            acc.push(pt);
        }
        return acc;
    }, []);
    return evaluateSubsetSums(currentPointValue + categorizedData.tensSum, relevantPoints, 0);
}

function processInputData(rawData) {
    const lines = rawData.split("\n");
    const dataPoints = lines.slice(1);
    const categorized = categorizePoints(dataPoints);

    const finalMaximum = categorized.others.reduce((currentMax, pointValue, index) => {
        const calculatedValue = determineOptimalValue(pointValue, index, categorized);
        return Math.max(currentMax, calculatedValue);
    }, 0);

    return finalMaximum;
}

console.log(processInputData(require("fs").readFileSync("/dev/stdin", "utf8")));
