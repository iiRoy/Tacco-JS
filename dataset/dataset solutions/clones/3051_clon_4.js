const obtainInputData = (rawText) => {
    const allLines = rawText.trim().split("\n");

    const dimensionIdentifier = parseInt(allLines[0].split(" ").pop(), 10);

    const valueSequence = allLines[1].split(" ").map(Number);

    return {
        seriesLength: dimensionIdentifier,
        numericSeries: valueSequence
    };
};

const calculateVisiblePeaks = (inputData) => {
    const sequence = inputData.numericSeries;
    const limit = inputData.seriesLength;

    const effectiveSequence = sequence.slice(0, limit);

    const result = effectiveSequence.reduce((accumulator, currentVal) => {
        const { currentCeiling, peakCount } = accumulator;
        if (currentVal >= currentCeiling) {
            return { currentCeiling: currentVal, peakCount: peakCount + 1 };
        }
        return accumulator;
    }, { currentCeiling: 0, peakCount: 0 });

    return result.peakCount;
};

const executionEntryPoint = () => {
    const rawInput = require("fs").readFileSync("/dev/stdin", "utf8");
    const processedData = obtainInputData(rawInput);
    return calculateVisiblePeaks(processedData);
};

console.log(executionEntryPoint());