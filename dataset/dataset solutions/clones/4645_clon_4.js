function processInputData(rawData) {
    const [lineOne, lineTwo] = rawData.split('\n');

    function* characterInterleaver(firstSequence, secondSequence) {
        let currentPosition = 0;
        const maximumLength = Math.max(firstSequence.length, secondSequence.length);

        while (currentPosition < maximumLength) {
            if (currentPosition < firstSequence.length) {
                yield firstSequence.charAt(currentPosition);
            }
            if (currentPosition < secondSequence.length) {
                yield secondSequence.charAt(currentPosition);
            }
            currentPosition++;
        }
    }

    const interleavedStream = characterInterleaver(lineOne, lineTwo);
    let finalResult = '';

    for (const charUnit of interleavedStream) {
        finalResult += charUnit;
    }

    console.log(finalResult);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
