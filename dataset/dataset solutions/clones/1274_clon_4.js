process.stdin.setEncoding('utf8');
let receivedPayload = '';

process.stdin.on('readable', () => {
    let dataUnit;
    while ((dataUnit = process.stdin.read()) !== null) {
        receivedPayload += dataUnit;
    }
});

process.stdin.on('end', () => {
    processIncomingStream(receivedPayload);
});

function decomposeText(fullContent, divisionMarker) {
    let sections = [];
    let currentPosition = 0;
    let markerSpan = divisionMarker.length;

    if (fullContent.length === 0) {
        return [];
    }

    while (currentPosition <= fullContent.length) {
        let nextMarkerOccurrence = fullContent.indexOf(divisionMarker, currentPosition);

        if (nextMarkerOccurrence === -1) {
            sections.push(fullContent.substring(currentPosition));
            break;
        } else {
            sections.push(fullContent.substring(currentPosition, nextMarkerOccurrence));
            currentPosition = nextMarkerOccurrence + markerSpan;
        }
    }
    return sections;
}

function reconstructElementsInverted(elementsCollection, spacerChar) {
    let assembledString = '';
    for (let idx = elementsCollection.length - 1; idx >= 0; idx--) {
        assembledString += elementsCollection[idx];
        if (idx > 0) {
            assembledString += spacerChar;
        }
    }
    return assembledString;
}

function processIncomingStream(sourceData) {
    const lineSeparator = '\n';
    let contentLines = decomposeText(sourceData, lineSeparator);

    let targetSegment = '';
    if (contentLines.length > 1) {
        targetSegment = contentLines[1];
    }

    const wordSeparator = ' ';
    let wordUnits = decomposeText(targetSegment, wordSeparator);

    let finalConstruction = reconstructElementsInverted(wordUnits, wordSeparator);

    process.stdout.write(finalConstruction + '\n');
}