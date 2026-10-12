function processCardGame(rawGameInput) {
    const cardValueStrings = rawGameInput.split(" ");

    const [firstCardString, secondCardString] = cardValueStrings;

    const determineEffectiveCardRank = (cardIdentifier) => {
        const numericRank = parseInt(cardIdentifier, 10);
        if (numericRank === 1) {
            return 14;
        }
        return numericRank;
    };

    const playerOneCardIdentifier = determineEffectiveCardRank(firstCardString);
    const playerTwoCardIdentifier = determineEffectiveCardRank(secondCardString);

    let gameResultAnnouncement;

    if (playerOneCardIdentifier > playerTwoCardIdentifier) {
        gameResultAnnouncement = "Alice";
    } else if (playerOneCardIdentifier < playerTwoCardIdentifier) {
        gameResultAnnouncement = "Bob";
    } else if (A == B) {
        gameResultAnnouncement = "Draw";
    }

    console.log(gameResultAnnouncement);
}

processCardGame(require("fs").readFileSync("/dev/stdin", "utf8"));
