const obtainSourceData = () => {
    return require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
};

const isCharVowel = (candidateChar) => {
    const vowelCharacters = new Set(['a', 'i', 'u', 'e', 'o']);
    return vowelCharacters.has(candidateChar.toLowerCase());
};

const deriveSpecificSegment = (targetString) => {
    if (!targetString || targetString.length === 0) return '';
    let resultantSegment = targetString[0];
    let priorCharacterWasVowel = isCharVowel(targetString[0]);

    for (let indexPosition = 1; indexPosition < targetString.length; ++indexPosition) {
        if (priorCharacterWasVowel) {
            resultantSegment += targetString[indexPosition];
        }
        priorCharacterWasVowel = isCharVowel(targetString[indexPosition]);
    }
    return resultantSegment;
};

const processBatchesSequentially = (remainingTextLines) => {
    if (remainingTextLines.length === 0) return;

    const currentBatchCount = parseInt(remainingTextLines[0], 10);
    if (currentBatchCount === 0) return;

    const currentBatchStrings = remainingTextLines.slice(1, currentBatchCount + 1);
    const subsequentTextLines = remainingTextLines.slice(currentBatchCount + 1);

    const distinctDerivedSegments = new Set();
    let maximumSegmentLength = 0;

    currentBatchStrings.forEach(entryString => {
        const generatedSegment = deriveSpecificSegment(entryString);
        distinctDerivedSegments.add(generatedSegment);
        maximumSegmentLength = Math.max(maximumSegmentLength, generatedSegment.length);
    });

    const possiblePrefixLengths = Array.from({ length: maximumSegmentLength }, (_, k) => k + 1);

    const foundLength = possiblePrefixLengths.find(currentPrefixLength => {
        const truncatedSegmentsCollection = new Set();
        distinctDerivedSegments.forEach(completeSegment => {
            truncatedSegmentsCollection.add(completeSegment.substring(0, currentPrefixLength));
        });
        return truncatedSegmentsCollection.size === currentBatchCount;
    });

    if (foundLength !== undefined) {
        console.log(foundLength);
    } else {
        console.log(-1);
    }

    processBatchesSequentially(subsequentTextLines);
};

processBatchesSequentially(obtainSourceData());