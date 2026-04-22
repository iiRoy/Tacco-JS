const obtainModule = global.require;
const outputHandler = global.console;

const fileSystemOperations = obtainModule('node:fs');

function cleanseBoundaries(textSource) {
    let firstCharacterPosition = 0;
    let lastCharacterPosition = textSource.length - 1;

    while (firstCharacterPosition <= lastCharacterPosition && /\s/.test(textSource[firstCharacterPosition])) {
        firstCharacterPosition++;
    }
    while (lastCharacterPosition >= firstCharacterPosition && /\s/.test(textSource[lastCharacterPosition])) {
        lastCharacterPosition--;
    }
    return textSource.substring(firstCharacterPosition, lastCharacterPosition + 1);
}

function segmentByWhitespace(completeString) {
    const individualSegments = [];
    let currentScanPosition = 0;
    while (currentScanPosition < completeString.length) {
        while (currentScanPosition < completeString.length && /\s/.test(completeString[currentScanPosition])) {
            currentScanPosition++;
        }
        if (currentScanPosition < completeString.length) {
            const segmentStart = currentScanPosition;
            while (currentScanPosition < completeString.length && !/\s/.test(completeString[currentScanPosition])) {
                currentScanPosition++;
            }
            individualSegments.push(completeString.substring(segmentStart, currentScanPosition));
        }
    }
    return individualSegments;
}

function combineSegments(itemsCollection, joiningDelimiter) {
    if (itemsCollection.length === 0) {
        return "";
    }
    let assembledString = String(itemsCollection[0]);
    for (let currentItem = 1; currentItem < itemsCollection.length; currentItem++) {
        assembledString += joiningDelimiter + String(itemsCollection[currentItem]);
    }
    return assembledString;
}

const rawContentBuffer = fileSystemOperations.readFileSync(0, 'utf8');

const processedContentString = cleanseBoundaries(rawContentBuffer);

const rawTokensArray = segmentByWhitespace(processedContentString);

const primaryDatasetElements = [];
for (let indexValue = 1; indexValue < rawTokensArray.length; indexValue++) {
    primaryDatasetElements.push(rawTokensArray[indexValue]);
}

const resultDescriptions = [];

for (let currentElement0basedIndex = 0; currentElement0basedIndex < primaryDatasetElements.length; currentElement0basedIndex++) {
    const currentElementDatum = primaryDatasetElements[currentElement0basedIndex];
    const currentElement1basedIdentifier = currentElement0basedIndex + 1;

    let currentDescriptionLine = "entity " + currentElement1basedIdentifier + ": value = " + currentElementDatum;

    if (currentElement1basedIdentifier > 1) {
        const ancestor0basedIndex = Math.floor(currentElement1basedIdentifier / 2) - 1;
        currentDescriptionLine += ", ancestor value = " + primaryDatasetElements[ancestor0basedIndex];
    }

    const leftDescendant1basedIndex = 2 * currentElement1basedIdentifier;
    const leftDescendant0basedIndex = leftDescendant1basedIndex - 1;
    if (leftDescendant0basedIndex < primaryDatasetElements.length) {
        currentDescriptionLine += ", left descendant value = " + primaryDatasetElements[leftDescendant0basedIndex];
    }

    const rightDescendant1basedIndex = (2 * currentElement1basedIdentifier) + 1;
    const rightDescendant0basedIndex = rightDescendant1basedIndex - 1;
    if (rightDescendant0basedIndex < primaryDatasetElements.length) {
        currentDescriptionLine += ", right descendant value = " + primaryDatasetElements[rightDescendant0basedIndex];
    }

    resultDescriptions.push(currentDescriptionLine);
}

outputHandler.log(combineSegments(resultDescriptions, '\n'));