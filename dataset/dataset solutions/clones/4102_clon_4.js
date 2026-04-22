function processInputData(sourceContent) {
    const rawLines = sourceContent.split('\n');

    const effectiveLines = rawLines.reduce((accumulator, currentLine, index, array) => {
        if (index > 0 && index < array.length - 1) {
            accumulator.push(currentLine);
        }
        return accumulator;
    }, []);

    const uniqueEntryTracker = new Set(effectiveLines);

    console.log(uniqueEntryTracker.size);
}

const systemIO = require('fs');
const rawInputBuffer = systemIO.readFileSync('/dev/stdin', 'utf8');

processInputData(rawInputBuffer);