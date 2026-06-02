const InputReaderFactory = (rawInputString) => {
    let sourceLines = rawInputString.trim().split(/\r?\n/);
    let currentLinePointer = 0;
    let currentLineSegments = [];

    const ensureSegmentsAvailable = () => {
        if (currentLineSegments.length === 0 && currentLinePointer < sourceLines.length) {
            currentLineSegments = sourceLines[currentLinePointer++].split(' ').reverse();
        }
    };

    const extractNextSegment = (asString) => {
        ensureSegmentsAvailable();
        const segment = currentLineSegments.pop();
        return asString ? segment : Number(segment);
    };

    const retrieveLineSegments = (asStrings) => {
        if (currentLinePointer >= sourceLines.length) throw new Error("No more input lines.");
        const line = sourceLines[currentLinePointer++].split(' ');
        return asStrings ? line : line.map(Number);
    };

    const retrieveMultiLineSegments = (count, asStrings) => {
        return Array.from({ length: count }, () => retrieveLineSegments(asStrings));
    };

    const retrieveRawLines = (count, asNumbers) => {
        const extracted = sourceLines.slice(currentLinePointer, currentLinePointer + count);
        currentLinePointer += count;
        return asNumbers ? extracted.map(Number) : extracted;
    };

    return {
        readOne: extractNextSegment,
        readFullLine: retrieveLineSegments,
        readBlock: retrieveMultiLineSegments,
        readLinesDirect: retrieveRawLines,
    };
};

const createMultiDimensionalArray = (initialValue, ...dimensions) => {
    const constructArrayRecursively = (dims) => {
        if (dims.length === 0) {
            return initialValue;
        }
        const currentDimensionSize = dims[0];
        const remainingDimensions = dims.slice(1);
        return Array.from({ length: currentDimensionSize }, () => constructArrayRecursively(remainingDimensions));
    };
    return constructArrayRecursively(dimensions);
};

const solveProblem = () => {
    const dataStream = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

    const graphNodeCount = dataStream.readOne();
    const graphEdgeCount = dataStream.readOne();

    const shortestPathMatrix = createMultiDimensionalArray(1e9, graphNodeCount, graphNodeCount);

    Array.from({ length: graphNodeCount }, (_, nodeIdx) => {
        shortestPathMatrix[nodeIdx][nodeIdx] = 0;
    });

    const initialEdgeList = dataStream.readBlock(graphEdgeCount);
    initialEdgeList.forEach(edgeDetails => {
        const sourceNode = edgeDetails[0] - 1;
        const targetNode = edgeDetails[1] - 1;
        const edgeWeight = edgeDetails[2];
        shortestPathMatrix[sourceNode][targetNode] = shortestPathMatrix[targetNode][sourceNode] = edgeWeight;
    });

    Array.from({ length: graphNodeCount }, (_, intermediateVertex) => {
        Array.from({ length: graphNodeCount }, (_, startVertex) => {
            Array.from({ length: graphNodeCount }, (_, endVertex) => {
                const pathViaIntermediate = shortestPathMatrix[startVertex][intermediateVertex] + shortestPathMatrix[intermediateVertex][endVertex];
                if (shortestPathMatrix[startVertex][endVertex] > pathViaIntermediate) {
                    shortestPathMatrix[startVertex][endVertex] = pathViaIntermediate;
                }
            });
        });
    });

    const superfluousEdgeCount = initialEdgeList.reduce((accumulator, edgeDetails) => {
        const sourceNode = edgeDetails[0] - 1;
        const targetNode = edgeDetails[1] - 1;
        const edgeWeight = edgeDetails[2];
        if (shortestPathMatrix[sourceNode][targetNode] < edgeWeight) {
            return accumulator + 1;
        }
        return accumulator;
    }, 0);

    return superfluousEdgeCount;
};

console.log(solveProblem());
