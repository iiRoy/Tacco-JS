const processInputData = (rawInputContent) => {
    const contentLines = rawInputContent.trim().split("\n");
    return { sourceSequence: contentLines[0], patternSequence: contentLines[1] };
};

const locateRightmostMatchPosition = (sourceSequence, patternSequence) => {
    const sourceLength = sourceSequence.length;
    const patternLength = patternSequence.length;

    if (patternLength > sourceLength) return null;

    const potentialStartPositions = Array.from(
        { length: sourceLength - patternLength + 1 },
        (_, offset) => sourceLength - patternLength - offset
    );

    const matchingPosition = potentialStartPositions.find(currentPosition => {
        const segmentCharacters = Array.from(sourceSequence.substring(currentPosition, currentPosition + patternLength));
        const patternCharacters = Array.from(patternSequence);

        return segmentCharacters.every((segmentChar, charIndex) => {
            return segmentChar === patternCharacters[charIndex] || segmentChar === '?';
        });
    });

    return matchingPosition !== undefined ? matchingPosition : null;
};

const assembleFinalString = (sourceSequence, patternSequence, matchPosition) => {
    const initialSegment = Array.from(sourceSequence.substring(0, matchPosition))
        .map(char => char === '?' ? 'a' : char)
        .join('');
    
    const trailingSegment = Array.from(sourceSequence.substring(matchPosition + patternSequence.length))
        .map(char => char === '?' ? 'a' : char)
        .join('');
    
    return initialSegment + patternSequence + trailingSegment;
};

const executeTransformation = (inputPayload) => {
    const { sourceSequence, patternSequence } = processInputData(inputPayload);

    const foundPosition = locateRightmostMatchPosition(sourceSequence, patternSequence);

    if (foundPosition !== null) {
        const finalResultString = assembleFinalString(sourceSequence, patternSequence, foundPosition);
        console.log(finalResultString);
    } else {
        console.log("UNRESTORABLE");
    }
};

executeTransformation(require('fs').readFileSync('/dev/stdin', 'utf8'));
