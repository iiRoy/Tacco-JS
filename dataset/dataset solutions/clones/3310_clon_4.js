'use strict';

let memoizationCache;
let primaryInputString;
let secondaryInputString;

function computeLongestCommonSequence(currentPrimaryIndex, currentSecondaryIndex) {
    if (currentPrimaryIndex >= primaryInputString.length || currentSecondaryIndex >= secondaryInputString.length) {
        return [0, ''];
    }

    const lookupKey = `${currentPrimaryIndex},${currentSecondaryIndex}`;
    if (memoizationCache.has(lookupKey)) {
        return memoizationCache.get(lookupKey);
    }

    let currentEvaluationResult;

    if (primaryInputString[currentPrimaryIndex] === secondaryInputString[currentSecondaryIndex]) {
        const [lengthOfSub, sequenceText] = computeLongestCommonSequence(currentPrimaryIndex + 1, currentSecondaryIndex + 1);
        currentEvaluationResult = [1 + lengthOfSub, primaryInputString[currentPrimaryIndex] + sequenceText];
    } else {
        const skipPrimaryChar = computeLongestCommonSequence(currentPrimaryIndex + 1, currentSecondaryIndex);
        const skipSecondaryChar = computeLongestCommonSequence(currentPrimaryIndex, currentSecondaryIndex + 1);

        // This condition preserves the specific tie-breaking rule from the original code.
        // If skipping a char from the secondary string yields a strictly longer sequence, pick that.
        // Otherwise (if skipping primary char is longer or equal), pick the one skipping primary char.
        if (skipSecondaryChar[0] > skipPrimaryChar[0]) {
            currentEvaluationResult = skipSecondaryChar;
        } else {
            currentEvaluationResult = skipPrimaryChar;
        }
    }

    memoizationCache.set(lookupKey, currentEvaluationResult);
    return currentEvaluationResult;
}

function deriveCommonSubsequence(firstSequence, secondSequence) {
    primaryInputString = firstSequence;
    secondaryInputString = secondSequence;
    memoizationCache = new Map();

    const [finalLength, finalSequence] = computeLongestCommonSequence(0, 0);
    return finalSequence;
}

function processInputAndDisplay(rawInputData) {
    const dataChunks = rawInputData.split('\n');
    const firstLineContent = dataChunks[0];
    const secondLineContent = dataChunks[1];
    const finalResultSequence = deriveCommonSubsequence(firstLineContent, secondLineContent);
    console.log(finalResultSequence);
}

processInputAndDisplay(require('fs').readFileSync('/dev/stdin', 'utf8'));