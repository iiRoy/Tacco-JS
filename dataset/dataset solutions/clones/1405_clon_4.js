const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';

const allInputContent = fileSystemModule.readFileSync(standardInputPath, 'utf8');

const processedLines = allInputContent.trim().split('\n');

const terminationSequence = '0 0';

const relevantSegments = processedLines.reduce((accumulator, currentSegment) => {
    if (currentSegment === terminationSequence) {
        // Stop processing further segments once termination is found
        return accumulator;
    }
    // Only add segments before the termination sequence
    accumulator.push(currentSegment);
    return accumulator;
}, []);

const generatedBlocks = relevantSegments.map(dataLine => {
    const dimensionStrings = dataLine.split(' ');
    const numberDimensions = dimensionStrings.map(val => parseInt(val, 10));

    const blockRows = numberDimensions[0];
    const blockColumns = numberDimensions[1];

    const fillCharacter = '#';
    const lineSeparator = '\n';

    // Create a single row pattern, e.g., "###"
    const rowPatternString = ''.padStart(blockColumns, fillCharacter);

    // Create the full block by repeating the row pattern
    const completeBlock = Array.from({ length: blockRows }, () => rowPatternString).join(lineSeparator);

    return completeBlock;
});

const finalOutputString = generatedBlocks.join('\n\n');

process.stdout.write(finalOutputString.trim() + '\n');