"use strict";

function* _generateCombinationsInternal(sourceElements, selectionSize) {
    if (selectionSize === 0) {
        yield [];
        return;
    }
    if (sourceElements.length < selectionSize) {
        return;
    }

    for (let i = 0; i <= sourceElements.length - selectionSize; i++) {
        const currentElement = sourceElements[i];
        const remainingElements = sourceElements.slice(i + 1);
        for (const subCombination of _generateCombinationsInternal(remainingElements, selectionSize - 1)) {
            yield [currentElement, ...subCombination];
        }
    }
}

const combineWithoutRepetitions = (comboOptions, comboLength) => {
    return Array.from(_generateCombinationsInternal(comboOptions, comboLength));
};

const entryPoint = (inputData) => {
    const inputLines = inputData.trim().split("\n");
    const nameQuantity = Number(inputLines.shift());
    const nameCollection = inputLines.slice(0, nameQuantity);

    const initialCharacterMap = { 'M': 0, 'A': 1, 'R': 2, 'C': 3, 'H': 4 };
    const initialTally = Array(5).fill(0);

    nameCollection.forEach(individualName => {
        const firstLetter = individualName[0];
        const mappedIndex = initialCharacterMap[firstLetter];
        if (mappedIndex !== undefined) {
            initialTally[mappedIndex]++;
        }
    });

    let cumulativeProduct = 0;
    const availableIndices = [0, 1, 2, 3, 4];

    for (const indexTriplet of _generateCombinationsInternal(availableIndices, 3)) {
        const [firstIdx, secondIdx, thirdIdx] = indexTriplet;
        cumulativeProduct += initialTally[firstIdx] * initialTally[secondIdx] * initialTally[thirdIdx];
    }

    console.log(cumulativeProduct);
};

entryPoint(require('fs').readFileSync('/dev/stdin', 'utf8'));
