const _inputSource = require('readline');

const _dataSegments = [];

const _interfaceHandler = _inputSource.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

_interfaceHandler.on('line', (individualSegment) => {
    _dataSegments.push(individualSegment);
});

_interfaceHandler.on('close', () => {
    _processCollectedData(_dataSegments);
});

function _processCollectedData(allSegments) {
    const primarySegment = allSegments[0];
    const valueTriplet = primarySegment.split(' ');

    const singularValue = _determineUniqueElement(valueTriplet);
    _emitResult(singularValue);
}

function _determineUniqueElement(elementCollection) {
    const elementCounts = new Map();
    for (const item of elementCollection) {
        elementCounts.set(item, (elementCounts.get(item) || 0) + 1);
    }

    for (const [item, count] of elementCounts.entries()) {
        if (count === 1) {
            return item;
        }
    }
    return null; 
}

function _emitResult(finalOutput) {
    process.stdout.write(finalOutput + '\n');
}