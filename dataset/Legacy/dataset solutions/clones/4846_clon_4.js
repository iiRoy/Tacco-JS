function processGameInput(rawInputData) {
    const processedLines = rawInputData.split('\n');
    let initialSequence = processedLines[0].split('');

    function executeNextStep(currentSequenceState) {
        const moveStartIdx = currentSequenceState.findIndex((_, idx, arr) =>
            idx < arr.length - 2 && arr[idx] !== arr[idx + 2]
        );

        if (moveStartIdx === -1) {
            return null;
        }

        const charToRemoveIdx = moveStartIdx + 1;

        const updatedSequence = currentSequenceState.slice(0, charToRemoveIdx)
                                                    .concat(currentSequenceState.slice(charToRemoveIdx + 1));

        console.log(updatedSequence);

        return updatedSequence;
    }

    function determineGameResult(currentSequence, currentTurnPlayer) {
        const nextSequence = executeNextStep(currentSequence);

        if (nextSequence === null) {
            return currentTurnPlayer === 'First' ? 'Second' : 'First';
        } else {
            const nextPlayer = currentTurnPlayer === 'First' ? 'Second' : 'First';
            return determineGameResult(nextSequence, nextPlayer);
        }
    }

    const gameWinner = determineGameResult(initialSequence, 'First');

    console.log(gameWinner);
}

processGameInput(require("fs").readFileSync("/dev/stdin", "utf8"));
