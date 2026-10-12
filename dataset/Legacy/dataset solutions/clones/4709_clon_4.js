function evaluateCardGame(gameInput) {
    const cardValues = gameInput.split(" ");
    const firstCardValue = parseFloat(cardValues[0]);
    const secondCardValue = parseFloat(cardValues[1]);

    const cardRankings = new Map([
        [2, 0], [3, 1], [4, 2], [5, 3], [6, 4],
        [7, 5], [8, 6], [9, 7], [10, 8], [11, 9],
        [12, 10], [13, 11], [1, 12]
    ]);

    const playerOneRank = cardRankings.get(firstCardValue);
    const playerTwoRank = cardRankings.get(secondCardValue);

    const rankComparisonResult = Math.sign(playerOneRank - playerTwoRank);

    const outcomeMessages = new Map([
        [-1, "Bob"],
        [0, "Draw"],
        [1, "Alice"]
    ]);

    console.log(outcomeMessages.get(rankComparisonResult));
}

evaluateCardGame(require("fs").readFileSync("/dev/stdin", "utf8"));
