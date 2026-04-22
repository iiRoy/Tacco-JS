const sourceConfiguration = {
  inputPath: '/dev/stdin',
  lineBreaker: '\n'
};

const fileSystemUtility = require('fs');
const synchronizedFileRead = fileSystemUtility.readFileSync;

if (!String.prototype.removeOuterWhitespace) {
    String.prototype.removeOuterWhitespace = function() {
        return this.trim();
    };
}
if (!String.prototype.splitIntoSegments) {
    String.prototype.splitIntoSegments = function(separator) {
        return this.split(separator);
    };
}
if (!Array.prototype.transformWithConverter) {
    Array.prototype.transformWithConverter = function(converterFunction) {
        return this.map(converterFunction);
    };
}

const convertToNumeric = (textValue) => {
    return Number(textValue);
};

const obtainMinimum = (valueA, valueB) => valueA < valueB ? valueA : valueB;
const obtainMaximum = (valueA, valueB) => valueA > valueB ? valueA : valueB;

const emitResult = (messageContent) => console.log(messageContent);

const rawDataString = synchronizedFileRead(sourceConfiguration.inputPath, 'ascii').toString();
const cleanedDataString = rawDataString.removeOuterWhitespace();
const dataLinesArray = cleanedDataString.splitIntoSegments(sourceConfiguration.lineBreaker);

const numericalDataMatrix = [];
for (const currentLine of dataLinesArray) {
  if (currentLine === '') continue;
  numericalDataMatrix.push(currentLine.splitIntoSegments(' ').transformWithConverter(convertToNumeric));
}

const totalNodes = numericalDataMatrix[0][0];
const totalConnections = numericalDataMatrix[0][1];
const totalInquiries = numericalDataMatrix[totalConnections + 1][0];

const componentParentMap = new Map();

function findComponentRoot(nodeIdentifier, structureMap) {
    if (!structureMap.has(nodeIdentifier)) {
        structureMap.set(nodeIdentifier, nodeIdentifier);
        return nodeIdentifier;
    }

    let parentOfCurrentNode = structureMap.get(nodeIdentifier);

    if (parentOfCurrentNode === nodeIdentifier) {
        return nodeIdentifier;
    }

    let ultimateRoot = findComponentRoot(parentOfCurrentNode, structureMap);
    structureMap.set(nodeIdentifier, ultimateRoot);
    return ultimateRoot;
}

function establishConnection(nodeFromInputA, nodeFromInputB, structureMap) {
    const smallerNodeId = obtainMinimum(nodeFromInputA, nodeFromInputB);
    const largerNodeId = obtainMaximum(nodeFromInputA, nodeFromInputB);

    let rootOfSmallerComponent = findComponentRoot(smallerNodeId, structureMap);

    structureMap.set(largerNodeId, rootOfSmallerComponent);
}

for (let connectionLoopIndex = 1; connectionLoopIndex <= totalConnections; ++connectionLoopIndex) {
    const primaryNode = numericalDataMatrix[connectionLoopIndex][0];
    const secondaryNode = numericalDataMatrix[connectionLoopIndex][1];
    establishConnection(primaryNode, secondaryNode, componentParentMap);
}

for (let inquiryLoopIndex = totalConnections + 2; inquiryLoopIndex < (totalConnections + 2) + totalInquiries; ++inquiryLoopIndex) {
    const querySubjectA = numericalDataMatrix[inquiryLoopIndex][0];
    const querySubjectB = numericalDataMatrix[inquiryLoopIndex][1];

    const rootForSubjectA = findComponentRoot(querySubjectA, componentParentMap);
    const rootForSubjectB = findComponentRoot(querySubjectB, componentParentMap);

    if (rootForSubjectA === rootForSubjectB) {
        emitResult('yes');
    } else {
        emitResult('no');
    }
}