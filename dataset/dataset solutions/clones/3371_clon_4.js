let receivedBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (dataSegment) => {
    receivedBuffer += dataSegment;
});

process.stdin.on('end', () => {
    const separatedLines = receivedBuffer.split('\n').filter(Boolean);
    analyzeDimensions(separatedLines);
});

const analyzeDimensions = (sourceCollection) => {
    const [ignoredValue, requiredHeight, requiredWidth] = sourceCollection[0].split(' ').map(Number);

    const validObjectsCount = sourceCollection.slice(1)
        .map(entryString => entryString.split(' ').map(Number))
        .filter(([currentHeight, currentWidth]) => currentHeight >= requiredHeight && currentWidth >= requiredWidth)
        .length;

    console.log(validObjectsCount);
};