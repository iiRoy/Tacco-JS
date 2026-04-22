const InputReaderFactory = (rawInputContent) => {
    let lineTokensStore = rawInputContent.trim().split('\n').map(line => line.split(' '));
    let currentLineCursor = 0;

    const extractTokenFromLine = (returnRaw) => {
        if (currentLineCursor >= lineTokensStore.length) {
            return undefined;
        }

        let activeLineSegments = lineTokensStore[currentLineCursor];
        if (activeLineSegments.length === 0) {
            currentLineCursor++;
            return extractTokenFromLine(returnRaw);
        }

        let tokenValue = activeLineSegments.pop();
        if (activeLineSegments.length === 0) {
            currentLineCursor++;
        }
        return returnRaw ? tokenValue : Number(tokenValue);
    };

    const extractFullLine = (returnRaw) => {
        if (currentLineCursor >= lineTokensStore.length) {
            return undefined;
        }
        let wholeLineTokens = lineTokensStore[currentLineCursor];
        lineTokensStore[currentLineCursor] = [];
        currentLineCursor++;
        return returnRaw ? wholeLineTokens : wholeLineTokens.map(Number);
    };

    return {
        grabValue: (rawFlag = false) => extractTokenFromLine(rawFlag),
        grabLine: (rawFlag = false) => extractFullLine(rawFlag),
        grabMatrix: (rowCount, rawFlag = false) => {
            let collectedRows = [];
            for (let i = 0; i < rowCount; i++) {
                collectedRows.push(extractFullLine(rawFlag));
            }
            return collectedRows;
        },
        grabVector: (elementCount, rawFlag = false) => {
            let collectedElements = [];
            for (let i = 0; i < elementCount; i++) {
                let lineAsTokens = extractFullLine(true);
                if (lineAsTokens && lineAsTokens.length > 0) {
                    collectedElements.push(rawFlag ? lineAsTokens[0] : Number(lineAsTokens[0]));
                } else {
                    collectedElements.push(undefined);
                }
            }
            return collectedElements;
        }
    };
};

const buildMultiArray = (initialFill, ...dimensions) => {
    const recurseBuild = (dims) => {
        if (dims.length === 0) {
            return initialFill;
        }
        const currentDimensionSize = dims[0];
        const remainingDimensions = dims.slice(1);
        return Array.from({ length: currentDimensionSize }, () => recurseBuild(remainingDimensions));
    };
    return recurseBuild(dimensions);
};

const inputReader = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(determineShortestPathDiscrepancies());

function determineShortestPathDiscrepancies() {
    const vertexCount = inputReader.grabValue();
    const edgeCount = inputReader.grabValue();
    
    const GRAPH_INFINITY = Infinity; 

    let pathDistances = buildMultiArray(GRAPH_INFINITY, vertexCount, vertexCount);

    Array.from({ length: vertexCount }).forEach((_, index) => {
        pathDistances[index][index] = 0;
    });

    const originalConnections = inputReader.grabMatrix(edgeCount);

    originalConnections.forEach(connection => {
        let [rawSourceNode, rawDestinationNode, weight] = connection;
        const sourceNode = rawSourceNode - 1; 
        const destinationNode = rawDestinationNode - 1; 
        pathDistances[sourceNode][destinationNode] = pathDistances[destinationNode][sourceNode] = weight;
    });

    for (let pivotNode = 0; pivotNode < vertexCount; pivotNode++) {
        for (let startNode = 0; startNode < vertexCount; startNode++) {
            for (let endNode = 0; endNode < vertexCount; endNode++) {
                const pathThroughPivot = pathDistances[startNode][pivotNode] + pathDistances[pivotNode][endNode];
                pathDistances[startNode][endNode] = Math.min(pathDistances[startNode][endNode], pathThroughPivot);
            }
        }
    }

    const discrepancyCounter = originalConnections.reduce((accumulator, connection) => {
        let [rawSourceNode, rawDestinationNode, weight] = connection;
        const sourceNode = rawSourceNode - 1;
        const destinationNode = rawDestinationNode - 1;
        if (pathDistances[sourceNode][destinationNode] < weight) {
            return accumulator + 1;
        }
        return accumulator;
    }, 0);

    return discrepancyCounter;
}