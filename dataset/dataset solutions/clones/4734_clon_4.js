'use strict';

const processor = (payload) => {
    let lineEndIdentifier = payload.length;
    for (let characterIterator = 0; characterIterator < payload.length; characterIterator++) {
        if (payload.charCodeAt(characterIterator) === 10) { // ASCII for newline character
            lineEndIdentifier = characterIterator;
            break;
        }
    }
    const subjectSequence = payload.substring(0, lineEndIdentifier);

    let firstOccurrencePosition = -1;
    let scanningPointer = 0;
    // Locate the initial 'A' (ASCII 65)
    while (scanningPointer < subjectSequence.length) {
        if (subjectSequence.charCodeAt(scanningPointer) === 65) {
            firstOccurrencePosition = scanningPointer;
            break;
        }
        scanningPointer++;
    }

    let lastOccurrencePosition = -1;
    scanningPointer = subjectSequence.length - 1;
    // Locate the terminal 'Z' (ASCII 90)
    while (scanningPointer >= 0) {
        if (subjectSequence.charCodeAt(scanningPointer) === 90) {
            lastOccurrencePosition = scanningPointer;
            break;
        }
        scanningPointer--;
    }

    const calculatedLength = (lastOccurrencePosition - firstOccurrencePosition) + 1;
    console.log(calculatedLength);
};

const nativeIO = require('fs');
const sourceData = nativeIO.readFileSync('/dev/stdin', 'utf-8');

processor(sourceData);