const rawSource = require('fs').readFileSync('/dev/stdin', 'utf8');
const queries = rawSource.trim().split('\n');

const MARK_TO_NUMBER = { 'r': 0, 'g': 1, 'b': 2 };
const NUMBER_TO_MARK = ['r', 'g', 'b'];

function convertPatternToNumericalArray(sequencePattern) {
    return Array.from(sequencePattern).map(singleMark => MARK_TO_NUMBER[singleMark]);
}

function convertNumericalArrayToPattern(numericalArray) {
    return numericalArray.map(numericalMark => NUMBER_TO_MARK[numericalMark]).join('');
}

function produceSuccessorPatterns(currentPattern) {
    const segmentsArray = convertPatternToNumericalArray(currentPattern);
    const generatedPatterns = [];

    for (let currentPos = 0; currentPos < segmentsArray.length - 1; currentPos++) {
        const segmentOne = segmentsArray[currentPos];
        const segmentTwo = segmentsArray[currentPos + 1];

        if (segmentOne === segmentTwo) {
            continue;
        }

        const mutatedSegment = 3 - segmentOne - segmentTwo;

        const newSegmentArray = segmentsArray.slice();
        newSegmentArray[currentPos] = mutatedSegment;
        newSegmentArray[currentPos + 1] = mutatedSegment;
        
        generatedPatterns.push(convertNumericalArrayToPattern(newSegmentArray));
    }
    return generatedPatterns;
}

function exploreDepths(startPattern) {
    const visitedStates = {};
    const pendingQueue = [];

    visitedStates[startPattern] = 0;
    pendingQueue.push(startPattern);

    let queueHeadIndex = 0;

    while (queueHeadIndex < pendingQueue.length) {
        const currentSequence = pendingQueue[queueHeadIndex++];
        const currentLevel = visitedStates[currentSequence];

        const nextPossibleSequences = produceSuccessorPatterns(currentSequence);

        if (nextPossibleSequences.length === 0) {
            return currentLevel;
        }

        for (const nextSequence of nextPossibleSequences) {
            if (visitedStates[nextSequence] === undefined) {
                visitedStates[nextSequence] = currentLevel + 1;
                pendingQueue.push(nextSequence);
            }
        }
    }

    return null;
}

queries.forEach(sequencePattern => {
    if (sequencePattern === '0') {
        return;
    }
    
    const finalLevel = exploreDepths(sequencePattern);
    console.log(finalLevel !== null ? finalLevel : 'NA');
});