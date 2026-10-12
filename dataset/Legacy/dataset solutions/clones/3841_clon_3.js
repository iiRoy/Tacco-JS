"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function processInputData(problemInput) {
    const parsedData = extractProblemParameters(problemInput);
    const totalNodes = parsedData.numNodes;
    const permutationArray = parsedData.permutationValues;
    const edgeConnections = parsedData.connectionPairs;
    const connectivityManager = UnionFindStructure.createFromGraphData(totalNodes, edgeConnections);
    let matchingElementCount = 0;
    const checkPredicate = (currentValue, currentIndex) => {
        const originalPosition = currentIndex + 1;
        return connectivityManager.areConnected(currentValue, originalPosition);
    };
    matchingElementCount = permutationArray.filter(checkPredicate).length;
    console.log(matchingElementCount);
    return matchingElementCount;
}
exports.Equals = processInputData;
class UnionFindStructure {
    constructor(nodeRepresentatives) {
        this.nodeRepresentatives = nodeRepresentatives;
    }
    static createFromGraphData(totalNodes, connections) {
        const setNodes = Array.from({ length: totalNodes + 1 }, () => new SetNode());
        connections.forEach(pair => {
            const nodeX = pair.x;
            const nodeY = pair.y;
            setNodes[nodeX].uniteSets(setNodes[nodeY]);
        });
        return new UnionFindStructure(setNodes);
    }
    areConnected(firstNodeId, secondNodeId) {
        const nodeA = this.nodeRepresentatives[firstNodeId];
        const nodeB = this.nodeRepresentatives[secondNodeId];
        return nodeA.sharesRootWith(nodeB);
    }
}
class SetNode {
    constructor() {
        this.representative = this;
        this.nodeRank = 0;
    }
    sharesRootWith(otherNode) {
        return this.findRepresentative() === otherNode.findRepresentative();
    }
    uniteSets(otherNode) {
        let rootA = this.findRepresentative();
        let rootB = otherNode.findRepresentative();
        if (rootA !== rootB) {
            if (rootA.nodeRank < rootB.nodeRank) {
                const tempRoot = rootA;
                rootA = rootB;
                rootB = tempRoot;
            }
            rootB.representative = rootA;
            if (rootA.nodeRank === rootB.nodeRank) {
                rootA.nodeRank++;
            }
        }
    }
    findRepresentative() {
        if (this.representative !== this) {
            this.representative = this.representative.findRepresentative();
        }
        return this.representative;
    }
}
function extractProblemParameters(rawInputString) {
    const NEWLINE_DELIMITER = "\n";
    const inputLines = rawInputString.split(NEWLINE_DELIMITER);
    const firstLineContent = inputLines[0];
    const secondLineContent = inputLines[1];
    const subsequentLines = inputLines.slice(2);
    const [numNodes, numEdges] = parseNumbersFromString(firstLineContent);
    const permutationValues = parseNumbersFromString(secondLineContent);
    const connectionPairs = subsequentLines.map(lineText => {
        const [xCoord, yCoord] = parseNumbersFromString(lineText);
        return { x: xCoord, y: yCoord };
    });
    return {
        numNodes: numNodes,
        numEdges: numEdges,
        permutationValues: permutationValues,
        connectionPairs: connectionPairs
    };
}
function parseNumbersFromString(inputLine) {
    const SPACE_DELIMITER = " ";
    return inputLine.split(SPACE_DELIMITER).map(Number);
}
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
