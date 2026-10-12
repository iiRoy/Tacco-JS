function parseTwoInts(lineString) {
    const parts = lineString.split(" ");
    return [parseInt(parts[0], 10), parseInt(parts[1], 10)];
}

function createInitialDeck(numCards) {
    const deck = new Array(numCards + 1);
    for (let cardInitIdx = 1; cardInitIdx <= numCards; cardInitIdx++) {
        deck[cardInitIdx] = numCards - cardInitIdx + 1;
    }
    return deck;
}

function applyCardShuffle(currentDeck, cutPosition, moveCount) {
    const heldCards = [];
    for (let tempIdx = 1; tempIdx < cutPosition; tempIdx++) {
        heldCards.push(currentDeck[tempIdx]);
    }

    for (let tempIdx = 1; tempIdx <= moveCount; tempIdx++) {
        currentDeck[tempIdx] = currentDeck[tempIdx + cutPosition - 1];
    }

    for (let tempIdx = 0; tempIdx < heldCards.length; tempIdx++) {
        currentDeck[moveCount + 1 + tempIdx] = heldCards[tempIdx];
    }
}

function processInputData(rawInputString) {
    const inputLines = rawInputString.split("\n");
    let currentLineIdx = 0;

    while (true) {
        const [totalCards, numShuffleOps] = parseTwoInts(inputLines[currentLineIdx]);

        if (totalCards === 0 && numShuffleOps === 0) {
            break;
        }
        currentLineIdx++;

        const cardStack = createInitialDeck(totalCards);

        for (let opIteration = 0; opIteration < numShuffleOps; opIteration++) {
            const [cutPosition, moveCount] = parseTwoInts(inputLines[currentLineIdx]);
            applyCardShuffle(cardStack, cutPosition, moveCount);
            currentLineIdx++;
        }
        console.log(cardStack[1]);
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
