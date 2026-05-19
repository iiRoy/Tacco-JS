class InputParser {
    constructor(inputString) {
        this.inputLines = inputString.trim().split("\n");
        this.currentLineIndex = 0;
    }

    static _convertToken(token, asString) {
        return asString ? token : Number(token);
    }

    readItem(asString = false) {
        if (typeof this.inputLines[this.currentLineIndex] === "string") {
            this.inputLines[this.currentLineIndex] = this.inputLines[this.currentLineIndex].split(" ").reverse();
        }
        const token = this.inputLines[this.currentLineIndex].pop();

        if (this.inputLines[this.currentLineIndex].length === 0) {
            this.currentLineIndex++;
        }
        return InputParser._convertToken(token, asString);
    }

    readLine(asString = false) {
        const lineTokens = this.inputLines[this.currentLineIndex++].split(" ");
        return asString ? lineTokens : lineTokens.map(token => Number(token));
    }

    readMatrix(numRows, asString = false) {
        const matrixRows = this.inputLines.slice(this.currentLineIndex, this.currentLineIndex + numRows)
            .map(line => line.split(" "));
        this.currentLineIndex += numRows;
        return asString ? matrixRows : matrixRows.map(row => row.map(token => Number(token)));
    }

    readRawLines(numLines, asString = false) {
        const rawLines = this.inputLines.slice(this.currentLineIndex, this.currentLineIndex + numLines);
        this.currentLineIndex += numLines;
        return asString ? rawLines : rawLines.map(line => Number(line));
    }
}

const inputReader = new InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValueExpression, ...dimensions) {
    let dimensionCount = dimensions.length;
    let arrayCreationCode = `Array(dimensions[${--dimensionCount}]).fill(0).map(x=>{return ${initialValueExpression};})`;
    while (--dimensionCount >= 0) {
        arrayCreationCode = `Array(dimensions[${dimensionCount}]).fill(0).map(x=>${arrayCreationCode})`;
    }
    return new Function('dimensions', `return ${arrayCreationCode}`)(dimensions);
}

function solveGraphProblem() {
    const nodeCount = inputReader.readItem();
    const adjacencyList = createMultiDimArray("new Set()", nodeCount);
    const activeNodesSet = new Set();

    for (let i = 0; i < nodeCount; i++) {
        activeNodesSet.add(i);
    }

    for (let edgeIndex = 0; edgeIndex < nodeCount - 1; edgeIndex++) {
        const edgeData = inputReader.readLine();
        const nodeA = edgeData[0] - 1;
        const nodeB = edgeData[1] - 1;
        adjacencyList[nodeA].add(nodeB);
        adjacencyList[nodeB].add(nodeA);
    }

    const valuesForAssignment = inputReader.readLine().sort((val1, val2) => val1 - val2);
    let valueAssignmentIndex = 0;
    let currentTotalSum = 0;
    const finalAssignedValues = Array(nodeCount);

    const identifyAndAssignLeaves = (nodesToCheck, graphAdjList, valuesPool, assignedResultArray) => {
        const identifiedLeaves = [];
        for (const nodeIdentifier of nodesToCheck) {
            if (graphAdjList[nodeIdentifier].size <= 1) {
                identifiedLeaves.push(nodeIdentifier);
                assignedResultArray[nodeIdentifier] = valuesPool[valueAssignmentIndex++];
                currentTotalSum += assignedResultArray[nodeIdentifier];
            }
        }
        return identifiedLeaves;
    };

    const removeProcessedNodes = (nodesToRemove, graphAdjList, currentActiveNodes) => {
        for (const nodeToRemove of nodesToRemove) {
            for (const neighborNode of graphAdjList[nodeToRemove]) {
                graphAdjList[neighborNode].delete(nodeToRemove);
            }
            currentActiveNodes.delete(nodeToRemove);
        }
    };

    while (valueAssignmentIndex < nodeCount) {
        const leavesInThisPass = identifyAndAssignLeaves(activeNodesSet, adjacencyList, valuesForAssignment, finalAssignedValues);
        removeProcessedNodes(leavesInThisPass, adjacencyList, activeNodesSet);
    }

    const largestPossibleValue = valuesForAssignment[nodeCount - 1];
    console.log(currentTotalSum - largestPossibleValue);

    return finalAssignedValues.join(" ");
}

console.log(solveGraphProblem());
