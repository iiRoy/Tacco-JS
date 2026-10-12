"use strict";

const checkNoHashPresence = (textSegment) => textSegment.indexOf("#") === -1;

const removeCharacterAtPosition = (sourceString, charPosition) => {
    const charactersArray = sourceString.split("");
    const filteredCharacters = charactersArray.filter((_, index) => index !== charPosition);
    return filteredCharacters.join("");
};

function processGridTransformation(rawInputData) {
    const cleanedInput = rawInputData.trim();
    const allLines = cleanedInput.split("\n");

    const dimensionValues = allLines[0].split(" ");
    const gridWidth = parseInt(dimensionValues[1], 10);
    const gridHeight = parseInt(dimensionValues[0], 10);

    let mutableGridRows = allLines.slice(1);

    let rowIndicesForRemoval = [];
    for (let currentRIndex = 0; currentRIndex <= gridHeight; currentRIndex++) {
        const currentRowContent = mutableGridRows[currentRIndex];
        if (currentRowContent !== undefined && checkNoHashPresence(currentRowContent)) {
            rowIndicesForRemoval.push(currentRIndex);
        }
    }

    for (let removalIterator = rowIndicesForRemoval.length - 1; removalIterator >= 0; removalIterator--) {
        mutableGridRows.splice(rowIndicesForRemoval[removalIterator], 1);
    }

    for (let currentCIndex = 0; currentCIndex < gridWidth; currentCIndex++) {
        let collectedColumnChars = [];
        for (let rIndexInCurrentGrid = 0; rIndexInCurrentGrid < mutableGridRows.length; rIndexInCurrentGrid++) {
            const charInColumn = mutableGridRows[rIndexInCurrentGrid][currentCIndex];
            if (charInColumn !== undefined) {
                collectedColumnChars.push(charInColumn);
            }
        }

        if (checkNoHashPresence(collectedColumnChars.join(""))) {
            for (let rIndexToModify = mutableGridRows.length - 1; rIndexToModify >= 0; rIndexToModify--) {
                mutableGridRows[rIndexToModify] = removeCharacterAtPosition(mutableGridRows[rIndexToModify], currentCIndex);
            }
        }
    }

    if (mutableGridRows.length === 1) {
        const finalRowString = mutableGridRows[0];
        const hashOnlyOutput = finalRowString.split("").filter(charElement => charElement === "#").join("");
        console.log(hashOnlyOutput);
        return;
    }

    console.log(mutableGridRows.join("\n"));
}

processGridTransformation(require('fs').readFileSync('/dev/stdin', 'utf8'));
