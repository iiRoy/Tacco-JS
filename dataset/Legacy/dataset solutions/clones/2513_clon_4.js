const createInputProcessor = (rawInput) => {
    const originalLines = rawInput.trim().split('\n');
    let linePointer = 0; // Points to the next line to be processed by readRow, readGrid, readBlock
    let currentLineForReadSingle = null; // Stores the split and reversed tokens for readSingle method

    const getTokensForReadSingle = () => {
        if (currentLineForReadSingle === null) {
            if (linePointer >= originalLines.length) return []; // No more lines
            const line = originalLines[linePointer];
            currentLineForReadSingle = line.split(' ').reverse();
            // linePointer is NOT incremented here, only when currentLineForReadSingle is exhausted
        }
        return currentLineForReadSingle;
    };

    const fetchToken = (asString) => {
        const tokens = getTokensForReadSingle();
        if (tokens.length === 0) return undefined; // No more tokens

        const token = tokens.shift();
        if (tokens.length === 0) {
            currentLineForReadSingle = null; // Line exhausted for readSingle
            linePointer++; // Advance line pointer only when readSingle has fully consumed a line
        }
        return asString ? token : Number(token);
    };

    const fetchLine = (asString) => {
        // If readSingle has partially consumed a line, this call effectively skips the rest of that line
        // and moves to the next *full* line.
        if (currentLineForReadSingle !== null && currentLineForReadSingle.length > 0) {
            currentLineForReadSingle = null; // Discard remaining tokens for readSingle
            linePointer++; // Advance line pointer to the next *full* line
        } else if (currentLineForReadSingle !== null && currentLineForReadSingle.length === 0) {
            // readSingle just finished a line, linePointer already advanced.
            currentLineForReadSingle = null;
        }

        if (linePointer >= originalLines.length) return [];

        const line = originalLines[linePointer].split(' ');
        linePointer++;
        return asString ? line : line.map(Number);
    };

    const fetchMultiLine = (count, asString) => {
        // Similar logic for discarding partial readSingle line
        if (currentLineForReadSingle !== null && currentLineForReadSingle.length > 0) {
            currentLineForReadSingle = null;
            linePointer++;
        } else if (currentLineForReadSingle !== null && currentLineForReadSingle.length === 0) {
            currentLineForReadSingle = null;
        }

        const result = [];
        for (let i = 0; i < count; i++) {
            if (linePointer >= originalLines.length) {
                result.push([]); // Or handle error based on problem spec
                continue;
            }
            const line = originalLines[linePointer].split(' ');
            linePointer++;
            result.push(asString ? line : line.map(Number));
        }
        return result;
    };

    const fetchRawLines = (count, asString) => {
        // Similar logic for discarding partial readSingle line
        if (currentLineForReadSingle !== null && currentLineForReadSingle.length > 0) {
            currentLineForReadSingle = null;
            linePointer++;
        } else if (currentLineForReadSingle !== null && currentLineForReadSingle.length === 0) {
            currentLineForReadSingle = null;
        }

        const result = [];
        for (let i = 0; i < count; i++) {
            if (linePointer >= originalLines.length) {
                result.push(asString ? '' : NaN); // Or handle error based on problem spec
                continue;
            }
            const rawLine = originalLines[linePointer];
            linePointer++;
            result.push(asString ? rawLine : Number(rawLine));
        }
        return result;
    };

    return {
        readSingle: fetchToken,
        readRow: fetchLine,
        readGrid: fetchMultiLine,
        readBlock: fetchRawLines
    };
};

const generateMultiDimArray = (initialValue, ...dimensions) => {
    const createDim = (dims) => {
        if (dims.length === 0) {
            return initialValue;
        }
        const currentDimSize = dims[0];
        const remainingDims = dims.slice(1);
        return Array.from({ length: currentDimSize }, () => createDim(remainingDims));
    };
    return createDim(dimensions);
};

const executeGraphAnalysis = (inputSource) => {
    const nodeCount = inputSource.readSingle();
    const adjacencyMatrixStrings = inputSource.readBlock(nodeCount, true);

    let graphHasAnyOutgoingEdge = false;
    const nodeOutgoingStatus = Array.from({ length: nodeCount }, (_, i) => {
        const row = adjacencyMatrixStrings[i];
        const hasEdge = row.split('').some(char => char === '1');
        if (hasEdge) {
            graphHasAnyOutgoingEdge = true;
        }
        return hasEdge ? 1 : 0;
    });

    const isolatedNodeCount = nodeOutgoingStatus.filter(val => val === 0).length;

    if (!graphHasAnyOutgoingEdge) {
        return nodeCount;
    }

    const calculateMaxPathLength = () => {
        let overallMaximumDistance = 0;

        for (let i = 0; i < nodeCount; i++) {
            if (nodeOutgoingStatus[i] === 0) {
                continue;
            }

            const distances = generateMultiDimArray(-1, nodeCount);
            distances[i] = 0;
            const bfsQueue = []; // Stores [nodeIndex, currentDistance]

            const initialEdges = adjacencyMatrixStrings[i].split('');
            initialEdges.forEach((edgeChar, neighborIdx) => {
                if (edgeChar === '1') {
                    distances[neighborIdx] = 1;
                    bfsQueue.push([neighborIdx, 1]);
                }
            });

            let currentSourceMaxPath = 0;
            let queueHead = 0;

            while (queueHead < bfsQueue.length) {
                const [currentNode, currentDist] = bfsQueue[queueHead++];
                currentSourceMaxPath = Math.max(currentSourceMaxPath, currentDist);

                const neighborsOfCurrent = adjacencyMatrixStrings[currentNode].split('');
                neighborsOfCurrent.forEach((edgeChar, neighborNode) => {
                    if (edgeChar === '1') {
                        if (distances[neighborNode] === -1) {
                            distances[neighborNode] = currentDist + 1;
                            bfsQueue.push([neighborNode, currentDist + 1]);
                        } else if (distances[neighborNode] !== currentDist - 1 && distances[neighborNode] !== currentDist + 1) {
                            return -1; // Inconsistent path length, propagate error
                        }
                    }
                });
                if (currentSourceMaxPath === -1) return -1; // Propagate error from inner loop
            }
            overallMaximumDistance = Math.max(overallMaximumDistance, currentSourceMaxPath);
        }

        return overallMaximumDistance + isolatedNodeCount;
    };

    return calculateMaxPathLength();
};

const inputRawData = require("fs").readFileSync("/dev/stdin", "utf8");
const inputProcessorInstance = createInputProcessor(inputRawData);
console.log(executeGraphAnalysis(inputProcessorInstance));
