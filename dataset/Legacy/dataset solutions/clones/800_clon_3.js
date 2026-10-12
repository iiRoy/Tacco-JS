const outputLog = console.log;

function setupStdinProcessing(callback) {
    if (typeof process !== "undefined" && process.stdin) {
        let rawDataBuffer = "";
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', (dataChunk) => {
            rawDataBuffer += dataChunk;
        });
        process.stdin.on('end', () => {
            const inputLines = rawDataBuffer.split("\n");
            callback(inputLines);
        });
    }
}

const parseNumericLines = (linesToParse) => {
    return linesToParse.map((lineStr) => {
        const parts = lineStr.split(" ");
        if (parts.length >= 2) {
            return parts.map(Number);
        } else {
            return Number(lineStr);
        }
    });
};

function processInputData(rawLines) {
    let processedLines = parseNumericLines(rawLines);
    const TERMINATION_CONDITION = [0, 0];

    while (processedLines.length > 0) {
        const currentLineData = processedLines.shift();
        const dimensions = currentLineData;

        const heightCount = dimensions[0];
        const widthCount = dimensions[1];

        if (heightCount === TERMINATION_CONDITION[0] && widthCount === TERMINATION_CONDITION[1]) {
            return;
        }

        const extractSubArrays = (sourceArray, countN, countM) => {
            const heights = sourceArray.splice(0, countN);
            const widths = sourceArray.splice(0, countM);
            return { heights, widths };
        };

        const { heights, widths } = extractSubArrays(processedLines, heightCount, widthCount);
        calculateIntersections(heights, widths);
    }
}

function calculateIntersections(heightsArray, widthsArray) {
    const heightSumsMap = generateSumFrequencies(heightsArray);
    const widthSumsMap = generateSumFrequencies(widthsArray);
    const intersectionCount = countCommonSums(heightSumsMap, widthSumsMap);
    outputLog(intersectionCount);
}

function generateSumFrequencies(inputArray) {
    const arrayLength = inputArray.length;
    const sumFrequencyMap = {};
    for (let outerIndex = 0; outerIndex < arrayLength; outerIndex++) {
        let currentSum = 0;
        for (let innerIndex = outerIndex + 1; innerIndex <= arrayLength; innerIndex++) {
            const elementValue = inputArray[innerIndex - 1];
            currentSum += elementValue;
            sumFrequencyMap[currentSum] = (sumFrequencyMap[currentSum] || 0) + 1;
        }
    }
    return sumFrequencyMap;
}

function countCommonSums(mapA, mapB) {
    let totalIntersections = 0;
    Object.keys(mapA).forEach((sumKey) => {
        if (mapB[sumKey]) {
            totalIntersections += mapA[sumKey] * mapB[sumKey];
        }
    });
    return totalIntersections;
}

setupStdinProcessing(processInputData);
