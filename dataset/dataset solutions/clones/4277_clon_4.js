const processInputData = (rawInputContent) => {
    const inputSegments = rawInputContent.split('\n');
    const mainTextSegment = inputSegments[0];
    const searchPatternSegment = inputSegments[1];

    const mainTextCharacters = Array.from(mainTextSegment);
    const patternCharacters = Array.from(searchPatternSegment);

    const mainTextCharCount = mainTextCharacters.length;
    const patternCharCount = patternCharacters.length;

    let detectedMatchStart = -1;

    if (patternCharCount <= mainTextCharCount) {
        const potentialStartIndices = Array.from(
            { length: mainTextCharCount - patternCharCount + 1 },
            (_, indexOffset) => mainTextCharCount - patternCharCount - indexOffset
        );

        detectedMatchStart = potentialStartIndices.find(currentCandidateIndex => {
            return patternCharacters.every((patternChar, charRelativeOffset) => {
                const textCharAtPosition = mainTextCharacters[currentCandidateIndex + charRelativeOffset];
                return patternChar === textCharAtPosition || textCharAtPosition === '?';
            });
        }) ?? -1;
    }

    if (detectedMatchStart === -1) {
        console.log("UNRESTORABLE");
    } else {
        const modifiedTextCharacters = [...mainTextCharacters];

        patternCharacters.forEach((patternChar, charRelativeOffset) => {
            modifiedTextCharacters[detectedMatchStart + charRelativeOffset] = patternChar;
        });

        const finalResultString = modifiedTextCharacters
            .map(char => (char === '?' ? 'a' : char))
            .join('');

        console.log(finalResultString);
    }
};

const fileSystemUtility = require('fs');
processInputData(fileSystemUtility.readFileSync("/dev/stdin", "UTF-8"));
