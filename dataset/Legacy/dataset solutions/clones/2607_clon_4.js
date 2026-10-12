const InputProcessor = (function() {
    class DataStreamHandler {
        constructor(rawInputContent) {
            this.lineBuffer = rawInputContent.trim().split("\n");
            this.currentLineIndex = 0;
            this.currentLineTokens = [];
        }

        _ensureTokensAvailable() {
            if (this.currentLineTokens.length === 0) {
                if (this.currentLineIndex >= this.lineBuffer.length) {
                    return false; // No more lines to process
                }
                // Original `a()` method processes tokens from right to left.
                // Replicate this by reversing the split line and using pop().
                this.currentLineTokens = this.lineBuffer[this.currentLineIndex].split(" ").reverse();
                this.currentLineIndex++;
            }
            return true;
        }

        retrieveSingleValue(returnAsString) {
            if (!this._ensureTokensAvailable()) return undefined;
            const token = this.currentLineTokens.pop();
            return returnAsString ? token : Number(token);
        }

        retrieveFullLine(returnAsString) {
            if (this.currentLineIndex >= this.lineBuffer.length) return undefined;
            const lineContent = this.lineBuffer[this.currentLineIndex].split(" ");
            this.currentLineIndex++;
            return returnAsString ? lineContent : lineContent.map(Number);
        }

        retrieveMultiLineMatrix(numberOfLines, returnAsString) {
            if (this.currentLineIndex + numberOfLines > this.lineBuffer.length) return undefined;
            const segment = this.lineBuffer.slice(this.currentLineIndex, this.currentLineIndex + numberOfLines);
            this.currentLineIndex += numberOfLines;
            return returnAsString ? segment.map(l => l.split(" ")) : segment.map(l => l.split(" ").map(Number));
        }

        retrieveRawLineSegment(numberOfLines, returnAsString) {
            if (this.currentLineIndex + numberOfLines > this.lineBuffer.length) return undefined;
            const segment = this.lineBuffer.slice(this.currentLineIndex, this.currentLineIndex + numberOfLines);
            this.currentLineIndex += numberOfLines;
            return returnAsString ? segment : segment.map(Number);
        }
    }

    return function(sourceString) {
        const streamInstance = new DataStreamHandler(sourceString);
        return {
            pullValue: (asString) => streamInstance.retrieveSingleValue(asString),
            pullLine: (asString) => streamInstance.retrieveFullLine(asString),
            pullMatrix: (numLines, asString) => streamInstance.retrieveMultiLineMatrix(numLines, asString),
            pullRaw: (numLines, asString) => streamInstance.retrieveRawLineSegment(numLines, asString)
        };
    };
})();

const dataReader = InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimensionalStructure(dimensionsArray, valueInitializationSource) {
    const valueGenerator = typeof valueInitializationSource === 'string'
        ? new Function('return ' + valueInitializationSource)
        : () => valueInitializationSource;

    const buildRecursiveStructure = (dims, currentDepth) => {
        if (currentDepth === dims.length) {
            return valueGenerator();
        }
        const currentDimensionSize = dims[currentDepth];
        return Array.from({ length: currentDimensionSize }, () =>
            buildRecursiveStructure(dims, currentDepth + 1)
        );
    };
    return buildRecursiveStructure(dimensionsArray, 0);
}

function computePairIdentifier(firstElement, secondElement) {
    const largerValue = Math.max(firstElement, secondElement);
    const smallerValue = Math.min(firstElement, secondElement);
    // This formula maps an unordered pair (min, max) to a unique non-negative integer.
    // It's based on triangular numbers: T(N) = N*(N-1)/2.
    return Math.floor(largerValue * (largerValue - 1) / 2) + smallerValue;
}

function executeDependencyOrdering(graphStructure) {
    const totalGraphNodes = graphStructure.length;
    const nodeIncomingEdgeCounts = Array(totalGraphNodes).fill(0);
    const nodeMaxPathLevels = Array(totalGraphNodes).fill(0);
    const processingQueue = [];

    // Initialize incoming edge counts and identify initial source nodes
    for (let nodeIdx = 0; nodeIdx < totalGraphNodes; nodeIdx++) {
        if (graphStructure[nodeIdx].incoming.length > 0) {
            nodeIncomingEdgeCounts[nodeIdx] = graphStructure[nodeIdx].incoming.length;
        } else {
            processingQueue.push({ id: nodeIdx, level: 0 });
        }
    }

    let queueTraversalPointer = 0;
    while (queueTraversalPointer < processingQueue.length) {
        const { id: currentNodeId, level: currentPathLevel } = processingQueue[queueTraversalPointer++];

        for (const neighborId of graphStructure[currentNodeId].outgoing) {
            // Update the longest path level for the neighbor
            if (nodeMaxPathLevels[neighborId] <= currentPathLevel) {
                nodeMaxPathLevels[neighborId] = currentPathLevel + 1;
            }

            // Decrement the incoming edge count for the neighbor
            nodeIncomingEdgeCounts[neighborId]--;

            // If incoming edge count becomes zero, add to the processing queue
            if (nodeIncomingEdgeCounts[neighborId] === 0) {
                processingQueue.push({ id: neighborId, level: nodeMaxPathLevels[neighborId] });
            }
        }
    }

    // If the number of processed nodes is less than total nodes, a cycle exists
    if (processingQueue.length < totalGraphNodes) {
        return -1;
    }
    return processingQueue;
}

function orchestrateWorkflow() {
    const numberOfItems = dataReader.pullValue();
    const dependencyGraph = createMultiDimensionalStructure([numberOfItems * (numberOfItems - 1) / 2], "{incoming:[],outgoing:[]}");

    // Construct the dependency graph based on input
    Array.from({ length: numberOfItems }, (_, currentItemIndex) => {
        const itemSequence = dataReader.pullLine();
        let previousNodeIdentifier = computePairIdentifier(itemSequence[0] - 1, currentItemIndex);

        Array.from({ length: numberOfItems - 2 }, (_, j) => {
            const currentNodeIdentifier = computePairIdentifier(itemSequence[j + 1] - 1, currentItemIndex);
            dependencyGraph[previousNodeIdentifier].outgoing.push(currentNodeIdentifier);
            dependencyGraph[currentNodeIdentifier].incoming.push(previousNodeIdentifier);
            previousNodeIdentifier = currentNodeIdentifier;
        });
    });

    const orderedDependencies = executeDependencyOrdering(dependencyGraph);

    if (orderedDependencies === -1) {
        return -1;
    }
    // The result is the level of the last node in the topological sort plus one.
    return orderedDependencies[orderedDependencies.length - 1].level + 1;
}

console.log(orchestrateWorkflow());
