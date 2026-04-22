const makeDataProcessor = (sourceText) => {
    let lineSegments = sourceText.trim().split('\n');
    let currentLineIndex = 0;
    let currentLineWordCache = [];

    const retrieveNextToken = (keepRaw) => {
        if (currentLineWordCache.length === 0) {
            if (currentLineIndex >= lineSegments.length) {
                return undefined; // End of input
            }
            currentLineWordCache = lineSegments[currentLineIndex].split(' ').reverse();
            currentLineIndex++;
        }
        const token = currentLineWordCache.pop();
        return keepRaw ? token : Number(token);
    };

    const retrieveFullLine = (keepRaw) => {
        if (currentLineIndex >= lineSegments.length) {
            return undefined; // End of input
        }
        const line = lineSegments[currentLineIndex];
        currentLineIndex++;
        const words = line.split(' ');
        return keepRaw ? words : words.map(Number);
    };

    const retrieveMultipleLines = (count, keepRaw) => {
        const results = [];
        for (let i = 0; i < count; i++) {
            if (currentLineIndex >= lineSegments.length) break;
            const line = lineSegments[currentLineIndex];
            currentLineIndex++;
            const words = line.split(' ');
            results.push(keepRaw ? words : words.map(Number));
        }
        return results;
    };

    const retrieveRawLines = (count, keepRaw) => {
         const results = [];
        for (let i = 0; i < count; i++) {
            if (currentLineIndex >= lineSegments.length) break;
            const line = lineSegments[currentLineIndex];
            currentLineIndex++;
            results.push(keepRaw ? line : Number(line));
        }
        return results;
    };

    return {
        grabNumeric: (asString) => retrieveNextToken(asString),
        collectWords: (asString) => retrieveFullLine(asString),
        gatherTable: (numRows, asString) => retrieveMultipleLines(numRows, asString),
        fetchSequence: (numItems, asString) => retrieveRawLines(numItems, asString),
    };
};

const MIN_BOUNDARY_VAL = -1000000;
const MAX_BOUNDARY_VAL = 1000000;
const STEP_INCREMENT = 20;

const evaluateSum = (h_param, w_param, pointCollection) => {
    const { totalX, totalY } = pointCollection.reduce((acc, [px, py]) => {
        if (px * w_param + py * h_param > 0) {
            acc.totalX += px;
            acc.totalY += py;
        }
        return acc;
    }, { totalX: 0, totalY: 0 });
    return totalX * totalX + totalY * totalY;
};

const calculateOptimalDistance = (inputSource) => {
    const initialCount = inputSource.grabNumeric();
    const pointData = Array.from({ length: initialCount })
        .map(() => [inputSource.grabNumeric(), inputSource.grabNumeric()])
        .filter(([coordX, coordY]) => !(coordX === 0 && coordY === 0));

    let maxSquaredDistance = 0;

    const iterationValues = Array.from(
        { length: (MAX_BOUNDARY_VAL - MIN_BOUNDARY_VAL) / STEP_INCREMENT + 1 },
        (_, k) => MIN_BOUNDARY_VAL + k * STEP_INCREMENT
    );

    iterationValues.forEach(iterationValue => {
        maxSquaredDistance = Math.max(
            maxSquaredDistance,
            evaluateSum(MIN_BOUNDARY_VAL, iterationValue, pointData),
            evaluateSum(MAX_BOUNDARY_VAL, iterationValue, pointData),
            evaluateSum(iterationValue, MAX_BOUNDARY_VAL, pointData),
            evaluateSum(iterationValue, MIN_BOUNDARY_VAL, pointData)
        );
    });

    return Math.sqrt(maxSquaredDistance);
};

const inputSource = makeDataProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));
console.log(calculateOptimalDistance(inputSource));