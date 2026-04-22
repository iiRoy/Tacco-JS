class TreeUnit {
    constructor(val, leftRef, rightRef) {
        this.value = val;
        this.leftIdentifier = leftRef;
        this.rightIdentifier = rightRef;
        this.leftSub = null;
        this.rightSub = null;
    }
}

function gatherPreorder(rootUnit, collector) {
    if (!rootUnit) return;
    const traversalStack = [];
    traversalStack.push(rootUnit);

    while (traversalStack.length > 0) {
        const currentUnit = traversalStack.pop();
        collector.push(currentUnit.value);

        if (currentUnit.rightSub) {
            traversalStack.push(currentUnit.rightSub);
        }
        if (currentUnit.leftSub) {
            traversalStack.push(currentUnit.leftSub);
        }
    }
}

function gatherInorder(rootUnit, collector) {
    if (!rootUnit) return;
    const traversalStack = [];
    let presentElement = rootUnit;

    while (presentElement || traversalStack.length > 0) {
        while (presentElement) {
            traversalStack.push(presentElement);
            presentElement = presentElement.leftSub;
        }

        presentElement = traversalStack.pop();
        collector.push(presentElement.value);
        presentElement = presentElement.rightSub;
    }
}

function gatherPostorder(rootUnit, collector) {
    if (!rootUnit) return;
    const temporaryStack = [];
    const outputSegment = [];
    temporaryStack.push(rootUnit);

    while (temporaryStack.length > 0) {
        const presentElement = temporaryStack.pop();
        outputSegment.push(presentElement.value);

        if (presentElement.leftSub) {
            temporaryStack.push(presentElement.leftSub);
        }
        if (presentElement.rightSub) {
            temporaryStack.push(presentElement.rightSub);
        }
    }
    while (outputSegment.length > 0) {
        collector.push(outputSegment.pop());
    }
}

const entryData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataLines = entryData.trim().split('\n');

const countNodes = +dataLines.shift();

const structureMap = new Map();
const kidIdentifiers = new Set();

for (let i = 0; i < countNodes; i++) {
    const parts = dataLines.shift().split(' ');
    const idVal = +parts[0];
    const leftVal = +parts[1];
    const rightVal = +parts[2];

    structureMap.set(idVal, new TreeUnit(idVal, leftVal, rightVal));

    if (leftVal !== -1) {
        kidIdentifiers.add(leftVal);
    }
    if (rightVal !== -1) {
        kidIdentifiers.add(rightVal);
    }
}

let initialElement = null;
let initialElementId = -1;

for (const [id, unit] of structureMap.entries()) {
    if (!kidIdentifiers.has(id)) {
        initialElementId = id;
    }
    if (unit.leftIdentifier !== -1) {
        unit.leftSub = structureMap.get(unit.leftIdentifier);
    }
    if (unit.rightIdentifier !== -1) {
        unit.rightSub = structureMap.get(unit.rightIdentifier);
    }
}

initialElement = structureMap.get(initialElementId);

const resultCollection = [];

gatherPreorder(initialElement, resultCollection);
console.log('Preorder');
console.log(' ' + resultCollection.join(' '));

resultCollection.length = 0;

gatherInorder(initialElement, resultCollection);
console.log('Inorder');
console.log(' ' + resultCollection.join(' '));

resultCollection.length = 0;

gatherPostorder(initialElement, resultCollection);
console.log('Postorder');
console.log(' ' + resultCollection.join(' '));