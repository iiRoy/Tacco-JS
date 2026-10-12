const GET = (() => {
    const numberPattern = /-?\d+(\.\d+)?/g;
    const lineBreakPattern = /\r?\n/;

    function InputParser(rawInputString) {
        this.inputLines = rawInputString.trim().split(lineBreakPattern);
        this.currentLinePointer = 0;
        this.activeLineTokens = []; // Buffer for tokens of the current line, used by fetchNumberFromLineEnd
    }

    InputParser.prototype.fetchNumberFromLineEnd = function(returnAsRawString) {
        while (this.activeLineTokens.length === 0) {
            if (this.currentLinePointer >= this.inputLines.length) {
                return undefined; // No more lines to process
            }
            const currentLineContent = this.inputLines[this.currentLinePointer];
            const numbersFound = Array.from(currentLineContent.matchAll(numberPattern)).map(match => match[0]);
            this.activeLineTokens = numbersFound.reverse(); // Store in reverse to simulate pop from end
            if (this.activeLineTokens.length === 0) {
                this.currentLinePointer++; // Line had no numbers, move to next
            }
        }
        const extractedValue = this.activeLineTokens.shift(); // Get what was the last number on the line
        if (this.activeLineTokens.length === 0) {
            this.currentLinePointer++; // Current line buffer exhausted, move to next line
        }
        return returnAsRawString ? extractedValue : +extractedValue;
    };

    InputParser.prototype.readFullLine = function(returnAsRawStrings) {
        if (this.currentLinePointer >= this.inputLines.length) {
            return undefined;
        }
        const lineContent = this.inputLines[this.currentLinePointer++];
        this.activeLineTokens = []; // Clear any pending tokens from previous 'a' calls on this line
        if (returnAsRawStrings) {
            return lineContent.split(" "); // Original 'l' splits by space for raw
        } else {
            return Array.from(lineContent.matchAll(numberPattern)).map(match => +match[0]);
        }
    };

    InputParser.prototype.readMatrix = function(numberOfRows, returnAsRawStrings) {
        const matrixRows = [];
        for (let i = 0; i < numberOfRows; i++) {
            if (this.currentLinePointer >= this.inputLines.length) {
                break;
            }
            const lineContent = this.inputLines[this.currentLinePointer++];
            this.activeLineTokens = []; // Clear tokens
            if (returnAsRawStrings) {
                matrixRows.push(lineContent.split(" "));
            } else {
                matrixRows.push(Array.from(lineContent.matchAll(numberPattern)).map(match => +match[0]));
            }
        }
        return matrixRows;
    };

    InputParser.prototype.readLinesAsValues = function(numberOfLines, returnAsRawStrings) {
        const valueLines = [];
        for (let i = 0; i < numberOfLines; i++) {
            if (this.currentLinePointer >= this.inputLines.length) {
                break;
            }
            const lineContent = this.inputLines[this.currentLinePointer++];
            this.activeLineTokens = []; // Clear tokens
            valueLines.push(returnAsRawStrings ? lineContent : +lineContent);
        }
        return valueLines;
    };

    return function(inputString) {
        const parserInstance = new InputParser(inputString);
        return {
            a: (raw) => parserInstance.fetchNumberFromLineEnd(raw),
            l: (raw) => parserInstance.readFullLine(raw),
            m: (numRows, raw) => parserInstance.readMatrix(numRows, raw),
            r: (numLines, raw) => parserInstance.readLinesAsValues(numLines, raw)
        };
    };
})();
const o = GET(require("fs").readFileSync("/dev/stdin", "utf8"));

function buildMultiDimArray(initialValueFactory, ...dimensions) {
    const constructLayer = (currentDimensionIndex) => {
        if (currentDimensionIndex === dimensions.length) {
            return initialValueFactory();
        }
        const currentDimensionSize = dimensions[currentDimensionIndex];
        return Array.from({ length: currentDimensionSize }, () => constructLayer(currentDimensionIndex + 1));
    };
    return constructLayer(0);
}

console.log(main());

function main() {
    const totalNodes = o.a();
    const unusedPlaceholder = buildMultiDimArray(() => 1, totalNodes);
    const graphAdjacency = buildMultiDimArray(() => [], totalNodes);

    let edgeCounter = 0;
    while (edgeCounter < totalNodes - 1) {
        const [nodeA, nodeB] = o.l().map(value => value - 1);
        graphAdjacency[nodeA].push(nodeB);
        graphAdjacency[nodeB].push(nodeA);
        edgeCounter++;
    }

    const calculatedDiameter = treeDia(graphAdjacency);
    return (calculatedDiameter % 3 === 1) ? "Second" : "First";
}

function findFarthestNodeAndDistance(startingNodeIdentifier, adjacencyStructure) {
    const traversalQueue = [[startingNodeIdentifier, 0]]; // [node, distance]
    const visitedSet = new Set([startingNodeIdentifier]);
    let maxAchievedDistance = 0;
    let farthestDiscoveredVertex = startingNodeIdentifier;

    let queueReadPointer = 0;

    while (queueReadPointer < traversalQueue.length) {
        const [currentNode, currentPathDistance] = traversalQueue[queueReadPointer++];

        if (currentPathDistance > maxAchievedDistance) {
            maxAchievedDistance = currentPathDistance;
            farthestDiscoveredVertex = currentNode;
        }

        for (const connectedNeighbor of adjacencyStructure[currentNode]) {
            if (!visitedSet.has(connectedNeighbor)) {
                visitedSet.add(connectedNeighbor);
                traversalQueue.push([connectedNeighbor, currentPathDistance + 1]);
            }
        }
    }
    return { farthestVertex: farthestDiscoveredVertex, maximumDistance: maxAchievedDistance };
}

function treeDia(edgeConnections) {
    // Perform first BFS from an arbitrary node (node 0) to find one endpoint of the diameter
    const firstTraversalResult = findFarthestNodeAndDistance(0, edgeConnections);

    // Perform second BFS from the farthest node found in the first traversal to find the true diameter
    const secondTraversalResult = findFarthestNodeAndDistance(firstTraversalResult.farthestVertex, edgeConnections);

    return secondTraversalResult.maximumDistance;
}
