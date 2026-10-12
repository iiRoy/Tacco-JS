const InputParserFactory = (function() {
    function createInputParserInstance(inputStringContent) {
        return new InputParser(inputStringContent);
    }

    function InputParser(rawInputText) {
        this._inputLines = rawInputText.trim().split("\n");
        this._currentLineIndex = 0;
        this._currentLineItems = null;
        this._currentItemIndex = 0;
    }

    InputParser.prototype.readNextItem = function(returnAsText) {
        if (this._currentLineItems === null || this._currentItemIndex >= this._currentLineItems.length) {
            if (this._currentLineIndex >= this._inputLines.length) {
                return undefined; // No more lines
            }
            this._currentLineItems = this._inputLines[this._currentLineIndex].split(" ");
            this._currentLineIndex++;
            this._currentItemIndex = 0;
        }

        const itemValue = this._currentLineItems[this._currentItemIndex];
        this._currentItemIndex++;
        return returnAsText ? itemValue : Number(itemValue);
    };

    InputParser.prototype.readLineItems = function(returnAsText) {
        if (this._currentLineIndex >= this._inputLines.length) {
            return [];
        }
        const lineContent = this._inputLines[this._currentLineIndex];
        this._currentLineIndex++;
        const items = lineContent.split(" ");
        return returnAsText ? items : items.map(Number);
    };

    InputParser.prototype.readMatrixItems = function(numberOfRows, returnAsText) {
        const matrixData = [];
        for (let rowCounter = 0; rowCounter < numberOfRows; rowCounter++) {
            if (this._currentLineIndex >= this._inputLines.length) {
                break;
            }
            const lineContent = this._inputLines[this._currentLineIndex];
            this._currentLineIndex++;
            const rowItems = lineContent.split(" ");
            matrixData.push(returnAsText ? rowItems : rowItems.map(Number));
        }
        return matrixData;
    };

    InputParser.prototype.readRawLines = function(numberOfLines, returnAsText) {
        const rawLineData = [];
        for (let lineCounter = 0; lineCounter < numberOfLines; lineCounter++) {
            if (this._currentLineIndex >= this._inputLines.length) {
                break;
            }
            const lineContent = this._inputLines[this._currentLineIndex];
            this._currentLineIndex++;
            rawLineData.push(returnAsText ? lineContent : Number(lineContent));
        }
        return rawLineData;
    };

    return createInputParserInstance;
})();

const inputReader = InputParserFactory(require("fs").readFileSync("/dev/stdin","utf8"));

function createMultiDimArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }

    function _recursiveArrayBuilder(currentDimensionIndex) {
        if (currentDimensionIndex === dimensions.length - 1) {
            return Array(dimensions[currentDimensionIndex]).fill(initialValue);
        } else {
            return Array(dimensions[currentDimensionIndex]).fill(0).map(() => _recursiveArrayBuilder(currentDimensionIndex + 1));
        }
    }

    return _recursiveArrayBuilder(0);
}

console.log(main());

function main(){
    const nodeCount = inputReader.readNextItem();
    let visitedNodesState = createMultiDimArray(0, nodeCount);
    let adjacencyList = createMultiDimArray("[]", nodeCount);

    for(let edgeIndex = 0; edgeIndex < nodeCount - 1; edgeIndex++){
        const edgeEndpoints = inputReader.readLineItems().map(nodeValue => nodeValue - 1);
        adjacencyList[edgeEndpoints[0]].push(edgeEndpoints[1]);
        adjacencyList[edgeEndpoints[1]].push(edgeEndpoints[0]);
    }

    function performBFS(startNode, totalNodes, graphAdjacencyList) {
        let currentVisitedStatus = createMultiDimArray(0, totalNodes);
        let currentLevelQueue = [startNode];
        let nextLevelQueue = [];
        let currentLevel = 0;
        let lastProcessedNode = startNode;

        while (currentLevelQueue.length > 0 || nextLevelQueue.length > 0) {
            if (currentLevelQueue.length === 0) {
                currentLevel++;
                currentLevelQueue = nextLevelQueue;
                nextLevelQueue = [];
            }

            const processingNode = currentLevelQueue.pop();

            if (currentVisitedStatus[processingNode]) {
                continue;
            }

            lastProcessedNode = processingNode;
            currentVisitedStatus[processingNode] = 1;

            const neighbors = graphAdjacencyList[processingNode];
            for (let neighborIndex = 0; neighborIndex < neighbors.length; neighborIndex++) {
                const neighborNode = neighbors[neighborIndex];
                nextLevelQueue.push(neighborNode);
            }
        }
        return { farthestNode: lastProcessedNode, maxDistance: currentLevel };
    }

    const firstBFSResult = performBFS(0, nodeCount, adjacencyList);
    const diameterStartNode = firstBFSResult.farthestNode;

    const secondBFSResult = performBFS(diameterStartNode, nodeCount, adjacencyList);
    const treeDiameter = secondBFSResult.maxDistance;

    return treeDiameter % 3 === 2 ? "Second" : "First";
}
