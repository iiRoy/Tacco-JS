const process = require('process');

let inputBuffer = '';

process.stdin.on('data', (dataChunk) => {
    inputBuffer += dataChunk.toString();
});

process.stdin.on('end', () => {
    const initialText = inputBuffer.trim();

    const determinePlayOutcome = (currentSegment) => {
        let potentialRemovalIndex = -1;
        for (let positionIterator = 1; positionIterator < currentSegment.length - 1; positionIterator++) {
            if (currentSegment.charAt(positionIterator - 1) !== currentSegment.charAt(positionIterator + 1)) {
                potentialRemovalIndex = positionIterator;
                break;
            }
        }

        if (potentialRemovalIndex === -1) {
            return 0;
        } else {
            const nextSegment = currentSegment.substring(0, potentialRemovalIndex) + currentSegment.substring(potentialRemovalIndex + 1);
            return 1 + determinePlayOutcome(nextSegment);
        }
    };

    const totalActions = determinePlayOutcome(initialText);

    if (totalActions % 2 === 0) {
        process.stdout.write("Second\n");
    } else {
        process.stdout.write("First\n");
    }
});