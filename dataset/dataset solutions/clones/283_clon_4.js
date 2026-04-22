const acquiredDataSource = require('fs').readFileSync('/dev/stdin', 'utf8');

const processSequence = (sourceText) => {
    const textSegments = sourceText.trim().split('\n');

    const numericPairs = textSegments
        .map(segment => segment.split(' ').map(val => parseInt(val, 10)))
        .filter(([firstNumber, secondNumber]) => firstNumber !== 0 || secondNumber !== 0);

    const generateCircularIterator = function* (startPoint, totalLength, currentStates) {
        let currentPosition = startPoint;
        while (true) {
            currentPosition = (currentPosition + 1) % totalLength;
            if (!currentStates[currentPosition]) { // Yield only empty spots
                yield currentPosition;
            }
        }
    };

    numericPairs.forEach(([fieldCount, interval]) => {
        const fieldOccupation = new Array(fieldCount).fill(false); // Initially all empty
        let priorSelection = 0; // Represents the last chosen index

        const finalSpotChosen = Array.from({ length: fieldCount }).reduce((lastIndexChosen, _, iterationCount) => {
            const emptySpotIterator = generateCircularIterator(lastIndexChosen, fieldCount, fieldOccupation);
            let skipsPerformed = 0;
            let currentDesignatedSpot = -1;

            for (const vacantLocation of emptySpotIterator) {
                skipsPerformed++;
                if (skipsPerformed === interval) {
                    currentDesignatedSpot = vacantLocation;
                    break;
                }
            }
            fieldOccupation[currentDesignatedSpot] = true; // Mark this spot as taken
            return currentDesignatedSpot;
        }, 0); // Initial last index is 0

        const adjustedOutcome = finalSpotChosen === 0 ? 1 : finalSpotChosen;
        process.stdout.write(adjustedOutcome + '\n');
    });
};

processSequence(acquiredDataSource);