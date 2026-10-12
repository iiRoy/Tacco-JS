class DataQueue {
    constructor(initialElements = []) {
        this.storageArray = initialElements;
        this.readPointer = 0;
        this.elementCount = initialElements.length;
    }

    enqueueElement(item) {
        this.elementCount++;
        this.storageArray.push(item);
    }

    dequeueElement() {
        const item = this.storageArray[this.readPointer];
        this.readPointer++;
        this.elementCount--;
        return item;
    }

    purgeElements() {
        this.storageArray = [];
        this.elementCount = 0;
        this.readPointer = 0;
    }
}

class InputProcessor {
    constructor(initialData) {
        this.dataStream = new DataQueue(initialData);
    }

    fetchRaw() {
        return this.dataStream.dequeueElement();
    }

    fetchInteger() {
        return parseInt(this.dataStream.dequeueElement(), 10);
    }

    resetStream() {
        this.dataStream.purgeElements();
    }
}

const fileSystem = require("fs");
const rawInput = fileSystem.readFileSync("/dev/stdin", "utf8").trim().split(/\s+/g);
const inputReader = new InputProcessor(rawInput);

function solveEquation(readerInstance) {
    const targetValue = readerInstance.fetchInteger();

    for (let firstTerm = 1; firstTerm <= 3500; firstTerm++) {
        for (let thirdTerm = 1; thirdTerm <= 3500; thirdTerm++) {
            // Original equation: i = E*r*n / (4*r*n - E*(r+n))
            // We are iterating 'firstTerm' (r) and 'thirdTerm' (i), and solving for 'secondTerm' (n).
            // Rearranging the equation to solve for n:
            // i * (4*r*n - E*(r+n)) = E*r*n
            // 4*i*r*n - E*i*r - E*i*n = E*r*n
            // 4*i*r*n - E*r*n - E*i*n = E*i*r
            // n * (4*i*r - E*r - E*i) = E*i*r
            // n = (E*i*r) / (4*i*r - E*r - E*i)
            // Where E = targetValue, r = firstTerm, i = thirdTerm, n = secondTerm

            const numerator = targetValue * thirdTerm * firstTerm;
            const denominator = (4 * thirdTerm * firstTerm) - (targetValue * firstTerm) - (targetValue * thirdTerm);

            if (denominator <= 0) {
                continue;
            }

            const secondTerm = numerator / denominator;

            if (Number.isInteger(secondTerm) && secondTerm > 0 && secondTerm <= 3500) {
                const solutionComponents = [firstTerm, secondTerm, thirdTerm];
                console.log(solutionComponents.join(" "));
                return;
            }
        }
    }
}

module.exports = solveEquation(inputReader);
