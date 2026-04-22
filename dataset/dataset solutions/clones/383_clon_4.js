let receivedData = '';

process.stdin.on('data', (chunkOfData) => {
    receivedData += chunkOfData;
});

process.stdin.on('end', () => {
    const allInputLines = receivedData.trim().split('\n');
    const totalProblemSets = Number(allInputLines.shift());

    allInputLines.slice(0, totalProblemSets).forEach((lineEntry) => {
        const [commencementValue, targetValue] = lineEntry.split(' ').map(Number);
        let pathSequence;

        if (commencementValue < targetValue) {
            pathSequence = Array.from({ length: targetValue - commencementValue + 1 }, (_, idx) => commencementValue + idx);
        } else if (commencementValue > targetValue && commencementValue <= 5) {
            pathSequence = Array.from({ length: commencementValue - targetValue + 1 }, (_, idx) => commencementValue - idx);
        } else { // commencementValue > targetValue && commencementValue >= 6
            const sequenceBuilder = function* (initialPosition, desiredPosition) {
                let currentPosition = initialPosition;
                let movementDirection = 1; // 1 for increasing, -1 for decreasing
                yield currentPosition; // Include the starting point

                while (currentPosition !== desiredPosition) {
                    currentPosition += movementDirection;
                    if (currentPosition === 10) {
                        currentPosition = 5;
                        movementDirection = -1;
                    } else if (currentPosition === 0) {
                        movementDirection = 1;
                    }
                    yield currentPosition;
                }
            };
            pathSequence = Array.from(sequenceBuilder(commencementValue, targetValue));
        }
        process.stdout.write(pathSequence.join(' ') + '\n');
    });
});