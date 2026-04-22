class ElementNode {
    constructor(payload) {
        this.payload = payload;
        this.descendantLeft = null;
        this.descendantRight = null;
    }
}

class SortedCollection {
    constructor() {
        this.mainBranch = null;
    }

    incorporateElement(itemValue) {
        if (!this.mainBranch) {
            this.mainBranch = new ElementNode(itemValue);
            return;
        }

        let presentNode = this.mainBranch;
        while (true) {
            if (itemValue === presentNode.payload) {
                return; // Element already exists, do nothing
            }
            if (itemValue < presentNode.payload) {
                if (presentNode.descendantLeft === null) {
                    presentNode.descendantLeft = new ElementNode(itemValue);
                    return;
                }
                presentNode = presentNode.descendantLeft;
            } else { // itemValue > presentNode.payload
                if (presentNode.descendantRight === null) {
                    presentNode.descendantRight = new ElementNode(itemValue);
                    return;
                }
                presentNode = presentNode.descendantRight;
            }
        }
    }

    verifyPresence(itemValue) {
        if (!this.mainBranch) {
            return false;
        }

        let presentNode = this.mainBranch;
        while (presentNode) {
            if (itemValue === presentNode.payload) {
                return true; // Element found
            }
            if (itemValue < presentNode.payload) {
                presentNode = presentNode.descendantLeft;
            } else {
                presentNode = presentNode.descendantRight;
            }
        }
        return false; // Element not found
    }
}

let totalOperations;
let orderedItems;

function processCommandData(sourceInput) {
    const dataLines = sourceInput.split("\n");
    totalOperations = parseInt(dataLines[0], 10);
    orderedItems = new SortedCollection();

    const insertActionId = "insert";
    const queryActionId = "find";

    for (let currentInstruction = 1; currentInstruction <= totalOperations; currentInstruction++) {
        const instructionParts = dataLines[currentInstruction].split(" ");
        const performedAction = instructionParts[0];
        const targetOperand = instructionParts[1];

        if (performedAction === insertActionId) {
            orderedItems.incorporateElement(targetOperand);
        } else if (performedAction === queryActionId) {
            if (orderedItems.verifyPresence(targetOperand)) {
                console.log("yes");
            } else {
                console.log("no");
            }
        }
    }
}

processCommandData(require("fs").readFileSync("/dev/stdin", "utf8"));