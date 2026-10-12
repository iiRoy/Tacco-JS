function swapAndReassignPenultimate(segmentCollection, newPenultimateValue) {
    const penultimateIdx = segmentCollection.length - 2;
    const lastIdx = segmentCollection.length - 1;
    const originalPenultimateValue = segmentCollection[penultimateIdx];

    segmentCollection[penultimateIdx] = newPenultimateValue;
    segmentCollection[lastIdx] = originalPenultimateValue;

    return originalPenultimateValue;
}

function splitRepeatingSegment(matchedRepeat, currentSegmentLength, segmentCollection) {
    const extractedSegment = matchedRepeat.substring(0, currentSegmentLength);
    segmentCollection.push(extractedSegment);

    if (matchedRepeat.length < 3) {
        return segmentCollection;
    } else {
        const remainingString = matchedRepeat.substring(currentSegmentLength);
        const nextSegmentLength = 3 - currentSegmentLength;
        return splitRepeatingSegment(remainingString, nextSegmentLength, segmentCollection);
    }
}

function processRepeatingCharacters(inputStr, currentPosition, segmentCollection) {
    const firstCharacter = inputStr.substring(currentPosition, 1);
    const repeatPattern = new RegExp(`${firstCharacter}*`);
    const stringFromCurrentPosition = inputStr.substring(currentPosition);
    const matchedResult = stringFromCurrentPosition.match(repeatPattern);

    const matchedLength = matchedResult[0].length;

    if (matchedLength > 3) {
        const lengthRemainder = matchedLength % 3;
        if (lengthRemainder === 2) {
            segmentCollection = splitRepeatingSegment(matchedResult[0], 2, segmentCollection);
        } else if (lengthRemainder === 1) {
            segmentCollection = splitRepeatingSegment(matchedResult[0], 1, segmentCollection);
        } else { // lengthRemainder === 0
            segmentCollection = splitRepeatingSegment(matchedResult[0], 2, segmentCollection);
        }
    }
    return segmentCollection;
}

function handleConsecutiveSegments(inputStr, currentPosition, currentSegmentLength, previousSegmentValue, segmentCollection) {
    if (currentPosition > inputStr.length) {
        return;
    }

    const currentSegment = inputStr.substring(currentPosition, currentSegmentLength);
    if (currentSegment === '') {
        return;
    }

    if (previousSegmentValue === currentSegment) {
        const nextPositionCheck = currentPosition + currentSegmentLength + 1;
        if (nextPositionCheck > inputStr.length) {
            const newPreviousSegmentForRecursion = swapAndReassignPenultimate(segmentCollection, previousSegmentValue);
            return handleConsecutiveSegments(inputStr, currentPosition, currentSegmentLength + 1, newPreviousSegmentForRecursion, segmentCollection);
        }
        return handleConsecutiveSegments(inputStr, currentPosition, currentSegmentLength + 1, previousSegmentValue, segmentCollection);
    } else {
        segmentCollection.push(currentSegment);
        return handleConsecutiveSegments(inputStr, currentPosition + currentSegmentLength, 1, currentSegment, segmentCollection);
    }
}

function segmentStringRecursive(inputStr, currentPosition, currentSegmentLength, segmentCollection) {
    if (currentPosition > inputStr.length) {
        return;
    }

    const initialSegment = inputStr.substring(currentPosition, currentSegmentLength);
    if (initialSegment === '') {
        return;
    }

    segmentCollection = processRepeatingCharacters(inputStr, currentPosition, segmentCollection);

    const updatedPositionAfterRepeatProcessing = segmentCollection.join("").length;

    if (updatedPositionAfterRepeatProcessing >= inputStr.length) {
        return;
    }

    const firstCharSegment = inputStr.substring(updatedPositionAfterRepeatProcessing, currentSegmentLength);
    const nextCharSegment = inputStr.substring(updatedPositionAfterRepeatProcessing + currentSegmentLength, 1);

    if (firstCharSegment === nextCharSegment) {
        return segmentStringRecursive(inputStr, updatedPositionAfterRepeatProcessing, currentSegmentLength + 1, segmentCollection);
    } else {
        segmentCollection.push(firstCharSegment, nextCharSegment);
        return handleConsecutiveSegments(inputStr, updatedPositionAfterRepeatProcessing + currentSegmentLength + 1, 1, nextCharSegment, segmentCollection);
    }
}

function processInputString(inputStr) {
    const segmentCollection = [];
    const initialPosition = 0;
    const initialSegmentLength = 1;

    segmentStringRecursive(inputStr, initialPosition, initialSegmentLength, segmentCollection);

    console.log('%d', segmentCollection.length);
}

processInputString(require("fs").readFileSync("/dev/stdin", "utf8"));
