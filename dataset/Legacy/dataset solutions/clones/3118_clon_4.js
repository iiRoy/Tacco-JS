const createInputSource = (rawContent) => {
    const allLines = rawContent.trim().split('\n');
    let currentLineIndex = 0;
    let currentLineTokenBuffer = null;

    const advanceLinePointer = () => {
        currentLineIndex++;
        currentLineTokenBuffer = null;
    };

    const retrieveNextToken = (asString) => {
        if (currentLineIndex >= allLines.length) {
            return undefined;
        }

        if (currentLineTokenBuffer === null) {
            currentLineTokenBuffer = allLines[currentLineIndex].split(' ').reverse();
        }

        const value = currentLineTokenBuffer.pop();

        if (currentLineTokenBuffer.length === 0) {
            advanceLinePointer();
        }

        return asString ? value : Number(value);
    };

    const retrieveFullLine = (asString) => {
        if (currentLineIndex >= allLines.length) {
            return undefined;
        }
        const lineContent = allLines[currentLineIndex];
        advanceLinePointer();
        const tokens = lineContent.split(' ');
        return asString ? tokens : tokens.map(Number);
    };

    const retrieveMultipleLines = (count, asString) => {
        const result = [];
        for (let i = 0; i < count; i++) {
            if (currentLineIndex >= allLines.length) break;
            const lineContent = allLines[currentLineIndex];
            advanceLinePointer();
            const tokens = lineContent.split(' ');
            result.push(asString ? tokens : tokens.map(Number));
        }
        return result;
    };

    const retrieveRawLines = (count, asString) => {
        const result = [];
        for (let i = 0; i < count; i++) {
            if (currentLineIndex >= allLines.length) break;
            const lineContent = allLines[currentLineIndex];
            advanceLinePointer();
            result.push(asString ? lineContent : Number(lineContent));
        }
        return result;
    };

    return {
        getSingleValue: (asStr) => retrieveNextToken(asStr),
        getLineValues: (asStr) => retrieveFullLine(asStr),
        getMatrixValues: (num, asStr) => retrieveMultipleLines(num, asStr),
        getRawValues: (num, asStr) => retrieveRawLines(num, asStr),
    };
};

var inputProcessor = createInputSource(require("fs").readFileSync("/dev/stdin","utf8"));

function locateUpperBound(sortedArr, startIndex, endIndex, targetVal) {
    let lowBoundary = startIndex;
    let highBoundary = endIndex;
    while (lowBoundary < highBoundary) {
        let midPoint = Math.floor((lowBoundary + highBoundary) / 2);
        if (sortedArr[midPoint] <= targetVal) {
            lowBoundary = midPoint + 1;
        } else {
            highBoundary = midPoint;
        }
    }
    return lowBoundary;
}

console.log(processGraphData());

function processGraphData() {
    var nodeCount = inputProcessor.getSingleValue();
    var edgeCount = inputProcessor.getSingleValue();

    const degreeMap = new Map();

    Array.from({ length: edgeCount }).forEach(() => {
        const [nodeA, nodeB] = inputProcessor.getLineValues();
        degreeMap.set(nodeA, (degreeMap.get(nodeA) || 0) + 1);
        degreeMap.set(nodeB, (degreeMap.get(nodeB) || 0) + 1);
    });

    const allNodeIds = Array.from({ length: nodeCount }, (_, i) => i + 1);

    const hasOddDegree = allNodeIds.some(nodeId => {
        const currentDegree = degreeMap.get(nodeId) || 0;
        return currentDegree % 2 !== 0;
    });

    if (hasOddDegree) {
        return "No";
    }

    const totalSumOfAdjustedDegrees = allNodeIds.reduce((accumulator, nodeId) => {
        const currentDegree = degreeMap.get(nodeId) || 0;
        return accumulator + (currentDegree - 2);
    }, 0);

    return totalSumOfAdjustedDegrees >= 4 ? "Yes" : "No";
}
