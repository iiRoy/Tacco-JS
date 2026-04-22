"use strict";

const evaluateSequenceProgress = (inputSource) => {
    const contentSegments = inputSource.trim().split('\n');
    const numericDimensions = contentSegments[0].split(' ').map(Number);
    const totalElements = numericDimensions[0];
    const windowExtent = numericDimensions[1];

    const elementCollection = contentSegments[1].split(' ').map(Number);

    const sectionCalculations = [];

    for (let currentStart = 0; currentStart <= totalElements - windowExtent; ++currentStart) {
        let currentSectionProduct = 1;
        for (let offset = 0; offset < windowExtent; ++offset) {
            currentSectionProduct *= elementCollection[currentStart + offset];
        }
        sectionCalculations.push(currentSectionProduct);
    }

    const outcomeIndicators = [];

    sectionCalculations.slice(1).forEach((val, idx) => {
        const priorValue = sectionCalculations[idx];
        outcomeIndicators.push(val > priorValue ? "Yes" : "No");
    });

    return outcomeIndicators.join('\n');
};

const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
console.log(evaluateSequenceProgress(rawInput));