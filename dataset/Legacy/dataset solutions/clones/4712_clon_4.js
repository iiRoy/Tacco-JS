const processGame = (inputString) => {
    const [firstCardValue, secondCardValue] = inputString.split(" ").map(Number);

    const normalizeCardRank = (rank) => (rank === 1 ? 14 : rank);

    const normalizedFirst = normalizeCardRank(firstCardValue);
    const normalizedSecond = normalizeCardRank(secondCardValue);

    const outcomeResolver = {
        "-1": "Bob",
        "0": "Draw",
        "1": "Alice"
    };

    const comparisonOutcome = Math.sign(normalizedFirst - normalizedSecond);

    console.log(outcomeResolver[comparisonOutcome]);
};

processGame(require("fs").readFileSync("/dev/stdin", "utf8"));
