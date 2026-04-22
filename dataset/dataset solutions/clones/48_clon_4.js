const interfaceModule = require('readline');

const streamReader = interfaceModule.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let collectedInputs = [];

streamReader.on('line', (lineContent) => {
    collectedInputs.push(lineContent);
});

class ArrangementManager {
    #members;

    constructor(totalSize) {
        this.#members = new Map();
        for (let k = 1; k <= totalSize; k++) {
            this.#members.set(k, k);
        }
    }

    swapPositions(positionA, positionB) {
        const valueA = this.#members.get(positionA);
        const valueB = this.#members.get(positionB);
        this.#members.set(positionA, valueB);
        this.#members.set(positionB, valueA);
    }

    getOrderedElements() {
        const sortedList = [];
        for (let k = 1; k <= this.#members.size; k++) {
            sortedList.push(this.#members.get(k));
        }
        return sortedList;
    }
}

streamReader.on('close', () => {
    const totalElements = Number(collectedInputs[0]);
    const managerInstance = new ArrangementManager(totalElements);

    for (let i = 2; i < collectedInputs.length; i++) {
        const parts = collectedInputs[i].split(',').map(Number);
        managerInstance.swapPositions(parts[0], parts[1]);
    }

    managerInstance.getOrderedElements().forEach(elementValue => {
        console.log(elementValue);
    });
});