class CharacterNode {
    constructor(value, nextNode = null) {
        this.value = value;
        this.nextNode = nextNode;
    }
}

function constructList(sourceString) {
    if (!sourceString || sourceString.length === 0) {
        return null;
    }
    let headNode = new CharacterNode(sourceString[0]);
    let current = headNode;
    for (let i = 1; i < sourceString.length; i++) {
        current.nextNode = new CharacterNode(sourceString[i]);
        current = current.nextNode;
    }
    return headNode;
}

function Main(inputData) {
    const lines = inputData.split('\n');
    const initialSequence = lines[0];

    let charListHead = constructList(initialSequence);
    let modificationOccurred = true;
    let currentScanOffset = 0;
    let totalTransformations = 0;

    while (modificationOccurred) {
        modificationOccurred = false;

        let scanPointer = charListHead;
        let pointerIndex = 0;
        while (pointerIndex < currentScanOffset && scanPointer) {
            scanPointer = scanPointer.nextNode;
            pointerIndex++;
        }

        let iterationPointer = scanPointer;
        while (iterationPointer && iterationPointer.nextNode && iterationPointer.nextNode.nextNode) {
            if (iterationPointer.value === 'A' &&
                iterationPointer.nextNode.value === 'B' &&
                iterationPointer.nextNode.nextNode.value === 'C') {

                iterationPointer.value = 'B';
                iterationPointer.nextNode.value = 'C';
                iterationPointer.nextNode.nextNode.value = 'A';

                totalTransformations++;
                modificationOccurred = true;
            }
            iterationPointer = iterationPointer.nextNode;
        }

        currentScanOffset += 2;
    }

    console.log(totalTransformations);
}

Main(require('fs').readFileSync('/dev/stdin', 'utf8'));
