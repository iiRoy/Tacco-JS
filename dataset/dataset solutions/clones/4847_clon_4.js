function GameEngine(rawInput) {
    const lines = rawInput.split('\n');
    let finalVictor;

    const gamePieces = lines[0].split('');
    let activePlayer = 'First';

    function isMovePossible(piecesArr, segmentInfo) {
        return !(piecesArr[segmentInfo[0]] === piecesArr[segmentInfo[2]]);
    }

    function removePiece(piecesArr, segmentInfo) {
        piecesArr.splice(segmentInfo[1], 1);
        console.log(piecesArr);
    }

    function executeMoveAttempt(currentPieces) {
        const potentialStarts = Array.from({ length: Math.max(0, currentPieces.length - 2) }, (_, k) => k);

        const moveExecuted = potentialStarts.some(startIdx => {
            const segmentIndices = [startIdx, startIdx + 1, startIdx + 2];
            console.log(segmentIndices);

            if (isMovePossible(currentPieces, segmentIndices)) {
                removePiece(currentPieces, segmentIndices);
                return true;
            }
            return false;
        });

        return moveExecuted;
    }

    function commenceGame(currentPieces, currentActivePlayer) {
        if (!executeMoveAttempt(currentPieces)) {
            return currentActivePlayer;
        }

        const nextPlayer = (currentActivePlayer === 'First') ? 'Second' : 'First';
        return commenceGame(currentPieces, nextPlayer);
    }

    const playerWhoCouldntMove = commenceGame(gamePieces, activePlayer);

    finalVictor = (playerWhoCouldntMove === 'First') ? 'Second' : 'First';

    console.log(finalVictor);
}

GameEngine(require("fs").readFileSync("/dev/stdin", "utf8"));
