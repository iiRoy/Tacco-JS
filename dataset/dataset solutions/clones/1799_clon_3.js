const parseTwoIntegers = (lineString) => {
    const partsArray = lineString.split(" ");
    return {
        firstValue: parseInt(partsArray[0], 10),
        secondValue: parseInt(partsArray[1], 10)
    };
};

const inputContentLines = require("fs").readFileSync("/dev/stdin", "utf8").split("\n");

let currentInputLinePointer = 0;

const totalNodeCount = parseInt(inputContentLines[currentInputLinePointer++], 10);
const nodeInformationMap = {};

for (let nodeIndex = 0; nodeIndex < totalNodeCount; nodeIndex++) {
    const parsedNodeLine = parseTwoIntegers(inputContentLines[currentInputLinePointer++]);
    nodeInformationMap[nodeIndex] = {
        nodeDataValue: parsedNodeLine.firstValue,
        nodeDataWeight: parsedNodeLine.secondValue
    };
}

const totalQueryCount = parseInt(inputContentLines[currentInputLinePointer++], 10);
const querySpecifications = {};

for (let queryIndex = 0; queryIndex < totalQueryCount; queryIndex++) {
    const parsedQueryLine = parseTwoIntegers(inputContentLines[currentInputLinePointer++]);
    querySpecifications[queryIndex] = {
        queryStartNodeId: parsedQueryLine.firstValue - 1,
        queryWeightLimit: parsedQueryLine.secondValue
    };
}

for (let queryIteration = 0; queryIteration < totalQueryCount; queryIteration++) {
    let activeTraversalNodeId = querySpecifications[queryIteration].queryStartNodeId;
    const queryWeightThreshold = querySpecifications[queryIteration].queryWeightLimit;

    let currentAccumulatedValue = 0;
    let currentAccumulatedWeight = 0;

    while (true) {
        const currentNodeDetails = nodeInformationMap[activeTraversalNodeId];
        const nodeWeightContribution = currentNodeDetails.nodeDataWeight;
        const nodeValueContribution = currentNodeDetails.nodeDataValue;

        currentAccumulatedWeight += nodeWeightContribution;

        if (currentAccumulatedWeight <= queryWeightThreshold) {
            currentAccumulatedValue += nodeValueContribution;
        }

        if (activeTraversalNodeId === 0) {
            break;
        }
        activeTraversalNodeId = activeTraversalNodeId >> 1;
    }
    console.log(currentAccumulatedValue);
}
