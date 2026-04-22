function processCardGame(rawData) {
    const numericRanks = rawData.split(" ").map(Number);

    const getAdjustedRank = (currentRankValue) => (currentRankValue === 1 ? 14 : currentRankValue);

    const matchOutcome = ((firstHandValue, secondHandValue) => {
        const transformedFirst = getAdjustedRank(firstHandValue);
        const transformedSecond = getAdjustedRank(secondHandValue);

        return transformedFirst > transformedSecond ? "Alice" :
               transformedFirst < transformedSecond ? "Bob" : "Draw";
    })(numericRanks[0], numericRanks[1]);

    console.log(matchOutcome);
}

processCardGame(require("fs").readFileSync("/dev/stdin", "utf8"));