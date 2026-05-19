const createInputReader = (inputString) => {
    const allLines = inputString.trim().split("\n");
    let currentLineIndex = 0;
    let currentLineParts = [];

    const readerMethods = {
        fetchNextAtom: (returnAsString) => {
            if (currentLineParts.length === 0) {
                if (currentLineIndex >= allLines.length) {
                    throw new Error("Input exhausted: attempting to fetch atom.");
                }
                currentLineParts = allLines[currentLineIndex++].trim().split(" ");
            }
            const extracted = currentLineParts.shift();
            return returnAsString ? extracted : Number(extracted);
        },

        fetchNextLine: (returnAsString) => {
            if (currentLineIndex >= allLines.length) {
                throw new Error("Input exhausted: attempting to fetch line.");
            }
            currentLineParts = [];
            const line = allLines[currentLineIndex++].trim();
            const parts = line.split(" ");
            return returnAsString ? parts : parts.map(Number);
        },

        fetchNextBlock: (numLines, returnAsString) => {
            const block = [];
            for (let i = 0; i < numLines; i++) {
                block.push(readerMethods.fetchNextLine(returnAsString));
            }
            return block;
        },

        fetchRawLines: (numLines, returnAsString) => {
            if (currentLineIndex + numLines > allLines.length) {
                throw new Error("Input exhausted: attempting to fetch raw lines.");
            }
            currentLineParts = [];
            const rawBlock = allLines.slice(currentLineIndex, currentLineIndex + numLines);
            currentLineIndex += numLines;
            return returnAsString ? rawBlock : rawBlock.map(Number);
        }
    };
    return readerMethods;
};

const createMultiDimArray = (initialValue, ...dimensions) => {
    const buildArray = (dims) => {
        if (dims.length === 0) {
            try {
                const parsed = JSON.parse(initialValue);
                return parsed;
            } catch (e) {
                return initialValue;
            }
        }
        const currentDimSize = dims[0];
        const remainingDims = dims.slice(1);
        return Array.from({ length: currentDimSize }, () => buildArray(remainingDims));
    };
    return buildArray(dimensions);
};

const inputReader = createInputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

let nVal, mVal, graphStructure;

console.log(processMainLogic());

function processMainLogic() {
    nVal = inputReader.fetchNextAtom();
    mVal = inputReader.fetchNextAtom();
    const adjacencyData = inputReader.fetchNextBlock(mVal);
    graphStructure = createMultiDimArray("[]", nVal);

    adjacencyData.forEach(edge => {
        graphStructure[edge[0] - 1].push(edge[1] - 1);
    });

    let shortestCyclePath = Array(nVal + 1);

    const finalResultPath = Array.from({ length: nVal }, (_, nodeIndex) => nodeIndex)
        .reduce((currentMinPath, currentNode) => {
            const cycleCandidate = findShortestCycle(currentNode);
            if (cycleCandidate && cycleCandidate.length < currentMinPath.length) {
                return cycleCandidate;
            }
            return currentMinPath;
        }, shortestCyclePath);

    if (finalResultPath.length === nVal + 1) {
        return -1;
    }
    console.log(finalResultPath.length);
    return finalResultPath.join("\n");
}

function findShortestCycle(startNode) {
    const visitedNodes = new Set();
    const bfsQueue = [];

    bfsQueue.push([startNode, [startNode]]);
    visitedNodes.add(startNode);

    let queueHead = 0;

    while (queueHead < bfsQueue.length) {
        const [currentNode, currentPath] = bfsQueue[queueHead++];

        for (const neighbor of graphStructure[currentNode]) {
            if (neighbor === startNode) {
                const cyclePath = currentPath.concat(startNode);
                return cyclePath.map(node => node + 1);
            }

            if (!visitedNodes.has(neighbor)) {
                visitedNodes.add(neighbor);
                bfsQueue.push([neighbor, currentPath.concat(neighbor)]);
            }
        }
    }
    return null;
}
