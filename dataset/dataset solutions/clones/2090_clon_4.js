const inputData = require("fs").readFileSync(0, "utf8");
const inputTokens = inputData.split(/\s+/).filter(Boolean);
let currentTokenIndex = 0;

const getNextNumber = () => Number(inputTokens[currentTokenIndex++]);

function calculateDepthsAndParents(nodeCount, adjacencyList) {
    const nodeDepths = new Array(nodeCount).fill(-1);
    const nodeParents = new Array(nodeCount).fill(-1);
    const traversalQueue = [];

    nodeDepths[0] = 0;
    traversalQueue.push(0);

    let queueHead = 0;
    while (queueHead < traversalQueue.length) {
        const currentNode = traversalQueue[queueHead++];
        for (const neighborNode of adjacencyList[currentNode]) {
            if (nodeDepths[neighborNode] === -1) {
                nodeDepths[neighborNode] = nodeDepths[currentNode] + 1;
                nodeParents[neighborNode] = currentNode;
                traversalQueue.push(neighborNode);
            }
        }
    }
    return { nodeDepths, nodeParents };
}

let sequenceVal1 = 1;
let sequenceVal2 = 2;
let sequenceVal3 = 3;

const retrieveNextSequenceValue = (sequenceIdentifier, maxPossibleValue) => {
    if (sequenceIdentifier === 1) {
        if (sequenceVal1 <= maxPossibleValue) {
            const value = sequenceVal1;
            sequenceVal1 += 3;
            return value;
        }
    } else if (sequenceIdentifier === 2) {
        if (sequenceVal2 <= maxPossibleValue) {
            const value = sequenceVal2;
            sequenceVal2 += 3;
            return value;
        }
    } else if (sequenceIdentifier === 3) {
        if (sequenceVal3 <= maxPossibleValue) {
            const value = sequenceVal3;
            sequenceVal3 += 3;
            return value;
        }
    }
    return null;
};

function processGraphAssignment() {
    const nodeCount = getNextNumber();

    const adjacencyList = Array.from({ length: nodeCount }, () => []);

    for (let i = 0; i < nodeCount - 1; i++) {
        const nodeA = getNextNumber() - 1;
        const nodeB = getNextNumber() - 1;
        adjacencyList[nodeA].push(nodeB);
        adjacencyList[nodeB].push(nodeA);
    }

    const { nodeDepths } = calculateDepthsAndParents(nodeCount, adjacencyList);

    let numOddDepths = 0;
    let numEvenDepths = 0;
    for (let i = 0; i < nodeCount; i++) {
        if (nodeDepths[i] % 2 === 1) {
            numOddDepths++;
        } else {
            numEvenDepths++;
        }
    }

    const floorNOver3 = Math.floor(nodeCount / 3);

    const finalAssignments = new Array(nodeCount);

    let assignmentStrategyType;
    if (numOddDepths <= floorNOver3) {
        assignmentStrategyType = 'oddGroupSmall';
    } else if (numEvenDepths <= floorNOver3) {
        assignmentStrategyType = 'evenGroupSmall';
    } else {
        assignmentStrategyType = 'bothGroupsLarge';
    }

    const applyAssignmentRule = (nodeIndex, nodeParity, strategy) => {
        if (strategy === 'oddGroupSmall') {
            if (nodeParity === 1) {
                finalAssignments[nodeIndex] = retrieveNextSequenceValue(3, nodeCount);
            } else {
                let assignedValue = retrieveNextSequenceValue(1, nodeCount);
                if (assignedValue === null) {
                    assignedValue = retrieveNextSequenceValue(2, nodeCount);
                }
                if (assignedValue === null) {
                    assignedValue = retrieveNextSequenceValue(3, nodeCount);
                }
                finalAssignments[nodeIndex] = assignedValue;
            }
        } else if (strategy === 'evenGroupSmall') {
            if (nodeParity === 0) {
                finalAssignments[nodeIndex] = retrieveNextSequenceValue(3, nodeCount);
            } else {
                let assignedValue = retrieveNextSequenceValue(1, nodeCount);
                if (assignedValue === null) {
                    assignedValue = retrieveNextSequenceValue(2, nodeCount);
                }
                if (assignedValue === null) {
                    assignedValue = retrieveNextSequenceValue(3, nodeCount);
                }
                finalAssignments[nodeIndex] = assignedValue;
            }
        } else {
            if (nodeParity === 1) {
                let assignedValue = retrieveNextSequenceValue(1, nodeCount);
                if (assignedValue === null) {
                    assignedValue = retrieveNextSequenceValue(3, nodeCount);
                }
                finalAssignments[nodeIndex] = assignedValue;
            } else {
                let assignedValue = retrieveNextSequenceValue(2, nodeCount);
                if (assignedValue === null) {
                    assignedValue = retrieveNextSequenceValue(3, nodeCount);
                }
                finalAssignments[nodeIndex] = assignedValue;
            }
        }
    };

    for (let i = 0; i < nodeCount; i++) {
        applyAssignmentRule(i, nodeDepths[i] % 2, assignmentStrategyType);
    }

    return finalAssignments.join(" ");
}

if (process.argv.length <= 2) {
    require("child_process").fork("Main.js", ["1"], { execArgv: ["--stack-size=240000"] });
} else {
    const outputResult = processGraphAssignment();
    if (outputResult !== undefined) {
        console.log(outputResult);
    }
}
