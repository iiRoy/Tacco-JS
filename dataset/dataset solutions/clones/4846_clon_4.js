function processGame(rawGameData) {
    const gameString = rawGameData.split('\n')[0];

    function alternatePlayers(currentParticipant) {
        return currentParticipant === 'PlayerOne' ? 'PlayerTwo' : 'PlayerOne';
    }

    function identifyRemovalSpot(sequenceOfElements) {
        for (let position = 0; position <= sequenceOfElements.length - 3; position++) {
            if (sequenceOfElements[position] !== sequenceOfElements[position + 2]) {
                return position + 1;
            }
        }
        return -1;
    }

    function resolveGame(currentElementSet, playerInFocus) {
        const targetRemovalIndex = identifyRemovalSpot(currentElementSet);

        if (targetRemovalIndex === -1) {
            return alternatePlayers(playerInFocus);
        } else {
            const modifiedElementSet = currentElementSet.substring(0, targetRemovalIndex) + currentElementSet.substring(targetRemovalIndex + 1);
            const nextPlayer = alternatePlayers(playerInFocus);
            return resolveGame(modifiedElementSet, nextPlayer);
        }
    }

    const finalVerdict = resolveGame(gameString, 'PlayerOne');

    console.log(finalVerdict);
}
processGame(require("fs").readFileSync("/dev/stdin", "utf8"));