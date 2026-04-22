'use strict';

const conductTransformation = (sourceMaterial) => {
    const contentLines = sourceMaterial.trim().split('\n');
    const configurationDatum = contentLines[0];
    const sequenceToModify = contentLines[1];

    const positionExtractor = configurationDatum.match(/\s(\d+)$/);
    const targetSpot = Number(positionExtractor[1]);

    const characterCollection = Array.from(sequenceToModify);

    const resultingCollection = characterCollection.map((element, currentElementIndex) => {
        if (currentElementIndex === targetSpot - 1) {
            return element.toLowerCase();
        }
        return element;
    });

    return resultingCollection.join('');
};

const rawInputBuffer = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const processedOutput = conductTransformation(rawInputBuffer);
process.stdout.write(processedOutput + '\n');