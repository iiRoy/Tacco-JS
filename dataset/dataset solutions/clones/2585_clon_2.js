const nodeIO = require('node:readline');

let systemLog = {
    error: function (messageText) {
        console.error(messageText);
    },
    output: function (messageText) {
        console.log(messageText);
    }
};

const lineReader = nodeIO.createInterface({
    input:  process.stdin,
    output: process.stdout
});

let processingObject;
const receivedLines = [];

lineReader.on(
    'line',
    function (currentEntry) {
        receivedLines.push(currentEntry);
    }
);

lineReader.on(
    'close',
    function () {
        processingObject = setupParser(receivedLines);
        systemLog.error('\n↑Data In ↓Data Out');
        runPrimaryLogic();
    }
);

function createCopy(sourceEntity) {
    return (sourceEntity instanceof Set)
        ? new Set(Array.from(sourceEntity))
        : JSON.parse(JSON.stringify(sourceEntity));
}

function obtainInteger() {
    return transformData(retrieveNext(), 1);
}

function obtainStringArray() {
    return transformData(retrieveNext(), 2);
}

function obtainIntegerArray() {
    return transformData(retrieveNext(), 4);
}

function obtainCharacterArray() {
    return transformData(retrieveNext(), 6);
}

function retrieveNext() {
    return processingObject.advance();
}

function checkNext() {
    return processingObject.canAdvance();
}

function setupParser(sourceData) {
    return {
        storageList: sourceData,
        currentIndex: 0,
        maximumCount: sourceData.length,

        canAdvance: function () {
            return (this.currentIndex < this.maximumCount);
        },

        advance: function () {
            if (this.canAdvance()) {
                return this.storageList[this.currentIndex++];
            } else {
                throw 'DataRetrievalError: Source exhausted';
            }
        }
    };
}

function displayResult(outputString) {
    systemLog.output(outputString);
}

function debugLog(debugMessage) {
    systemLog.error('diagnostic:' + require('node:util').inspect(debugMessage, false, null));
}

function transformData(inputItem, conversionType) {
    try {
        switch (conversionType) {
            case 1:
                return Number.parseInt(inputItem);
            case 2:
                return inputItem.split(' ');
            case 4:
                return inputItem.split(' ').map(Number);
            case 6:
                return inputItem.split('');
            case 7:
                return inputItem.split('').map(Number);
            case 8:
                return inputItem.join(' ');
            case 9:
                return inputItem.join('\n');
            case 0:
                return inputItem.join('');
            default:
                return inputItem;
        }
    } catch (exception) {
        return inputItem;
    }
}

function runPrimaryLogic() {
    const totalElements = obtainInteger();
    let numberCollection = obtainIntegerArray();

    numberCollection.sort(function (valA, valB) {
        return valA - valB;
    });

    const currentSet = [];
    currentSet.push(numberCollection.pop());

    for (let levelIndex = 1; levelIndex <= totalElements; levelIndex++) {
        const nextSet = [];
        for (let elementIndex = 0; elementIndex < (1 << levelIndex); elementIndex++) {
            nextSet.push(numberCollection.pop());
        }

        for (let comparisonIdx = 0; comparisonIdx < nextSet.length; comparisonIdx++) {
            if (currentSet[comparisonIdx] <= nextSet[comparisonIdx]) {
                displayResult("NO");
                return;
            }
        }
        currentSet = currentSet.concat(nextSet);
    }
    displayResult("YES");
}