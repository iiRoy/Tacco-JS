'use strict'

const fileSystemUtility = require('fs');

const processSegment = (sourceString) => {
    let lineDelimiter = sourceString.indexOf('\n');
    let targetSection = (lineDelimiter === -1) ? sourceString : sourceString.substring(0, lineDelimiter);

    let characterCollection = Array.from(targetSection);
    let alteredCollection = characterCollection.map(individualCharacter => {
        if (individualCharacter === ',') {
            return ' ';
        }
        return individualCharacter;
    });

    return alteredCollection.join('');
};

const initiateOperation = () => {
    const inputLocation = '/dev/stdin';
    const rawData = fileSystemUtility.readFileSync(inputLocation, 'utf8');
    const processedResult = processSegment(rawData);
    console.log(processedResult);
};

initiateOperation();