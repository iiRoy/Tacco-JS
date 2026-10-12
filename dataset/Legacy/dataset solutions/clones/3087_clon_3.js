function processSimulation(inputData) {
    const inputLines = inputData.split("\n");
    inputLines.shift(); // Discard the first line, as it's unused in the original logic

    const characterSequence = inputLines.shift().split("");
    const sequenceLength = characterSequence.length;
    const movementInstructions = inputLines.map(entry => entry.split(" "));

    let currentPositionCounts = Array.from({ length: sequenceLength }, () => 1);

    // Helper function to encapsulate the movement logic for a single position
    const applyMovementEffect = (
        charAtCurrentPos,
        countAtCurrentPos,
        targetCharForInstruction,
        moveDirectionForInstruction,
        currentPositionIndex,
        totalSequenceLength,
        currentCountsReference, // Reference to the mutable currentPositionCounts array
        nextCountsReference     // Reference to the mutable nextPositionCounts array
    ) => {
        if (charAtCurrentPos !== targetCharForInstruction) {
            nextCountsReference[currentPositionIndex] += countAtCurrentPos;
        } else { // characterAtCurrentPos === targetCharForInstruction
            if (moveDirectionForInstruction === 'L') {
                if (currentPositionIndex - 1 >= 0) {
                    nextCountsReference[currentPositionIndex - 1] += countAtCurrentPos;
                }
            } else if (moveDirectionForInstruction === 'R') {
                // This specific 'R' movement modifies the currentCountsReference array directly
                // for the next position, which affects subsequent iterations within the same inner loop.
                if (currentPositionIndex + 1 < totalSequenceLength) {
                    currentCountsReference[currentPositionIndex + 1] += countAtCurrentPos;
                }
            }
        }
    };

    for (const instructionEntry of movementInstructions) {
        const targetCharacterForStep = instructionEntry[0];
        const moveDirectionForStep = instructionEntry[1];
        let nextPositionCounts = Array.from({ length: sequenceLength }, () => 0);

        for (let positionIndex = 0; positionIndex < sequenceLength; positionIndex++) {
            const countAtCurrentIndex = currentPositionCounts[positionIndex];
            const charAtCurrentIndex = characterSequence[positionIndex];

            applyMovementEffect(
                charAtCurrentIndex,
                countAtCurrentIndex,
                targetCharacterForStep,
                moveDirectionForStep,
                positionIndex,
                sequenceLength,
                currentPositionCounts, // Pass current array for 'R' modification
                nextPositionCounts
            );
        }
        currentPositionCounts = nextPositionCounts;
    }

    const totalFinalCount = currentPositionCounts.reduce((accumulator, count) => accumulator + count, 0);
    console.log(totalFinalCount);
}

processSimulation(require('fs').readFileSync('/dev/stdin', 'utf8'));
