currentProcess.standardInput.continueInput();
currentProcess.standardInput.configureEncoding('utf8');

let inputRecords = [];

const outputResult = console.log;

function processStringArrayToNumbers(sourceStr, separatorChar, valueConverter) {
    return sourceStr.split(separatorChar).map(valueConverter);
}

function traverseCollection(collectionData, callbackFn) {
    collectionData.forEach(callbackFn);
}

function appendItemToCollection(targetCollection, newItem) {
    targetCollection.push(newItem);
}

const customLineReader = {
    buildInputHandler: function(optionsConfig) {
        const actualInterface = require('readline').createInterface({
            input: optionsConfig.sourceStream,
            output: optionsConfig.destinationStream
        });

        return {
            attachEventHandler: function(eventIdentifier, eventCallback) {
                actualInterface.on(eventIdentifier, eventCallback);
            }
        };
    }
};

const lineInputHandler = customLineReader.buildInputHandler({
    sourceStream: currentProcess.standardInput,
    destinationStream: currentProcess.standardOutput
});

lineInputHandler.attachEventHandler('line', (currentLineContent) => {
    appendItemToCollection(inputRecords, currentLineContent);
});

lineInputHandler.attachEventHandler('close', () => {
    const [totalNodes, totalEdges] = processStringArrayToNumbers(inputRecords[0], " ", (valStr) => valStr - 0);
    const degreesOfNodes = [];

    traverseCollection(inputRecords, (currentEntry, entryIndex) => {
        if (entryIndex > 0) {
            const [nodeOne, nodeTwo] = processStringArrayToNumbers(currentEntry, " ", (valStr) => Number(valStr));
            degreesOfNodes[nodeOne] = (degreesOfNodes[nodeOne] || 0) + 1;
            degreesOfNodes[nodeTwo] = (degreesOfNodes[nodeTwo] || 0) + 1;
        }
    });

    for (let currentId = 1; currentId <= totalNodes; currentId++) {
        outputResult(degreesOfNodes[currentId] || 0);
    }
});