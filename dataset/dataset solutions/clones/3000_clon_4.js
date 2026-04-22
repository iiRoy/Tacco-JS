const dataStream = (rawContent) => {
    let contentLines = rawContent.trim().split(/\r?\n/).filter(line => line.length > 0);
    let currentLinePointer = 0;
    let currentLineTokens = null;
    let currentTokenIndex = 0;

    const fillTokens = () => {
        if (currentLineTokens === null || currentTokenIndex >= currentLineTokens.length) {
            if (currentLinePointer >= contentLines.length) {
                throw new Error("Input stream exhausted");
            }
            currentLineTokens = contentLines[currentLinePointer].split(/\s+/).filter(token => token.length > 0);
            currentLinePointer++;
            currentTokenIndex = 0;
            if (currentLineTokens.length === 0) {
                return fillTokens();
            }
        }
    };

    return {
        grabNext: (asString = false) => {
            fillTokens();
            const token = currentLineTokens[currentTokenIndex++];
            return asString ? token : Number(token);
        },
        extractLine: (asString = false) => {
            if (currentLinePointer >= contentLines.length) {
                throw new Error("Input stream exhausted");
            }
            currentLineTokens = null;
            currentTokenIndex = 0;

            const lineData = contentLines[currentLinePointer++];
            const tokens = lineData.split(/\s+/).filter(token => token.length > 0);
            return asString ? tokens : tokens.map(Number);
        },
        extractTable: (rows, asString = false) => {
            if (currentLinePointer + rows > contentLines.length) {
                throw new Error("Not enough lines for table extraction");
            }
            currentLineTokens = null;
            currentTokenIndex = 0;

            const tableRows = contentLines.slice(currentLinePointer, currentLinePointer + rows);
            currentLinePointer += rows;
            return tableRows.map(line => {
                const tokens = line.split(/\s+/).filter(token => token.length > 0);
                return asString ? tokens : tokens.map(Number);
            });
        },
        extractSeries: (rows, asString = false) => {
            if (currentLinePointer + rows > contentLines.length) {
                throw new Error("Not enough lines for series extraction");
            }
            currentLineTokens = null;
            currentTokenIndex = 0;

            const seriesLines = contentLines.slice(currentLinePointer, currentLinePointer + rows);
            currentLinePointer += rows;
            return asString ? seriesLines : seriesLines.map(Number);
        }
    };
};

const matrixBuilder = (initialValue, ...dimensions) => {
    const normalizeInitial = (val) => {
        if (typeof val === 'string') {
            try {
                const parsed = JSON.parse(val);
                return parsed;
            } catch (e) {
                // Not valid JSON, treat as string literal
            }
        }
        return val;
    };

    const baseElement = normalizeInitial(initialValue);

    const constructRecursive = (dims) => {
        if (dims.length === 0) {
            return (typeof baseElement === 'object' && baseElement !== null)
                ? JSON.parse(JSON.stringify(baseElement))
                : baseElement;
        }
        const currentDimensionSize = dims[0];
        const remainingDimensions = dims.slice(1);
        const result = new Array(currentDimensionSize);
        for (let i = 0; i < currentDimensionSize; i++) {
            result[i] = constructRecursive(remainingDimensions);
        }
        return result;
    };
    return constructRecursive(dimensions);
};

const processGraph = () => {
    const inputSource = dataStream(require("fs").readFileSync("/dev/stdin", "utf8"));
    const vertexCount = inputSource.grabNext();

    const adjacencies = matrixBuilder("[]", vertexCount);

    for (let linkIndex = 0; linkIndex < vertexCount - 1; linkIndex++) {
        const [node1, node2] = inputSource.extractLine().map(id => id - 1);
        adjacencies[node1].push(node2);
        adjacencies[node2].push(node1);
    }

    const performBFS = (startNodeId) => {
        const traversalQueue = [];
        traversalQueue.push([startNodeId, 0]);
        const seenNodes = new Set();
        seenNodes.add(startNodeId);

        let finalNode = startNodeId;
        let greatestDistance = 0;
        let queueHead = 0;

        while (queueHead < traversalQueue.length) {
            const [currentNodeId, currentDist] = traversalQueue[queueHead++];

            if (currentDist > greatestDistance) {
                greatestDistance = currentDist;
                finalNode = currentNodeId;
            }

            for (const neighborId of adjacencies[currentNodeId]) {
                if (!seenNodes.has(neighborId)) {
                    seenNodes.add(neighborId);
                    traversalQueue.push([neighborId, currentDist + 1]);
                }
            }
        }
        return { furthestNode: finalNode, maxPathLength: greatestDistance };
    };

    const firstTraversalResult = performBFS(0);
    const secondTraversalResult = performBFS(firstTraversalResult.furthestNode);

    const graphDiameter = secondTraversalResult.maxPathLength;

    return graphDiameter % 3 === 2 ? "Second" : "First";
};

console.log(processGraph());