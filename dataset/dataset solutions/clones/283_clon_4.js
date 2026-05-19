var inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lines = inputData.trim().split("\n");

function processLine(numN, numM) {
    if (numN === 0) {
        return 0;
    }

    class SlotNode {
        constructor(value) {
            this.value = value;
            this.next = null;
            this.prev = null;
            this.isOccupied = false;
        }
    }

    const allNodes = Array(numN);
    let headNode = null;

    for (let i = 0; i < numN; i++) {
        const newNode = new SlotNode(i);
        allNodes[i] = newNode;
        if (!headNode) {
            headNode = newNode;
            newNode.next = newNode;
            newNode.prev = newNode;
        } else {
            const tailNode = headNode.prev;
            tailNode.next = newNode;
            newNode.prev = tailNode;
            newNode.next = headNode;
            headNode.prev = newNode;
        }
    }

    let currentOccupiedPointer = allNodes[0];
    let finalOccupiedValue = 0;

    for (let k = 0; k < numN; k++) {
        let availableSlotsCounted = 0;
        let searchIterator = currentOccupiedPointer;

        while (availableSlotsCounted < numM) {
            searchIterator = searchIterator.next;
            if (!searchIterator.isOccupied) {
                availableSlotsCounted++;
            }
        }

        searchIterator.isOccupied = true;
        finalOccupiedValue = searchIterator.value;
        currentOccupiedPointer = searchIterator;
    }

    return finalOccupiedValue || 1;
}

for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const currentLine = lines[lineIndex];
    if (currentLine === "0 0") {
        break;
    }
    const [numN, numM] = currentLine.split(" ").map(Number);
    console.log(processLine(numN, numM));
}
