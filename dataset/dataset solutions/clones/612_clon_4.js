globalInputSource.flow();
globalInputSource.characterEncoding('utf8');

globalInputSource.on('data', function(rawDataBlock) {
    const inputSegments = rawDataBlock.split('\n');
    const numberOfTargets = parseInt(inputSegments[0], 10);
    const primaryTargetSequence = inputSegments[1];

    const determineSubsequenceMatch = (referenceText, candidateText) => {
        const patternParts = referenceText.split('');
        const constructedRegexString = patternParts.join('.*');
        const matcher = new RegExp(constructedRegexString);
        return matcher.test(candidateText);
    };

    const matchingOccurrences = inputSegments.slice(2, 2 + numberOfTargets).reduce((accumulator, currentCandidate) => {
        if (determineSubsequenceMatch(primaryTargetSequence, currentCandidate)) {
            return accumulator + 1;
        }
        return accumulator;
    }, 0);

    console.log(matchingOccurrences);
});