process.stdin.resume();
process.stdin.setEncoding("utf8");

let completeInput = "";
process.stdin.on("data", (fragment) => { completeInput += fragment; });
process.stdin.on("end", () => { executeOperations(completeInput.split("\n")); });

class Element {
    constructor(value) {
        this.value = value;
        this.leftBranch = null;
        this.rightBranch = null;
    }
}

class Structure {
    constructor() {
        this.treeRoot = null;
    }

    addEntry(numVal) {
        const newElement = new Element(numVal);
        if (!this.treeRoot) {
            this.treeRoot = newElement;
            return;
        }
        let currentElement = this.treeRoot;
        while (true) {
            if (numVal < currentElement.value) {
                if (!currentElement.leftBranch) {
                    currentElement.leftBranch = newElement;
                    return;
                }
                currentElement = currentElement.leftBranch;
            } else { // numVal >= currentElement.value
                if (!currentElement.rightBranch) {
                    currentElement.rightBranch = newElement;
                    return;
                }
                currentElement = currentElement.rightBranch;
            }
        }
    }

    locateEntry(numVal) {
        let currentElement = this.treeRoot;
        while (currentElement) {
            if (numVal === currentElement.value) {
                return currentElement;
            }
            if (numVal < currentElement.value) {
                currentElement = currentElement.leftBranch;
            } else {
                currentElement = currentElement.rightBranch;
            }
        }
        return null;
    }

    retrieveOrdered() { // Iterative In-order Traversal
        const collectedValues = [];
        const elementStack = [];
        let currentElement = this.treeRoot;

        while (currentElement || elementStack.length > 0) {
            while (currentElement) {
                elementStack.push(currentElement);
                currentElement = currentElement.leftBranch;
            }
            currentElement = elementStack.pop();
            collectedValues.push(currentElement.value);
            currentElement = currentElement.rightBranch;
        }
        return collectedValues;
    }

    retrievePreOrdered() { // Iterative Pre-order Traversal
        const collectedValues = [];
        if (!this.treeRoot) return collectedValues;

        const elementStack = [this.treeRoot];
        while (elementStack.length > 0) {
            const currentElement = elementStack.pop();
            collectedValues.push(currentElement.value);

            // Push right child first so left child is processed first (LIFO)
            if (currentElement.rightBranch) {
                elementStack.push(currentElement.rightBranch);
            }
            if (currentElement.leftBranch) {
                elementStack.push(currentElement.leftBranch);
            }
        }
        return collectedValues;
    }
}

function displaySequence(valList) {
    console.log(valList.map(item => ` ${item}`).join(""));
}

function executeOperations(instructionSet) {
    const instructionCount = Number(instructionSet[0]);
    const dataStructure = new Structure();

    const commandDispatch = {
        'i': (op) => dataStructure.addEntry(op),
        'p': () => {
            displaySequence(dataStructure.retrieveOrdered());
            displaySequence(dataStructure.retrievePreOrdered());
        },
        'f': (op) => {
            if (dataStructure.locateEntry(op) !== null) {
                console.log("yes");
            } else {
                console.log("no");
            }
        }
    };

    instructionSet.slice(1, instructionCount + 1).forEach((lineText) => {
        const parts = lineText.split(" ");
        const actionCode = parts[0][0];
        const numericValue = Number(parts[1]);

        if (actionCode === 'p') {
            commandDispatch[actionCode]();
        } else {
            commandDispatch[actionCode](numericValue);
        }
    });
}