let _comparisonCounter = 0;

const _ioConfiguration = {
    sourcePath: 0,
    lineSeparator: '\n',
    encodingFormat: 'utf-8'
};

const _retrieveInputLines = (configSettings) => {
    try {
        const rawContentBuffer = require('fs').readFileSync(configSettings.sourcePath, configSettings.encodingFormat);
        const processedLines = rawContentBuffer.split(configSettings.lineSeparator);
        return processedLines.filter(lineText => lineText.trim() !== '');
    } catch (readError) {
        return [];
    }
};

const _rawInputContent = _retrieveInputLines(_ioConfiguration);

const _ZERO_VALUE = 0;
const _ONE_VALUE = 1;
const _THREE_VALUE = 3;

const _performGappedInsertionSort = (targetCollection, currentGapSize) => {
    if (currentGapSize <= _ZERO_VALUE) {
        return;
    }

    let outerIterator = currentGapSize;
    while (outerIterator < targetCollection.length) {
        const elementToPlace = targetCollection[outerIterator];
        let innerIterator = outerIterator - currentGapSize;

        while (innerIterator >= _ZERO_VALUE && targetCollection[innerIterator] > elementToPlace) {
            targetCollection[innerIterator + currentGapSize] = targetCollection[innerIterator];
            innerIterator -= currentGapSize;
            _comparisonCounter++;
        }
        targetCollection[innerIterator + currentGapSize] = elementToPlace;
        outerIterator += _ONE_VALUE;
    }
};

const _generateKnuthGapSequence = (collectionLength) => {
    const calculatedGaps = [];
    let sequenceIndex = _ZERO_VALUE;
    let nextSequenceTerm = _ONE_VALUE;
    
    while (nextSequenceTerm <= collectionLength) {
        calculatedGaps.push(nextSequenceTerm);
        sequenceIndex++;
        nextSequenceTerm = (_THREE_VALUE * calculatedGaps[sequenceIndex - _ONE_VALUE]) + _ONE_VALUE;
        if (nextSequenceTerm < _ZERO_VALUE) break;
    }
    return calculatedGaps.reverse();
};

const _applyShellSortAlgorithm = (dataCollection) => {
    if (!dataCollection || dataCollection.length <= _ONE_VALUE) {
        return dataCollection;
    }

    const intervalSizes = _generateKnuthGapSequence(dataCollection.length);

    let gapSearchIndex = _ZERO_VALUE;
    while (gapSearchIndex < intervalSizes.length) {
        const currentGap = intervalSizes[gapSearchIndex];
        _performGappedInsertionSort(dataCollection, currentGap);
        gapSearchIndex += _ONE_VALUE;
    }

    return dataCollection;
};

const _parseNumberSafely = (inputString, fallbackValue = _ZERO_VALUE) => {
    const numericalValue = Number(inputString);
    if (isNaN(numericalValue) || !isFinite(numericalValue)) {
        return fallbackValue;
    }
    return Math.floor(numericalValue);
};

const _declaredElementCount = _parseNumberSafely(_rawInputContent[_ZERO_VALUE]);

const _inputArrayForSorting = [];
let parsingIndex = _ONE_VALUE;
while (parsingIndex <= _declaredElementCount && parsingIndex < _rawInputContent.length) {
    _inputArrayForSorting.push(_parseNumberSafely(_rawInputContent[parsingIndex]));
    parsingIndex += _ONE_VALUE;
}

if (_inputArrayForSorting.length !== _declaredElementCount) {
    // Intentionally allowing mismatch, or could adjust _declaredElementCount
}

const _finalSortedCollection = _applyShellSortAlgorithm(_inputArrayForSorting);

const _formatOutput = (operationCount, sortedElements) => {
    let resultString = operationCount.toString();
    resultString += _ioConfiguration.lineSeparator;
    
    let elementStrings = [];
    let currentElementIdx = _ZERO_VALUE;
    while(currentElementIdx < sortedElements.length) {
        elementStrings.push(sortedElements[currentElementIdx].toString());
        currentElementIdx += _ONE_VALUE;
    }
    resultString += elementStrings.join(_ioConfiguration.lineSeparator);
    
    return resultString;
};

const _programOutput = _formatOutput(_comparisonCounter, _finalSortedCollection);

console.log(_programOutput);