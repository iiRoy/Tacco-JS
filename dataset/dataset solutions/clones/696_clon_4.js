class NodeElement {
    constructor(value) {
        this.data = value;
        this.nextElement = null;
    }
}

class CardChain {
    constructor() {
        this.front = null;
        this.back = null;
        this.size = 0;
    }

    addFront(val) {
        const newNode = new NodeElement(val);
        if (!this.front) {
            this.front = newNode;
            this.back = newNode;
        } else {
            newNode.nextElement = this.front;
            this.front = newNode;
        }
        this.size++;
    }

    initSequence(limit) {
        for (let k = 1; k <= limit; k++) {
            this.addFront(k);
        }
    }

    manipulateSegment(startPos, quantity) {
        if (startPos < 0 || startPos >= this.size || quantity <= 0) {
            return;
        }

        let current = this.front;
        let preceding = null;

        for (let i = 0; i < startPos; i++) {
            preceding = current;
            current = current.nextElement;
        }

        let segmentHead = current;
        let segmentTail = null;
        let segmentCount = 0;

        while (segmentCount < quantity && current) {
            segmentTail = current;
            current = current.nextElement;
            segmentCount++;
        }

        if (preceding) {
            preceding.nextElement = current;
        } else {
            this.front = current;
        }
        if (!current) {
            this.back = preceding;
        }
        segmentTail.nextElement = null;

        this.size -= segmentCount;

        let previousSegmentNode = null;
        let currentSegmentNode = segmentHead;
        let nextSegmentNode = null;
        while (currentSegmentNode) {
            nextSegmentNode = currentSegmentNode.nextElement;
            currentSegmentNode.nextElement = previousSegmentNode;
            previousSegmentNode = currentSegmentNode;
            currentSegmentNode = nextSegmentNode;
        }

        if (previousSegmentNode) {
            segmentHead.nextElement = this.front;
            this.front = previousSegmentNode;
            if (!this.back) {
                this.back = segmentHead;
            }
            this.size += segmentCount;
        }
    }
    
    getTopItem() {
        return this.front ? this.front.data : undefined;
    }
}

const fileSystem = require('fs');
const rawText = fileSystem.readFileSync('/dev/stdin', 'utf8').trim();
const textRows = rawText.split('\n');

let rowPointer = 0;

while (true) {
    const currentTextRow = textRows[rowPointer++];
    if (!currentTextRow) break;

    const numericValues = currentTextRow.split(' ').map(Number);
    const totalCards = numericValues[0];
    const numOperations = numericValues[1];

    if (totalCards === 0 && numOperations === 0) break;

    const primaryChain = new CardChain();
    primaryChain.initSequence(totalCards);

    for (let opIndex = 0; opIndex < numOperations; opIndex++) {
        const operationTextRow = textRows[rowPointer++];
        const operationParams = operationTextRow.split(' ').map(Number);
        const startPosition = operationParams[0];
        const moveCount = operationParams[1];

        primaryChain.manipulateSegment(startPosition - 1, moveCount);
    }
    console.log(primaryChain.getTopItem());
}