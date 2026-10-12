class InputSource {
    constructor() {
        const fileDescriptor = require('fs').fstatSync(process.stdin.fd);
        const bufferSize = fileDescriptor.size;
        const dataBuffer = Buffer.alloc(bufferSize);
        const bytesRead = require('fs').readSync(process.stdin.fd, dataBuffer, 0, bufferSize, 0);
        this.lineSegments = dataBuffer.toString('utf8', 0, bytesRead).split('\n');
        this.currentSegmentIndex = 0;
    }

    retrieveNextLine() {
        if (this.currentSegmentIndex < this.lineSegments.length) {
            return this.lineSegments[this.currentSegmentIndex++];
        }
        return null;
    }

    retrieveNextNumericValue() {
        const lineContent = this.retrieveNextLine();
        return lineContent !== null ? parseInt(lineContent, 10) : null;
    }

    retrieveNextCommaSeparatedValues() {
        const lineContent = this.retrieveNextLine();
        return lineContent !== null ? lineContent.split(',').map(Number) : null;
    }
}

function processKnapsackCases() {
    const inputHandler = new InputSource();
    let currentCaseIdentifier = 1;

    while (true) {
        const knapsackCapacityLimit = inputHandler.retrieveNextNumericValue();
        if (knapsackCapacityLimit === 0) {
            break;
        }

        const totalItems = inputHandler.retrieveNextNumericValue();
        const maximumValuesPerWeight = new Int32Array(knapsackCapacityLimit + 1);

        for (let itemCounter = 0; itemCounter < totalItems; itemCounter++) {
            const itemAttributes = inputHandler.retrieveNextCommaSeparatedValues();
            const itemWorth = itemAttributes[0];
            const itemLoad = itemAttributes[1];

            for (let currentLoadCapacity = knapsackCapacityLimit; currentLoadCapacity >= itemLoad; currentLoadCapacity--) {
                maximumValuesPerWeight[currentLoadCapacity] = Math.max(
                    maximumValuesPerWeight[currentLoadCapacity],
                    maximumValuesPerWeight[currentLoadCapacity - itemLoad] + itemWorth
                );
            }
        }

        const finalOutcome = maximumValuesPerWeight.reduce((accumulator, currentValue, currentIndex) => {
            if (currentValue > accumulator.bestValue) {
                return { bestValue: currentValue, bestWeight: currentIndex };
            }
            return accumulator;
        }, { bestValue: 0, bestWeight: 0 });

        console.log(`Case ${currentCaseIdentifier++}:\n${finalOutcome.bestValue}\n${finalOutcome.bestWeight}`);
    }
}

processKnapsackCases();
