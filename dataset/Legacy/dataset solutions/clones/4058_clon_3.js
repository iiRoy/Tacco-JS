var InputSourceProvider = function () {
    var fileSystemModule = require('fs');
    var readStandardInput = function (promptText) {
        if (promptText) console.log(promptText);
        return fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    };
    return readStandardInput;
};

var isDebuggingEnabled = false;

var inputReader = isDebuggingEnabled ? Debug() : InputSourceProvider();
var rawInputLines = inputReader().split('\n');
var dimensionsArray = rawInputLines.shift().split(' ').map(val => parseInt(val, 10));
var nodeCount = dimensionsArray[0];
var relationCount = dimensionsArray[1];
var relationDataEntries = rawInputLines.filter((_val, idx) => idx < relationCount).map(line => line.split(' ').map(numStr => parseInt(numStr, 10)));

function checkPathConsistency(currentLeftNode, currentRightNode, currentDistance, remainingRelations, primaryFilterIndex) {
    const relevantNeighborRelations = remainingRelations.filter(
        relEntry => relEntry[primaryFilterIndex] === currentLeftNode
    );

    for (const neighborRelEntry of relevantNeighborRelations) {
        const intermediateNode = (primaryFilterIndex === 0) ? neighborRelEntry[1] : neighborRelEntry[0];
        const neighborRelDistance = neighborRelEntry[2];

        const potentialConnectingPaths = remainingRelations.filter(
            relEntry => (relEntry[0] === intermediateNode && relEntry[1] === currentRightNode) ||
                        (relEntry[1] === intermediateNode && relEntry[0] === currentRightNode)
        );

        const foundInconsistentPath = potentialConnectingPaths.some(
            connectingRelEntry => (neighborRelDistance + connectingRelEntry[2] - currentDistance) !== 0
        );

        if (foundInconsistentPath) {
            return false;
        }
    }
    return true;
}

var isConfigurationConsistent = true;
for (let iterationCounter = 0; iterationCounter < relationCount; iterationCounter++) {
    var processedRelation = relationDataEntries.pop();
    var currentLeft = processedRelation[0];
    var currentRight = processedRelation[1];
    var currentDistance = processedRelation[2];

    if (!checkPathConsistency(currentLeft, currentRight, currentDistance, relationDataEntries, 0)) {
        isConfigurationConsistent = false;
        break;
    }

    if (!isConfigurationConsistent) {
        break;
    }

    if (!checkPathConsistency(currentLeft, currentRight, currentDistance, relationDataEntries, 1)) {
        isConfigurationConsistent = false;
        break;
    }

    if (!isConfigurationConsistent) {
        break;
    }
}

console.log(isConfigurationConsistent ? 'Yes' : 'No');
