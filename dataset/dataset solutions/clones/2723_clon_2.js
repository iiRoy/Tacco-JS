function ProcessData(rawData) {
    rawData  =  rawData.split('\n');

    let firstLineParts = rawData[0].split(' ');

    const ItemCount = parseInt(firstLineParts[0]);
    const Repetitions = parseInt(firstLineParts[1]);

    const OriginalItems = rawData[1].split(' ');

    let NextOccurrenceIndices = new Array(ItemCount);

    const DoubledItems = OriginalItems.concat(OriginalItems);

    for (let idx = 0; idx < ItemCount; idx++) {
        let currentSlice = DoubledItems.slice(idx + 1);
        let foundIndex = currentSlice.indexOf(OriginalItems[idx]) + 1;
        NextOccurrenceIndices[idx] = foundIndex;
    }

    let currentPosition = 0;
    let lastSafePosition = 0;

    while (currentPosition < ItemCount * Repetitions) {
        lastSafePosition = currentPosition;
        currentPosition += NextOccurrenceIndices[currentPosition % ItemCount] + 1;
    }

    let startingPointIndex = lastSafePosition % ItemCount;
    let remainingSequence = OriginalItems.slice(startingPointIndex);

    let finalUniqueElements = [];
    let sequenceIterator = 0;

    while (sequenceIterator < remainingSequence.length) {
        if (remainingSequence.slice(sequenceIterator + 1).indexOf(remainingSequence[sequenceIterator]) === -1) {
            finalUniqueElements.push(remainingSequence[sequenceIterator]);
            sequenceIterator++;
        } else {
            sequenceIterator += remainingSequence.slice(sequenceIterator + 1).indexOf(remainingSequence[sequenceIterator]) + 2;
        }
    }
    console.log(finalUniqueElements.join(' '));
}
ProcessData(require('fs').readFileSync('/dev/stdin', 'utf8'));