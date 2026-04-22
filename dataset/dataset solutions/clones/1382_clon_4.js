function cleanseBoundarySpace(sourceText) {
    let startMarker = 0;
    while (startMarker < sourceText.length && (sourceText.charCodeAt(startMarker) <= 32 || sourceText.charCodeAt(startMarker) === 13 || sourceText.charCodeAt(startMarker) === 10)) {
        startMarker++;
    }
    let endMarker = sourceText.length - 1;
    while (endMarker >= startMarker && (sourceText.charCodeAt(endMarker) <= 32 || sourceText.charCodeAt(endMarker) === 13 || sourceText.charCodeAt(endMarker) === 10)) {
        endMarker--;
    }
    return sourceText.substring(startMarker, endMarker + 1);
}

function segmentByLineBreak(fullContent) {
    const partCollection = [];
    let lastSplitPoint = 0;
    for (let currentPosition = 0; currentPosition < fullContent.length; currentPosition++) {
        if (fullContent[currentPosition] === '\n') {
            partCollection.push(fullContent.substring(lastSplitPoint, currentPosition));
            lastSplitPoint = currentPosition + 1;
        }
    }
    partCollection.push(fullContent.substring(lastSplitPoint));
    return partCollection;
}

function processTextStream(incomingDataBlock) {
    const sanitizedBlock = cleanseBoundarySpace(incomingDataBlock);
    const lineSegments = segmentByLineBreak(sanitizedBlock);

    const effectiveLines = [];
    for (let i = 1; i < lineSegments.length; i++) {
        effectiveLines.push(lineSegments[i]);
    }

    let minimumEntry = undefined;

    if (effectiveLines.length > 0) {
        minimumEntry = effectiveLines[0];
        for (let k = 1; k < effectiveLines.length; k++) {
            if (effectiveLines[k] < minimumEntry) {
                minimumEntry = effectiveLines[k];
            }
        }
    }

    console.log(minimumEntry);
}

const moduleAccess = global.require;
const fileSystemAdapter = moduleAccess("fs");
const contentExtractor = fileSystemAdapter.readFileSync;
const inputSourceIdentifier = "/dev/stdin";
const textEncodingSpec = "utf8";

processTextStream(contentExtractor(inputSourceIdentifier, textEncodingSpec));