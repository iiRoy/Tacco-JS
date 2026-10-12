function Main(rawData) {
    const lineSegments = rawData.split("\n");
    const totalItems = parseInt(lineSegments[0], 10);

    const itemRecords = lineSegments.slice(1).map((segment, idx) => {
        const parts = segment.split(" ");
        const valA = parseInt(parts[0], 10);
        const valB = parseInt(parts[1], 10);
        return {
            originalOrder: idx,
            valA: valA,
            valB: valB,
            combinedSum: valA + valB
        };
    }).sort((recX, recY) => {
        if (recX.combinedSum < recY.combinedSum) return -1;
        if (recX.combinedSum > recY.combinedSum) return 1;
        return 0;
    });

    function* generateOptimalSelections(sortedRecords) {
        let currentPosition = 0;
        const recordCount = sortedRecords.length;

        while (currentPosition < recordCount) {
            const currentBlockSum = sortedRecords[currentPosition].combinedSum;
            let blockEndPosition = currentPosition;
            while (blockEndPosition < recordCount && sortedRecords[blockEndPosition].combinedSum === currentBlockSum) {
                blockEndPosition++;
            }

            const currentProcessingBlock = sortedRecords.slice(currentPosition, blockEndPosition);
            const availableBlockIndices = new Set(Array.from({ length: currentProcessingBlock.length }, (_, k) => k));
            const blockSelections = new Array(currentProcessingBlock.length);

            for (let k = 0; k < currentProcessingBlock.length; k++) {
                const globalTurnIndex = currentPosition + k;
                const playerChoiceIndex = globalTurnIndex % 2;

                let bestCandidateRelativeIndex = -1;
                let maximumValue = -Infinity;

                for (const relativeIdx of availableBlockIndices) {
                    const candidateItem = currentProcessingBlock[relativeIdx];
                    const currentValue = (playerChoiceIndex === 0) ? candidateItem.valA : candidateItem.valB;
                    if (currentValue > maximumValue) {
                        maximumValue = currentValue;
                        bestCandidateRelativeIndex = relativeIdx;
                    }
                }

                if (bestCandidateRelativeIndex !== -1) {
                    blockSelections[k] = currentProcessingBlock[bestCandidateRelativeIndex];
                    availableBlockIndices.delete(bestCandidateRelativeIndex);
                }
            }

            for (const selectedItem of blockSelections) {
                yield selectedItem;
            }

            currentPosition = blockEndPosition;
        }
    }

    let playerOneScore = 0;
    let playerTwoScore = 0;
    let turnCounter = 0;

    for (const selectedItem of generateOptimalSelections(itemRecords)) {
        if (turnCounter % 2 === 0) {
            playerOneScore += selectedItem.valA;
        } else {
            playerTwoScore += selectedItem.valB;
        }
        turnCounter++;
    }

    console.log('%d', playerOneScore - playerTwoScore);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
