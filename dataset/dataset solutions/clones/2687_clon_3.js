const distributePopulation = (currentRightCount, currentLeftCount, transitionIndex, finalDistributionArray) => {
    const totalBlockPopulation = currentRightCount + currentLeftCount;

    if (totalBlockPopulation % 2 === 0) {
        const evenPortion = totalBlockPopulation / 2;
        finalDistributionArray[transitionIndex] = evenPortion;
        finalDistributionArray[transitionIndex + 1] = evenPortion;
    } else {
        if (Math.max(currentRightCount, currentLeftCount) % 2 !== 0) {
            finalDistributionArray[transitionIndex] = currentRightCount;
            finalDistributionArray[transitionIndex + 1] = currentLeftCount;
        } else {
            finalDistributionArray[transitionIndex] = currentLeftCount;
            finalDistributionArray[transitionIndex + 1] = currentRightCount;
        }
    }
};

function processCharSequence(rawInputPayload) {
    const cleanedInputLines = rawInputPayload.trim().split("\n");
    const charSequence = cleanedInputLines[0].split("");
    const sequenceLength = charSequence.length;

    if (sequenceLength < 2) {
        console.log(charSequence.length === 1 ? "0" : "");
        return;
    }

    let rightBlockAccumulator = 0;
    let leftBlockAccumulator = 0;
    let transitionPointIndex = 0;
    let boundaryChangeCounter = 0;

    const finalDistributionResult = new Array(sequenceLength).fill(0);

    for (let idx = 0; idx <= sequenceLength - 2; idx++) {
        if (charSequence[idx] === "R") {
            rightBlockAccumulator++;
        } else {
            leftBlockAccumulator++;
        }

        if (charSequence[idx] !== charSequence[idx + 1]) {
            boundaryChangeCounter++;

            if (boundaryChangeCounter === 1) {
                transitionPointIndex = idx;
            }
        }

        if (boundaryChangeCounter === 2) {
            distributePopulation(rightBlockAccumulator, leftBlockAccumulator, transitionPointIndex, finalDistributionResult);

            boundaryChangeCounter = 0;
            rightBlockAccumulator = 0;
            leftBlockAccumulator = 0;
        }
    }

    leftBlockAccumulator++;

    distributePopulation(rightBlockAccumulator, leftBlockAccumulator, transitionPointIndex, finalDistributionResult);

    console.log(finalDistributionResult.join(" "));
}

processCharSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));