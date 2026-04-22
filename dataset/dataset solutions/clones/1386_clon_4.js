const fileSystemModule = require('node:fs');
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', { encoding: 'utf8' });

const textSegments = rawInputContent.split('\n');

const formattedOutputs = textSegments.map((currentSegment, currentIdx) => {
    const ordinalValue = currentIdx + 1;
    return `Case ${ordinalValue}: ${currentSegment}`;
});

formattedOutputs.forEach(resultString => {
    console.log(resultString);
});