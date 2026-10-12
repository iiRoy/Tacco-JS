"use strict";

const processInputData = (inputContent) => {
    const firstLine = inputContent.trim().split('\n')[0];
    const indexString = firstLine.split(' ')[0];
    const targetPosition = Number(indexString);

    const seriesRepresentation = "1,1,1,2,1,2,1,5,2,2,1,5,1,2,1,14,1,5,1,5,2,2,1,15,2,2,5,4,1,4,1,51";

    const retrieveElementByIndex = (position, dataSequence) => {
        const parsedElements = dataSequence.split(',');
        return Number(parsedElements[position]);
    };

    console.log(retrieveElementByIndex(targetPosition - 1, seriesRepresentation));
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
