'use strict'

const transformToNumeric = (textualRepresentation) => {
    return Number(textualRepresentation);
};

const resolveClassification = (numericDatum) => {
    const outcomeMapping = ['ABC', 'ARC'];
    const selectionIndex = +(numericDatum >= 1200);
    return outcomeMapping[selectionIndex];
};

const orchestrateProcess = () => {
    const externalDataSource = require('node:fs').readFileSync('/dev/stdin', 'utf-8');
    const cleansedInput = externalDataSource.trim();
    const processedValue = transformToNumeric(cleansedInput);

    const identifiedCategory = resolveClassification(processedValue);

    process.stdout.write(identifiedCategory + '\n');
};

orchestrateProcess();