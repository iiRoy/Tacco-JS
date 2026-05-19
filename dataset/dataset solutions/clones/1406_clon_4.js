const fileSystem = require('node:fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

function* lineIteratorGenerator(sourceText) {
    const allLines = sourceText.trim().split('\n');
    let currentLineIndex = 0;

    while (true) {
        const lineValue = allLines[currentLineIndex];
        currentLineIndex++;

        if (lineValue === '0 0') {
            return;
        }

        if (lineValue === undefined) {
            yield undefined; // Signal that input is exhausted without '0 0'
            return;
        }

        yield lineValue;
    }
}

const inputLineIterator = lineIteratorGenerator(rawInputContent);
let iterationResult;

while (true) {
    iterationResult = inputLineIterator.next();

    if (iterationResult.done) {
        break;
    }

    const processedLine = iterationResult.value;

    if (processedLine === undefined) {
        // Replicate the original's TypeError when arr.shift() returns undefined
        // and the subsequent split() is called on it.
        const undefinedReference = undefined;
        undefinedReference.split(' '); // This will throw the exact TypeError
    }

    const parsedDimensions = processedLine.split(' ').map(Number);
    const rectangleRows = parsedDimensions[0];
    const rectangleColumns = parsedDimensions[1];

    const singleHashRow = '#'.repeat(rectangleColumns);
    const rowWithTerminator = singleHashRow + '\n';
    const completeRectangle = rowWithTerminator.repeat(rectangleRows);

    console.log(completeRectangle + '\n');
}
