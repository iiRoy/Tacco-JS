"use strict";

const evaluateCondition = (sourceText) => {
    const dataRows = sourceText.split("\n");
    
    const limitValue = Number(dataRows.pop()); 
    
    const collectedMeasurements = dataRows
        .filter((_, idx) => idx < 5) 
        .map(Number);
    
    const minimumObservation = collectedMeasurements.reduce((currentMin, value) => Math.min(currentMin, value), Infinity);
    const maximumObservation = collectedMeasurements.reduce((currentMax, value) => Math.max(currentMax, value), -Infinity);
    
    const differenceExtent = maximumObservation - minimumObservation;
    
    if (differenceExtent > limitValue) {
        console.log("Unacceptable!");
    } else {
        console.log("Acceptable!");
    }
};

const performExecution = () => {
    const retrievedContent = require('node:fs').readFileSync(0, 'utf8');
    evaluateCondition(retrievedContent);
};

performExecution();