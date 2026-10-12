const fileSystemModule = require('fs');

const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const allInputLines = rawInputContent.trim().split('\n');

const processingLimit = parseInt(allInputLines[0], 10);

const dataPayloadLines = allInputLines.slice(1);

Array.from({ length: processingLimit }, (_, lineIndex) => {
    const currentLine = dataPayloadLines[lineIndex];
    // This will throw a TypeError if currentLine is undefined,
    // replicating the original behavior when 'processingLimit'
    // exceeds the number of available data lines.
    return currentLine.replace(/Hoshino/g, 'Hoshina');
}).forEach(modifiedLine => {
    console.log(modifiedLine);
});
