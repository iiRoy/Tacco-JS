const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = sourceData.trim().split("\n");

function* gameStatesProducer(startingItemCount, totalParticipants) {
    let itemsInHand = startingItemCount;
    let participantStashes = Array(totalParticipants).fill(0);
    let turnHolderIndex = 0;

    const maximumGameTurns = 1000000;
    let turnCounter = 0;

    while (turnCounter < maximumGameTurns) {
        turnCounter++;

        const lastActorIndex = turnHolderIndex;

        if (itemsInHand > 0) {
            itemsInHand--;
            participantStashes[turnHolderIndex]++;
        } else {
            itemsInHand = participantStashes[turnHolderIndex];
            participantStashes[turnHolderIndex] = 0;
        }

        yield {
            currentHandItems: itemsInHand,
            currentStashes: [...participantStashes],
            lastActorIndex: lastActorIndex
        };

        turnHolderIndex = (turnHolderIndex + 1) % totalParticipants;
    }
}

while (true) {
    const playerAndItemInfo = lineSegments.shift();
    if (playerAndItemInfo === "0 0") {
        break;
    }

    const [playerCount, initialItemSupply] = playerAndItemInfo.split(" ").map(Number);

    const gameIterator = gameStatesProducer(initialItemSupply, playerCount);
    let winnerIdentified = false;

    for (const gameSituation of gameIterator) {
        if (gameSituation.currentHandItems === 0) {
            const collectiveOpponentItems = gameSituation.currentStashes.reduce((accumulator, value, index) =>
                index === gameSituation.lastActorIndex ? accumulator : accumulator + value, 0);

            if (collectiveOpponentItems === 0) {
                console.log(gameSituation.lastActorIndex);
                winnerIdentified = true;
                break;
            }
        }
    }
}
