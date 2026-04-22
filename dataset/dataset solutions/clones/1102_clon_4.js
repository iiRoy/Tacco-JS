const rli = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let collectedInput = [];
rli.on('line', (line) => {
    collectedInput.push(line);
});

rli.on('close', () => {
    entryPoint(collectedInput);
});

class DataUnit {
    constructor(valueEntry) {
        this.valueEntry = valueEntry;
        this.smallerChild = null;
        this.largerChild = null;
    }
}

class SearchTreeManager {
    constructor() {
        this.rootElement = null;
    }

    addEntry(entryKey) {
        const newUnit = new DataUnit(entryKey);
        if (this.rootElement === null) {
            this.rootElement = newUnit;
            return;
        }

        let currentUnit = this.rootElement;
        let parentUnit = null;
        while (currentUnit !== null) {
            parentUnit = currentUnit;
            if (entryKey < currentUnit.valueEntry) {
                currentUnit = currentUnit.smallerChild;
            } else {
                currentUnit = currentUnit.largerChild;
            }
        }

        if (entryKey < parentUnit.valueEntry) {
            parentUnit.smallerChild = newUnit;
        } else {
            parentUnit.largerChild = newUnit;
        }
    }

    locateEntry(targetEntry) {
        let currentUnit = this.rootElement;
        while (currentUnit !== null) {
            if (currentUnit.valueEntry === targetEntry) {
                return currentUnit;
            }
            if (targetEntry < currentUnit.valueEntry) {
                currentUnit = currentUnit.smallerChild;
            } else {
                currentUnit = currentUnit.largerChild;
            }
        }
        return null;
    }

    // Iterative in-order traversal
    collectInOrder() {
        const collectedValues = [];
        const traversalStack = [];
        let currentUnit = this.rootElement;

        while (currentUnit !== null || traversalStack.length > 0) {
            while (currentUnit !== null) {
                traversalStack.push(currentUnit);
                currentUnit = currentUnit.smallerChild;
            }

            currentUnit = traversalStack.pop();
            collectedValues.push(currentUnit.valueEntry);
            currentUnit = currentUnit.largerChild;
        }
        return collectedValues;
    }

    // Iterative pre-order traversal
    collectPreOrder() {
        const collectedValues = [];
        if (this.rootElement === null) {
            return collectedValues;
        }

        const traversalStack = [];
        traversalStack.push(this.rootElement);

        while (traversalStack.length > 0) {
            let currentUnit = traversalStack.pop();
            collectedValues.push(currentUnit.valueEntry);

            if (currentUnit.largerChild !== null) {
                traversalStack.push(currentUnit.largerChild);
            }
            if (currentUnit.smallerChild !== null) {
                traversalStack.push(currentUnit.smallerChild);
            }
        }
        return collectedValues;
    }
}

function renderSequence(sequenceData) {
    let outputLine = "";
    for (let i = 0; i < sequenceData.length; i++) {
        outputLine += " " + sequenceData[i];
    }
    console.log(outputLine);
}

function entryPoint(sourceLines) {
    const totalOperations = Number(sourceLines[0]);
    const treeController = new SearchTreeManager();

    const operationMap = {
        "i": (val) => {
            treeController.addEntry(val);
        },
        "p": () => {
            renderSequence(treeController.collectInOrder());
            renderSequence(treeController.collectPreOrder());
        },
        "f": (val) => {
            if (treeController.locateEntry(val) !== null) {
                console.log("yes");
            } else {
                console.log("no");
            }
        }
    };

    for (let k = 0; k < totalOperations; k++) {
        const currentCommandParts = sourceLines[k + 1].split(" ");
        const actionIdentifier = currentCommandParts[0];
        const numericalValue = Number(currentCommandParts[1]);

        if (operationMap[actionIdentifier]) {
            operationMap[actionIdentifier](numericalValue);
        }
    }
}