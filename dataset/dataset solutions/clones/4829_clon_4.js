class DisjointSetStructure {
    constructor(elementCount) {
        this.parentMapping = new Map();
        this.rankValues = new Map();
        for (let idx = 0; idx < elementCount; idx++) {
            this.parentMapping.set(idx, idx);
            this.rankValues.set(idx, 0);
        }
    }

    findSet(elementIdentifier) {
        let currentElement = elementIdentifier;
        let pathElements = [];
        while (this.parentMapping.get(currentElement) !== currentElement) {
            pathElements.push(currentElement);
            currentElement = this.parentMapping.get(currentElement);
        }
        for (const pathNode of pathElements) {
            this.parentMapping.set(pathNode, currentElement);
        }
        return currentElement;
    }

    uniteSets(elementOne, elementTwo) {
        let representativeOne = this.findSet(elementOne);
        let representativeTwo = this.findSet(elementTwo);

        if (representativeOne !== representativeTwo) {
            let rankOne = this.rankValues.get(representativeOne);
            let rankTwo = this.rankValues.get(representativeTwo);

            if (rankOne < rankTwo) {
                this.parentMapping.set(representativeOne, representativeTwo);
            } else if (rankTwo < rankOne) {
                this.parentMapping.set(representativeTwo, representativeOne);
            } else {
                this.parentMapping.set(representativeTwo, representativeOne);
                this.rankValues.set(representativeOne, rankOne + 1);
            }
            return true;
        }
        return false;
    }
}

function ProcessNetworkData(inputLines) {
    const parseLineToNumbers = (lineContent) => lineContent.split(' ').map(Number);
    const normalizeNodes = (nodeNumbers) => nodeNumbers.map(n => n - 1).sort((a, b) => a - b);

    const initialConfig = parseLineToNumbers(inputLines[0]);
    const totalNodes = initialConfig[0];
    const groupCountA = initialConfig[1];
    const groupCountB = initialConfig[2];

    const dssInstanceA = new DisjointSetStructure(totalNodes);
    const dssInstanceB = new DisjointSetStructure(totalNodes);

    inputLines.slice(1, 1 + groupCountA).forEach(line => {
        const [nodeX, nodeY] = normalizeNodes(parseLineToNumbers(line));
        dssInstanceA.uniteSets(nodeX, nodeY);
    });

    inputLines.slice(1 + groupCountA, 1 + groupCountA + groupCountB).forEach(line => {
        const [nodeX, nodeY] = normalizeNodes(parseLineToNumbers(line));
        dssInstanceB.uniteSets(nodeX, nodeY);
    });

    const jointComponentTallies = new Map();

    for (let i = 0; i < totalNodes; i++) {
        const repA = dssInstanceA.findSet(i);
        const repB = dssInstanceB.findSet(i);
        const compositeKey = `${repA}_${repB}`;
        jointComponentTallies.set(compositeKey, (jointComponentTallies.get(compositeKey) || 0) + 1);
    }

    const finalOutputArray = Array.from({ length: totalNodes }, (_, nodeIndex) => {
        const repA = dssInstanceA.findSet(nodeIndex);
        const repB = dssInstanceB.findSet(nodeIndex);
        const compositeKey = `${repA}_${repB}`;
        return jointComponentTallies.get(compositeKey);
    });

    console.log(finalOutputArray.join(' '));
}

// The following setup allows this code to run with the provided input mechanism.
// This part mirrors the original "Don't have to see" section, adapted to call ProcessNetworkData.
// It is not part of the Type IV clone *of the algorithm itself*, but necessary for execution.
var readInput = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var receivedLines = [];
readInput.on('line', function(lineContent){receivedLines.push(lineContent);});
readInput.on('close', function(){
  // console.error('\n↑入力 ↓出力'); // Original debug output, omitted for strict output
  ProcessNetworkData(receivedLines);
});