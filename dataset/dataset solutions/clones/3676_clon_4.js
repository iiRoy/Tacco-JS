let entireInput = '';

process.stdin.on('data', receivedChunk => {
    entireInput += receivedChunk.toString();
});

process.stdin.on('end', () => {
    const inputParts = entireInput.trim().split('\n');
    const segmentLength = parseInt(inputParts[0], 10);
    const fullSourceString = inputParts[1];

    const partOneCharacters = fullSourceString.substring(0, segmentLength).split('');
    const partTwoCharacters = fullSourceString.substring(segmentLength, 2 * segmentLength).split('');

    const stringCounts = new Map();
    let totalScore = 0;

    const generateAndStore = (currentPosition, currentAccumulation, sourceCharsArray, lengthBound, targetMap) => {
        if (currentPosition === lengthBound) {
            targetMap.set(currentAccumulation, (targetMap.get(currentAccumulation) || 0) + 1);
            return;
        }

        const nextCharacter = sourceCharsArray[currentPosition];
        generateAndStore(currentPosition + 1, nextCharacter + currentAccumulation, sourceCharsArray, lengthBound, targetMap);
        generateAndStore(currentPosition + 1, currentAccumulation + nextCharacter, sourceCharsArray, lengthBound, targetMap);
    };

    generateAndStore(0, '', partOneCharacters, segmentLength, stringCounts);

    const generateAndMatch = (currentPosition, currentAccumulation, sourceCharsArray, lengthBound, referenceMap) => {
        if (currentPosition === lengthBound) {
            totalScore += (referenceMap.get(currentAccumulation) || 0);
            return;
        }

        const nextCharacter = sourceCharsArray[currentPosition];
        generateAndMatch(currentPosition + 1, nextCharacter + currentAccumulation, sourceCharsArray, lengthBound, referenceMap);
        generateAndMatch(currentPosition + 1, currentAccumulation + nextCharacter, sourceCharsArray, lengthBound, referenceMap);
    };

    generateAndMatch(0, '', partTwoCharacters, segmentLength, stringCounts);

    process.stdout.write(totalScore.toString() + '\n');
});