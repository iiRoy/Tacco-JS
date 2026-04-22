class ElementUnit {
    constructor() {
        this.leftChild = null;
        this.rightChild = null;
        this.currentLevel = null;
        this.isTerminalNode = null;
        this.creationTimestamp = Date.now();
    }

    hasOpenSlot() {
        return this.leftChild === null || this.rightChild === null;
    }
}

let elementRegistry = [];

const propagatePathSegments = (ancestorElement, desiredLevel) => {
    if (!ancestorElement || typeof desiredLevel !== 'number' || desiredLevel <= ancestorElement.currentLevel) {
        return false;
    }

    let traversalPoint = ancestorElement;
    for (let currentPathLevel = ancestorElement.currentLevel + 1; currentPathLevel <= desiredLevel; currentPathLevel++) {
        const newSegment = new ElementUnit();
        newSegment.currentLevel = currentPathLevel;
        newSegment.isTerminalNode = (currentPathLevel === desiredLevel);

        if (traversalPoint.leftChild === null) {
            traversalPoint.leftChild = newSegment;
        } else if (traversalPoint.rightChild === null) {
            traversalPoint.rightChild = newSegment;
        } else {
            return false;
        }

        elementRegistry.push(newSegment);
        traversalPoint = newSegment;
    }

    elementRegistry.sort((elemA, elemB) => elemA.currentLevel - elemB.currentLevel);

    return true;
};

function findAndExtendPath(targetLevel) {
    let pathOperationSuccess = false;

    for (let k = 0; k < elementRegistry.length; k++) {
        const candidateParent = elementRegistry[k];

        if (candidateParent.isTerminalNode) {
            continue;
        }

        if (candidateParent.leftChild !== null && candidateParent.rightChild !== null) {
            continue;
        }

        const propagationResult = propagatePathSegments(candidateParent, targetLevel);
        if (propagationResult) {
            pathOperationSuccess = true;
            break;
        }
    }
    return pathOperationSuccess;
}

const safeParseInteger = (str) => {
    const parsed = parseInt(str, 10);
    if (isNaN(parsed)) {
        console.error("Failed to parse integer:", str);
        return NaN;
    }
    return parsed;
};

const executeHierarchicalProcess = (inputPayload) => {
    const rawInputLines = inputPayload.split("\n").map(line => line.trim());

    const primaryCountStr = rawInputLines[0];
    const sequenceValuesStr = rawInputLines[1];

    const primaryCountN = safeParseInteger(primaryCountStr);
    if (isNaN(primaryCountN)) {
        console.log(-1);
        return;
    }

    const sequenceA = sequenceValuesStr.split(" ").map(safeParseInteger);
    if (sequenceA.some(isNaN)) {
        console.log(-1);
        return;
    }

    if (sequenceA.length === 0 || sequenceA[0] !== 0) {
        console.log(-1);
        return;
    }

    const initialRoot = new ElementUnit();
    initialRoot.currentLevel = 0;
    initialRoot.isTerminalNode = false;
    elementRegistry.push(initialRoot);

    for (let currentStructureLevel = 1; currentStructureLevel <= primaryCountN; currentStructureLevel++) {
        const elementsToAddAtCurrentLevel = sequenceA[currentStructureLevel];

        for (let segmentIndex = 0; segmentIndex < elementsToAddAtCurrentLevel; segmentIndex++) {
            const operationOutcome = findAndExtendPath(currentStructureLevel);

            if (!operationOutcome) {
                console.log(-1);
                return;
            }
        }
    }

    console.log(elementRegistry.length);
};

executeHierarchicalProcess(require("fs").readFileSync("/dev/stdin", "utf8"));