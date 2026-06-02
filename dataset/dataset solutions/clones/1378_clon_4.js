const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const rawLines = fileContent.split('\n');

const processedResult = rawLines.reduce((accumulator, currentInputLine) => {
    if (accumulator.halted) {
        return accumulator;
    }

    const [heightString, widthString] = currentInputLine.split(' ');
    const currentDimensionHeight = Number(heightString);
    const currentDimensionWidth = Number(widthString);

    if (currentDimensionHeight === 0 && currentDimensionWidth === 0) {
        accumulator.halted = true;
        return accumulator;
    }

    const generatedRectangle = Array.from({ length: currentDimensionHeight }, (_, rowIdentifier) => {
        return Array.from({ length: currentDimensionWidth }, (_, columnIdentifier) => {
            const isBoundary = rowIdentifier === 0 || rowIdentifier === currentDimensionHeight - 1 ||
                               columnIdentifier === 0 || columnIdentifier === currentDimensionWidth - 1;
            return isBoundary ? '#' : '.';
        }).join('');
    }).join('\n');

    accumulator.outputAccumulator += generatedRectangle + '\n\n';
    return accumulator;
}, { outputAccumulator: '', halted: false });

process.stdout.write(processedResult.outputAccumulator);
