let completeInputData = '';

process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
    completeInputData += chunk;
});

process.stdin.on('end', () => {
    const allInputStrings = completeInputData.split('\n').map(item => item.trim());
    let currentInputLinePointer = 0;

    function rotateStringElements(initialSequence, rotationInstructions) {
        const sequenceLength = initialSequence.length;
        if (sequenceLength === 0) return initialSequence;

        return rotationInstructions.reduce((currentStringState, individualShiftValue) => {
            const effectiveShift = individualShiftValue % sequenceLength;
            if (effectiveShift === 0) {
                return currentStringState;
            }

            let nextStringState = '';
            for (let characterPosition = 0; characterPosition < sequenceLength; characterPosition++) {
                const sourcePosition = (characterPosition + effectiveShift) % sequenceLength;
                nextStringState += currentStringState.charAt(sourcePosition);
            }
            return nextStringState;
        }, initialSequence);
    }

    while (currentInputLinePointer < allInputStrings.length) {
        const currentLineContent = allInputStrings[currentInputLinePointer];
        if (currentLineContent === "-") {
            break;
        }

        const baseSequence = currentLineContent;
        currentInputLinePointer++;

        if (currentInputLinePointer >= allInputStrings.length) break;

        const numberOfOperations = parseInt(allInputStrings[currentInputLinePointer], 10);
        currentInputLinePointer++;

        const shiftOperationValues = [];
        for (let opIndex = 0; opIndex < numberOfOperations; opIndex++) {
            if (currentInputLinePointer >= allInputStrings.length) break;
            shiftOperationValues.push(parseInt(allInputStrings[currentInputLinePointer], 10));
            currentInputLinePointer++;
        }

        const finalArrangedSequence = rotateStringElements(baseSequence, shiftOperationValues);
        process.stdout.write(finalArrangedSequence + '\n');
    }
});