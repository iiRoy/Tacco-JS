function ProcessInput(rawData) {
    const processedLines = rawData.split('\n');
    let finalResult;

    let charSequence = processedLines[0].split('');
    let activePlayer = 'First';

    const PLAYER_ONE_NAME = 'First';
    const PLAYER_TWO_NAME = 'Second';
    const TRIPLET_SIZE = 3;

    function removeCharAtIndex(idxGroup) {
        charSequence.splice(idxGroup[1], 1);
        console.log(charSequence);
    }

    function isValidRemoval(idxGroup) {
        return charSequence[idxGroup[0]] !== charSequence[idxGroup[2]];
    }

    function executePlayerMove() {
        const minLengthForTriplet = TRIPLET_SIZE;

        if (charSequence.length < minLengthForTriplet) {
            return false;
        }

        const firstTripletIndices = [0, 1, 2];

        if (isValidRemoval(firstTripletIndices)) {
            removeCharAtIndex(firstTripletIndices);
            return true;
        }

        return false;
    }

    function getNextPlayer(current) {
        return current === PLAYER_ONE_NAME ? PLAYER_TWO_NAME : PLAYER_ONE_NAME;
    }

    function gameLoop() {
        let moveWasSuccessful;

        do {
            moveWasSuccessful = executePlayerMove();

            if (moveWasSuccessful) {
                activePlayer = getNextPlayer(activePlayer);
            }
        } while (moveWasSuccessful);
    }

    gameLoop();

    finalResult = (activePlayer === PLAYER_ONE_NAME) ? PLAYER_TWO_NAME : PLAYER_ONE_NAME;

    console.log(finalResult);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
