const fileSystemModule = require('fs');

const inputBufferLength = fileSystemModule.fstatSync(process.stdin.fd).size;
const inputBuffer = Buffer.alloc(inputBufferLength);
const readBytesCount = fileSystemModule.readSync(process.stdin.fd, inputBuffer, 0, inputBufferLength, 0);
const inputLinesArray = inputBuffer.toString('utf8', 0, readBytesCount).split('\n');

processKnapsackProblems();

function getMaximum(valA, valB) {
    return Math.max(valA, valB);
}

function processKnapsackProblems() {
    let lineCursor = 0;
    let problemCaseNumber = 1;

    const readNextNumericLine = () => Number(inputLinesArray[lineCursor++]);
    const readNextItemDetails = () => inputLinesArray[lineCursor++].split(",");

    while (true) {
        const knapsackCapacity = readNextNumericLine();

        if (knapsackCapacity === 0) {
            break;
        }
        
        const numberOfItems = readNextNumericLine();
        let previousRowDP = new Int32Array(knapsackCapacity + 1);

        for (let currentItemIdx = 0; currentItemIdx < numberOfItems; currentItemIdx++) {
            const itemDetailsStr = readNextItemDetails();
            const itemValue = Number(itemDetailsStr[0]);
            const itemWeight = Number(itemDetailsStr[1]);

            let currentRowDP = new Int32Array(knapsackCapacity + 1);
            for (let currentCapacity = 1; currentCapacity <= knapsackCapacity; currentCapacity++) {
                if (currentCapacity < itemWeight) {
                    currentRowDP[currentCapacity] = previousRowDP[currentCapacity];
                } else {
                    const valueIfIncluded = previousRowDP[currentCapacity - itemWeight] + itemValue;
                    const valueIfExcluded = previousRowDP[currentCapacity];
                    currentRowDP[currentCapacity] = getMaximum(valueIfIncluded, valueIfExcluded);
                }
            }
            previousRowDP = currentRowDP;
        }

        let finalOptimalWeight = 0;
        let finalOptimalValue = 0;
        for (let capacityIdx = 0; capacityIdx <= knapsackCapacity; capacityIdx++) {
            const currentValueAtCapacity = previousRowDP[capacityIdx];
            if (currentValueAtCapacity > finalOptimalValue) {
                finalOptimalValue = currentValueAtCapacity;
                finalOptimalWeight = capacityIdx;
            }
        }
        
        console.log(`Case ${problemCaseNumber++}:\n${finalOptimalValue}\n${finalOptimalWeight}`);
    }
}
