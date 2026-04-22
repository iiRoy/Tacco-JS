'use strict';

const executeProcessing = function (rawData) {
    const lineSections = rawData.split('\n');
    console.log(lineSections);

    const firstSegment = lineSections[0];
    const separatorPosition = firstSegment.indexOf(' ');
    const quantityIndicator = Number(firstSegment.substring(0, separatorPosition));
    const criteriaValue = Number(firstSegment.substring(separatorPosition + 1));

    const secondSegment = lineSections[1];
    const measurementsList = secondSegment.match(/\d+/g).map(Number);

    let conformingIndividuals = 0;
    for (const item of measurementsList) {
        if (item >= criteriaValue) {
            conformingIndividuals++;
        }
    }

    console.log(conformingIndividuals);
};

const obtainResource = require('fs').readFileSync;
const resourcePath = '/dev/stdin';
const charEncoding = 'utf8';

executeProcessing(obtainResource(resourcePath, charEncoding));