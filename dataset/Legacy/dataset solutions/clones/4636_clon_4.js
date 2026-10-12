const MAX_SAFE_INT_DIV_10 = 900719925474099;
const PRIME_MODULUS = 1000000007;

const parseNumbers = (textLine) => textLine.split(' ').map(Number);

function findInsertionPoint(sortedArr, targetValue) {
    let searchStart = 0;
    let searchEnd = sortedArr.length;
    while (searchStart < searchEnd) {
        const midPoint = Math.floor((searchStart + searchEnd) / 2);
        if (sortedArr[midPoint] < targetValue) {
            searchStart = midPoint + 1;
        } else {
            searchEnd = midPoint;
        }
    }
    return searchStart;
}

function ProcessAnts(inputData) {
    const inputLines = inputData.trim().split('\n');

    const [totalAnts, trackLength, totalTime] = parseNumbers(inputLines[0]);
    const effectiveTime = totalTime % trackLength;

    const antConfigurations = [];
    for (let i = 1; i <= totalAnts; i++) {
        antConfigurations.push(parseNumbers(inputLines[i]));
    }

    const firstAntConfig = antConfigurations[0];
    const firstAntInitialPosition = firstAntConfig[0];
    const firstAntMovementDirection = firstAntConfig[1];

    const totalCollisionShift = antConfigurations.slice(1).reduce((currentShiftAccumulator, currentAntConfig) => {
        const [currentAntInitialPosition, currentAntMovementDirection] = currentAntConfig;

        let collisionCount = 0;
        if (firstAntMovementDirection !== currentAntMovementDirection) {
            let distanceToFirstEncounter;
            if (firstAntMovementDirection === 1) { // First ant moves right, current ant moves left
                distanceToFirstEncounter = (currentAntInitialPosition - firstAntInitialPosition + trackLength) % trackLength;
            } else { // First ant moves left, current ant moves right
                distanceToFirstEncounter = (firstAntInitialPosition - currentAntInitialPosition + trackLength) % trackLength;
            }
            const timeToFirstEncounter = distanceToFirstEncounter / 2;

            if (effectiveTime >= timeToFirstEncounter) {
                const remainingTimeAfterFirst = effectiveTime - timeToFirstEncounter;
                collisionCount = Math.floor(remainingTimeAfterFirst / (trackLength / 2)) + 1;
            }
        }

        if (firstAntMovementDirection === 1) { // First ant moves right
            if (currentAntMovementDirection === 2) { // Current ant moves left
                return currentShiftAccumulator + collisionCount;
            }
        } else { // First ant moves left
            if (currentAntMovementDirection === 1) { // Current ant moves right
                return currentShiftAccumulator - collisionCount;
            }
        }
        return currentShiftAccumulator;
    }, 0);

    const finalFirstAntIndexShift = (totalCollisionShift % totalAnts + totalAnts) % totalAnts;

    const ghostAntFinalPositions = antConfigurations.map(ant => {
        const [initialPos, direction] = ant;
        return initialPos + (direction === 1 ? effectiveTime : -effectiveTime);
    });

    const actualAntFinalPositions = ghostAntFinalPositions.map(gPos => {
        return (gPos % trackLength + trackLength) % trackLength;
    });

    const firstAntActualFinalPosition = actualAntFinalPositions[0];

    const sortedActualAntPositions = [...actualAntFinalPositions].sort((a, b) => a - b);

    const firstAntPositionInSorted = findInsertionPoint(sortedActualAntPositions, firstAntActualFinalPosition);

    const finalOutputArrangement = new Array(totalAnts);
    for (let i = 0; i < totalAnts; i++) {
        finalOutputArrangement[(finalFirstAntIndexShift + i) % totalAnts] = sortedActualAntPositions[(firstAntPositionInSorted + i) % totalAnts];
    }

    console.log(finalOutputArrangement.join('\n'));
}

ProcessAnts(require("fs").readFileSync("/dev/stdin", "utf8"));
