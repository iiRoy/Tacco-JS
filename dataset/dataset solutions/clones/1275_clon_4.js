let dataSource = require('fs').readFileSync('/dev/stdin', 'utf8');

let retrieveTargetLine = (completeContent) => {
    let lineSectionMatch = completeContent.match(/(?:[^\n]*\n){1}([^\n]*)/);
    return lineSectionMatch ? lineSectionMatch[1] : undefined;
};

let chosenLineData = retrieveTargetLine(dataSource);

let processAndFormatSequence = (rawTextSegment) => {
    let wordConstructionReducer = (currentAccumulator, characterEntity) => {
        if (characterEntity === ' ') {
            currentAccumulator.segmentsCollection.push(currentAccumulator.currentSegmentPart);
            currentAccumulator.currentSegmentPart = '';
        } else {
            currentAccumulator.currentSegmentPart += characterEntity;
        }
        return currentAccumulator;
    };

    let initialWordState = { segmentsCollection: [], currentSegmentPart: '' };
    let finalWordState = Array.from(rawTextSegment).reduce(wordConstructionReducer, initialWordState);
    finalWordState.segmentsCollection.push(finalWordState.currentSegmentPart);

    let createdWordArray = finalWordState.segmentsCollection;

    let reversedAndConcatenated = createdWordArray.reduceRight((resultString, elementItem, positionIndex, fullList) => {
        return resultString + elementItem + (positionIndex === 0 ? '' : ' ');
    }, '');

    return reversedAndConcatenated;
};

let finalDisplayOutput = processAndFormatSequence(chosenLineData);
console.log(finalDisplayOutput);