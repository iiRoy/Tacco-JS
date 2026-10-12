class SetManager {
    constructor(elementCount) {
        this.parentNodes = Array.from({ length: elementCount }, (_, idx) => idx);
        this.setSizes = Array.from({ length: elementCount }, () => 1);
    }

    retrieveRepresentative(elementIndex) {
        let current = elementIndex;
        const path = [];
        while (this.parentNodes[current] !== current) {
            path.push(current);
            current = this.parentNodes[current];
        }
        for (const node of path) {
            this.parentNodes[node] = current;
        }
        return current;
    }

    checkEquivalence(firstElement, secondElement) {
        return this.retrieveRepresentative(firstElement) === this.retrieveRepresentative(secondElement);
    }

    combineSets(firstElement, secondElement) {
        let rootA = this.retrieveRepresentative(firstElement);
        let rootB = this.retrieveRepresentative(secondElement);

        if (rootA !== rootB) {
            if (this.setSizes[rootA] < this.setSizes[rootB]) {
                [rootA, rootB] = [rootB, rootA];
            }
            this.parentNodes[rootB] = rootA;
            this.setSizes[rootA] += this.setSizes[rootB];
        }
    }
}

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const inputLines = rawData.split('\n');

const initialParams = inputLines[0].trim().split(' ');
const elementCount = parseInt(initialParams[0], 10);
const queryCount = parseInt(initialParams[1], 10);

const setMgr = new SetManager(elementCount);

inputLines.slice(1).forEach((currentQueryLine) => {
    const commandParts = currentQueryLine.trim().split(' ');
    const operationType = parseInt(commandParts[0], 10);
    const firstArg = parseInt(commandParts[1], 10);
    const secondArg = parseInt(commandParts[2], 10);

    if (operationType === 0) {
        setMgr.combineSets(firstArg, secondArg);
    } else {
        console.log(setMgr.checkEquivalence(firstArg, secondArg) ? 1 : 0);
    }
});
