"use strict";

const processInputData = incomingText => {
    const lineSegments = incomingText.split('\n');
    const chromaticSequence = lineSegments[1].trim().split(' ');

    const evaluateSequenceForChanges = (currentSequence, pointerPosition, currentTally) => {
        if (pointerPosition >= currentSequence.length - 1) {
            return currentTally;
        }

        if (currentSequence[pointerPosition] === currentSequence[pointerPosition + 1]) {
            return evaluateSequenceForChanges(currentSequence, pointerPosition + 2, currentTally + 1);
        } else {
            return evaluateSequenceForChanges(currentSequence, pointerPosition + 1, currentTally);
        }
    };

    const finalAlterationCount = evaluateSequenceForChanges(chromaticSequence, 0, 0);
    console.log(finalAlterationCount);
};