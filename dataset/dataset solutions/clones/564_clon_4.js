const fileSystem = require('fs');

const computeSequencePeak = (dataSeries, segmentLength) => {
    if (segmentLength === 0) {
        console.log(0);
        return;
    }
    if (dataSeries.length <= segmentLength) {
        console.log(undefined);
        return;
    }

    const initialSumValue = dataSeries.slice(1, segmentLength + 1).reduce((accumulator, value) => accumulator + value, 0);

    const { maxSoFar } = Array.from({ length: dataSeries.length - segmentLength }).reduce(
        (accumulator, _, currentIndex) => {
            let currentCalculatedSum;
            if (currentIndex === 0) {
                currentCalculatedSum = initialSumValue;
            } else {
                currentCalculatedSum = accumulator.previousSum - dataSeries[currentIndex - 1] + dataSeries[currentIndex + segmentLength];
            }
            return {
                previousSum: currentCalculatedSum,
                maxSoFar: Math.max(accumulator.maxSoFar, currentCalculatedSum),
            };
        },
        { previousSum: initialSumValue, maxSoFar: initialSumValue }
    );

    console.log(maxSoFar);
};

const processInputLines = (rawInputContent) => {
    const allInputLines = rawInputContent.trim().split("\n");

    allInputLines.reduce((state, lineContent, lineIndex) => {
        if (state.shouldTerminate) {
            return state;
        }

        if (lineContent === "0 0") {
            if (state.hasProcessedFirstBlock || lineIndex !== 0) {
                computeSequencePeak(state.currentNumericSet, state.currentWindowDimension);
            }
            return { ...state, shouldTerminate: true };
        }

        const parsedNumericValues = lineContent.split(" ").map(Number);
        const isBlockBoundary = parsedNumericValues.length === 2;
        const isLastInputLine = lineIndex === allInputLines.length - 1;

        if (isBlockBoundary || isLastInputLine) {
            if (state.hasProcessedFirstBlock || lineIndex !== 0) {
                computeSequencePeak(state.currentNumericSet, state.currentWindowDimension);
            }
            return {
                currentNumericSet: [],
                currentWindowDimension: parsedNumericValues[1],
                hasProcessedFirstBlock: true,
                shouldTerminate: false,
            };
        } else {
            return {
                ...state,
                currentNumericSet: [...state.currentNumericSet, parsedNumericValues[0]],
                hasProcessedFirstBlock: true,
            };
        }
    }, { currentNumericSet: [], currentWindowDimension: 0, hasProcessedFirstBlock: false, shouldTerminate: false });
};

processInputLines(fileSystem.readFileSync('/dev/stdin', 'utf8'));
