"use strict";

let tokenStream;
let tokenIndex = 0;

const initializeInput = () => {
    const sourceText = require("fs").readFileSync("/dev/stdin", "utf8");
    tokenStream = sourceText.split(/ |\n/);
    tokenIndex = 0;
};

const retrieveToken = (asString = false) => {
    const value = tokenStream[tokenIndex++];
    return asString ? value : Number(value);
};

const retrieveTokens = (count, asString = false) => {
    const segment = tokenStream.slice(tokenIndex, tokenIndex + count);
    tokenIndex += count;
    return asString ? segment : segment.map(Number);
};

const retrieveMatrix = (height, width, asString = false) => {
    return Array.from({ length: height }, () => {
        const row = tokenStream.slice(tokenIndex, tokenIndex + width);
        tokenIndex += width;
        return asString ? row : row.map(Number);
    });
};

const constructMultiDimArray = (initialValue, ...dimensions) => {
    const valueFactory = typeof initialValue === 'function' ? initialValue : () => initialValue;

    const buildArrayRecursive = (dims) => {
        if (dims.length === 0) {
            return valueFactory();
        }
        const currentDimensionSize = dims[0];
        const remainingDimensions = dims.slice(1);
        return Array.from({ length: currentDimensionSize }, () => buildArrayRecursive(remainingDimensions));
    };
    return buildArrayRecursive(dimensions);
};

const analyzeSegment = (segmentString) => {
    const initialMetrics = { currentBalance: 0, minimumBalanceEncountered: 0 };
    const finalMetrics = Array.from(segmentString).reduce((accumulator, character) => {
        accumulator.currentBalance += (character === '(' ? 1 : -1);
        accumulator.minimumBalanceEncountered = Math.min(accumulator.minimumBalanceEncountered, accumulator.currentBalance);
        return accumulator;
    }, initialMetrics);
    return { minBalance: finalMetrics.minimumBalanceEncountered, finalBalance: finalMetrics.currentBalance };
};

const processSegments = (segments, initialBalance, sortComparator, failureCondition) => {
    return segments
        .sort(sortComparator)
        .reduce((state, metric) => {
            if (!state.isFeasible) return state;
            if (failureCondition(metric, state.currentBalance)) {
                return { isFeasible: false, currentBalance: state.currentBalance };
            }
            return { isFeasible: true, currentBalance: state.currentBalance + metric.finalBalance };
        }, { isFeasible: true, currentBalance: initialBalance });
};

function mainLogic() {
    const negativeOutcome = "No";
    const positiveOutcome = "Yes";

    const sequenceCount = retrieveToken();
    const allSegmentMetrics = Array.from({ length: sequenceCount }, () => {
        const segmentText = retrieveToken(true);
        return analyzeSegment(segmentText);
    });

    const totalFinalBalanceAccumulator = allSegmentMetrics.reduce((sum, metric) => sum + metric.finalBalance, 0);
    if (totalFinalBalanceAccumulator !== 0) {
        return negativeOutcome;
    }

    const nonNegativeDipSegments = allSegmentMetrics.filter(metric => metric.minBalance >= 0);
    const mixedDipSegments = allSegmentMetrics.filter(metric => metric.minBalance < 0 && metric.finalBalance > 0);
    const closingDominantSegments = allSegmentMetrics.filter(metric => metric.minBalance < 0 && metric.finalBalance <= 0);

    let currentAvailableBalance = nonNegativeDipSegments.reduce((acc, metric) => acc + metric.finalBalance, 0);

    const mixedSegmentResult = processSegments(
        mixedDipSegments,
        currentAvailableBalance,
        (a, b) => a.minBalance - b.minBalance,
        (metric, balance) => metric.minBalance > balance
    );

    if (!mixedSegmentResult.isFeasible) {
        return negativeOutcome;
    }
    currentAvailableBalance = mixedSegmentResult.currentBalance;

    const closingSegmentResult = processSegments(
        closingDominantSegments,
        currentAvailableBalance,
        (a, b) => b.minBalance - a.minBalance,
        (metric, balance) => Math.abs(metric.minBalance) > balance
    );

    if (!closingSegmentResult.isFeasible) {
        return negativeOutcome;
    }

    return positiveOutcome;
}

initializeInput();
const finalOutput = mainLogic();
if (finalOutput !== undefined) {
    console.log(finalOutput);
}
