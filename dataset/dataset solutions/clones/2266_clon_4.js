const fileAccessor = require('node:fs');
const acquireDocument = (sourcePath, textEncoding) => {
    const dataSegments = [];
    const bufferCapacity = 8192;
    let bytesObtained;
    const streamHandle = fileAccessor.openSync(sourcePath, 'r');
    const temporaryBuffer = Buffer.alloc(bufferCapacity);
    while ((bytesObtained = fileAccessor.readSync(streamHandle, temporaryBuffer, 0, bufferCapacity, null)) !== 0) {
        dataSegments.push(temporaryBuffer.toString(textEncoding, 0, bytesObtained));
    }
    fileAccessor.closeSync(streamHandle);
    return dataSegments.join('');
};

const decomposeTextIntoEntries = (fullText) => {
    const entries = [];
    let currentPosition = 0;
    let nextNewline;
    while ((nextNewline = fullText.indexOf('\n', currentPosition)) !== -1) {
        entries.push(fullText.substring(currentPosition, nextNewline));
        currentPosition = nextNewline + 1;
    }
    entries.push(fullText.substring(currentPosition));
    return entries;
};

const processInformation = (rawContent) => {
    const contentLines = decomposeTextIntoEntries(rawContent);

    const entryCount = parseInt(contentLines[0], 10);
    const triggerPhrase = contentLines[contentLines.length - 1];

    const relevantDataSections = contentLines.slice(1, entryCount + 1);

    const aggregationResult = relevantDataSections.reduce((accum, currentSection) => {
        if (!accum.triggerDiscovered) {
            const patternToMatch = new RegExp(triggerPhrase);
            if (patternToMatch.test(currentSection)) {
                accum.triggerDiscovered = true;
            }
        }
        if (accum.triggerDiscovered) {
            const separatorIndex = currentSection.indexOf(' ');
            let numericString = '';
            if (separatorIndex !== -1) {
                numericString = currentSection.substring(separatorIndex + 1);
            }
            const valueForAddition = parseInt(numericString, 10);
            accum.totalValue += valueForAddition;
        }
        return accum;
    }, { triggerDiscovered: false, totalValue: 0 });

    process.stdout.write(aggregationResult.totalValue.toString());
};

const sourceText = acquireDocument('/dev/stdin', 'utf8');
processInformation(sourceText);