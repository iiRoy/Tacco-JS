const fileSystem = require('fs');
const standardInputFD = process.stdin.fd;
const inputBufferLength = fileSystem.fstatSync(standardInputFD).size;
const dataBuffer = Buffer.alloc(inputBufferLength);
const bytesReadCount = fileSystem.readSync(standardInputFD, dataBuffer, 0, inputBufferLength, 0);
const sourceLines = dataBuffer.toString('utf8', 0, bytesReadCount).split('\n');

let linePointer = 0;

function processKnapsackCases() {
    let currentCaseIdentifier = 1;

    do {
        const currentCapacity = parseInt(sourceLines[linePointer++], 10);
        if (currentCapacity === 0) {
            break;
        }

        const numberOfItems = parseInt(sourceLines[linePointer++], 10);

        const valueTable = Array(currentCapacity + 1).fill(0);

        for (let itemIndex = 0; itemIndex < numberOfItems; itemIndex++) {
            const itemDetails = sourceLines[linePointer++].split(',');
            const itemValue = parseInt(itemDetails[0], 10);
            const itemWeight = parseInt(itemDetails[1], 10);

            for (let currentWeight = currentCapacity; currentWeight >= itemWeight; currentWeight--) {
                valueTable[currentWeight] = Math.max(
                    valueTable[currentWeight],
                    valueTable[currentWeight - itemWeight] + itemValue
                );
            }
        }

        const finalResult = valueTable.reduce(
            (accumulator, currentValue, currentIndex) => {
                if (currentValue > accumulator.highestValue) {
                    return { highestValue: currentValue, optimalWeight: currentIndex };
                }
                return accumulator;
            },
            { highestValue: 0, optimalWeight: 0 }
        );

        console.log(
            `Case ${currentCaseIdentifier++}:\n${finalResult.highestValue}\n${finalResult.optimalWeight}`
        );

    } while (true);
}

processKnapsackCases();
