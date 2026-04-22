"use strict";

const parseInputStructure = (inputStringContent) => {
    const linesOfText = inputStringContent.trim().split('\n');
    const dimensions = linesOfText[0].split(' ').map(Number);
    // const unusedHeight = dimensions[0]; // The first dimension is not used in the problem's logic
    const widthDimension = dimensions[1];
    
    const uniqueElementQuantity = Number(linesOfText[1]);
    const elementRepeatCounts = linesOfText[2].split(' ').map(Number);
    
    return {
        gridWidth: widthDimension,
        uniqueElementQuantity: uniqueElementQuantity,
        repetitionsPerElement: elementRepeatCounts
    };
};

const computeGridPattern = (configuration) => {
    const { gridWidth, uniqueElementQuantity, repetitionsPerElement } = configuration;

    if (uniqueElementQuantity === 1) {
        return '1';
    }

    const flatSequenceOfValues = repetitionsPerElement.flatMap((currentCount, elementIdx) => {
        const valueToRepeat = elementIdx + 1;
        return Array.from({ length: currentCount }, () => valueToRepeat);
    });

    const totalValues = flatSequenceOfValues.length;
    const totalRowUnits = Math.ceil(totalValues / gridWidth);

    const finalDisplayRows = Array.from({ length: totalRowUnits }, (_, rowIdx) => {
        const startPosition = rowIdx * gridWidth;
        const endPosition = startPosition + gridWidth;
        let currentSegment = flatSequenceOfValues.slice(startPosition, endPosition);
        
        const lastElementIndexInFlatSequence = endPosition - 1;

        if (lastElementIndexInFlatSequence % 2 !== 0) {
            currentSegment.reverse();
        }
        return currentSegment.join(' ');
    });

    return finalDisplayRows.join('\n');
};

const orchestrateProcessing = (rawInput) => {
    const parsedConfiguration = parseInputStructure(rawInput);
    return computeGridPattern(parsedConfiguration);
};

(function() {
    const inputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    const finalOutput = orchestrateProcessing(inputContent);
    console.log(finalOutput);
})();