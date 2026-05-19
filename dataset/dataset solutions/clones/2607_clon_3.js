const DATA_PARSER = (function () {
    const convertToNumber = (val) => +val;

    class InputParser {
        constructor(sourceString) {
            this.sourceLines = sourceString.trim().split("\n");
            this.currentLineIndex = 0;
        }

        readToken(asString) {
            let currentLineData = this.sourceLines[this.currentLineIndex];
            if (typeof currentLineData === "string") {
                currentLineData = currentLineData.split(" ").reverse();
                this.sourceLines[this.currentLineIndex] = currentLineData; // Update the stored line
            }
            const resultToken = currentLineData.pop();
            if (!currentLineData.length) {
                this.currentLineIndex++;
            }
            return asString ? resultToken : convertToNumber(resultToken);
        }

        readLine(asString) {
            const lineTokens = this.sourceLines[this.currentLineIndex++].split(" ");
            return asString ? lineTokens : lineTokens.map(convertToNumber);
        }

        readMatrix(numRows, asString) {
            const matrixRows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex += numRows).map(line => line.split(" "));
            return asString ? matrixRows : matrixRows.map(row => row.map(convertToNumber));
        }

        readLines(numLines, asString) {
            const linesData = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex += numLines);
            return asString ? linesData : linesData.map(convertToNumber);
        }
    }

    return (sourceString) => new InputParser(sourceString);
})();

const STD_IN_PATH = "/dev/stdin";
const inputReader = DATA_PARSER(require("fs").readFileSync(STD_IN_PATH, "utf8"));

function createMultiDimArray(initialValue) {
    const args = arguments;
    let argCount = args.length;
    let arrayCreationString = "Array(args[" + --argCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
    while (--argCount) {
        arrayCreationString = "Array(args[" + argCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

console.log(executeProgram());

function executeProgram() {
    const numElements = inputReader.readToken();
    const graphNodeCount = numElements * (numElements - 1) / 2;
    const dependencyGraph = createMultiDimArray("{from:[],to:[]}", graphNodeCount);

    // Helper function to populate the graph based on input
    const populateDependencyGraph = (count, reader, graphRef) => {
        for (let idxA = 0; idxA < count; idxA++) {
            const currentLineTokens = reader.readLine();
            let prevNodeIdx = getNodeIndex(currentLineTokens[0] - 1, idxA);
            for (let idxB = 1; idxB < count - 1; idxB++) {
                const currNodeIdx = getNodeIndex(currentLineTokens[idxB] - 1, idxA);
                graphRef[prevNodeIdx].to.push(currNodeIdx);
                graphRef[currNodeIdx].from.push(prevNodeIdx);
                prevNodeIdx = currNodeIdx;
            }
        }
    };

    populateDependencyGraph(numElements, inputReader, dependencyGraph);

    const sortedNodes = performTopologicalSort(dependencyGraph);
    if (sortedNodes === -1) return -1;
    return sortedNodes[sortedNodes.length - 1][1] + 1;
}

function getNodeIndex(valA, valB) {
    const maxValue = Math.max(valA, valB);
    // Using bitwise right shift for integer division by 2
    return (maxValue * (maxValue - 1) >> 1) + Math.min(valA, valB);
}

function performTopologicalSort(graphData) {
    const graphSize = graphData.length;
    if (graphSize === 0) { // Guard clause for an empty graph
        return [];
    }

    const inDegreeCounts = new Array(graphSize).fill(0);
    const depthLevels = new Array(graphSize).fill(0);
    const processingQueue = [];

    // Initialize in-degrees for all nodes and populate the initial queue
    const initializeGraphProcessing = (graph, inDegrees, queue) => {
        for (let i = 0; i < graph.length; i++) {
            const incomingEdges = graph[i].from.length;
            if (incomingEdges > 0) {
                inDegrees[i] = incomingEdges;
            } else {
                queue.push([i, 0]); // Node with no incoming edges, depth 0
            }
        }
    };

    initializeGraphProcessing(graphData, inDegreeCounts, processingQueue);

    let queueReadPointer = 0; // Pointer to simulate queue dequeue without modifying array
    while (queueReadPointer < processingQueue.length) {
        const [currentNode, currentDepth] = processingQueue[queueReadPointer++];

        for (let j = 0; j < graphData[currentNode].to.length; j++) {
            const neighborNode = graphData[currentNode].to[j];

            // Update depth if a longer path to neighborNode is found
            if (depthLevels[neighborNode] <= currentDepth) {
                depthLevels[neighborNode] = currentDepth + 1;
            }

            // Decrement in-degree count for the neighbor
            inDegreeCounts[neighborNode]--;

            // If in-degree becomes zero, add neighbor to the queue
            if (inDegreeCounts[neighborNode] === 0) {
                processingQueue.push([neighborNode, depthLevels[neighborNode]]);
            }
        }
    }

    // If the number of processed nodes is less than total nodes, a cycle exists
    return processingQueue.length < graphSize ? -1 : processingQueue;
}
