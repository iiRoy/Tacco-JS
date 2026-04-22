const fileSystem = require('fs');

function processInputValues(dataLines) {
    const totalItems = parseInt(dataLines[0], 10);
    const itemValuesAsString = dataLines[1].match(/\S+/g);

    const indexedItems = Array.from({ length: totalItems }, (_, currentIdx) => ({
        realValue: parseInt(itemValuesAsString[currentIdx], 10),
        initialPosition: currentIdx + 1
    }));

    indexedItems.sort((first, second) => first.realValue - second.realValue);

    const resultingOrder = indexedItems.reduce((accumulator, currentItem) => {
        accumulator.push(currentItem.initialPosition);
        return accumulator;
    }, []);

    process.stdout.write(resultingOrder.join(' ') + '\n');
}

const inputBuffer = Buffer.alloc(1024 * 16);
let allInputData = '';
let bytesReadFromStream = 0;

try {
    while ((bytesReadFromStream = fileSystem.readSync(process.stdin.fd, inputBuffer, 0, inputBuffer.length, null)) > 0) {
        allInputData += inputBuffer.toString('utf8', 0, bytesReadFromStream);
    }
} catch (readError) {
    // Error handling for stdin read, if necessary for specific environments.
    // For typical competitive programming scenarios, this block is often omitted.
}

const linesOfInput = allInputData.trim().split('\n');

if (linesOfInput.length >= 2) {
    processInputValues(linesOfInput);
}