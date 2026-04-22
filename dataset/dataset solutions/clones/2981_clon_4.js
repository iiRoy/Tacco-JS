const createDataHandler = (sourceContent) => {
    const contentLines = sourceContent.trim().split('\n');
    let lineCursor = 0;

    const obtainSingleValue = (asStringFlag) => {
        let currentSegments = contentLines[lineCursor];
        if (typeof currentSegments === 'string') {
            currentSegments = currentSegments.split(' ').reverse();
            contentLines[lineCursor] = currentSegments;
        }

        const extractedValue = currentSegments.pop();
        if (currentSegments.length === 0) {
            lineCursor++;
        }
        return asStringFlag ? extractedValue : Number(extractedValue);
    };

    const retrieveLineElements = (asStringsFlag) => {
        const lineContent = contentLines[lineCursor];
        lineCursor++;
        const elements = lineContent.split(' ');
        return asStringsFlag ? elements : elements.map(Number);
    };

    const captureGroupedElements = (numLines, asStringsFlag) => {
        const collectedGroup = [];
        for (let i = 0; i < numLines; i++) {
            const lineContent = contentLines[lineCursor + i];
            collectedGroup.push(asStringsFlag ? lineContent.split(' ') : lineContent.split(' ').map(Number));
        }
        lineCursor += numLines;
        return collectedGroup;
    };

    const fetchRawLineSegment = (numLines, asStringsFlag) => {
        const segmentData = contentLines.slice(lineCursor, lineCursor + numLines);
        lineCursor += numLines;
        return asStringsFlag ? segmentData : segmentData.map(Number);
    };

    return {
        obtainSingleValue,
        retrieveLineElements,
        captureGroupedElements,
        fetchRawLineSegment
    };
};

const constructMultiDimensional = (valueGenerator, ...dimensions) => {
    const recursiveBuilder = (depth, currentDims) => {
        if (depth === currentDims.length) {
            return typeof valueGenerator === 'function' ? valueGenerator() : valueGenerator;
        }
        const currentDimensionSize = currentDims[depth];
        return Array.from({ length: currentDimensionSize }, () => recursiveBuilder(depth + 1, currentDims));
    };
    return recursiveBuilder(0, dimensions);
};

const performCalculation = () => {
    const dataAcquisition = createDataHandler(require("fs").readFileSync("/dev/stdin", "utf8"));

    const countOfSegments = dataAcquisition.obtainSingleValue();
    const stringSegments = dataAcquisition.fetchRawLineSegment(countOfSegments, true);

    const initialAccumulator = {
        accumulatedAB: 0,
        endingOnlyA: 0,
        startBEndB: 0,
        startBEndA: 0
    };

    const finalClassification = stringSegments.reduce((currentStats, currentText) => {
        const segmentABCount = Array.from(currentText).slice(0, -1).filter((char, idx) => char === 'A' && currentText[idx + 1] === 'B').length;
        currentStats.accumulatedAB += segmentABCount;

        const firstSymbol = currentText[0];
        const lastSymbol = currentText[currentText.length - 1];

        if (firstSymbol === 'B') {
            if (lastSymbol === 'A') {
                currentStats.startBEndA++;
            } else {
                currentStats.startBEndB++;
            }
        } else if (lastSymbol === 'A') {
            currentStats.endingOnlyA++;
        }
        return currentStats;
    }, initialAccumulator);

    const minimumEnds = Math.min(finalClassification.endingOnlyA, finalClassification.startBEndB);
    const maximumEnds = Math.max(finalClassification.endingOnlyA, finalClassification.startBEndB);

    if (maximumEnds > 0) {
        if (finalClassification.startBEndA > 0) {
            finalClassification.accumulatedAB += minimumEnds + finalClassification.startBEndA;
        } else {
            finalClassification.accumulatedAB += minimumEnds;
        }
    } else {
        finalClassification.accumulatedAB += finalClassification.startBEndA - 1;
    }

    return finalClassification.accumulatedAB;
};

console.log(performCalculation());