function ProcessInput(sourceData) {
    "use strict";

    let edgeWeights;
    let nodeConnections;
    let memoizedResults;

    function explorePathRecursive(currentNodeIdentifier, accumulatedWeight) {
        if (!nodeConnections[currentNodeIdentifier] || nodeConnections[currentNodeIdentifier].length === 0) {
            return accumulatedWeight;
        }

        let maxPathFromHere = 0;

        if (memoizedResults[currentNodeIdentifier] === undefined) {
            memoizedResults[currentNodeIdentifier] = new Map();
        }

        for (const nextNodeIdentifier of nodeConnections[currentNodeIdentifier]) {
            let totalPathThroughNextNode;
            if (memoizedResults[currentNodeIdentifier].has(nextNodeIdentifier)) {
                totalPathThroughNextNode = memoizedResults[currentNodeIdentifier].get(nextNodeIdentifier);
            } else {
                const weightToNext = edgeWeights[currentNodeIdentifier][nextNodeIdentifier];
                const newAccumulatedWeight = accumulatedWeight + weightToNext;
                
                totalPathThroughNextNode = explorePathRecursive(nextNodeIdentifier, newAccumulatedWeight);
                memoizedResults[currentNodeIdentifier].set(nextNodeIdentifier, totalPathThroughNextNode);
            }
            maxPathFromHere = Math.max(maxPathFromHere, totalPathThroughNextNode);
        }
        return maxPathFromHere;
    }

    const logOutput = console.log;
    const inputReader = new DataParser(sourceData, " \n");

    const numNodes = inputReader.getNextInteger();
    const numEdges = inputReader.getNextInteger();

    if (numNodes < 1 || numNodes > 2000) {
        throw new Error("Invalid number of nodes: " + numNodes);
    }
    if (numEdges < 0 || numEdges > 100000) {
        throw new Error("Invalid number of edges: " + numEdges);
    }

    edgeWeights = Array.from({ length: numNodes }, () => []);
    nodeConnections = Array.from({ length: numNodes }, () => []);
    memoizedResults = Array.from({ length: numNodes }, () => undefined);

    for (let edgeIndex = 0; edgeIndex < numEdges; edgeIndex++) {
        const sourceNode = inputReader.getNextInteger();
        const targetNode = inputReader.getNextInteger();
        const weightValue = inputReader.getNextInteger();

        if (sourceNode < 0 || sourceNode >= numNodes || targetNode < 0 || targetNode >= numNodes) {
            logOutput(`Warning: Edge ${sourceNode}->${targetNode} is out of bounds. Skipping.`);
            continue;
        }

        nodeConnections[sourceNode].push(targetNode);
        edgeWeights[sourceNode][targetNode] = weightValue;
    }

    const finalResult = explorePathRecursive(0, 0);
    logOutput(finalResult);
}

const DataParser = (function() {
    function DataParser(sourceContent, tokenSeparators) {
        const regexDelimiter = new RegExp(`[${tokenSeparators}]`, "g");
        this.currentPosition = 0;
        this.tokenCollection = sourceContent.replace(/\r/g, '').split(regexDelimiter).filter(Boolean);
    }

    DataParser.prototype = {
        hasMoreTokens: function() {
            return this.currentPosition < this.tokenCollection.length;
        },
        getNextToken: function() {
            if (!this.hasMoreTokens()) {
                throw new RangeError("No more tokens available to consume.");
            }
            return this.tokenCollection[this.currentPosition++];
        },
        getNextNumberValue: function() {
            const token = this.peekNextToken();
            const parsedNumber = Number(token);

            if (Number.isNaN(parsedNumber)) {
                throw new TypeError(`'${token}' cannot be converted to a valid Number.`);
            }
            this.getNextToken();
            return parsedNumber;
        },
        getNextInteger: function(radix = 10) {
            const numberValue = this.getNextNumberValue();
            if (!Number.isInteger(numberValue)) {
                 throw new TypeError(`'${numberValue}' is not an integer.`);
            }
            return parseInt(numberValue, radix);
        },
        peekNextToken: function() {
            if (!this.hasMoreTokens()) {
                throw new RangeError("No more tokens to peek.");
            }
            return this.tokenCollection[this.currentPosition];
        }
    };

    return DataParser;
}());

ProcessInput(require("fs").readFileSync(0, "utf8"));