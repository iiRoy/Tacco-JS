const disjointSetStructure = {
    parentElements: [],

    initializeStructure: function(totalElements) {
        for (let idx = 0; idx < totalElements; idx++) {
            this.parentElements[idx] = idx;
        }
    },

    findRoot: function(elementNode) {
        if (this.parentElements[elementNode] === elementNode) {
            return elementNode;
        }
        const currentParent = this.parentElements[elementNode];
        const root = this.findRoot(currentParent);
        this.parentElements[elementNode] = root;
        return root;
    },

    checkConnection: function(nodeA, nodeB) {
        return this.findRoot(nodeA) === this.findRoot(nodeB);
    },

    performUnion: function(nodeA, nodeB) {
        let rootA = this.findRoot(nodeA);
        let rootB = this.findRoot(nodeB);

        if (rootA === rootB) {
            return;
        }
        this.parentElements[rootA] = rootB;
    }
};

const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8').trim();
const commandLines = rawInputData.split('\n');

const initialParameters = commandLines.shift().trim().split(' ');
const numberOfElements = parseInt(initialParameters[0], 10);
const numberOfQueries = parseInt(initialParameters[1], 10);

disjointSetStructure.initializeStructure(numberOfElements);

let currentProcessingLine;
while ((currentProcessingLine = commandLines.shift()) !== undefined) {
    const trimmedLine = currentProcessingLine.trim();
    if (trimmedLine === '') continue;

    const commandComponents = trimmedLine.split(' ');
    
    const operationType = parseInt(commandComponents[0], 10);
    const firstOperand = parseInt(commandComponents[1], 10);
    const secondOperand = parseInt(commandComponents[2], 10);

    if (operationType === 0) {
        disjointSetStructure.performUnion(firstOperand, secondOperand);
    } else {
        const connectionStatus = disjointSetStructure.checkConnection(firstOperand, secondOperand);
        let outputValue;
        if (connectionStatus) {
            outputValue = 1;
        } else {
            outputValue = 0;
        }
        console.log(outputValue);
    }
}
