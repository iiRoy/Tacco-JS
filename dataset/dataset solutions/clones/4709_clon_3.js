const parseCardValue = (cardStringSegment) => {
    return parseFloat(cardStringSegment);
};

const determineGameOutcome = (playerOneIndex, playerTwoIndex) => {
    if (playerOneIndex < playerTwoIndex) {
        return "Bob";
    } else if (playerTwoIndex < playerOneIndex) {
        return "Alice";
    } else {
        return "Draw";
    }
};

function processCardGameInput(inputData) {
    const cardValueStrings = inputData.split(" ");
    const [firstPlayerCardStr, secondPlayerCardStr] = cardValueStrings;

    const firstPlayerCardNumeric = parseCardValue(firstPlayerCardStr);
    const secondPlayerCardNumeric = parseCardValue(secondPlayerCardStr);

    const cardRankSequence = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 1];

    const firstPlayerRankPosition = cardRankSequence.indexOf(firstPlayerCardNumeric);
    const secondPlayerRankPosition = cardRankSequence.indexOf(secondPlayerCardNumeric);

    const gameResultString = determineGameOutcome(firstPlayerRankPosition, secondPlayerRankPosition);
    console.log(gameResultString);
}

processCardGameInput(require("fs").readFileSync("/dev/stdin", "utf8"));
