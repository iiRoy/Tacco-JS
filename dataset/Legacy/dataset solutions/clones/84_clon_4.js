const legacySystemModule = require('sys');

let collectedSegments = [];

function transformAndDisplay(fullContent) {
    const processedText = Array.from(fullContent).map(char => char.toUpperCase()).join('');
    legacySystemModule.print(processedText);
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (dataChunk) => {
    collectedSegments.push(dataChunk);
});

process.stdin.on('end', () => {
    const combinedInput = collectedSegments.join('');
    transformAndDisplay(combinedInput);
});
