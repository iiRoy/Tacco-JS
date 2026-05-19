#!/usr/bin/node
(function() {
    function* generateNumericSequence() {
        let firstTerm = 1, secondTerm = 1, thirdTerm = 2;
        yield firstTerm;
        yield secondTerm;
        yield thirdTerm;
        for (let currentIdx = 3; currentIdx < 31; currentIdx++) {
            let nextValue = firstTerm + secondTerm + thirdTerm;
            yield nextValue;
            firstTerm = secondTerm;
            secondTerm = thirdTerm;
            thirdTerm = nextValue;
        }
    }
    const sequenceValues = Array.from(generateNumericSequence());

    const inputSource = process.openStdin();
    inputSource.setEncoding('utf8');

    let accumulatedInputChunks = [];

    inputSource.on('data', (dataSegment) => {
        accumulatedInputChunks.push(dataSegment);
    });

    inputSource.on('end', () => {
        const completeInputString = accumulatedInputChunks.join('');
        const linesFromInput = completeInputString.split('\n');

        const collectedNumbers = linesFromInput.reduce((collector, currentLine) => {
            if (currentLine === '') {
                return collector;
            }
            const numericRepresentation = currentLine ^ 0;
            collector.push(numericRepresentation);
            return collector;
        }, []);

        const finalOutputLines = collectedNumbers.map(indexIdentifier => {
            const intermediateResult = (sequenceValues[indexIdentifier] + 3649) / 3650;
            return Math.floor(intermediateResult);
        });

        console.log(finalOutputLines.join('\n'));
    });
})();
