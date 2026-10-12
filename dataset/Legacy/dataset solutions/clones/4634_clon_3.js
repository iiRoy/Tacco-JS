const parseNumericValue = (str) => parseInt(str, 10);

function processAntSimulation(rawData) {
    const inputLines = rawData.split("\n");

    const firstLineParts = inputLines[0].split(" ");
    const numAnts = parseNumericValue(firstLineParts[0]);
    const trackLength = parseNumericValue(firstLineParts[1]);
    const timeElapsed = parseNumericValue(firstLineParts[2]);

    const initialPositions = new Array(100001);
    const initialDirections = new Array(100001);
    const finalUncollidedPositions = new Array(100001);
    const collisionCounts = new Array(100001);

    for (let i = 0; i < numAnts; i++) {
        const antData = inputLines[i + 1].split(" ");
        initialPositions[i] = parseNumericValue(antData[0]);
        initialDirections[i] = parseNumericValue(antData[1]);
        collisionCounts[i] = 0;
    }

    for (let i = 0; i < numAnts; i++) {
        const directionMultiplier = (initialDirections[i] === 1) ? 1 : -1;
        let calculatedPosition = (initialPositions[i] + timeElapsed * directionMultiplier) % trackLength;

        if (calculatedPosition < 0) {
            calculatedPosition += trackLength;
        }
        finalUncollidedPositions[i] = calculatedPosition;
    }

    for (let i = 1; i < numAnts; i++) {
        if (initialDirections[0] === initialDirections[i]) {
            collisionCounts[i] = 0;
        } else {
            let effectiveRelativeDistance = timeElapsed * 2;
            let antZeroInitialPos, currentAntInitialPos;

            if (initialDirections[0] === 1) {
                antZeroInitialPos = initialPositions[0];
                currentAntInitialPos = initialPositions[i];
            } else {
                antZeroInitialPos = initialPositions[i];
                currentAntInitialPos = initialPositions[0];
            }

            if (currentAntInitialPos >= antZeroInitialPos) {
                effectiveRelativeDistance -= (currentAntInitialPos - antZeroInitialPos);
            } else {
                effectiveRelativeDistance -= (trackLength - antZeroInitialPos + currentAntInitialPos);
            }

            effectiveRelativeDistance = Math.max(0, effectiveRelativeDistance);

            if (effectiveRelativeDistance > 0) {
                collisionCounts[i]++;
            }
            collisionCounts[i] += Math.floor(effectiveRelativeDistance / trackLength);
        }
    }

    let totalCollisionShift = 0;
    for (let i = 1; i < numAnts; i++) {
        totalCollisionShift += collisionCounts[i];
    }
    totalCollisionShift %= numAnts;

    if (initialDirections[0] === 2) {
        totalCollisionShift = (numAnts - totalCollisionShift) % numAnts;
    }

    const antZeroFinalPosBeforeSort = finalUncollidedPositions[0];

    finalUncollidedPositions[numAnts] = 10000000000;
    finalUncollidedPositions.sort((valA, valB) => valA - valB);
    
    finalUncollidedPositions[numAnts] = -1000;

    let initialOutputIndex = 0;
    for (let i = 0; i < numAnts; i++) {
        const isCurrentMatch = (finalUncollidedPositions[i] === antZeroFinalPosBeforeSort);
        const isNextDifferent = (finalUncollidedPositions[(i + 1) % numAnts] !== antZeroFinalPosBeforeSort);
        const isNextSame = (finalUncollidedPositions[(i + 1) % numAnts] === antZeroFinalPosBeforeSort);

        if (isCurrentMatch && isNextDifferent) {
            initialOutputIndex = i;
            break;
        } else if (isCurrentMatch && isNextSame) {
            if (initialDirections[0] === 1) {
                initialOutputIndex = i + 1;
            } else {
                initialOutputIndex = i;
            }
            break;
        }
    }

    initialOutputIndex = (numAnts + initialOutputIndex - totalCollisionShift) % numAnts;

    let currentOutputPosition = initialOutputIndex;
    for (let i = 0; i < numAnts; i++) {
        console.log(finalUncollidedPositions[currentOutputPosition]);
        currentOutputPosition++;
        if (currentOutputPosition === numAnts) {
            currentOutputPosition = 0;
        }
    }
}

processAntSimulation(require('fs').readFileSync('/dev/stdin', 'utf8'));
