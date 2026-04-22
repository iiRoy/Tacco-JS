const obtainFileAccess = require('fs');

function decomposeText(fullText, markerCharacter) {
    if (fullText.length === 0) {
        return [''];
    }
    let gatheredParts = [];
    let currentSegment = '';
    for (let i = 0; i < fullText.length; i++) {
        if (fullText[i] === markerCharacter) {
            gatheredParts.push(currentSegment);
            currentSegment = '';
        } else {
            currentSegment += fullText[i];
        }
    }
    gatheredParts.push(currentSegment);
    return gatheredParts;
}

function interpretAsInteger(strSequence) {
    let outcome = 0;
    let multiplier = 1;
    let position = 0;
    if (strSequence.length === 0) {
        return 0; // Mimics Number('') -> 0
    }
    if (strSequence[0] === '-') {
        multiplier = -1;
        position++;
    }
    for (; position < strSequence.length; position++) {
        const charCode = strSequence.charCodeAt(position);
        if (charCode < 48 || charCode > 57) { // Not a digit
            // Mimics Number behavior for non-numeric strings, usually NaN.
            // But the problem context implies valid integers.
            // For simplicity and to match `Number`'s zero-handling,
            // we'll assume valid input or return 0 for empty string,
            // which is the only non-numeric case for this specific problem.
            return 0;
        }
        outcome = outcome * 10 + (charCode - 48); // '0'.charCodeAt(0) is 48
    }
    return outcome * multiplier;
}

function generateCharacterLine(totalCount, characterSymbol) {
    function recurseBuild(remainingCount, currentLine = '') {
        if (remainingCount <= 0) {
            return currentLine;
        }
        return recurseBuild(remainingCount - 1, currentLine + characterSymbol);
    }
    return recurseBuild(totalCount);
}

function assembleGraphic(verticalExtent, horizontalExtent) {
    if (verticalExtent === 0) {
        return '';
    }
    const graphicRow = generateCharacterLine(horizontalExtent, '#');
    const fullGraphicRow = graphicRow + '\n';

    function recurseAssemble(remainingRows, currentGraphic = '') {
        if (remainingRows <= 0) {
            return currentGraphic;
        }
        return recurseAssemble(remainingRows - 1, currentGraphic + fullGraphicRow);
    }
    return recurseAssemble(verticalExtent);
}

function appendToList(originalList, newItem) {
    const newList = new Array(originalList.length + 1);
    for (let i = 0; i < originalList.length; i++) {
        newList[i] = originalList[i];
    }
    newList[originalList.length] = newItem;
    return newList;
}

function processAllEntries(entryList, currentIdx = 0, collectedOutputs = []) {
    if (currentIdx >= entryList.length) {
        return collectedOutputs;
    }

    const currentEntry = entryList[currentIdx];
    let resultantSegment;

    if (currentEntry.length === 0) {
        resultantSegment = '';
    } else {
        const valueComponents = decomposeText(currentEntry, ' ');
        const dimensionA = interpretAsInteger(valueComponents[0]);
        const dimensionB = interpretAsInteger(valueComponents[1]);

        if (dimensionA === 0) {
            resultantSegment = '';
        } else {
            resultantSegment = assembleGraphic(dimensionA, dimensionB);
        }
    }

    return processAllEntries(entryList, currentIdx + 1, appendToList(collectedOutputs, resultantSegment));
}

function combineSegments(collection, linkString, index = 0, currentString = '') {
    if (index >= collection.length) {
        return currentString;
    }
    const segment = collection[index];
    if (index > 0) {
        currentString += linkString;
    }
    currentString += segment;
    return combineSegments(collection, linkString, index + 1, currentString);
}

const entireContent = obtainFileAccess.readFileSync('/dev/stdin', 'utf8');
const linesOfInput = decomposeText(entireContent, '\n');
const finalOutputParts = processAllEntries(linesOfInput);
const finalResult = combineSegments(finalOutputParts, '\n');

process.stdout.write(finalResult);