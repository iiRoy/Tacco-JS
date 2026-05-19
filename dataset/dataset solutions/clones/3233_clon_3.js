function createPlateEntry(plateLine) {
    const parts = plateLine.split(" ");
    const valA = parseInt(parts[0]);
    const valB = parseInt(parts[1]);
    const sumAB = valA + valB;
    return [valA, valB, sumAB];
}

function comparePlatesBySum(plateOne, plateTwo) {
    const sumOne = plateOne[2];
    const sumTwo = plateTwo[2];
    if (sumOne < sumTwo) {
        return -1;
    }
    if (sumOne > sumTwo) {
        return 1;
    }
    return 0;
}

function getPlayerChoiceIndex(turnNumber) {
    return turnNumber % 2; // 0 for Player A (even turns), 1 for Player B (odd turns)
}

function processPlateData(rawData) {
    const lineSegments = rawData.split("\n");
    const plateCount = parseInt(lineSegments[0]);

    const sortedPlates = lineSegments.slice(1)
        .map(createPlateEntry)
        .sort(comparePlatesBySum);

    let playerAScore = 0;
    let playerBScore = 0;

    for (let turnIndex = 0; turnIndex < plateCount; turnIndex++) {
        let currentBlockSize = 0;
        let bestRelativeOffset = 0;
        const currentPlayerIndex = getPlayerChoiceIndex(turnIndex);
        const currentPlateSumValue = sortedPlates[turnIndex][2];

        while (turnIndex + currentBlockSize < plateCount && sortedPlates[turnIndex + currentBlockSize][2] === currentPlateSumValue) {
            const candidatePlate = sortedPlates[turnIndex + currentBlockSize];
            const bestPlateInBlockSoFar = sortedPlates[turnIndex + bestRelativeOffset];

            if (candidatePlate[currentPlayerIndex] > bestPlateInBlockSoFar[currentPlayerIndex]) {
                bestRelativeOffset = currentBlockSize;
            }
            currentBlockSize++;
        }

        if (bestRelativeOffset !== 0) {
            const tempPlateHolder = sortedPlates[turnIndex].slice(0);
            sortedPlates[turnIndex] = sortedPlates[turnIndex + bestRelativeOffset].slice(0);
            sortedPlates[turnIndex + bestRelativeOffset] = tempPlateHolder;
        }

        const valueTaken = sortedPlates[turnIndex][currentPlayerIndex];

        if (currentPlayerIndex === 0) {
            console.log('a take %d', valueTaken);
            playerAScore += valueTaken;
        } else {
            console.log('b take %d', valueTaken);
            playerBScore += valueTaken;
        }
    }

    console.log('%d', playerAScore - playerBScore);
}

processPlateData(require("fs").readFileSync("/dev/stdin", "utf8"));
