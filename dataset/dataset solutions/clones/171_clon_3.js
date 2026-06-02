var fileSystem = require('fs');

function readInputFromFile() {
    const fileDescriptor = process.stdin.fd;
    const fileSize = fileSystem.fstatSync(fileDescriptor).size;
    const dataBuffer = Buffer.alloc(fileSize);
    const actualBytes = fileSystem.readSync(fileDescriptor, dataBuffer, 0, fileSize, 0);
    return dataBuffer.toString('utf8', 0, actualBytes).split('\n');
}

const inputLinesArray = readInputFromFile();
processAllCases();

function processAllCases() {
    let currentLineIdx = 0;
    for (let caseCounter = 1; ; caseCounter++) {
        const knapsackCapacityStr = inputLinesArray[currentLineIdx++];
        const knapsackCapacity = parseInt(knapsackCapacityStr, 10);

        if (isNaN(knapsackCapacity) || knapsackCapacity === 0) {
            break;
        }

        const numItemsStr = inputLinesArray[currentLineIdx++];
        const numItems = parseInt(numItemsStr, 10);

        const dpArraySize = knapsackCapacity + 1;
        let previousRowDP = new Int16Array(dpArraySize);

        for (let itemIndex = 0; itemIndex < numItems; itemIndex++) {
            const itemLine = inputLinesArray[currentLineIdx++];
            const itemDetails = itemLine.split(",");
            
            const itemValue = parseInt(itemDetails[0], 10);
            const itemWeight = parseInt(itemDetails[1], 10);

            let currentRowDP = new Int16Array(dpArraySize);
            for (let currentCapacity = 1; currentCapacity <= knapsackCapacity; currentCapacity++) {
                const prevRowValue = previousRowDP[currentCapacity];
                currentRowDP[currentCapacity] = prevRowValue;

                const remainingCapacity = currentCapacity - itemWeight;
                if (remainingCapacity >= 0) {
                    const valueIfIncluded = previousRowDP[remainingCapacity] + itemValue;
                    currentRowDP[currentCapacity] = Math.max(valueIfIncluded, prevRowValue);
                }
            }
            previousRowDP = currentRowDP;
        }

        let finalOptimalWeight = 1001;
        let finalOptimalValue = 0;

        for (let idx = 0; idx <= knapsackCapacity; idx++) {
            const prevRowValueAtIndex = previousRowDP[idx];
            if (prevRowValueAtIndex > finalOptimalValue) {
                finalOptimalValue = prevRowValueAtIndex;
                finalOptimalWeight = idx;
            }
        }
        
        console.log("Case " + caseCounter + ":\n" + finalOptimalValue + "\n" + finalOptimalWeight);
    }
}
